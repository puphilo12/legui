import { useStore } from '../store/useStore'
import { useReveal } from '../hooks/useReveal'
import Hero from '../sections/Hero'
import Marquee from '../components/Marquee'
import FeaturedProducts from '../sections/FeaturedProducts'
import Collections from '../sections/Collections'
import Lookbook from '../sections/Lookbook'
import DropSection from '../sections/DropSection'

export default function Home() {
  const settings = useStore((s) => s.settings)
  const products = useStore((s) => s.products)
  const collections = useStore((s) => s.collections)
  useReveal([products.length, collections.length])

  return (
    <>
      <Hero />
      <Marquee text={settings.marquee || 'NUEVO DROP ✸ LEGUI ✸ '} />
      <FeaturedProducts />
      <Collections />
      <Lookbook />
      <DropSection />
    </>
  )
}
