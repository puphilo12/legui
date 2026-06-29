// Formato de moneda — Argentina (ARS). Cambiá locale/currency si hace falta.
const fmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function money(value) {
  const n = Number(value) || 0
  return fmt.format(n)
}

// Precio para tarjetas.
export function priceLabel(value) {
  return money(value)
}

// Slug simple para ids/anclas. ̀-ͯ = diacríticos combinantes.
export function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// id corto único (para mock).
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
