import { Link } from 'react-router-dom'
import { useStore } from '../store/useStore'

const catFor = (title = '') => {
  const t = title.toLowerCase()
  if (t.includes('zapat')) return 'Zapatillas'
  if (t.includes('ropa') || t.includes('hoodie')) return 'Ropa'
  if (t.includes('acces')) return 'Accesorios'
  return ''
}

// Link interno (react-router) o externo (http) según el destino.
function DestLink({ to, ...props }) {
  if (/^https?:\/\//i.test(to)) {
    return <a href={to} target="_blank" rel="noreferrer" {...props} />
  }
  return <Link to={to} {...props} />
}

export default function Collections() {
  const collections = useStore((s) => s.collections)
  if (!collections.length) return null

  return (
    <section id="colecciones" className="wrap section">
      <h2
        className="anton"
        data-reveal
        style={{ fontSize: 'clamp(30px,4.5vw,58px)', margin: '0 0 32px' }}
      >
        Colecciones
      </h2>

      <div className="bento">
        {collections.map((c, i) => {
          const cat = catFor(c.title)
          const big = c.big || i === 0
          const dest = c.link || (cat ? `/tienda?cat=${cat}` : '/tienda')
          return (
            <DestLink
              key={c.id}
              to={dest}
              data-reveal
              className={big ? 'bento-big' : ''}
              style={{
                position: 'relative',
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid var(--line)',
                gridRow: big ? 'span 2' : 'auto',
                display: 'block',
                minHeight: 0,
              }}
            >
              <img
                src={c.image}
                alt={c.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10,10,11,.85), transparent 55%)',
                }}
              />
              <div style={{ position: 'absolute', left: 22, bottom: 20 }}>
                <div className="anton" style={{ fontSize: big ? 40 : 28 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                  {c.subtitle} →
                </div>
              </div>
            </DestLink>
          )
        })}
      </div>
    </section>
  )
}
