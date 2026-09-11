import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertOctagon,
  ChevronRight,
  CircleCheck,
  CircleX,
  ClipboardCheck,
  DollarSign,
  FlaskConical,
  Info,
  Layers,
  Printer,
  RotateCcw,
  Scale,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import {
  getAqlAudits,
  getAqlSamplingCalculator,
  getComplaints,
  getCopqSummary,
  getEightDCapaCases,
  getFabricRollInspections,
  getInlineInspections,
  getLabTests,
  getQualitySummary,
  getRejections,
} from '@/services'
import {
  FilterChip,
  FilterChipGroup,
  PageContainer,
  PageHeader,
  StatCard,
  StatGrid,
  StatGridSkeleton,
} from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Am5DonutChart } from '@/components/charts/Am5DonutChart'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
} from '@/components/ui'
import { formatDate, formatNumber, formatPct, formatUsdCompact } from '@/lib/format'
import {
  axisTick,
  chartItemStyle,
  chartLabelStyle,
  chartTooltipStyle,
  colorAt,
  statusColors,
} from '@/lib/chartColors'
import { cn } from '@/lib/utils'

const resultColors = {
  Pass: statusColors.success,
  Rework: statusColors.warning,
  Fail: statusColors.danger,
}

const labTestCategories = ['All Tests', 'Physical Tests', 'Colour Fastness', 'Chemical & Eco', 'Yarn Quality']

function toneForRate(pct) {
  if (pct >= 90) return 'bg-success-500'
  if (pct >= 80) return 'bg-warning-500'
  return 'bg-danger-500'
}

/* =========================================================== Dashboard ==== */

export function QualityDashboard() {
  const summary = useAsync(getQualitySummary, [])
  const copq = useAsync(getCopqSummary, [])
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
        .slice(0, 6),
    [inline.data],
  )

  return (
    <PageContainer>
      <PageHeader
        title="Quality Assurance & QMS Command Center"
        description="The Closed-Loop Quality Management System (QMS) linking the laboratory, 4-point fabric rolls, inline sewing DHU, final AQL audits, and 8D CAPA root-cause resolution."
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/quality/aql"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-brand-700"
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              AQL Sampling Simulator
            </Link>
            <Link
              to="/quality/lab-tests"
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
            >
              Open Lab Register
            </Link>
          </div>
        }
      />

      {summary.isLoading || !summary.data ? (
        <StatGridSkeleton count={6} />
      ) : (
        <StatGrid cols={6}>
          <StatCard
            label="Lab Tests Cleared"
            value={formatNumber(summary.data.total)}
            sublabel={`Pass rate ${formatPct(summary.data.passRatePct)}`}
            icon={FlaskConical}
            tone="info"
            to="/quality/lab-tests"
          />
          <StatCard
            label="Inline Sewing DHU"
            value={`${summary.data.avgDhuPct}%`}
            sublabel="Target < 4.0% DHU"
            icon={TriangleAlert}
            tone={summary.data.avgDhuPct > 5 ? 'danger' : 'warning'}
            to="/quality/inline"
          />
          <StatCard
            label="AQL 1.5/2.5 Pass Rate"
            value={formatPct(summary.data.aqlPassRatePct)}
            sublabel="Pre-shipment audit gate"
            icon={ShieldCheck}
            tone="brand"
            to="/quality/aql"
          />
          <StatCard
            label="4-Point Fabric Holds"
            value="3 Rolls"
            sublabel="ASTM D5430 > 28 pts"
            icon={Layers}
            tone="warning"
            to="/quality/fabric"
          />
          <StatCard
            label="Total Scrap & Rejection"
            value={formatNumber(summary.data.rejectionPcs)}
            sublabel={formatUsdCompact(summary.data.rejectionValueUsd)}
            icon={Trash2}
            tone="danger"
            to="/quality/rejections"
          />
          <StatCard
            label="Active 8D CAPA Cases"
            value={summary.data.activeCapaCount || 3}
            sublabel="Root-cause resolution"
            icon={AlertOctagon}
            tone="poppy"
            to="/quality/complaints"
          />
        </StatGrid>
      )}

      {/* Closed-Loop QMS Architecture Pipeline Banner */}
      <Card className="border-brand-200 bg-linear-to-r from-brand-950 via-ink-950 to-brand-900 p-4.5 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-brand-200">
                Poppys Closed-Loop Quality Architecture (QMS Gate Flow)
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-100">
              <Link to="/quality/lab-tests" className="rounded-md bg-white/10 px-2.5 py-1 transition hover:bg-white/20">
                1. Lab Testing (Shrinkage/Fastness)
              </Link>
              <span className="text-muted-foreground">→</span>
              <Link to="/quality/fabric" className="rounded-md bg-white/10 px-2.5 py-1 transition hover:bg-white/20">
                2. ASTM 4-Point Fabric
              </Link>
              <span className="text-muted-foreground">→</span>
              <Link to="/quality/inline" className="rounded-md bg-white/10 px-2.5 py-1 transition hover:bg-white/20">
                3. Inline Sewing DHU (24 Lines)
              </Link>
              <span className="text-muted-foreground">→</span>
              <Link to="/quality/aql" className="rounded-md bg-white/10 px-2.5 py-1 transition hover:bg-white/20">
                4. Pre-Shipment AQL 1.5/2.5
              </Link>
              <span className="text-muted-foreground">→</span>
              <Link to="/quality/complaints" className="rounded-md bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-1 transition hover:bg-emerald-500/30">
                5. 8D CAPA Root-Cause Closure
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/ai/playbooks"
              className="inline-flex items-center rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25"
            >
              Quality Playbooks →
            </Link>
          </div>
        </div>
      </Card>

      {/* Cost of Poor Quality (COPQ) & Financial Quality Impact */}
      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-brand-600" />
                Cost of Poor Quality (COPQ) & Defect Cost Analysis
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Total monthly quality cost impact: Internal scrap, line rework labor, laboratory appraisal, and buyer debit notes.
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              COPQ: 0.82% of Group Turnover
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-danger-200 bg-danger-50/40 p-3.5">
              <div className="text-[11px] font-semibold text-danger-700 uppercase">Internal Scrap & Reject</div>
              <div className="mt-1 font-display text-xl font-bold text-danger-700">
                {formatUsdCompact(copq.data?.scrapValueUsd || 21400)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Cut panel waste & defective dyed fabric</div>
            </div>
            <div className="rounded-xl border border-warning-200 bg-warning-50/40 p-3.5">
              <div className="text-[11px] font-semibold text-warning-800 uppercase">Rework & Alteration Labor</div>
              <div className="mt-1 font-display text-xl font-bold text-warning-800">
                {formatUsdCompact(copq.data?.reworkLaborUsd || 14200)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Sewing unpicking & spot-cleaning hours</div>
            </div>
            <div className="rounded-xl border border-info-200 bg-info-50/40 p-3.5">
              <div className="text-[11px] font-semibold text-info-700 uppercase">Testing & Lab Appraisal</div>
              <div className="mt-1 font-display text-xl font-bold text-info-700">
                {formatUsdCompact(copq.data?.testingAppraisalUsd || 8600)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Third-party SGS / Intertek certification tests</div>
            </div>
            <div className="rounded-xl border border-poppy-200 bg-poppy-50/40 p-3.5">
              <div className="text-[11px] font-semibold text-poppy-700 uppercase">External Risk / Debit Notes</div>
              <div className="mt-1 font-display text-xl font-bold text-poppy-700">
                {formatUsdCompact(copq.data?.customerDebitNotesUsd || 4400)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Buyer allowances & air-freight risk buffers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pass Rate by Manufacturing Stage</CardTitle>
            <p className="text-xs text-muted-foreground">Yarn, greige, dyed fabric, and finished garment</p>
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
            <CardTitle>Test Disposition</CardTitle>
            <p className="text-xs text-muted-foreground">Physical & chemical disposition of all 110 test batches</p>
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <Am5DonutChart
                data={resultSlices}
                height={260}
                innerRadius={55}
                showLegend={true}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Rejection Defect Pareto</CardTitle>
            <p className="text-xs text-muted-foreground">Leading causes of garment rework & scrap</p>
          </CardHeader>
          <CardContent>
            {summary.isLoading || !summary.data ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="space-y-3">
                {summary.data.byReason.slice(0, 5).map((r, i) => {
                  const totalPcs = summary.data.byReason.reduce((s, x) => s + x.qtyPcs, 0)
                  const pct = totalPcs ? (r.qtyPcs / totalPcs) * 100 : 0
                  return (
                    <div key={r.key}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground truncate max-w-45">{i + 1}. {r.key}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {formatNumber(r.qtyPcs)} pcs ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={pct} indicatorClassName={colorAt(i)} />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* High-Attention Quality Incident Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>High-Attention Quality Queue</CardTitle>
              <p className="text-xs text-muted-foreground">
                Recent inspection reports with DHU &gt; 5.0% or Line-Stop alarms requiring supervisor review
              </p>
            </div>
            <Badge variant="danger" className="animate-pulse">Live Floor Alerts</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attention.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-danger-200 bg-danger-50/20 p-3.5 transition-all hover:border-danger-400"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{row.lineNo}</span>
                      <span className="text-xs text-muted-foreground">({row.unitName})</span>
                    </div>
                    <div className="text-xs font-medium text-brand-700 mt-0.5">
                      Style {row.styleNo} - {row.buyerName}
                    </div>
                  </div>
                  <Badge variant={row.verdict === 'Stop Line' ? 'danger' : 'warning'}>
                    {row.verdict}
                  </Badge>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2 text-xs">
                  <span className="font-semibold text-danger-600">DHU {row.dhuPct}%</span>
                  <span className="text-muted-foreground">{row.defectsFound} defects / {row.checkedPcs} checked</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Primary Defect: <strong className="text-foreground">{row.topDefect}</strong>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ============================================================ LabTests ==== */

export function LabTests() {
  const [category, setCategory] = useState('All Tests')
  const [result, setResult] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)
  const tests = useAsync(() => getLabTests(), [])

  const filteredTests = useMemo(() => {
    let list = tests.data ?? []
    if (category !== 'All Tests') {
      list = list.filter((t) => t.category === category)
    }
    if (result) {
      list = list.filter((t) => t.result === result)
    }
    return list
  }, [tests.data, category, result])

  const stats = useMemo(() => {
    const list = tests.data ?? []
    const pass = list.filter((t) => t.result === 'Pass').length
    return {
      total: list.length,
      pass,
      passRate: list.length ? (pass / list.length) * 100 : 0,
      fails: list.filter((t) => t.result === 'Fail').length,
      rework: list.filter((t) => t.result === 'Rework').length,
    }
  }, [tests.data])

  return (
    <PageContainer>
      <PageHeader
        title="Testing Laboratory Register"
        description="Physical and chemical compliance verification: ISO 6330 shrinkage (3 cycles), color fastness to washing/rubbing, pilling, bursting strength, and Oeko-Tex Class I ecology certification."
      />

      <StatGrid cols={4}>
        <StatCard label="Total Lab Tests" value={stats.total} icon={FlaskConical} tone="brand" />
        <StatCard label="Overall Pass Rate" value={formatPct(stats.passRate)} icon={CircleCheck} tone={stats.passRate > 88 ? 'success' : 'warning'} />
        <StatCard label="Quarantine / Rework" value={stats.rework} icon={RotateCcw} tone="warning" />
        <StatCard label="Critical Fails" value={stats.fails} icon={CircleX} tone={stats.fails > 0 ? 'danger' : 'default'} />
      </StatGrid>

      {/* Filter Toolbar */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FilterChipGroup>
              {labTestCategories.map((cat) => (
                <FilterChip key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                  {cat}
                </FilterChip>
              ))}
            </FilterChipGroup>

            <FilterChipGroup>
              <FilterChip active={!result} onClick={() => setResult(null)}>
                All Results
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
              {
                key: 'testNo',
                header: 'Test Ref',
                cell: (r) => (
                  <button
                    type="button"
                    onClick={() => setSelectedTest(r)}
                    className="font-bold text-primary hover:underline"
                  >
                    {r.testNo}
                  </button>
                ),
              },
              { key: 'stage', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stage}</Badge> },
              { key: 'testName', header: 'Test Specification' },
              { key: 'standard', header: 'Standard' },
              { key: 'tolerance', header: 'Buyer Tolerance' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              {
                key: 'testedDate',
                header: 'Tested',
                align: 'right',
                sortValue: (r) => new Date(r.testedDate).getTime(),
                cell: (r) => formatDate(r.testedDate, 'dd MMM'),
              },
              { key: 'testedBy', header: 'Technologist' },
              { key: 'result', header: 'Verdict', cell: (r) => <StatusBadge status={r.result} /> },
              {
                key: 'action',
                header: 'Action',
                align: 'right',
                cell: (r) => (
                  <Button size="sm" variant="outline" onClick={() => setSelectedTest(r)}>
                    Certificate
                  </Button>
                ),
              },
            ]}
            data={filteredTests}
            isLoading={tests.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      {/* Lab Specimen Certificate Modal */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-foreground">{selectedTest.testNo}</span>
                  <StatusBadge status={selectedTest.result} />
                  <Badge variant="brand">{selectedTest.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Standard: <strong>{selectedTest.standard}</strong> • Stage: {selectedTest.stage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTest(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-secondary/30 p-3.5">
                <div>
                  <span className="text-muted-foreground">Buyer Account:</span>
                  <div className="font-semibold text-foreground">{selectedTest.buyerName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Export Style:</span>
                  <div className="font-semibold text-foreground">{selectedTest.styleNo}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Lot / Batch No:</span>
                  <div className="font-semibold text-foreground">{selectedTest.lotNo || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Testing Date:</span>
                  <div className="font-semibold text-foreground">{formatDate(selectedTest.testedDate, 'dd MMM yyyy')}</div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground">Parametric Test Values:</div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Target / Standard:</span>
                    <div className="font-mono text-sm font-bold text-foreground">{selectedTest.target || selectedTest.tolerance}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Measured Value:</span>
                    <div className={cn('font-mono text-sm font-bold', selectedTest.result === 'Pass' ? 'text-success-700' : 'text-danger-600')}>
                      {selectedTest.measuredValue}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground border-t border-border pt-2">
                  Remarks: <strong className="text-foreground">{selectedTest.remarks}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">Certified By: <strong>{selectedTest.testedBy}</strong></span>
                <Button size="sm" variant="outline" onClick={() => setSelectedTest(null)}>
                  Close Certificate
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

/* ======================================================= FabricQuality ==== */

export function FabricQuality() {
  const [selectedRoll, setSelectedRoll] = useState(null)
  const rolls = useAsync(getFabricRollInspections, [])

  const stats = useMemo(() => {
    const list = rolls.data ?? []
    const pass = list.filter((r) => r.verdict === 'Pass').length
    const holds = list.filter((r) => r.verdict === 'Hold').length
    const totalPoints = list.reduce((s, r) => s + r.pointsPer100SqYd, 0)
    return {
      total: list.length,
      pass,
      passRate: list.length ? (pass / list.length) * 100 : 0,
      holds,
      avgPointsPer100: list.length ? (totalPoints / list.length).toFixed(1) : 0,
    }
  }, [rolls.data])

  return (
    <PageContainer>
      <PageHeader
        title="ASTM D5430 4-Point Fabric Inspection"
        description="Roll-by-roll defect penalty mapping for knitted fabric rolls. Maximum allowable threshold: <= 28.0 penalty points per 100 sq. yards before release to the cutting room."
      />

      <StatGrid cols={4}>
        <StatCard label="Inspected Rolls" value={stats.total} icon={Layers} tone="brand" />
        <StatCard label="4-Point Pass Rate" value={formatPct(stats.passRate)} icon={CircleCheck} tone={stats.passRate > 85 ? 'success' : 'warning'} />
        <StatCard label="Quarantine Holds" value={stats.holds} icon={TriangleAlert} tone={stats.holds > 0 ? 'danger' : 'default'} />
        <StatCard label="Average Penalty Pts" value={`${stats.avgPointsPer100} pts`} sublabel="Threshold < 28.0" icon={Scale} tone="info" />
      </StatGrid>

      {/* ASTM 4-Point Standard Formula Note */}
      <Card className="border-border bg-slate-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Info className="h-4 w-4 text-brand-600" />
            <span>ASTM D5430 Standard Formula:</span>
            <code className="rounded bg-background px-2 py-0.5 font-mono text-[11px] border border-border">
              Points / 100 sq. yd = (Total Points × 3600) / (Width in inches × Length in yards)
            </code>
          </div>
          <Badge variant="outline">Passing Standard: &le; 28.0 Points</Badge>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fabric Roll Inspection Matrix</CardTitle>
            <Badge variant="secondary">{rolls.data?.length || 48} Rolls Audited</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'rollBatch',
                header: 'Roll Batch',
                cell: (r) => (
                  <button
                    type="button"
                    onClick={() => setSelectedRoll(r)}
                    className="font-bold text-primary hover:underline"
                  >
                    {r.rollBatch}
                  </button>
                ),
              },
              { key: 'fabricType', header: 'Fabric Construction' },
              { key: 'colour', header: 'Colour & Shade', cell: (r) => <span>{r.colour} ({r.shadeLot})</span> },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              { key: 'widthInches', header: 'Width', align: 'right', cell: (r) => `${r.widthInches}"` },
              { key: 'lengthYards', header: 'Length', align: 'right', cell: (r) => `${r.lengthYards} yd` },
              { key: 'defects', header: 'Defects', align: 'right', cell: (r) => r.defects?.length || 0 },
              { key: 'totalPoints', header: 'Raw Pts', align: 'right', cell: (r) => r.totalPoints },
              {
                key: 'pointsPer100SqYd',
                header: 'Pts / 100 sq.yd',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-bold', r.pointsPer100SqYd > 28.0 ? 'text-danger-600' : 'text-success-700')}>
                    {r.pointsPer100SqYd}
                  </span>
                ),
              },
              { key: 'verdict', header: 'Verdict', cell: (r) => <StatusBadge status={r.verdict} /> },
              {
                key: 'action',
                header: 'Action',
                align: 'right',
                cell: (r) => (
                  <Button size="sm" variant="outline" onClick={() => setSelectedRoll(r)}>
                    Roll Visualizer
                  </Button>
                ),
              },
            ]}
            data={rolls.data ?? []}
            isLoading={rolls.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      {/* Roll Defect Visualizer & Yard-by-Yard Map Modal */}
      {selectedRoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold text-foreground">{selectedRoll.rollBatch} Defect Map</span>
                  <StatusBadge status={selectedRoll.verdict} />
                  <Badge variant="brand">{selectedRoll.fabricType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dye Lot: <strong>{selectedRoll.dyeLotNo}</strong> • Shade: {selectedRoll.shadeLot} • Width: {selectedRoll.widthInches}"
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRoll(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-secondary/30 p-3.5">
                <div>
                  <span className="text-muted-foreground">Inspected Length:</span>
                  <div className="font-bold text-foreground">{selectedRoll.lengthYards} yards ({selectedRoll.weightKg} kg)</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total 4-Point Penalty:</span>
                  <div className="font-bold text-foreground">{selectedRoll.totalPoints} points ({selectedRoll.defects.length} defects)</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Calculated Score:</span>
                  <div className={cn('font-bold font-mono text-sm', selectedRoll.pointsPer100SqYd > 28 ? 'text-danger-600' : 'text-success-700')}>
                    {selectedRoll.pointsPer100SqYd} pts / 100 sq.yd
                  </div>
                </div>
              </div>

              {/* Visual Roll Defect Timeline */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Linear Roll Defect Distribution (0 to {selectedRoll.lengthYards} yards)</span>
                  <span className="text-[11px] text-muted-foreground">ASTM D5430 Defect Tags</span>
                </div>
                <div className="mt-3 relative h-10 w-full rounded-lg bg-secondary/80 border border-border flex items-center px-2">
                  <span className="absolute left-2 text-[10px] text-muted-foreground font-mono">0 yd</span>
                  <span className="absolute right-2 text-[10px] text-muted-foreground font-mono">{selectedRoll.lengthYards} yd</span>
                  {selectedRoll.defects.map((d, i) => {
                    const posPct = (d.yardPosition / selectedRoll.lengthYards) * 100
                    return (
                      <div
                        key={i}
                        className="absolute h-6 w-1.5 rounded-full bg-danger-500 hover:scale-150 transition cursor-pointer"
                        style={{ left: `${posPct}%` }}
                        title={`Yard ${d.yardPosition}: ${d.defectName}`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Defect Register */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-semibold text-foreground mb-2">Defect Logbook:</div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {selectedRoll.defects.map((d, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5">
                      <span>Yard {d.yardPosition} — <strong className="text-foreground">{d.defectName}</strong></span>
                      <Badge variant={d.points >= 3 ? 'danger' : 'warning'}>{d.points} Points</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRoll.quarantineAction && (
                <div className="rounded-xl border border-danger-200 bg-danger-50/40 p-3.5 text-danger-800">
                  <strong>Quarantine Directive:</strong> {selectedRoll.quarantineAction}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground">Inspector: <strong>{selectedRoll.inspector}</strong></span>
                <Button size="sm" variant="outline" onClick={() => setSelectedRoll(null)}>
                  Close Map
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
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
        title="Inline Sewing Inspection (24 Lines DHU Gate)"
        description="Defects per Hundred Units (DHU %) recorded hourly by roving floor QC inspectors. Lines exceeding 5.0% DHU trigger supervisor alerts; lines > 6.0% are halted immediately."
      />

      <StatGrid cols={5}>
        <StatCard label="QC Inspections" value={stats.reports} icon={ClipboardCheck} tone="brand" />
        <StatCard label="Pieces Checked" value={formatNumber(stats.checked)} icon={CircleCheck} tone="info" />
        <StatCard label="Defects Found" value={formatNumber(stats.defects)} icon={CircleX} tone="warning" />
        <StatCard label="Overall Floor DHU" value={formatPct(stats.dhu)} icon={TriangleAlert} tone={stats.dhu > 5 ? 'danger' : 'success'} />
        <StatCard label="Lines Stopped" value={stats.stopped} icon={RotateCcw} tone={stats.stopped > 0 ? 'danger' : 'default'} />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Inline Inspection Logbook</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!verdict} onClick={() => setVerdict(null)}>
                All Verdicts
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
              { key: 'lineNo', header: 'Sewing Line', cell: (r) => <span className="font-bold text-foreground">{r.lineNo}</span> },
              { key: 'unitName', header: 'Unit' },
              { key: 'styleNo', header: 'Style' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'checkedPcs', header: 'Checked', align: 'right', cell: (r) => formatNumber(r.checkedPcs) },
              { key: 'defectsFound', header: 'Defects', align: 'right', cell: (r) => formatNumber(r.defectsFound) },
              {
                key: 'dhuPct',
                header: 'DHU %',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-bold', r.dhuPct > 6 ? 'text-danger-600' : r.dhuPct > 3 ? 'text-warning-700' : 'text-success-700')}>
                    {r.dhuPct}%
                  </span>
                ),
              },
              { key: 'topDefect', header: 'Top Defect' },
              { key: 'inspector', header: 'QC Inspector' },
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
  const [selectedAudit, setSelectedAudit] = useState(null)
  const [simLotSize, setSimLotSize] = useState(5000)
  const [simAqlLevel, setSimAqlLevel] = useState('AQL 1.5')

  const audits = useAsync(() => getAqlAudits(verdict ? { verdict } : {}), [verdict])
  const simPlan = useAsync(() => getAqlSamplingCalculator(simLotSize, simAqlLevel), [simLotSize, simAqlLevel])

  const stats = useMemo(() => {
    const rows = audits.data ?? []
    const pass = rows.filter((r) => r.verdict === 'Pass').length
    return {
      total: rows.length,
      pass,
      passPct: rows.length ? (pass / rows.length) * 100 : 0,
      failed: rows.filter((r) => r.verdict === 'Fail').length,
      reinspect: rows.filter((r) => r.verdict === 'Re-inspect').length,
    }
  }, [audits.data])

  return (
    <PageContainer>
      <PageHeader
        title="Pre-Shipment Final AQL Audit & Certificate Console"
        description="The final gate before export container stuffing. Statistically sampled according to ISO 2859-1 (ANSI/ASQ Z1.4) General Inspection Level II standards."
      />

      <StatGrid cols={4}>
        <StatCard label="AQL Audits" value={stats.total} icon={ClipboardCheck} tone="brand" />
        <StatCard label="Passed & Released" value={stats.pass} icon={ShieldCheck} tone="success" />
        <StatCard label="AQL Pass Rate" value={formatPct(stats.passPct)} icon={CircleCheck} tone={stats.passPct > 90 ? 'success' : 'warning'} />
        <StatCard label="Failed / On Hold" value={stats.failed} icon={CircleX} tone={stats.failed > 0 ? 'danger' : 'default'} />
      </StatGrid>

      {/* Interactive ISO 2859-1 AQL Sampling Simulator */}
      <Card className="border-brand-200 bg-linear-to-r from-brand-50/50 via-card to-card">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-4.5 w-4.5 text-brand-600" />
                ISO 2859-1 (ANSI/ASQ Z1.4) Sampling Plan Calculator
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Enter export lot size to compute sample code letter, required sample size, and Accept ($Ac$) / Reject ($Re$) limits.
              </p>
            </div>
            <Badge variant="brand">General Inspection Level II</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Export Lot Size (Pcs)</label>
              <input
                type="number"
                value={simLotSize}
                onChange={(e) => setSimLotSize(Math.max(50, parseInt(e.target.value, 10) || 500))}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-bold text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Buyer Standard</label>
              <select
                value={simAqlLevel}
                onChange={(e) => setSimAqlLevel(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground"
              >
                <option value="AQL 1.0">AQL 1.0 (Strict / High Value)</option>
                <option value="AQL 1.5">AQL 1.5 (Standard Export)</option>
                <option value="AQL 2.5">AQL 2.5 (Basic Garments)</option>
              </select>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase">Sample Code Letter & Size</div>
              <div className="mt-1 font-display text-lg font-bold text-brand-700">
                Code {simPlan.data?.codeLetter} • {simPlan.data?.sampleSize} Pcs
              </div>
              <div className="text-[11px] text-muted-foreground">~{Math.ceil((simPlan.data?.sampleSize || 200) / 24)} Cartons to pull</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase">Accept / Reject Limit</div>
              <div className="mt-1 font-display text-lg font-bold text-success-700">
                Ac &le; {simPlan.data?.acceptLimit} / Re &ge; {simPlan.data?.rejectLimit}
              </div>
              <div className="text-[11px] text-muted-foreground">Critical Defects: 0 Allowed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Pre-Shipment Audit Register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!verdict} onClick={() => setVerdict(null)}>
                All Audits
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
              {
                key: 'auditNo',
                header: 'Audit Ref',
                cell: (r) => (
                  <button
                    type="button"
                    onClick={() => setSelectedAudit(r)}
                    className="font-bold text-primary hover:underline"
                  >
                    {r.auditNo}
                  </button>
                ),
              },
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              { key: 'aqlLevel', header: 'AQL', cell: (r) => <Badge variant="info">{r.aqlLevel}</Badge> },
              { key: 'lotSize', header: 'Lot Size', align: 'right', cell: (r) => formatNumber(r.lotSize) },
              { key: 'sampleSize', header: 'Sample', align: 'right', cell: (r) => `${r.sampleSize} pcs` },
              {
                key: 'majorDefects',
                header: 'Major Defect',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-bold', r.majorDefects > r.acceptLimit ? 'text-danger-600' : 'text-success-700')}>
                    {r.majorDefects} / {r.acceptLimit}
                  </span>
                ),
              },
              { key: 'minorDefects', header: 'Minor', align: 'right' },
              { key: 'auditor', header: 'Auditor Agency' },
              {
                key: 'auditedAt',
                header: 'Date',
                align: 'right',
                sortValue: (r) => new Date(r.auditedAt).getTime(),
                cell: (r) => formatDate(r.auditedAt, 'dd MMM'),
              },
              { key: 'verdict', header: 'Verdict', cell: (r) => <StatusBadge status={r.verdict} /> },
              {
                key: 'action',
                header: 'Certificate',
                align: 'right',
                cell: (r) => (
                  <Button size="sm" variant="outline" onClick={() => setSelectedAudit(r)}>
                    View Release
                  </Button>
                ),
              },
            ]}
            data={audits.data ?? []}
            isLoading={audits.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      {/* Official AQL Inspection Release Certificate Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold text-foreground">
                    Pre-Shipment Inspection Certificate ({selectedAudit.auditNo})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Poppys Knitwear (P) Limited — Quality Assurance Directorate
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
                <div>
                  <div className="text-xs text-muted-foreground">Release Status:</div>
                  <div className={cn('text-base font-bold', selectedAudit.verdict === 'Pass' ? 'text-success-700' : 'text-danger-600')}>
                    {selectedAudit.containerReleaseStatus}
                  </div>
                </div>
                <Badge variant={selectedAudit.verdict === 'Pass' ? 'success' : 'danger'} className="text-sm px-3 py-1">
                  {selectedAudit.verdict.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4">
                <div>
                  <span className="text-muted-foreground">Buyer Account:</span>
                  <div className="font-semibold text-foreground">{selectedAudit.buyerName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Order & Style:</span>
                  <div className="font-semibold text-foreground">{selectedAudit.orderNo} ({selectedAudit.styleNo})</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Lot Quantity:</span>
                  <div className="font-semibold text-foreground">{formatNumber(selectedAudit.lotSize)} pcs ({selectedAudit.totalCartons} Cartons)</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Inspected Sample:</span>
                  <div className="font-semibold text-foreground">{selectedAudit.sampleSize} pcs ({selectedAudit.cartonChecked} Cartons)</div>
                </div>
                <div>
                  <span className="text-muted-foreground">AQL Standard:</span>
                  <div className="font-semibold text-brand-700">{selectedAudit.aqlLevel} (Ac: {selectedAudit.acceptLimit} / Re: {selectedAudit.rejectLimit})</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Defects Found:</span>
                  <div className="font-semibold text-foreground">
                    Critical: {selectedAudit.criticalDefects}, Major: {selectedAudit.majorDefects}, Minor: {selectedAudit.minorDefects}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-slate-50/70 p-3.5">
                <span className="text-muted-foreground">Auditing Agency & Credential:</span>
                <div className="font-bold text-foreground mt-0.5">{selectedAudit.auditor}</div>
                <div className="text-muted-foreground mt-1">Audit Conducted on: {formatDate(selectedAudit.auditedAt, 'dd MMMM yyyy')}</div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" />
                  Print Official Certificate
                </Button>
                <Button size="sm" variant="brand" onClick={() => setSelectedAudit(null)}>
                  Close Inspection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
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
      <PageHeader
        title="Scrap & Rejection Register"
        description="Pieces rejected across all 9 production departments with disposition (Scrap, Rework, Downgrade to Seconds) and financial write-off at FOB value."
      />

      <StatGrid cols={3}>
        <StatCard label="Rejected Pieces" value={formatNumber(total)} icon={Trash2} tone="danger" />
        <StatCard label="FOB Value Written Off" value={formatUsdCompact(value)} icon={CircleX} tone="warning" />
        <StatCard label="Logged Incidents" value={(rejections.data ?? []).length} icon={ClipboardCheck} tone="brand" />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Rejection Distribution by Department</CardTitle>
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
          <CardTitle>Rejection Logbook</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              { key: 'stage', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stage}</Badge> },
              { key: 'unitName', header: 'Unit' },
              { key: 'reason', header: 'Defect Reason' },
              { key: 'qtyPcs', header: 'Pieces', align: 'right', cell: (r) => formatNumber(r.qtyPcs) },
              { key: 'valueUsd', header: 'FOB Write-off', align: 'right', cell: (r) => formatUsdCompact(r.valueUsd) },
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
  const [selectedCapa, setSelectedCapa] = useState(null)

  const complaintsList = useAsync(() => getComplaints(status ? { status } : {}), [status])
  const capaCases = useAsync(getEightDCapaCases, [])

  return (
    <PageContainer>
      <PageHeader
        title="Buyer Complaints & 8D CAPA Resolution Engine"
        description="Closed-loop Root Cause Analysis (RCA) and 8D Corrective & Preventive Actions (CAPA) resolving buyer quality complaints with 5-Whys diagrams and preventive process locks."
      />

      {/* 8D Problem Solving Lifecycle Pipeline Cards */}
      <Card className="border-brand-200 bg-linear-to-r from-brand-50/50 via-card to-card">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="h-4.5 w-4.5 text-brand-600" />
                Active 8D CAPA Root-Cause Cases
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Formal 8-Discipline problem-solving records linked to buyer complaints
              </p>
            </div>
            <Badge variant="brand">{capaCases.data?.length || 3} Active CAPAs</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(capaCases.data ?? []).map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCapa(c)}
                className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-400 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-brand-700">{c.id}</span>
                  <Badge variant={c.status.includes('Closed') ? 'success' : 'warning'}>{c.status}</Badge>
                </div>
                <div className="mt-1 font-semibold text-foreground text-xs line-clamp-1">{c.title}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Buyer: <strong className="text-foreground">{c.buyerName}</strong> ({c.styleNo})
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] border-t border-border pt-2">
                  <span className="text-danger-600 font-bold">{formatUsdCompact(c.copqExposureUsd)} Exposure</span>
                  <span className="text-primary font-medium flex items-center gap-0.5">
                    View 8D Steps <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Buyer Complaint Register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All Statuses
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
              { key: 'description', header: 'Defect Description' },
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
            data={complaintsList.data ?? []}
            isLoading={complaintsList.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      {/* 8D Problem Solving Detail Modal Drawer */}
      {selectedCapa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold text-foreground">
                    8D Root Cause Analysis: {selectedCapa.id}
                  </span>
                  <Badge variant="brand">{selectedCapa.buyerName}</Badge>
                  <Badge variant={selectedCapa.status.includes('Closed') ? 'success' : 'warning'}>{selectedCapa.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Style: <strong>{selectedCapa.styleNo}</strong> • Order: {selectedCapa.orderNo} • Ref: {selectedCapa.complaintRef}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCapa(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl border border-border bg-secondary/30 p-3.5">
                <div className="font-bold text-foreground text-sm">{selectedCapa.title}</div>
                <div className="text-muted-foreground mt-1"><strong>D1 Team:</strong> {selectedCapa.d1_team}</div>
                <div className="text-muted-foreground mt-1"><strong>D2 Problem Statement:</strong> {selectedCapa.d2_problem}</div>
              </div>

              <div className="rounded-xl border border-warning-200 bg-warning-50/40 p-3.5">
                <strong className="text-warning-800">D3 Immediate Containment Action:</strong>
                <p className="mt-1 text-muted-foreground">{selectedCapa.d3_containment}</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <strong className="text-foreground">D4 5-Whys Root Cause Analysis:</strong>
                <div className="mt-2 space-y-1">
                  {selectedCapa.d4_rootCause5Whys.map((why, i) => (
                    <div key={i} className="rounded-lg bg-muted/30 px-3 py-1.5 font-mono text-[11px] text-foreground">
                      {why}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-success-200 bg-success-50/30 p-3.5">
                  <strong className="text-success-800">D5 Corrective Action:</strong>
                  <p className="mt-1 text-muted-foreground">{selectedCapa.d5_correctiveAction}</p>
                </div>
                <div className="rounded-xl border border-info-200 bg-info-50/30 p-3.5">
                  <strong className="text-info-700">D6 Validation & Testing:</strong>
                  <p className="mt-1 text-muted-foreground">{selectedCapa.d6_validation}</p>
                </div>
              </div>

              <div className="rounded-xl border border-brand-200 bg-brand-50/30 p-3.5">
                <strong className="text-brand-800">D7 Preventive Systemic Lock:</strong>
                <p className="mt-1 text-muted-foreground">{selectedCapa.d7_preventiveAction}</p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground"><strong>D8 Sign-off:</strong> {selectedCapa.d8_signOff}</span>
                <Button size="sm" variant="brand" onClick={() => setSelectedCapa(null)}>
                  Close 8D Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
