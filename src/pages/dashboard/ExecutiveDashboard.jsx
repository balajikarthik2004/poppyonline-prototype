import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from 'recharts'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Droplets,
  Factory,
  Leaf,
  Package,
  Ship,
  Wrench,
  Zap,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import { Am5DonutChart } from '@/components/charts/Am5DonutChart'
import {
  getActivities,
  getAlerts,
  getEnergy,
  getExportSummary,
  getInventorySummary,
  getKpiCards,
  getMaintenanceSummary,
  getOrderStatusTiles,
  getProductionHistory,
  getSustainabilitySnapshot,
} from '@/services'
import { currentUser } from '@/mock'
import { KpiCard } from '@/components/kpi'
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Badge, Progress } from '@/components/ui'
import { PageContainer, StatCard, StatGrid, EmptyState } from '@/components/common'
import { formatDate, formatNumber, formatPct, formatRelativeShort, formatUsdCompact } from '@/lib/format'
import { axisTick, chartItemStyle, chartLabelStyle, chartTooltipStyle, colorAt, statusColors } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function GreetingHero() {
  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greeting()}, {currentUser.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is where the order book, the floor and the stores stand today.
        </p>
      </div>
      <div className="text-left sm:text-right">
        <div className="text-xs font-semibold text-brand-700">
          {formatDate(new Date().toISOString(), 'EEE, d MMM yyyy')}
        </div>
        <div className="font-display mt-0.5 text-xs font-bold uppercase tracking-wider text-foreground">
          Knit with conscience. Shipped with confidence.
        </div>
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">
          Knitwear exports from Tirupur since 1973 · 50+ countries
        </div>
      </div>
    </div>
  )
}

const tileTones = {
  success: 'border-success-100 bg-success-50 text-success-700',
  warning: 'border-warning-100 bg-warning-50 text-warning-700',
  danger: 'border-danger-100 bg-danger-50 text-danger-700',
  info: 'border-info-100 bg-info-50 text-info-700',
}

export default function ExecutiveDashboard() {
  const navigate = useNavigate()
  const { dateRangePreset } = useAppStore()

  const kpis = useAsync(getKpiCards, [])
  const history = useAsync(() => getProductionHistory(dateRangePreset), [dateRangePreset])
  const tiles = useAsync(getOrderStatusTiles, [])
  const exportSummary = useAsync(getExportSummary, [])
  const inventory = useAsync(getInventorySummary, [])
  const maintenance = useAsync(getMaintenanceSummary, [])
  const energy = useAsync(() => getEnergy(dateRangePreset), [dateRangePreset])
  const sustainability = useAsync(getSustainabilitySnapshot, [])
  const alerts = useAsync(getAlerts, [])
  const activities = useAsync(getActivities, [])

  const trendData = useMemo(
    () =>
      (history.data ?? []).map((row) => ({
        label: row.label,
        output: row.packing,
        target: row.packingTarget,
      })),
    [history.data],
  )

  const segmentSlices = useMemo(
    () => (exportSummary.data?.bySegment ?? []).slice(0, 6).map((s) => ({ name: s.segment, value: s.pieces })),
    [exportSummary.data],
  )
  const segmentTotal = segmentSlices.reduce((s, r) => s + r.value, 0)

  return (
    <PageContainer>
      <GreetingHero />

      {/* KPI row */}
      {kpis.isLoading || !kpis.data ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-30 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.data.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Trend + segment mix */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Garment Output vs Target</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Pieces packed per day against the 100,000 pcs installed capacity
                </p>
              </div>
              <Link to="/production" className="text-xs font-medium text-primary hover:underline">
                Production
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {history.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={axisTick}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                      contentStyle={chartTooltipStyle}
                      itemStyle={chartItemStyle}
                      labelStyle={chartLabelStyle}
                      formatter={(value, name) => [formatNumber(value), name === 'output' ? 'Packed' : 'Capacity']}
                    />
                    <Bar dataKey="output" name="output" radius={[4, 4, 0, 0]} maxBarSize={38} fill={statusColors.brand} />
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Book by Segment</CardTitle>
              <Link to="/sales/order-book" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">Pieces on order across the product range</p>
          </CardHeader>
          <CardContent>
            {exportSummary.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <Am5DonutChart
                data={segmentSlices.map((s) => ({
                  category: s.name,
                  value: s.value,
                }))}
                height={290}
                innerRadius={55}
                showLegend={true}
                onSliceClick={(item) => {
                  navigate(`/sales/order-book?segment=${encodeURIComponent(item.category || item.name)}`)
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order status tiles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Export Orders</CardTitle>
              <p className="text-xs text-muted-foreground">
                Progress measured against a 45-day confirmation-to-ship cycle
              </p>
            </div>
            <Link to="/sales/export-orders" className="text-xs font-medium text-primary hover:underline">
              Order book
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {tiles.isLoading || !tiles.data ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {tiles.data.map((tile) => (
                <button
                  key={tile.key}
                  type="button"
                  onClick={() => navigate(`/sales/export-orders?risk=${tile.key}`)}
                  className={cn(
                    'hover-lift rounded-xl border px-4 py-3 text-left transition-colors',
                    tileTones[tile.tone],
                  )}
                >
                  <div className="num text-2xl font-bold">{tile.count}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold">
                    {tile.label}
                    <ArrowRight className="h-3 w-3 opacity-60" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory / maintenance / energy */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Stores</CardTitle>
              <Link to="/inventory" className="text-xs font-medium text-primary hover:underline">
                Open
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {inventory.isLoading || !inventory.data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: 'Yarn', value: `${formatNumber(Math.round(inventory.data.yarnKg / 1000))} t`, to: '/inventory/yarn', icon: Boxes },
                  { label: 'Fabric', value: `${formatNumber(Math.round(inventory.data.fabricKg / 1000))} t`, to: '/inventory/fabric', icon: Boxes },
                  { label: 'Work in progress', value: `${formatNumber(inventory.data.wipPcs)} pcs`, to: '/inventory/wip', icon: Factory },
                  { label: 'Finished goods', value: `${formatNumber(inventory.data.fgPcs)} pcs`, to: '/inventory/finished-goods', icon: Package },
                ].map((row) => (
                  <Link
                    key={row.label}
                    to={row.to}
                    className="flex items-center justify-between rounded-lg px-1.5 py-1.5 transition-colors hover:bg-accent"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <row.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {row.label}
                    </span>
                    <span className="num text-sm font-semibold text-foreground">{row.value}</span>
                  </Link>
                ))}
                {inventory.data.belowReorder > 0 && (
                  <div className="mt-1 flex items-center gap-2 rounded-lg bg-warning-50 px-2.5 py-2 text-[11px] font-medium text-warning-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {inventory.data.belowReorder} yarn counts below reorder level
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Machines</CardTitle>
              <Link to="/maintenance" className="text-xs font-medium text-primary hover:underline">
                Open
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {maintenance.isLoading || !maintenance.data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="num text-2xl font-bold text-foreground">
                    {formatPct(maintenance.data.availabilityPct)}
                  </span>
                  <span className="text-xs text-muted-foreground">running now</span>
                </div>
                <Progress value={maintenance.data.availabilityPct} indicatorClassName="bg-success-500" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Running', value: maintenance.data.running, tone: 'text-success-700' },
                    { label: 'Idle', value: maintenance.data.idle, tone: 'text-muted-foreground' },
                    { label: 'In service', value: maintenance.data.underMaintenance, tone: 'text-warning-700' },
                    { label: 'Breakdown', value: maintenance.data.breakdown, tone: 'text-danger-700' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-md bg-secondary/60 px-2 py-1.5">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={cn('font-semibold tabular-nums', row.tone)}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/maintenance/pm"
                  className="flex items-center gap-2 rounded-lg bg-warning-50 px-2.5 py-2 text-[11px] font-medium text-warning-700 transition-colors hover:bg-warning-100"
                >
                  <Wrench className="h-3.5 w-3.5 shrink-0" />
                  {maintenance.data.pmOverdue} preventive tasks overdue
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Energy & Water</CardTitle>
              <Link to="/energy" className="text-xs font-medium text-primary hover:underline">
                Open
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {energy.isLoading || !energy.data || !sustainability.data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-3">
                <Am5DonutChart
                  data={energy.data.mix}
                  height={150}
                  innerRadius={55}
                  showLegend={false}
                  showCircularLabels={false}
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-success-50 px-2 py-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-success-700">
                      <Leaf className="h-3 w-3" /> Renewable
                    </div>
                    <div className="num text-sm font-bold text-success-700">
                      {formatPct(energy.data.renewablePct)}
                    </div>
                  </div>
                  <div className="rounded-md bg-info-50 px-2 py-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-info-700">
                      <Droplets className="h-3 w-3" /> Water recovered
                    </div>
                    <div className="num text-sm font-bold text-info-700">
                      {formatPct(energy.data.recoveryPct)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md bg-secondary/60 px-2 py-1.5 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="h-3 w-3" /> Intensity
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {energy.data.kwhPerKg} kWh/kg
                    <span className="ml-1 font-normal text-muted-foreground">
                      vs {energy.data.targets.kwhPerKg} target
                    </span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export footprint */}
      {exportSummary.data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Export Footprint</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Live order book across {exportSummary.data.activeCountries} countries and{' '}
                  {exportSummary.data.activeBuyers} buyers
                </p>
              </div>
              <Link to="/sales/buyers" className="text-xs font-medium text-primary hover:underline">
                Buyers
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={exportSummary.data.byRegion}
                  margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
                  />
                  <YAxis type="category" dataKey="region" width={100} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    contentStyle={chartTooltipStyle}
                    itemStyle={chartItemStyle}
                    labelStyle={chartLabelStyle}
                    formatter={(value) => [formatUsdCompact(value), 'Order value']}
                  />
                  <Bar dataKey="valueUsd" radius={[0, 4, 4, 0]} maxBarSize={26}>
                    {exportSummary.data.byRegion.map((row, i) => (
                      <Cell key={row.region} fill={colorAt(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts + activity (Temporarily commented out) */}
      {/*
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Alerts</CardTitle>
              <Link to="/ai/insights" className="text-xs font-medium text-primary hover:underline">
                All insights
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(alerts.data ?? []).slice(0, 6).map((alert) => (
                  <Link
                    key={alert.id}
                    to={alert.linkTo}
                    className="flex items-start gap-2.5 py-2.5 transition-colors hover:bg-accent/50"
                  >
                    <span
                      className={cn(
                        'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                        alert.severity === 'critical' && 'bg-danger-500',
                        alert.severity === 'high' && 'bg-warning-500',
                        !['critical', 'high'].includes(alert.severity) && 'bg-info-500',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-foreground">{alert.title}</div>
                      <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{alert.body}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {formatRelativeShort(alert.timestamp)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (activities.data ?? []).length === 0 ? (
              <EmptyState message="No activity recorded." />
            ) : (
              <div className="divide-y divide-border">
                {(activities.data ?? []).slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-2.5 py-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                      <Ship className="h-3 w-3" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] text-foreground">{activity.text}</div>
                      <div className="text-[11px] text-muted-foreground">{activity.by}</div>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelativeShort(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      */}

      {/* Company footer stats (Temporarily commented out) */}
      {/*
      <StatGrid cols={4}>
        <StatCard
          label="Group turnover"
          value="US$100M"
          sublabel="Poppys Group, published"
          icon={Ship}
          tone="brand"
          to="/admin"
        />
        <StatCard label="Employees" value="5,000" sublabel="Across 14+ divisions" icon={Factory} tone="info" to="/admin" />
        <StatCard
          label="Sewing capacity"
          value="100,000 pcs"
          sublabel="Per day, 1,500 machines"
          icon={Package}
          tone="poppy"
          to="/production/sewing"
        />
        <StatCard
          label="Certifications"
          value="Oeko-Tex 100"
          sublabel="SITRA + ISO 9001"
          icon={Leaf}
          tone="success"
          to="/compliance"
        />
      </StatGrid>
      */}
    </PageContainer>
  )
}
