import { useEffect, useState } from 'react'

// loader debe ser una función estable exportada por el servicio.
export function useDashboardQuery(loader, { anio, mes }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)
  const key = `${anio}-${mes}-${attempt}`
  const loading = result?.key !== key || result?.loader !== loader
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await loader(anio, mes)
        if (active) setResult({ key, loader, data, error: '' })
      } catch (error) {
        if (active) setResult({ key, loader, data: null, error: error.message })
      }
    }
    load()
    // Preservar la protección ante respuestas atrasadas y desmontajes.
    return () => { active = false }
  }, [loader, anio, mes, key])
  return { loading, data: loading ? null : result.data, error: loading ? '' : result.error,
    retry: () => setAttempt((value) => value + 1) }
}
