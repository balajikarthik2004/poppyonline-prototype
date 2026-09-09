import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Calculator, CheckCircle2, Clock, Palette, Percent, Shirt, TrendingDown } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { getCostSheets, getSamples, getStyles } from '@/services'
import { segments } from '@/mock/styles'
import { sampleStages } from '@/mock/merch'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatDate, formatPct, formatUsd } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt, statusColors } from '@/lib/chartColors'

/* ============================================================== Styles ==== */

export function StyleLibrary() {
  const [segment, setSegment] = useState(null)
  const styles = useAsync(() => getStyles(segment ? { segment } : {}), [segment])

  const stats = useMemo(() => {
    const rows = styles.data ?? []
    return {
      total: rows.length,
      active: rows.filter((s) => s.status === 'Active').length,
      development: rows.filter((s) => s.status === 'Development').length,
      pending: rows.filter((s) => s.approval !== 'Approved').length,
      avgSmv: rows.length ? rows.reduce((s, r) => s + r.smv, 0) / rows.length : 0,
    }
  }, [styles.data])

  return (
    <PageContainer>
      <PageHeader
        title="Style Library"
        description="Every style across men's, women's, boys, girls, infants and inners, with its fabric, decoration and approval state."
      />

      <StatGrid cols={5}>
        <StatCard label="Styles" value={stats.total} icon={Shirt} tone="brand" />
        <StatCard label="Active" value={stats.active} icon={CheckCircle2} tone="success" />
        <StatCard label="In development" value={stats.development} icon={Palette} tone="info" />
        <StatCard
          label="Awaiting approval"
          value={stats.pending}
          sublabel="PP or fit pending"
          icon={Clock}
          tone={stats.pending > 0 ? 'warning' : 'default'}
        />
        <StatCard label="Average SMV" value={stats.avgSmv.toFixed(1)} sublabel="minutes" icon={Percent} tone="poppy" />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Style register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!segment} onClick={() => setSegment(null)}>
                All segments
              </FilterChip>
              {segments.map((s) => (
                <FilterChip key={s} active={segment === s} onClick={() => setSegment(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'styleNo', header: 'Style', cell: (r) => <span className="font-medium">{r.styleNo}</span> },
              { key: 'name', header: 'Description' },
              { key: 'segment', header: 'Segment', cell: (r) => <Badge variant="outline">{r.segment}</Badge> },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'season', header: 'Season' },
              { key: 'fabric', header: 'Fabric' },
              { key: 'gsm', header: 'GSM', align: 'right' },
              { key: 'cottonProgramme', header: 'Cotton' },
              { key: 'decoration', header: 'Decoration' },
              { key: 'colours', header: 'Colours', align: 'right' },
              { key: 'smv', header: 'SMV', align: 'right', cell: (r) => r.smv.toFixed(1) },
              { key: 'fobUsd', header: 'FOB', align: 'right', cell: (r) => formatUsd(r.fobUsd) },
              { key: 'approval', header: 'Approval', cell: (r) => <StatusBadge status={r.approval === 'Approved' ? 'Approved' : 'Pending'} /> },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={styles.data ?? []}
            isLoading={styles.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ============================================================ Sampling ==== */

export function Sampling() {
  const [stage, setStage] = useState(null)
  const samples = useAsync(() => getSamples(stage ? { stage } : {}), [stage])

  const funnel = useMemo(() => {
    const rows = samples.data ?? []
    return sampleStages.map((s) => ({
      stage: s.replace(' (PP)', ''),
      count: rows.filter((r) => r.stage === s).length,
      approved: rows.filter((r) => r.stage === s && r.status === 'Approved').length,
    }))
  }, [samples.data])

  const stats = useMemo(() => {
    const rows = samples.data ?? []
    const approved = rows.filter((r) => r.status === 'Approved').length
    return {
      total: rows.length,
      approved,
      approvalPct: rows.length ? (approved / rows.length) * 100 : 0,
      rejected: rows.filter((r) => r.status === 'Rejected' || r.status === 'Revision Requested').length,
      avgRevisions: rows.length ? rows.reduce((s, r) => s + r.revisions, 0) / rows.length : 0,
    }
  }, [samples.data])

  return (
    <PageContainer>
      <PageHeader
        title="Sampling"
        description="The gate every style must clear before bulk is released: proto, fit, size set, pre-production, photoshoot and shipment sample."
      />

      <StatGrid cols={4}>
        <StatCard label="Samples in play" value={stats.total} icon={Palette} tone="brand" />
        <StatCard label="Approved" value={stats.approved} sublabel={formatPct(stats.approvalPct)} icon={CheckCircle2} tone="success" />
        <StatCard label="Needs rework" value={stats.rejected} icon={TrendingDown} tone="warning" />
        <StatCard
          label="Avg revisions"
          value={stats.avgRevisions.toFixed(1)}
          sublabel="rounds before approval"
          icon={Clock}
          tone="poppy"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Sample pipeline</CardTitle>
          <p className="text-xs text-muted-foreground">Submissions at each stage, and how many are approved</p>
        </CardHeader>
        <CardContent>
          {samples.isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" name="Submitted" radius={[4, 4, 0, 0]} maxBarSize={44} fill={statusColors.brand} />
                  <Bar dataKey="approved" name="Approved" radius={[4, 4, 0, 0]} maxBarSize={44} fill={statusColors.success} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Sample register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!stage} onClick={() => setStage(null)}>
                All stages
              </FilterChip>
              {sampleStages.map((s) => (
                <FilterChip key={s} active={stage === s} onClick={() => setStage(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'sampleNo', header: 'Sample', cell: (r) => <span className="font-medium">{r.sampleNo}</span> },
              { key: 'styleNo', header: 'Style' },
              { key: 'styleName', header: 'Description' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'stage', header: 'Stage', cell: (r) => <Badge variant="info">{r.stage}</Badge> },
              { key: 'quantity', header: 'Qty', align: 'right' },
              { key: 'revisions', header: 'Rev', align: 'right' },
              {
                key: 'dueAt',
                header: 'Due',
                align: 'right',
                sortValue: (r) => new Date(r.dueAt).getTime(),
                cell: (r) => formatDate(r.dueAt, 'dd MMM'),
              },
              { key: 'comments', header: 'Comment', cell: (r) => <span className="text-muted-foreground">{r.comments ?? '-'}</span> },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={samples.data ?? []}
            isLoading={samples.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ============================================================= Costing ==== */

export function Costing() {
  const [status, setStatus] = useState(null)
  const sheets = useAsync(() => getCostSheets(status ? { status } : {}), [status])

  const stats = useMemo(() => {
    const rows = sheets.data ?? []
    return {
      total: rows.length,
      avgMargin: rows.length ? rows.reduce((s, r) => s + r.marginPct, 0) / rows.length : 0,
      review: rows.filter((r) => r.status === 'Review').length,
      healthy: rows.filter((r) => r.status === 'Healthy').length,
    }
  }, [sheets.data])

  const breakdown = useMemo(() => {
    const rows = sheets.data ?? []
    if (!rows.length) return []
    const avg = (key) => rows.reduce((s, r) => s + r[key], 0) / rows.length
    return [
      { name: 'Fabric', value: avg('fabricCostInr') },
      { name: 'CMT', value: avg('cmtInr') },
      { name: 'Trims', value: avg('trimsInr') },
      { name: 'Print/Emb', value: avg('printEmbInr') },
      { name: 'Overhead', value: avg('overheadInr') },
    ]
  }, [sheets.data])

  return (
    <PageContainer>
      <PageHeader
        title="Costing"
        description="Cost sheets built the way a Tirupur costing desk builds them: fabric, CMT, trims, decoration and overhead against the quoted FOB."
      />

      <StatGrid cols={4}>
        <StatCard label="Cost sheets" value={stats.total} icon={Calculator} tone="brand" />
        <StatCard
          label="Average margin"
          value={formatPct(stats.avgMargin)}
          icon={Percent}
          tone={stats.avgMargin > 14 ? 'success' : 'warning'}
        />
        <StatCard label="Healthy" value={stats.healthy} sublabel="above 14% margin" icon={CheckCircle2} tone="success" />
        <StatCard
          label="Needs review"
          value={stats.review}
          sublabel="below 8% margin"
          icon={TrendingDown}
          tone={stats.review > 0 ? 'danger' : 'default'}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Average cost build-up</CardTitle>
          <p className="text-xs text-muted-foreground">Rupees per garment across every sheet on file</p>
        </CardHeader>
        <CardContent>
          {sheets.isLoading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={breakdown} margin={{ top: 4, right: 20, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={82} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    contentStyle={chartTooltipStyle}
                    formatter={(v) => [`Rs ${Number(v).toFixed(2)}`, 'Per piece']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {breakdown.map((row, i) => (
                      <Cell key={row.name} fill={colorAt(i)} />
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
            <CardTitle>Cost sheets</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {['Healthy', 'Thin', 'Review'].map((s) => (
                <FilterChip key={s} active={status === s} tone={s === 'Review' ? 'poppy' : 'brand'} onClick={() => setStatus(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'styleNo', header: 'Style', cell: (r) => <span className="font-medium">{r.styleNo}</span> },
              { key: 'styleName', header: 'Description' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'fabricConsumptionKg', header: 'Fabric kg', align: 'right', cell: (r) => r.fabricConsumptionKg.toFixed(3) },
              { key: 'fabricCostInr', header: 'Fabric', align: 'right', cell: (r) => r.fabricCostInr.toFixed(2) },
              { key: 'cmtInr', header: 'CMT', align: 'right', cell: (r) => r.cmtInr.toFixed(2) },
              { key: 'trimsInr', header: 'Trims', align: 'right', cell: (r) => r.trimsInr.toFixed(2) },
              { key: 'overheadInr', header: 'Overhead', align: 'right', cell: (r) => r.overheadInr.toFixed(2) },
              { key: 'totalCostInr', header: 'Total Rs', align: 'right', cell: (r) => r.totalCostInr.toFixed(2) },
              { key: 'costUsd', header: 'Cost $', align: 'right', cell: (r) => formatUsd(r.costUsd) },
              { key: 'quotedFobUsd', header: 'Quoted $', align: 'right', cell: (r) => formatUsd(r.quotedFobUsd) },
              {
                key: 'marginPct',
                header: 'Margin',
                align: 'right',
                cell: (r) => (
                  <span
                    className={
                      r.marginPct < 8 ? 'font-semibold text-danger-600' : r.marginPct < 14 ? 'text-warning-700' : 'text-success-700'
                    }
                  >
                    {formatPct(r.marginPct)}
                  </span>
                ),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={sheets.data ?? []}
            isLoading={sheets.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
