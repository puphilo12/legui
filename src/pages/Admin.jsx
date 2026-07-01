import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, Receipt, Wallet, Boxes,
  Image as ImageIcon, ArrowLeft, Plus, Trash2, Upload, RotateCcw,
  AlertTriangle, CreditCard, ChevronRight, ChevronDown, X, LogOut, Lock, Eye, EyeOff, Store, KeyRound, Star,
  Wrench, BookOpen, MapPin, Phone, Mail, MessageSquare, Truck,
} from 'lucide-react'
import { useStore, effPrice, SURCHARGE, PAYMENT_METHODS, variantStock } from '../store/useStore'
import { useSEO } from '../hooks/useSEO'
import { MOCK } from '../lib/supabase'
import { money } from '../utils/format'
import { uploadMedia } from '../utils/image'
import Logo from '../components/Logo'

const today = () => new Date().toISOString().slice(0, 10)
const monthOf = (iso) => (iso || '').slice(0, 7)
const thisMonth = () => new Date().toISOString().slice(0, 7)
const lowOf = (p) => Number(p.low_stock_threshold ?? 5)
const isCrit = (p) => (p.stock ?? 0) <= lowOf(p)

const EXP_CATS = ['Mercadería', 'Servicios', 'Alquiler', 'Sueldos', 'Marketing', 'Impuestos', 'Otros']

/* ===================== LOGIN ===================== */
function AdminLogin() {
  const signIn = useStore((s) => s.signIn)
  const signUp = useStore((s) => s.signUp)
  const resetPassword = useStore((s) => s.resetPassword)
  const toast = useStore((s) => s.toast)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // login | register | forgot
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
    if (!res.ok) {
      toast(res.error || 'Error al iniciar sesión', 'error')
    } else if (mode === 'register') {
      toast('Cuenta creada. Revisá tu email para confirmar.', 'info')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Logo height={30} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, color: 'var(--muted)', fontSize: 14 }}>
            <Lock size={14} /> Panel de administración
          </div>
        </div>

        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 16, padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blue-soft)', color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <KeyRound size={24} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Email enviado</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                Revisá <b style={{ color: 'var(--text)' }}>{email}</b> y seguí el link para crear una nueva contraseña.
              </p>
              <button type="button" className="link-btn" style={{ fontSize: 13 }} onClick={() => { setSent(false); setMode('login') }}>
                Volver al login
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="admin-label">Email</label>
                <input
                  className="admin-input"
                  type="email"
                  placeholder="admin@legui.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {mode !== 'forgot' && (
                <div>
                  <label className="admin-label">Contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="admin-input"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      style={{ paddingRight: 40 }}
                    />
                    <button type="button" onClick={() => setShowPw((s) => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}
              <button className="btn btn-blue btn-block" type="submit" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Cargando…' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Crear cuenta' : 'Enviar link de recuperación'}
              </button>
            </form>
          )}

          {!sent && (
            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mode === 'login' && (
                <>
                  <span>¿Primera vez? <button type="button" className="link-btn" onClick={() => setMode('register')}>Crear cuenta</button></span>
                  <button type="button" className="link-btn" style={{ fontSize: 12, color: 'var(--faint)' }} onClick={() => setMode('forgot')}>Olvidé mi contraseña</button>
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

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/" style={{ fontSize: 13, color: 'var(--muted)' }}>← Volver a la tienda</Link>
        </div>
      </div>
    </div>
  )
}

/* ===================== ADMIN PRINCIPAL ===================== */
export default function Admin() {
  const user = useStore((s) => s.user)
  const isAdmin = useStore((s) => s.isAdmin)
  const authLoading = useStore((s) => s.authLoading)
  const signOut = useStore((s) => s.signOut)
  const [tab, setTab] = useState('resumen')
  const products = useStore((s) => s.products)
  const critCount = products.filter(isCrit).length
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const toggleMaintenance = () => {
    if (!settings.maintenance_mode && !window.confirm('Esto apaga la tienda para todos los visitantes (vos vas a poder seguir entrando acá al admin). ¿Confirmás?')) return
    updateSettings({ maintenance_mode: !settings.maintenance_mode })
  }

  useSEO({ title: 'Admin', path: '/admin', noindex: true })

  // Auth gate
  if (!MOCK && authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }
  if (!MOCK && !user) return <AdminLogin />
  if (!MOCK && !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: 24 }}>
        <Lock size={40} style={{ color: 'var(--muted)' }} />
        <h2 className="anton" style={{ fontSize: 28 }}>No autorizado</h2>
        <p className="muted">Tu cuenta ({user?.email}) no tiene permisos de administrador.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={signOut}>Cerrar sesión</button>
          <Link to="/" className="btn btn-blue btn-sm">Ir a la tienda</Link>
        </div>
      </div>
    )
  }

  const TABS = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'ventas', label: 'Vender', icon: ShoppingCart },
    { id: 'pedidos', label: 'Pedidos', icon: Receipt },
    { id: 'cuentas', label: 'Cuenta corriente', icon: CreditCard },
    { id: 'gastos', label: 'Gastos', icon: Wallet },
    { id: 'stock', label: 'Stock', icon: Boxes, badge: critCount || null },
    { id: 'productos', label: 'Productos', icon: ImageIcon },
    { id: 'contenido', label: 'Contenido', icon: Store },
    { id: 'manual', label: 'Manual', icon: BookOpen },
  ]

  return (
    <div className="admin">
      <aside className="admin-aside">
        <div style={{ padding: '0 6px 18px' }}>
          <Logo height={24} />
        </div>
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
              <t.icon size={18} /> {t.label}
              {t.badge ? <span className="badge">{t.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
          {user && (
            <div style={{ fontSize: 11, color: 'var(--faint)', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          )}
          <button
            className="btn btn-sm btn-block"
            onClick={toggleMaintenance}
            style={{
              color: settings.maintenance_mode ? '#fff' : 'var(--muted)',
              background: settings.maintenance_mode ? 'var(--red)' : 'transparent',
              border: `1px solid ${settings.maintenance_mode ? 'var(--red)' : 'var(--line-2)'}`,
            }}
          >
            <Wrench size={14} /> {settings.maintenance_mode ? 'Mantenimiento: activado' : 'Página en mantenimiento'}
          </button>
          <Link to="/" className="btn btn-ghost btn-sm btn-block">
            <ArrowLeft size={14} /> Ver tienda
          </Link>
          {!MOCK && user && (
            <button className="btn btn-ghost btn-sm btn-block" onClick={signOut} style={{ color: 'var(--muted)' }}>
              <LogOut size={14} /> Cerrar sesión
            </button>
          )}
        </div>
      </aside>

      <main className="admin-main">
        {tab === 'resumen' && <TabResumen go={setTab} />}
        {tab === 'ventas' && <TabVentas />}
        {tab === 'pedidos' && <TabPedidos />}
        {tab === 'cuentas' && <TabCuentas />}
        {tab === 'gastos' && <TabGastos />}
        {tab === 'stock' && <TabStock />}
        {tab === 'productos' && <TabProductos />}
        {tab === 'contenido' && <TabContenido />}
        {tab === 'manual' && <TabManual />}
      </main>
    </div>
  )
}

/* ===================== RESUMEN ===================== */
function TabResumen({ go }) {
  const orders = useStore((s) => s.orders)
  const expenses = useStore((s) => s.expenses)
  const customers = useStore((s) => s.customers)
  const products = useStore((s) => s.products)

  const s = useMemo(() => {
    const t = today()
    const m = thisMonth()
    const paid = orders.filter((o) => o.status === 'Pagado')
    const sum = (arr) => arr.reduce((n, o) => n + (o.total || 0), 0)
    const profit = (arr) => arr.reduce((n, o) => n + (o.items || []).reduce((a, i) => a + ((i.price || 0) - (i.cost || 0)) * (i.qty || 1), 0), 0)
    const salesToday = sum(paid.filter((o) => (o.created_at || '').slice(0, 10) === t))
    const monthPaid = paid.filter((o) => monthOf(o.created_at) === m)
    const salesMonth = sum(monthPaid)
    const profitMonth = profit(monthPaid)
    const expMonth = expenses.filter((e) => monthOf(e.date) === m).reduce((n, e) => n + (e.amount || 0), 0)
    const ccTotal = customers.reduce((n, c) => n + (c.balance || 0), 0)
    const cobranzas = customers.reduce((n, c) => n + (c.history || []).filter((h) => h.type === 'pago' && monthOf(h.date) === m).reduce((a, h) => a + (h.amount || 0), 0), 0)
    return { salesToday, salesMonth, profitMonth, expMonth, ccTotal, cobranzas }
  }, [orders, expenses, customers])

  const crit = products.filter(isCrit)

  const cards = [
    ['Ventas hoy', money(s.salesToday)],
    ['Ventas del mes', money(s.salesMonth)],
    ['Ganancia del mes', money(s.profitMonth), 'Precio − costo de lo vendido'],
    ['Gastos del mes', '-' + money(s.expMonth), 'Cargados en Gastos'],
    ['Neto del mes', money(s.profitMonth - s.expMonth), 'Ganancia − gastos'],
    ['En cuenta corriente', money(s.ccTotal), 'Saldo que te deben'],
    ['Cobranzas del mes', money(s.cobranzas), 'Pagos de fiado recibidos'],
  ]

  return (
    <>
      <h1 className="anton admin-h">Resumen</h1>
      <p className="muted" style={{ marginBottom: 22 }}>
        {MOCK ? 'Modo demo — datos en este navegador.' : 'Conectado a Supabase.'}
      </p>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        {cards.map(([label, value, hint]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            {hint && <div className="stat-hint">{hint}</div>}
          </div>
        ))}
        <div className="stat-card" style={{ borderLeft: `4px solid ${crit.length ? 'var(--red)' : 'var(--green)'}`, cursor: 'pointer' }} onClick={() => go('stock')}>
          <div className="stat-label">Stock crítico</div>
          <div className="stat-value" style={{ color: crit.length ? 'var(--red)' : 'var(--green)' }}>{crit.length}</div>
          <div className="stat-hint">{crit.length ? 'Productos en o bajo el mínimo (ver)' : 'Todo OK'}</div>
        </div>
      </div>
      {crit.length > 0 && (
        <div className="admin-card" style={{ marginTop: 8 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={18} style={{ color: 'var(--red)' }} /> Reponer pronto
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead>
              <tbody>{crit.map((p) => (<tr key={p.id}><td>{p.name}</td><td className="crit">{p.stock ?? 0}</td><td>{lowOf(p)}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

/* ===================== VENTAS (POS) ===================== */
function ProductSearch({ products, value, onChange }) {
  const selected = products.find((p) => p.id === value)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const filtered = terms.length
    ? products.filter((p) => {
        const haystack = [p.name, p.category, ...(p.colors || []).map((c) => c.name)]
          .filter(Boolean).join(' ').toLowerCase()
        return terms.every((t) => haystack.includes(t))
      })
    : products

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const pick = (p) => { onChange(p.id); setQ(''); setOpen(false) }
  const clear = () => { onChange(''); setQ(''); setOpen(false) }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="admin-input"
          placeholder={selected ? selected.name : 'Buscar producto…'}
          value={q}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQ(e.target.value); setOpen(true) }}
          style={{ flex: 1, fontStyle: selected && !q ? 'italic' : 'normal', color: selected && !q ? 'var(--blue)' : undefined }}
        />
        {selected && (
          <button type="button" onClick={clear} style={{ background: 'none', border: 'none', color: 'var(--faint)', cursor: 'pointer', padding: '0 8px' }}>✕</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--bg-2)', border: '1px solid var(--line-2)', borderRadius: 8, maxHeight: 260, overflowY: 'auto', marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,.4)' }}>
          {filtered.map((p) => {
            const noStock = (p.stock ?? 0) <= 0
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => !noStock && pick(p)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--line)', textAlign: 'left', cursor: noStock ? 'not-allowed' : 'pointer', opacity: noStock ? 0.45 : 1, color: 'var(--text)' }}
              >
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                <span style={{ fontSize: 12, color: noStock ? 'var(--red)' : 'var(--muted)' }}>
                  {money(effPrice(p))} · {noStock ? 'sin stock' : `${p.stock} u.`}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TabVentas() {
  const products = useStore((s) => s.products)
  const orders = useStore((s) => s.orders)
  const registerSale = useStore((s) => s.registerSale)
  const toast = useStore((s) => s.toast)
  const empty = { productId: '', size: '', color: '', quantity: 1, paymentMethod: 'efectivo', customerName: '', customerDni: '' }
  const [f, setF] = useState(empty)
  const product = products.find((p) => p.id === f.productId)
  const surcharge = SURCHARGE[f.paymentMethod] || 0
  const unit = product ? effPrice(product) : 0
  const total = Math.round(unit * (Number(f.quantity) || 1) * (1 + surcharge))
  const isCC = f.paymentMethod === 'cuenta-corriente'
  const set = (patch) => setF((s) => ({ ...s, ...patch }))

  const submit = (e) => {
    e.preventDefault()
    if (!product) return toast('Elegí un producto', 'info')
    if ((product.sizes || []).length && !f.size) return toast('Elegí un talle', 'info')
    if (isCC && !f.customerDni.trim()) return toast('Para fiado cargá el DNI del cliente', 'info')
    const r = registerSale({ productId: f.productId, size: f.size || null, color: f.color || null, quantity: Number(f.quantity) || 1, paymentMethod: f.paymentMethod, customerName: f.customerName, customerDni: f.customerDni })
    if (r.ok) setF(empty)
  }

  const todaySales = orders.filter((o) => (o.created_at || '').slice(0, 10) === today())

  return (
    <>
      <h1 className="anton admin-h">Vender (mostrador)</h1>
      <p className="muted" style={{ marginBottom: 22 }}>Cargá una venta presencial. Descuenta stock y registra el ingreso.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 20, alignItems: 'start' }} className="pos-grid">
        <form className="admin-card" onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label className="admin-label">Producto</label>
            <ProductSearch
              products={products}
              value={f.productId}
              onChange={(id) => set({ productId: id, size: '', color: '' })}
            />
          </div>
          {product && (product.colors || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label className="admin-label">Color</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {product.colors.map((c) => (<button type="button" key={c.name} className={`swatch${f.color === c.name ? ' on' : ''}`} style={{ background: c.hex }} title={c.name} onClick={() => set({ color: c.name, size: '' })} />))}
              </div>
            </div>
          )}
          {product && (product.sizes || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label className="admin-label">Talle</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes.map((sz) => {
                  const sizeStock = variantStock(product, f.color, sz)
                  const noSzStock = sizeStock !== null && sizeStock <= 0
                  return (
                    <button
                      type="button" key={sz}
                      className={`size${f.size === sz ? ' on' : ''}`}
                      onClick={() => !noSzStock && set({ size: sz })}
                      disabled={noSzStock}
                      style={{ opacity: noSzStock ? 0.4 : 1, position: 'relative' }}
                      title={sizeStock !== null ? `${sizeStock} u.` : undefined}
                    >
                      {sz}
                      {sizeStock !== null && <span style={{ display: 'block', fontSize: 9, color: noSzStock ? 'var(--red)' : 'var(--faint)', lineHeight: 1 }}>{sizeStock}u</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 120 }}>
              <label className="admin-label">Cantidad</label>
              <input type="number" min="1" className="admin-input" value={f.quantity} onChange={(e) => set({ quantity: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="admin-label">Medio de pago</label>
              <select className="admin-input" value={f.paymentMethod} onChange={(e) => set({ paymentMethod: e.target.value })}>
                {PAYMENT_METHODS.map((m) => (<option key={m.id} value={m.id}>{m.icon} {m.label}{SURCHARGE[m.id] ? ` (+${Math.round(SURCHARGE[m.id] * 100)}%)` : ''}</option>))}
              </select>
            </div>
          </div>
          {isCC && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label className="admin-label">Cliente</label>
                <input className="admin-input" placeholder="Nombre" value={f.customerName} onChange={(e) => set({ customerName: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="admin-label">DNI</label>
                <input className="admin-input" placeholder="DNI" value={f.customerDni} onChange={(e) => set({ customerDni: e.target.value })} />
              </div>
            </div>
          )}
          <button className="btn btn-blue btn-block" type="submit" style={{ marginTop: 6 }}>
            Registrar venta {product ? `· ${money(total)}` : ''}
          </button>
        </form>
        <div className="admin-card">
          <div className="stat-label">A cobrar</div>
          <div className="anton" style={{ fontSize: 40, color: 'var(--blue)', margin: '6px 0 4px' }}>{money(total)}</div>
          {surcharge > 0 && <div className="stat-hint">Incluye recargo +{Math.round(surcharge * 100)}% ({money(total - unit * (Number(f.quantity) || 1))})</div>}
          <div style={{ borderTop: '1px solid var(--line)', margin: '16px 0', paddingTop: 14 }}>
            <div className="stat-label" style={{ marginBottom: 8 }}>Ventas de hoy ({todaySales.length})</div>
            {todaySales.slice(0, 6).map((o) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', color: 'var(--muted)' }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.items?.[0]?.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{money(o.total)}</span>
              </div>
            ))}
            {!todaySales.length && <div className="stat-hint">Todavía no hay ventas hoy.</div>}
          </div>
        </div>
      </div>
    </>
  )
}

/* ===================== PEDIDOS ===================== */
function TabPedidos() {
  const orders = useStore((s) => s.orders)
  const updateOrderStatus = useStore((s) => s.updateOrderStatus)
  const deleteOrder = useStore((s) => s.deleteOrder)
  const STATES = ['Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado']
  const pm = (id) => PAYMENT_METHODS.find((m) => m.id === id)?.label || id
  const [openId, setOpenId] = useState(null)

  return (
    <>
      <h1 className="anton admin-h">Pedidos</h1>
      <p className="muted" style={{ marginBottom: 22 }}>Ventas de mostrador y pedidos. {orders.length} en total. Tocá un pedido para ver los datos de envío.</p>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {orders.length === 0 ? (
          <p className="muted">Todavía no hay pedidos. Cargá una venta en "Vender".</p>
        ) : (
          <table className="admin-table">
            <thead><tr><th></th><th>Fecha</th><th>Cliente</th><th>Detalle</th><th>Pago</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {orders.map((o) => {
                const open = openId === o.id
                const c = o.customer || {}
                return (
                  <Fragment key={o.id}>
                    <tr onClick={() => setOpenId(open ? null : o.id)} style={{ cursor: 'pointer' }}>
                      <td style={{ width: 24, color: 'var(--faint)' }}>{open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                      <td>{c.nombre || '—'}</td>
                      <td style={{ maxWidth: 240 }}>
                        {(o.items || []).map((i, idx) => (<div key={idx} style={{ fontSize: 13 }}>{i.qty}× {i.name}{i.size ? ` · T${i.size}` : ''}{i.color ? ` · ${i.color}` : ''}</div>))}
                      </td>
                      <td>{pm(o.payment_method || o.paymentMethod)}</td>
                      <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{money(o.total)}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select className="admin-input" style={{ padding: '6px 8px', width: 'auto' }} value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => deleteOrder(o.id)} aria-label="Eliminar" style={{ background: 'none', border: 'none', color: 'var(--red)' }}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr>
                        <td colSpan={8} style={{ background: 'var(--bg-2)', padding: '16px 18px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, fontSize: 13 }}>
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Contacto</div>
                              {c.telefono && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                  <Phone size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                                  <a href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: 'var(--text)' }}>{c.telefono}</a>
                                </div>
                              )}
                              {c.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Mail size={14} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                                  <span>{c.email}</span>
                                </div>
                              )}
                              {!c.telefono && !c.email && <span className="muted">Sin datos de contacto.</span>}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Entrega</div>
                              {c.entrega === 'retiro' ? (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                  <MapPin size={14} style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }} />
                                  <span>Retira en el local</span>
                                </div>
                              ) : (c.direccion || c.localidad || c.provincia || c.cp) ? (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                  <Truck size={14} style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }} />
                                  <div>
                                    {c.direccion && <div>{c.direccion}</div>}
                                    <div className="muted">{[c.localidad, c.provincia].filter(Boolean).join(', ')}{c.cp ? ` (CP ${c.cp})` : ''}</div>
                                  </div>
                                </div>
                              ) : (
                                <span className="muted">No se cargó dirección de envío.</span>
                              )}
                            </div>
                            {c.notas && (
                              <div>
                                <div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Notas</div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                  <MessageSquare size={14} style={{ color: 'var(--blue)', marginTop: 2, flexShrink: 0 }} />
                                  <span>{c.notas}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* ===================== CUENTA CORRIENTE ===================== */
function TabCuentas() {
  const customers = useStore((s) => s.customers)
  const registerPayment = useStore((s) => s.registerPayment)
  const deleteCustomer = useStore((s) => s.deleteCustomer)
  const addCustomer = useStore((s) => s.addCustomer)
  const [nuevo, setNuevo] = useState({ dni: '', nombre: '' })
  const totalDebt = customers.reduce((n, c) => n + (c.balance || 0), 0)

  const cobrar = (c) => {
    const val = window.prompt(`Cobrar a ${c.nombre} (debe ${money(c.balance)}). ¿Monto?`, c.balance)
    const amount = Number(val)
    if (amount > 0) registerPayment(c.dni, amount)
  }

  return (
    <>
      <h1 className="anton admin-h">Cuenta corriente</h1>
      <p className="muted" style={{ marginBottom: 18 }}>Clientes con fiado. Total adeudado: <b style={{ color: 'var(--text)' }}>{money(totalDebt)}</b></p>
      <form className="admin-card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }} onSubmit={(e) => { e.preventDefault(); if (nuevo.dni.trim()) { addCustomer(nuevo); setNuevo({ dni: '', nombre: '' }) } }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label className="admin-label">Nombre</label>
          <input className="admin-input" value={nuevo.nombre} onChange={(e) => setNuevo((s) => ({ ...s, nombre: e.target.value }))} />
        </div>
        <div style={{ width: 160 }}>
          <label className="admin-label">DNI</label>
          <input className="admin-input" value={nuevo.dni} onChange={(e) => setNuevo((s) => ({ ...s, dni: e.target.value }))} />
        </div>
        <button className="btn btn-ghost btn-sm" type="submit"><Plus size={14} /> Agregar cliente</button>
      </form>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {customers.length === 0 ? (
          <p className="muted">Sin clientes en cuenta corriente.</p>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Cliente</th><th>DNI</th><th>Saldo</th><th>Movimientos</th><th></th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.dni}>
                  <td>{c.nombre}</td>
                  <td>{c.dni}</td>
                  <td style={{ fontWeight: 700, color: c.balance > 0 ? 'var(--amber)' : 'var(--green)' }}>{money(c.balance || 0)}</td>
                  <td style={{ fontSize: 12, color: 'var(--faint)' }}>{(c.history || []).length} mov.</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-blue btn-sm" disabled={!(c.balance > 0)} onClick={() => cobrar(c)} style={{ marginRight: 6 }}>Cobrar</button>
                    <button onClick={() => deleteCustomer(c.dni)} aria-label="Eliminar" style={{ background: 'none', border: 'none', color: 'var(--red)' }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* ===================== GASTOS ===================== */
function TabGastos() {
  const expenses = useStore((s) => s.expenses)
  const addExpense = useStore((s) => s.addExpense)
  const deleteExpense = useStore((s) => s.deleteExpense)
  const [f, setF] = useState({ description: '', amount: '', category: 'Servicios', date: today() })
  const monthTotal = expenses.filter((e) => monthOf(e.date) === thisMonth()).reduce((n, e) => n + (e.amount || 0), 0)

  const submit = (e) => {
    e.preventDefault()
    if (!f.description.trim() || !Number(f.amount)) return
    addExpense(f)
    setF({ description: '', amount: '', category: f.category, date: today() })
  }

  return (
    <>
      <h1 className="anton admin-h">Gastos</h1>
      <p className="muted" style={{ marginBottom: 18 }}>Gastos del mes: <b style={{ color: 'var(--text)' }}>{money(monthTotal)}</b></p>
      <form className="admin-card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }} onSubmit={submit}>
        <div style={{ flex: 2, minWidth: 160 }}>
          <label className="admin-label">Descripción</label>
          <input className="admin-input" value={f.description} onChange={(e) => setF((s) => ({ ...s, description: e.target.value }))} placeholder="Alquiler, luz, proveedor…" />
        </div>
        <div style={{ width: 130 }}>
          <label className="admin-label">Monto</label>
          <input type="number" className="admin-input" value={f.amount} onChange={(e) => setF((s) => ({ ...s, amount: e.target.value }))} />
        </div>
        <div style={{ width: 150 }}>
          <label className="admin-label">Categoría</label>
          <select className="admin-input" value={f.category} onChange={(e) => setF((s) => ({ ...s, category: e.target.value }))}>
            {EXP_CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ width: 150 }}>
          <label className="admin-label">Fecha</label>
          <input type="date" className="admin-input" value={f.date} onChange={(e) => setF((s) => ({ ...s, date: e.target.value }))} />
        </div>
        <button className="btn btn-blue btn-sm" type="submit"><Plus size={14} /> Cargar</button>
      </form>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {expenses.length === 0 ? (
          <p className="muted">Sin gastos cargados.</p>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{e.date}</td>
                  <td>{e.description}</td>
                  <td>{e.category}</td>
                  <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>-{money(e.amount)}</td>
                  <td><button onClick={() => deleteExpense(e.id)} aria-label="Eliminar" style={{ background: 'none', border: 'none', color: 'var(--red)' }}><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* ===================== STOCK ===================== */
function TabStock() {
  const products = useStore((s) => s.products)
  const updateProduct = useStore((s) => s.updateProduct)
  const restockProduct = useStore((s) => s.restockProduct)
  const movements = useStore((s) => s.stockMovements)
  const [r, setR] = useState({ productId: '', units: '', unitCost: '', kind: 'reposicion' })

  const submit = (e) => {
    e.preventDefault()
    if (!r.productId || !Number(r.units)) return
    restockProduct({ productId: r.productId, units: Number(r.units), unitCost: Number(r.unitCost) || 0, kind: r.kind })
    setR({ productId: '', units: '', unitCost: '', kind: 'reposicion' })
  }

  return (
    <>
      <h1 className="anton admin-h">Stock</h1>
      <p className="muted" style={{ marginBottom: 18 }}>Controlá stock, mínimos y reposiciones.</p>
      <form className="admin-card" style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }} onSubmit={submit}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label className="admin-label">Reponer producto</label>
          <select className="admin-input" value={r.productId} onChange={(e) => setR((s) => ({ ...s, productId: e.target.value }))}>
            <option value="">Elegí…</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.stock ?? 0} u.)</option>)}
          </select>
        </div>
        <div style={{ width: 110 }}>
          <label className="admin-label">Unidades</label>
          <input type="number" className="admin-input" value={r.units} onChange={(e) => setR((s) => ({ ...s, units: e.target.value }))} />
        </div>
        <div style={{ width: 130 }}>
          <label className="admin-label">Costo unitario</label>
          <input type="number" className="admin-input" value={r.unitCost} onChange={(e) => setR((s) => ({ ...s, unitCost: e.target.value }))} />
        </div>
        <div style={{ width: 140 }}>
          <label className="admin-label">Tipo</label>
          <select className="admin-input" value={r.kind} onChange={(e) => setR((s) => ({ ...s, kind: e.target.value }))}>
            <option value="reposicion">Reposición</option>
            <option value="carga_inicial">Carga inicial</option>
            <option value="ajuste">Ajuste</option>
          </select>
        </div>
        <button className="btn btn-blue btn-sm" type="submit"><Plus size={14} /> Sumar stock</button>
      </form>
      <div className="admin-card" style={{ overflowX: 'auto', marginBottom: 16 }}>
        <table className="admin-table">
          <thead><tr><th>Producto</th><th>Stock</th><th>Mínimo</th><th>Costo u.</th><th>Estado</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className={isCrit(p) ? 'crit' : ''} style={{ width: 90 }}>
                  <input type="number" className="admin-input" style={{ padding: '6px 8px' }} value={p.stock ?? 0} onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) || 0, sold_out: (Number(e.target.value) || 0) <= 0 })} />
                </td>
                <td style={{ width: 80 }}>
                  <input type="number" className="admin-input" style={{ padding: '6px 8px' }} value={p.low_stock_threshold ?? 5} onChange={(e) => updateProduct(p.id, { low_stock_threshold: Number(e.target.value) || 0 })} />
                </td>
                <td style={{ width: 110 }}>
                  <input type="number" className="admin-input" style={{ padding: '6px 8px' }} value={p.cost ?? 0} onChange={(e) => updateProduct(p.id, { cost: Number(e.target.value) || 0 })} />
                </td>
                <td>{isCrit(p) ? <span className="crit">Crítico</span> : <span style={{ color: 'var(--green)' }}>OK</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 style={{ marginBottom: 10 }}>Movimientos recientes</h3>
      <div className="admin-card" style={{ overflowX: 'auto' }}>
        {movements.length === 0 ? <p className="muted">Sin movimientos.</p> : (
          <table className="admin-table">
            <thead><tr><th>Fecha</th><th>Producto</th><th>Unid.</th><th>Costo u.</th><th>Total</th><th>Tipo</th></tr></thead>
            <tbody>
              {movements.slice(0, 30).map((m) => (
                <tr key={m.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{new Date(m.created_at).toLocaleDateString('es-AR')}</td>
                  <td>{m.product_name}</td>
                  <td>+{m.units}</td>
                  <td>{money(m.unit_cost)}</td>
                  <td style={{ fontWeight: 700 }}>{money(m.total_cost)}</td>
                  <td>{m.kind}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

/* ===================== PRODUCTOS (listado + editor) ===================== */
function TabProductos() {
  const products = useStore((s) => s.products)
  const updateProduct = useStore((s) => s.updateProduct)
  const addProduct = useStore((s) => s.addProduct)
  const saveDraftProduct = useStore((s) => s.saveDraftProduct)
  const deleteProduct = useStore((s) => s.deleteProduct)
  const resetProducts = useStore((s) => s.resetProducts)
  const [editingId, setEditingId] = useState(null)
  const editing = products.find((p) => p.id === editingId)

  const onNew = async () => {
    const id = await addProduct()
    if (id) setEditingId(id)
  }

  // Si lo que se está cerrando es un borrador recién creado, recién ahora se
  // confirma en Supabase — así "Nuevo" no crea el producto hasta que se guarda.
  const closeEditor = () => {
    if (editing?._draft) saveDraftProduct(editing.id)
    setEditingId(null)
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <h1 className="anton admin-h" style={{ marginBottom: 0 }}>Productos</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          {MOCK && (
            <button className="btn btn-ghost btn-sm" onClick={resetProducts}><RotateCcw size={14} /> Resetear</button>
          )}
          <button className="btn btn-blue btn-sm" onClick={onNew}><Plus size={14} /> Nuevo</button>
        </div>
      </div>
      <p className="muted" style={{ marginBottom: 14, fontSize: 13 }}>{products.length} productos · tocá uno para editarlo.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {products.map((p) => (<ProductRow key={p.id} p={p} onClick={() => setEditingId(p.id)} />))}
      </div>
      {editing && (
        <ProductEditorDrawer
          product={editing}
          onClose={closeEditor}
          updateProduct={updateProduct}
          onDelete={() => { deleteProduct(editing.id); setEditingId(null) }}
        />
      )}
    </>
  )
}

function ProductRow({ p, onClick }) {
  const off = p.discount_price && p.discount_price < p.price
  return (
    <button className="prod-row" onClick={onClick}>
      <img src={p.image} alt="" style={{ width: 44, height: 54, objectFit: 'cover', borderRadius: 8, background: 'var(--bg)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
        <div style={{ fontSize: 12, color: 'var(--faint)' }}>{p.category}{p.sold_out && ' · Agotado'}{p.featured && ' · ★ Destacado'}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{money(effPrice(p))}</div>
        {off && <div style={{ fontSize: 11, color: 'var(--faint)', textDecoration: 'line-through' }}>{money(p.price)}</div>}
      </div>
      <div style={{ width: 58, textAlign: 'right', fontSize: 13, flexShrink: 0 }} className={isCrit(p) ? 'crit' : 'muted'}>{p.stock ?? 0} u.</div>
      <ChevronRight size={18} style={{ color: 'var(--faint)', flexShrink: 0 }} />
    </button>
  )
}

function ProductEditorDrawer({ product: p, onClose, updateProduct, onDelete }) {
  const CATS = ['Zapatillas', 'Ropa', 'Accesorios']
  useEffect(() => {
    document.body.classList.add('body-lock')
    return () => document.body.classList.remove('body-lock')
  }, [])

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer" style={{ transform: 'translateX(0)' }} role="dialog" aria-label="Editar producto">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
          <div className="anton" style={{ fontSize: 20 }}>Editar producto</div>
          <button className="icon-btn" aria-label="Cerrar" onClick={onClose} style={{ border: 'none' }}><X size={22} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }} className="no-bar">
          <label className="admin-label">Nombre</label>
          <input className="admin-input" style={{ fontWeight: 700, marginBottom: 12 }} value={p.name} onChange={(e) => updateProduct(p.id, { name: e.target.value })} />

          <label className="admin-label">Categoría</label>
          <select className="admin-input" style={{ marginBottom: 12 }} value={p.category} onChange={(e) => updateProduct(p.id, { category: e.target.value })}>
            {[...new Set([...CATS, p.category])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Mini label="Precio"><input type="number" className="admin-input" value={p.price} onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) || 0 })} /></Mini>
            <Mini label="Oferta"><input type="number" className="admin-input" placeholder="—" value={p.discount_price ?? ''} onChange={(e) => updateProduct(p.id, { discount_price: e.target.value ? Number(e.target.value) : null, is_offer: !!e.target.value })} /></Mini>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Mini label="Stock"><input type="number" className="admin-input" value={p.stock ?? 0} onChange={(e) => updateProduct(p.id, { stock: Number(e.target.value) || 0, sold_out: (Number(e.target.value) || 0) <= 0 })} /></Mini>
            <Mini label="Costo"><input type="number" className="admin-input" value={p.cost ?? 0} onChange={(e) => updateProduct(p.id, { cost: Number(e.target.value) || 0 })} /></Mini>
            <Mini label="Mínimo"><input type="number" className="admin-input" value={p.low_stock_threshold ?? 5} onChange={(e) => updateProduct(p.id, { low_stock_threshold: Number(e.target.value) || 0 })} /></Mini>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="admin-label">Etiqueta</label>
            <input className="admin-input" value={p.tag || ''} onChange={(e) => updateProduct(p.id, { tag: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="admin-label">Talles (separados por coma)</label>
            <SizesInput product={p} updateProduct={updateProduct} />
          </div>
          {(p.sizes || []).length > 0 && (
            <StockMatrixEditor product={p} updateProduct={updateProduct} />
          )}
          <div style={{ marginBottom: 12 }}>
            <label className="admin-label">Descripción</label>
            <textarea className="admin-input" rows={3} value={p.description || ''} onChange={(e) => updateProduct(p.id, { description: e.target.value })} />
          </div>

          <label className="admin-label">Imagen principal</label>
          <ImageInput compact folder="products" value={p.image} onChange={(v) => updateProduct(p.id, { image: v, images: [v, ...((p.images || []).slice(1))] })} />

          <ColorsEditor product={p} updateProduct={updateProduct} />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
            <TogglePill on={p.sold_out} onClick={() => updateProduct(p.id, { sold_out: !p.sold_out })}>{p.sold_out ? 'Agotado' : 'Disponible'}</TogglePill>
            <TogglePill on={p.featured} onClick={() => updateProduct(p.id, { featured: !p.featured })}>Destacado</TogglePill>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: '1px solid var(--line)' }}>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--line-2)' }} onClick={onDelete}><Trash2 size={14} /> Eliminar</button>
          <button className="btn btn-blue btn-sm" style={{ flex: 1 }} onClick={onClose}>Listo</button>
        </div>
      </aside>
    </>
  )
}

// Texto local: si derivamos el value directo de (sizes||[]).join(', '), la coma
// que el usuario tipea desaparece al instante (split+filter la descarta antes de
// que termine de escribir el talle siguiente). Por eso el input vive aparte y
// solo se parsea a array al cambiar.
function SizesInput({ product: p, updateProduct }) {
  const [raw, setRaw] = useState((p.sizes || []).join(', '))

  const onChange = (e) => {
    const val = e.target.value
    setRaw(val)
    const sizes = val.split(',').map((x) => x.trim()).filter(Boolean)
    const colorKeys = (p.colors || []).length ? p.colors.map((c) => c.name) : ['']
    const stock_matrix = {}
    colorKeys.forEach((ck) => {
      const prevBucket = (p.stock_matrix || {})[ck] || {}
      const bucket = {}
      sizes.forEach((sz) => { bucket[sz] = prevBucket[sz] ?? 0 })
      stock_matrix[ck] = bucket
    })
    updateProduct(p.id, { sizes, stock_matrix })
  }

  return <input className="admin-input" value={raw} onChange={onChange} />
}

/* ===================== MANUAL ===================== */
function ManualSection({ title, children }) {
  return (
    <div className="admin-card" style={{ marginBottom: 16 }}>
      <h3 style={{ marginBottom: 10 }}>{title}</h3>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>{children}</div>
    </div>
  )
}

function TabManual() {
  return (
    <>
      <h1 className="anton admin-h">Manual</h1>
      <p className="muted" style={{ marginBottom: 22, fontSize: 13 }}>
        Guía rápida del panel — y qué hace falta cambiar si en el futuro reusás esta misma plataforma para otra tienda.
      </p>

      <ManualSection title="📊 Resumen">
        Vista general: ventas del día/mes, ganancia estimada, productos con stock crítico y accesos rápidos a las
        demás secciones.
      </ManualSection>

      <ManualSection title="🛒 Vender (mostrador)">
        Para cargar una venta presencial (en el local, no por la web). Buscás el producto, elegís color y talle
        (si tiene), cantidad y medio de pago. Descuenta el stock de esa combinación exacta automáticamente y
        registra el ingreso. Si el pago es "Cuenta corriente", queda anotado como fiado en esa sección.
      </ManualSection>

      <ManualSection title="🧾 Pedidos">
        Los pedidos hechos desde la tienda online (checkout). Acá cambiás el estado (Pendiente → Pagado → Enviado →
        Entregado) a medida que avanza cada uno. Si el pago fue por Mercado Pago, el estado se actualiza solo cuando
        MP confirma el cobro.
      </ManualSection>

      <ManualSection title="💳 Cuenta corriente">
        Clientes que compran "fiado". Acá ves cuánto debe cada uno y registrás los pagos que van haciendo.
      </ManualSection>

      <ManualSection title="💸 Gastos">
        Carga manual de gastos del negocio (mercadería, alquiler, sueldos, etc.) para que el Resumen calcule la
        ganancia real, no solo lo que entra.
      </ManualSection>

      <ManualSection title="📦 Stock">
        Listado completo de stock por producto, con alerta cuando un producto está por debajo del mínimo que le
        configuraste (campo "Mínimo" en el editor del producto).
      </ManualSection>

      <ManualSection title="🖼️ Productos">
        Acá se carga el catálogo. Por cada producto:
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li><b>Talles</b>: separados por coma (ej: "38, 39, 40, 41, 42").</li>
          <li><b>Colores</b>: cada uno con su nombre, su color (para el swatch) y hasta 4 fotos propias. La ⭐
            marca cuál color se muestra primero en la tienda y en la foto de portada del producto en la grilla.</li>
          <li><b>Stock por color y talle</b>: una vez que cargaste talles (y colores, si aplica), aparece una
            tabla para poner la cantidad exacta de cada combinación — ej. Negra T42: 10, Azul T42: 5. El stock
            total del producto se calcula solo, sumando todo.</li>
        </ul>
        "Nuevo" crea el producto en borrador: no se guarda en la base hasta que cerrás el editor (botón "Listo",
        la X, o tocando afuera). Si tocás "Eliminar" antes de cerrar, no queda nada cargado.
      </ManualSection>

      <ManualSection title="🎨 Contenido">
        Datos generales de la tienda: marca, WhatsApp, redes sociales, envío gratis desde cuánto, datos bancarios
        para transferencia, colecciones del home y lookbook. Hay que tocar "Guardar cambios" para que se aplique.
      </ManualSection>

      <ManualSection title="🔧 Página en mantenimiento">
        El botón del costado izquierdo apaga la tienda para todos los visitantes y muestra una pantalla simple de
        "Volvemos enseguida" con tu WhatsApp/Instagram. Vos seguís pudiendo entrar a <code>/admin</code> normalmente
        mientras está activo, para poder desactivarlo cuando quieras.
      </ManualSection>

      <ManualSection title="♻️ Reutilizar esta plataforma para otra tienda">
        La lógica (carrito, stock por variante, checkout, Mercado Pago, panel admin) es genérica — lo que cambia
        por cliente es esto:
        <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li><b>Supabase</b>: crear un proyecto nuevo y correr <code>supabase/schema.sql</code> ahí (tablas, RLS,
            todo incluido).</li>
          <li><b>Variables de entorno</b> (en Vercel, no en el código): <code>VITE_SUPABASE_URL</code>,{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, <code>VITE_STORE_ID</code>, <code>VITE_MP_PUBLIC_KEY</code>,{' '}
            <code>MP_ACCESS_TOKEN</code>, <code>SUPABASE_SERVICE_ROLE_KEY</code>, <code>SUPABASE_URL</code>,{' '}
            <code>APP_URL</code>.</li>
          <li><b>Marca</b>: reemplazar <code>/public/logo.png</code>, <code>favicon.png</code> y <code>og.jpg</code>,
            y el nombre "LEGUI" donde aparece fijo en el código (<code>index.html</code>, el footer, el hook de
            SEO). El color principal (<code>--blue</code>) y el resto de la paleta se cambian en{' '}
            <code>src/index.css</code>.</li>
          <li><b>Admins</b>: se agregan a mano en la tabla <code>admin_roles</code> de Supabase (por email) — no
            hay una pantalla para esto todavía, se carga directo en la base.</li>
          <li><b>Dominio</b>: conectarlo en Vercel y actualizar <code>APP_URL</code> y el dominio hardcodeado en{' '}
            <code>src/hooks/useSEO.js</code> y <code>api/sitemap.js</code>.</li>
        </ol>
      </ManualSection>
    </>
  )
}

/* ===================== CONTENIDO ===================== */
function TabContenido() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const collections = useStore((s) => s.collections)
  const addCollection = useStore((s) => s.addCollection)
  const updateCollection = useStore((s) => s.updateCollection)
  const deleteCollection = useStore((s) => s.deleteCollection)
  const lookbook = useStore((s) => s.lookbook)
  const addLookbook = useStore((s) => s.addLookbook)
  const updateLookbook = useStore((s) => s.updateLookbook)
  const deleteLookbook = useStore((s) => s.deleteLookbook)

  return (
    <>
      <h1 className="anton admin-h">Contenido</h1>
      <p className="muted" style={{ marginBottom: 22 }}>Tienda, redes, drops, portadas, colecciones y lookbook.</p>

      <SettingsForm />

      <h3 style={{ marginBottom: 12 }}>Portadas</h3>
      <div className="admin-card" style={{ marginBottom: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18 }}>
          <div>
            <label className="admin-label">Imagen principal (hero)</label>
            <ImageInput folder="portadas" quality={1.0} value={settings.hero_image} onChange={(v) => updateSettings({ hero_image: v })} ratio="4/5" />
          </div>
          <div>
            <label className="admin-label">Banner / portada secundaria</label>
            <ImageInput folder="portadas" quality={1.0} value={settings.banner_url} onChange={(v) => updateSettings({ banner_url: v })} ratio="16/9" />
          </div>
        </div>
      </div>

      <DropsManager />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Colecciones</h3>
        <button className="btn btn-ghost btn-sm" onClick={addCollection}><Plus size={14} /> Agregar</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16, marginBottom: 24 }}>
        {collections.map((c) => (
          <div className="admin-card" key={c.id}>
            <ImageInput folder="colecciones" quality={1.0} value={c.image} onChange={(v) => updateCollection(c.id, { image: v })} ratio="4/3" />
            <div style={{ marginTop: 10 }}>
              <Field label="Título"><input className="admin-input" value={c.title} onChange={(e) => updateCollection(c.id, { title: e.target.value })} /></Field>
            </div>
            <div style={{ marginTop: 8 }}>
              <Field label="Subtítulo"><input className="admin-input" value={c.subtitle || ''} onChange={(e) => updateCollection(c.id, { subtitle: e.target.value })} /></Field>
            </div>
            <div style={{ marginTop: 8 }}>
              <label className="admin-label">Destino al tocar</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                {[['Tienda', '/tienda'], ['Zapatillas', '/tienda?cat=Zapatillas'], ['Ropa', '/tienda?cat=Ropa'], ['Accesorios', '/tienda?cat=Accesorios']].map(([lbl, val]) => (
                  <button key={lbl} type="button" className={`chip${(c.link || '') === val ? ' active' : ''}`} style={{ padding: '6px 10px' }} onClick={() => updateCollection(c.id, { link: val })}>{lbl}</button>
                ))}
              </div>
              <input className="admin-input" placeholder="/tienda?cat=… o https://…" value={c.link || ''} onChange={(e) => updateCollection(c.id, { link: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
              <TogglePill on={c.big} onClick={() => updateCollection(c.id, { big: !c.big })}>Bloque grande</TogglePill>
              <button onClick={() => deleteCollection(c.id)} aria-label="Eliminar" style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--line-2)', color: 'var(--red)', width: 34, height: 34, borderRadius: 8 }}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Lookbook</h3>
        <button className="btn btn-ghost btn-sm" onClick={addLookbook}><Plus size={14} /> Agregar foto</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
        {lookbook.map((l) => (
          <div className="admin-card" key={l.id}>
            <ImageInput folder="lookbook" quality={1.0} value={l.image} onChange={(v) => updateLookbook(l.id, { image: v })} ratio="3/4" />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <Field label="Tamaño">
                  <select className="admin-input" value={l.span} onChange={(e) => updateLookbook(l.id, { span: e.target.value })}>
                    <option value="normal">Normal</option>
                    <option value="tall">Alto</option>
                    <option value="wide">Ancho</option>
                  </select>
                </Field>
              </div>
              <button onClick={() => deleteLookbook(l.id)} aria-label="Eliminar" style={{ alignSelf: 'flex-end', background: 'none', border: '1px solid var(--line-2)', color: 'var(--red)', width: 38, height: 38, borderRadius: 8 }}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ===================== datos de la tienda ===================== */
const SETTINGS_KEYS = [
  'brand', 'whatsapp', 'free_shipping_threshold', 'alias', 'cbu', 'bank_holder',
  'slogan_title', 'slogan_subtitle', 'instagram', 'tiktok', 'youtube', 'twitter', 'facebook',
  'pickup_enabled', 'showroom_address',
]

function SettingsForm() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const toast = useStore((s) => s.toast)

  const [draft, setDraft] = useState(() => Object.fromEntries(SETTINGS_KEYS.map((k) => [k, settings[k] ?? ''])))
  const D = (k) => ({ value: draft[k] ?? '', onChange: (e) => setDraft((d) => ({ ...d, [k]: e.target.value })) })
  const dirty = SETTINGS_KEYS.some((k) => String(draft[k] ?? '') !== String(settings[k] ?? ''))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const res = await updateSettings({ ...draft, free_shipping_threshold: Number(draft.free_shipping_threshold) || 0 })
    setSaving(false)
    toast(res?.ok !== false ? 'Cambios guardados ✓' : 'Error al guardar: ' + res.error, res?.ok !== false ? 'ok' : 'error')
  }

  return (
    <>
      <h3 style={{ marginBottom: 12 }}>Datos de la tienda</h3>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <Field label="Marca"><input className="admin-input" {...D('brand')} /></Field>
          <Field label="WhatsApp (sin +, con país)"><input className="admin-input" placeholder="5491100000000" {...D('whatsapp')} /></Field>
          <Field label="Envío gratis desde ($)"><input type="number" className="admin-input" {...D('free_shipping_threshold')} /></Field>
          <Field label="Alias (transferencia)"><input className="admin-input" placeholder="legui.mp" {...D('alias')} /></Field>
          <Field label="CBU / CVU (opcional)"><input className="admin-input" placeholder="000000..." {...D('cbu')} /></Field>
          <Field label="Titular de la cuenta"><input className="admin-input" placeholder="Nombre y apellido" {...D('bank_holder')} /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }} className="slogan-grid">
          <Field label="Título del hero"><textarea className="admin-input" rows={3} {...D('slogan_title')} /></Field>
          <Field label="Subtítulo del hero"><textarea className="admin-input" rows={3} {...D('slogan_subtitle')} /></Field>
        </div>
      </div>

      <h3 style={{ marginBottom: 4 }}>Entrega</h3>
      <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Configurá si los compradores pueden retirar en el showroom.</p>
      <div className="admin-card" style={{ marginBottom: 18 }}>
        <TogglePill on={!!draft.pickup_enabled} onClick={() => setDraft((d) => ({ ...d, pickup_enabled: !d.pickup_enabled }))}>
          Retiro en local habilitado
        </TogglePill>
        {draft.pickup_enabled && (
          <div style={{ marginTop: 12 }}>
            <Field label="Dirección del showroom">
              <input className="admin-input" placeholder="Av. Corrientes 1234, CABA" {...D('showroom_address')} />
            </Field>
          </div>
        )}
      </div>

      <h3 style={{ marginBottom: 4 }}>Redes sociales</h3>
      <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Las que dejes vacías no aparecen en la web.</p>
      <div className="admin-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          <Field label="Instagram"><input className="admin-input" placeholder="legui" {...D('instagram')} /></Field>
          <Field label="TikTok"><input className="admin-input" placeholder="legui" {...D('tiktok')} /></Field>
          <Field label="YouTube"><input className="admin-input" placeholder="(vacío = oculto)" {...D('youtube')} /></Field>
          <Field label="X (Twitter)"><input className="admin-input" placeholder="(vacío = oculto)" {...D('twitter')} /></Field>
          <Field label="Facebook"><input className="admin-input" placeholder="(vacío = oculto)" {...D('facebook')} /></Field>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
        <button className="btn btn-blue" onClick={save} disabled={!dirty || saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <span className="muted" style={{ fontSize: 13, color: dirty ? 'var(--amber)' : 'var(--green)' }}>
          {dirty ? 'Tenés cambios sin guardar' : 'Todo guardado ✓'}
        </span>
      </div>
    </>
  )
}

/* ===================== drops ===================== */
function DropsManager() {
  const drops = useStore((s) => s.drops)
  const addDrop = useStore((s) => s.addDrop)
  const updateDrop = useStore((s) => s.updateDrop)
  const deleteDrop = useStore((s) => s.deleteDrop)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ margin: 0 }}>Drops</h3>
        <button className="btn btn-ghost btn-sm" onClick={addDrop}><Plus size={14} /> Agregar drop</button>
      </div>
      <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>El drop <b>activo</b> aparece en la home con cuenta regresiva. Sin fecha = próximo viernes 20:00.</p>
      {drops.length === 0 && (<div className="admin-card" style={{ marginBottom: 24 }}><p className="muted">No hay drops. Tocá "Agregar drop".</p></div>)}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
        {drops.map((d) => (
          <div className="admin-card" key={d.id}>
            <ImageInput compact folder="drops" value={d.image} onChange={(v) => updateDrop(d.id, { image: v })} ratio="4/3" />
            <div style={{ marginTop: 10 }}>
              <Field label="Título"><textarea className="admin-input" rows={2} value={d.title || ''} onChange={(e) => updateDrop(d.id, { title: e.target.value })} /></Field>
            </div>
            <div style={{ marginTop: 8 }}>
              <Field label="Subtítulo"><input className="admin-input" value={d.subtitle || ''} onChange={(e) => updateDrop(d.id, { subtitle: e.target.value })} /></Field>
            </div>
            <div style={{ marginTop: 8 }}>
              <Field label="Descripción"><textarea className="admin-input" rows={2} value={d.description || ''} onChange={(e) => updateDrop(d.id, { description: e.target.value })} /></Field>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Mini label="Descuento %"><input type="number" className="admin-input" value={d.discount ?? ''} onChange={(e) => updateDrop(d.id, { discount: Number(e.target.value) || 0 })} /></Mini>
              <Mini label="Unidades"><input type="number" className="admin-input" value={d.units ?? ''} onChange={(e) => updateDrop(d.id, { units: Number(e.target.value) || 0 })} /></Mini>
            </div>
            <div style={{ marginTop: 8 }}>
              <Field label="Fecha y hora (vacío = próx. viernes 20:00)">
                <input type="datetime-local" className="admin-input" value={d.starts_at || ''} onChange={(e) => updateDrop(d.id, { starts_at: e.target.value || null })} />
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
              <TogglePill on={d.active} onClick={() => updateDrop(d.id, { active: !d.active })}>{d.active ? 'Activo' : 'Inactivo'}</TogglePill>
              <button onClick={() => deleteDrop(d.id)} aria-label="Eliminar" style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--line-2)', color: 'var(--red)', width: 34, height: 34, borderRadius: 8 }}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ===================== helpers UI ===================== */
function Field({ label, children }) {
  return <div><label className="admin-label">{label}</label>{children}</div>
}
function Mini({ label, children }) {
  return <div style={{ flex: 1, minWidth: 0 }}><label className="admin-label">{label}</label>{children}</div>
}
function TogglePill({ on, onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', padding: '7px 12px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${on ? 'var(--blue)' : 'var(--line-2)'}`, background: on ? 'var(--blue-soft)' : 'transparent', color: on ? '#7e95ff' : 'var(--muted)' }}>
      {children}
    </button>
  )
}

function ColorsEditor({ product, updateProduct }) {
  const colors = product.colors || []
  const sizes = product.sizes || []
  const update = (i, patch) => {
    const oldName = colors[i]?.name
    const fullPatch = { colors: colors.map((c, idx) => idx === i ? { ...c, ...patch } : c) }
    if (patch.name && patch.name !== oldName && product.stock_matrix?.[oldName]) {
      const stock_matrix = { ...product.stock_matrix }
      stock_matrix[patch.name] = stock_matrix[oldName]
      delete stock_matrix[oldName]
      fullPatch.stock_matrix = stock_matrix
    }
    updateProduct(product.id, fullPatch)
  }
  const add = () => {
    const next = [...colors, { name: `Color ${colors.length + 1}`, hex: '#1b3fe0', images: product.image ? [product.image] : [], default: colors.length === 0 }]
    const patch = { colors: next }
    if (sizes.length) {
      const bucket = {}
      sizes.forEach((sz) => { bucket[sz] = 0 })
      const stock_matrix = { ...(product.stock_matrix || {}) }
      delete stock_matrix['']
      stock_matrix[next[next.length - 1].name] = bucket
      patch.stock_matrix = stock_matrix
    }
    updateProduct(product.id, patch)
  }
  const setDefault = (i) => {
    const next = colors.map((c, idx) => ({ ...c, default: idx === i }))
    const firstImg = (next[i].images || [])[0]
    const patch = { colors: next }
    if (firstImg) {
      patch.image = firstImg
      patch.images = [firstImg, ...((product.images || []).filter((x) => x !== firstImg))]
    }
    updateProduct(product.id, patch)
  }
  const del = (i) => {
    const removed = colors[i]
    const next = colors.filter((_, idx) => idx !== i)
    const patch = { colors: next }
    if (removed?.name && product.stock_matrix) {
      const stock_matrix = { ...product.stock_matrix }
      delete stock_matrix[removed.name]
      if (next.length === 0 && sizes.length) {
        const bucket = {}
        sizes.forEach((sz) => { bucket[sz] = 0 })
        stock_matrix[''] = bucket
      }
      patch.stock_matrix = stock_matrix
    }
    updateProduct(product.id, patch)
  }
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label className="admin-label" style={{ margin: 0 }}>Colores ({colors.length})</label>
        <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '5px 10px' }} onClick={add}><Plus size={13} /> Color</button>
      </div>
      {colors.map((c, i) => (
        <div key={i} style={{ border: `1px solid ${c.default ? 'var(--blue)' : 'var(--line)'}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <input type="color" value={c.hex || '#000000'} onChange={(e) => update(i, { hex: e.target.value })} style={{ width: 34, height: 34, border: '1px solid var(--line-2)', borderRadius: 8, background: 'transparent', padding: 2, cursor: 'pointer', flexShrink: 0 }} />
            <input className="admin-input" placeholder="Nombre (ej. Rojo)" value={c.name || ''} onChange={(e) => update(i, { name: e.target.value })} />
            <button
              type="button" onClick={() => setDefault(i)}
              aria-label="Marcar como color principal" title="Mostrar como color principal"
              style={{ background: 'none', border: '1px solid var(--line-2)', color: c.default ? 'var(--blue)' : 'var(--faint)', width: 34, height: 34, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Star size={14} fill={c.default ? 'currentColor' : 'none'} />
            </button>
            <button type="button" onClick={() => del(i)} aria-label="Quitar color" style={{ background: 'none', border: '1px solid var(--line-2)', color: 'var(--red)', width: 34, height: 34, borderRadius: 8, flexShrink: 0 }}><Trash2 size={14} /></button>
          </div>
          {c.default && <div style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 8 }}>★ Color principal — se muestra primero en la tienda</div>}
          <ColorImagesEditor images={c.images} onChange={(images) => update(i, { images })} />
        </div>
      ))}
      {colors.length === 0 && <p style={{ fontSize: 12, color: 'var(--faint)' }}>Sin colores. Agregá uno y subí su foto.</p>}
    </div>
  )
}

function ColorImagesEditor({ images, onChange }) {
  const imgs = images || []
  const setAt = (i, v) => {
    const next = [...imgs]
    if (v) next[i] = v; else next.splice(i, 1)
    onChange(next.filter(Boolean))
  }
  const rows = imgs.length < 4 ? [...imgs, ''] : imgs
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((img, i) => (
        <ImageInput key={i} compact folder="products" w={56} ratio="1/1" value={img} onChange={(v) => setAt(i, v)} />
      ))}
      <span style={{ fontSize: 11, color: 'var(--faint)' }}>{imgs.length}/4 fotos</span>
    </div>
  )
}

function StockMatrixEditor({ product: p, updateProduct }) {
  const sizes = p.sizes || []
  const colors = p.colors || []
  const colorKeys = colors.length ? colors.map((c) => c.name) : ['']
  const matrix = p.stock_matrix || {}

  const setCell = (colorName, sz, value) => {
    const qty = Number(value) || 0
    const stock_matrix = { ...matrix }
    stock_matrix[colorName] = { ...(stock_matrix[colorName] || {}), [sz]: qty }
    const total = Object.values(stock_matrix).reduce((sum, bucket) => sum + Object.values(bucket).reduce((a, b) => a + b, 0), 0)
    updateProduct(p.id, { stock_matrix, stock: total, sold_out: total <= 0 })
  }

  const total = Object.values(matrix).reduce((sum, bucket) => sum + Object.values(bucket || {}).reduce((a, b) => a + (Number(b) || 0), 0), 0)

  return (
    <div style={{ marginBottom: 12 }}>
      <label className="admin-label">Stock por {colors.length ? 'color y talle' : 'talle'}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {colorKeys.map((colorName) => (
          <div key={colorName || '_'}>
            {colors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: colors.find((c) => c.name === colorName)?.hex || '#888', flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{colorName || 'Sin nombre'}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sizes.map((sz) => (
                <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 48, fontSize: 13, fontWeight: 600 }}>T{sz}</span>
                  <input
                    type="number" min="0" className="admin-input"
                    style={{ width: 90 }}
                    value={(matrix[colorName] || {})[sz] ?? 0}
                    onChange={(e) => setCell(colorName, sz, e.target.value)}
                  />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>u.</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ fontSize: 12, color: 'var(--faint)' }}>
          Total: {total} u. (se actualiza el stock global automáticamente)
        </div>
      </div>
    </div>
  )
}

// quality 0.70 = productos/drops (balance tamaño/calidad)
// quality 1.0  = portadas/lookbook/colecciones (máxima calidad, imagen de marca)
function ImageInput({ value, onChange, ratio = '4/5', compact = false, w = 92, folder = 'general', quality = 0.70 }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      onChange(await uploadMedia(file, folder, quality))
    } catch (err) {
      alert(err.message)
    }
    setBusy(false)
    e.target.value = ''
  }

  const preview = (
    <div style={{ position: 'relative', width: compact ? w : '100%', aspectRatio: ratio, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-3)', border: '1px solid var(--line)', flexShrink: 0 }}>
      {value ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ghost)' }}><ImageIcon size={compact ? 20 : 28} /></div>
      )}
      {busy && (<div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.5)' }}><div className="spinner" /></div>)}
    </div>
  )

  const controls = (
    <>
      <button type="button" className="btn btn-ghost btn-sm btn-block" onClick={() => ref.current?.click()}><Upload size={14} /> Subir</button>
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
      <input className="admin-input" style={{ marginTop: 8, fontSize: 12 }} placeholder="…o pegá una URL"
        value={value && value.startsWith('data:') ? '' : value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  )

  if (compact) return (<div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>{preview}<div style={{ flex: 1, minWidth: 0 }}>{controls}</div></div>)
  return (<div><div style={{ marginBottom: 8 }}>{preview}</div>{controls}</div>)
}
