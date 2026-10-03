// Estrella de 4 puntas como las del logo. Decorativa: no la leen los lectores de pantalla.
export default function Sparkle({ size = 14, className = '', style }) {
  return (
    <svg
      className={`sparkle ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      <path d="M12 0C12.9 7.6 16.4 11.1 24 12C16.4 12.9 12.9 16.4 12 24C11.1 16.4 7.6 12.9 0 12C7.6 11.1 11.1 7.6 12 0Z" fill="currentColor" />
    </svg>
  )
}

// Estrellitas que titilan sobre una sección. Posiciones fijas (no aleatorias) para
// que no salten entre renders; `desk` = solo en pantallas grandes.
export function SparkleField({ items }) {
  return (
    <div className="sparkle-field" aria-hidden="true">
      {items.map((s, i) => (
        <Sparkle
          key={i}
          size={s.size}
          className={`glow${s.desk ? ' desk' : ''}`}
          style={{ top: s.top, left: s.left, animationDelay: `${s.delay}s`, animationDuration: `${s.dur || 3}s` }}
        />
      ))}
    </div>
  )
}
