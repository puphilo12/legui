import { createHash } from 'crypto'

const PIXEL_ID = process.env.META_PIXEL_ID || '1088496393857095'

const sha256 = (v) => createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex')

// Envía un evento server-side a Meta Conversions API. No lanza si falla
// (nunca debe romper el flujo de negocio que lo dispara, ej. el webhook de MP).
export async function sendCapiEvent(eventName, { eventId, order, sourceUrl }) {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) { console.warn('[metaCapi] META_ACCESS_TOKEN no configurado, se omite evento', eventName); return }

  const email = order?.customer?.email
  const phone = order?.customer?.telefono

  const user_data = {
    ...(email ? { em: [sha256(email)] } : {}),
    ...(phone ? { ph: [sha256(phone.replace(/\D/g, ''))] } : {}),
  }

  const body = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: sourceUrl || process.env.APP_URL,
      user_data,
      custom_data: {
        currency: 'ARS',
        value: Number(order.total || 0),
        content_ids: (order.items || []).map((i) => i.id),
        content_type: 'product',
        num_items: (order.items || []).reduce((n, i) => n + i.qty, 0),
      },
    }],
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) console.error('[metaCapi] error', await res.text())
  } catch (err) {
    console.error('[metaCapi]', err)
  }
}
