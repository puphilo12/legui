import { restoreStock } from './_lib/restoreStock.js'

const STATUS_MAP = {
  approved: 'Pagado',
  pending: 'Pendiente',
  in_process: 'Pendiente',
  authorized: 'Pagado',
  rejected: 'Cancelado',
  cancelled: 'Cancelado',
  refunded: 'Cancelado',
  charged_back: 'Cancelado',
}

export default async function handler(req, res) {
  // MP always expects 200 — never return an error status
  if (req.method !== 'POST') return res.status(200).end()

  const { type, data } = req.body || {}

  if (type !== 'payment' || !data?.id) return res.status(200).json({ ok: true })

  const sbHeaders = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    // 1. Fetch payment details from MP
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })
    if (!paymentRes.ok) return res.status(200).json({ ok: true })

    const payment = await paymentRes.json()
    const orderId = payment.external_reference
    const newStatus = STATUS_MAP[payment.status] || 'Pendiente'

    if (!orderId) return res.status(200).json({ ok: true })

    // 2. Traer el pedido actual: necesitamos status previo (para no devolver
    // stock dos veces si MP reenvía el mismo webhook) e items (para devolver
    // stock si se rechaza).
    const orderRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}&select=status,items`,
      { headers: sbHeaders }
    )
    const orderRows = await orderRes.json()
    const order = Array.isArray(orderRows) ? orderRows[0] : null
    if (!order) return res.status(200).json({ ok: true })

    // 3. Update order status in Supabase (bypass RLS with service role)
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: { ...sbHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({
        status: newStatus,
        payment_id: String(data.id),
        reserved_until: null, // ya tenemos una respuesta definitiva, no hace falta seguir reservando
      }),
    })

    // 4. Si el pago se rechazó (y no era ya Cancelado), liberar el stock al toque
    // — no hace falta esperar las 48hs si ya sabemos que no se va a pagar.
    if (newStatus === 'Cancelado' && order.status !== 'Cancelado') {
      await restoreStock(order.items)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[mp-webhook]', err)
    return res.status(200).json({ ok: true })
  }
}
