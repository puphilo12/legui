import { create } from 'zustand'
import { MOCK, STORE_ID, supabase } from '../lib/supabase'
import {
  MOCK_SETTINGS,
  MOCK_PRODUCTS,
  MOCK_COLLECTIONS,
  MOCK_LOOKBOOK,
  MOCK_DROPS,
} from '../data/mockData'
import { slugify, uid } from '../utils/format'

// Debounce maps para writes frecuentes (evitar spam a Supabase)
const _pd = {} // product debounces
const _dd = {} // drop debounces
const _wd = {} // wishlist debounce

const LS = {
  cart: `legui_cart_${STORE_ID}`,
  favs: `legui_favs_${STORE_ID}`,
  products: `legui_products_${STORE_ID}`,
  settings: `legui_settings_${STORE_ID}`,
  collections: `legui_collections_${STORE_ID}`,
  lookbook: `legui_lookbook_${STORE_ID}`,
  drops: `legui_drops_${STORE_ID}`,
  orders: `legui_orders_${STORE_ID}`,
  expenses: `legui_expenses_${STORE_ID}`,
  customers: `legui_customers_${STORE_ID}`,
  stock: `legui_stock_${STORE_ID}`,
}

export const SURCHARGE = {
  efectivo: 0,
  transferencia: 0,
  debito: 0.1,
  credito: 0.26,
  'cuenta-corriente': 0.1,
  mercadopago: 0,
}

export const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: '💵' },
  { id: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { id: 'debito', label: 'Tarjeta débito', icon: '💳' },
  { id: 'credito', label: 'Tarjeta crédito', icon: '💳' },
  { id: 'cuenta-corriente', label: 'Cuenta corriente', icon: '📒', alias: 'fiado' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: '🔵' },
]

const read = (key, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null')
    return v ?? fallback
  } catch {
    return fallback
  }
}
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}

export const effPrice = (p) => Number(p?.discount_price ?? p?.price ?? 0)

const cartKey = (id, color, size) => `${id}|${color || '-'}|${size || '-'}`

// Stock por variante: stock_matrix = { [colorName||'']: { [talle]: cantidad } }
const colorKey = (color) => color?.name || color || ''

// Cantidad disponible para una combinación color+talle, o null si el producto no usa stock por variante.
export const variantStock = (product, color, size) => {
  const matrix = product?.stock_matrix
  if (!matrix || !size || !Object.keys(matrix).length) return null
  const bucket = matrix[colorKey(color)]
  if (!bucket) return null
  return bucket[size] ?? 0
}

const matrixTotal = (matrix) =>
  Object.values(matrix || {}).reduce((sum, bucket) => sum + Object.values(bucket || {}).reduce((a, b) => a + (Number(b) || 0), 0), 0)

const decrementVariant = (matrix, color, size, qty) => {
  if (!matrix || !size) return matrix
  const key = colorKey(color)
  const bucket = matrix[key]
  if (!bucket || !(size in bucket)) return matrix
  return { ...matrix, [key]: { ...bucket, [size]: Math.max(0, (bucket[size] ?? 0) - qty) } }
}

const restoreVariant = (matrix, color, size, qty) => {
  if (!matrix || !size) return matrix
  const key = colorKey(color)
  const bucket = matrix[key]
  if (!bucket || !(size in bucket)) return matrix
  return { ...matrix, [key]: { ...bucket, [size]: (bucket[size] ?? 0) + qty } }
}

const normalizeProduct = (row) => ({
  ...row,
  images: row.images || (row.image ? [row.image] : []),
  colors: (row.colors || []).map((c) => ({ ...c, images: c.images || (c.image ? [c.image] : []) })),
  sizes: row.sizes || [],
  stock_matrix: row.stock_matrix || {},
})

// Sync a Supabase (fire-and-forget)
const sbSync = (fn) => { if (!MOCK) fn().catch((e) => console.error('sb sync:', e)) }

// Debounced sync
const sbDebounce = (map, key, delay, fn) => {
  if (MOCK) return
  clearTimeout(map[key])
  map[key] = setTimeout(() => fn().catch((e) => console.error('sb debounce:', e)), delay)
}

export const useStore = create((set, get) => ({
  // ---- datos ----
  ready: false,
  loading: true,
  settings: MOCK_SETTINGS,
  products: [],
  collections: [],
  lookbook: [],
  drops: [],

  // ---- back-office ----
  orders: read(LS.orders, []),
  expenses: read(LS.expenses, []),
  customers: read(LS.customers, []),
  stockMovements: read(LS.stock, []),

  // ---- auth ----
  user: null,
  isAdmin: false,
  profile: null,
  authLoading: !MOCK,
  buyerOrders: [],

  // ---- ui ----
  cartOpen: false,
  menuOpen: false,
  toasts: [],
  cart: read(LS.cart, []),
  favorites: read(LS.favs, []),

  // ------------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------------
  async initAuth() {
    if (MOCK) { set({ authLoading: false }); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await get()._onUser(session.user)
    else set({ authLoading: false })

    supabase.auth.onAuthStateChange(async (_ev, sess) => {
      if (sess?.user) await get()._onUser(sess.user)
      else set({ user: null, isAdmin: false, profile: null, authLoading: false })
    })
  },

  async _onUser(user) {
    const { data } = await supabase.from('admin_roles').select('email').eq('email', user.email).maybeSingle()
    const isAdmin = !!data
    set({ user, isAdmin, authLoading: false })
    if (isAdmin) await get().loadAdminData()
    else await get().loadProfile(user.id)
  },

  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { ok: false, error: error.message }
    // Si la sesión ya viene en la respuesta (autoconfirm activo), no hace falta re-login
    if (data.session) return { ok: true }
    // Fallback: iniciar sesión manualmente (por si autoconfirm está desactivado)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) return { ok: true, needsConfirm: true }
    return { ok: true }
  },

  async signOut() {
    await supabase?.auth.signOut()
    set({ user: null, isAdmin: false, profile: null, buyerOrders: [] })
  },

  async resetPassword(email) {
    const redirectTo = `${window.location.origin}/mi-cuenta?recovery=1`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  // ------------------------------------------------------------------
  // Perfil de comprador
  // ------------------------------------------------------------------
  async loadProfile(userId) {
    if (MOCK) return
    const id = userId || get().user?.id
    if (!id) return
    const { data } = await supabase.from('user_profiles').select('*').eq('id', id).maybeSingle()
    if (data) {
      set({ profile: data })
      // Restaurar wishlist guardada
      if (Array.isArray(data.wishlist) && data.wishlist.length) {
        set({ favorites: data.wishlist })
        write(LS.favs, data.wishlist)
      }
    }
    await get().loadBuyerOrders(id)
  },

  async saveProfile(data) {
    const user = get().user
    if (!user) return
    const profile = { ...get().profile, ...data, id: user.id }
    set({ profile })
    if (!MOCK) {
      const { error } = await supabase.from('user_profiles').upsert(profile)
      if (error) console.error('saveProfile:', error)
    }
  },

  async loadBuyerOrders(userId) {
    if (MOCK) return
    const id = userId || get().user?.id
    if (!id) return
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
    if (data) set({ buyerOrders: data })
  },

  // ------------------------------------------------------------------
  // Carga inicial
  // ------------------------------------------------------------------
  async load() {
    if (get().ready) return
    if (MOCK) {
      set({
        settings: { ...MOCK_SETTINGS, ...(read(LS.settings, null) || {}) },
        products: (() => { const s = read(LS.products, null); return Array.isArray(s) && s.length ? s : MOCK_PRODUCTS })().map(normalizeProduct),
        collections: (() => { const s = read(LS.collections, null); return Array.isArray(s) ? s : MOCK_COLLECTIONS })(),
        lookbook: (() => { const s = read(LS.lookbook, null); return Array.isArray(s) ? s : MOCK_LOOKBOOK })(),
        drops: (() => { const s = read(LS.drops, null); return Array.isArray(s) ? s : MOCK_DROPS })(),
        orders: read(LS.orders, []),
        expenses: read(LS.expenses, []),
        customers: read(LS.customers, []),
        stockMovements: read(LS.stock, []),
        loading: false,
        ready: true,
      })
      return
    }

    try {
      const [settings, products, collections, lookbook, drops] = await Promise.all([
        supabase.from('settings').select('*').eq('store_id', STORE_ID).maybeSingle(),
        supabase.from('products').select('*').eq('store_id', STORE_ID).order('sort', { ascending: true }),
        supabase.from('collections').select('*').eq('store_id', STORE_ID).order('sort', { ascending: true }),
        supabase.from('lookbook').select('*').eq('store_id', STORE_ID).order('sort', { ascending: true }),
        supabase.from('drops').select('*').eq('store_id', STORE_ID).order('created_at', { ascending: false }),
      ])
      set({
        settings: settings.data || MOCK_SETTINGS,
        products: (products.data || []).map(normalizeProduct),
        collections: collections.data || [],
        lookbook: lookbook.data || [],
        drops: drops.data || [],
        loading: false,
        ready: true,
      })
    } catch (err) {
      console.error('LEGUI · carga fallida, modo mock:', err)
      set({
        settings: MOCK_SETTINGS, products: MOCK_PRODUCTS.map(normalizeProduct),
        collections: MOCK_COLLECTIONS, lookbook: MOCK_LOOKBOOK, drops: MOCK_DROPS,
        loading: false, ready: true,
      })
    }
  },

  // Carga datos de back-office desde Supabase (sólo cuando autenticado como admin)
  async loadAdminData() {
    if (MOCK) return
    const [orders, expenses, customers, movements] = await Promise.all([
      supabase.from('orders').select('*').eq('store_id', STORE_ID).order('created_at', { ascending: false }),
      supabase.from('expenses').select('*').eq('store_id', STORE_ID).order('date', { ascending: false }),
      supabase.from('customers').select('*').eq('store_id', STORE_ID),
      supabase.from('stock_movements').select('*').eq('store_id', STORE_ID).order('created_at', { ascending: false }),
    ])
    set({
      orders: orders.data || read(LS.orders, []),
      expenses: expenses.data || read(LS.expenses, []),
      customers: customers.data || read(LS.customers, []),
      stockMovements: movements.data || read(LS.stock, []),
    })
  },

  // ------------------------------------------------------------------
  // Helpers de producto
  // ------------------------------------------------------------------
  getProduct(idOrSlug) {
    const { products } = get()
    return products.find((p) => p.id === idOrSlug || slugify(p.name) === idOrSlug)
  },
  related(product, n = 4) {
    if (!product) return []
    return get().products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, n)
  },
  categories() {
    return [...new Set(get().products.map((p) => p.category).filter(Boolean))]
  },
  allSizes() {
    const s = new Set()
    get().products.forEach((p) => (p.sizes || []).forEach((x) => s.add(x)))
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    return [...s].sort((a, b) => {
      const na = Number(a), nb = Number(b)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      if (!isNaN(na)) return -1
      if (!isNaN(nb)) return 1
      return order.indexOf(a) - order.indexOf(b)
    })
  },

  // ------------------------------------------------------------------
  // Carrito
  // ------------------------------------------------------------------
  addToCart(product, { color = null, size = null, qty = 1 } = {}) {
    const colorName = color?.name || color || null
    const key = cartKey(product.id, colorName, size)
    const cap = variantStock(product, colorName, size) ?? product.stock ?? 99
    set((s) => {
      const existing = s.cart.find((i) => i.key === key)
      let cart
      if (existing) {
        cart = s.cart.map((i) => i.key === key ? { ...i, qty: Math.min(i.qty + qty, cap) } : i)
      } else {
        cart = [...s.cart, {
          key, id: product.id, slug: slugify(product.name), name: product.name,
          price: effPrice(product), image: color?.images?.[0] || product.image || (product.images || [])[0],
          color: colorName, colorHex: color?.hex || null, size: size || null,
          qty: Math.min(qty, cap), stock: cap,
        }]
      }
      write(LS.cart, cart)
      return { cart, cartOpen: true }
    })
    get().toast(`Agregado: ${product.name}`)
  },
  setQty(key, qty) {
    set((s) => {
      const cart = s.cart.map((i) => i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, i.stock || 99)) } : i).filter((i) => i.qty > 0)
      write(LS.cart, cart)
      return { cart }
    })
  },
  removeFromCart(key) {
    set((s) => { const cart = s.cart.filter((i) => i.key !== key); write(LS.cart, cart); return { cart } })
  },
  clearCart() { write(LS.cart, []); set({ cart: [] }) },
  cartCount() { return get().cart.reduce((n, i) => n + i.qty, 0) },
  cartSubtotal() { return get().cart.reduce((n, i) => n + i.price * i.qty, 0) },

  // ------------------------------------------------------------------
  // Favoritos
  // ------------------------------------------------------------------
  toggleFav(id) {
    set((s) => {
      const on = s.favorites.includes(id)
      const favorites = on ? s.favorites.filter((x) => x !== id) : [...s.favorites, id]
      write(LS.favs, favorites)
      return { favorites }
    })
    get().toast(!get().favorites.includes(id) ? 'Agregado a guardados' : 'Quitado de guardados')
    // Sincronizar wishlist al perfil de comprador (debounced)
    const user = get().user
    const isAdmin = get().isAdmin
    if (!MOCK && user && !isAdmin) {
      sbDebounce(_wd, user.id, 1000, async () => {
        const wishlist = get().favorites
        await supabase.from('user_profiles').upsert({ id: user.id, wishlist })
      })
    }
  },
  isFav(id) { return get().favorites.includes(id) },

  // ------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
  closeMenu: () => set({ menuOpen: false }),

  toast(text, kind = 'ok') {
    const id = uid('t')
    set((s) => ({ toasts: [...s.toasts, { id, text, kind }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600)
  },
  dropToast(id) { set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })) },

  // ------------------------------------------------------------------
  // Productos — CRUD
  // ------------------------------------------------------------------
  updateProduct(id, patch) {
    set((s) => {
      const products = s.products.map((p) => p.id === id ? { ...p, ...patch } : p)
      write(LS.products, products)
      return { products }
    })
    // Los borradores (recién creados, todavía no guardados) no existen en Supabase:
    // no hay nada que actualizar ahí hasta que se confirme la creación.
    if (get().products.find((p) => p.id === id)?._draft) return
    sbDebounce(_pd, id, 800, async () => {
      const p = get().products.find((x) => x.id === id)
      if (p) await supabase.from('products').update(patch).eq('id', id)
    })
  },

  // Crea el producto solo en el estado local (borrador) — todavía no toca Supabase.
  // Se confirma recién al guardar/cerrar el editor (ver saveDraftProduct).
  async addProduct() {
    const seed = `https://picsum.photos/seed/legui-${Date.now()}/800/1000`
    const np = {
      id: uid('p'), store_id: STORE_ID, name: 'Nuevo producto', category: 'Ropa',
      price: 0, discount_price: null, tag: 'Nuevo', sold_out: false, featured: false,
      is_offer: false, description: '', image: seed, images: [seed], colors: [], sizes: ['S', 'M', 'L', 'XL'],
      stock: 10, stock_matrix: {}, cost: 0, low_stock_threshold: 5, sort: 0,
      _draft: true,
    }
    set((s) => { const products = [np, ...s.products]; write(LS.products, products); return { products } })
    return np.id
  },

  // Confirma un borrador: recién acá se crea de verdad en Supabase.
  // Si el producto no es un borrador (ya estaba guardado), no hace nada.
  saveDraftProduct(id) {
    const p = get().products.find((x) => x.id === id)
    if (!p || !p._draft) return
    const { _draft, ...clean } = p
    set((s) => {
      const products = s.products.map((x) => x.id === id ? clean : x)
      write(LS.products, products)
      return { products }
    })
    sbSync(async () => { await supabase.from('products').insert(clean) })
    get().toast('Producto creado')
  },

  deleteProduct(id) {
    set((s) => { const products = s.products.filter((p) => p.id !== id); write(LS.products, products); return { products } })
    sbSync(async () => { await supabase.from('products').delete().eq('id', id) })
    get().toast('Producto eliminado')
  },

  resetProducts() {
    try { localStorage.removeItem(LS.products) } catch { /* noop */ }
    set({ products: MOCK_PRODUCTS.map(normalizeProduct) })
    get().toast('Catálogo restaurado')
  },

  // ------------------------------------------------------------------
  // Settings
  // ------------------------------------------------------------------
  async updateSettings(patch) {
    set((s) => {
      const settings = { ...s.settings, ...patch }
      write(LS.settings, settings)
      return { settings }
    })
    if (!MOCK) {
      const full = { ...get().settings, store_id: STORE_ID }
      const { error } = await supabase.from('settings').upsert(full)
      if (error) { console.error('settings upsert:', error); return { ok: false, error: error.message } }
      return { ok: true }
    }
    return { ok: true }
  },

  // ------------------------------------------------------------------
  // Colecciones — CRUD
  // ------------------------------------------------------------------
  addCollection() {
    const nc = { id: uid('c'), store_id: STORE_ID, title: 'Nueva colección', subtitle: 'Ver todo', image: '', big: false, sort: get().collections.length + 1, link: '' }
    set((s) => { const collections = [...s.collections, nc]; write(LS.collections, collections); return { collections } })
    sbSync(async () => { await supabase.from('collections').insert(nc) })
  },
  updateCollection(id, patch) {
    set((s) => { const collections = s.collections.map((c) => c.id === id ? { ...c, ...patch } : c); write(LS.collections, collections); return { collections } })
    sbSync(async () => { await supabase.from('collections').update(patch).eq('id', id) })
  },
  deleteCollection(id) {
    set((s) => { const collections = s.collections.filter((c) => c.id !== id); write(LS.collections, collections); return { collections } })
    sbSync(async () => { await supabase.from('collections').delete().eq('id', id) })
  },

  // ------------------------------------------------------------------
  // Lookbook — CRUD
  // ------------------------------------------------------------------
  addLookbook() {
    const nl = { id: uid('lb'), store_id: STORE_ID, title: `Look ${String(get().lookbook.length + 1).padStart(2, '0')}`, image: '', span: 'normal', sort: get().lookbook.length + 1 }
    set((s) => { const lookbook = [...s.lookbook, nl]; write(LS.lookbook, lookbook); return { lookbook } })
    sbSync(async () => { await supabase.from('lookbook').insert(nl) })
  },
  updateLookbook(id, patch) {
    set((s) => { const lookbook = s.lookbook.map((l) => l.id === id ? { ...l, ...patch } : l); write(LS.lookbook, lookbook); return { lookbook } })
    sbSync(async () => { await supabase.from('lookbook').update(patch).eq('id', id) })
  },
  deleteLookbook(id) {
    set((s) => { const lookbook = s.lookbook.filter((l) => l.id !== id); write(LS.lookbook, lookbook); return { lookbook } })
    sbSync(async () => { await supabase.from('lookbook').delete().eq('id', id) })
  },

  // ------------------------------------------------------------------
  // Drops — CRUD
  // ------------------------------------------------------------------
  addDrop() {
    const nd = { id: uid('d'), store_id: STORE_ID, title: 'Nuevo drop', subtitle: 'Drop semanal · Viernes 20:00', description: 'Suscribite y recibí el código antes que nadie.', image: '', discount: 30, units: 100, starts_at: null, active: true }
    set((s) => { const drops = [...s.drops, nd]; write(LS.drops, drops); return { drops } })
    sbSync(async () => { await supabase.from('drops').insert(nd) })
  },
  updateDrop(id, patch) {
    set((s) => { const drops = s.drops.map((d) => d.id === id ? { ...d, ...patch } : d); write(LS.drops, drops); return { drops } })
    sbDebounce(_dd, id, 800, async () => { await supabase.from('drops').update(patch).eq('id', id) })
  },
  deleteDrop(id) {
    set((s) => { const drops = s.drops.filter((d) => d.id !== id); write(LS.drops, drops); return { drops } })
    sbSync(async () => { await supabase.from('drops').delete().eq('id', id) })
  },

  // ------------------------------------------------------------------
  // POS: ventas manuales (mostrador)
  // ------------------------------------------------------------------
  registerSale({ productId, size = null, color = null, quantity = 1, paymentMethod = 'efectivo', customerName = '', customerDni = '' }) {
    const product = get().products.find((p) => p.id === productId)
    if (!product) return { ok: false, error: 'Producto no encontrado' }

    const unit = effPrice(product)
    const surcharge = SURCHARGE[paymentMethod] || 0
    const total = Math.round(unit * quantity * (1 + surcharge))
    const newMatrix = decrementVariant(product.stock_matrix, color, size, quantity)
    const newStock = newMatrix !== product.stock_matrix ? matrixTotal(newMatrix) : Math.max(0, (product.stock ?? 0) - quantity)
    const now = new Date().toISOString()

    const order = {
      id: uid('o'), store_id: STORE_ID, created_at: now, channel: 'mostrador', status: 'Pagado',
      payment_method: paymentMethod, customer: { nombre: customerName || 'Mostrador', dni: customerDni || '-' },
      items: [{ id: product.id, name: product.name, price: unit, qty: quantity, size, color, cost: Number(product.cost || 0) }],
      total, created_by: get().user?.id || null,
    }

    set((s) => {
      const products = s.products.map((p) => p.id === productId ? { ...p, stock: newStock, sold_out: newStock <= 0, stock_matrix: newMatrix } : p)
      const orders = [order, ...s.orders]
      let customers = s.customers
      if (paymentMethod === 'cuenta-corriente') {
        const dni = customerDni || '-'
        const entry = { date: now, amount: total, type: 'compra' }
        const exists = customers.find((c) => c.dni === dni)
        customers = exists
          ? customers.map((c) => c.dni === dni ? { ...c, nombre: customerName || c.nombre, balance: (c.balance || 0) + total, history: [...(c.history || []), entry] } : c)
          : [...customers, { dni, store_id: STORE_ID, nombre: customerName || 'Sin nombre', balance: total, history: [entry] }]
        write(LS.customers, customers)
      }
      write(LS.products, products)
      write(LS.orders, orders)
      return { products, orders, customers }
    })

    sbSync(async () => {
      await supabase.from('orders').insert(order)
      await supabase.from('products').update({ stock: newStock, sold_out: newStock <= 0, stock_matrix: newMatrix }).eq('id', productId)
      if (paymentMethod === 'cuenta-corriente') {
        const c = get().customers.find((x) => x.dni === (customerDni || '-'))
        if (c) await supabase.from('customers').upsert({ ...c, store_id: STORE_ID })
      }
    })

    get().toast('Venta registrada')
    return { ok: true, total }
  },

  // Pedido desde el carrito (checkout web)
  async placeOrder({ customer = {}, paymentMethod = 'whatsapp', channel = 'web' } = {}) {
    const { cart, products, user } = get()
    if (!cart.length) return { ok: false, error: 'El carrito está vacío' }

    const total = cart.reduce((n, i) => n + i.price * i.qty, 0)
    // El stock queda reservado mientras el pedido está "Pendiente". Pasado el plazo
    // sin confirmarse, el cron (api/cancel-expired-orders.js) lo cancela y devuelve
    // el stock. Mercado Pago se confirma solo (webhook, ver api/mp-webhook.js) así
    // que 48hs alcanza; el resto depende de que vos confirmes el pago a mano
    // (comprobante de transferencia, etc.), por eso tienen más margen.
    const RESERVE_HOURS = paymentMethod === 'mercadopago' ? 48 : 72
    const reservedUntil = new Date(Date.now() + RESERVE_HOURS * 60 * 60 * 1000).toISOString()
    const order = {
      id: uid('o'), store_id: STORE_ID, created_at: new Date().toISOString(),
      channel, status: 'Pendiente', payment_method: paymentMethod, customer,
      items: cart.map((i) => ({
        id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color,
        cost: Number(products.find((p) => p.id === i.id)?.cost || 0),
      })),
      total, created_by: user?.id || null, user_id: user?.id || null, reserved_until: reservedUntil,
    }

    set((s) => {
      const newProducts = s.products.map((p) => {
        const cartItems = cart.filter((i) => i.id === p.id)
        const qty = cartItems.reduce((n, i) => n + i.qty, 0)
        if (!qty) return p
        let matrix = p.stock_matrix
        cartItems.forEach((i) => { matrix = decrementVariant(matrix, i.color, i.size, i.qty) })
        const ns = matrix !== p.stock_matrix ? matrixTotal(matrix) : Math.max(0, (p.stock ?? 0) - qty)
        return { ...p, stock: ns, sold_out: ns <= 0, stock_matrix: matrix }
      })
      const orders = [order, ...s.orders]
      write(LS.products, newProducts)
      write(LS.orders, orders)
      write(LS.cart, [])
      return { products: newProducts, orders, cart: [], cartOpen: false }
    })

    if (!MOCK) {
      await supabase.from('orders').insert(order).then(({ error }) => {
        if (error) console.error('placeOrder insert:', error)
      })
      // Actualizar stock en Supabase
      const updatedProducts = get().products.filter((p) => cart.some((i) => i.id === p.id))
      for (const p of updatedProducts) {
        supabase.from('products').update({ stock: p.stock, sold_out: p.sold_out, stock_matrix: p.stock_matrix }).eq('id', p.id).then(({ error }) => {
          if (error) console.error('stock update:', error)
        })
      }
      // Actualizar lista de pedidos del comprador
      if (user?.id && !get().isAdmin) {
        set((s) => ({ buyerOrders: [order, ...s.buyerOrders] }))
      }
    }

    return { ok: true, order, total }
  },

  updateOrderStatus(id, status) {
    const order = get().orders.find((o) => o.id === id)
    // Si se cancela un pedido que no estaba ya cancelado, devolvemos el stock reservado.
    const restoring = status === 'Cancelado' && order && order.status !== 'Cancelado'

    set((s) => {
      let products = s.products
      if (restoring) {
        products = s.products.map((p) => {
          const items = order.items.filter((i) => i.id === p.id)
          if (!items.length) return p
          let matrix = p.stock_matrix
          let stock = p.stock ?? 0
          items.forEach((i) => {
            matrix = restoreVariant(matrix, i.color, i.size, i.qty)
            stock += i.qty
          })
          const ns = matrix !== p.stock_matrix ? matrixTotal(matrix) : stock
          return { ...p, stock: ns, sold_out: ns <= 0, stock_matrix: matrix }
        })
        write(LS.products, products)
      }
      const orders = s.orders.map((o) => o.id === id ? { ...o, status } : o)
      write(LS.orders, orders)
      return { orders, products }
    })

    sbSync(async () => {
      await supabase.from('orders').update({ status }).eq('id', id)
      if (restoring) {
        const updated = get().products.filter((p) => order.items.some((i) => i.id === p.id))
        for (const p of updated) {
          await supabase.from('products').update({ stock: p.stock, sold_out: p.sold_out, stock_matrix: p.stock_matrix }).eq('id', p.id)
        }
      }
    })
  },
  deleteOrder(id) {
    set((s) => { const orders = s.orders.filter((o) => o.id !== id); write(LS.orders, orders); return { orders } })
    sbSync(async () => { await supabase.from('orders').delete().eq('id', id) })
  },

  // ------------------------------------------------------------------
  // Cuenta corriente
  // ------------------------------------------------------------------
  registerPayment(dni, amount) {
    set((s) => {
      const customers = s.customers.map((c) => c.dni === dni
        ? { ...c, balance: Math.max(0, (c.balance || 0) - amount), history: [...(c.history || []), { date: new Date().toISOString(), amount, type: 'pago' }] }
        : c)
      write(LS.customers, customers)
      return { customers }
    })
    sbSync(async () => {
      const c = get().customers.find((x) => x.dni === dni)
      if (c) await supabase.from('customers').update({ balance: c.balance, history: c.history }).eq('store_id', STORE_ID).eq('dni', dni)
    })
    get().toast('Pago registrado')
  },
  addCustomer({ dni, nombre }) {
    const nc = { dni, store_id: STORE_ID, nombre: nombre || 'Sin nombre', balance: 0, history: [] }
    set((s) => {
      if (s.customers.some((c) => c.dni === dni)) return {}
      const customers = [...s.customers, nc]
      write(LS.customers, customers)
      return { customers }
    })
    sbSync(async () => { await supabase.from('customers').upsert(nc) })
  },
  deleteCustomer(dni) {
    set((s) => { const customers = s.customers.filter((c) => c.dni !== dni); write(LS.customers, customers); return { customers } })
    sbSync(async () => { await supabase.from('customers').delete().eq('store_id', STORE_ID).eq('dni', dni) })
  },

  // ------------------------------------------------------------------
  // Gastos
  // ------------------------------------------------------------------
  addExpense({ description, amount, category = 'Otros', date }) {
    const ne = { id: uid('e'), store_id: STORE_ID, description, amount: Number(amount) || 0, category, date: date || new Date().toISOString().slice(0, 10), created_at: new Date().toISOString() }
    set((s) => { const expenses = [ne, ...s.expenses]; write(LS.expenses, expenses); return { expenses } })
    sbSync(async () => { await supabase.from('expenses').insert(ne) })
    get().toast('Gasto cargado')
  },
  deleteExpense(id) {
    set((s) => { const expenses = s.expenses.filter((e) => e.id !== id); write(LS.expenses, expenses); return { expenses } })
    sbSync(async () => { await supabase.from('expenses').delete().eq('id', id) })
  },

  // ------------------------------------------------------------------
  // Stock: reposición
  // ------------------------------------------------------------------
  restockProduct({ productId, units, unitCost = 0, kind = 'reposicion', notes = '' }) {
    const product = get().products.find((p) => p.id === productId)
    if (!product) return
    const u = Number(units) || 0
    const newStock = Math.max(0, (product.stock ?? 0) + u)
    const move = {
      id: uid('sm'), store_id: STORE_ID, product_id: productId, product_name: product.name,
      units: u, unit_cost: Number(unitCost) || 0, total_cost: (Number(unitCost) || 0) * u,
      kind, notes, created_at: new Date().toISOString(),
    }
    set((s) => {
      const products = s.products.map((p) => p.id === productId ? { ...p, stock: newStock, sold_out: newStock <= 0 ? p.sold_out : false } : p)
      const stockMovements = [move, ...s.stockMovements]
      write(LS.products, products)
      write(LS.stock, stockMovements)
      return { products, stockMovements }
    })
    sbSync(async () => {
      await supabase.from('stock_movements').insert(move)
      await supabase.from('products').update({ stock: newStock, sold_out: newStock <= 0 ? product.sold_out : false }).eq('id', productId)
    })
    get().toast('Stock actualizado')
  },
}))
