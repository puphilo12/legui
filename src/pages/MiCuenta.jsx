import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Package, Heart, User, LogOut, ChevronRight, ShoppingBag, MapPin,
  Clock, CheckCircle, Truck, AlertCircle, X, Eye, EyeOff, KeyRound,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { MOCK } from '../lib/supabase'
import { money } from '../utils/format'
import ProductCard from '../components/ProductCard'
import Logo from '../components/Logo'

const STATUS_STYLE = {
  Pendiente:  { color: 'var(--amber)', bg: '#92400e22', icon: Clock },
  Pagado:     { color: 'var(--blue)',  bg: 'var(--blue-soft)', icon: CheckCircle },
  Enviado:    { color: '#a78bfa',      bg: '#a78bfa22', icon: Truck },
  Entregado:  { color: 'var(--green)', bg: '#16a34a22', icon: CheckCircle },
  Cancelado:  { color: 'var(--red)',   bg: '#dc262622', icon: AlertCircle },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Pendiente
  const Icon = s.icon
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
      color: s.color, background: s.bg,
    }}>
      <Icon size={13} /> {status}
    </span>
  )
}

/* ===================== LOGIN para compradores ===================== */
function BuyerLogin() {
  const signIn = useStore((s) => s.signIn)
  const signUp = useStore((s) => s.signUp)
  const resetPassword = useStore((s) => s.resetPassword)
  const toast = useStore((s) => s.toast)
  // mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    if (mode === 'forgot') {
      setLoading(true)
      const res = await resetPassword(email.trim())
      setLoading(false)
      if (!res.ok) toast(res.error || 'Error al enviar el email', 'error')
      else setSent(true)
      return
    }

    if (!password.trim()) return
    setLoading(true)
    const fn = mode === 'login' ? signIn : signUp
    const res = await fn(email.trim(), password)
    setLoading(false)
    if (!res.ok) toast(res.error || 'Error de autenticación', 'error')
    else if (mode === 'register') toast('¡Cuenta creada! Revisá tu email para confirmar.', 'info')
  }

  const TITLES = {
    login: 'Iniciar sesión',
    register: 'Crear cuenta',
    forgot: 'Recuperar contraseña',
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Logo height={28} />
          <div style={{ marginTop: 16, fontSize: 22, fontWeight: 800 }}>Mi cuenta</div>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
            {mode === 'login' && 'Ingresá para ver tus pedidos y favoritos.'}
            {mode === 'register' && 'Creá tu cuenta LEGUI.'}
            {mode === 'forgot' && 'Te enviamos un link para restablecer tu contraseña.'}
          </p>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 26 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blue-soft)', color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <KeyRound size={24} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Email enviado</div>
              <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
                Revisá tu bandeja de entrada en <b style={{ color: 'var(--text)' }}>{email}</b> y hacé click en el link para crear una nueva contraseña.
              </p>
              <button type="button" className="link-btn" style={{ fontSize: 13 }} onClick={() => { setSent(false); setMode('login') }}>
                Volver al login
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="field">Email</label>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" autoComplete="email" />
              </div>
              {mode !== 'forgot' && (
                <div>
                  <label className="field">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      style={{ paddingRight: 42 }}
                    />
                    <button type="button" onClick={() => setShowPw((s) => !s)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <button className="btn btn-blue" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Cargando…' : TITLES[mode]}
              </button>
            </form>
          )}

          {!sent && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mode === 'login' && (
                <>
                  <span>
                    ¿No tenés cuenta?{' '}
                    <button type="button" className="link-btn" onClick={() => setMode('register')}>Crear cuenta gratis</button>
                  </span>
                  <button type="button" className="link-btn" style={{ fontSize: 12, color: 'var(--faint)' }} onClick={() => setMode('forgot')}>
                    Olvidé mi contraseña
                  </button>
                </>
              )}
              {mode === 'register' && (
                <button type="button" className="link-btn" onClick={() => setMode('login')}>Ya tengo cuenta</button>
              )}
              {mode === 'forgot' && (
                <button type="button" className="link-btn" onClick={() => setMode('login')}>← Volver al login</button>
              )}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--faint)' }}>
          Con tu cuenta guardás tus datos de envío y podés seguir el estado de tus pedidos.
        </p>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Link to="/tienda" className="muted" style={{ fontSize: 13 }}>← Seguir comprando</Link>
        </div>
      </div>
    </div>
  )
}

/* ===================== NUEVA CONTRASEÑA (desde link de email) ===================== */
function ResetPasswordForm() {
  const updatePassword = useStore((s) => s.updatePassword)
  const toast = useStore((s) => s.toast)
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast('La contraseña debe tener al menos 6 caracteres', 'info')
    if (password !== confirm) return toast('Las contraseñas no coinciden', 'info')
    setLoading(true)
    const res = await updatePassword(password)
    setLoading(false)
    if (!res.ok) toast(res.error || 'Error al actualizar la contraseña', 'error')
    else setDone(true)
  }

  if (done) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--blue-soft)', color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <CheckCircle size={30} />
          </div>
          <h2 className="anton" style={{ fontSize: 28, marginBottom: 10 }}>¡Contraseña actualizada!</h2>
          <p className="muted" style={{ marginBottom: 20 }}>Tu nueva contraseña fue guardada correctamente.</p>
          <button className="btn btn-blue" onClick={() => navigate('/mi-cuenta', { replace: true })}>
            Ir a mi cuenta
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Logo height={28} />
          <div style={{ marginTop: 16, fontSize: 22, fontWeight: 800 }}>Nueva contraseña</div>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>Elegí una contraseña nueva para tu cuenta.</p>
        </div>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 26 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="field">Nueva contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  style={{ paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowPw((s) => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="field">Repetir contraseña</label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
              />
            </div>
            <button className="btn btn-blue" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ===================== CUENTA PRINCIPAL ===================== */
export default function MiCuenta() {
  const user = useStore((s) => s.user)
  const isAdmin = useStore((s) => s.isAdmin)
  const authLoading = useStore((s) => s.authLoading)
  const signOut = useStore((s) => s.signOut)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState('pedidos')

  const isRecovery = searchParams.get('recovery') === '1'

  // Admins van al panel admin, no a mi cuenta
  useEffect(() => {
    if (!authLoading && isAdmin) navigate('/admin', { replace: true })
  }, [isAdmin, authLoading, navigate])

  // Flujo de reset: Supabase redirige con ?recovery=1 y maneja la sesión internamente
  if (!MOCK && isRecovery) return <ResetPasswordForm />

  if (!MOCK && authLoading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!MOCK && !user) return <BuyerLogin />

  const TABS = [
    { id: 'pedidos', label: 'Mis pedidos', icon: Package },
    { id: 'guardados', label: 'Guardados', icon: Heart },
    { id: 'perfil', label: 'Mis datos', icon: User },
  ]

  return (
    <div className="wrap section" style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <h1 className="anton" style={{ fontSize: 'clamp(28px,5vw,48px)', marginBottom: 4 }}>Mi cuenta</h1>
          <p className="muted" style={{ fontSize: 14 }}>{user?.email}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { signOut(); navigate('/') }}>
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--line)', marginBottom: 28, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px',
              background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.id ? 'var(--blue)' : 'transparent'}`,
              color: tab === t.id ? 'var(--text)' : 'var(--muted)', fontWeight: tab === t.id ? 700 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap', fontSize: 14, transition: 'color .15s',
            }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'pedidos' && <TabPedidos />}
      {tab === 'guardados' && <TabGuardados />}
      {tab === 'perfil' && <TabPerfil />}
    </div>
  )
}

/* ===================== MIS PEDIDOS ===================== */
function TabPedidos() {
  const buyerOrders = useStore((s) => s.buyerOrders)
  const [open, setOpen] = useState(null)

  if (MOCK) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <ShoppingBag size={40} style={{ color: 'var(--faint)', margin: '0 auto 14px' }} />
        <p className="muted">El historial de pedidos requiere cuenta activa.</p>
        <Link to="/tienda" className="btn btn-blue" style={{ marginTop: 16, display: 'inline-flex' }}>Ver productos</Link>
      </div>
    )
  }

  if (!buyerOrders.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <ShoppingBag size={40} style={{ color: 'var(--faint)', margin: '0 auto 14px' }} />
        <p className="muted" style={{ marginBottom: 16 }}>Todavía no tenés pedidos.</p>
        <Link to="/tienda" className="btn btn-blue">Ver productos</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {buyerOrders.map((o) => (
        <div key={o.id}>
          <button
            onClick={() => setOpen(open === o.id ? null : o.id)}
            style={{
              width: '100%', textAlign: 'left', background: 'var(--bg-2)',
              border: `1px solid ${open === o.id ? 'var(--blue)' : 'var(--line)'}`,
              borderRadius: open === o.id ? '14px 14px 0 0' : 14,
              padding: '14px 18px', cursor: 'pointer', color: 'var(--text)',
              display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                Pedido #{o.id.slice(-6)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 2 }}>
                {new Date(o.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <StatusBadge status={o.status} />
            <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap' }}>{money(o.total)}</div>
            <ChevronRight size={18} style={{ color: 'var(--faint)', transform: open === o.id ? 'rotate(90deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
          </button>

          {open === o.id && (
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--blue)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '16px 18px' }}>
              {/* Progreso del pedido */}
              <OrderProgress status={o.status} />

              {/* Productos */}
              <div style={{ marginTop: 16, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Productos</div>
                {(o.items || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                    <span>
                      {item.qty}× {item.name}
                      {item.size ? <span className="muted"> · T{item.size}</span> : ''}
                      {item.color ? <span className="muted"> · {item.color}</span> : ''}
                    </span>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{money(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Entrega */}
              {o.customer && (
                <div style={{ fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12 }}>
                  <MapPin size={14} style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }} />
                  <span>
                    {o.customer.entrega === 'retiro'
                      ? 'Retiro en local'
                      : `${o.customer.direccion || ''}${o.customer.localidad ? ', ' + o.customer.localidad : ''}${o.customer.provincia ? ', ' + o.customer.provincia : ''}`
                    }
                  </span>
                </div>
              )}

              <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total pagado</span>
                <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 16 }}>{money(o.total)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function OrderProgress({ status }) {
  const STEPS = ['Pendiente', 'Pagado', 'Enviado', 'Entregado']
  const isCancelled = status === 'Cancelado'
  const currentIdx = STEPS.indexOf(status)

  if (isCancelled) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: 'var(--red)', fontSize: 13 }}>
        <X size={16} /> Pedido cancelado
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 4 }}>
      {STEPS.map((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--blue)' : 'var(--bg-3)',
                border: `2px solid ${done ? 'var(--blue)' : 'var(--line-2)'}`,
                transition: 'all .3s',
              }}>
                {done ? <CheckCircle size={14} style={{ color: '#fff' }} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--faint)' }} />}
              </div>
              <span style={{ fontSize: 10, color: active ? 'var(--blue)' : 'var(--faint)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{step}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < currentIdx ? 'var(--blue)' : 'var(--line-2)', margin: '0 4px', marginBottom: 18, transition: 'background .3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ===================== GUARDADOS ===================== */
function TabGuardados() {
  const products = useStore((s) => s.products)
  const favorites = useStore((s) => s.favorites)
  const list = products.filter((p) => favorites.includes(p.id))

  if (!list.length) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Heart size={40} style={{ color: 'var(--faint)', margin: '0 auto 14px' }} />
        <p className="muted" style={{ marginBottom: 16 }}>No guardaste ningún producto todavía.</p>
        <Link to="/tienda" className="btn btn-blue">Explorar tienda</Link>
      </div>
    )
  }

  return (
    <>
      <p className="muted" style={{ marginBottom: 18, fontSize: 14 }}>{list.length} producto{list.length !== 1 ? 's' : ''} guardado{list.length !== 1 ? 's' : ''}</p>
      <div className="shop-grid">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </>
  )
}

/* ===================== PERFIL ===================== */
function TabPerfil() {
  const profile = useStore((s) => s.profile)
  const saveProfile = useStore((s) => s.saveProfile)
  const toast = useStore((s) => s.toast)
  const user = useStore((s) => s.user)

  const [f, setF] = useState({
    nombre: profile?.nombre || '',
    telefono: profile?.telefono || '',
    email: profile?.email || user?.email || '',
    direccion: profile?.direccion || '',
    localidad: profile?.localidad || '',
    provincia: profile?.provincia || '',
    cp: profile?.cp || '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await saveProfile(f)
    setSaving(false)
    toast('Datos guardados ✓')
  }

  if (MOCK) {
    return <p className="muted" style={{ padding: '20px 0' }}>Los datos de perfil requieren cuenta activa.</p>
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 600 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="slogan-grid">
        <Field label="Nombre y apellido">
          <input className="input" value={f.nombre} onChange={(e) => set('nombre', e.target.value)} />
        </Field>
        <Field label="Teléfono / WhatsApp">
          <input className="input" value={f.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </Field>
        <Field label="Email">
          <input type="email" className="input" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
      </div>

      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>Dirección de envío</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="slogan-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Dirección">
              <input className="input" value={f.direccion} onChange={(e) => set('direccion', e.target.value)} placeholder="Av. Rivadavia 1234, 3B" />
            </Field>
          </div>
          <Field label="Localidad">
            <input className="input" value={f.localidad} onChange={(e) => set('localidad', e.target.value)} />
          </Field>
          <Field label="Provincia">
            <input className="input" value={f.provincia} onChange={(e) => set('provincia', e.target.value)} />
          </Field>
          <Field label="Código postal">
            <input className="input" value={f.cp} onChange={(e) => set('cp', e.target.value)} />
          </Field>
        </div>
      </div>

      <button className="btn btn-blue" type="submit" disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar datos'}
      </button>
      <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>
        Estos datos se completan automáticamente cuando hacés un pedido.
      </p>
    </form>
  )
}

function Field({ label, children }) {
  return <div><label className="field">{label}</label>{children}</div>
}
