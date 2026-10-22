import { useEffect, useId, useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Una instancia nueva por ingreso evita mezclar valores entre creación y edición.
export default function IngresoForm({ ingreso = null, onSaved, onCancel, busy, onBusyChange }) {
  const id = useId()
  const [values, setValues] = useState(() => ({
    fecha: ingreso?.fecha?.slice(0, 10) || '',
    fuente: ingreso?.fuente || '',
    categoria_id: String(ingreso?.categoria_id || ''),
    monto: ingreso?.monto ?? '',
    notas: ingreso?.notas || '',
  }))
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retry, setRetry] = useState(0)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    let current = true
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        // Esta respuesta ya incluye las subcategorías de cada categoría.
        const data = await api.get('/categorias?tipo=ingreso')
        if (!Array.isArray(data)) throw new Error('La respuesta de categorías no es válida.')
        if (current) setCategories(data)
      } catch (error) {
        if (current) setLoadError(error.message)
      } finally {
        if (current) setLoading(false)
      }
    }
    load()
    return () => { current = false }
  }, [retry])

  const category = categories.find((item) => String(item.id) === values.categoria_id)
  function change(name, value) {
    setValues((previous) => ({
      ...previous, [name]: value,
    }))
    setErrors((previous) => ({ ...previous, [name]: undefined }))
  }
  function fieldProps(name) {
    return {
      id: `${id}-${name}`, name, value: values[name], disabled: busy,
      onChange: (event) => change(name, event.target.value),
      'aria-invalid': Boolean(errors[name]?.length),
      'aria-describedby': errors[name]?.length ? `${id}-${name}-error` : undefined,
    }
  }
  function fieldErrors(name) {
    return errors[name]?.length ? <div id={`${id}-${name}-error`} className="mt-1 text-sm text-red-700">{errors[name].map((text, index) => <p key={index}>{text}</p>)}</div> : null
  }
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    onBusyChange(true)
    setErrors({})
    setMessage('')
    let saved
    try {
      // Sin reglas duplicadas: Laravel devuelve 422 con errors por nombre de campo.
      // Conservar monto como cadena y normalizar los campos opcionales a null.
      const payload = { ...values, notas: values.notas || null }
      saved = ingreso
        ? await api.put(`/ingresos/${ingreso.id}`, payload)
        : await api.post('/ingresos', payload)

    } catch (error) {
      setMessage(error.message)
      setErrors(error.status === 422 ? error.errors : {})
      return
    } finally {
      onBusyChange(false)
    }
    onSaved(saved)
  }

  return <form noValidate onSubmit={submit} className="space-y-4">
    <div><label htmlFor={`${id}-fecha`} className="text-sm font-medium">Fecha</label><Input {...fieldProps('fecha')} type="date" />{fieldErrors('fecha')}</div>
    <div><label htmlFor={`${id}-fuente`} className="text-sm font-medium">Fuente</label><Input {...fieldProps('fuente')} />{fieldErrors('fuente')}</div>
    {loading && <p role="status">Cargando categorías…</p>}
    {loadError && <div role="alert"><p className="text-red-700">{loadError}</p><Button type="button" variant="outline" onClick={() => setRetry((n) => n + 1)}>Reintentar categorías</Button></div>}
    {!loading && !loadError && categories.length === 0 && <p role="status">No hay categorías de ingreso disponibles. Crea una categoría antes de registrar el ingreso.</p>}
    <div><label htmlFor={`${id}-categoria_id`} className="text-sm font-medium">Categoría</label>
      <select {...fieldProps('categoria_id')} disabled={busy || loading || Boolean(loadError)} className="block h-9 w-full rounded-md border bg-background px-3 text-sm">
        <option value="">Selecciona una categoría</option>
        {values.categoria_id && !category && <option value={values.categoria_id}>Categoría no disponible</option>}
        {categories.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
      </select>{fieldErrors('categoria_id')}</div>
    <div><label htmlFor={`${id}-monto`} className="text-sm font-medium">Monto (Q)</label><Input {...fieldProps('monto')} inputMode="decimal" placeholder="0.00" />{fieldErrors('monto')}</div>
    <div><label htmlFor={`${id}-notas`} className="text-sm font-medium">Notas (opcional)</label><textarea {...fieldProps('notas')} rows={3} className="block w-full rounded-md border bg-background p-3 text-sm" />{fieldErrors('notas')}</div>
    {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
    <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={onCancel}>Cancelar</Button><Button type="submit" disabled={busy || loading || Boolean(loadError) || categories.length === 0}>{busy ? 'Guardando…' : ingreso ? 'Guardar cambios' : 'Crear ingreso'}</Button></div>
  </form>
}
