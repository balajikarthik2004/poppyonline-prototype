import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Factory,
  Filter,
  Flame,
  HelpCircle,
  Info,
  Layers,
  Percent,
  RefreshCw,
  Rocket,
  Search,
  Shirt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  PoppysProductionIcon,
  PoppysSalesIcon,
  PoppysPlanningIcon,
  PoppysStyleLibraryIcon,
} from '@/components/icons'

import { useAsync } from '@/hooks/useAsync'
import { getIntelligenceData } from '@/services'
import {
  intelligencePeriods,
  intelligenceCategories,
  intelligenceRegions,
} from '@/mock/intelligence'
import { Am5CategoryDonut } from '@/components/charts/Am5CategoryDonut'
import { Am5ProductionDemandChart } from '@/components/charts/Am5ProductionDemandChart'
import { Am5NewLaunchBarChart } from '@/components/charts/Am5NewLaunchBarChart'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Select, Skeleton } from '@/components/ui'
import { FilterChip, FilterChipGroup } from '@/components/common'
import { formatDate, formatInrCompact, formatNumber, formatPct } from '@/lib/format'
import { cn } from '@/lib/utils'

const categoryColors = [
  '#3f52ab', // Women's Wear
  '#d9534f', // Men's Wear
  '#10b981', // Baby & Infant
  '#8b5cf6', // Kids Wear
  '#d97706', // Home Textiles
]

export function DemandProductionIntelligence() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('30d')
  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('all')
  const [comparePrevious, setComparePrevious] = useState(false)
  const [activeMetric, setActiveMetric] = useState('revenue') // 'revenue' | 'units' | 'growth'
  const [launchFilter, setLaunchFilter] = useState('top') // 'top' | 'atRisk' | 'all'
  const [selectedLaunch, setSelectedLaunch] = useState(null)
  const [expandedWhyRow, setExpandedWhyRow] = useState(null)

  const intelligenceQuery = useAsync(
    () => getIntelligenceData({ period, category, region, comparePrevious }),
    [period, category, region, comparePrevious],
  )

  const data = intelligenceQuery.data
  const categories = data?.categories || []
  const launches = data?.launches || []
  const summary = data?.summary || {
    totalDemand: 0,
    totalProduction: 0,
    totalRevenue: 0,
    overallCoveragePct: 100,
    netTotalGap: 0,
  }

  // Filter launches based on selector ('top' | 'atRisk' | 'all')
  const displayedLaunches = useMemo(() => {
    if (!launches || launches.length === 0) return []
    if (launchFilter === 'top') {
      return launches.filter((l) => l.status === 'Breakout' || l.status === 'On Track').slice(0, 5)
    }
    if (launchFilter === 'atRisk') {
      return launches.filter((l) => l.status === 'Slow' || l.status === 'Underperforming').slice(0, 5)
    }
    return launches.slice(0, 5)
  }, [launches, launchFilter])

  const handleLaunchClick = useCallback((item) => {
    setSelectedLaunch((prev) => (prev?.id === item.id ? null : item))
  }, [])

  return (
    <div className="space-y-4">
      {/* ======================================================== SECTION HEADER & FILTERS ======================================================== */}
      <div className="rounded-2xl border border-brand-500/20 bg-linear-to-r from-card via-card to-brand-500/5 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Executive Decision Intelligence
              </span>
              <span className="hidden sm:inline-block text-muted-foreground/40">•</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Activity className="h-3 w-3 text-emerald-600" />
                Dynamic Demand Coverage
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Demand & Production Intelligence
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Align production with market demand and identify the products and categories driving growth.
            </p>
          </div>

          {/* KPI Mini-Banner */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="rounded-xl border border-border bg-background/80 px-3 py-2 shadow-2xs">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total Sales Demand</div>
              <div className="text-sm font-bold text-foreground">
                {formatNumber(summary.totalDemand)} <span className="text-[10px] font-normal text-muted-foreground">pcs</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/80 px-3 py-2 shadow-2xs">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Floor Output</div>
              <div className="text-sm font-bold text-brand-600 dark:text-brand-400">
                {formatNumber(summary.totalProduction)} <span className="text-[10px] font-normal text-muted-foreground">pcs</span>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/80 px-3 py-2 shadow-2xs">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Demand Coverage</div>
              <div className={cn(
                'text-sm font-bold',
                summary.overallCoveragePct < 80 ? 'text-danger-600' : summary.overallCoveragePct > 110 ? 'text-amber-600' : 'text-emerald-600',
              )}>
                {summary.overallCoveragePct}%{' '}
                <span className="text-[10px] font-normal text-muted-foreground">
                  ({summary.overallCoveragePct < 80 ? 'Shortage' : summary.overallCoveragePct > 110 ? 'Surplus' : 'Balanced'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filters:
            </span>

            {/* Period Selector */}
            <Select
              value={period}
              onValueChange={setPeriod}
              className="h-8 text-xs font-medium w-36"
              options={intelligencePeriods}
            />

            {/* Category Selector */}
            <Select
              value={category}
              onValueChange={setCategory}
              className="h-8 text-xs font-medium w-36"
              options={intelligenceCategories}
            />

            {/* Region Selector */}
            <Select
              value={region}
              onValueChange={setRegion}
              className="h-8 text-xs font-medium w-36"
              options={intelligenceRegions}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setComparePrevious(!comparePrevious)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer select-none shadow-2xs',
                comparePrevious
                  ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                  : 'border-border bg-card text-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full shrink-0 transition-colors',
                  comparePrevious ? 'bg-white' : 'bg-brand-500',
                )}
              />
              <span className={comparePrevious ? 'text-white' : 'text-foreground'}>
                Compare vs Previous Period
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== 3 COORDINATED INTELLIGENCE CHARTS ======================================================== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* ==================================================== CHART 1: CATEGORY DEMAND & SALES (AM5 DONUT + BREAKDOWN) ==================================================== */}
        <Card className="flex flex-col h-full shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base truncate">Category Demand & Sales</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  Which garment categories are driving commercial volume?
                </p>
              </div>

              {/* Metric Toggle Buttons */}
              <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-slate-100 dark:bg-secondary/50 p-1 text-[11px] font-semibold shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveMetric('revenue')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-all duration-150 cursor-pointer select-none font-semibold text-xs whitespace-nowrap',
                    activeMetric === 'revenue'
                      ? 'bg-white dark:bg-card text-brand-700 dark:text-brand-300 font-bold shadow-xs border border-border/60 ring-1 ring-black/5'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-card/40',
                  )}
                >
                  Revenue
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('units')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-all duration-150 cursor-pointer select-none font-semibold text-xs whitespace-nowrap',
                    activeMetric === 'units'
                      ? 'bg-white dark:bg-card text-brand-700 dark:text-brand-300 font-bold shadow-xs border border-border/60 ring-1 ring-black/5'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-card/40',
                  )}
                >
                  Units
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('growth')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-all duration-150 cursor-pointer select-none font-semibold text-xs whitespace-nowrap',
                    activeMetric === 'growth'
                      ? 'bg-white dark:bg-card text-brand-700 dark:text-brand-300 font-bold shadow-xs border border-border/60 ring-1 ring-black/5'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-card/40',
                  )}
                >
                  Growth %
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-3 space-y-2">
            {intelligenceQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">No categories matched the current filter.</div>
            ) : (
              <>
                {/* Am5 Donut Chart with Center KPI (Enlarged) */}
                <div className="relative h-52 sm:h-56 w-full flex items-center justify-center my-0.5">
                  <Am5CategoryDonut
                    data={categories}
                    activeMetric={activeMetric}
                    height={220}
                  />

                  {/* Center Metric Readout Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      TOTAL {activeMetric}
                    </span>
                    <span className="text-base font-bold text-foreground">
                      {activeMetric === 'revenue'
                        ? formatInrCompact(summary.totalRevenue)
                        : activeMetric === 'units'
                        ? `${formatNumber(summary.totalDemand)} pcs`
                        : '+14.2% YoY'}
                    </span>
                  </div>
                </div>

                {/* Category Legend Rows with Balanced Spacing */}
                <div className="space-y-1.5 border-t border-border/50 pt-2 text-xs">
                  {categories.map((cat, idx) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded-md px-2 py-1 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: categoryColors[idx % categoryColors.length] }}
                        />
                        <span className="font-semibold text-foreground text-xs">{cat.name}</span>
                        <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary/80 text-secondary-foreground border border-border/60">
                          {activeMetric === 'revenue'
                            ? `${cat.categorySharePct}% Sales`
                            : activeMetric === 'units'
                            ? `${((cat.unitsSold / (summary.totalDemand || 1)) * 100).toFixed(1)}% Volume`
                            : `+${cat.growthPct}% Growth`}
                        </span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">ASP: ₹{cat.aspInr}</span>
                        <span className="font-bold text-foreground font-mono text-xs">
                          {activeMetric === 'revenue'
                            ? cat.revenueFormatted
                            : activeMetric === 'units'
                            ? `${formatNumber(cat.unitsSold)} pcs`
                            : `+${cat.growthPct}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ==================================================== CHART 2: PRODUCTION VS DEMAND (AM5 CLUSTERED BAR) ==================================================== */}
        <Card className="flex flex-col h-full border-brand-500/30 shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Production vs Demand</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Are we producing enough — or overproducing inventory?
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-secondary/50 px-2.5 py-1 text-xs shadow-2xs">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#3b82f6] shadow-2xs" /> Output
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="h-2.5 w-2.5 rounded-xs bg-[#10b981] shadow-2xs" /> Demand
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-1 space-y-2">
            {intelligenceQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">No categories to compare.</div>
            ) : (
              <>
                {/* Am5 Clustered Column Chart */}
                <div className="h-48 w-full">
                  <Am5ProductionDemandChart
                    data={categories}
                    height={190}
                  />
                </div>

                {/* Coverage & Net Gap Status Matrix */}
                <div className="space-y-1.5 border-t border-border/50 pt-2 text-xs">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded-lg p-1.5 bg-secondary/20"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xs">{cat.name}</span>
                        <Badge
                          variant={
                            cat.demandCoveragePct < 95
                              ? 'danger'
                              : cat.demandCoveragePct > 110
                              ? 'warning'
                              : 'success'
                          }
                          className="text-[9px] px-1.5 py-0 font-semibold"
                        >
                          {cat.demandCoveragePct}% {cat.demandCoveragePct < 95 ? 'Shortage' : cat.demandCoveragePct > 110 ? 'Overprod' : 'Balanced'}
                        </Badge>
                      </div>
                      <div className="text-right text-[11px]">
                        <span
                          className={cn(
                            'font-bold font-mono',
                            cat.netGapUnits < 0 ? 'text-danger-600' : cat.netGapUnits > 0 ? 'text-amber-600' : 'text-foreground',
                          )}
                        >
                          {cat.netGapUnits > 0 ? `+${formatNumber(cat.netGapUnits)}` : formatNumber(cat.netGapUnits)} pcs
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">({cat.action})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ==================================================== CHART 3: NEW LAUNCH PERFORMANCE (AM5 HORIZONTAL BAR) ==================================================== */}
        <Card className="flex flex-col h-full shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">New Launch Performance</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Which newly launched products are gaining or losing traction?
                </p>
              </div>

              {/* View Selector: Top Performers | At Risk | All Launches */}
              <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-slate-100 dark:bg-secondary/50 p-1 text-[11px] font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLaunchFilter('top')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-all duration-150 cursor-pointer select-none font-semibold text-xs',
                    launchFilter === 'top'
                      ? 'bg-white dark:bg-card text-brand-700 dark:text-brand-300 font-bold shadow-xs border border-border/60 ring-1 ring-black/5'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-card/40',
                  )}
                >
                  Top Performers
                </button>
                <button
                  type="button"
                  onClick={() => setLaunchFilter('atRisk')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-all duration-150 cursor-pointer select-none font-semibold text-xs',
                    launchFilter === 'atRisk'
                      ? 'bg-white dark:bg-card text-brand-700 dark:text-brand-300 font-bold shadow-xs border border-border/60 ring-1 ring-black/5'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-card/40',
                  )}
                >
                  At Risk
                </button>
                <button
                  type="button"
                  onClick={() => setLaunchFilter('all')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-all duration-150 cursor-pointer select-none font-semibold text-xs',
                    launchFilter === 'all'
                      ? 'bg-white dark:bg-card text-brand-700 dark:text-brand-300 font-bold shadow-xs border border-border/60 ring-1 ring-black/5'
                      : 'text-slate-600 dark:text-muted-foreground hover:text-foreground hover:bg-white/60 dark:hover:bg-card/40',
                  )}
                >
                  All Launches
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-between pt-1 space-y-2.5">
            {intelligenceQuery.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : displayedLaunches.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">No launches found in this view.</div>
            ) : (
              <>
                {/* Am5 Horizontal Bar Chart */}
                <div className="h-48 w-full">
                  <Am5NewLaunchBarChart
                    data={displayedLaunches}
                    height={190}
                    onBarClick={handleLaunchClick}
                  />
                </div>

                {/* Ranked List with Clickable Drilldown */}
                <div className="space-y-1.5 border-t border-border/50 pt-2">
                  {displayedLaunches.slice(0, 3).map((launch) => {
                    const isSelected = selectedLaunch?.id === launch.id

                    return (
                      <div
                        key={launch.id}
                        onClick={() => setSelectedLaunch(isSelected ? null : launch)}
                        className={cn(
                          'group rounded-lg border p-2 transition-all duration-150 cursor-pointer text-xs',
                          isSelected
                            ? 'border-brand-500 bg-brand-500/10 shadow-2xs'
                            : 'border-border/60 bg-card hover:border-brand-400/50 hover:bg-secondary/30',
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-mono font-bold text-foreground text-xs">{launch.code}</span>
                            <span className="text-muted-foreground truncate text-[11px]">· {launch.name}</span>
                          </div>
                          <Badge
                            variant={
                              launch.status === 'Breakout'
                                ? 'brand'
                                : launch.status === 'On Track'
                                ? 'success'
                                : launch.status === 'Slow'
                                ? 'warning'
                                : 'danger'
                            }
                            className="text-[9px] px-1.5 py-0 font-bold shrink-0"
                          >
                            {launch.statusEmoji} {launch.status}
                          </Badge>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{formatNumber(launch.unitsSold)} pcs sold</span>
                          <span className="font-mono font-bold text-foreground">{launch.revenueFormatted}</span>
                          <span className={cn('font-semibold', launch.growthPct >= 0 ? 'text-emerald-600' : 'text-danger-600')}>
                            {launch.growthPct >= 0 ? `+${launch.growthPct}%` : `${launch.growthPct}%`}
                          </span>
                        </div>

                        {/* Expanded In-line Action Detail when clicked */}
                        {isSelected && (
                          <div className="mt-2 border-t border-border/60 pt-1.5 text-[11px] animate-in fade-in duration-150">
                            <div className="text-muted-foreground">{launch.evidence}</div>
                            <div className="mt-1.5 flex items-center justify-between">
                              <span className="font-semibold text-brand-700 dark:text-brand-300">
                                Action: {launch.recommendedAction}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/planning/production-orders?style=${launch.code}&action=${launch.growthPct >= 0 ? 'increase' : 'reduce'}&source=demand-intelligence`)
                                }}
                                className="h-6 px-2 text-[10px]"
                              >
                                Open Planning →
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== LAYER 4: PRODUCTION RECOMMENDATIONS ======================================================== */}
      <Card className="border-brand-500/30 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Production Recommendations & Strategic Actions</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Data → Insight → Decision: Actionable manufacturing reallocation based on dynamic demand coverage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/planning/production-orders?source=demand-intelligence" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                <PoppysPlanningIcon className="h-4 w-4" />
                Go to Production Planning →
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                  <th className="py-2.5 pl-3 font-semibold text-foreground">Category</th>
                  <th className="py-2.5 text-right font-semibold text-foreground">Market Demand</th>
                  <th className="py-2.5 text-right font-semibold text-foreground">Floor Production</th>
                  <th className="py-2.5 text-right font-semibold text-foreground">Net Gap</th>
                  <th className="py-2.5 text-center font-semibold text-foreground">Dynamic Coverage</th>
                  <th className="py-2.5 text-center font-semibold text-foreground">Executive Action</th>
                  <th className="py-2.5 pr-3 text-right font-semibold text-foreground">Evidence / Why?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((row) => {
                  const isExpanded = expandedWhyRow === row.id

                  return (
                    <tr key={row.id} className="transition-colors hover:bg-secondary/20">
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-600 font-bold text-[10px]">
                            {row.name.slice(0, 1)}
                          </span>
                          <div>
                            <span className="font-bold text-foreground">{row.name}</span>
                            <div className="text-[10px] text-muted-foreground">{row.revenueFormatted} revenue</div>
                          </div>
                        </div>
                      </td>

                      {/* Demand */}
                      <td className="py-3 text-right font-medium text-foreground">
                        {formatNumber(row.demandUnits)} <span className="text-[10px] text-muted-foreground">pcs</span>
                      </td>

                      {/* Production */}
                      <td className="py-3 text-right font-medium text-brand-600 dark:text-brand-400">
                        {formatNumber(row.productionUnits)} <span className="text-[10px] text-muted-foreground">pcs</span>
                      </td>

                      {/* Net Gap: Production - Demand */}
                      <td className="py-3 text-right">
                        <span
                          className={cn(
                            'font-bold',
                            row.netGapUnits < 0
                              ? 'text-danger-600 dark:text-danger-400'
                              : row.netGapUnits > 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-foreground',
                          )}
                        >
                          {row.netGapUnits > 0 ? `+${formatNumber(row.netGapUnits)}` : formatNumber(row.netGapUnits)} pcs
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {row.netGapUnits < 0 ? 'Shortage' : row.netGapUnits > 0 ? 'Surplus' : 'Balanced'}
                        </div>
                      </td>

                      {/* Dynamic Coverage */}
                      <td className="py-3 text-center">
                        <Badge
                          variant={
                            row.demandCoveragePct < 95
                              ? 'danger'
                              : row.demandCoveragePct > 110
                              ? 'warning'
                              : 'success'
                          }
                          className="font-mono text-xs font-bold"
                        >
                          {row.demandCoveragePct}%
                        </Badge>
                      </td>

                      {/* Action Recommendation */}
                      <td className="py-3 text-center">
                        <Badge
                          variant={
                            row.action === 'Increase'
                              ? 'success'
                              : row.action === 'Reduce'
                              ? 'danger'
                              : 'warning'
                          }
                          className="gap-1 font-semibold px-2.5 py-1"
                        >
                          {row.action === 'Increase' && <ArrowUpRight className="h-3.5 w-3.5" />}
                          {row.action === 'Reduce' && <ArrowDownRight className="h-3.5 w-3.5" />}
                          {row.action === 'Maintain' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {row.action} Production
                        </Badge>
                      </td>

                      {/* Evidence / Why Tooltip button */}
                      <td className="py-3 pr-3 text-right">
                        <button
                          type="button"
                          onClick={() => setExpandedWhyRow(isExpanded ? null : row.id)}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-primary hover:bg-secondary/60 transition-colors cursor-pointer"
                        >
                          <HelpCircle className="h-3 w-3" />
                          <span>{isExpanded ? 'Hide' : 'Why?'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Recommendation Evidence Detail Panel */}
          {expandedWhyRow && (
            <div className="mt-3 rounded-xl border border-brand-500/20 bg-brand-500/5 p-3 text-xs animate-in fade-in duration-200">
              {(() => {
                const target = categories.find((c) => c.id === expandedWhyRow)
                if (!target) return null
                return (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">Recommendation Rationale: {target.name}</span>
                        <Badge variant={target.action === 'Increase' ? 'success' : target.action === 'Reduce' ? 'danger' : 'warning'}>
                          {target.action} Production
                        </Badge>
                      </div>
                      <p className="mt-1 text-muted-foreground leading-relaxed">
                        {target.evidence}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/planning/production-orders?category=${target.id}&action=${target.action.toLowerCase()}&source=demand-intelligence`)}
                        className="text-xs gap-1.5"
                      >
                        <PoppysPlanningIcon className="h-3.5 w-3.5" />
                        Reallocate Line Capacity
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
