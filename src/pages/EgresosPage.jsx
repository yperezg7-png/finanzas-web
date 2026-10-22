import { useUrlPeriod } from '@/lib/useUrlPeriod'
import { formatearMoneda, formatearFecha } from '@/lib/formatters'
import { monthNames as months } from '@/lib/period'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import EgresoForm from '@/components/EgresoForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'


export default function EgresosPage() {
  const [filters, setFilters] = useUrlPeriod({ allowEmpty: true })
  const params = new URLSearchParams()
  if (filters.anio) params.set('anio', filters.anio)
  if (filters.mes) params.set('mes', filters.mes)
  const query = params.toString()
  const [reload, setReload] = useState(0)
  const [rows, setRows] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let current = true
    // Ignorar respuestas de filtros anteriores y de componentes desmontados.
    async function load() {
      setState({ loading: true, error: '' })
      try {
        const data = await api.get(`/egresos${query ? `?${query}` : ''}`)
        if (!Array.isArray(data)) throw new Error('El servidor devolvió un listado no válido.')
        if (current) { setRows(data); setState({ loading: false, error: '' }) }
      } catch (error) {
        if (current) setState({ loading: false, error: error.message })
      }
    }
    load()
    return () => { current = false }
  }, [query, reload])

  function filter(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    setFilters({ anio: values.anio, mes: values.mes })
    setReload((value) => value + 1)
    setNotice('')
  }
  function open(row, mode) {
    setSelected(row)
    setAction(mode)
    setActionError('')
  }
  async function remove() {
    setBusy(true)
    setActionError('')
    try {
      // Solo se elimina después de confirmar; admite el HTTP 204 del backend.
      await api.delete(`/egresos/${selected.id}`)
      setAction(null)
      setNotice('Egreso eliminado correctamente.')
      setReload((value) => value + 1)
    } catch (error) { setActionError(error.message) }
    finally { setBusy(false) }
  }

  return <section>
    <p className="text-sm font-semibold text-emerald-700">Movimientos</p>
    <h1 className="mt-2 text-3xl font-bold">Egresos</h1>
    <p className="mt-2 text-slate-600">Consulta y administra tus gastos.</p><Button className="mt-4" onClick={() => open(null, 'create')}>Nuevo egreso</Button>
    <form key={query} onSubmit={filter} className="my-6 flex flex-wrap items-end gap-4 rounded-xl border bg-white p-5">
      <div><label htmlFor="year" className="mb-2 block text-sm font-medium">Año</label>
        <Input id="year" name="anio" type="number" min="2000" max="2100" placeholder="Todos" defaultValue={filters.anio} className="w-32" /></div>
      <div><label htmlFor="month" className="mb-2 block text-sm font-medium">Mes</label>
        <select id="month" name="mes" defaultValue={filters.mes} className="h-9 rounded-md border bg-white px-3 text-sm">
          <option value="">Todos los meses</option>{months.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
        </select></div>
      <Button type="submit">Aplicar filtros</Button>
      <Button type="button" variant="outline" onClick={() => { setFilters({ anio: '', mes: '' }); setReload((value) => value + 1) }}>Limpiar</Button>
    </form>
    {notice && <p role="status" className="mb-4 text-emerald-800">{notice}</p>}
    {/* Los estados son excluyentes: no presentar datos antiguos como resultados actuales. */}
    {state.loading ? <p role="status" aria-live="polite" className="rounded-xl border bg-white p-8">Cargando egresos…</p>
      : state.error ? <div role="alert" className="rounded-xl border border-red-200 bg-white p-8"><p className="mb-4 text-red-700">{state.error}</p><Button onClick={() => setReload((value) => value + 1)}>Reintentar</Button></div>
      : rows.length === 0 ? <div className="rounded-xl border bg-white p-10 text-center"><h2 className="text-xl font-semibold">No hay egresos{query ? ' para estos filtros' : ' registrados'}</h2><p className="mt-2 text-slate-600">{query ? 'Prueba otro año o mes, o limpia los filtros.' : '¡Comienza registrando tu primer egreso para llevar el control de tus gastos!'}</p></div>
      : <div className="rounded-xl border bg-white p-2"><Table>
        <TableHeader><TableRow>{['Fecha', 'Descripción', 'Categoría', 'Subcategoría', 'Monto', 'Acciones'].map((label) => <TableHead key={label} className={label === 'Monto' ? 'text-right' : ''}>{label}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map((row) => <TableRow key={row.id}>
          <TableCell className="whitespace-nowrap">{formatearFecha(row.fecha)}</TableCell>
          <TableCell className="max-w-xs whitespace-normal break-words">{row.descripcion}</TableCell>
          <TableCell>{row.categoria?.nombre || '—'}</TableCell>
          <TableCell>{row.subcategoria?.nombre || '—'}</TableCell>
          <TableCell className="text-right whitespace-nowrap font-medium tabular-nums">{formatearMoneda(row.monto)}</TableCell>
          <TableCell><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => open(row, 'edit')} aria-label={`Editar ${row.descripcion}`}>Editar</Button><Button variant="destructive" size="sm" onClick={() => open(row, 'delete')} aria-label={`Eliminar ${row.descripcion}`}>Eliminar</Button></div></TableCell>
        </TableRow>)}</TableBody>
      </Table></div>}
    <Dialog open={action !== null} onOpenChange={(isOpen) => { if (!isOpen && !busy) setAction(null) }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" onEscapeKeyDown={(e) => { if (busy) e.preventDefault() }} onInteractOutside={(e) => { if (busy) e.preventDefault() }}>
        <DialogHeader><DialogTitle>{action === 'delete' ? '¿Eliminar este egreso?' : action === 'create' ? 'Nuevo egreso' : 'Editar egreso'}</DialogTitle><DialogDescription>{action === 'delete' ? `Se eliminará “${selected?.descripcion}”. Esta acción no se puede deshacer.` : 'Completa los datos del egreso. Los campos opcionales están indicados.'}</DialogDescription></DialogHeader>
        {actionError && <p role="alert" className="text-sm text-red-700">{actionError}</p>}
        {action === 'edit' || action === 'create' ? <EgresoForm
          key={selected?.id ?? 'new'} egreso={selected} busy={busy} onBusyChange={setBusy}
          onCancel={() => setAction(null)}
          onSaved={() => {
            setAction(null)
            setNotice(action === 'create' ? 'Egreso creado correctamente.' : 'Egreso actualizado correctamente.')
            setReload((value) => value + 1)
          }} /> : <DialogFooter><Button variant="outline" disabled={busy} onClick={() => setAction(null)}>Cancelar</Button><Button variant="destructive" disabled={busy} onClick={remove}>{busy ? 'Eliminando…' : 'Sí, eliminar'}</Button></DialogFooter>}
      </DialogContent>
    </Dialog>
  </section>
}



