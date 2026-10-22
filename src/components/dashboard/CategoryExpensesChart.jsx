import { useDashboardQuery } from '@/hooks/useDashboardQuery'
import { getCategoryExpenses } from '@/services/dashboard'
import QueryError from '@/components/QueryError'
import { formatearMoneda } from '@/lib/formatters'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { monthNames } from '@/lib/period'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

// El color viene del tema; ChartContainer lo expone como --color-total.
const chartConfig = { total: { label: 'Egresos', color: 'var(--chart-2)' } }

export default function CategoryExpensesChart({ period }) {
  const { anio, mes } = period
  const { loading, data, error, retry } = useDashboardQuery(getCategoryExpenses, period)

  return <Card className="mt-6">
    <CardHeader><CardTitle>Egresos por categoría</CardTitle><CardDescription>{monthNames[mes - 1]} de {anio} · De mayor a menor</CardDescription></CardHeader>
    <CardContent>
      {loading ? <div aria-busy="true" aria-label="Consultando egresos por categoría" className="space-y-5 py-4">{[100, 80, 60, 40].map((width) => <Skeleton key={width} className="h-8" style={{ width: `${width}%` }} />)}</div>
        : error ? <QueryError message={error} onRetry={retry} />
        : data.length === 0 ? <p role="status" className="py-10 text-center text-muted-foreground">No hay egresos registrados en este mes. Registra un egreso o selecciona otro periodo.</p>
        : <>
          <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: Math.max(260, data.length * 56 + 40) }}>
            <BarChart accessibilityLayer data={data} layout="vertical" margin={{ top: 12, right: 115, bottom: 12, left: 8 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" hide domain={[0, 'dataMax']} />
              <YAxis type="category" dataKey="nombre" tickLine={false} axisLine={false} width={110} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent formatter={(value) => <span className="font-medium tabular-nums">{formatearMoneda(value)}</span>} />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} maxBarSize={32} isAnimationActive={false}>
                <LabelList dataKey="total" position="right" offset={8} formatter={(value) => formatearMoneda(value)} fill="var(--foreground)" fontSize={12} />
              </Bar>
            </BarChart>
          </ChartContainer>
          {/* Alternativa textual con los nombres completos y valores para lectores de pantalla. */}
          <ul className="sr-only" aria-label="Montos por categoría">{data.map((row) => <li key={row.categoria_id}>{row.nombre}: {formatearMoneda(row.total)}</li>)}</ul>
        </>}
    </CardContent>
  </Card>
}


