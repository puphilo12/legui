import { Check, Heart, Info } from 'lucide-react'
import { useStore } from '../store/useStore'

// Notificaciones flotantes (abajo a la derecha). Se autodescartan desde el store.
export default function Toaster() {
  const toasts = useStore((s) => s.toasts)

  return (
    <div
      style={{
        position: 'fixed',
        right: 18,
        bottom: 18,
        zIndex: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-3)',
            border: '1px solid var(--line-2)',
            borderLeft: '3px solid var(--blue)',
            color: 'var(--text)',
            padding: '12px 16px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 500,
            minWidth: 220,
            maxWidth: 320,
            boxShadow: '0 12px 30px rgba(0,0,0,.45)',
            animation: 'toastIn .28s cubic-bezier(.2,.8,.2,1)',
          }}
        >
          <span style={{ color: 'var(--blue)', display: 'inline-flex' }}>
            {t.kind === 'fav' ? (
              <Heart size={17} />
            ) : t.kind === 'info' ? (
              <Info size={17} />
            ) : (
              <Check size={17} />
            )}
          </span>
          {t.text}
        </div>
      ))}
    </div>
  )
}
