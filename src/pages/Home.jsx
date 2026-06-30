import { useStore } from '../store/useStore'
import { useReveal } from '../hooks/useReveal'
import { useSEO, SITE_URL } from '../hooks/useSEO'
import { money, socialUrl } from '../utils/format'
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

  useSEO({
    description: 'Streetwear sin reglas. Drops semanales, ediciones limitadas y zapatillas que mueven la ciudad. Envíos a todo el país.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: 'LEGUI',
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

  const marqueeText = (settings.marquee || 'NUEVO DROP ✸ LEGUI') +
    (settings.free_shipping_threshold ? ` ✸ ENVÍO GRATIS DESDE ${money(settings.free_shipping_threshold)}` : '') +
    ' ✸ '

  return (
    <>
      <Hero />
      <Marquee text={marqueeText} />
      <FeaturedProducts />
      <Collections />
      <Lookbook />
      <DropSection />
    </>
  )
}
