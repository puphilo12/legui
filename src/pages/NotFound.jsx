import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'

export default function NotFound() {
  useSEO({ title: 'Página no encontrada', noindex: true })

  return (
    <div
      className="wrap"
      style={{
        minHeight: '64vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 18,
      }}
    >
      <div className="anton" style={{ fontSize: 'clamp(80px,18vw,200px)', lineHeight: 0.9, color: 'var(--blue)' }}>
        404
      </div>
      <div className="anton" style={{ fontSize: 28 }}>Página perdida en la calle</div>
      <p className="muted" style={{ maxWidth: 320 }}>
        El link que seguiste no existe o cambió. Volvé al inicio y seguí el drop.
      </p>
      <Link to="/" className="btn btn-blue">Volver al inicio</Link>
    </div>
  )
}
