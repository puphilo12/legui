import { MOCK, supabase } from '../lib/supabase'

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
