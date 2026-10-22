import { useDashboardQuery } from '@/hooks/useDashboardQuery'
import { getAnnualSummary } from '@/services/dashboard'
import QueryError from '@/components/QueryError'
import { formatearMoneda } from '@/lib/formatters'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

const compactMoney = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', notation: 'compact' })
const config = {
  ingresos: { label: 'Ingresos', color: 'var(--chart-2)' },
  egresos: { label: 'Egresos', color: 'var(--chart-3)' },
  balance: { label: 'Balance', color: 'var(--chart-5)' },
}

// El rojo del tema y el rombo distinguen los valores negativos sin depender solo del color.
function BalanceDot({ cx, cy, payload }) {
  if (cx == null || cy == null) return null
  return payload.balance < 0
    ? <path d={`M ${cx} ${cy - 5} l 5 5 l -5 5 l -5 -5 Z`} fill="var(--destructive)" stroke="var(--background)" />
    : <circle cx={cx} cy={cy} r={3} fill="var(--color-balance)" />
}

export default function AnnualEvolutionChart({ period }) {
  const { anio } = period
  const { loading, data, error, retry } = useDashboardQuery(getAnnualSummary, period)

  return <Card className="mt-6">
    <CardHeader><CardTitle>Evolución mensual</CardTitle><CardDescription>Enero a diciembre de {anio}. El balance usa línea discontinua; los rombos rojos indican un balance negativo.</CardDescription></CardHeader>
    <CardContent>
      {loading ? <Skeleton aria-label="Consultando evolución mensual" aria-busy="true" className="h-80 w-full" />
        : error ? <QueryError message={error} onRetry={retry} />
        : <>
          <div className="overflow-x-auto">
            <ChartContainer config={config} className="h-80 min-w-[640px] w-full aspect-auto">
              <LineChart accessibilityLayer data={data} margin={{ top: 16, right: 20, bottom: 8, left: 16 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="nombre" interval={0} tickFormatter={(name) => name.slice(0, 3)} tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickFormatter={(value) => compactMoney.format(value)} width={80} tickLine={false} axisLine={false} />
                <ReferenceLine y={0} stroke="var(--foreground)" strokeDasharray="3 3" />
                <ChartTooltip content={<ChartTooltipContent formatter={(value, name) => <div className="flex flex-1 justify-between gap-6"><span className="text-muted-foreground">{config[name]?.label || name}</span><span className="font-medium tabular-nums">{formatearMoneda(value)}</span></div>} />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="linear" dataKey="ingresos" stroke="var(--color-ingresos)" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="linear" dataKey="egresos" stroke="var(--color-egresos)" strokeWidth={2} strokeDasharray="2 3" dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="linear" dataKey="balance" stroke="var(--color-balance)" strokeWidth={2} strokeDasharray="8 4" dot={<BalanceDot />} activeDot={<BalanceDot />} isAnimationActive={false} />
              </LineChart>
            </ChartContainer>
          </div>
          <table className="sr-only"><caption>Evolución mensual de {anio}</caption><thead><tr><th>Mes</th><th>Ingresos</th><th>Egresos</th><th>Balance</th></tr></thead><tbody>{data.map((row) => <tr key={row.mes}><th>{row.nombre}</th><td>{formatearMoneda(row.ingresos)}</td><td>{formatearMoneda(row.egresos)}</td><td>{formatearMoneda(row.balance)}</td></tr>)}</tbody></table>
        </>}
    </CardContent>
  </Card>
}



