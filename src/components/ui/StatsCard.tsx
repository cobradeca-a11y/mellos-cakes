import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: { value: string; positive: boolean }
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'red'
}

const colorMap = {
  orange: { bg: 'bg-orange-50', icon: 'text-brand-500', ring: 'bg-brand-100' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  ring: 'bg-green-100' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'bg-blue-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'bg-purple-100' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    ring: 'bg-red-100' },
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'orange' }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', c.ring)}>
        <Icon className={cn('w-5 h-5', c.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-500 font-medium">{title}</p>
        <p className="text-2xl font-display font-semibold text-neutral-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-green-600' : 'text-red-500')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}
