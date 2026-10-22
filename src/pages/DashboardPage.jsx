import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useUrlPeriod } from '@/lib/useUrlPeriod'
import { useAuth } from '../auth/useAuth'
import { monthNames } from '@/lib/period'
import PeriodSelector from '@/components/dashboard/PeriodSelector'
import DashboardMetrics from '@/components/dashboard/DashboardMetrics'
const CategoryExpensesChart = lazy(() => import('@/components/dashboard/CategoryExpensesChart'))
const AnnualEvolutionChart = lazy(() => import('@/components/dashboard/AnnualEvolutionChart'))

export default function DashboardPage() {
  const { user } = useAuth()
  // Única fuente del periodo: las secciones lo reciben por props, sin duplicarlo.
  const [period, setPeriod] = useUrlPeriod()
  return <section>
    <p className="text-sm font-semibold text-emerald-700">Resumen financiero</p>
    <h1 className="mt-2 text-3xl font-bold">Dashboard</h1>
    <p className="mt-2 text-slate-600">Bienvenido, {user.name}. Consulta tus métricas por periodo.</p>
    <PeriodSelector period={period} onChange={setPeriod} />
    <h2 className="mb-4 text-lg font-semibold">{monthNames[period.mes - 1]} de {period.anio}</h2>
    <DashboardMetrics period={period} /><Suspense fallback={<Skeleton aria-label="Preparando gráfica de categorías" className="mt-6 h-80 w-full" />}><CategoryExpensesChart period={period} /></Suspense><Suspense fallback={<Skeleton aria-label="Preparando evolución anual" className="mt-6 h-80 w-full" />}><AnnualEvolutionChart period={period} /></Suspense>
  </section>
}




