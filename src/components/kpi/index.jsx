import { Link } from 'react-router-dom'
import {
  DollarSign,
  Gauge,
  Layers,
  ShieldCheck,
  Shirt,
  Timer,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui'

/** Icon and colour treatment per KPI, kept out of the data layer. */
export const kpiVisuals = {
  garmentOutput: {
    icon: Shirt,
    iconBg: 'bg-brand-50',
    iconRing: 'ring-brand-100',
    iconColor: 'text-brand-600',
  },
  fabricKnitted: {
    icon: Layers,
    iconBg: 'bg-poppy-50',
    iconRing: 'ring-poppy-100',
    iconColor: 'text-poppy-600',
  },
  lineEfficiency: {
    icon: Gauge,
    iconBg: 'bg-info-50',
    iconRing: 'ring-info-100',
    iconColor: 'text-info-600',
  },
  qualityPass: {
    icon: ShieldCheck,
    iconBg: 'bg-success-50',
    iconRing: 'ring-success-100',
    iconColor: 'text-success-600',
  },
  ordersOnTime: {
    icon: Timer,
    iconBg: 'bg-warning-50',
    iconRing: 'ring-warning-100',
    iconColor: 'text-warning-600',
  },
  exportValue: {
    icon: DollarSign,
    iconBg: 'bg-brand-50',
    iconRing: 'ring-brand-100',
    iconColor: 'text-brand-600',
  },
}

export function TrendPill({ trend }) {
  if (!trend) return null
  const { direction, changePct } = trend
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
        direction === 'up' && 'bg-success-50 text-success-700',
        direction === 'down' && 'bg-danger-50 text-danger-700',
        direction === 'flat' && 'bg-secondary text-muted-foreground',
      )}
    >
      <Icon className="h-3 w-3" />
      {direction === 'flat' ? 'flat' : `${direction === 'down' ? '-' : '+'}${changePct}%`}
    </span>
  )
}

export function KpiCard({ kpi }) {
  const visual = kpiVisuals[kpi.id] ?? kpiVisuals.garmentOutput
  const Icon = visual.icon

  return (
    <Link to={kpi.linkTo} className="group block h-full">
      <Card className="hover-lift relative h-full p-4">
        {/* Hairline accent that warms up on hover */}
        <span className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-brand-400 to-poppy-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
              visual.iconBg,
              visual.iconRing,
            )}
          >
            <Icon className={cn('h-4 w-4', visual.iconColor)} />
          </div>
          <div className="min-w-0 text-xs font-medium leading-tight text-muted-foreground">{kpi.label}</div>
        </div>

        <div className="num mt-3.5 text-[1.6rem] font-semibold leading-none text-foreground">
          {kpi.displayValue}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <TrendPill trend={kpi.trend} />
          {kpi.compareLabel && <span className="text-[11px] text-muted-foreground">{kpi.compareLabel}</span>}
          {kpi.footnote && <span className="text-[11px] text-muted-foreground">- {kpi.footnote}</span>}
        </div>
      </Card>
    </Link>
  )
}
