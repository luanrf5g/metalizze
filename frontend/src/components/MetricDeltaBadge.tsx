import { TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

function getDeltaClasses(value: number) {
  if (value > 0) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (value < 0) return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-zinc-200 bg-zinc-100 text-zinc-700'
}

interface MetricDeltaBadgeProps {
  value: number
  label: string
}

export function MetricDeltaBadge({ value, label }: MetricDeltaBadgeProps) {
  return (
    <Badge variant="outline" className={getDeltaClasses(value)}>
      {value > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : null}
      {value < 0 ? <TrendingDown className="mr-1 h-3 w-3" /> : null}
      {value > 0 ? '+' : ''}
      {value}% {label}
    </Badge>
  )
}