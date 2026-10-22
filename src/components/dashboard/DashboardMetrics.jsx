import { useDashboardQuery } from '@/hooks/useDashboardQuery'
import { getSummary } from '@/services/dashboard'
import QueryError from '@/components/QueryError'
import { monthNames } from '@/lib/period'
import MetricCard from '@/components/MetricCard'

const metrics = [
  { key: 'ingresos_mes', title: 'Ingresos del mes', path: '/ingresos' },
  { key: 'egresos_mes', title: 'Egresos del mes', path: '/egresos' },
  { key: 'balance_mes', title: 'Balance del mes', balance: true },
  { key: 'balance_acumulado', title: 'Acumulado del año', balance: true },
]

export default function DashboardMetrics({ period }) {
  const { anio, mes } = period
  const { loading, data, error, retry } = useDashboardQuery(getSummary, period)

  const monthLabel = monthNames[mes - 1]
  if (error) return <QueryError message={error} onRetry={retry} />
  return <div aria-label="Métricas financieras" aria-busy={loading} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {metrics.map((metric) => <MetricCard key={metric.key} title={metric.title} balance={metric.balance} to={metric.path ? `${metric.path}?${new URLSearchParams({ anio, mes })}` : undefined}
      description={metric.key === 'balance_acumulado' ? `Balance de enero a ${monthLabel.toLowerCase()} de ${anio}` : `${monthLabel} de ${anio}`}
      value={loading ? undefined : data[metric.key]} loading={loading} />)}
  </div>
}


