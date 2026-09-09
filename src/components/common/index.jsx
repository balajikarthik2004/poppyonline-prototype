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
  default: 'bg-secondary text-muted-foreground ring-border',
  brand: 'bg-brand-50 text-brand-600 ring-brand-100',
  poppy: 'bg-poppy-50 text-poppy-600 ring-poppy-100',
  success: 'bg-success-50 text-success-600 ring-success-100',
  warning: 'bg-warning-50 text-warning-600 ring-warning-100',
  danger: 'bg-danger-50 text-danger-600 ring-danger-100',
  info: 'bg-info-50 text-info-600 ring-info-100',
}

export function StatCard({ label, value, sublabel, icon: Icon, tone = 'default', to }) {
  const body = (
    <Card className={cn('h-full p-3.5', to && 'hover-lift')}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
              statTones[tone],
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-muted-foreground">{label}</div>
          <div className="num mt-0.5 text-lg font-semibold text-foreground">{value}</div>
          {sublabel && <div className="text-[11px] leading-snug text-muted-foreground">{sublabel}</div>}
        </div>
      </div>
    </Card>
  )

  return to ? (
    <Link to={to} className="block h-full">
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
  return <div className={cn('grid grid-cols-2 gap-3', colClass, className)}>{children}</div>
}

export function StatGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[4.6rem] w-full" />
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
        'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all',
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
  return <div className={cn('space-y-4 p-4 lg:p-6', className)}>{children}</div>
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
