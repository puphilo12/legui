import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'
import ScrollToTop from './components/ScrollToTop'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toaster from './components/Toaster'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Favorites from './pages/Favorites'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import MiCuenta from './pages/MiCuenta'
import NotFound from './pages/NotFound'
import MaintenancePage from './pages/MaintenancePage'

function Splash() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
      }}
    >
      <img src="/logo.png" alt="LEGUI" style={{ height: 40, opacity: 0.9 }} />
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  const load = useStore((s) => s.load)
  const initAuth = useStore((s) => s.initAuth)
  const ready = useStore((s) => s.ready)
  const maintenance = useStore((s) => s.settings.maintenance_mode)
  const location = useLocation()

  useEffect(() => {
    load()
    initAuth()
  }, [load, initAuth])

  // El admin sigue funcionando siempre (para poder desactivar el mantenimiento).
  const isAdminRoute = location.pathname.startsWith('/admin')
  if (ready && maintenance && !isAdminRoute) {
    return <MaintenancePage />
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        {!ready ? (
          <Splash />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={<Shop />} />
            <Route path="/producto/:slug" element={<ProductDetail />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/mi-cuenta" element={<MiCuenta />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
      <Footer />
      <CartDrawer />
      <Toaster />
    </>
  )
}
