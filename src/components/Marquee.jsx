// Cinta animada (marquee) estilo CALLE 22. El texto se duplica para que
// el loop con translateX(-50%) sea perfecto y continuo.
export default function Marquee({
  text,
  reversed = false,
  bg = 'var(--blue)',
  color = '#fff',
  size = 26,
  border = true,
}) {
  // Se repite varias veces por mitad para que, en pantallas anchas, no quede
  // un hueco en blanco antes de que el loop (translateX(-50%)) vuelva a empezar.
  // La duración se escala en la misma proporción para que la velocidad (px/seg) no cambie.
  const REPEATS = 6
  const half = (text || '').repeat(REPEATS)
  const content = half + half
  const baseDuration = reversed ? 22 : 14
  const duration = baseDuration * REPEATS
  return (
    <div
      style={{
        background: bg,
        color,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '14px 0',
        borderTop: border ? '1px solid rgba(255,255,255,.12)' : 'none',
        borderBottom: border ? '1px solid rgba(255,255,255,.12)' : 'none',
      }}
    >
      <div
        className={`marquee-track${reversed ? ' rev' : ''}`}
        aria-hidden="true"
        style={{ animationDuration: `${duration}s` }}
      >
        <span
          className="anton"
          style={{ fontSize: size, letterSpacing: '.04em', paddingRight: 0 }}
        >
          {content}
        </span>
      </div>
    </div>
  )
}
