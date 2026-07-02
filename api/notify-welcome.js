import { sendEmail, wrapEmail, btn } from './_lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Falta email' })

  const html = wrapEmail({
    title: '¡Bienvenido/a a LEGUI! 👋',
    preheader: 'Tu cuenta ya está lista',
    body: `
      <p style="font-size:14px;color:#c9c9cc;line-height:1.6;">
        Ya podés ver tus pedidos, guardar favoritos y comprar más rápido la próxima vez.
      </p>
      <p style="font-size:14px;color:#c9c9cc;line-height:1.6;">
        Nuevos drops todas las semanas — te vamos a avisar cuando salgan.
      </p>
      ${process.env.APP_URL ? btn(`${process.env.APP_URL}/tienda`, 'Ir a la tienda →') : ''}
    `,
  })

  const result = await sendEmail({ to: email, subject: 'Bienvenido/a a LEGUI 🖤', html })
  return res.status(200).json(result)
}
