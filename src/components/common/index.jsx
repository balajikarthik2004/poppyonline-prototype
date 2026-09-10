import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, Skeleton } from '@/components/ui'

/* ---------------------------------------------------------- PageHeader ---- */

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-foreground">
          <span className="h-5 w-1 shrink-0 rounded-full bg-linear-to-b from-brand-400 to-poppy-400" />
          <span className="truncate">{title}</span>
        </h1>
        {description && <p className="mt-1 pl-3.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ------------------------------------------------------------ StatCard ---- */

const statTones = {
  default: {
    title: 'text-muted-foreground',
    borderLeft: 'border-l-4 border-l-border',
    iconBg: 'bg-secondary text-muted-foreground ring-1 ring-border',
    dot: 'bg-muted-foreground',
    actionBg: 'bg-secondary/60 hover:bg-secondary text-foreground',
  },
  brand: {
    title: 'text-brand-600',
    borderLeft: 'border-l-4 border-l-brand-500',
    iconBg: 'bg-brand-50 text-brand-600 ring-1 ring-brand-100',
    dot: 'bg-brand-500',
    actionBg: 'bg-brand-50/70 hover:bg-brand-100/90 text-brand-700',
  },
  poppy: {
    title: 'text-poppy-600',
    borderLeft: 'border-l-4 border-l-poppy-500',
    iconBg: 'bg-poppy-50 text-poppy-600 ring-1 ring-poppy-100',
    dot: 'bg-poppy-500',
    actionBg: 'bg-poppy-50/70 hover:bg-poppy-100/90 text-poppy-700',
  },
  success: {
    title: 'text-success-700',
    borderLeft: 'border-l-4 border-l-success-500',
    iconBg: 'bg-success-50 text-success-700 ring-1 ring-success-100',
    dot: 'bg-success-500',
    actionBg: 'bg-success-50/70 hover:bg-success-100/90 text-success-800',
  },
  warning: {
    title: 'text-warning-700',
    borderLeft: 'border-l-4 border-l-warning-500',
    iconBg: 'bg-warning-50 text-warning-700 ring-1 ring-warning-100',
    dot: 'bg-warning-500',
    actionBg: 'bg-warning-50/70 hover:bg-warning-100/90 text-warning-800',
  },
  danger: {
    title: 'text-danger-600',
    borderLeft: 'border-l-4 border-l-danger-500',
    iconBg: 'bg-danger-50 text-danger-600 ring-1 ring-danger-100',
    dot: 'bg-danger-500',
    actionBg: 'bg-danger-50/70 hover:bg-danger-100/90 text-danger-700',
  },
  info: {
    title: 'text-indigo-600',
    borderLeft: 'border-l-4 border-l-indigo-500',
    iconBg: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100',
    dot: 'bg-indigo-500',
    actionBg: 'bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700',
  },
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = 'default',
  to,
  badge,
  trend,     // string e.g. "+2 vs last 24h"
  trendDir = 'up', // 'up' | 'down'
  actionText, // string e.g. "View all insights →"
  onClick,
}) {
  const toneCfg = statTones[tone] || statTones.default

  const body = (
    <Card
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-200 hover-lift hover:-translate-y-1 hover:shadow-md hover:border-brand-300 cursor-pointer select-none',
        toneCfg.borderLeft,
      )}
      onClick={onClick}
    >
      <div className="p-3.5 pb-2.5 min-w-0">
        {/* Top Header Row: Title on Left, Circular Icon on Right */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className={cn('truncate whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-wider', toneCfg.title)}>
            {label}
          </span>
          {Icon && (
            <div
              className={cn(
                'flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full shadow-2xs transition-transform duration-200 group-hover:scale-110',
                toneCfg.iconBg,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Middle Value with Inline / Tight Trend in Strictly Single Line */}
        <div className="mt-1 flex items-baseline justify-between gap-1 overflow-hidden min-w-0">
          <span className="shrink-0 whitespace-nowrap font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                'truncate whitespace-nowrap inline-flex items-center gap-0.5 text-[10.5px] font-semibold',
                tone === 'danger'
                  ? 'text-danger-600'
                  : trendDir === 'down'
                    ? 'text-emerald-600'
                    : 'text-success-700',
              )}
            >
              <span>{trendDir === 'down' ? '↓' : '↑'}</span>
              <span className="truncate">{trend}</span>
            </span>
          )}
        </div>

        {/* Telemetry / Sublabel Row in Strictly Single Line */}
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-[10.5px] font-semibold tracking-wider uppercase text-muted-foreground truncate whitespace-nowrap min-w-0">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full animate-pulse', toneCfg.dot)} />
          <span className="truncate whitespace-nowrap">{sublabel || 'Live Telemetry'}</span>
        </div>
      </div>

      {/* Bottom Action Footer Bar */}
      {actionText && (
        <div className="px-2.5 pb-2.5 pt-0 min-w-0">
          <div
            className={cn(
              'flex items-center justify-center gap-1 rounded-lg py-1 px-2.5 text-[11px] font-semibold transition-all truncate whitespace-nowrap cursor-pointer',
              toneCfg.actionBg,
            )}
          >
            <span className="truncate whitespace-nowrap">{actionText}</span>
          </div>
        </div>
      )}
    </Card>
  )

  return to ? (
    <Link to={to} className="group block cursor-pointer">
      {body}
    </Link>
  ) : (
    body
  )
}

export function StatGrid({ children, cols = 4, className }) {
  const colClass = {
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    5: 'sm:grid-cols-3 lg:grid-cols-5',
    6: 'sm:grid-cols-3 lg:grid-cols-6',
  }[cols]
  return <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', colClass, className)}>{children}</div>
}

export function StatGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------- FilterChip ---- */

/** Written out in full so Tailwind keeps these classes - never interpolated. */
const activeByTone = {
  brand: 'border-brand-600 bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/25',
  poppy: 'border-poppy-600 bg-poppy-600 text-white shadow-sm ring-2 ring-poppy-500/25',
}

const idleByTone = {
  brand: 'border-border bg-card text-foreground shadow-xs hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800',
  poppy: 'border-border bg-card text-foreground shadow-xs hover:border-poppy-300 hover:bg-poppy-50 hover:text-poppy-800',
}

export function FilterChip({ active, tone = 'brand', className, ...props }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer select-none rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? activeByTone[tone] : idleByTone[tone],
        className,
      )}
      {...props}
    />
  )
}

export function FilterChipGroup({ className, ...props }) {
  return <div className={cn('flex flex-wrap items-center gap-1.5', className)} {...props} />
}

/* ---------------------------------------------------------- EmptyState ---- */

export function EmptyState({ message = 'No records found.', icon: Icon = Inbox, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/40 py-14 text-center',
        className,
      )}
    >
      <Icon className="h-8 w-8 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

/* --------------------------------------------------------- SectionLabel --- */

export function SectionLabel({ children, className }) {
  return <div className={cn('section-label text-poppy-600', className)}>{children}</div>
}

/* --------------------------------------------------------- PageContainer -- */

export function PageContainer({ children, className }) {
  return <div className={cn('space-y-4 p-4 lg:p-6 pb-24 lg:pb-28', className)}>{children}</div>
}

/* ------------------------------------------------------------ InfoBanner -- */

export function InfoBanner({ title, children, className }) {
  return (
    <div
      className={cn(
        'knit relative overflow-hidden rounded-xl bg-linear-to-br from-ink-900 via-ink-800 to-brand-900 px-5 py-4 text-white',
        className,
      )}
    >
      <div className="relative">
        {title && <div className="font-display text-sm font-bold tracking-wide">{title}</div>}
        <div className="mt-1 text-[13px] leading-relaxed text-ink-100">{children}</div>
      </div>
    </div>
  )
}
