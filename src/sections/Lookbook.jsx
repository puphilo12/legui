import { useStore } from '../store/useStore'

const spanStyle = (span) =>
  span === 'tall'
    ? { gridRow: 'span 2' }
    : span === 'wide'
    ? { gridColumn: 'span 2' }
    : {}

export default function Lookbook() {
  const lookbook = useStore((s) => s.lookbook)
  if (!lookbook.length) return null

  return (
    <section
      id="lookbook"
      style={{
        background: 'var(--bg-2)',
        borderTop: '1px solid var(--line)',
        borderBottom: '1px solid var(--line)',
        padding: '80px 0',
      }}
    >
      <div className="wrap">
        <div className="section-head" data-reveal>
          <h2 className="anton">Lookbook 26</h2>
          <p>La calle es la pasarela. El editorial de la temporada, sin pose.</p>
        </div>

        <div className="lookbook-grid">
          {lookbook.map((lb) => (
            <div
              key={lb.id}
              data-reveal
              style={{
                ...spanStyle(lb.span),
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                background: 'var(--bg-3)',
              }}
            >
              <img
                src={lb.image}
                alt={lb.title}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
