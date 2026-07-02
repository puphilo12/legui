import { sendEmail, wrapEmail, fmtMoney, btn } from './_lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { productId, productName, price, slug } = req.body || {}
  if (!productId) return res.status(400).json({ error: 'Falta productId' })

  const sbHeaders = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    const listRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/product_waitlist?product_id=eq.${encodeURIComponent(productId)}&notified=eq.false&select=id,email`,
      { headers: sbHeaders }
    )
    const rows = await listRes.json()
    if (!Array.isArray(rows) || !rows.length) return res.status(200).json({ ok: true, sent: 0 })

    const url = process.env.APP_URL && slug ? `${process.env.APP_URL}/producto/${slug}` : process.env.APP_URL
    const html = wrapEmail({
      title: '¡Ya llegó! 🔥',
      preheader: `${productName} ya está disponible`,
      body: `
        <p style="font-size:14px;color:#c9c9cc;line-height:1.6;">
          <b style="color:#f4f4f5;">${productName}</b> volvió a tener stock.
        </p>
        ${price ? `<p style="font-size:20px;font-weight:900;margin:10px 0;">${fmtMoney(price)}</p>` : ''}
        <p style="font-size:13px;color:#6b6b70;">Se agota rápido — no te quedes afuera.</p>
        ${url ? btn(url, 'Comprar ahora →') : ''}
      `,
    })

    const results = await Promise.allSettled(rows.map((r) => sendEmail({ to: r.email, subject: `Ya llegó: ${productName}`, html })))
    const sentIds = rows.filter((_, i) => results[i].status === 'fulfilled' && results[i].value?.ok).map((r) => r.id)

    if (sentIds.length) {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/product_waitlist?id=in.(${sentIds.join(',')})`, {
        method: 'PATCH',
        headers: { ...sbHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({ notified: true }),
      })
    }

    return res.status(200).json({ ok: true, sent: sentIds.length })
  } catch (err) {
    console.error('[notify-waitlist]', err)
    return res.status(200).json({ ok: false })
  }
}
