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
  const content = (text || '').repeat(2)
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
      <div className={`marquee-track${reversed ? ' rev' : ''}`} aria-hidden="true">
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
