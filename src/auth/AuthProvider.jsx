import { useEffect, useState } from 'react'
import { api, tokenStorage } from '../lib/api'
import { AuthContext } from './useAuth'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let active = true
    const invalidate = () => { setUser(null); setSessionError('') }
    window.addEventListener('auth:unauthorized', invalidate)
    async function restore() {
      try {
        if (tokenStorage.get()) {
          const current = await api.get('/user')
          if (active) setUser(current)
        }
      } catch (error) {
        if (active && error.status !== 401) setSessionError(error.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    restore()
    return () => {
      active = false
      window.removeEventListener('auth:unauthorized', invalidate)
    }
  }, [])

  async function authenticate(endpoint, credentials) {
    const result = await api.post(endpoint, credentials)
    if (!result.token || !result.user) throw new Error('La respuesta de sesión no es válida.')
    tokenStorage.set(result.token)
    setUser(result.user)
    setSessionError('')
  }
  async function logout() {
    try {
      await api.post('/logout')
    } finally {
      tokenStorage.clear()
      setUser(null)
      setSessionError('')
    }
  }
  return (
    <AuthContext.Provider value={{ user, loading, sessionError,
      login: (data) => authenticate('/login', data),
      register: (data) => authenticate('/register', data), logout }}>
      {children}
    </AuthContext.Provider>
  )
}
