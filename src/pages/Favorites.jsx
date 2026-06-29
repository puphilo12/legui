import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useReveal } from '../hooks/useReveal'
import ProductCard from '../components/ProductCard'

export default function Favorites() {
  const products = useStore((s) => s.products)
  const favorites = useStore((s) => s.favorites)
  const list = products.filter((p) => favorites.includes(p.id))
  useReveal([list.length])

  return (
    <div className="wrap section">
      <h1 className="anton" style={{ fontSize: 'clamp(34px,5vw,64px)', marginBottom: 8 }}>
        Favoritos
      </h1>
      <p className="muted" style={{ marginBottom: 30 }}>
        {list.length ? 'Tus prendas guardadas, listas para el próximo drop.' : ''}
      </p>

      {list.length ? (
        <div className="grid-products">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px dashed var(--line-2)',
            borderRadius: 16,
          }}
        >
          <Heart size={42} style={{ color: 'var(--ghost)' }} />
          <div className="anton" style={{ fontSize: 26 }}>Sin favoritos todavía</div>
          <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 300 }}>
            Tocá el corazón en cualquier producto para guardarlo acá.
          </p>
          <Link to="/tienda" className="btn btn-blue">Explorar la tienda</Link>
        </div>
      )}
    </div>
  )
}
