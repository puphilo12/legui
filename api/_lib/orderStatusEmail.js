import { sendEmail, wrapEmail, itemsTable, fmtMoney } from './email.js'

const COPY = {
  Pagado: {
    subject: '💳 Recibimos tu pago — LEGUI',
    title: '¡Recibimos tu pago!',
    text: 'Ya confirmamos el pago de tu pedido. Lo estamos preparando para el envío.',
  },
  Enviado: {
    subject: '🚚 Tu pedido está en camino — LEGUI',
    title: '¡Tu pedido salió!',
    text: 'Tu pedido ya está en camino. Estos son los datos de lo que te enviamos:',
  },
  Entregado: {
    subject: '✅ Pedido entregado — LEGUI',
    title: '¡Pedido entregado!',
    text: 'Marcamos tu pedido como entregado. ¡Gracias por comprar en LEGUI!',
  },
  Cancelado: {
    subject: 'Tu pedido fue cancelado — LEGUI',
    title: 'Pedido cancelado',
    text: 'Tu pedido fue cancelado y liberamos el stock reservado. Si es un error, escribinos.',
  },
}

// Se usa tanto desde api/notify-order-status.js (disparado por el admin)
// como desde api/mp-webhook.js (confirmación automática de Mercado Pago).
export async function sendOrderStatusEmail(order, status) {
  const email = order?.customer?.email
  const copy = COPY[status]
  if (!email || !copy) return { ok: false, skipped: true }

  const html = wrapEmail({
    title: copy.title,
    preheader: copy.text,
    body: `
      <p style="font-size:14px;color:#c9c9cc;line-height:1.6;">${copy.text}</p>
      <p style="font-size:12px;color:#6b6b70;margin-top:14px;">Pedido #${String(order.id).slice(-5)}</p>
      ${itemsTable(order.items)}
      <div style="display:flex;justify-content:space-between;margin-top:14px;padding-top:12px;border-top:1px solid #1f1f22;">
        <span style="font-weight:700;">Total</span>
        <span style="font-weight:900;font-size:18px;">${fmtMoney(order.total)}</span>
      </div>
    `,
  })

  return sendEmail({ to: email, subject: copy.subject, html })
}
