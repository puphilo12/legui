// Envío de emails transaccionales vía Resend (https://resend.com).
// RESEND_API_KEY es server-only (Vercel env vars), nunca se expone al cliente.

const BLUE = '#1b3fe0'
const BG = '#0a0a0b'
const TEXT = '#f4f4f5'

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[email] Falta RESEND_API_KEY en las variables de entorno')
    return { ok: false }
  }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'LEGUI <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    })
    if (!r.ok) {
      console.error('[email] Resend error:', r.status, await r.text())
      return { ok: false }
    }
    return { ok: true }
  } catch (err) {
    console.error('[email] send failed:', err)
    return { ok: false }
  }
}

export const fmtMoney = (n) => `$ ${Math.round(Number(n) || 0).toLocaleString('es-AR')}`

// Envoltorio HTML común a todos los mails — misma identidad visual que la tienda.
export function wrapEmail({ title, preheader = '', body }) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};font-family:Arial,Helvetica,sans-serif;color:${TEXT};">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#101012;border:1px solid #1f1f22;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:28px 28px 4px;text-align:center;">
          <div style="font-family:Arial,sans-serif;font-weight:900;font-size:22px;letter-spacing:.04em;color:${TEXT};">LEGUI</div>
        </td></tr>
        <tr><td style="padding:8px 28px 28px;">
          ${title ? `<h1 style="font-size:20px;margin:12px 0 16px;color:${TEXT};">${title}</h1>` : ''}
          ${body}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #1f1f22;text-align:center;">
          <span style="font-size:11px;color:#6b6b70;">LEGUI · Streetwear & Zapatillas</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function itemsTable(items) {
  const rows = (items || []).map((i) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:${TEXT};">
        ${i.qty}× ${i.name}${i.size ? ` · T${i.size}` : ''}${i.color ? ` · ${i.color}` : ''}
      </td>
      <td style="padding:8px 0;font-size:13px;color:${TEXT};text-align:right;white-space:nowrap;">${fmtMoney(i.price * i.qty)}</td>
    </tr>`).join('')
  return `<table role="presentation" width="100%" style="border-top:1px solid #1f1f22;margin-top:14px;">${rows}</table>`
}

export function btn(url, label) {
  return `<a href="${url}" style="display:inline-block;margin-top:18px;padding:12px 22px;background:${BLUE};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">${label}</a>`
}
