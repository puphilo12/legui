// Devuelve al stock las unidades de un pedido que no se va a pagar
// (rechazado por MP o vencida la reserva de 48hs). Se usa desde el webhook
// de MP y desde el cron que cancela pedidos vencidos.
export async function restoreStock(items) {
  const headers = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  for (const item of items || []) {
    try {
      const r = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/products?id=eq.${item.id}&select=stock,stock_matrix`,
        { headers }
      )
      const rows = await r.json()
      const p = Array.isArray(rows) ? rows[0] : null
      if (!p) continue

      const qty = Number(item.qty) || 0
      const newStock = (p.stock ?? 0) + qty
      const patch = { stock: newStock, sold_out: newStock <= 0 }

      if (p.stock_matrix && item.size) {
        const key = item.color || ''
        const bucket = p.stock_matrix[key]
        if (bucket && item.size in bucket) {
          patch.stock_matrix = {
            ...p.stock_matrix,
            [key]: { ...bucket, [item.size]: (bucket[item.size] ?? 0) + qty },
          }
        }
      }

      await fetch(`${process.env.SUPABASE_URL}/rest/v1/products?id=eq.${item.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patch),
      })
    } catch (err) {
      console.error('[restoreStock]', item.id, err)
    }
  }
}
