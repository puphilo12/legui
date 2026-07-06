import { Link } from 'react-router-dom'
import { Heart, Bell } from 'lucide-react'
import { useStore, effPrice, CASH_DISCOUNT } from '../store/useStore'
import { money, slugify } from '../utils/format'
import Img from './Img'

// Tarjeta de producto. Imagen + badges (tag / oferta / agotado) + fav.
// Toda la tarjeta linkea al detalle; el corazón es acción rápida.
// Agotado → badge chico (se ve el modelo) + botón "avisame cuando llegue".
export default function ProductCard({ product, reveal = true }) {
  const fav = useStore((s) => s.favorites.includes(product.id))
  const toggleFav = useStore((s) => s.toggleFav)

  const hasDiscount =
    product.discount_price && product.discount_price < product.price
  const off = hasDiscount
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0
  const soldOut = product.sold_out || (product.stock ?? 0) <= 0
  const cashPrice = Math.round(effPrice(product) * (1 - CASH_DISCOUNT))
  const url = `/producto/${slugify(product.name)}`

  return (
    <article className="prod-card" {...(reveal ? { 'data-reveal': '' } : {})}>
      <Link to={url} className="prod-media" aria-label={product.name}>
        <Img src={product.image} alt={product.name} w={440} quality={80} />
        {product.tag && !soldOut && (
          <span className="tag-badge">{product.tag}</span>
        )}
        {hasDiscount && !soldOut && (
          <span className="off-badge">-{off}%</span>
        )}
        {soldOut && <span className="soldout-badge">Agotado</span>}
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
        <div className="prod-cat">{product.category}</div>
        <div className="prod-name">{product.name}</div>
        <div className="prod-price-row">
          <span className="anton prod-price">{money(effPrice(product))}</span>
          {hasDiscount && (
            <span className="prod-old-price">{money(product.price)}</span>
          )}
        </div>
        {!soldOut && (
          <div className="prod-cash">
            💵 <b>{money(cashPrice)}</b> efectivo/transf.
            <span className="cash-off">30% OFF</span>
          </div>
        )}
      </Link>

      {soldOut && (
        <Link to={url} className="prod-notify" aria-label={`Avisame cuando ingrese ${product.name}`}>
          <Bell size={14} /> Avisame cuando ingrese
        </Link>
      )}
    </article>
  )
}
