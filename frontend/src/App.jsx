import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useThemeStore from './store/themeStore'

// Применяет data-theme на <html> и theme-color в <meta>
function ThemeManager() {
  const { theme, tick } = useThemeStore()
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f2f2f7' : '#09090b')
    }
  }, [theme])
  useEffect(() => {
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])
  return null
}

// Pages
import LoginPage from './pages/LoginPage'
import BarberHome from './pages/barber/BarberHome'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import OwnerBarbers from './pages/owner/OwnerBarbers'
import OwnerBranches from './pages/owner/OwnerBranches'
import AdminDashboard from './pages/admin/AdminDashboard'
import ShopAdminHome from './pages/shopadmin/ShopAdminHome'

function PrivateRoute({ children, role }) {
  const { user, token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { user } = useAuthStore()

  return (
    <>
    <ThemeManager />
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Барбер */}
      <Route path="/barber" element={
        <PrivateRoute role="barber"><BarberHome /></PrivateRoute>
      } />

      {/* Владелец */}
      <Route path="/owner" element={
        <PrivateRoute role="owner"><OwnerDashboard /></PrivateRoute>
      } />
      <Route path="/owner/barbers" element={
        <PrivateRoute role="owner"><OwnerBarbers /></PrivateRoute>
      } />
      <Route path="/owner/branches" element={
        <PrivateRoute role="owner"><OwnerBranches /></PrivateRoute>
      } />

      {/* Платформ-Админ */}
      <Route path="/admin" element={
        <PrivateRoute role="platform_admin"><AdminDashboard /></PrivateRoute>
      } />

      {/* Администратор барбершопа */}
      <Route path="/shop-admin" element={
        <PrivateRoute role="shop_admin"><ShopAdminHome /></PrivateRoute>
      } />

      {/* Редирект по роли */}
      <Route path="/" element={
        user?.role === 'barber' ? <Navigate to="/barber" /> :
        user?.role === 'owner' ? <Navigate to="/owner" /> :
        user?.role === 'platform_admin' ? <Navigate to="/admin" /> :
        user?.role === 'shop_admin' ? <Navigate to="/shop-admin" /> :
        <Navigate to="/login" />
      } />
    </Routes>
    </>
  )
}
