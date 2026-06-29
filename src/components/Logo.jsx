import { Link } from 'react-router-dom'

// Logo LEGUI: emblema (logo.png, blanco) + wordmark en Anton.
export default function Logo({ height = 30, withText = true, to = '/' }) {
  return (
    <Link
      to={to}
      aria-label="LEGUI — inicio"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 11, lineHeight: 1 }}
    >
      <img
        src="/logo.png"
        alt="LEGUI"
        style={{ height, width: 'auto', objectFit: 'contain', display: 'block' }}
      />
      {withText && (
        <span className="anton" style={{ fontSize: height * 0.82, letterSpacing: '.05em' }}>
          LEGUI
        </span>
      )}
    </Link>
  )
}
