import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const sections = [
  { to: '/', label: 'Dashboard' },
  { to: '/ingresos', label: 'Ingresos' },
  { to: '/egresos', label: 'Egresos' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function leave() {
    setBusy(true)
    let notice = ''
    try {
      await logout()
    } catch {
      notice = 'Se cerró la sesión en este navegador, pero no se pudo confirmar la revocación en el servidor.'
    } finally {
      setBusy(false)
      navigate('/login', { replace: true, state: { notice } })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 md:flex">
      <aside className="flex flex-col bg-slate-950 p-6 text-white md:fixed md:inset-y-0 md:w-64">
        <p className="text-xl font-bold tracking-tight">Finanzas personales</p>
        <p className="mt-1 text-sm text-slate-400">Control de tu dinero</p>
        <nav aria-label="Navegación principal" className="my-8 flex gap-2 md:flex-col">
          {sections.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 pt-5 md:mt-auto">
          <p className="text-xs text-slate-400">Sesión iniciada como</p>
          <p className="mt-1 break-words font-semibold">{user.name}</p>
          <button type="button" disabled={busy} onClick={leave}
            className="mt-4 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50">
            {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </button>
        </div>
      </aside>
      <main id="contenido" className="min-w-0 flex-1 p-6 md:ml-64 md:p-10">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  )
}
