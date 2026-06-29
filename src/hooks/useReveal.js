import { useEffect } from 'react'

// =====================================================================
// Revela los elementos con [data-reveal] cuando entran en viewport,
// agregándoles la clase .is-visible (igual que el CALLE 22 original).
// Pasale como dependencias lo que cambie el contenido (ej. la ruta o
// la lista de productos) para que re-observe los nodos nuevos.
// =====================================================================
export function useReveal(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]')).filter(
      (el) => !el.classList.contains('is-visible')
    )
    if (!els.length) return

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-visible')
            io.unobserve(en.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    els.forEach((el) => io.observe(el))
    // por si algún nodo ya estaba en pantalla al montar
    const t = setTimeout(() => {
      els.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight * 0.92) el.classList.add('is-visible')
      })
    }, 120)

    return () => {
      io.disconnect()
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
