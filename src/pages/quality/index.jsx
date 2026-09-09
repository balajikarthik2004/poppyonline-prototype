import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  CircleCheck,
  CircleX,
  ClipboardCheck,
  FlaskConical,
  MessageSquare,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import {
  getAqlAudits,
  getComplaints,
  getFabricQuality,
  getInlineInspections,
  getLabTests,
  getQualitySummary,
  getRejections,
} from '@/services'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, FilterChip, FilterChipGroup, EmptyState } from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress, Skeleton } from '@/components/ui'
import { formatDate, formatNumber, formatPct, formatUsdCompact } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt, statusColors } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

const resultColors = { Pass: statusColors.success, Rework: statusColors.warning, Fail: statusColors.danger }

function toneForRate(pct) {
  if (pct >= 90) return 'bg-success-500'
  if (pct >= 80) return 'bg-warning-500'
  return 'bg-danger-500'
}

/* =========================================================== Dashboard ==== */

export function QualityDashboard() {
  const summary = useAsync(getQualitySummary, [])
  const inline = useAsync(() => getInlineInspections(), [])

  const resultSlices = useMemo(() => {
    if (!summary.data) return []
    return [
      { name: 'Pass', value: summary.data.pass },
      { name: 'Rework', value: summary.data.rework },
      { name: 'Fail', value: summary.data.fail },
    ].filter((s) => s.value > 0)
  }, [summary.data])

  const resultTotal = resultSlices.reduce((s, r) => s + r.value, 0)

  const attention = useMemo(
    () =>
      (inline.data ?? [])
        .filter((r) => r.verdict !== 'Pass')
        .sort((a, b) => new Date(b.inspectedAt) - new Date(a.inspectedAt))
        .slice(0, 8),
    [inline.data],
  )

  return (
    <PageContainer>
      <PageHeader
        title="Quality Management"
        description="The three gates: the laboratory on yarn and fabric, inline inspection on the sewing floor, and the final AQL audit before cartons are sealed."
        actions={
          <Link
            to="/quality/lab-tests"
            className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Open lab register
          </Link>
        }
      />

      {summary.isLoading || !summary.data ? (
        <StatGridSkeleton count={6} />
      ) : (
        <StatGrid cols={6}>
          <StatCard label="Lab tests" value={formatNumber(summary.data.total)} sublabel="last 30 days" icon={FlaskConical} tone="info" to="/quality/lab-tests" />
          <StatCard label="Lab pass rate" value={formatPct(summary.data.passRatePct)} icon={CircleCheck} tone="success" />
          <StatCard label="Inline DHU" value={`${summary.data.avgDhuPct}%`} sublabel="defects per 100 units" icon={TriangleAlert} tone={summary.data.avgDhuPct > 5 ? 'danger' : 'warning'} to="/quality/inline" />
          <StatCard label="AQL pass rate" value={formatPct(summary.data.aqlPassRatePct)} sublabel="final audits" icon={ClipboardCheck} tone="brand" to="/quality/aql" />
          <StatCard label="Rejected" value={formatNumber(summary.data.rejectionPcs)} sublabel={formatUsdCompact(summary.data.rejectionValueUsd)} icon={Trash2} tone="danger" to="/quality/rejections" />
          <StatCard label="Open complaints" value={summary.data.openComplaints} icon={MessageSquare} tone="warning" to="/quality/complaints" />
        </StatGrid>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pass rate by stage</CardTitle>
            <p className="text-xs text-muted-foreground">Yarn, greige, dyed fabric and garment</p>
          </CardHeader>
          <CardContent>
            {summary.isLoading || !summary.data ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="h-36 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.data.byStage} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="stage" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={axisTick} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${v}%`} />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} contentStyle={chartTooltipStyle} formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Pass rate']} />
                      <Bar dataKey="passRatePct" radius={[4, 4, 0, 0]} maxBarSize={44}>
                        {summary.data.byStage.map((s) => (
                          <Cell key={s.stage} fill={s.passRatePct >= 90 ? statusColors.success : s.passRatePct >= 80 ? statusColors.warning : statusColors.danger} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2.5">
                  {summary.data.byStage.map((s) => (
                    <div key={s.stage}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{s.stage}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {s.total} tests - {formatPct(s.passRatePct)}
                        </span>
                      </div>
                      <Progress value={s.passRatePct} indicatorClassName={toneForRate(s.passRatePct)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lab test outcomes</CardTitle>
            <p className="text-xs text-muted-foreground">Disposition of every laboratory test</p>
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="relative h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={resultSlices} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="95%" paddingAngle={2} isAnimationActive={false}>
                        {resultSlices.map((slice) => (
                          <Cell key={slice.name} fill={resultColors[slice.name]} stroke="hsl(var(--card))" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v, n) => [`${formatNumber(v)} (${((v / resultTotal) * 100).toFixed(1)}%)`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tests</span>
                    <span className="num text-base font-bold text-foreground">{formatNumber(resultTotal)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {resultSlices.map((slice) => (
                    <div key={slice.name} className="flex items-center justify-between px-1.5 py-1 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: resultColors[slice.name] }} />
                        <span className="font-medium text-foreground">{slice.name}</span>
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatNumber(slice.value)} - {((slice.value / resultTotal) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejection reasons</CardTitle>
            <p className="text-xs text-muted-foreground">Pieces rejected by root cause</p>
          </CardHeader>
          <CardContent>
            {summary.isLoading || !summary.data ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={summary.data.byReason.slice(0, 7)} margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="key" width={134} tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} contentStyle={chartTooltipStyle} formatter={(v) => [`${formatNumber(v)} pcs`, 'Rejected']} />
                    <Bar dataKey="qtyPcs" radius={[0, 4, 4, 0]} maxBarSize={18} fill={statusColors.danger} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lines needing attention</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Most recent inline inspections above the DHU threshold</p>
            </div>
            <Link to="/quality/inline" className="shrink-0 text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {inline.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : attention.length === 0 ? (
            <EmptyState message="Every line is inside the DHU threshold." icon={CircleCheck} />
          ) : (
            <div className="divide-y divide-border">
              {attention.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <span className="w-28 shrink-0 text-sm font-medium text-foreground">{row.reportNo}</span>
                  <Badge variant="outline">{row.unitName}</Badge>
                  <Badge variant="secondary">{row.lineNo}</Badge>
                  <span className="text-xs text-muted-foreground">{row.styleNo}</span>
                  <span className="flex-1 truncate text-xs text-muted-foreground">Top defect: {row.topDefect}</span>
                  <span className="text-xs font-semibold tabular-nums text-danger-600">DHU {row.dhuPct}%</span>
                  <StatusBadge status={row.verdict} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ============================================================ LabTests ==== */

export function LabTests() {
  const [result, setResult] = useState(null)
  const tests = useAsync(() => getLabTests(result ? { result } : {}), [result])

  return (
    <PageContainer>
      <PageHeader
        title="Lab Tests"
        description="Shrinkage, colour fastness, pilling, bursting strength, spirality, GSM and pH, tested to ISO and ASTM methods."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Test register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!result} onClick={() => setResult(null)}>
                All results
              </FilterChip>
              {['Pass', 'Rework', 'Fail'].map((r) => (
                <FilterChip key={r} active={result === r} tone={r === 'Fail' ? 'poppy' : 'brand'} onClick={() => setResult(r)}>
                  {r}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'testNo', header: 'Test', cell: (r) => <span className="font-medium">{r.testNo}</span> },
              { key: 'stage', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stage}</Badge> },
              { key: 'testName', header: 'Test' },
              { key: 'standard', header: 'Standard' },
              { key: 'tolerance', header: 'Tolerance' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              {
                key: 'testedDate',
                header: 'Tested',
                align: 'right',
                sortValue: (r) => new Date(r.testedDate).getTime(),
                cell: (r) => formatDate(r.testedDate, 'dd MMM'),
              },
              { key: 'testedBy', header: 'By' },
              { key: 'remarks', header: 'Remarks', cell: (r) => <span className="text-muted-foreground">{r.remarks ?? '-'}</span> },
              { key: 'result', header: 'Result', cell: (r) => <StatusBadge status={r.result} /> },
            ]}
            data={tests.data ?? []}
            isLoading={tests.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ======================================================= FabricQuality ==== */

export function FabricQuality() {
  const fabric = useAsync(getFabricQuality, [])

  return (
    <PageContainer>
      <PageHeader
        title="Fabric Quality"
        description="The gate fabric must clear before cutting: greige and dyed fabric testing, plus any rolls currently held."
      />

      {fabric.isLoading || !fabric.data ? (
        <StatGridSkeleton count={3} />
      ) : (
        <StatGrid cols={3}>
          <StatCard label="Fabric tests" value={fabric.data.total} icon={FlaskConical} tone="brand" />
          <StatCard label="Pass rate" value={formatPct(fabric.data.passRatePct)} icon={CircleCheck} tone={fabric.data.passRatePct > 88 ? 'success' : 'warning'} />
          <StatCard label="Rolls on hold" value={fabric.data.holds.length} icon={TriangleAlert} tone={fabric.data.holds.length > 0 ? 'danger' : 'default'} />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fabric test register</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'testNo', header: 'Test', cell: (r) => <span className="font-medium">{r.testNo}</span> },
              { key: 'stage', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stage}</Badge> },
              { key: 'testName', header: 'Test' },
              { key: 'standard', header: 'Standard' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              {
                key: 'testedDate',
                header: 'Tested',
                align: 'right',
                sortValue: (r) => new Date(r.testedDate).getTime(),
                cell: (r) => formatDate(r.testedDate, 'dd MMM'),
              },
              { key: 'result', header: 'Result', cell: (r) => <StatusBadge status={r.result} /> },
            ]}
            data={fabric.data?.rows ?? []}
            isLoading={fabric.isLoading}
            pageSize={10}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rolls currently held</CardTitle>
          <p className="text-xs text-muted-foreground">Fabric quarantined pending a shade or quality decision</p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'rollBatch', header: 'Batch' },
              { key: 'fabricType', header: 'Fabric' },
              { key: 'colour', header: 'Colour' },
              { key: 'shadeLot', header: 'Shade lot' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'quantityKg', header: 'Quantity', align: 'right', cell: (r) => `${formatNumber(r.quantityKg)} kg` },
              { key: 'location', header: 'Location' },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={fabric.data?.holds ?? []}
            isLoading={fabric.isLoading}
            pageSize={8}
            emptyMessage="No fabric is currently held."
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ==================================================== InlineInspection ==== */

export function InlineInspection() {
  const [verdict, setVerdict] = useState(null)
  const rows = useAsync(() => getInlineInspections(verdict ? { verdict } : {}), [verdict])

  const stats = useMemo(() => {
    const data = rows.data ?? []
    const checked = data.reduce((s, r) => s + r.checkedPcs, 0)
    const defects = data.reduce((s, r) => s + r.defectsFound, 0)
    return {
      reports: data.length,
      checked,
      defects,
      dhu: checked ? (defects / checked) * 100 : 0,
      stopped: data.filter((r) => r.verdict === 'Stop Line').length,
    }
  }, [rows.data])

  return (
    <PageContainer>
      <PageHeader
        title="Inline Inspection"
        description="The sewing-floor gate, measured as defects per hundred units. Above 6% DHU the line is stopped and the last two hours held."
      />

      <StatGrid cols={5}>
        <StatCard label="Reports" value={stats.reports} icon={ClipboardCheck} tone="brand" />
        <StatCard label="Pieces checked" value={formatNumber(stats.checked)} icon={CircleCheck} tone="info" />
        <StatCard label="Defects found" value={formatNumber(stats.defects)} icon={CircleX} tone="warning" />
        <StatCard label="Overall DHU" value={formatPct(stats.dhu)} icon={TriangleAlert} tone={stats.dhu > 5 ? 'danger' : 'success'} />
        <StatCard label="Lines stopped" value={stats.stopped} icon={RotateCcw} tone={stats.stopped > 0 ? 'danger' : 'default'} />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Inspection register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!verdict} onClick={() => setVerdict(null)}>
                All
              </FilterChip>
              {['Pass', 'Rework', 'Stop Line'].map((v) => (
                <FilterChip key={v} active={verdict === v} tone={v === 'Stop Line' ? 'poppy' : 'brand'} onClick={() => setVerdict(v)}>
                  {v}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'reportNo', header: 'Report', cell: (r) => <span className="font-medium">{r.reportNo}</span> },
              { key: 'unitName', header: 'Unit' },
              { key: 'lineNo', header: 'Line' },
              { key: 'styleNo', header: 'Style' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'checkedPcs', header: 'Checked', align: 'right', cell: (r) => formatNumber(r.checkedPcs) },
              { key: 'defectsFound', header: 'Defects', align: 'right', cell: (r) => formatNumber(r.defectsFound) },
              {
                key: 'dhuPct',
                header: 'DHU',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-semibold', r.dhuPct > 6 ? 'text-danger-600' : r.dhuPct > 3 ? 'text-warning-700' : 'text-success-700')}>
                    {r.dhuPct}%
                  </span>
                ),
              },
              { key: 'topDefect', header: 'Top defect' },
              { key: 'inspector', header: 'Inspector' },
              {
                key: 'inspectedAt',
                header: 'Date',
                align: 'right',
                sortValue: (r) => new Date(r.inspectedAt).getTime(),
                cell: (r) => formatDate(r.inspectedAt, 'dd MMM'),
              },
              { key: 'verdict', header: 'Verdict', cell: (r) => <StatusBadge status={r.verdict} /> },
            ]}
            data={rows.data ?? []}
            isLoading={rows.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ============================================================ AqlAudit ==== */

export function AqlAudit() {
  const [verdict, setVerdict] = useState(null)
  const audits = useAsync(() => getAqlAudits(verdict ? { verdict } : {}), [verdict])

  const stats = useMemo(() => {
    const rows = audits.data ?? []
    const pass = rows.filter((r) => r.verdict === 'Pass').length
    return {
      total: rows.length,
      pass,
      passPct: rows.length ? (pass / rows.length) * 100 : 0,
      failed: rows.filter((r) => r.verdict === 'Fail').length,
    }
  }, [audits.data])

  return (
    <PageContainer>
      <PageHeader
        title="Final AQL Audit"
        description="The last gate before cartons are sealed, sampled to each buyer's own published AQL level."
      />

      <StatGrid cols={4}>
        <StatCard label="Audits" value={stats.total} icon={ClipboardCheck} tone="brand" />
        <StatCard label="Passed" value={stats.pass} icon={CircleCheck} tone="success" />
        <StatCard label="Pass rate" value={formatPct(stats.passPct)} icon={MiniBarIcon} tone={stats.passPct > 90 ? 'success' : 'warning'} />
        <StatCard label="Failed" value={stats.failed} icon={CircleX} tone={stats.failed > 0 ? 'danger' : 'default'} />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Audit register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!verdict} onClick={() => setVerdict(null)}>
                All
              </FilterChip>
              {['Pass', 'Re-inspect', 'Fail'].map((v) => (
                <FilterChip key={v} active={verdict === v} tone={v === 'Fail' ? 'poppy' : 'brand'} onClick={() => setVerdict(v)}>
                  {v}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'auditNo', header: 'Audit', cell: (r) => <span className="font-medium">{r.auditNo}</span> },
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              { key: 'unitName', header: 'Unit' },
              { key: 'aqlLevel', header: 'AQL', cell: (r) => <Badge variant="info">{r.aqlLevel}</Badge> },
              { key: 'lotSize', header: 'Lot', align: 'right', cell: (r) => formatNumber(r.lotSize) },
              { key: 'sampleSize', header: 'Sample', align: 'right' },
              {
                key: 'majorDefects',
                header: 'Major',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-semibold', r.majorDefects > r.acceptLimit ? 'text-danger-600' : 'text-foreground')}>
                    {r.majorDefects} / {r.acceptLimit}
                  </span>
                ),
              },
              { key: 'minorDefects', header: 'Minor', align: 'right' },
              { key: 'auditor', header: 'Auditor' },
              {
                key: 'auditedAt',
                header: 'Date',
                align: 'right',
                sortValue: (r) => new Date(r.auditedAt).getTime(),
                cell: (r) => formatDate(r.auditedAt, 'dd MMM'),
              },
              { key: 'verdict', header: 'Verdict', cell: (r) => <StatusBadge status={r.verdict} /> },
            ]}
            data={audits.data ?? []}
            isLoading={audits.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/** Small local icon alias so the stat row reads consistently. */
function MiniBarIcon(props) {
  return <ClipboardCheck {...props} />
}

/* ========================================================== Rejections ==== */

export function Rejections() {
  const rejections = useAsync(() => getRejections(), [])

  const byStage = useMemo(() => {
    const map = new Map()
    for (const row of rejections.data ?? []) {
      const entry = map.get(row.stage) ?? { stage: row.stage, qtyPcs: 0 }
      entry.qtyPcs += row.qtyPcs
      map.set(row.stage, entry)
    }
    return [...map.values()].sort((a, b) => b.qtyPcs - a.qtyPcs)
  }, [rejections.data])

  const total = (rejections.data ?? []).reduce((s, r) => s + r.qtyPcs, 0)
  const value = (rejections.data ?? []).reduce((s, r) => s + r.valueUsd, 0)

  return (
    <PageContainer>
      <PageHeader title="Rejections" description="Pieces rejected at each stage, with disposition and the value written off." />

      <StatGrid cols={3}>
        <StatCard label="Rejected pieces" value={formatNumber(total)} icon={Trash2} tone="danger" />
        <StatCard label="Value at FOB" value={formatUsdCompact(value)} icon={CircleX} tone="warning" />
        <StatCard label="Records" value={(rejections.data ?? []).length} icon={ClipboardCheck} tone="brand" />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Rejections by stage</CardTitle>
        </CardHeader>
        <CardContent>
          {rejections.isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStage} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={44} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} contentStyle={chartTooltipStyle} formatter={(v) => [`${formatNumber(v)} pcs`, 'Rejected']} />
                  <Bar dataKey="qtyPcs" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {byStage.map((row, i) => (
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
          <CardTitle>Rejection register</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              { key: 'stage', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stage}</Badge> },
              { key: 'unitName', header: 'Unit' },
              { key: 'reason', header: 'Reason' },
              { key: 'qtyPcs', header: 'Pieces', align: 'right', cell: (r) => formatNumber(r.qtyPcs) },
              { key: 'valueUsd', header: 'Value', align: 'right', cell: (r) => formatUsdCompact(r.valueUsd) },
              { key: 'disposition', header: 'Disposition', cell: (r) => <StatusBadge status={r.disposition} /> },
              {
                key: 'reportedAt',
                header: 'Reported',
                align: 'right',
                sortValue: (r) => new Date(r.reportedAt).getTime(),
                cell: (r) => formatDate(r.reportedAt, 'dd MMM'),
              },
            ]}
            data={rejections.data ?? []}
            isLoading={rejections.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ========================================================== Complaints ==== */

export function Complaints() {
  const [status, setStatus] = useState(null)
  const complaints = useAsync(() => getComplaints(status ? { status } : {}), [status])

  return (
    <PageContainer>
      <PageHeader
        title="Buyer Complaints"
        description="Issues raised after delivery, tracked to root cause and closure."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Complaint register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {['Open', 'Investigating', 'Resolved', 'Closed'].map((s) => (
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
              { key: 'refNo', header: 'Ref', cell: (r) => <span className="font-medium">{r.refNo}</span> },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'country', header: 'Country' },
              { key: 'orderNo', header: 'Order' },
              { key: 'styleNo', header: 'Style' },
              { key: 'category', header: 'Category', cell: (r) => <Badge variant="outline">{r.category}</Badge> },
              {
                key: 'severity',
                header: 'Severity',
                cell: (r) => (
                  <Badge variant={r.severity === 'Critical' ? 'danger' : r.severity === 'High' ? 'warning' : 'secondary'}>
                    {r.severity}
                  </Badge>
                ),
              },
              { key: 'description', header: 'Description' },
              { key: 'owner', header: 'Owner' },
              {
                key: 'raisedAt',
                header: 'Raised',
                align: 'right',
                sortValue: (r) => new Date(r.raisedAt).getTime(),
                cell: (r) => formatDate(r.raisedAt, 'dd MMM yy'),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={complaints.data ?? []}
            isLoading={complaints.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
