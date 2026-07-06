import { MOCK, supabase } from '../lib/supabase'

// =====================================================================
// Transformación de imágenes al vuelo (Supabase Storage).
// Las fotos se guardan en un solo tamaño grande (hasta 1920px). Para una
// tarjeta de ~380px eso es un desperdicio enorme de bytes → carga lenta.
// Reescribimos la URL pública al endpoint de render/transform de Supabase
// para pedir el ancho justo + WebP + calidad. Ej:
//   .../storage/v1/object/public/legui-media/x.webp
//   → .../storage/v1/render/image/public/legui-media/x.webp?width=440&quality=70
//
// La transformación es un add-on de Supabase (planes pagos). Si no está
// habilitada, el <Img> detecta el primer error y desactiva las transforma-
// ciones para toda la sesión, cayendo a la URL original — nunca rompe la web.
// Se puede forzar apagado con VITE_IMG_TRANSFORM=0.
// =====================================================================
const OBJECT_SEG = '/storage/v1/object/public/'
const RENDER_SEG = '/storage/v1/render/image/public/'

let transformsOn = import.meta.env.VITE_IMG_TRANSFORM !== '0'

// Un error de transformación (plan sin el add-on) apaga la función para toda
// la sesión, así el resto de las imágenes no duplican pedidos fallidos.
export const disableImgTransforms = () => { transformsOn = false }

// ¿Esta URL es transformable? (imagen pública de Supabase Storage y feature activa)
export const canTransform = (url) =>
  transformsOn && typeof url === 'string' && url.includes(OBJECT_SEG)

// Devuelve la URL transformada al ancho pedido, o la original si no aplica.
// resize=contain: sin esto, Supabase devuelve el alto ORIGINAL sin escalar
// (ej. pedís width=440 de una foto 1440x1920 y te da 440x1920, estirada) —
// eso rompía el encuadre de las tarjetas (object-fit:cover recortaba sobre
// una imagen ya deformada, mostrando solo un pedazo del producto).
export function imgUrl(url, { width, quality = 70 } = {}) {
  if (!width || !canTransform(url)) return url
  const base = url.replace(OBJECT_SEG, RENDER_SEG)
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}width=${Math.round(width)}&quality=${quality}&resize=contain`
}

// Comprime una imagen en el canvas y devuelve dataURL (modo mock) o la sube
// al bucket legui-media de Supabase y devuelve la URL pública.
// quality: 0.70 para productos (balance tamaño/calidad), 1.0 para portadas (máxima calidad)
export async function uploadMedia(file, folder = 'general', quality = 0.70) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('El archivo no es una imagen')
  if (MOCK) return fileToDataURL(file)

  const blob = await compressToBlob(file, { quality })
  const ext = 'webp'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('legui-media').upload(path, blob, {
    upsert: true, cacheControl: '31536000', contentType: 'image/webp',
  })
  if (error) throw new Error('Error al subir imagen: ' + error.message)
  const { data } = supabase.storage.from('legui-media').getPublicUrl(path)
  return data.publicUrl
}

// Comprime en canvas y devuelve Blob WebP (para subir a Storage)
async function compressToBlob(file, { maxSize = 1920, quality = 0.70 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    const t = setTimeout(() => { URL.revokeObjectURL(url); reject(new Error('Timeout')) }, 15000)
    img.onload = () => {
      clearTimeout(t)
      let { width, height } = img
      if (width > height) {
        if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize }
      } else if (height > maxSize) {
        width = Math.round(width * maxSize / height); height = maxSize
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      canvas.toBlob((b) => b ? resolve(b) : reject(new Error('toBlob falló')), 'image/webp', quality)
    }
    img.onerror = () => { clearTimeout(t); URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')) }
    img.src = url
  })
}

// Modo mock: comprime y devuelve dataURL (guardable en localStorage)
export async function fileToDataURL(file, { maxSize = 1280, quality = 0.82, type = 'image/webp' } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) { reject(new Error('El archivo no es una imagen')); return }
    const url = URL.createObjectURL(file)
    const img = new Image()
    const timeout = setTimeout(() => { URL.revokeObjectURL(url); reject(new Error('Timeout')) }, 15000)
    img.onload = () => {
      clearTimeout(timeout)
      let { width, height } = img
      if (width > height) {
        if (width > maxSize) { height = Math.round(height * maxSize / width); width = maxSize }
      } else if (height > maxSize) {
        width = Math.round(width * maxSize / height); height = maxSize
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      try { resolve(canvas.toDataURL(type, quality)) } catch (e) { reject(e) }
    }
    img.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')) }
    img.src = url
  })
}
