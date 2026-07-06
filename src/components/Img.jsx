import { useState } from 'react'
import { imgUrl, canTransform, disableImgTransforms } from '../utils/image'

// Imagen optimizada. Sobre fotos de Supabase Storage pide el ancho justo
// (WebP + calidad) vía srcset 1x/2x; sobre cualquier otra URL (picsum, data:,
// externas) usa el src tal cual. Suma lazy-load, decode async y un fade-in
// suave. Si la transformación falla (plan sin el add-on) cae a la URL original
// y desactiva las transformaciones para el resto de la sesión.
//
// Props extra sobre <img>:
//   w         ancho de render en px (para elegir el tamaño transformado)
//   quality   calidad 1-100 (default 70)
//   priority  LCP: eager + fetchpriority alta + sin fade (paint inmediato)
//   eager     carga eager sin marcar prioridad
export default function Img({
  src, alt = '', w, quality = 70, priority = false, eager = false,
  className = '', onLoad, onError, ...rest
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const transform = !!w && !failed && canTransform(src)
  const finalSrc = transform ? imgUrl(src, { width: w, quality }) : src
  const srcSet = transform
    ? `${imgUrl(src, { width: w, quality })} 1x, ${imgUrl(src, { width: w * 2, quality })} 2x`
    : undefined

  const fade = !priority
  const handleError = (e) => {
    if (transform) { disableImgTransforms(); setFailed(true); return }
    onError?.(e)
  }
  const handleLoad = (e) => { setLoaded(true); onLoad?.(e) }

  // Si la imagen ya estaba en caché puede completarse antes de montar el
  // handler: leemos el estado del nodo para no dejarla invisible.
  const refCb = (node) => { if (node?.complete && node.naturalWidth) setLoaded(true) }

  return (
    <img
      ref={refCb}
      src={finalSrc}
      srcSet={srcSet}
      alt={alt}
      loading={priority || eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
      onLoad={handleLoad}
      onError={handleError}
      className={`${fade ? 'img-fade' : ''}${fade && loaded ? ' is-loaded' : ''}${className ? ' ' + className : ''}`}
      {...rest}
    />
  )
}
