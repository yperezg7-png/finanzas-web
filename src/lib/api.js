const baseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
const TOKEN_KEY = 'auth_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request(method, endpoint, data) {
  if (!baseUrl) throw new Error('Falta configurar VITE_API_URL en el frontend.')

  const headers = { Accept: 'application/json' }
  const token = tokenStorage.get()
  if (token) headers.Authorization = `Bearer ${token}`

  const options = { method, headers }
  if (data !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(data)
  }

  let response
  try {
    response = await fetch(`${baseUrl}/${endpoint.replace(/^\/+/, '')}`, options)
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0)
  }

  if (response.status === 401) {
    tokenStorage.clear()
    window.dispatchEvent(new Event('auth:unauthorized'))
  }

  const text = await response.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      if (response.ok) {
        throw new ApiError('El servidor devolvió una respuesta que no es JSON.', response.status)
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Error HTTP ${response.status}`,
      response.status,
      payload?.errors || {},
    )
  }
  return payload
}

export const api = {
  get: (endpoint) => request('GET', endpoint),
  post: (endpoint, data) => request('POST', endpoint, data),
  put: (endpoint, data) => request('PUT', endpoint, data),
  delete: (endpoint) => request('DELETE', endpoint),
}

