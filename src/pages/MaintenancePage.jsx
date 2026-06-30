import { useStore } from '../store/useStore'
import { useSEO } from '../hooks/useSEO'
import { socialUrl } from '../utils/format'
import Logo from '../components/Logo'

// Pantalla que reemplaza TODO el sitio (sin header/footer) cuando
// settings.maintenance_mode está activo. /admin sigue funcionando siempre,
// así el admin puede entrar a desactivarlo.
export default function MaintenancePage() {
  const settings = useStore((s) => s.settings)

  useSEO({ title: 'En mantenimiento', noindex: true })

  const wa = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : null
  const ig = socialUrl(settings.instagram, 'https://instagram.com/')

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        textAlign: 'center',
        padding: 24,
        background: 'var(--bg)',
      }}
    >
      <Logo height={38} />
      <div>
        <h1 className="anton" style={{ fontSize: 'clamp(28px,5vw,46px)', marginBottom: 12 }}>
          Volvemos enseguida
        </h1>
        <p className="muted" style={{ maxWidth: 380, fontSize: 15, lineHeight: 1.6, margin: '0 auto' }}>
          La tienda se encuentra momentáneamente desactivada. Estamos trabajando para volver pronto.
        </p>
      </div>
      {(wa || ig) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {wa && (
            <a href={wa} target="_blank" rel="noreferrer" className="btn btn-blue">
              Escribinos por WhatsApp
            </a>
          )}
          {ig && (
            <a href={ig} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Seguinos en Instagram
            </a>
          )}
        </div>
      )}
    </div>
  )
}
