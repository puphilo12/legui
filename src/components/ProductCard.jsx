import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useStore, effPrice } from '../store/useStore'
import { money, slugify } from '../utils/format'

// Tarjeta de producto. Imagen + badges (tag / oferta / agotado) + fav.
// Toda la tarjeta linkea al detalle; el corazón es acción rápida.
export default function ProductCard({ product, reveal = true }) {
  const fav = useStore((s) => s.favorites.includes(product.id))
  const toggleFav = useStore((s) => s.toggleFav)

  const hasDiscount =
    product.discount_price && product.discount_price < product.price
  const off = hasDiscount
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0
  const url = `/producto/${slugify(product.name)}`

  return (
    <article className="prod-card" {...(reveal ? { 'data-reveal': '' } : {})}>
      <Link to={url} className="prod-media" aria-label={product.name}>
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.tag && !product.sold_out && (
          <span className="tag-badge">{product.tag}</span>
        )}
        {hasDiscount && !product.sold_out && (
          <span className="off-badge">-{off}%</span>
        )}
        {product.sold_out && (
          <div className="soldout-overlay">
            <span>Agotado</span>
          </div>
        )}
        <button
          className={`fav-btn${fav ? ' on' : ''}`}
          aria-label={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={fav}
          onClick={(e) => {
            e.preventDefault()
            toggleFav(product.id)
          }}
        >
          <Heart size={16} fill={fav ? '#fff' : 'none'} />
        </button>
      </Link>

      <Link to={url} className="prod-info">
        <div style={{ minWidth: 0 }}>
          <div className="prod-cat">{product.category}</div>
          <div className="prod-name">{product.name}</div>
          {hasDiscount && (
            <div className="prod-old-price">{money(product.price)}</div>
          )}
        </div>
        <div className="anton prod-price">{money(effPrice(product))}</div>
      </Link>
    </article>
  )
}
