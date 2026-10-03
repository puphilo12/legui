import { Link } from 'react-router-dom'
import Sparkle from './Sparkle'

const LOGO_RATIO = 1725 / 873

// Logo LEGUI: emblema plateado con destello (logo.png como máscara) + wordmark cromado.
export default function Logo({ height = 30, withText = true, to = '/' }) {
  return (
    <Link
      to={to}
      aria-label="LEGUI — inicio"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 11, lineHeight: 1 }}
    >
      <span style={{ position: 'relative', display: 'block' }}>
        <span className="logo-mark" role="img" aria-label="LEGUI" style={{ height, width: Math.round(height * LOGO_RATIO) }} />
        {/* coincide con la estrella del emblema */}
        <Sparkle
          size={Math.round(height * 0.5)}
          className="glow twinkle logo-spark"
          style={{ top: -height * 0.18, left: `${71 - 25 / LOGO_RATIO}%` }}
        />
      </span>
      {withText && (
        <span className="anton chrome" style={{ fontSize: height * 0.82, letterSpacing: '.05em' }}>
          LEGUI
        </span>
      )}
    </Link>
  )
}
