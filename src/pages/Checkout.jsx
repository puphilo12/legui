import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Truck, Store, MessageCircle, Landmark, Wallet, ShieldCheck, Copy, MapPin, User, LogIn } from 'lucide-react'
import { useStore, CASH_DISCOUNT } from '../store/useStore'
import { useSEO } from '../hooks/useSEO'
import { MOCK } from '../lib/supabase'
import { money } from '../utils/format'

const empty = {
  nombre: '', telefono: '', email: '',
  entrega: 'envio', direccion: '', localidad: '', provincia: '', cp: '',
  notas: '', paymentMethod: 'whatsapp',
}

const PAY_LABEL = {
  whatsapp: 'A coordinar por WhatsApp',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
  mercadopago: 'Mercado Pago',
}

export default function Checkout() {
  const navigate = useNavigate()
  const cart = useStore((s) => s.cart)
  const settings = useStore((s) => s.settings)
  const placeOrder = useStore((s) => s.placeOrder)
  const toast = useStore((s) => s.toast)
  const user = useStore((s) => s.user)
  const isAdmin = useStore((s) => s.isAdmin)
  const profile = useStore((s) => s.profile)
  const saveProfile = useStore((s) => s.saveProfile)
  const signIn = useStore((s) => s.signIn)

  const [f, setF] = useState(empty)
  const [done, setDone] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPw, setLoginPw] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const set = (patch) => setF((s) => ({ ...s, ...patch }))

  useSEO({ title: 'Checkout', path: '/checkout', noindex: true })

  // Auto-fill from buyer profile
  useEffect(() => {
    if (profile) {
      setF((s) => ({
        ...s,
        nombre: profile.nombre || s.nombre,
        telefono: profile.telefono || s.telefono,
        email: profile.email || s.email,
        direccion: profile.direccion || s.direccion,
        localidad: profile.localidad || s.localidad,
        provincia: profile.provincia || s.provincia,
        cp: profile.cp || s.cp,
      }))
    }
  }, [profile])

  // If pickup disabled, force envio
  useEffect(() => {
    if (!settings?.pickup_enabled) set({ entrega: 'envio' })
  }, [settings?.pickup_enabled])

  const copy = (text) => {
    if (!text) return
    navigator.clipboard?.writeText(text).then(() => toast('Copiado ✓')).catch(() => {})
  }

  const subtotal = cart.reduce((n, i) => n + i.price * i.qty, 0)
  const threshold = settings?.free_shipping_threshold || 0
  const freeShip = threshold && subtotal >= threshold

  // El precio de lista ya es el precio final con Mercado Pago.
  // Transferencia, efectivo y WhatsApp llevan descuento.
  const DISCOUNT_LABEL = `${(CASH_DISCOUNT * 100).toLocaleString('es-AR')}%`
  const hasDiscount = ['transferencia', 'efectivo', 'whatsapp'].includes(f.paymentMethod)
  const discount = hasDiscount ? Math.round(subtotal * CASH_DISCOUNT) : 0
  const grandTotal = subtotal - discount

  const buildWhatsApp = (order) => {
    const phone = (settings?.whatsapp || '').replace(/\D/g, '')
    if (!phone) return null
    const c = order.customer
    const lines = order.items.map(
      (i) =>
        `• ${i.qty}x ${i.name}` +
        (i.size ? ` · Talle ${i.size}` : '') +
        (i.color ? ` · ${i.color}` : '') +
        ` — ${money(i.price * i.qty)}`
    )
    const entrega = c.entrega === 'retiro'
      ? `Retiro en local${settings?.showroom_address ? ' — ' + settings.showroom_address : ''}`
      : `Envío a: ${c.direccion}, ${c.localidad}${c.provincia ? ', ' + c.provincia : ''}${c.cp ? ' (CP ' + c.cp + ')' : ''}`
    const method = order.payment_method || order.paymentMethod
    const orderSubtotal = order.items.reduce((n, i) => n + i.price * i.qty, 0)
    const orderDiscount = orderSubtotal - order.total
    const totales = orderDiscount > 0
      ? `Subtotal: ${money(orderSubtotal)}\nDescuento ${DISCOUNT_LABEL} OFF (${PAY_LABEL[method] || method}): -${money(orderDiscount)}\nTotal: ${money(order.total)}`
      : `Total: ${money(order.total)}`
    const msg =
      `Hola LEGUI! 👋 Nuevo pedido #${order.id.slice(-5)}\n\n` +
      `Cliente: ${c.nombre}\nTel: ${c.telefono}${c.email ? '\nEmail: ' + c.email : ''}\n${entrega}\n` +
      (c.notas ? `Notas: ${c.notas}\n` : '') +
      `\n${lines.join('\n')}\n\n${totales}\nPago: ${PAY_LABEL[method] || 'A coordinar'}` +
      (method === 'transferencia' ? `\n\nApenas transfiera te envío el comprobante 📎` : '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!f.nombre.trim() || !f.telefono.trim()) return toast('Completá nombre y teléfono', 'info')
    if (f.entrega === 'envio' && !f.direccion.trim()) return toast('Completá la dirección de envío', 'info')
    setSubmitting(true)

    const res = await placeOrder({ customer: { ...f }, paymentMethod: f.paymentMethod, surcharge: hasDiscount ? -CASH_DISCOUNT : 0 })
    if (!res.ok) {
      setSubmitting(false)
      return toast(res.error || 'No se pudo crear el pedido', 'info')
    }

    // Save buyer profile for next time
    if (!MOCK && user && !isAdmin) {
      saveProfile({
        nombre: f.nombre,
        telefono: f.telefono,
        email: f.email,
        direccion: f.direccion,
        localidad: f.localidad,
        provincia: f.provincia,
        cp: f.cp,
      }).catch(() => {})
    }

    // Mercado Pago: crear preferencia y redirigir
    if (f.paymentMethod === 'mercadopago') {
      try {
        const mpRes = await fetch('/api/mp-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, customer: f, external_reference: res.order.id }),
        })
        const mpData = await mpRes.json()
        if (!mpRes.ok) throw new Error(mpData.error || 'Error MP')
        const sandbox = import.meta.env.VITE_MP_SANDBOX === 'true'
        const url = sandbox ? mpData.sandbox_init_point : mpData.init_point
        if (url) { window.location.href = url; return }
        throw new Error('No se obtuvo URL de pago')
      } catch (err) {
        toast('Error al conectar con Mercado Pago: ' + err.message, 'error')
        setSubmitting(false)
        return
      }
    }

    const wa = (f.paymentMethod === 'whatsapp' || f.paymentMethod === 'transferencia') ? buildWhatsApp(res.order) : null
    if (wa) window.open(wa, '_blank')
    setDone({ ...res.order, wa })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setSubmitting(false)
  }

  const doLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPw.trim()) return
    setLoginBusy(true)
    const res = await signIn(loginEmail.trim(), loginPw)
    setLoginBusy(false)
    if (!res.ok) toast(res.error || 'Email o contraseña incorrectos', 'error')
    else setLoginOpen(false)
  }

  /* ---- confirmación ---- */
  if (done) {
    return (
      <div className="wrap section" style={{ maxWidth: 640, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--blue-soft)', color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <Check size={32} />
        </div>
        <h1 className="anton" style={{ fontSize: 'clamp(30px,5vw,52px)', marginBottom: 10 }}>¡Pedido recibido!</h1>
        <p className="muted" style={{ marginBottom: 8 }}>
          Pedido <b style={{ color: 'var(--text)' }}>#{done.id.slice(-5)}</b> por <b style={{ color: 'var(--text)' }}>{money(done.total)}</b>.
        </p>
        <p className="muted" style={{ marginBottom: 24 }}>
          {(done.payment_method || done.paymentMethod) === 'transferencia'
            ? 'Transferí el total y envianos el comprobante por WhatsApp para confirmar tu pedido.'
            : 'Te vamos a contactar para coordinar pago y entrega. ¡Gracias por elegir LEGUI!'}
        </p>

        {(done.payment_method === 'transferencia' || done.paymentMethod === 'transferencia') && (settings.alias || settings.cbu) && (
          <div className="admin-card" style={{ textAlign: 'left', maxWidth: 420, margin: '0 auto 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, marginBottom: 10 }}>
              <Landmark size={16} style={{ color: 'var(--blue)' }} /> Datos para transferir
            </div>
            {settings.alias && <CopyRow label="Alias" value={settings.alias} onCopy={copy} />}
            {settings.cbu && <CopyRow label="CBU" value={settings.cbu} onCopy={copy} />}
            {settings.bank_holder && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Titular: {settings.bank_holder}</div>}
            <div style={{ fontSize: 14, marginTop: 10 }}>Total a transferir: <b>{money(done.total)}</b></div>
          </div>
        )}

        {done.wa && (
          <a href={done.wa} target="_blank" rel="noreferrer" className="btn btn-blue" style={{ marginRight: 10 }}>
            <MessageCircle size={16} /> {(done.payment_method || done.paymentMethod) === 'transferencia' ? 'Enviar comprobante' : 'Abrir WhatsApp'}
          </a>
        )}
        <Link to="/tienda" className="btn btn-ghost">Seguir comprando</Link>
      </div>
    )
  }

  /* ---- carrito vacío ---- */
  if (!cart.length) {
    return (
      <div className="wrap section" style={{ textAlign: 'center' }}>
        <h1 className="anton" style={{ fontSize: 40, marginBottom: 12 }}>Tu carrito está vacío</h1>
        <p className="muted" style={{ marginBottom: 22 }}>Agregá productos para finalizar la compra.</p>
        <Link to="/tienda" className="btn btn-blue">Ir a la tienda</Link>
      </div>
    )
  }

  const PAYS = [
    { id: 'mercadopago', icon: null, label: 'Mercado Pago', desc: 'Tarjetas, débito y dinero en cuenta. Pago 100% seguro.' },
    { id: 'transferencia', icon: Landmark, label: `Transferencia bancaria · ${DISCOUNT_LABEL} OFF`, desc: settings.alias ? `Alias: ${settings.alias}` : 'Te pasamos los datos bancarios.' },
    { id: 'efectivo', icon: Wallet, label: `Efectivo · ${DISCOUNT_LABEL} OFF`, desc: 'Pagás al retirar o al recibir.' },
    { id: 'whatsapp', icon: MessageCircle, label: `Coordinar por WhatsApp · ${DISCOUNT_LABEL} OFF`, desc: 'Te escribimos para cerrar pago y envío.' },
  ]

  return (
    <div className="wrap section">
      <div style={{ fontSize: 12, color: 'var(--faint)', marginBottom: 14 }}>
        <Link to="/" className="muted">Inicio</Link> / <span>Checkout</span>
      </div>
      <h1 className="anton" style={{ fontSize: 'clamp(32px,5vw,60px)', marginBottom: 24 }}>Finalizar compra</h1>

      {/* Buyer login hint */}
      {!MOCK && !user && (
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={16} style={{ color: 'var(--muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>¿Tenés cuenta? Ingresá para que tus datos se completen automáticamente.</span>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLoginOpen((s) => !s)}>
            <LogIn size={14} /> {loginOpen ? 'Cancelar' : 'Iniciar sesión'}
          </button>
        </div>
      )}

      {loginOpen && !user && (
        <form onSubmit={doLogin} style={{ background: 'var(--bg-2)', border: '1px solid var(--blue)', borderRadius: 12, padding: 18, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label className="field">Email</label>
            <input type="email" className="input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="tu@email.com" autoComplete="email" />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="field">Contraseña</label>
            <input type="password" className="input" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} autoComplete="current-password" />
          </div>
          <button className="btn btn-blue btn-sm" type="submit" disabled={loginBusy}>
            {loginBusy ? 'Cargando…' : 'Entrar'}
          </button>
        </form>
      )}

      {!MOCK && user && !isAdmin && (
        <div style={{ background: 'var(--blue-soft)', border: '1px solid var(--blue)', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <User size={14} style={{ color: 'var(--blue)' }} />
          Ingresaste como <b style={{ color: 'var(--text)' }}>{user.email}</b>. Tus datos de envío se completaron automáticamente.
        </div>
      )}

      <form onSubmit={submit} className="pdp-grid">
        {/* datos */}
        <div>
          <h3 style={{ marginBottom: 14 }}>Tus datos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }} className="slogan-grid">
            <Field label="Nombre y apellido *"><input className="input" value={f.nombre} onChange={(e) => set({ nombre: e.target.value })} /></Field>
            <Field label="Teléfono / WhatsApp *"><input className="input" value={f.telefono} onChange={(e) => set({ telefono: e.target.value })} /></Field>
          </div>
          <div style={{ marginBottom: 16 }}>
            <Field label="Email (opcional)"><input type="email" className="input" value={f.email} onChange={(e) => set({ email: e.target.value })} /></Field>
          </div>

          <h3 style={{ margin: '8px 0 12px' }}>Entrega</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <RadioCard active={f.entrega === 'envio'} onClick={() => set({ entrega: 'envio' })} icon={Truck} label="Envío a domicilio" />
            {settings?.pickup_enabled && (
              <RadioCard active={f.entrega === 'retiro'} onClick={() => set({ entrega: 'retiro' })} icon={Store} label="Retiro en local" />
            )}
          </div>

          {f.entrega === 'retiro' && settings?.showroom_address && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-2)', border: '1px solid var(--line)', marginBottom: 14 }}>
              <MapPin size={16} style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Dirección del showroom</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{settings.showroom_address}</div>
              </div>
            </div>
          )}

          {f.entrega === 'envio' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }} className="slogan-grid">
              <div style={{ gridColumn: '1 / -1' }}><Field label="Dirección *"><input className="input" value={f.direccion} onChange={(e) => set({ direccion: e.target.value })} /></Field></div>
              <Field label="Localidad"><input className="input" value={f.localidad} onChange={(e) => set({ localidad: e.target.value })} /></Field>
              <Field label="Provincia"><input className="input" value={f.provincia} onChange={(e) => set({ provincia: e.target.value })} /></Field>
              <Field label="Código postal"><input className="input" value={f.cp} onChange={(e) => set({ cp: e.target.value })} /></Field>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <Field label="Notas (opcional)"><textarea className="input" rows={2} value={f.notas} onChange={(e) => set({ notas: e.target.value })} placeholder="Entre calles, horarios, aclaraciones…" /></Field>
          </div>

          <h3 style={{ margin: '8px 0 12px' }}>Pago</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 10 }}>
            {PAYS.map((p) => {
              const active = f.paymentMethod === p.id
              return (
                <button type="button" key={p.id} onClick={() => set({ paymentMethod: p.id })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%',
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    background: active ? 'var(--blue-soft)' : 'var(--bg-2)',
                    border: `1px solid ${active ? 'var(--blue)' : 'var(--line)'}`,
                    color: 'var(--text)',
                  }}>
                  {p.icon ? (
                    <p.icon size={20} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                  ) : (
                    <CreditCardMP />
                  )}
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{p.label}</span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--faint)' }}>{p.desc}</span>
                  </span>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? 'var(--blue)' : 'var(--line-3)'}`, background: active ? 'var(--blue)' : 'transparent', flexShrink: 0 }} />
                </button>
              )
            })}
          </div>

          {f.paymentMethod === 'transferencia' && (
            <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12, background: 'var(--blue-soft)', border: '1px solid var(--blue)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
                <Landmark size={16} style={{ color: 'var(--blue)' }} /> Datos para transferir
              </div>
              {settings.alias || settings.cbu ? (
                <>
                  {settings.alias && <CopyRow label="Alias" value={settings.alias} onCopy={copy} />}
                  {settings.cbu && <CopyRow label="CBU" value={settings.cbu} onCopy={copy} />}
                  {settings.bank_holder && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>Titular: {settings.bank_holder}</div>}
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10 }}>
                    Transferí el total y, al confirmar, te abrimos WhatsApp para mandarnos el <b style={{ color: 'var(--text)' }}>comprobante</b>.
                  </p>
                </>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Cargá el alias/CBU en el panel admin (Contenido › Datos de la tienda) para que aparezca acá.
                </p>
              )}
            </div>
          )}
        </div>

        {/* resumen */}
        <div>
          <div className="admin-card" style={{ position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
            <h3 style={{ marginBottom: 14 }}>Tu pedido</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              {cart.map((i) => (
                <div key={i.key} style={{ display: 'flex', gap: 12 }}>
                  <img src={i.image} alt="" style={{ width: 52, height: 64, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-3)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{i.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--faint)' }}>
                      {i.qty}× {i.size ? `T${i.size} ` : ''}{i.color || ''}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>{money(i.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <Row label="Subtotal" value={money(subtotal)} />
              {discount > 0 && <Row label={`Descuento ${DISCOUNT_LABEL} OFF`} value={'-' + money(discount)} accent />}
              <Row label="Envío" value={freeShip ? 'Gratis' : 'A coordinar'} accent={freeShip} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span className="anton" style={{ fontSize: 28 }}>{money(grandTotal)}</span>
              </div>
            </div>
            <button type="submit" className="btn btn-blue btn-block" style={{ marginTop: 16 }} disabled={submitting}>
              {submitting
                ? 'Procesando…'
                : f.paymentMethod === 'mercadopago'
                  ? `Pagar ${money(grandTotal)} con Mercado Pago →`
                  : `Confirmar pedido · ${money(grandTotal)}`}
            </button>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 12, color: 'var(--faint)', marginTop: 12 }}>
              <ShieldCheck size={14} /> Tus datos están protegidos
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="field">{label}</label>
      {children}
    </div>
  )
}
function Row({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', color: 'var(--muted)' }}>
      <span>{label}</span>
      <span style={{ color: accent ? 'var(--green)' : 'var(--text)', fontWeight: 600 }}>{value}</span>
    </div>
  )
}
function CopyRow({ label, value, onCopy }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => onCopy(value)} style={{ flexShrink: 0 }}>
        <Copy size={14} /> Copiar
      </button>
    </div>
  )
}
function RadioCard({ active, onClick, icon: Icon, label }) {
  return (
    <button type="button" onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 10px',
        borderRadius: 12, cursor: 'pointer', color: 'var(--text)',
        background: active ? 'var(--blue-soft)' : 'var(--bg-2)',
        border: `1px solid ${active ? 'var(--blue)' : 'var(--line)'}`,
      }}>
      <Icon size={22} style={{ color: active ? 'var(--blue)' : 'var(--muted)' }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  )
}
function CreditCardMP() {
  return (
    <span style={{ width: 30, height: 20, borderRadius: 4, background: '#00b1ea', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ width: 12, height: 8, borderRadius: '50%', background: '#fff' }} />
    </span>
  )
}
