import { restoreStock } from './_lib/restoreStock.js'

// Corre por Vercel Cron (ver vercel.json). Cancela pedidos web (cualquier medio
// de pago) que quedaron "Pendiente" sin resolución más allá de su reserva
// (reserved_until — 48hs Mercado Pago, 72hs el resto) y devuelve el stock.
export default async function handler(req, res) {
  // Si está configurado CRON_SECRET, solo Vercel Cron puede llamar esto.
  if (process.env.CRON_SECRET) {
    const auth = req.headers.authorization
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'No autorizado' })
    }
  }

  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    const nowIso = new Date().toISOString()
    const r = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?status=eq.Pendiente&reserved_until=not.is.null&reserved_until=lt.${nowIso}&select=id,items`,
      { headers }
    )
    const expired = await r.json()
    if (!Array.isArray(expired) || !expired.length) {
      return res.status(200).json({ ok: true, cancelled: 0 })
    }

    for (const order of expired) {
      await restoreStock(order.items)
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${order.id}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'Cancelado', reserved_until: null }),
      })
    }

    return res.status(200).json({ ok: true, cancelled: expired.length })
  } catch (err) {
    console.error('[cancel-expired-orders]', err)
    return res.status(500).json({ error: 'Error interno' })
  }
}
