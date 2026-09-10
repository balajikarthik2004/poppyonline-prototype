import React, { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatNumber, formatPct, formatUsdCompact } from '@/lib/format'
import { chartColors, colorAt } from '@/lib/chartColors'

/**
 * SegmentedPillDonut
 * A modern segmented ring donut chart with rounded capsule segments,
 * dynamic center metric label, smooth hover expansion, and interactive legend.
 */
export function SegmentedPillDonut({
  data = [],
  title = 'Value by region',
  centerLabel = 'Total FOB',
  formatter = formatUsdCompact,
  className = '',
  colors,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const total = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
  }, [data])

  // Chart dimensions
  const size = 220
  const radius = 80
  const strokeWidth = 18
  const circumference = 2 * Math.PI * radius
  const gap = 12 // pixel gap between rounded capsule segments

  // Calculate arc dash arrays and offsets
  const segments = useMemo(() => {
    if (total === 0) return []
    let cumulativeOffset = 0

    return data.map((item, i) => {
      const val = Number(item.value) || 0
      const pct = val / total
      const rawArcLength = pct * circumference
      const arcLength = Math.max(rawArcLength - gap, 2)
      const dashArray = `${arcLength} ${circumference - arcLength}`
      const dashOffset = -cumulativeOffset

      cumulativeOffset += rawArcLength

      const color = colors?.[i] || colorAt(i)

      return {
        ...item,
        pct: pct * 100,
        dashArray,
        dashOffset,
        color,
      }
    })
  }, [data, total, circumference, gap, colors])

  const activeSegment = hoveredIndex != null ? segments[hoveredIndex] : null

  return (
    <div className={cn('flex flex-col justify-between h-full', className)}>
      {/* SVG Donut with Center Metric */}
      <div className="relative my-auto flex items-center justify-center select-none py-2">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible -rotate-90 transition-transform duration-500"
        >
          {/* Background subtle guide ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-ink-800/60"
          />

          {/* Segmented rounded-cap arcs */}
          {segments.map((seg, i) => {
            const isHovered = hoveredIndex === i
            return (
              <circle
                key={seg.name || i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.dashArray}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  'cursor-pointer transition-all duration-300 ease-out origin-center',
                  isHovered && 'scale-105 filter drop-shadow(0 4px 10px rgba(0,0,0,0.2))',
                  hoveredIndex != null && !isHovered && 'opacity-40',
                )}
              />
            )
          })}
        </svg>

        {/* Dynamic Center Metric Label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {activeSegment ? (
            <>
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary truncate max-w-27.5">
                {activeSegment.name}
              </span>
              <span className="num text-2xl font-black tracking-tight text-foreground">
                {formatter(activeSegment.value)}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {formatPct(activeSegment.pct, 1)}
              </span>
            </>
          ) : (
            <>
              <span className="num text-2xl font-black tracking-tight text-foreground">
                {formatter(total)}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {centerLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend below */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-3 border-t border-border/40 text-xs">
        {segments.map((seg, i) => {
          const isHovered = hoveredIndex === i
          return (
            <button
              key={seg.name || i}
              type="button"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cn(
                'flex items-center justify-between gap-1.5 rounded-md px-1.5 py-1 text-left transition-all cursor-pointer select-none',
                isHovered ? 'bg-accent font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={cn('h-2.5 w-2.5 shrink-0 rounded-full transition-transform', isHovered && 'scale-125')}
                  style={{ backgroundColor: seg.color }}
                />
                <span className="truncate">{seg.name}</span>
              </div>
              <span className="num font-semibold text-foreground shrink-0 text-[11px]">
                {formatPct(seg.pct, 1)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
