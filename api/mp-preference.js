export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { items, customer, external_reference } = req.body || {}
  if (!items?.length || !external_reference) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }

  const mpItems = items.map((i) => ({
    id: String(i.id || i.slug || 'item'),
    title: String(i.name || 'Producto').slice(0, 255),
    quantity: Number(i.qty) || 1,
    unit_price: Number(i.price) || 0,
    currency_id: 'ARS',
    category_id: 'fashion',
    ...(i.image ? { picture_url: i.image } : {}),
  }))

  const body = {
    items: mpItems,
    payer: {
      name: String(customer?.nombre || ''),
      phone: { area_code: '', number: String(customer?.telefono || '').replace(/\D/g, '') },
      ...(customer?.email ? { email: customer.email } : {}),
    },
    back_urls: {
      success: `${process.env.APP_URL}/mi-cuenta?pago=ok`,
      failure: `${process.env.APP_URL}/checkout?pago=error`,
      pending: `${process.env.APP_URL}/mi-cuenta?pago=pendiente`,
    },
    auto_return: 'approved',
    external_reference: String(external_reference),
    notification_url: `${process.env.APP_URL}/api/mp-webhook`,
    statement_descriptor: 'LEGUI',
    expires: false,
  }

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await r.json()

    if (!r.ok) {
      console.error('[mp-preference] MP error:', data)
      return res.status(500).json({ error: data.message || 'Error de Mercado Pago' })
    }

    return res.json({
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
      preference_id: data.id,
    })
  } catch (err) {
    console.error('[mp-preference]', err)
    return res.status(500).json({ error: 'Error interno' })
  }
}
