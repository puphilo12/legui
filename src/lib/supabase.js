import { createClient } from '@supabase/supabase-js'

// =====================================================================
// Cliente de Supabase.
// Si faltan las variables de entorno, la app entra en MODO MOCK:
//   - `supabase` queda en null
//   - el store usa datos de ejemplo (src/data/mockData.js) + localStorage
// Esto permite desarrollar todo el front sin backend y "enchufar"
// Supabase después simplemente completando el .env.
// =====================================================================

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const STORE_ID = import.meta.env.VITE_STORE_ID || 'legui'

export const MOCK = !url || !anonKey

export const supabase = MOCK
  ? null
  : createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

if (MOCK && typeof window !== 'undefined') {
  // Aviso útil en consola durante el desarrollo.
  console.info(
    '%cLEGUI · MODO MOCK',
    'background:#1B3FE0;color:#fff;padding:2px 8px;border-radius:4px;font-weight:700',
    '— datos de ejemplo en el navegador. Completá .env con Supabase para usar la base real.'
  )
}
