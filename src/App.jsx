import { BrowserRouter, Link, Routes, Route } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import IngresosPage from './pages/IngresosPage'
import EgresosPage from './pages/EgresosPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage key="login" />} />
          <Route path="/registro" element={<AuthPage key="registro" registration />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="ingresos" element={<IngresosPage />} />
              <Route path="egresos" element={<EgresosPage />} />
              <Route path="*" element={<section><h1 className="text-2xl font-bold">Página no encontrada</h1><Link to="/" className="text-emerald-700 underline">Volver al dashboard</Link></section>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
