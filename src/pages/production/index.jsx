import { useMemo } from 'react'
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
import { Activity, ArrowRight, CircleSlash, Factory, Gauge, Layers, TriangleAlert, Wrench } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import { getProductionHistory, getSewingLines, getStageDetail } from '@/services'
import { processStages } from '@/mock/units'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, EmptyState } from '@/components/common'
import { DataTable, MiniBar, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress, Skeleton } from '@/components/ui'
import { formatNumber, formatPct } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt, statusColors } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

/* ============================================================ Overview ==== */

export function ProductionOverview() {
  const { dateRangePreset } = useAppStore()
  const history = useAsync(() => getProductionHistory(dateRangePreset), [dateRangePreset])

  /** Route throughput: how much each stage produced over the selected window. */
  const routeTotals = useMemo(() => {
    const rows = history.data ?? []
    return processStages.map((stage) => {
      const output = rows.reduce((s, r) => s + (r[stage.key] ?? 0), 0)
      const target = rows.reduce((s, r) => s + (r[`${stage.key}Target`] ?? 0), 0)
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
      }
    })
  }, [history.data])

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
        title="Production Overview"
        description="The full route a garment travels: knitting, dyeing, compacting, cutting, printing, embroidery, sewing, checking and packing."
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
            label="Packed"
            value={formatNumber(latest.packing)}
            sublabel="ready for dispatch"
            icon={Activity}
            tone="success"
            to="/production/packing"
          />
          <StatCard label="OEE" value={formatPct(latest.oeePct)} icon={Gauge} tone="poppy" />
          <StatCard
            label="Line efficiency"
            value={formatPct(latest.efficiencyPct)}
            sublabel={`DHU ${latest.dhuPct}%`}
            icon={Gauge}
            tone="warning"
            to="/production/sewing"
          />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Route throughput</CardTitle>
          <p className="text-xs text-muted-foreground">
            Output against installed capacity at each stage over the selected window
          </p>
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
                  className="block rounded-lg px-2 py-2 transition-colors hover:bg-accent"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
                        style={{ backgroundColor: colorAt(i) }}
                      >
                        {i + 1}
                      </span>
                      <span className="font-semibold text-foreground">{stage.label}</span>
                      <span className="hidden text-muted-foreground sm:inline">{stage.machines}</span>
                    </span>
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
            <CardTitle>Sewing efficiency</CardTitle>
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {processStages.map((stage, i) => (
          <Link key={stage.key} to={stage.path}>
            <Card className="hover-lift h-full p-3.5">
              <div className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white"
                  style={{ backgroundColor: colorAt(i) }}
                >
                  {i + 1}
                </span>
                <span className="truncate text-[13px] font-semibold text-foreground">{stage.label}</span>
              </div>
              <div className="mt-2 text-[11px] leading-snug text-muted-foreground">{stage.blurb}</div>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}

/* ========================================================= ProcessPage ==== */

/**
 * One component serves all nine production stages. The stage key comes from the
 * route, so adding a stage means adding a row to `processStages`, not a page.
 */
export function ProcessPage() {
  const { stageKey } = useParams()
  const { dateRangePreset } = useAppStore()
  const detail = useAsync(() => getStageDetail(stageKey, dateRangePreset), [stageKey, dateRangePreset])

  const stage = detail.data?.stage

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
          stage && (
            <Badge variant="brand">
              Capacity {formatNumber(stage.dailyCapacity)} {stage.unitOfMeasure}/day
            </Badge>
          )
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
            label="Machines running"
            value={`${detail.data.running} / ${detail.data.machines.length}`}
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

      <Card>
        <CardHeader>
          <CardTitle>Daily output vs capacity</CardTitle>
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
            <CardTitle>Machines at this stage</CardTitle>
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
                      { key: 'diameterInch', header: 'Dia', align: 'right', cell: (r) => `${r.diameterInch}"` },
                    ]
                  : []),
                ...(stageKey === 'sewing' ? [{ key: 'lineNo', header: 'Line' }] : []),
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
            <CardTitle>Rejections at this stage</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (detail.data?.rejections ?? []).length === 0 ? (
              <EmptyState message="No rejections recorded at this stage." />
            ) : (
              <div className="divide-y divide-border">
                {detail.data.rejections.slice(0, 8).map((row) => (
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
          <span className="font-semibold text-foreground">Outputs:</span>
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
  const lines = useAsync(() => getSewingLines(unitId), [unitId])

  const stats = useMemo(() => {
    const rows = lines.data ?? []
    return {
      lines: rows.length,
      operators: rows.reduce((s, r) => s + r.operators, 0),
      target: rows.reduce((s, r) => s + r.targetPcs, 0),
      actual: rows.reduce((s, r) => s + r.actualPcs, 0),
      stopped: rows.filter((r) => r.status === 'Stopped').length,
    }
  }, [lines.data])

  return (
    <PageContainer>
      <PageHeader
        title="Shop Floor"
        description="Live sewing line board across the three garment units - target, actual, efficiency and defects per hundred units."
      />

      <StatGrid cols={5}>
        <StatCard label="Lines" value={stats.lines} icon={Factory} tone="brand" />
        <StatCard label="Operators" value={formatNumber(stats.operators)} icon={Activity} tone="info" />
        <StatCard label="Target today" value={formatNumber(stats.target)} icon={Layers} tone="poppy" />
        <StatCard
          label="Actual today"
          value={formatNumber(stats.actual)}
          sublabel={formatPct(stats.target ? (stats.actual / stats.target) * 100 : 0)}
          icon={Gauge}
          tone={stats.actual >= stats.target * 0.9 ? 'success' : 'warning'}
        />
        <StatCard label="Lines stopped" value={stats.stopped} icon={TriangleAlert} tone={stats.stopped > 0 ? 'danger' : 'success'} />
      </StatGrid>

      {lines.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(lines.data ?? []).map((line) => (
            <Card key={line.id} className="p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-foreground">{line.name}</span>
                <StatusBadge status={line.status} />
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {line.unitName} - {line.operators} operators - {line.supervisor}
              </div>
              <div className="mt-2.5 text-[11px] text-muted-foreground">
                Style <span className="font-medium text-foreground">{line.styleNo}</span> for {line.buyerName}
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="num text-lg font-bold text-foreground">{formatNumber(line.actualPcs)}</span>
                <span className="text-[11px] text-muted-foreground">of {formatNumber(line.targetPcs)} pcs</span>
              </div>
              <Progress
                value={line.achievementPct}
                className="mt-1.5"
                indicatorClassName={
                  line.achievementPct >= 95
                    ? 'bg-success-500'
                    : line.achievementPct >= 80
                      ? 'bg-warning-500'
                      : 'bg-danger-500'
                }
              />
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">
                  Eff <span className="font-semibold text-foreground">{line.efficiencyPct}%</span>
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    line.dhuPct > 6 ? 'text-danger-600' : line.dhuPct > 3 ? 'text-warning-700' : 'text-success-700',
                  )}
                >
                  DHU {line.dhuPct}%
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
