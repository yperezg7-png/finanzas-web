import { Link } from 'react-router-dom'
import { formatearMoneda } from '@/lib/formatters'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function MetricCard({ title, description, value, loading, balance = false, to }) {
  const color = balance && !loading
    ? Number(value) > 0 ? 'text-emerald-700' : Number(value) < 0 ? 'text-red-700' : 'text-slate-900'
    : 'text-slate-900'
  const card = <Card aria-busy={loading} className={to ? 'h-full transition-shadow hover:shadow-md' : undefined}>
    <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
    <CardContent>{loading ? <Skeleton aria-hidden="true" className="h-9 w-40" />
      : <p className={`text-2xl font-bold tabular-nums ${color}`}>{formatearMoneda(value)}</p>}</CardContent>
  </Card>
  return to ? <Link to={to} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4">{card}</Link> : card
}
