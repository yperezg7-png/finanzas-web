import { useUrlPeriod } from '@/lib/useUrlPeriod'
import { nombreMes } from '@/lib/formatters'
import PeriodSelector from '@/components/dashboard/PeriodSelector'

export default function MovementsPage({ title }) {
  const [period, setPeriod] = useUrlPeriod()
  return <section>
    <p className="text-sm font-semibold text-emerald-700">Movimientos</p>
    <h1 className="mt-2 text-3xl font-bold">{title}</h1>
    <PeriodSelector period={period} onChange={setPeriod} />
    <p className="mt-4 font-medium">{nombreMes(period.mes)} de {period.anio}</p>
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-slate-600">Aquí se mostrará la gestión de {title.toLowerCase()}.</p>
    </div>
  </section>
}
