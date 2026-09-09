import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge, Button, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/common'

/**
 * The one grid used across the app: client-side sorting and pagination over a
 * plain column definition, so no table library is needed.
 *
 * A column is { key, header, cell?, sortable?, align?, width?, sortValue? }.
 */
export function DataTable({
  columns,
  data,
  isLoading,
  emptyMessage = 'No records found.',
  onRowClick,
  pageSize = 12,
  rowKey = (row, i) => row.id ?? i,
}) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' })
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sort.key) return data
    const column = columns.find((c) => c.key === sort.key)
    const valueOf = column?.sortValue ?? ((row) => row[sort.key])
    return [...data].sort((a, b) => {
      const av = valueOf(a)
      const bv = valueOf(b)
      if (av == null) return 1
      if (bv == null) return -1
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? result : -result
    })
  }, [data, sort, columns])

  const pageCount = Math.ceil(sorted.length / pageSize)
  const safePage = Math.min(page, Math.max(0, pageCount - 1))
  const rows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  function toggleSort(key) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    )
    setPage(0)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!data.length) return <EmptyState message={emptyMessage} />

  return (
    <div className="space-y-3">
      <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60">
              {columns.map((column) => {
                const isSorted = sort.key === column.key
                return (
                  <th
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(
                      'whitespace-nowrap px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                    )}
                  >
                    {column.sortable === false ? (
                      column.header
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          'inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-primary',
                          column.align === 'right' && 'flex-row-reverse',
                          isSorted && 'text-primary',
                        )}
                      >
                        {column.header}
                        {isSorted ? (
                          sort.dir === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        )}
                      </button>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-border/70 transition-colors last:border-0',
                  onRowClick ? 'cursor-pointer hover:bg-accent' : 'hover:bg-secondary/40',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'whitespace-nowrap px-3.5 py-2.5 text-[13px] text-foreground',
                      column.align === 'right' && 'text-right tabular-nums',
                      column.align === 'center' && 'text-center',
                    )}
                  >
                    {column.cell ? column.cell(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page <span className="font-semibold text-foreground">{safePage + 1}</span> of {pageCount} -{' '}
            {data.length} records
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* --------------------------------------------------------- StatusBadge ---- */

const positive = new Set([
  'Completed', 'Running', 'Approved', 'Pass', 'Passed', 'Resolved', 'Closed', 'Delivered',
  'Ready', 'Received', 'Released', 'Available', 'Healthy', 'Active', 'Shipped', 'Sailed',
])
const warning = new Set([
  'In Progress', 'In Production', 'Scheduled', 'Pending', 'Pending Approval', 'In Transit',
  'Investigating', 'Idle', 'Rework', 'Partial', 'Partially Received', 'Under Test', 'Packing',
  'Quarantine', 'On Hold', 'Thin', 'Changeover', 'Revision Requested', 'Re-inspect', 'Development',
  'Under Maintenance', 'Allocated', 'Gated In', 'Submitted', 'Probation', 'In Development',
])
const negative = new Set([
  'Rejected', 'Breakdown', 'Overdue', 'Fail', 'Failed', 'Open', 'Cancelled', 'Stopped',
  'Stop Line', 'Discontinued', 'Review', 'Critical',
])

export function statusVariant(status) {
  if (positive.has(status)) return 'success'
  if (warning.has(status)) return 'warning'
  if (negative.has(status)) return 'danger'
  return 'secondary'
}

const dotByVariant = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  poppy: 'bg-poppy-500',
  brand: 'bg-brand-500',
  secondary: 'bg-muted-foreground/60',
}

export function StatusBadge({ status, variant }) {
  const resolved = variant ?? statusVariant(status)
  return (
    <Badge variant={resolved}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotByVariant[resolved] ?? 'bg-current')} />
      {status}
    </Badge>
  )
}

/* ----------------------------------------------------------- RiskBadge ---- */

const riskLabels = {
  onSchedule: { label: 'On Schedule', variant: 'success' },
  atRisk: { label: 'At Risk', variant: 'warning' },
  delayed: { label: 'Delayed', variant: 'danger' },
  completed: { label: 'Shipped', variant: 'info' },
}

export function RiskBadge({ risk }) {
  const config = riskLabels[risk] ?? { label: risk, variant: 'secondary' }
  return <StatusBadge status={config.label} variant={config.variant} />
}

/* -------------------------------------------------------------- helpers --- */

/** A right-aligned bar behind a percentage, for load and achievement columns. */
export function MiniBar({ value, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-500',
    poppy: 'bg-poppy-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  }
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full', tones[tone])}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="w-11 text-right tabular-nums">{value.toFixed(1)}%</span>
    </div>
  )
}
