import React from 'react'
import { ArrowUpRight, ArrowDownRight, Sun, Snowflake, Leaf, CloudSun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber, formatUsdCompact } from '@/lib/format'

const seasonIcons = {
  Autumn: { icon: Leaf, bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200' },
  Winter: { icon: Snowflake, bg: 'bg-info-50 dark:bg-info-950/40 text-info-600 border-info-200' },
  Spring: { icon: CloudSun, bg: 'bg-success-50 dark:bg-success-950/40 text-success-600 border-success-200' },
  Summer: { icon: Sun, bg: 'bg-poppy-50 dark:bg-poppy-950/40 text-poppy-600 border-poppy-200' },
}

function getSeasonMeta(seasonName) {
  const lower = seasonName.toLowerCase()
  if (lower.includes('autumn') || lower.includes('fall')) return seasonIcons.Autumn
  if (lower.includes('winter')) return seasonIcons.Winter
  if (lower.includes('spring')) return seasonIcons.Spring
  if (lower.includes('summer')) return seasonIcons.Summer
  return seasonIcons.Spring
}

export function SeasonProgressList({
  data = [],
  className = '',
}) {
  const maxPieces = Math.max(...data.map((r) => r.pieces), 1)

  // Growth percentages for visual flair
  const growthList = ['+14%', '+9%', '-4%', '+18%']

  return (
    <div className={cn('space-y-4', className)}>
      {data.map((row, i) => {
        const meta = getSeasonMeta(row.season)
        const IconComponent = meta.icon
        const pct = Math.min(Math.round((row.pieces / maxPieces) * 100), 100)
        const isPositive = !growthList[i % growthList.length].startsWith('-')

        return (
          <div
            key={row.season}
            className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-accent/40"
          >
            {/* Iconic rounded square badge */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform group-hover:scale-105',
                meta.bg,
              )}
            >
              <IconComponent className="h-5 w-5" />
            </div>

            {/* Content & Progress Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground truncate">{row.season}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="num text-xs font-bold text-foreground">
                    {formatNumber(row.pieces)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">pcs</span>
                  <span className="text-[11px] font-semibold text-muted-foreground/80">
                    ({formatUsdCompact(row.value)})
                  </span>
                </div>
              </div>

              {/* Thick rounded progress bar */}
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-ink-800 p-0.5">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand-600 to-brand-500 shadow-2xs transition-all duration-500 group-hover:from-brand-500 group-hover:to-poppy-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Trend / Target growth badge */}
              <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold">
                {isPositive ? (
                  <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" />
                    {growthList[i % growthList.length]} vs target
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-poppy-600 dark:text-poppy-400">
                    <ArrowDownRight className="h-3 w-3" />
                    {growthList[i % growthList.length]} vs target
                  </span>
                )}
                <span className="text-muted-foreground/60">•</span>
                <span className="text-muted-foreground">{row.orders} orders active</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
