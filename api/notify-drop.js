import { sendEmail, wrapEmail, btn } from './_lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { title, subtitle, discount } = req.body || {}
  if (!title) return res.status(400).json({ error: 'Falta title' })

  const sbHeaders = {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  try {
    const listRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/user_profiles?select=email&email=not.is.null`,
      { headers: sbHeaders }
    )
    const rows = await listRes.json()
    const emails = [...new Set((Array.isArray(rows) ? rows : []).map((r) => r.email).filter(Boolean))]
    if (!emails.length) return res.status(200).json({ ok: true, sent: 0 })

    const url = process.env.APP_URL ? `${process.env.APP_URL}/#drop` : null
    const html = wrapEmail({
      title: `Nuevo drop: ${title} 🔥`,
      preheader: subtitle || 'Ediciones limitadas — se van rápido',
      body: `
        ${subtitle ? `<p style="font-size:14px;color:#c9c9cc;line-height:1.6;">${subtitle}</p>` : ''}
        ${discount ? `<p style="font-size:20px;font-weight:900;margin:10px 0;color:#7e95ff;">${discount}% OFF</p>` : ''}
        <p style="font-size:13px;color:#6b6b70;">Stock limitado — cuando se va, se va.</p>
        ${url ? btn(url, 'Ver el drop →') : ''}
      `,
    })

    const results = await Promise.allSettled(emails.map((email) => sendEmail({ to: email, subject: `🔥 Nuevo drop: ${title}`, html })))
    const sent = results.filter((r) => r.status === 'fulfilled' && r.value?.ok).length

    return res.status(200).json({ ok: true, sent, total: emails.length })
  } catch (err) {
    console.error('[notify-drop]', err)
    return res.status(200).json({ ok: false })
  }
}
