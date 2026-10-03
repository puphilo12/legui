import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import Img from '../components/Img'
import { SparkleField } from '../components/Sparkle'

const SPARKLES = [
  { top: '7%', left: '47%', size: 14, delay: 0 },
  { top: '16%', left: '95%', size: 22, delay: 1.3 },
  { top: '3%', left: '72%', size: 10, delay: 2.2 },
  { top: '58%', left: '50%', size: 12, delay: 0.7, desk: true },
  { top: '86%', left: '93%', size: 16, delay: 2.8 },
  { top: '91%', left: '46%', size: 9, delay: 1.8 },
  { top: '34%', left: '2%', size: 10, delay: 3.2, desk: true },
  { top: '74%', left: '31%', size: 8, delay: 0.4, desk: true },
]

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
      <SparkleField items={SPARKLES} />
      <div className="wrap">
      <div
        className="hero-grid"
        style={{ padding: '64px 0 80px', minHeight: '76vh', alignItems: 'center' }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
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
                  {words.join(' ')} <span className="chrome spark-title">{tail}</span>
                </span>
              )
            })}
          </h1>

          <p style={{ maxWidth: 420, margin: '26px 0 32px', fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>
            {settings.slogan_subtitle}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/tienda" className="btn btn-blue btn-shine">Comprar ahora</Link>
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
          <img src="/logo-joya.png" alt="" aria-hidden="true" className="hero-emblem" />
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
            <Img
              src={settings.hero_image}
              alt="Perfumes importados en Legui Importados"
              w={760}
              quality={82}
              priority
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
