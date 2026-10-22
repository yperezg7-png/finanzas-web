import { Button } from '@/components/ui/button'
export default function QueryError({ message, onRetry }) {
  return <div role="alert" className="rounded-xl border bg-background p-6">
    <p className="mb-4 text-destructive">{message}</p>
    <Button variant="outline" onClick={onRetry}>Reintentar</Button>
  </div>
}
