import React, { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * BubbleClusterChart
 * A modern, proportional overlapping bubble cluster visualization.
 * Supports interactive hover elevation, tooltips, and linked legend.
 */
export function BubbleClusterChart({
  title = 'Client Demographics',
  badge = 'Satisfaction Score: 4.8',
  icon: Icon,
  data = [
    {
      label: 'Female',
      pct: 55,
      volume: '1.24M pcs',
      bg: 'bg-brand-50/90 dark:bg-ink-900/90',
      text: 'text-brand-950 dark:text-brand-100',
      border: 'border-brand-200 dark:border-brand-800',
      dot: 'bg-brand-300',
      ring: 'ring-brand-400/30',
    },
    {
      label: 'Male',
      pct: 35,
      volume: '790k pcs',
      bg: 'bg-linear-to-br from-brand-800 to-brand-600 text-white',
      text: 'text-white',
      border: 'border-brand-500',
      dot: 'bg-brand-600',
      ring: 'ring-brand-400/40',
    },
    {
      label: 'Children',
      pct: 10,
      volume: '225k pcs',
      bg: 'bg-linear-to-br from-poppy-500 to-poppy-600 text-white',
      text: 'text-white',
      border: 'border-poppy-400',
      dot: 'bg-poppy-500',
      ring: 'ring-poppy-400/40',
    },
  ],
  className = '',
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <div className={cn('flex flex-col justify-between h-full', className)}>
      {/* Header with Title & Badge */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          {Icon ? (
            <Icon className="h-4 w-4 text-primary" />
          ) : (
            <span className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-transparent" />
          )}
          <span className="text-sm font-semibold text-foreground tracking-tight">{title}</span>
        </div>
        {badge && (
          <span className="inline-flex items-center rounded-full bg-secondary/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50">
            {badge}
          </span>
        )}
      </div>

      {/* Bubble Visualization Stage */}
      <div className="relative my-auto flex h-52 w-full items-center justify-center select-none overflow-visible">
        {/* Large Bubble (55%) */}
        {data[0] && (
          <div
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              'absolute left-4 top-2 flex h-34 w-34 cursor-pointer items-center justify-center rounded-full border-2 shadow-sm transition-all duration-300 ease-out',
              data[0].bg,
              data[0].border,
              data[0].text,
              hoveredIndex === 0
                ? cn('z-30 scale-110 shadow-xl ring-4', data[0].ring || 'ring-brand-400/30')
                : hoveredIndex != null
                  ? 'opacity-70 scale-95'
                  : 'z-10',
            )}
          >
            <div className="text-center">
              <span className="num font-bold text-2xl tracking-tight">{data[0].pct}%</span>
              {hoveredIndex === 0 && (
                <div className="mt-0.5 text-[10px] font-medium opacity-90">{data[0].volume}</div>
              )}
            </div>
          </div>
        )}

        {/* Medium Bubble (35%) */}
        {data[1] && (
          <div
            onMouseEnter={() => setHoveredIndex(1)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              'absolute right-6 top-3 flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border-2 shadow-md transition-all duration-300 ease-out',
              data[1].bg,
              data[1].border,
              data[1].text,
              hoveredIndex === 1
                ? cn('z-30 scale-110 shadow-xl ring-4', data[1].ring || 'ring-brand-400/40')
                : hoveredIndex != null
                  ? 'opacity-70 scale-95'
                  : 'z-10',
            )}
          >
            <div className="text-center">
              <span className="num font-bold text-xl tracking-tight">{data[1].pct}%</span>
              {hoveredIndex === 1 && (
                <div className="mt-0.5 text-[10px] font-medium opacity-90">{data[1].volume}</div>
              )}
            </div>
          </div>
        )}

        {/* Small Accent Bubble (10%) */}
        {data[2] && (
          <div
            onMouseEnter={() => setHoveredIndex(2)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              'absolute bottom-3 left-28 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 shadow-lg transition-all duration-300 ease-out',
              data[2].bg,
              data[2].border,
              data[2].text,
              hoveredIndex === 2
                ? cn('z-30 scale-115 shadow-2xl ring-4', data[2].ring || 'ring-poppy-400/40')
                : hoveredIndex != null
                  ? 'opacity-80 scale-95'
                  : 'z-20',
            )}
          >
            <div className="text-center">
              <span className="num font-bold text-base tracking-tight">{data[2].pct}%</span>
              {hoveredIndex === 2 && (
                <div className="text-[9px] font-bold text-white leading-none">{data[2].volume}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend footer */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 pt-2 text-xs border-t border-border/40">
        {data.map((item, idx) => (
          <button
            key={item.label}
            type="button"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              'flex items-center gap-1.5 transition-all cursor-pointer select-none py-0.5 px-1.5 rounded-md',
              hoveredIndex === idx ? 'bg-accent font-semibold text-foreground scale-105' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', item.dot)} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
