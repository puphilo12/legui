import { useStore } from '../store/useStore'
import { useReveal } from '../hooks/useReveal'
import { useSEO, SITE_URL } from '../hooks/useSEO'
import { socialUrl } from '../utils/format'
import Hero from '../sections/Hero'
import Marquee, { storeMarqueeItems } from '../components/Marquee'
import FeaturedProducts from '../sections/FeaturedProducts'
import Collections from '../sections/Collections'
import Lookbook from '../sections/Lookbook'
import DropSection from '../sections/DropSection'

export default function Home() {
  const settings = useStore((s) => s.settings)
  const products = useStore((s) => s.products)
  const collections = useStore((s) => s.collections)
  useReveal([products.length, collections.length])

  useSEO({
    description: 'Legui Importados — perfumes y ropa importada. Descuento mayorista llevando varias unidades y envíos a todo el país.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Legui Importados',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/og.jpg`,
      sameAs: [
        socialUrl(settings.instagram, 'https://instagram.com/'),
        socialUrl(settings.tiktok, 'https://tiktok.com/@'),
        socialUrl(settings.youtube, 'https://youtube.com/@'),
        socialUrl(settings.twitter, 'https://x.com/'),
        socialUrl(settings.facebook, 'https://facebook.com/'),
      ].filter(Boolean),
    },
  })

  return (
    <>
      <Hero />
      <Marquee items={storeMarqueeItems(settings)} variant={settings.marquee_style || 'azul'} />
      <FeaturedProducts />
      <Collections />
      <Lookbook />
      <DropSection />
    </>
  )
}
