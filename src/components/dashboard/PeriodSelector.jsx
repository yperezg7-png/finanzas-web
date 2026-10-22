import { useId } from 'react'
import { monthNames } from '@/lib/period'

// Componente controlado: no almacena una copia del periodo seleccionado.
export default function PeriodSelector({ period, onChange }) {
  const id = useId()
  // Incluir el año actual y el seleccionado aunque queden fuera del intervalo del backend.
  const years = Array.from({ length: 101 }, (_, i) => 2000 + i)
  if (!years.includes(period.anio)) years.push(period.anio)
  return <div className="my-6 flex flex-wrap gap-4" role="group" aria-label="Periodo del dashboard">
    <div><label htmlFor={`${id}-month`} className="mb-2 block text-sm font-medium">Mes</label>
      <select id={`${id}-month`} value={period.mes}
        onChange={(event) => onChange({ ...period, mes: Number(event.target.value) })}
        className="h-9 rounded-md border bg-white px-3 text-sm">
        {monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
      </select>
    </div>
    <div><label htmlFor={`${id}-year`} className="mb-2 block text-sm font-medium">Año</label>
      <select id={`${id}-year`} value={period.anio}
        onChange={(event) => onChange({ ...period, anio: Number(event.target.value) })}
        className="h-9 rounded-md border bg-white px-3 text-sm">
        {years.sort((a, b) => b - a).map((year) => <option key={year} value={year}>{year}</option>)}
      </select>
    </div>
  </div>
}
