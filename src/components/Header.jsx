import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Heart, ShoppingBag, Menu, X, SlidersHorizontal, UserCircle } from 'lucide-react'
import Logo from './Logo'
import { useStore } from '../store/useStore'
import { MOCK } from '../lib/supabase'

const NAV = [
  { label: 'Tienda', to: '/tienda' },
  { label: 'Zapatillas', to: '/tienda?cat=Zapatillas' },
  { label: 'Ropa', to: '/tienda?cat=Ropa' },
  { label: 'Lookbook', to: '/#lookbook' },
  { label: 'Drops', to: '/#drops' },
]

export default function Header() {
  const navigate = useNavigate()
  const count = useStore((s) => s.cart.reduce((n, i) => n + i.qty, 0))
  const favCount = useStore((s) => s.favorites.length)
  const openCart = useStore((s) => s.openCart)
  const menuOpen = useStore((s) => s.menuOpen)
  const toggleMenu = useStore((s) => s.toggleMenu)
  const closeMenu = useStore((s) => s.closeMenu)
  const user = useStore((s) => s.user)
  const isAdmin = useStore((s) => s.isAdmin)
  const buyerOrders = useStore((s) => s.buyerOrders)
  const pendingOrders = buyerOrders.filter((o) => o.status === 'Pendiente' || o.status === 'Enviado').length

  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 40)
  }, [searchOpen])

  useEffect(() => {
    document.body.classList.toggle('body-lock', menuOpen)
    return () => document.body.classList.remove('body-lock')
  }, [menuOpen])

  const submitSearch = (e) => {
    e.preventDefault()
    const term = q.trim()
    setSearchOpen(false)
    navigate(term ? `/tienda?q=${encodeURIComponent(term)}` : '/tienda')
  }

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 60,
          background: 'rgba(10,10,11,.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div
          className="wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            height: 'var(--header-h)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="icon-btn show-mobile"
              aria-label="Abrir menú"
              onClick={toggleMenu}
              style={{ border: 'none' }}
            >
              <Menu size={22} />
            </button>
            <Logo height={28} />
          </div>

          <nav
            className="hide-mobile"
            style={{ display: 'flex', gap: 26, alignItems: 'center' }}
          >
            {NAV.map((n) => (
              <NavLink
                key={n.label}
                to={n.to}
                className={({ isActive }) =>
                  'nav-link' + (isActive && n.to === '/tienda' ? ' active' : '')
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="icon-btn"
              aria-label="Buscar"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <Link
              to="/favoritos"
              className="icon-btn hide-mobile"
              aria-label="Favoritos"
            >
              <Heart size={18} />
              {favCount > 0 && <span className="cart-count">{favCount}</span>}
            </Link>

            <button
              className="icon-btn"
              aria-label="Carrito"
              onClick={openCart}
            >
              <ShoppingBag size={18} />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>

            {/* Cuenta comprador */}
            {!MOCK && user && !isAdmin && (
              <Link
                to="/mi-cuenta"
                className="icon-btn hide-mobile"
                aria-label="Mi cuenta"
                style={{ position: 'relative' }}
                title={user.email}
              >
                <UserCircle size={20} />
                {pendingOrders > 0 && (
                  <span className="cart-count" style={{ background: 'var(--blue)' }}>{pendingOrders}</span>
                )}
              </Link>
            )}
            {!MOCK && !user && !isAdmin && (
              <Link
                to="/mi-cuenta"
                className="icon-btn hide-mobile"
                aria-label="Iniciar sesión"
                title="Iniciar sesión"
              >
                <UserCircle size={20} />
              </Link>
            )}

            {isAdmin && (
              <button
                className="btn btn-ghost btn-sm hide-mobile"
                onClick={() => navigate('/admin')}
                style={{ padding: '9px 14px' }}
                title="Panel de administración"
              >
                <SlidersHorizontal size={14} /> Admin
              </button>
            )}
          </div>
        </div>

        {searchOpen && (
          <div
            style={{
              borderTop: '1px solid var(--line)',
              background: 'rgba(10,10,11,.96)',
              animation: 'fadeIn .2s ease',
            }}
          >
            <form
              className="wrap"
              onSubmit={submitSearch}
              style={{ display: 'flex', gap: 10, padding: '16px 28px' }}
            >
              <input
                ref={inputRef}
                className="input"
                placeholder="Buscar zapatillas, hoodies, cargos…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button className="btn btn-blue" type="submit">
                Buscar
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="overlay" style={{ zIndex: 99 }} onClick={closeMenu}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '82%',
              maxWidth: 340,
              height: '100%',
              background: 'var(--bg-2)',
              borderRight: '1px solid var(--line)',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <Logo height={26} />
              <button
                className="icon-btn"
                aria-label="Cerrar"
                onClick={closeMenu}
                style={{ border: 'none' }}
              >
                <X size={22} />
              </button>
            </div>
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                onClick={closeMenu}
                className="anton"
                style={{
                  fontSize: 26,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/favoritos"
              onClick={closeMenu}
              className="anton"
              style={{ fontSize: 26, padding: '10px 0', borderBottom: '1px solid var(--line)' }}
            >
              Favoritos {favCount > 0 ? `(${favCount})` : ''}
            </Link>
            {!MOCK && user && !isAdmin && (
              <Link
                to="/mi-cuenta"
                onClick={closeMenu}
                className="anton"
                style={{ fontSize: 26, padding: '10px 0', borderBottom: '1px solid var(--line)' }}
              >
                Mi cuenta {pendingOrders > 0 ? `(${pendingOrders})` : ''}
              </Link>
            )}
            {(!MOCK && !user) && (
              <Link
                to="/mi-cuenta"
                onClick={closeMenu}
                className="anton"
                style={{ fontSize: 26, padding: '10px 0', borderBottom: '1px solid var(--line)' }}
              >
                Iniciar sesión
              </Link>
            )}
            {isAdmin && (
              <button
                className="btn btn-ghost"
                style={{ marginTop: 18 }}
                onClick={() => {
                  closeMenu()
                  navigate('/admin')
                }}
              >
                <SlidersHorizontal size={15} /> Panel admin
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
