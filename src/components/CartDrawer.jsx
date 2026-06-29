import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Plus, Minus, Trash2, ShoppingBag, Truck, MessageCircle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { money } from '../utils/format'

export default function CartDrawer() {
  const navigate = useNavigate()
  const open = useStore((s) => s.cartOpen)
  const close = useStore((s) => s.closeCart)
  const cart = useStore((s) => s.cart)
  const setQty = useStore((s) => s.setQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const clearCart = useStore((s) => s.clearCart)
  const settings = useStore((s) => s.settings)

  const subtotal = cart.reduce((n, i) => n + i.price * i.qty, 0)
  const threshold = settings?.free_shipping_threshold || 0
  const remaining = Math.max(0, threshold - subtotal)
  const progress = threshold ? Math.min(100, (subtotal / threshold) * 100) : 0

  useEffect(() => {
    document.body.classList.toggle('body-lock', open)
    return () => document.body.classList.remove('body-lock')
  }, [open])

  const goToWhatsAppCheckout = () => {
    close()
    navigate('/checkout')
  }

  if (!open) return null

  return (
    <>
      <div className="overlay" onClick={close} />
      <aside
        className="drawer"
        style={{ transform: 'translateX(0)' }}
        role="dialog"
        aria-label="Carrito de compras"
      >
        {/* head */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 22px 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <div className="anton" style={{ fontSize: 22 }}>
            Tu carrito{' '}
            <span style={{ color: 'var(--blue)' }}>
              {cart.reduce((n, i) => n + i.qty, 0)}
            </span>
          </div>
          <button className="icon-btn" aria-label="Cerrar" onClick={close} style={{ border: 'none' }}>
            <X size={22} />
          </button>
        </div>

        {/* free shipping bar */}
        {threshold > 0 && cart.length > 0 && (
          <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--line)' }}>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontSize: 13,
                color: 'var(--muted)',
                marginBottom: 8,
              }}
            >
              <Truck size={15} style={{ color: 'var(--blue)' }} />
              {remaining > 0 ? (
                <span>
                  Te faltan <b style={{ color: 'var(--text)' }}>{money(remaining)}</b> para el envío gratis
                </span>
              ) : (
                <span style={{ color: 'var(--green)' }}>¡Tenés envío gratis! 🎉</span>
              )}
            </div>
            <div style={{ height: 6, background: 'var(--bg-4)', borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: remaining > 0 ? 'var(--blue)' : 'var(--green)',
                  transition: 'width .4s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="no-bar">
          {cart.length === 0 ? (
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 30,
                textAlign: 'center',
              }}
            >
              <ShoppingBag size={42} style={{ color: 'var(--ghost)' }} />
              <div className="anton" style={{ fontSize: 24 }}>Carrito vacío</div>
              <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 240 }}>
                Todavía no agregaste nada. Date una vuelta por la tienda.
              </p>
              <Link to="/tienda" className="btn btn-blue" onClick={close}>
                Ir a la tienda
              </Link>
            </div>
          ) : (
            cart.map((i) => (
              <div
                key={i.key}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 22px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <Link to={`/producto/${i.slug}`} onClick={close} style={{ flexShrink: 0 }}>
                  <img
                    src={i.image}
                    alt={i.name}
                    style={{
                      width: 72,
                      height: 90,
                      objectFit: 'cover',
                      borderRadius: 10,
                      background: 'var(--bg-3)',
                    }}
                  />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <Link
                      to={`/producto/${i.slug}`}
                      onClick={close}
                      style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}
                    >
                      {i.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(i.key)}
                      aria-label="Quitar"
                      style={{ background: 'none', border: 'none', color: 'var(--faint)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--faint)', margin: '5px 0 10px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {i.size && <span>Talle {i.size}</span>}
                    {i.color && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {i.colorHex && (
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              background: i.colorHex,
                              border: '1px solid var(--line-2)',
                            }}
                          />
                        )}
                        {i.color}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div className="qty">
                      <button onClick={() => setQty(i.key, i.qty - 1)} aria-label="Menos">
                        <Minus size={14} />
                      </button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i.key, i.qty + 1)} aria-label="Más">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{money(i.price * i.qty)}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* footer */}
        {cart.length > 0 && (
          <div style={{ padding: '18px 22px', borderTop: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>Subtotal</span>
              <span className="anton" style={{ fontSize: 24 }}>{money(subtotal)}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--faint)', marginBottom: 14 }}>
              El envío y los medios de pago se coordinan por WhatsApp.
            </p>
            <button
              className="btn btn-blue btn-block"
              onClick={() => { close(); navigate('/checkout') }}
              style={{ marginBottom: 10 }}
            >
              Finalizar compra
            </button>
            <button className="btn btn-ghost btn-block" onClick={goToWhatsAppCheckout} style={{ marginBottom: 10 }}>
              <MessageCircle size={16} /> Pedir por WhatsApp
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={close}>
                Seguir comprando
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ flex: 1, borderColor: 'transparent', color: 'var(--faint)' }}
                onClick={clearCart}
              >
                Vaciar
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
