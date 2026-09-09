import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, CalendarClock, CircleCheck, Cog, Package, TriangleAlert, Wrench } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import { getBreakdowns, getMachines, getMaintenanceSummary, getPmSchedule, getSpareParts } from '@/services'
import { processStages } from '@/mock/units'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, MiniBar, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatDate, formatInrCompact, formatNumber, formatPct } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

/* =================================================== MachineDashboard ===== */

export function MachineDashboard() {
  const { unitId } = useAppStore()
  const summary = useAsync(getMaintenanceSummary, [])
  const [stageKey, setStageKey] = useState(null)
  const machines = useAsync(() => getMachines({ stageKey, unitId }), [stageKey, unitId])

  return (
    <PageContainer>
      <PageHeader
        title="Machine Dashboard"
        description="The installed base across knitting, processing, printing, embroidery, cutting, sewing, checking and packing."
      />

      {summary.isLoading || !summary.data ? (
        <StatGridSkeleton count={6} />
      ) : (
        <StatGrid cols={6}>
          <StatCard label="Machines" value={summary.data.totalMachines} icon={Cog} tone="brand" />
          <StatCard label="Running" value={summary.data.running} sublabel={formatPct(summary.data.availabilityPct)} icon={CircleCheck} tone="success" />
          <StatCard label="Idle" value={summary.data.idle} icon={Activity} tone="default" />
          <StatCard label="In service" value={summary.data.underMaintenance} icon={Wrench} tone="warning" to="/maintenance/pm" />
          <StatCard label="Breakdown" value={summary.data.breakdown} icon={TriangleAlert} tone={summary.data.breakdown > 0 ? 'danger' : 'default'} to="/maintenance/breakdowns" />
          <StatCard label="Avg utilisation" value={formatPct(summary.data.avgUtilisationPct)} icon={Activity} tone="poppy" />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Utilisation by stage</CardTitle>
          <p className="text-xs text-muted-foreground">Average machine utilisation at each point on the route</p>
        </CardHeader>
        <CardContent>
          {summary.isLoading || !summary.data ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.data.byStage} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} contentStyle={chartTooltipStyle} formatter={(v) => [`${v}%`, 'Utilisation']} />
                  <Bar dataKey="utilisationPct" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {summary.data.byStage.map((row, i) => (
                      <Cell key={row.stage} fill={colorAt(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Machine register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!stageKey} onClick={() => setStageKey(null)}>
                All stages
              </FilterChip>
              {processStages.map((s) => (
                <FilterChip key={s.key} active={stageKey === s.key} onClick={() => setStageKey(s.key)}>
                  {s.label}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'code', header: 'Machine', cell: (r) => <span className="font-medium">{r.code}</span> },
              { key: 'stageLabel', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              { key: 'make', header: 'Make' },
              { key: 'model', header: 'Model' },
              { key: 'unitName', header: 'Unit' },
              { key: 'installedYear', header: 'Installed', align: 'right' },
              { key: 'capacityPerDay', header: 'Capacity/day', align: 'right', cell: (r) => `${formatNumber(r.capacityPerDay)} ${r.unitOfMeasure}` },
              { key: 'utilisationPct', header: 'Utilisation', align: 'right', cell: (r) => <MiniBar value={r.utilisationPct} tone={r.utilisationPct > 80 ? 'success' : 'warning'} /> },
              { key: 'mtbfHours', header: 'MTBF', align: 'right', cell: (r) => `${formatNumber(r.mtbfHours)}h` },
              {
                key: 'nextServiceAt',
                header: 'Next service',
                align: 'right',
                sortValue: (r) => new Date(r.nextServiceAt).getTime(),
                cell: (r) => formatDate(r.nextServiceAt, 'dd MMM'),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={machines.data ?? []}
            isLoading={machines.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ============================================ PreventiveMaintenance ======= */

export function PreventiveMaintenance() {
  const [status, setStatus] = useState(null)
  const pm = useAsync(() => getPmSchedule(status ? { status } : {}), [status])

  const stats = useMemo(() => {
    const rows = pm.data ?? []
    return {
      total: rows.length,
      overdue: rows.filter((r) => r.isOverdue).length,
      scheduled: rows.filter((r) => r.status === 'Scheduled').length,
      hours: rows.reduce((s, r) => s + r.estimatedHours, 0),
    }
  }, [pm.data])

  return (
    <PageContainer>
      <PageHeader
        title="Preventive Maintenance"
        description="The planned schedule: lubrication, needle and sinker changes, belt inspection, electrical audits and calibration."
      />

      <StatGrid cols={4}>
        <StatCard label="Tasks" value={stats.total} icon={CalendarClock} tone="brand" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={Wrench} tone="info" />
        <StatCard label="Overdue" value={stats.overdue} icon={TriangleAlert} tone={stats.overdue > 0 ? 'danger' : 'success'} />
        <StatCard label="Planned hours" value={stats.hours.toFixed(0)} icon={Activity} tone="poppy" />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Maintenance schedule</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {['Scheduled', 'In Progress', 'Completed', 'Overdue'].map((s) => (
                <FilterChip key={s} active={status === s} tone={s === 'Overdue' ? 'poppy' : 'brand'} onClick={() => setStatus(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'taskNo', header: 'Task', cell: (r) => <span className="font-medium">{r.taskNo}</span> },
              { key: 'machineCode', header: 'Machine' },
              { key: 'stageLabel', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              { key: 'unitName', header: 'Unit' },
              { key: 'type', header: 'Task type' },
              { key: 'frequency', header: 'Frequency' },
              { key: 'estimatedHours', header: 'Hours', align: 'right', cell: (r) => r.estimatedHours.toFixed(1) },
              { key: 'assignedTo', header: 'Assigned' },
              {
                key: 'dueDate',
                header: 'Due',
                align: 'right',
                sortValue: (r) => new Date(r.dueDate).getTime(),
                cell: (r) => (
                  <span className={cn(r.isOverdue && 'font-semibold text-danger-600')}>{formatDate(r.dueDate, 'dd MMM')}</span>
                ),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={pm.data ?? []}
            isLoading={pm.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ========================================================== Breakdowns ==== */

export function Breakdowns() {
  const [status, setStatus] = useState(null)
  const breakdowns = useAsync(() => getBreakdowns(status ? { status } : {}), [status])

  const stats = useMemo(() => {
    const rows = breakdowns.data ?? []
    return {
      total: rows.length,
      open: rows.filter((r) => r.status === 'Open' || r.status === 'In Progress').length,
      hours: rows.reduce((s, r) => s + r.downtimeHours, 0),
      critical: rows.filter((r) => r.severity === 'Critical').length,
    }
  }, [breakdowns.data])

  return (
    <PageContainer>
      <PageHeader
        title="Breakdowns"
        description="Unplanned stoppages, the output lost while the machine was down, and how long it took to restore."
      />

      <StatGrid cols={4}>
        <StatCard label="Tickets" value={stats.total} icon={Wrench} tone="brand" />
        <StatCard label="Still open" value={stats.open} icon={TriangleAlert} tone={stats.open > 0 ? 'danger' : 'success'} />
        <StatCard label="Downtime" value={`${stats.hours.toFixed(0)}h`} icon={CalendarClock} tone="warning" />
        <StatCard label="Critical" value={stats.critical} sublabel="over 12h down" icon={TriangleAlert} tone={stats.critical > 0 ? 'danger' : 'default'} />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Breakdown log</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
                <FilterChip key={s} active={status === s} tone={s === 'Open' ? 'poppy' : 'brand'} onClick={() => setStatus(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'ticketNo', header: 'Ticket', cell: (r) => <span className="font-medium">{r.ticketNo}</span> },
              { key: 'machineCode', header: 'Machine' },
              { key: 'stageLabel', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              { key: 'unitName', header: 'Unit' },
              { key: 'cause', header: 'Cause' },
              { key: 'downtimeHours', header: 'Downtime', align: 'right', cell: (r) => `${r.downtimeHours}h` },
              {
                key: 'lostOutput',
                header: 'Output lost',
                align: 'right',
                cell: (r) => `${formatNumber(r.lostOutput)} ${r.unitOfMeasure}`,
              },
              {
                key: 'severity',
                header: 'Severity',
                cell: (r) => (
                  <Badge variant={r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'secondary'}>
                    {r.severity}
                  </Badge>
                ),
              },
              { key: 'technician', header: 'Technician' },
              {
                key: 'reportedAt',
                header: 'Reported',
                align: 'right',
                sortValue: (r) => new Date(r.reportedAt).getTime(),
                cell: (r) => formatDate(r.reportedAt, 'dd MMM'),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={breakdowns.data ?? []}
            isLoading={breakdowns.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ========================================================= SpareParts ===== */

export function SpareParts() {
  const spares = useAsync(getSpareParts, [])
  const [lowOnly, setLowOnly] = useState(false)

  const rows = useMemo(
    () => (lowOnly ? (spares.data ?? []).filter((r) => r.isBelowReorder) : spares.data ?? []),
    [spares.data, lowOnly],
  )

  const stats = useMemo(() => {
    const data = spares.data ?? []
    return {
      items: data.length,
      value: data.reduce((s, r) => s + r.valueInr, 0),
      low: data.filter((r) => r.isBelowReorder).length,
      out: data.filter((r) => r.stockQty === 0).length,
    }
  }, [spares.data])

  return (
    <PageContainer>
      <PageHeader title="Spare Parts" description="The spares store that keeps the knitting, sewing and processing floors running." />

      <StatGrid cols={4}>
        <StatCard label="Line items" value={stats.items} icon={Package} tone="brand" />
        <StatCard label="Stock value" value={formatInrCompact(stats.value)} icon={Cog} tone="info" />
        <StatCard label="Below reorder" value={stats.low} icon={TriangleAlert} tone={stats.low > 0 ? 'warning' : 'success'} />
        <StatCard label="Out of stock" value={stats.out} icon={TriangleAlert} tone={stats.out > 0 ? 'danger' : 'default'} />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Spares register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!lowOnly} onClick={() => setLowOnly(false)}>
                All items
              </FilterChip>
              <FilterChip active={lowOnly} tone="poppy" onClick={() => setLowOnly(true)}>
                Below reorder
              </FilterChip>
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'partNo', header: 'Part', cell: (r) => <span className="font-medium">{r.partNo}</span> },
              { key: 'name', header: 'Description' },
              { key: 'category', header: 'Category', cell: (r) => <Badge variant="outline">{r.category}</Badge> },
              {
                key: 'stockQty',
                header: 'In stock',
                align: 'right',
                cell: (r) => (
                  <span className={cn(r.isBelowReorder && 'font-semibold text-danger-600')}>{r.stockQty}</span>
                ),
              },
              { key: 'reorderLevel', header: 'Reorder at', align: 'right' },
              { key: 'rateInr', header: 'Rate', align: 'right', cell: (r) => formatNumber(r.rateInr) },
              { key: 'valueInr', header: 'Value', align: 'right', cell: (r) => formatInrCompact(r.valueInr) },
              { key: 'leadTimeDays', header: 'Lead days', align: 'right' },
              { key: 'location', header: 'Location' },
              {
                key: 'isBelowReorder',
                header: 'Status',
                cell: (r) =>
                  r.stockQty === 0 ? (
                    <Badge variant="danger">Out of stock</Badge>
                  ) : r.isBelowReorder ? (
                    <Badge variant="warning">Reorder</Badge>
                  ) : (
                    <Badge variant="success">Healthy</Badge>
                  ),
              },
            ]}
            data={rows}
            isLoading={spares.isLoading}
            pageSize={12}
            emptyMessage="Every spare is above its reorder level."
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
