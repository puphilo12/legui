import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import Marquee from '../components/Marquee'

const pad = (x) => String(x).padStart(2, '0')

function nextFriday() {
  const now = new Date()
  const t = new Date(now)
  const day = now.getDay()
  const add = (5 - day + 7) % 7
  t.setDate(now.getDate() + add)
  t.setHours(20, 0, 0, 0)
  if (t <= now) t.setDate(t.getDate() + 7)
  return t
}

function calc(target) {
  let diff = Math.max(0, target.getTime() - Date.now())
  const d = Math.floor(diff / 86400000); diff -= d * 86400000
  const h = Math.floor(diff / 3600000); diff -= h * 3600000
  const m = Math.floor(diff / 60000); diff -= m * 60000
  const s = Math.floor(diff / 1000)
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) }
}

export default function DropSection() {
  const settings = useStore((s) => s.settings)
  const drops = useStore((s) => s.drops)
  const toast = useStore((s) => s.toast)
  const drop = drops.find((d) => d.active) || drops[0]

  const target = drop?.starts_at ? new Date(drop.starts_at) : nextFriday()
  const [cd, setCd] = useState(() => calc(target))
  const [email, setEmail] = useState('')

  useEffect(() => {
    const id = setInterval(() => setCd(calc(target)), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.getTime()])

  const title = drop?.title || 'Hasta -40%\nen el drop'
  const subtitle = drop?.subtitle || 'Drop semanal · Viernes 20:00'
  const desc = drop?.description || 'Suscribite y recibí el código antes que nadie. Sin spam, solo fuego.'

  const submit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setEmail('')
    toast('¡Listo! Te avisamos del próximo drop.', 'info')
  }

  const box = (val, label) => (
    <div style={{ textAlign: 'center' }}>
      <div
        className="anton"
        style={{
          fontSize: 'clamp(36px,6vw,76px)',
          lineHeight: 1,
          background: 'var(--bg)',
          borderRadius: 14,
          padding: '14px 6px',
          minWidth: 78,
        }}
      >
        {val}
      </div>
      <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 8 }}>
        {label}
      </div>
    </div>
  )

  return (
    <section id="drops" style={{ background: 'var(--blue)', color: '#fff', overflow: 'hidden' }}>
      <Marquee
        text={settings.drop_marquee || 'VIERNES 20:00 ✸ HASTA -40% ✸ '}
        reversed
        bg="var(--blue)"
        color="#fff"
        size={22}
        border={false}
      />
      <div style={{ borderTop: '1px solid rgba(255,255,255,.2)' }} />

      <div className="wrap" style={{ padding: '70px 28px' }}>
        <div className="drop-grid">
          <div data-reveal>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', opacity: 0.85, marginBottom: 16 }}>
              {subtitle}
            </div>
            <h2 className="anton" style={{ fontSize: 'clamp(40px,6vw,86px)', lineHeight: 0.92, margin: 0 }}>
              {title.split('\n').map((l, i) => (
                <span key={i}>{l}<br /></span>
              ))}
            </h2>
            <p style={{ maxWidth: 380, margin: '22px 0 28px', fontSize: 15, lineHeight: 1.6, opacity: 0.92 }}>
              {desc}
            </p>
            <form
              onSubmit={submit}
              style={{
                display: 'flex',
                maxWidth: 420,
                background: 'var(--bg)',
                borderRadius: 999,
                padding: 6,
                alignItems: 'center',
              }}
            >
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '12px 18px' }}
              />
              <button
                type="submit"
                className="btn btn-blue btn-sm"
                style={{ padding: '13px 22px' }}
              >
                Avisame
              </button>
            </form>
          </div>

          <div data-reveal style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
            {box(cd.d, 'Días')}
            {box(cd.h, 'Horas')}
            {box(cd.m, 'Min')}
            {box(cd.s, 'Seg')}
          </div>
        </div>
      </div>
    </section>
  )
}
