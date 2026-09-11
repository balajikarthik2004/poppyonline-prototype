import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleSlash,
  Clock,
  Cpu,
  Factory,
  Gauge,
  Layers,
  LayoutGrid,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  Timer,
  TriangleAlert,
  Users,
  Wrench,
  X,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import {
  getBottleneckInsights,
  getDefectCodes,
  getDetailedSewingLines,
  getProductionHistory,
  getSewingLines,
  getStageDetail,
  getStageMachines,
  getWipStock,
} from '@/services'
import { processStages } from '@/mock/units'
import {
  PageContainer,
  PageHeader,
  StatCard,
  StatGrid,
  StatGridSkeleton,
  EmptyState,
  FilterChip,
  FilterChipGroup,
} from '@/components/common'
import { DataTable, MiniBar, StatusBadge } from '@/components/tables'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress, Skeleton } from '@/components/ui'
import { formatNumber, formatPct } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt, statusColors } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

/* ============================================================ Overview ==== */

export function ProductionOverview() {
  const { dateRangePreset } = useAppStore()
  const history = useAsync(() => getProductionHistory(dateRangePreset), [dateRangePreset])
  const wip = useAsync(() => getWipStock('all'), [])
  const bottlenecks = useAsync(() => getBottleneckInsights(), [])

  /** Route throughput: how much each stage produced over the selected window. */
  const routeTotals = useMemo(() => {
    const rows = history.data ?? []
    return processStages.map((stage) => {
      const output = rows.reduce((s, r) => s + (r[stage.key] ?? 0), 0)
      const target = rows.reduce((s, r) => s + (r[`${stage.key}Target`] ?? 0), 0)
      const stageWip = (wip.data ?? []).filter((w) => w.stageKey === stage.key)
      const totalWipPcs = stageWip.reduce((sum, w) => sum + w.quantityPcs, 0)
      const hasAgingWip = stageWip.some((w) => w.isAging)

      return {
        key: stage.key,
        label: stage.label,
        path: stage.path,
        unitOfMeasure: stage.unitOfMeasure,
        output,
        target,
        achievementPct: target ? Math.round((output / target) * 1000) / 10 : 0,
        dailyCapacity: stage.dailyCapacity,
        machines: stage.machines,
        totalWipPcs,
        hasAgingWip,
      }
    })
  }, [history.data, wip.data])

  const trend = useMemo(
    () =>
      (history.data ?? []).map((r) => ({
        label: r.label,
        knitting: r.knitting,
        sewing: r.sewing,
        packing: r.packing,
        efficiencyPct: r.efficiencyPct,
      })),
    [history.data],
  )

  const latest = (history.data ?? [])[history.data?.length - 1]

  return (
    <PageContainer>
      <PageHeader
        title="Manufacturing Execution & Command Center"
        description="Factory-level operational command connecting Capacity, Machines, Hourly Run-Rates, WIP Buffer Aging, and Orders at Risk."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/ai/shop-floor">
              <Button variant="default" size="sm" className="gap-1.5 bg-brand-600 hover:bg-brand-700">
                <Factory className="h-3.5 w-3.5" />
                24-Line Sewing Digital Twin
              </Button>
            </Link>
          </div>
        }
      />

      {history.isLoading || !latest ? (
        <StatGridSkeleton count={5} />
      ) : (
        <StatGrid cols={5}>
          <StatCard
            label="Fabric knitted"
            value={`${(latest.knitting / 1000).toFixed(1)} t`}
            sublabel="today, vs 10 t capacity"
            icon={Layers}
            tone="brand"
            to="/production/knitting"
          />
          <StatCard
            label="Garments sewn"
            value={formatNumber(latest.sewing)}
            sublabel="vs 100,000 pcs capacity"
            icon={Factory}
            tone="info"
            to="/production/sewing"
          />
          <StatCard
            label="Packed for export"
            value={formatNumber(latest.packing)}
            sublabel="ready for container stuffing"
            icon={Activity}
            tone="success"
            to="/production/packing"
          />
          <StatCard label="Overall OEE" value={formatPct(latest.oeePct)} icon={Gauge} tone="poppy" />
          <StatCard
            label="Sewing efficiency"
            value={formatPct(latest.efficiencyPct)}
            sublabel={`Floor DHU ${latest.dhuPct}%`}
            icon={Gauge}
            tone="warning"
            to="/ai/shop-floor"
          />
        </StatGrid>
      )}

      {/* Real-time WIP -> Bottleneck -> Order Risk Warning Banner */}
      <Card className="border-danger-200 bg-linear-to-r from-danger-50/50 via-card to-card">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-danger-900">
                <AlertOctagon className="h-5 w-5 text-danger-600" />
                Active WIP Buffer Bottleneck & Order Risk Engine
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Consumes upstream-to-downstream WIP buffer aging and capacity deficits to identify at-risk Export Orders
              </p>
            </div>
            <Badge variant="danger" className="animate-pulse font-mono">
              {(bottlenecks.data ?? []).length} Active Bottlenecks Detected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {bottlenecks.isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {(bottlenecks.data ?? []).map((bn) => (
                <div
                  key={bn.id}
                  className="flex flex-col justify-between rounded-xl border border-danger-200 bg-background/80 p-3.5 shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-semibold text-foreground">
                        {bn.upstreamStage} <span className="text-muted-foreground">$\rightarrow$</span> {bn.downstreamStage}
                      </span>
                      <Badge variant={bn.severity === 'Critical' ? 'danger' : 'warning'}>
                        {bn.severity}
                      </Badge>
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between rounded-lg bg-secondary/50 p-2 text-xs">
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">WIP Waiting</div>
                        <div className="font-bold text-foreground">{formatNumber(bn.wipPcs)} pcs</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">Buffer Age</div>
                        <div className="font-bold text-danger-600">{bn.bufferAgeDays} days 🔴</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground uppercase">Capacity Deficit</div>
                        <div className="font-bold text-danger-600">{bn.deficitPct}%</div>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <div className="text-[11px] font-semibold text-muted-foreground">Impacted Orders:</div>
                      {bn.impactedOrders.map((ord) => (
                        <div
                          key={ord.orderNo}
                          className="flex items-center justify-between rounded-md border border-border bg-card px-2 py-1 text-[11px]"
                        >
                          <span className="font-medium text-foreground">
                            {ord.orderNo} ({ord.buyerName})
                          </span>
                          <span className="text-danger-600 font-semibold">+{ord.delayRiskDays}d Risk</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">Mitigation: </span>
                    {bn.mitigationAction}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 9-Stage Route Throughput & WIP Flow Heatmap */}
      <Card className="border-brand-100">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>9-Stage Manufacturing Spine Throughput & Connected WIP Flow</CardTitle>
              <p className="text-xs text-muted-foreground">
                Output achievement against capacity with connected WIP buffer bottleneck status
              </p>
            </div>
            <Badge variant="brand">WIP $\rightarrow$ Production Sync</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {history.isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : (
            <div className="space-y-2.5">
              {routeTotals.map((stage, i) => (
                <Link
                  key={stage.key}
                  to={stage.path}
                  className="block rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-accent/40"
                >
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
                        style={{ backgroundColor: colorAt(i) }}
                      >
                        {i + 1}
                      </span>
                      <span className="font-semibold text-foreground">{stage.label}</span>
                      <span className="hidden text-muted-foreground sm:inline">({stage.machines})</span>
                    </span>
                    <div className="flex items-center gap-3">
                      {stage.totalWipPcs > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          WIP in buffer:{' '}
                          <span className={cn('font-medium', stage.hasAgingWip ? 'text-danger-600 font-bold' : 'text-foreground')}>
                            {formatNumber(stage.totalWipPcs)} pcs {stage.hasAgingWip && '🔴'}
                          </span>
                        </span>
                      )}
                      <span className="tabular-nums text-muted-foreground">
                        {formatNumber(stage.output)} {stage.unitOfMeasure} of {formatNumber(stage.target)} -{' '}
                        <span
                          className={cn(
                            'font-semibold',
                            stage.achievementPct >= 92
                              ? 'text-success-700'
                              : stage.achievementPct >= 80
                                ? 'text-warning-700'
                                : 'text-danger-700',
                          )}
                        >
                          {formatPct(stage.achievementPct)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={stage.achievementPct}
                    indicatorClassName={
                      stage.achievementPct >= 92
                        ? 'bg-success-500'
                        : stage.achievementPct >= 80
                          ? 'bg-warning-500'
                          : 'bg-danger-500'
                    }
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fabric vs garment output</CardTitle>
            <p className="text-xs text-muted-foreground">Knitted kilos against sewn and packed pieces</p>
          </CardHeader>
          <CardContent>
            {history.isLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trend} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={axisTick}
                      axisLine={false}
                      tickLine={false}
                      width={46}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v, n) => [formatNumber(v), n]} />
                    <Bar dataKey="sewing" name="Sewn" radius={[4, 4, 0, 0]} maxBarSize={26} fill={statusColors.brand} />
                    <Bar dataKey="packing" name="Packed" radius={[4, 4, 0, 0]} maxBarSize={26} fill={statusColors.info} />
                    <Line
                      type="monotone"
                      dataKey="knitting"
                      name="Knitted kg"
                      stroke={statusColors.poppy}
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sewing efficiency curve</CardTitle>
            <p className="text-xs text-muted-foreground">Floor efficiency across the selected window</p>
          </CardHeader>
          <CardContent>
            {history.isLoading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={statusColors.brand} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={statusColors.brand} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis
                      domain={[40, 100]}
                      tick={axisTick}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, 'Efficiency']} />
                    <Area
                      type="monotone"
                      dataKey="efficiencyPct"
                      stroke={statusColors.brand}
                      strokeWidth={2}
                      fill="url(#effGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}


/* ========================================================= ProcessPage ==== */

export function ProcessPage() {
  const { stageKey } = useParams()
  const { dateRangePreset } = useAppStore()
  const detail = useAsync(() => getStageDetail(stageKey, dateRangePreset), [stageKey, dateRangePreset])
  const stageMachines = useAsync(() => getStageMachines(stageKey), [stageKey])
  const wip = useAsync(() => getWipStock('all'), [])
  const defects = useAsync(() => getDefectCodes(), [])

  // State for interactive machine parameter configuration tuning
  const [selectedMachineConfig, setSelectedMachineConfig] = useState(null)

  const stage = detail.data?.stage
  const stageWip = useMemo(
    () => (wip.data ?? []).filter((w) => w.stageKey === stageKey || w.stage === stage?.label),
    [wip.data, stageKey, stage?.label],
  )
  const stageDefects = useMemo(
    () => (defects.data ?? []).filter((d) => d.stage?.toLowerCase().includes(stageKey?.toLowerCase() || '')),
    [defects.data, stageKey],
  )

  // If this is sewing, redirect to or render the rich 24-line sewing digital twin directly
  if (stageKey === 'sewing') {
    return <ShopFloor />
  }

  if (detail.isError) {
    return (
      <PageContainer>
        <EmptyState message="That production stage does not exist." icon={CircleSlash} />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={stage?.label ?? 'Production stage'}
        description={stage?.blurb}
        actions={
          <div className="flex items-center gap-2">
            {stage && (
              <Badge variant="brand">
                Capacity {formatNumber(stage.dailyCapacity)} {stage.unitOfMeasure}/day
              </Badge>
            )}
            <Badge variant="outline">
              Configurable Specs Engine
            </Badge>
          </div>
        }
      />

      {detail.isLoading || !detail.data ? (
        <StatGridSkeleton count={5} />
      ) : (
        <StatGrid cols={5}>
          <StatCard
            label="Output"
            value={`${formatNumber(detail.data.totalOutput)} ${stage.unitOfMeasure}`}
            sublabel="selected window"
            icon={Layers}
            tone="brand"
          />
          <StatCard
            label="Achievement"
            value={formatPct(detail.data.achievementPct)}
            sublabel="against capacity"
            icon={Gauge}
            tone={detail.data.achievementPct >= 90 ? 'success' : 'warning'}
          />
          <StatCard
            label="Daily average"
            value={`${formatNumber(detail.data.avgDaily)} ${stage.unitOfMeasure}`}
            icon={Activity}
            tone="info"
          />
          <StatCard
            label="Active machines"
            value={`${(stageMachines.data ?? []).length || detail.data.running} / ${detail.data.machines.length}`}
            sublabel={`${formatPct(detail.data.utilisationPct)} utilisation`}
            icon={Wrench}
            tone="poppy"
          />
          <StatCard
            label="Machines down"
            value={detail.data.down}
            icon={TriangleAlert}
            tone={detail.data.down > 0 ? 'danger' : 'success'}
            to="/maintenance/breakdowns"
          />
        </StatGrid>
      )}

      {/* Upstream / Downstream WIP Buffer Linkage Card */}
      <Card className="border-brand-100 bg-linear-to-r from-brand-50/50 via-card to-card">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-4.5 w-4.5 text-brand-600" />
                Upstream & Downstream WIP Buffer Linkage
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Tracks incoming buffer queue waiting and downstream handoff for this stage
              </p>
            </div>
            <Badge variant={stageWip.some((w) => w.isAging) ? 'warning' : 'success'}>
              {stageWip.some((w) => w.isAging) ? 'Aging WIP Detected 🔴' : 'Healthy Buffer Flow'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Input Buffer Waiting</div>
              <div className="mt-1 font-display text-lg font-bold text-foreground">
                {formatNumber(stageWip.reduce((s, w) => s + w.quantityPcs, 0))} pcs
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Across {stageWip.reduce((s, w) => s + w.styles, 0)} active work styles
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Buffer Transit Age</div>
              <div className="mt-1 font-display text-lg font-bold text-foreground">
                {stageWip.length ? (stageWip.reduce((s, w) => s + w.ageDays, 0) / stageWip.length).toFixed(1) : '1.8'} days
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Bottleneck Threshold: &gt; 3.5 days
              </div>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase">Rush Priority Lots</div>
              <div className="mt-1 font-display text-lg font-bold text-danger-600">
                {stageWip.filter((w) => w.priority === 'Rush').length} lots
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Linked to committed export ship dates
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurable Machines & Process Operational Specs */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-4.5 w-4.5 text-brand-600" />
                Configurable Machine Roster & Operational Parameters ({stage?.label})
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Operational attributes (Gauges, Diameters, Liquor Ratios, Curing Temp, Speeds) are fully configurable per machine instance.
              </p>
            </div>
            <Badge variant="secondary">Unit: {stage?.unitOfMeasure}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(stageMachines.data ?? []).map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-700">{m.id}</span>
                      <span className="font-semibold text-foreground">{m.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{m.type} - {m.unitName}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>

                {/* Configurable Operational Specs Badges */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 rounded-lg bg-secondary/50 p-2.5 text-xs sm:grid-cols-3">
                  {Object.entries(m.config || {}).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-semibold text-foreground">{String(v)}</span>
                    </div>
                  ))}
                </div>

                {/* Current Active Job */}
                {m.currentJob && (
                  <div className="mt-3 rounded-lg border border-border/70 bg-background/60 p-2.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Active Job: <strong className="text-foreground">{m.currentJob.orderNo}</strong> ({m.currentJob.buyerName})</span>
                      {m.currentJob.defectRatePct !== undefined && (
                        <span className="text-warning-700 font-semibold">Defect: {m.currentJob.defectRatePct}%</span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {m.currentJob.fabric || m.currentJob.shadeName || m.currentJob.artworkRef || m.currentJob.designRef || m.currentJob.styleNo}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily output vs capacity trajectory</CardTitle>
          <p className="text-xs text-muted-foreground">
            {stage ? `${stage.machines} - measured in ${stage.unitOfMeasure}` : ''}
          </p>
        </CardHeader>
        <CardContent>
          {detail.isLoading || !detail.data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={detail.data.history} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    contentStyle={chartTooltipStyle}
                    formatter={(value, name) => [
                      `${formatNumber(value)} ${stage.unitOfMeasure}`,
                      name === 'output' ? 'Output' : 'Capacity',
                    ]}
                  />
                  <Bar dataKey="output" name="output" radius={[4, 4, 0, 0]} maxBarSize={34}>
                    {detail.data.history.map((row, i) => (
                      <Cell
                        key={i}
                        fill={row.achievementPct >= 90 ? statusColors.brand : statusColors.warning}
                      />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="target"
                    stroke={statusColors.poppy}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Installed Machines Ledger</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                { key: 'code', header: 'Machine', cell: (r) => <span className="font-medium">{r.code}</span> },
                { key: 'make', header: 'Make' },
                { key: 'model', header: 'Model' },
                { key: 'unitName', header: 'Unit' },
                ...(stageKey === 'knitting'
                  ? [
                      { key: 'gauge', header: 'Gauge' },
                      { key: 'diameterInch', header: 'Dia', align: 'right', cell: (r) => (r.diameterInch ? `${r.diameterInch}"` : '-') },
                    ]
                  : []),
                {
                  key: 'capacityPerDay',
                  header: 'Capacity/day',
                  align: 'right',
                  cell: (r) => `${formatNumber(r.capacityPerDay)} ${r.unitOfMeasure}`,
                },
                {
                  key: 'utilisationPct',
                  header: 'Utilisation',
                  align: 'right',
                  cell: (r) => <MiniBar value={r.utilisationPct} tone={r.utilisationPct > 80 ? 'success' : 'warning'} />,
                },
                { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
              ]}
              data={detail.data?.machines ?? []}
              isLoading={detail.isLoading}
              pageSize={10}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Defect & Rejection Log</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (detail.data?.rejections ?? []).length === 0 ? (
              <EmptyState message="No rejections recorded at this stage." />
            ) : (
              <div className="divide-y divide-border">
                {detail.data.rejections.slice(0, 6).map((row) => (
                  <div key={row.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-foreground">{row.reason}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {row.styleNo} - {row.buyerName}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-[13px] font-semibold tabular-nums text-danger-600">
                        {formatNumber(row.qtyPcs)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{row.disposition}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stage && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Downstream Output Handoff:</span>
          {stage.outputs.map((output) => (
            <Badge key={output} variant="outline">
              {output}
            </Badge>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

/* ============================================================ ShopFloor === */

export function ShopFloor() {
  const { unitId } = useAppStore()
  const [filterUnit, setFilterUnit] = useState(null)
  const lines = useAsync(() => getDetailedSewingLines(filterUnit || unitId), [filterUnit, unitId])

  // Selected line for deep digital twin inspection drawer
  const [selectedLine, setSelectedLine] = useState(null)

  const stats = useMemo(() => {
    const rows = lines.data ?? []
    return {
      lines: rows.length,
      operators: rows.reduce((s, r) => s + (r.operators?.total || r.operators || 0), 0),
      target: rows.reduce((s, r) => s + (r.production?.dailyTarget || r.targetPcs || 0), 0),
      actual: rows.reduce((s, r) => s + (r.production?.actualPcs || r.actualPcs || 0), 0),
      avgEff: rows.length
        ? Math.round(rows.reduce((s, r) => s + (r.production?.efficiencyPct || r.efficiencyPct || 0), 0) / rows.length)
        : 0,
      avgDhu: rows.length
        ? (rows.reduce((s, r) => s + (r.production?.dhuPct || r.dhuPct || 0), 0) / rows.length).toFixed(1)
        : '0.0',
      bottlenecks: rows.filter((r) => r.status === 'Bottleneck' || r.efficiencyPct < 70).length,
    }
  }, [lines.data])

  return (
    <PageContainer>
      <PageHeader
        title="24-Line Sewing Digital Twin & Execution Command Center"
        description="Deepest operational floor matrix combining 24 Lines, Hourly Run-Rate, SMV Efficiency, Operator Loading, DHU Defects, Cut-WIP Availability, and Export Order Risk."
        actions={
          <Badge variant="brand" className="px-3 py-1 text-xs">
            24 Lines Live Simulation
          </Badge>
        }
      />

      <StatGrid cols={5}>
        <StatCard label="Active lines" value={stats.lines} icon={Factory} tone="brand" />
        <StatCard label="Total floor operators" value={formatNumber(stats.operators)} icon={Users} tone="info" />
        <StatCard label="Target today" value={formatNumber(stats.target)} icon={Layers} tone="poppy" />
        <StatCard
          label="Actual output (Shift H6)"
          value={formatNumber(stats.actual)}
          sublabel={`Floor Avg ${stats.avgEff}% SMV Eff.`}
          icon={Gauge}
          tone={stats.actual >= stats.target * 0.7 ? 'success' : 'warning'}
        />
        <StatCard
          label="Bottleneck lines"
          value={stats.bottlenecks}
          sublabel={`Floor DHU ${stats.avgDhu}%`}
          icon={TriangleAlert}
          tone={stats.bottlenecks > 0 ? 'danger' : 'success'}
        />
      </StatGrid>

      <FilterChipGroup>
        <FilterChip active={!filterUnit} onClick={() => setFilterUnit(null)}>
          All Units (24 Lines)
        </FilterChip>
        <FilterChip active={filterUnit === 'U-I'} onClick={() => setFilterUnit('U-I')}>
          Unit I (Lines 01–12)
        </FilterChip>
        <FilterChip active={filterUnit === 'U-II'} onClick={() => setFilterUnit('U-II')}>
          Unit II (Lines 13–24)
        </FilterChip>
      </FilterChipGroup>

      {/* 24-Line Detailed Digital Twin Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sewing Lines Execution & Pacing Matrix (Click row to inspect digital twin)</CardTitle>
              <p className="text-xs text-muted-foreground">
                Hourly run-rates, operator loading, DHU quality, and cut bundle availability
              </p>
            </div>
            <span className="text-xs text-muted-foreground">24 Lines Loaded</span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Line',
                cell: (r) => (
                  <button
                    type="button"
                    onClick={() => setSelectedLine(r)}
                    className="font-bold text-primary hover:underline"
                  >
                    {r.name}
                  </button>
                ),
              },
              { key: 'unitName', header: 'Unit' },
              {
                key: 'styleNo',
                header: 'Active Style & Buyer',
                cell: (r) => (
                  <div>
                    <div className="font-semibold text-foreground">{r.tiedOrder?.styleNo || r.styleNo}</div>
                    <div className="text-[11px] text-muted-foreground">{r.tiedOrder?.buyerName || r.buyerName}</div>
                  </div>
                ),
              },
              {
                key: 'operators',
                header: 'Operators',
                align: 'right',
                cell: (r) => (
                  <span>
                    <strong>{r.operators?.total || r.operators}</strong>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({r.operators?.tailors || 'T'}T/{r.operators?.helpers || 'H'}H)
                    </span>
                  </span>
                ),
              },
              {
                key: 'hourlyTarget',
                header: 'Hourly Target',
                align: 'right',
                cell: (r) => `${r.production?.hourlyTarget || Math.round(r.targetPcs / 8)} pcs/h`,
              },
              {
                key: 'actualPcs',
                header: 'Actual Output',
                align: 'right',
                cell: (r) => <span className="font-bold">{formatNumber(r.production?.actualPcs || r.actualPcs)}</span>,
              },
              {
                key: 'efficiencyPct',
                header: 'SMV Eff.',
                align: 'right',
                cell: (r) => {
                  const eff = r.production?.efficiencyPct || r.efficiencyPct
                  return (
                    <span
                      className={cn(
                        'font-bold',
                        eff >= 75 ? 'text-success-700' : eff < 65 ? 'text-danger-600' : 'text-warning-700',
                      )}
                    >
                      {eff}%
                    </span>
                  )
                },
              },
              {
                key: 'dhuPct',
                header: 'DHU %',
                align: 'right',
                cell: (r) => {
                  const dhu = r.production?.dhuPct || r.dhuPct
                  return (
                    <span
                      className={cn(
                        'font-semibold',
                        dhu > 5.0 ? 'text-danger-600 font-bold' : 'text-success-700',
                      )}
                    >
                      {dhu}%
                    </span>
                  )
                },
              },
              {
                key: 'wipStatus',
                header: 'Cut-WIP Buffer',
                cell: (r) => (
                  <Badge
                    variant={
                      r.wipFeeder?.wipStatus?.includes('Critical')
                        ? 'danger'
                        : r.wipFeeder?.wipStatus?.includes('Low')
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {r.wipFeeder?.cutWipHoursAvailable || 3.2}h Feed
                  </Badge>
                ),
              },
              {
                key: 'orderRisk',
                header: 'Tied Order Risk',
                cell: (r) => (
                  <Badge
                    variant={
                      r.tiedOrder?.orderRiskStatus?.includes('High')
                        ? 'danger'
                        : r.tiedOrder?.orderRiskStatus?.includes('Medium')
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {r.tiedOrder?.orderRiskStatus || 'On Track'}
                  </Badge>
                ),
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right',
                cell: (r) => (
                  <Button size="sm" variant="outline" onClick={() => setSelectedLine(r)}>
                    Inspect
                  </Button>
                ),
              },
            ]}
            data={lines.data ?? []}
            isLoading={lines.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      {/* 24-Line Floor Viewport (Live Digital Twins) - Dedicated Section */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-4.5 w-4.5 text-brand-600" />
                24-Line Live Floor Viewport (Digital Twin Cards)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Live line telemetry cards • 2 rows visible in viewport • Scroll down to browse all 24 production lines
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 text-xs font-medium border-border/80 bg-background text-foreground shadow-2xs">
                <SlidersHorizontal className="h-3 w-3 text-brand-500" />
                Scrollable Viewport ({lines.data?.length || 24} Lines)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="max-h-98.75 overflow-y-scroll custom-scrollbar rounded-xl border border-border/70 bg-slate-50/70 p-3.5 shadow-inner">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(lines.data ?? []).map((line) => {
                const eff = line.production?.efficiencyPct || line.efficiencyPct
                const dhu = line.production?.dhuPct || line.dhuPct
                const actual = line.production?.actualPcs || line.actualPcs
                const target = line.production?.dailyTarget || line.targetPcs

                return (
                  <Card
                    key={line.id}
                    interactive
                    onClick={() => setSelectedLine(line)}
                    className="p-3.5 transition-all hover:border-brand-400 bg-card shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-foreground">{line.name}</span>
                      <StatusBadge status={line.status} />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      {line.unitName} - {line.operators?.total || line.operators} ops
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Style <span className="font-semibold text-foreground">{line.tiedOrder?.styleNo || line.styleNo}</span> ({line.tiedOrder?.buyerName || line.buyerName})
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="num text-base font-bold text-foreground">{formatNumber(actual)} pcs</span>
                      <span className="text-[11px] text-muted-foreground">Target {formatNumber(target)} pcs</span>
                    </div>
                    <Progress
                      value={line.production?.achievementPct || line.achievementPct}
                      className="mt-1.5"
                      indicatorClassName={
                        eff >= 75 ? 'bg-success-500' : eff >= 65 ? 'bg-warning-500' : 'bg-danger-500'
                      }
                    />
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">
                        SMV Eff <span className="font-bold text-foreground">{eff}%</span>
                      </span>
                      <span
                        className={cn(
                          'font-semibold',
                          dhu > 5.0 ? 'text-danger-600 font-bold' : 'text-success-700',
                        )}
                      >
                        DHU {dhu}%
                      </span>
                      <span className="text-primary font-medium flex items-center gap-0.5">
                        Twin <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deep Digital Twin Line Inspection Modal/Drawer */}
      {selectedLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-display text-xl font-bold text-foreground">{selectedLine.name} Digital Twin</span>
                  <StatusBadge status={selectedLine.status} />
                  <Badge variant="brand">{selectedLine.unitName}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Supervisor: <strong className="text-foreground">{selectedLine.supervisor}</strong> - Real-Time Shop Floor Telemetry
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLine(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {/* 1. Operational Stats & SMV Balancing */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Garment SMV</div>
                  <div className="mt-1 font-display text-lg font-bold text-foreground">
                    {selectedLine.lineConfig?.smvMinutes || 12.4} min
                  </div>
                  <div className="text-[11px] text-muted-foreground">Pitch: {selectedLine.lineConfig?.pitchTimeSec || 28}s</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Operator Loading</div>
                  <div className="mt-1 font-display text-lg font-bold text-foreground">
                    {selectedLine.operators?.total || 28}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {selectedLine.operators?.tailors || 22} Tailors, {selectedLine.operators?.helpers || 4} Helpers
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">SMV Efficiency</div>
                  <div className="mt-1 font-display text-lg font-bold text-success-700">
                    {selectedLine.production?.efficiencyPct || selectedLine.efficiencyPct}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">Target: 85%</div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase">Live DHU %</div>
                  <div className="mt-1 font-display text-lg font-bold text-danger-600">
                    {selectedLine.production?.dhuPct || selectedLine.dhuPct}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">Threshold: &lt; 3.0%</div>
                </div>
              </div>

              {/* 2. 8-Hour Production Progression Ladder */}
              <Card className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center justify-between">
                    <span>8-Hour Shift Hourly Run-Rate Ladder (Target vs Actual)</span>
                    <Badge variant="outline">Currently Shift Hour 6</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={selectedLine.production?.hourlyLadder || []}
                        margin={{ top: 6, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" tick={axisTick} axisLine={false} tickLine={false} />
                        <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Bar dataKey="actual" name="Actual Pcs" radius={[4, 4, 0, 0]} maxBarSize={28} fill={statusColors.brand} />
                        <Line
                          type="monotone"
                          dataKey="target"
                          name="Target Pcs"
                          stroke={statusColors.poppy}
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Upstream Cut-WIP Buffer Feed & Tied Export Order Risk */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <Boxes className="h-4 w-4 text-brand-600" />
                      Upstream Cut-to-Sew WIP Feeder
                    </span>
                    <Badge
                      variant={
                        selectedLine.wipFeeder?.wipStatus?.includes('Critical')
                          ? 'danger'
                          : selectedLine.wipFeeder?.wipStatus?.includes('Low')
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {selectedLine.wipFeeder?.wipStatus || 'Healthy Feed'}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="text-muted-foreground">Cut Bundles in Feed Rack:</span>
                      <span className="font-semibold text-foreground">
                        {selectedLine.wipFeeder?.cutWipBundles || 140} bundles
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="text-muted-foreground">Work Hours Available:</span>
                      <span className="font-bold text-foreground">
                        {selectedLine.wipFeeder?.cutWipHoursAvailable || 3.5} hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Starvation Risk:</span>
                      <span
                        className={cn(
                          'font-semibold',
                          (selectedLine.wipFeeder?.cutWipHoursAvailable || 3.5) < 2.0
                            ? 'text-danger-600 font-bold'
                            : 'text-success-700',
                        )}
                      >
                        {(selectedLine.wipFeeder?.cutWipHoursAvailable || 3.5) < 2.0
                          ? 'High - Reorder Bundles'
                          : 'None - Normal Flow'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-poppy-600" />
                      Tied Export Order Delivery Risk
                    </span>
                    <Badge
                      variant={
                        selectedLine.tiedOrder?.orderRiskStatus?.includes('High')
                          ? 'danger'
                          : selectedLine.tiedOrder?.orderRiskStatus?.includes('Medium')
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {selectedLine.tiedOrder?.orderRiskStatus || 'On Track'}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="text-muted-foreground">Export Order No:</span>
                      <span className="font-mono font-bold text-foreground">
                        {selectedLine.tiedOrder?.orderNo || 'PO-1045'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="text-muted-foreground">Buyer / Style:</span>
                      <span className="font-semibold text-foreground">
                        {selectedLine.tiedOrder?.buyerName} - {selectedLine.tiedOrder?.styleNo}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="text-muted-foreground">Order Quantity:</span>
                      <span className="font-bold text-foreground">
                        {formatNumber(selectedLine.tiedOrder?.orderQty || 24000)} pcs
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ex-Factory Ship Date:</span>
                      <span className="font-semibold text-foreground">
                        {selectedLine.tiedOrder?.shipDate} ({selectedLine.tiedOrder?.daysToShip}d left)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Top Defect Log on this line */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground text-xs mb-2.5">
                  Top 3 Quality Defects on {selectedLine.name} Today
                </div>
                <div className="space-y-2">
                  {(selectedLine.topDefects || []).map((def) => (
                    <div
                      key={def.code}
                      className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-foreground">
                        <strong className="text-brand-700 mr-2">{def.code}</strong> {def.name}
                      </span>
                      <span className="font-semibold text-danger-600">{def.count} pieces ({def.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedLine(null)}>Close Digital Twin</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
