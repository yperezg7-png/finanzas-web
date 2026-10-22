import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function AuthPage({ registration = false }) {
  const { user, loading, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const destination = location.state?.from
  const target = destination
    ? `${destination.pathname}${destination.search || ''}${destination.hash || ''}`
    : '/'
  if (loading) return <p role="status" className="p-8">Comprobando sesión…</p>
  if (user) return <Navigate to={target} replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setErrors({})
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (registration && data.password !== data.password_confirmation) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setSubmitting(true)
    try {
      await (registration ? register(data) : login(data))
      navigate(target, { replace: true })
    } catch (failure) {
      setError(failure.message)
      setErrors(failure.errors || {})
    } finally {
      setSubmitting(false)
    }
  }
  const fields = [
    ...(registration ? [{ name: 'name', label: 'Nombre', type: 'text', autoComplete: 'name' }] : []),
    { name: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email' },
    { name: 'password', label: 'Contraseña', type: 'password', autoComplete: registration ? 'new-password' : 'current-password' },
    ...(registration ? [{ name: 'password_confirmation', label: 'Confirmar contraseña', type: 'password', autoComplete: 'new-password' }] : []),
  ]
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="mb-2 font-semibold text-emerald-700">Finanzas personales</p>
        <h1 className="mb-6 text-2xl font-bold">{registration ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p role="status" className="mb-4 text-sm text-amber-800">{location.state?.notice}</p><form onSubmit={submit} className="space-y-4">
          {fields.map((field) => <div key={field.name}>
            <label htmlFor={field.name} className="mb-1 block text-sm font-medium">{field.label}</label>
            <input {...field} id={field.name} required disabled={submitting}
              minLength={registration && field.type === 'password' ? 8 : undefined}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              className="w-full rounded-lg border border-slate-300 p-3 focus:outline-emerald-600" />
            {errors[field.name] && <p id={`${field.name}-error`} className="text-sm text-red-700">{errors[field.name].join(' ')}</p>}
          </div>)}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button disabled={submitting} className="w-full rounded-lg bg-emerald-700 p-3 font-semibold text-white disabled:opacity-50">
            {submitting ? 'Procesando…' : registration ? 'Registrarme' : 'Entrar'}
          </button>
        </form>
        <Link to={registration ? '/login' : '/registro'} state={location.state} className="mt-5 block text-sm text-emerald-800 underline">
          {registration ? 'Ya tengo cuenta' : 'Crear una cuenta'}
        </Link>
      </section>
    </main>
  )
}

