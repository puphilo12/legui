import { Link } from 'react-router-dom'
import { Instagram, Music2, Youtube, Twitter, Facebook } from 'lucide-react'
import Logo from './Logo'
import { useStore } from '../store/useStore'
import { socialUrl } from '../utils/format'

export default function Footer() {
  const settings = useStore((s) => s.settings)

  // Solo se muestran las redes cargadas; las vacías se ocultan.
  const socials = [
    { icon: Instagram, href: socialUrl(settings.instagram, 'https://instagram.com/'), label: 'Instagram' },
    { icon: Music2, href: socialUrl(settings.tiktok, 'https://tiktok.com/@'), label: 'TikTok' },
    { icon: Youtube, href: socialUrl(settings.youtube, 'https://youtube.com/@'), label: 'YouTube' },
    { icon: Twitter, href: socialUrl(settings.twitter, 'https://x.com/'), label: 'X' },
    { icon: Facebook, href: socialUrl(settings.facebook, 'https://facebook.com/'), label: 'Facebook' },
  ].filter((s) => s.href)

  return (
    <footer className="wrap" style={{ padding: '70px 28px 40px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 40,
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--line)',
          paddingBottom: 40,
        }}
      >
        <div style={{ maxWidth: 340 }}>
          <Logo height={34} />
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginTop: 14 }}>
            Streetwear y zapatillas urbanas. Hecho en la ciudad, para la ciudad. Drops semanales y ediciones limitadas.
          </p>
          {socials.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="icon-btn"
                  aria-label={s.label}
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 14 }}>
              Tienda
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <Link to="/tienda" className="muted">Catálogo</Link>
              <Link to="/tienda?cat=Zapatillas" className="muted">Zapatillas</Link>
              <Link to="/tienda?cat=Ropa" className="muted">Ropa</Link>
              <Link to="/#drops" className="muted">Drops</Link>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 14 }}>
              Ayuda
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <Link to="/#lookbook" className="muted">Lookbook</Link>
              <a href="#top" className="muted">Envíos y cambios</a>
              <a
                href={settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="muted"
              >
                Contacto
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingTop: 20,
          fontSize: 12,
          color: 'var(--faint)',
        }}
      >
        <span>© {new Date().getFullYear()} LEGUI — Todos los derechos reservados</span>
        <a
          href="https://www.instagram.com/maxi.violaok"
          target="_blank"
          rel="noreferrer"
          className="credit"
        >
          Diseñado por <span>@maxi.violaok</span>
        </a>
      </div>
    </footer>
  )
}
