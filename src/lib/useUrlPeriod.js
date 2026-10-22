import { useSearchParams } from 'react-router-dom'
import { currentPeriod } from '@/lib/period'

// La URL es la única fuente del periodo aplicado.
export function useUrlPeriod({ allowEmpty = false } = {}) {
  const [params, setParams] = useSearchParams()
  const fallback = currentPeriod()
  function read(name, min, max) {
    const raw = params.get(name)
    if (!raw && allowEmpty) return ''
    const value = Number(raw)
    return raw && /^\d+$/.test(raw) && value >= min && value <= max ? value : fallback[name]
  }
  const period = { anio: read('anio', 2000, 2100), mes: read('mes', 1, 12) }
  function setPeriod(next) {
    const updated = new URLSearchParams(params)
    for (const name of ['anio', 'mes']) {
      if (next[name] === '') updated.delete(name)
      else updated.set(name, String(next[name]))
    }
    setParams(updated)
  }
  return [period, setPeriod]
}
