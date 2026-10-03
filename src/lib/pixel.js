// Helper para disparar eventos de Meta Pixel (fbq) desde el cliente.
// El event_id se comparte con el evento equivalente enviado por Conversions API
// (server-side, ver api/_lib/metaCapi.js) para que Meta deduplique ambos envíos.
export const fbq = (...args) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args)
  }
}

export const eventId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const trackViewContent = (product) => {
  if (!product) return
  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    content_category: product.category,
    value: Number(product.discount_price ?? product.price ?? 0),
    currency: 'ARS',
  })
}

export const trackAddToCart = (product, price, qty = 1) => {
  fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    value: Number(price || 0) * qty,
    currency: 'ARS',
  })
}

export const trackInitiateCheckout = (cart) => {
  const value = cart.reduce((n, i) => n + i.price * i.qty, 0)
  fbq('track', 'InitiateCheckout', {
    content_ids: cart.map((i) => i.id),
    content_type: 'product',
    num_items: cart.reduce((n, i) => n + i.qty, 0),
    value,
    currency: 'ARS',
  })
}

// eventIdOverride: para el Purchase de Mercado Pago, usamos siempre `purchase_<orderId>`
// (mismo id que se manda por CAPI desde el webhook) para que Meta dedupe.
export const trackPurchase = (order, eventIdOverride) => {
  fbq('track', 'Purchase', {
    content_ids: (order.items || []).map((i) => i.id),
    content_type: 'product',
    num_items: (order.items || []).reduce((n, i) => n + i.qty, 0),
    value: Number(order.total || 0),
    currency: 'ARS',
  }, eventIdOverride ? { eventID: eventIdOverride } : undefined)
}
