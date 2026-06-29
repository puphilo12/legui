import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Al cambiar de ruta sube al tope. Si hay hash (#lookbook) scrollea a esa
// sección una vez que el contenido montó.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '')
      const tryScroll = (attempt = 0) => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (attempt < 8) {
          setTimeout(() => tryScroll(attempt + 1), 80)
        }
      }
      tryScroll()
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname, hash])

  return null
}
