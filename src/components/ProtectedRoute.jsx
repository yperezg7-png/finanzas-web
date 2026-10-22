import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
export default function ProtectedRoute() {
  const { user, loading, sessionError } = useAuth()
  const location = useLocation()
  if (loading) return <p role="status" className="p-8">Comprobando sesión…</p>
  if (sessionError) return <main className="p-8"><p role="alert">{sessionError}</p><button onClick={() => window.location.reload()}>Reintentar</button></main>
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
