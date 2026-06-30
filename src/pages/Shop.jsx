import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { SlidersHorizontal, X, Search, PackageX } from 'lucide-react'
import { useStore, effPrice } from '../store/useStore'
import { useReveal } from '../hooks/useReveal'
import { useSEO } from '../hooks/useSEO'
import ProductCard from '../components/ProductCard'

const SORTS = [
  ['relevancia', 'Relevancia'],
  ['precio-asc', 'Precio: menor a mayor'],
  ['precio-desc', 'Precio: mayor a menor'],
  ['nombre', 'Nombre A–Z'],
]

export default function Shop() {
  const products = useStore((s) => s.products)
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const cat = params.get('cat') || ''
  const q = params.get('q') || ''
  const size = params.get('size') || ''
  const sort = params.get('sort') || 'relevancia'
  const offer = params.get('offer') === '1'

  const setParam = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  )
  const sizes = useMemo(() => {
    const s = new Set()
    products.forEach((p) => (p.sizes || []).forEach((x) => s.add(x)))
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    return [...s].sort((a, b) => {
      const na = Number(a)
      const nb = Number(b)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      if (!isNaN(na)) return -1
      if (!isNaN(nb)) return 1
      return order.indexOf(a) - order.indexOf(b)
    })
  }, [products])

  const list = useMemo(() => {
    let l = [...products]
    if (cat) l = l.filter((p) => p.category === cat)
    if (size) l = l.filter((p) => (p.sizes || []).includes(size))
    if (offer) l = l.filter((p) => p.discount_price && p.discount_price < p.price)
    if (q) {
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
      l = l.filter((p) => {
        const haystack = [p.name, p.category, p.description, ...(p.colors || []).map((c) => c.name)]
          .filter(Boolean).join(' ').toLowerCase()
        return terms.every((t) => haystack.includes(t))
      })
    }
    if (sort === 'precio-asc') l.sort((a, b) => effPrice(a) - effPrice(b))
    else if (sort === 'precio-desc') l.sort((a, b) => effPrice(b) - effPrice(a))
    else if (sort === 'nombre') l.sort((a, b) => a.name.localeCompare(b.name))
    return l
  }, [products, cat, size, offer, q, sort])

  useReveal([list.length])

  useSEO({
    title: q ? `Resultados para "${q}"` : cat ? cat : 'Tienda',
    description: cat
      ? `Comprá ${cat.toLowerCase()} en LEGUI — streetwear y zapatillas urbanas, envíos a todo el país.`
      : 'Catálogo completo de LEGUI: zapatillas, ropa y accesorios streetwear. Stock limitado, drops semanales.',
    path: cat ? `/tienda?cat=${encodeURIComponent(cat)}` : '/tienda',
    noindex: !!q, // resultados de búsqueda interna: no indexar (contenido duplicado/efímero)
  })

  const activeCount = [cat, size, q, offer ? '1' : ''].filter(Boolean).length
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <div className="wrap section">
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 12, color: 'var(--faint)', marginBottom: 10 }}>
          <Link to="/" className="muted">Inicio</Link> / <span>Tienda</span>
          {cat && <span> / {cat}</span>}
        </div>
        <h1 className="anton" style={{ fontSize: 'clamp(34px,5vw,64px)', lineHeight: 0.95 }}>
          {cat || (q ? `“${q}”` : 'Catálogo')}
        </h1>
      </div>

      {/* barra superior */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 22,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="btn btn-ghost btn-sm filters-toggle"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <SlidersHorizontal size={15} /> Filtros{activeCount ? ` (${activeCount})` : ''}
        </button>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>
          {list.length} {list.length === 1 ? 'producto' : 'productos'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <label style={{ fontSize: 12, color: 'var(--faint)' }}>Ordenar</label>
          <select
            className="input"
            style={{ width: 'auto', padding: '9px 12px' }}
            value={sort}
            onChange={(e) => setParam('sort', e.target.value === 'relevancia' ? '' : e.target.value)}
          >
            {SORTS.map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="shop-layout">
        {/* filtros */}
        <aside className={`shop-filters${filtersOpen ? ' open' : ''}`}>
          <div style={{ position: 'relative', marginBottom: 22 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: 13, color: 'var(--faint)' }}
            />
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Buscar…"
              value={q}
              onChange={(e) => setParam('q', e.target.value)}
            />
          </div>

          <FilterGroup title="Categoría">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button className={`chip${!cat ? ' active' : ''}`} onClick={() => setParam('cat', '')}>
                Todo
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`chip${cat === c ? ' active' : ''}`}
                  onClick={() => setParam('cat', cat === c ? '' : c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </FilterGroup>

          {sizes.length > 0 && (
            <FilterGroup title="Talle">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sizes.map((s) => (
                  <button
                    key={s}
                    className={`chip${size === s ? ' active' : ''}`}
                    onClick={() => setParam('size', size === s ? '' : s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FilterGroup>
          )}

          <FilterGroup title="Ofertas">
            <button
              className={`chip${offer ? ' active' : ''}`}
              onClick={() => setParam('offer', offer ? '' : '1')}
            >
              Solo ofertas
            </button>
          </FilterGroup>

          {activeCount > 0 && (
            <button
              className="btn btn-ghost btn-sm btn-block"
              onClick={clearAll}
              style={{ marginTop: 10 }}
            >
              <X size={14} /> Limpiar filtros
            </button>
          )}
        </aside>

        {/* resultados */}
        <div>
          {list.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px dashed var(--line-2)',
                borderRadius: 16,
              }}
            >
              <PackageX size={40} style={{ color: 'var(--ghost)' }} />
              <div className="anton" style={{ fontSize: 26 }}>Nada por acá</div>
              <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 280 }}>
                No encontramos productos con esos filtros. Probá quitando alguno.
              </p>
              <button className="btn btn-blue btn-sm" onClick={clearAll}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid-products">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--faint)',
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}
