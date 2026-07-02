import { sendEmail, wrapEmail, itemsTable, fmtMoney, btn } from './_lib/email.js'

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'massieri19@gmail.com'
const PAY_LABEL = {
  whatsapp: 'A coordinar por WhatsApp', transferencia: 'Transferencia', efectivo: 'Efectivo',
  mercadopago: 'Mercado Pago', debito: 'Tarjeta débito', credito: 'Tarjeta crédito', 'cuenta-corriente': 'Cuenta corriente',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { order } = req.body || {}
  if (!order?.id) return res.status(400).json({ error: 'Falta order' })

  const c = order.customer || {}
  const channelLabel = order.channel === 'mostrador' ? 'Venta de mostrador' : 'Pedido web'
  const html = wrapEmail({
    title: `Nueva venta · ${fmtMoney(order.total)}`,
    preheader: `${channelLabel} de ${c.nombre || 'un cliente'}`,
    body: `
      <p style="font-size:14px;color:#c9c9cc;margin:0 0 4px;">${channelLabel} · #${String(order.id).slice(-5)}</p>
      <p style="font-size:14px;color:#c9c9cc;margin:0 0 4px;">Cliente: <b style="color:#f4f4f5;">${c.nombre || 'Sin nombre'}</b>${c.telefono ? ` · ${c.telefono}` : ''}</p>
      ${c.email ? `<p style="font-size:14px;color:#c9c9cc;margin:0 0 4px;">Email: ${c.email}</p>` : ''}
      <p style="font-size:14px;color:#c9c9cc;margin:0 0 4px;">Pago: <b style="color:#f4f4f5;">${PAY_LABEL[order.payment_method] || order.payment_method}</b> · Estado: ${order.status}</p>
      ${itemsTable(order.items)}
      <div style="display:flex;justify-content:space-between;margin-top:14px;padding-top:12px;border-top:1px solid #1f1f22;">
        <span style="font-weight:700;">Total</span>
        <span style="font-weight:900;font-size:18px;">${fmtMoney(order.total)}</span>
      </div>
      ${process.env.APP_URL ? btn(`${process.env.APP_URL}/admin`, 'Ver en el panel →') : ''}
    `,
  })

  const result = await sendEmail({ to: OWNER_EMAIL, subject: `🛍️ Nueva venta — ${fmtMoney(order.total)}`, html })
  return res.status(200).json(result)
}
