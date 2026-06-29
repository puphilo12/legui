import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useStore } from '../store/useStore'

const STATS = [
  ['240+', 'Modelos'],
  ['48h', 'Envío'],
  ['∞', 'Actitud'],
]

export default function Hero() {
  const settings = useStore((s) => s.settings)
  const cardRef = useRef(null)

  const onMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`
  }
  const onLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'rotateY(0) rotateX(0)'
  }

  const lines = (settings.slogan_title || 'Ropa y\nzapatillas\npara la calle').split('\n')

  return (
    <section id="top" onMouseMove={onMove} onMouseLeave={onLeave} style={{ position: 'relative' }}>
      <div className="wrap">
      <div
        className="hero-grid"
        style={{ padding: '64px 0 80px', minHeight: '76vh', alignItems: 'center' }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            className="eyebrow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 22 }}
          >
            <span style={{ width: 8, height: 8, background: 'var(--blue)', display: 'inline-block' }} />
            {settings.hero_badge || 'Temporada 26 · En vivo'}
          </div>

          <h1
            className="anton"
            style={{
              fontSize: 'clamp(46px,7vw,104px)',
              lineHeight: 0.92,
              margin: 0,
            }}
          >
            {lines.map((line, i) => {
              const last = i === lines.length - 1
              if (!last) return <span key={i}>{line}<br /></span>
              const words = line.split(' ')
              const tail = words.pop()
              return (
                <span key={i}>
                  {words.join(' ')} <span style={{ color: 'var(--blue)' }}>{tail}</span>
                </span>
              )
            })}
          </h1>

          <p style={{ maxWidth: 420, margin: '26px 0 32px', fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>
            {settings.slogan_subtitle}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/tienda" className="btn btn-blue">Comprar ahora</Link>
            <Link to="/#lookbook" className="btn btn-ghost">Ver lookbook</Link>
          </div>

          <div style={{ display: 'flex', gap: 34, marginTop: 46 }}>
            {STATS.map(([n, l]) => (
              <div key={l}>
                <div className="anton" style={{ fontSize: 30, lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--faint)', marginTop: 4 }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', perspective: 1100, zIndex: 1 }}>
          <div
            style={{
              position: 'absolute',
              top: -30,
              right: -10,
              width: 140,
              height: 140,
              background: 'var(--blue)',
              borderRadius: '50%',
              filter: 'blur(2px)',
              opacity: 0.9,
              animation: 'floaty 6s ease-in-out infinite',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -26,
              left: -26,
              width: 90,
              height: 90,
              border: '2px solid var(--blue)',
              animation: 'spinSlow 14s linear infinite',
              zIndex: 0,
            }}
          />
          <div
            ref={cardRef}
            style={{
              position: 'relative',
              transition: 'transform .25s ease-out',
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              zIndex: 1,
            }}
          >
            <img
              src={settings.hero_image}
              alt="LEGUI streetwear"
              style={{ width: '100%', height: 520, objectFit: 'cover', borderRadius: 18, background: 'var(--bg-3)' }}
            />
            <Link
              to="/tienda"
              className="pill"
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                background: 'var(--bg)',
                border: '1px solid var(--line-2)',
                padding: '10px 16px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                transform: 'translateZ(50px)',
              }}
            >
              Nuevo drop <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
