import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, Ruler, Truck, RefreshCw, ShieldCheck, Minus, Plus, Share2 } from 'lucide-react'
import { useStore, effPrice, variantStock } from '../store/useStore'
import { useReveal } from '../hooks/useReveal'
import { useSEO, SITE_URL } from '../hooks/useSEO'
import { money } from '../utils/format'
import ProductCard from '../components/ProductCard'
import SizeGuide from '../components/SizeGuide'

export default function ProductDetail() {
  const { slug } = useParams()
  const products = useStore((s) => s.products)
  const getProduct = useStore((s) => s.getProduct)
  const relatedFn = useStore((s) => s.related)
  const addToCart = useStore((s) => s.addToCart)
  const toast = useStore((s) => s.toast)
  const favorites = useStore((s) => s.favorites)
  const toggleFav = useStore((s) => s.toggleFav)

  const product = useMemo(() => getProduct(slug), [slug, products, getProduct])
  const related = useMemo(() => relatedFn(product), [product, relatedFn])

  const [color, setColor] = useState(null)
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [mainImg, setMainImg] = useState('')
  const [guide, setGuide] = useState(false)

  const gallery = useMemo(() => {
    if (!product) return []
    if (color?.images?.length) return [...new Set(color.images)]
    return [...new Set([product.image, ...(product.images || [])].filter(Boolean))]
  }, [product, color])

  useEffect(() => {
    const def = product?.colors?.find((c) => c.default) || product?.colors?.[0] || null
    setColor(def)
    setSize(null)
    setQty(1)
    setMainImg(def?.images?.[0] || product?.images?.[0] || product?.image || '')
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setQty(1) }, [color, size])

  useReveal([product?.id, related.length])

  useSEO({
    title: product ? product.name : 'Producto no encontrado',
    description: product
      ? (product.description || `${product.name} — ${product.category} en LEGUI. Envíos a todo el país, pago seguro.`)
      : undefined,
    image: mainImg || product?.image,
    path: `/producto/${slug}`,
    noindex: !product,
    jsonLd: product ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: gallery.length ? gallery : [product.image].filter(Boolean),
      description: product.description || `${product.name} — LEGUI streetwear`,
      sku: product.id,
      category: product.category,
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/producto/${slug}`,
        priceCurrency: 'ARS',
        price: effPrice(product),
        availability: (product.sold_out || (product.stock ?? 0) <= 0) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      },
    } : null,
  })

  if (!product) {
    return (
      <div className="wrap section" style={{ textAlign: 'center' }}>
        <div className="anton" style={{ fontSize: 40, marginBottom: 12 }}>Producto no encontrado</div>
        <p className="muted" style={{ marginBottom: 22 }}>Quizá se agotó o cambió de nombre.</p>
        <Link to="/tienda" className="btn btn-blue">Volver a la tienda</Link>
      </div>
    )
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price
  const off = hasDiscount ? Math.round((1 - product.discount_price / product.price) * 100) : 0
  const soldOut = product.sold_out || (product.stock ?? 0) <= 0
  const needSize = (product.sizes || []).length > 0
  const selStock = variantStock(product, color, size)
  const variantSoldOut = size !== null && selStock !== null && selStock <= 0
  const stock = selStock ?? product.stock ?? 0
  const fav = favorites.includes(product.id)

  const add = () => {
    if (soldOut) return
    if (needSize && !size) {
      toast('Elegí un talle', 'info')
      return
    }
    if (variantSoldOut) return
    addToCart(product, { color, size, qty })
  }

  const share = async () => {
    const shareUrl = `${SITE_URL}/producto/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `Mirá ${product.name} en LEGUI`, url: shareUrl })
      } catch {
        // usuario canceló, no hacemos nada
      }
      return
    }
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast('Link copiado')
    } catch {
      toast('No se pudo copiar el link', 'info')
    }
  }

  const infoRows = [
    [Truck, 'Envío a todo el país', 'Despacho en 48 h hábiles'],
    [RefreshCw, 'Cambios fáciles', '30 días para cambiar tu talle'],
    [ShieldCheck, 'Compra protegida', 'Pago seguro y datos cuidados'],
  ]

  return (
    <div className="wrap section">
      <div style={{ fontSize: 12, color: 'var(--faint)', marginBottom: 22 }}>
        <Link to="/" className="muted">Inicio</Link> /{' '}
        <Link to="/tienda" className="muted">Tienda</Link> /{' '}
        <Link to={`/tienda?cat=${product.category}`} className="muted">{product.category}</Link> /{' '}
        <span>{product.name}</span>
      </div>

      <div className="pdp-grid">
        {/* galería */}
        <div data-reveal>
          <div
            style={{
              position: 'relative',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid var(--line)',
              background: 'var(--bg-3)',
              aspectRatio: '4 / 5',
            }}
          >
            <img src={mainImg} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {hasDiscount && !soldOut && <span className="off-badge" style={{ fontSize: 12 }}>-{off}%</span>}
            {soldOut && (
              <div className="soldout-overlay">
                <span>Agotado</span>
              </div>
            )}
          </div>

          {gallery.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {gallery.map((img) => (
                <button
                  key={img}
                  onClick={() => setMainImg(img)}
                  style={{
                    width: 70,
                    height: 86,
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: `1px solid ${mainImg === img ? 'var(--blue)' : 'var(--line-2)'}`,
                    padding: 0,
                    background: 'var(--bg-3)',
                    cursor: 'pointer',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info */}
        <div data-reveal>
          <div className="eyebrow" style={{ color: 'var(--faint)', marginBottom: 10 }}>
            {product.category}
          </div>
          <h1 className="anton" style={{ fontSize: 'clamp(32px,4.5vw,56px)', lineHeight: 0.95, margin: '0 0 16px' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
            <span className="anton" style={{ fontSize: 34, color: 'var(--blue)' }}>
              {money(effPrice(product))}
            </span>
            {hasDiscount && (
              <>
                <span style={{ fontSize: 18, color: 'var(--faint)', textDecoration: 'line-through' }}>
                  {money(product.price)}
                </span>
                <span
                  style={{
                    background: 'var(--blue-soft)',
                    color: '#7e95ff',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  {off}% OFF
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 26 }}>
              {product.description}
            </p>
          )}

          {/* colores */}
          {(product.colors || []).length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 12 }}>
                Color: <span style={{ color: 'var(--text)' }}>{color?.name}</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    className={`swatch${color?.name === c.name ? ' on' : ''}`}
                    style={{ background: c.hex }}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => {
                      setColor(c)
                      setSize(null)
                      setMainImg(c.images?.[0] || product.image || '')
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* talles */}
          {needSize && (
            <div style={{ marginBottom: 26 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--faint)' }}>
                  Talle
                </span>
                <button
                  onClick={() => setGuide(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13 }}
                >
                  <Ruler size={15} /> Guía de talles
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {product.sizes.map((s) => {
                  const sStock = variantStock(product, color, s)
                  const sOut = sStock !== null && sStock <= 0
                  return (
                    <button
                      key={s}
                      className={`size${size === s ? ' on' : ''}`}
                      onClick={() => !sOut && setSize(s)}
                      disabled={soldOut || sOut}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* cantidad + comprar */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            {!soldOut && !variantSoldOut && (
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos"><Minus size={15} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(stock || 99, q + 1))} aria-label="Más"><Plus size={15} /></button>
              </div>
            )}
            <button
              className="btn btn-blue"
              style={{ flex: 1, minWidth: 200 }}
              onClick={add}
              disabled={soldOut || variantSoldOut}
            >
              {soldOut || variantSoldOut ? 'Agotado' : 'Agregar al carrito'}
            </button>
            <button
              className={`icon-btn${fav ? ' on' : ''}`}
              aria-label="Favorito"
              aria-pressed={fav}
              onClick={() => toggleFav(product.id)}
              style={{
                width: 52,
                height: 52,
                background: fav ? 'var(--blue)' : 'transparent',
                borderColor: fav ? 'var(--blue)' : 'var(--line-2)',
              }}
            >
              <Heart size={20} fill={fav ? '#fff' : 'none'} />
            </button>
            <button
              className="icon-btn"
              aria-label="Compartir"
              onClick={share}
              style={{ width: 52, height: 52 }}
            >
              <Share2 size={20} />
            </button>
          </div>

          {!soldOut && stock > 0 && stock <= 5 && (
            <p style={{ color: 'var(--amber)', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              ¡Últimas {stock} unidades!
            </p>
          )}

          {/* info envíos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            {infoRows.map(([Icon, title, sub]) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0' }}>
                <Icon size={20} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--faint)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* relacionados */}
      {related.length > 0 && (
        <div style={{ marginTop: 80 }}>
          <h2 className="anton" style={{ fontSize: 'clamp(26px,3.5vw,42px)', marginBottom: 26 }}>
            También te puede gustar
          </h2>
          <div className="grid-products">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <SizeGuide open={guide} onClose={() => setGuide(false)} category={product.category} />
    </div>
  )
}
