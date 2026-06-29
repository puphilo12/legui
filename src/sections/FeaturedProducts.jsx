import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import ProductCard from '../components/ProductCard'

export default function FeaturedProducts() {
  const products = useStore((s) => s.products)
  const featured = products.filter((p) => p.featured)
  const list = (featured.length ? featured : products).slice(0, 6)

  return (
    <section id="nuevos" className="wrap section">
      <div className="section-head" data-reveal>
        <h2 className="anton">
          Nuevos<br />productos
        </h2>
        <p>Lo último en zapatillas y prendas. Stock limitado — cuando se va, se va.</p>
      </div>

      <div className="grid-products">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 38 }}>
        <Link to="/tienda" className="btn btn-ghost">
          Ver todo el catálogo <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}
