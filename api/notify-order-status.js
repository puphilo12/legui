import { sendOrderStatusEmail } from './_lib/orderStatusEmail.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { order, status } = req.body || {}
  if (!order?.id || !status) return res.status(400).json({ error: 'Faltan datos' })

  const result = await sendOrderStatusEmail(order, status)
  return res.status(200).json(result)
}
