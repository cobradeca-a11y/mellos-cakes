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
  orange: { icon: '#e55c28', ring: 'rgba(229,92,40,0.12)' },
  green:  { icon: '#16a34a', ring: 'rgba(22,163,74,0.12)' },
  blue:   { icon: '#2563eb', ring: 'rgba(37,99,235,0.12)' },
  purple: { icon: '#9333ea', ring: 'rgba(147,51,234,0.12)' },
  red:    { icon: '#dc2626', ring: 'rgba(220,38,38,0.12)' },
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'orange' }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className="card p-4 md:p-5 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: c.ring }}
      >
        <Icon className="w-5 h-5" style={{ color: c.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-3)' }}>{title}</p>
        <p className="text-xl md:text-2xl font-display font-semibold mt-0.5" style={{ color: 'var(--text-1)' }}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{subtitle}</p>
        )}
        {trend && (
          <p className="text-xs font-medium mt-1" style={{ color: trend.positive ? '#16a34a' : '#dc2626' }}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}
