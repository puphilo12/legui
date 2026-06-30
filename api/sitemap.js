const SITE = 'https://leguii.ar'
const STORE_ID = 'legui'

// Mismo algoritmo que src/utils/format.js (slugify) — debe coincidir
// con las rutas reales /producto/:slug.
const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export default async function handler(req, res) {
  const staticUrls = ['', '/tienda']
  let productUrls = []

  try {
    const r = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/products?select=name,sold_out&store_id=eq.${STORE_ID}`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    )
    const data = await r.json()
    productUrls = (Array.isArray(data) ? data : []).map((p) => `/producto/${slugify(p.name)}`)
  } catch (err) {
    console.error('[sitemap]', err)
  }

  const urls = [...staticUrls, ...productUrls]
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n') +
    '\n</urlset>\n'

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).send(xml)
}
