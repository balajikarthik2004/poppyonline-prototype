import { useMemo, useState } from 'react'
import { Bar, CartesianGrid, Cell, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarRange, ClipboardList, Gauge, Layers, TriangleAlert } from 'lucide-react'
import { PoppysPlanningIcon, PoppysProductionIcon } from '@/components/icons'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import { getCapacityPlan, getMultiTierCapacity, getProductionOrders } from '@/services'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, MiniBar, RiskBadge, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatDate, formatNumber, formatPct } from '@/lib/format'
import { axisTick, chartTooltipStyle, statusColors } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

/* =================================================== ProductionOrders ===== */

const woStatuses = ['Released', 'In Progress', 'Completed', 'On Hold']

export function ProductionOrders() {
  const { unitId } = useAppStore()
  const [status, setStatus] = useState(null)
  const orders = useAsync(() => getProductionOrders({ status, unitId }), [status, unitId])

  const stats = useMemo(() => {
    const rows = orders.data ?? []
    return {
      total: rows.length,
      planned: rows.reduce((s, r) => s + r.plannedQty, 0),
      completed: rows.reduce((s, r) => s + r.completedQty, 0),
      atRisk: rows.filter((r) => r.risk === 'atRisk' || r.risk === 'delayed').length,
      avgEfficiency: rows.length ? rows.reduce((s, r) => s + r.efficiencyPct, 0) / rows.length : 0,
    }
  }, [orders.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysPlanningIcon}
        title="Production Orders"
        description="Work orders on the floor, each tracked stage by stage from knitting through to packing."
      />

      <StatGrid cols={5}>
        <StatCard label="Work orders" value={stats.total} icon={ClipboardList} tone="brand" />
        <StatCard label="Planned pcs" value={formatNumber(stats.planned)} icon={Layers} tone="info" />
        <StatCard
          label="Completed pcs"
          value={formatNumber(stats.completed)}
          sublabel={formatPct(stats.planned ? (stats.completed / stats.planned) * 100 : 0)}
          icon={Gauge}
          tone="success"
        />
        <StatCard label="Avg efficiency" value={formatPct(stats.avgEfficiency)} icon={Gauge} tone="poppy" />
        <StatCard
          label="At risk"
          value={stats.atRisk}
          icon={TriangleAlert}
          tone={stats.atRisk > 0 ? 'danger' : 'default'}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Work order book</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {woStatuses.map((s) => (
                <FilterChip key={s} active={status === s} onClick={() => setStatus(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'woNo', header: 'WO', cell: (r) => <span className="font-medium">{r.woNo}</span> },
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              { key: 'unitName', header: 'Unit' },
              { key: 'lineNo', header: 'Line' },
              { key: 'plannedQty', header: 'Planned', align: 'right', cell: (r) => formatNumber(r.plannedQty) },
              { key: 'completedQty', header: 'Done', align: 'right', cell: (r) => formatNumber(r.completedQty) },
              { key: 'currentStage', header: 'Stage', cell: (r) => <Badge variant="outline">{r.currentStage}</Badge> },
              {
                key: 'progressPct',
                header: 'Progress',
                align: 'right',
                cell: (r) => <MiniBar value={r.progressPct} tone={r.risk === 'delayed' ? 'danger' : 'brand'} />,
              },
              { key: 'efficiencyPct', header: 'Eff.', align: 'right', cell: (r) => formatPct(r.efficiencyPct) },
              {
                key: 'dueDate',
                header: 'Due',
                align: 'right',
                sortValue: (r) => new Date(r.dueDate).getTime(),
                cell: (r) => formatDate(r.dueDate, 'dd MMM'),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
              { key: 'risk', header: 'Risk', cell: (r) => <RiskBadge risk={r.risk} /> },
            ]}
            data={orders.data ?? []}
            isLoading={orders.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ====================================================== CapacityPlanning == */

export function CapacityPlanning() {
  const { unitId } = useAppStore()
  const plan = useAsync(() => getCapacityPlan(unitId), [unitId])

  /** Roll the per-unit weekly rows into one series for the group view. */
  const grouped = useMemo(() => {
    const map = new Map()
    for (const row of plan.data ?? []) {
      const entry = map.get(row.week) ?? { week: row.week, capacityPcs: 0, bookedPcs: 0 }
      entry.capacityPcs += row.capacityPcs
      entry.bookedPcs += row.bookedPcs
      map.set(row.week, entry)
    }
    return [...map.values()].map((r) => ({
      ...r,
      loadPct: Math.round((r.bookedPcs / r.capacityPcs) * 1000) / 10,
    }))
  }, [plan.data])

  const stats = useMemo(() => {
    if (!grouped.length) return { avgLoad: 0, overloaded: 0, openPcs: 0, capacity: 0 }
    return {
      avgLoad: grouped.reduce((s, r) => s + r.loadPct, 0) / grouped.length,
      overloaded: grouped.filter((r) => r.loadPct > 100).length,
      openPcs: grouped.reduce((s, r) => s + Math.max(0, r.capacityPcs - r.bookedPcs), 0),
      capacity: grouped.reduce((s, r) => s + r.capacityPcs, 0),
    }
  }, [grouped])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysProductionIcon}
        title="Capacity Planning"
        description="Twelve weeks of sewing load against installed capacity across the three garment units."
      />

      <StatGrid cols={4}>
        <StatCard label="Average load" value={formatPct(stats.avgLoad)} icon={Gauge} tone={stats.avgLoad > 100 ? 'danger' : 'brand'} />
        <StatCard
          label="Overloaded weeks"
          value={stats.overloaded}
          sublabel="booked above capacity"
          icon={TriangleAlert}
          tone={stats.overloaded > 0 ? 'warning' : 'success'}
        />
        <StatCard label="Open capacity" value={formatNumber(stats.openPcs)} sublabel="pieces" icon={CalendarRange} tone="info" />
        <StatCard label="Total capacity" value={formatNumber(stats.capacity)} sublabel="12 weeks" icon={Layers} tone="poppy" />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Weekly load vs capacity</CardTitle>
          <p className="text-xs text-muted-foreground">
            Bars are booked pieces; the line is installed sewing capacity for the same week
          </p>
        </CardHeader>
        <CardContent>
          {plan.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={grouped} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={axisTick} axisLine={false} tickLine={false} />
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
                    formatter={(value, name) => [
                      formatNumber(value),
                      name === 'bookedPcs' ? 'Booked' : 'Capacity',
                    ]}
                  />
                  <Bar dataKey="bookedPcs" name="bookedPcs" radius={[4, 4, 0, 0]} maxBarSize={30}>
                    {grouped.map((row) => (
                      <Cell key={row.week} fill={row.loadPct > 100 ? statusColors.danger : statusColors.brand} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="capacityPcs"
                    name="capacityPcs"
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
          <CardTitle>Load by unit and week</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'unitName', header: 'Unit' },
              { key: 'week', header: 'Week' },
              {
                key: 'weekStart',
                header: 'Starting',
                sortValue: (r) => new Date(r.weekStart).getTime(),
                cell: (r) => formatDate(r.weekStart, 'dd MMM'),
              },
              { key: 'capacityPcs', header: 'Capacity', align: 'right', cell: (r) => formatNumber(r.capacityPcs) },
              { key: 'bookedPcs', header: 'Booked', align: 'right', cell: (r) => formatNumber(r.bookedPcs) },
              { key: 'openPcs', header: 'Open', align: 'right', cell: (r) => formatNumber(r.openPcs) },
              {
                key: 'loadPct',
                header: 'Load',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-semibold', r.loadPct > 100 ? 'text-danger-600' : 'text-foreground')}>
                    {formatPct(r.loadPct)}
                  </span>
                ),
              },
            ]}
            data={plan.data ?? []}
            isLoading={plan.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      {/* Multi-Tier Capacity Model */}
      <MultiTierCapacitySection />
    </PageContainer>
  )
}

function MultiTierCapacitySection() {
  const multiTier = useAsync(getMultiTierCapacity, [])

  return (
    <Card className="border-brand-100">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-brand-600" />
            Configurable Multi-Tier Capacity Model (9 Stages)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Differentiates Historical Website Baseline vs Rated vs Available vs Planned vs Actual Output
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            { key: 'stageName', header: 'Stage', cell: (r) => <span className="font-medium text-foreground">{r.stageName}</span> },
            { key: 'unitId', header: 'Unit', cell: (r) => <Badge variant="outline">{r.unitId}</Badge> },
            { key: 'department', header: 'Department' },
            {
              key: 'historicalPublishedCapacity',
              header: 'Published Ref',
              align: 'right',
              cell: (r) => `${formatNumber(r.historicalPublishedCapacity)} ${r.capacityUnit}`,
            },
            {
              key: 'ratedCapacity',
              header: 'Rated Capacity',
              align: 'right',
              cell: (r) => `${formatNumber(r.ratedCapacity)} ${r.capacityUnit}`,
            },
            {
              key: 'availableCapacity',
              header: 'Available',
              align: 'right',
              cell: (r) => `${formatNumber(r.availableCapacity)} ${r.capacityUnit}`,
            },
            {
              key: 'plannedCapacity',
              header: 'Planned',
              align: 'right',
              cell: (r) => `${formatNumber(r.plannedCapacity)} ${r.capacityUnit}`,
            },
            {
              key: 'actualOutput',
              header: 'Actual Output',
              align: 'right',
              cell: (r) => (
                <span className="font-semibold text-brand-700">
                  {formatNumber(r.actualOutput)} {r.capacityUnit}
                </span>
              ),
            },
            {
              key: 'actualEfficiencyPct',
              header: 'Actual Eff.',
              align: 'right',
              cell: (r) => `${r.actualEfficiencyPct}%`,
            },
            {
              key: 'loadStatus',
              header: 'Status',
              cell: (r) => (
                <Badge variant={r.loadStatus === 'Overloaded' ? 'danger' : r.loadStatus === 'Underloaded' ? 'warning' : 'success'}>
                  {r.loadStatus}
                </Badge>
              ),
            },
          ]}
          data={multiTier.data ?? []}
          isLoading={multiTier.isLoading}
          pageSize={10}
        />
      </CardContent>
    </Card>
  )
}
