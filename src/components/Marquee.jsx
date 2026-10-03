import { Fragment } from 'react'
import Sparkle from './Sparkle'
import { money } from '../utils/format'

// Convierte lo que escribe el dueño (un mensaje por renglón; también acepta el
// formato viejo separado con ✸) en una lista de mensajes.
export const marqueeItems = (text) =>
  (text || '').split(/\n|✸/).map((s) => s.trim()).filter(Boolean)

// Cinta de la portada: los mensajes del dueño + los que salen solos de la
// configuración (envío gratis y descuento mayorista), así nunca quedan desactualizados.
export function storeMarqueeItems(settings) {
  const own = marqueeItems(settings?.marquee)
  const items = own.length ? own : ['LEGUI IMPORTADOS', 'PERFUMES Y ROPA IMPORTADA']
  if (settings?.free_shipping_threshold) items.push(`ENVÍO GRATIS DESDE ${money(settings.free_shipping_threshold)}`)
  if (settings?.bulk_enabled && settings.bulk_percent && settings.bulk_min_units) {
    const cat = settings.bulk_category ? settings.bulk_category.toUpperCase() : 'PRODUCTOS'
    items.push(`MAYORISTA: ${settings.bulk_percent}% OFF DESDE ${settings.bulk_min_units} ${cat}`)
  }
  return items
}

// Cinta animada. Los mensajes se repiten y se duplican para que el loop con
// translateX(-50%) sea continuo; las estrellitas del logo hacen de separador.
// variant: 'azul' | 'negro' | 'plateado'
export default function Marquee({ items, reversed = false, variant = 'azul', size = 26, border = true }) {
  const list = items?.length ? items : ['LEGUI IMPORTADOS']
  // Varias vueltas por mitad para que en pantallas anchas no quede un hueco antes
  // de que el loop vuelva a empezar; la duración escala igual para mantener la velocidad.
  const REPEATS = 6
  const laps = REPEATS * 2
  const duration = (reversed ? 22 : 14) * REPEATS * Math.max(1, list.join('').length / 40)
  return (
    <div className={`marquee marquee-${variant}${border ? ' marquee-border' : ''}`}>
      <div className={`marquee-track${reversed ? ' rev' : ''}`} aria-hidden="true" style={{ animationDuration: `${duration}s` }}>
        {Array.from({ length: laps }, (_, lap) =>
          list.map((t, i) => (
            <Fragment key={`${lap}-${i}`}>
              <span className="anton marquee-text" style={{ fontSize: size }}>{t}</span>
              <Sparkle size={Math.round(size * 0.62)} className="marquee-sep" style={{ margin: `0 ${Math.round(size * 0.6)}px` }} />
            </Fragment>
          ))
        )}
      </div>
    </div>
  )
}
