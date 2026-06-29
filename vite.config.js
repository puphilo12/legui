import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// LEGUI — config de Vite. Build a /dist listo para subir a cualquier hosting estático.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
