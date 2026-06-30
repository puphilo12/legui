import { useEffect } from 'react'

export const SITE_URL = 'https://leguii.ar'
const DEFAULT_IMAGE = `${SITE_URL}/og.jpg`

const setMeta = (attr, key, content) => {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const setCanonical = (href) => {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Hook imperativo para SEO por ruta: título, meta description, Open Graph,
// Twitter card, canonical y JSON-LD. No usa react-helmet para no sumar una
// dependencia — la app es chica y solo necesita reemplazar tags existentes.
export function useSEO({ title, description, image, path = '/', noindex = false, jsonLd = null }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · LEGUI` : 'LEGUI · Streetwear & Zapatillas'
    const desc = description || 'LEGUI — Streetwear sin reglas. Drops semanales, ediciones limitadas y zapatillas que mueven la ciudad.'
    const img = image || DEFAULT_IMAGE
    const url = `${SITE_URL}${path}`

    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)
    setCanonical(url)

    let script = document.getElementById('ld-json')
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = 'ld-json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, path, noindex, jsonLd && JSON.stringify(jsonLd)])
}
