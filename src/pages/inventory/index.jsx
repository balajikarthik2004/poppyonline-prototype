import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Boxes, Factory, Layers, Package, Warehouse } from 'lucide-react'
import {
  PoppysInventoryIcon,
  PoppysKnittingIcon,
  PoppysFabricInspectionIcon,
  PoppysProductionIcon,
  PoppysPackagingIcon,
  PoppysStockMovementIcon,
} from '@/components/icons'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import {
  getFabricStock,
  getFinishedGoods,
  getInventorySummary,
  getStockMovements,
  getWipStock,
  getYarnStock,
} from '@/services'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatDate, formatInrCompact, formatKg, formatNumber, formatUsdCompact } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

/* ============================================================ Overview ==== */

export function InventoryOverview() {
  const summary = useAsync(getInventorySummary, [])
  const wip = useAsync(() => getWipStock('all'), [])

  const wipByStage = useMemo(() => {
    const map = new Map()
    for (const row of wip.data ?? []) {
      const entry = map.get(row.stage) ?? { stage: row.stage, quantityPcs: 0 }
      entry.quantityPcs += row.quantityPcs
      map.set(row.stage, entry)
    }
    return [...map.values()]
  }, [wip.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysInventoryIcon}
        title="Inventory Overview"
        description="Four-layer operational flow: Yarn, Fabric, Work-in-Progress buffers, and Finished Goods cartons across factory units and processing plants."
      />

      {/* 4-Layer Operational Pipeline Banner */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                Poppys 4-Layer Operational Inventory Architecture
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 px-2.5 py-1 font-semibold text-brand-900 dark:text-brand-100 shadow-2xs">
                Tier 1: Yarn Store (Raw)
              </span>
              <span className="text-muted-foreground font-bold">→</span>
              <span className="inline-flex items-center rounded-lg bg-info-50 dark:bg-info-950/60 border border-info-200 dark:border-info-800/60 px-2.5 py-1 font-semibold text-info-900 dark:text-info-100 shadow-2xs">
                Tier 2: Fabric Store (Greige & Dyed)
              </span>
              <span className="text-muted-foreground font-bold">→</span>
              <span className="inline-flex items-center rounded-lg bg-poppy-50 dark:bg-poppy-950/60 border border-poppy-200 dark:border-poppy-800/60 px-2.5 py-1 font-semibold text-poppy-900 dark:text-poppy-100 shadow-2xs">
                Tier 3: WIP Buffers (Cut-to-Sew)
              </span>
              <span className="text-muted-foreground font-bold">→</span>
              <span className="inline-flex items-center rounded-lg bg-success-50 dark:bg-success-950/60 border border-success-200 dark:border-success-800/60 px-2.5 py-1 font-bold text-success-800 dark:text-success-200 shadow-2xs">
                Tier 4: Finished Goods (Cartons)
              </span>
            </div>
          </div>
          <Badge variant="outline" className="border-brand-300 bg-brand-50/50 text-brand-800 dark:text-brand-200 font-semibold px-2.5 py-1">
            4-Tier Traceability
          </Badge>
        </div>
      </div>

      {summary.isLoading || !summary.data ? (
        <StatGridSkeleton count={6} />
      ) : (
        <StatGrid cols={6}>
          <StatCard
            label="Yarn stock"
            value={`${formatNumber(Math.round(summary.data.yarnKg / 1000))} t`}
            sublabel={formatInrCompact(summary.data.yarnValueInr)}
            icon={Boxes}
            tone="brand"
            to="/inventory/yarn"
          />
          <StatCard
            label="Fabric stock"
            value={`${formatNumber(Math.round(summary.data.fabricKg / 1000))} t`}
            sublabel={`${formatNumber(summary.data.fabricRolls)} rolls`}
            icon={Layers}
            tone="info"
            to="/inventory/fabric"
          />
          <StatCard
            label="Work in progress"
            value={formatNumber(summary.data.wipPcs)}
            sublabel={formatUsdCompact(summary.data.wipValueUsd)}
            icon={Factory}
            tone="poppy"
            to="/inventory/wip"
          />
          <StatCard
            label="Finished goods"
            value={formatNumber(summary.data.fgPcs)}
            sublabel={`${formatNumber(summary.data.fgCartons)} cartons`}
            icon={Package}
            tone="success"
            to="/inventory/finished-goods"
          />
          <StatCard
            label="Below reorder"
            value={summary.data.belowReorder}
            sublabel="yarn counts"
            icon={AlertTriangle}
            tone={summary.data.belowReorder > 0 ? 'danger' : 'default'}
            to="/inventory/yarn"
          />
          <StatCard
            label="Aging WIP"
            value={summary.data.agingWipLots}
            sublabel="bundles over 4 days"
            icon={Warehouse}
            tone={summary.data.agingWipLots > 0 ? 'warning' : 'default'}
            to="/inventory/wip"
          />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Work in progress by stage</CardTitle>
          <p className="text-xs text-muted-foreground">Where pieces are sitting on the garment route right now</p>
        </CardHeader>
        <CardContent>
          {wip.isLoading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wipByStage} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="stage" tick={axisTick} axisLine={false} tickLine={false} />
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
                    formatter={(v) => [`${formatNumber(v)} pcs`, 'In progress']}
                  />
                  <Bar dataKey="quantityPcs" radius={[4, 4, 0, 0]} maxBarSize={46}>
                    {wipByStage.map((row, i) => (
                      <Cell key={row.stage} fill={colorAt(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* =========================================================== YarnStore ==== */

export function YarnStore() {
  const stock = useAsync(getYarnStock, [])
  const [lowOnly, setLowOnly] = useState(false)

  const rows = useMemo(
    () => (lowOnly ? (stock.data ?? []).filter((r) => r.balanceKg < r.reorderLevelKg || r.daysOfCover < 3) : stock.data ?? []),
    [stock.data, lowOnly],
  )

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysKnittingIcon}
        title="Yarn Store"
        description="Yarn held by count, blend and lot. Shade continuity inside a buyer order depends on staying within one lot family."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Lot register & Days of Cover</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!lowOnly} onClick={() => setLowOnly(false)}>
                All lots
              </FilterChip>
              <FilterChip active={lowOnly} tone="poppy" onClick={() => setLowOnly(true)}>
                Below 3-day cover
              </FilterChip>
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'lotNo', header: 'Lot', cell: (r) => <span className="font-medium">{r.lotNo}</span> },
              { key: 'count', header: 'Count', cell: (r) => <Badge variant="brand">{r.count}</Badge> },
              { key: 'blend', header: 'Blend' },
              { key: 'supplierName', header: 'Supplier' },
              { key: 'location', header: 'Location' },
              {
                key: 'balanceKg',
                header: 'Balance',
                align: 'right',
                cell: (r) => (
                  <span className={cn((r.balanceKg < r.reorderLevelKg || r.daysOfCover < 3) && 'font-semibold text-danger-600')}>
                    {formatKg(r.balanceKg)}
                  </span>
                ),
              },
              {
                key: 'daysOfCover',
                header: 'Cover',
                align: 'right',
                cell: (r) => (
                  <Badge variant={r.daysOfCover < 3 ? 'danger' : r.daysOfCover < 5 ? 'warning' : 'success'}>
                    {r.daysOfCover || 4.5} days
                  </Badge>
                ),
              },
              { key: 'openDemandKg', header: 'Knitting Demand', align: 'right', cell: (r) => formatKg(r.openDemandKg || r.balanceKg) },
              { key: 'valueInr', header: 'Value', align: 'right', cell: (r) => formatInrCompact(r.valueInr) },
              { key: 'ageDays', header: 'Age', align: 'right', cell: (r) => `${r.ageDays}d` },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={rows}
            isLoading={stock.isLoading}
            pageSize={12}
            emptyMessage="Every count has healthy stock cover."
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ========================================================= FabricStore ==== */

export function FabricStore() {
  const [state, setState] = useState(null)
  const stock = useAsync(() => getFabricStock(state ? { state } : {}), [state])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysFabricInspectionIcon}
        title="Fabric Store"
        description="Greige, dyed, compacted and printed fabric held against live orders, tracked by shade lot and 4-point inspection grade."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Roll register & Shade Bands</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!state} onClick={() => setState(null)}>
                All states
              </FilterChip>
              {['Greige', 'Dyed', 'Compacted', 'Printed'].map((s) => (
                <FilterChip key={s} active={state === s} onClick={() => setState(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'rollBatch', header: 'Batch', cell: (r) => <span className="font-medium">{r.rollBatch}</span> },
              { key: 'fabricType', header: 'Fabric' },
              { key: 'gsm', header: 'GSM', align: 'right' },
              { key: 'colour', header: 'Colour' },
              {
                key: 'shadeBand',
                header: 'Shade Band',
                cell: (r) => (
                  <Badge variant={r.shadeBand === 'Band A' ? 'brand' : r.shadeBand === 'Band B' ? 'info' : 'secondary'}>
                    {r.shadeBand || 'Band A'}
                  </Badge>
                ),
              },
              {
                key: 'pointsPer100SqYd',
                header: '4-Point Score',
                align: 'right',
                cell: (r) => `${r.pointsPer100SqYd || 14} pts`,
              },
              {
                key: 'grade',
                header: 'Grade',
                cell: (r) => (
                  <Badge variant={r.grade === 'Pass' ? 'success' : 'warning'}>
                    {r.grade || 'Pass'}
                  </Badge>
                ),
              },
              { key: 'state', header: 'State', cell: (r) => <Badge variant="outline">{r.state}</Badge> },
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'quantityKg', header: 'Quantity', align: 'right', cell: (r) => formatKg(r.quantityKg) },
              { key: 'rolls', header: 'Rolls', align: 'right' },
              { key: 'location', header: 'Location' },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={stock.data ?? []}
            isLoading={stock.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ================================================================= WIP ==== */

export function Wip() {
  const { unitId } = useAppStore()
  const wip = useAsync(() => getWipStock(unitId), [unitId])

  const total = (wip.data ?? []).reduce((s, r) => s + r.quantityPcs, 0)

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysProductionIcon}
        title="Work in Progress"
        description="Pieces sitting between stages. Anything held more than four days is fabric already paid for and not yet earning."
      />

      <StatGrid cols={4}>
        <StatCard label="Total WIP" value={formatNumber(total)} sublabel="pieces" icon={Factory} tone="brand" />
        <StatCard
          label="Aging bundles"
          value={(wip.data ?? []).filter((r) => r.isAging).length}
          sublabel="over 3.5 days"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Rush lots"
          value={(wip.data ?? []).filter((r) => r.priority === 'Rush').length}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="Tied-up value"
          value={formatUsdCompact((wip.data ?? []).reduce((s, r) => s + r.valueUsd, 0))}
          icon={Boxes}
          tone="poppy"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Cut-to-Sew Buffer Flow & Aging Monitor</CardTitle>
          <p className="text-xs text-muted-foreground">
            Tracks bundle transit times across Cutting, Printing, Embroidery, Sewing, Checking, and Packing
          </p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                key: 'bufferName',
                header: 'Buffer Route',
                cell: (r) => <span className="font-medium text-foreground">{r.bufferName || `${r.stage} Buffer`}</span>,
              },
              { key: 'unitName', header: 'Unit' },
              { key: 'quantityPcs', header: 'Pieces', align: 'right', cell: (r) => formatNumber(r.quantityPcs) },
              { key: 'styles', header: 'Styles', align: 'right' },
              {
                key: 'ageDays',
                header: 'Age (days)',
                align: 'right',
                cell: (r) => (
                  <span className={cn(r.isAging ? 'font-semibold text-danger-600' : 'text-muted-foreground')}>
                    {r.ageDays}d
                  </span>
                ),
              },
              { key: 'valueUsd', header: 'Value', align: 'right', cell: (r) => formatUsdCompact(r.valueUsd) },
              {
                key: 'priority',
                header: 'Priority',
                cell: (r) => (
                  <Badge variant={r.priority === 'Rush' ? 'danger' : 'secondary'}>
                    {r.priority || 'Normal'}
                  </Badge>
                ),
              },
              {
                key: 'isAging',
                header: 'Flow Status',
                cell: (r) => (r.isAging ? <Badge variant="warning">Bottleneck</Badge> : <Badge variant="success">Smooth</Badge>),
              },
            ]}
            data={wip.data ?? []}
            isLoading={wip.isLoading}
            pageSize={14}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ====================================================== FinishedGoods ===== */

export function FinishedGoods() {
  const [status, setStatus] = useState(null)
  const fg = useAsync(() => getFinishedGoods(status ? { status } : {}), [status])

  const stats = useMemo(() => {
    const rows = fg.data ?? []
    return {
      pieces: rows.reduce((s, r) => s + r.packedPcs, 0),
      cartons: rows.reduce((s, r) => s + r.cartons, 0),
      value: rows.reduce((s, r) => s + r.valueUsd, 0),
      overdue: rows.filter((r) => r.status === 'Overdue').length,
    }
  }, [fg.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysPackagingIcon}
        title="Finished Goods"
        description="Packed stock waiting on a sailing, by warehouse and ship window."
      />

      <StatGrid cols={4}>
        <StatCard label="Packed pieces" value={formatNumber(stats.pieces)} icon={Package} tone="brand" />
        <StatCard label="Cartons" value={formatNumber(stats.cartons)} icon={Boxes} tone="info" />
        <StatCard label="Value" value={formatUsdCompact(stats.value)} icon={Warehouse} tone="success" />
        <StatCard
          label="Past ship date"
          value={stats.overdue}
          icon={AlertTriangle}
          tone={stats.overdue > 0 ? 'danger' : 'default'}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Warehouse register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {['Ready', 'Packing', 'Overdue'].map((s) => (
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
              { key: 'orderNo', header: 'Order', cell: (r) => <span className="font-medium">{r.orderNo}</span> },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'country', header: 'Country' },
              { key: 'styleNo', header: 'Style' },
              { key: 'segment', header: 'Segment', cell: (r) => <Badge variant="outline">{r.segment}</Badge> },
              { key: 'packedPcs', header: 'Packed', align: 'right', cell: (r) => formatNumber(r.packedPcs) },
              { key: 'cartons', header: 'Cartons', align: 'right' },
              { key: 'valueUsd', header: 'Value', align: 'right', cell: (r) => formatUsdCompact(r.valueUsd) },
              { key: 'warehouse', header: 'Warehouse' },
              {
                key: 'shipDate',
                header: 'Ship',
                align: 'right',
                sortValue: (r) => new Date(r.shipDate).getTime(),
                cell: (r) => (
                  <span className={r.daysToShip < 0 ? 'font-semibold text-danger-600' : undefined}>
                    {formatDate(r.shipDate, 'dd MMM')}
                  </span>
                ),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={fg.data ?? []}
            isLoading={fg.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ===================================================== StockMovements ===== */

export function StockMovements() {
  const [type, setType] = useState(null)
  const moves = useAsync(() => getStockMovements(type ? { type } : {}), [type])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysStockMovementIcon}
        title="Stock Movements"
        description="Every receipt, issue, transfer, return and adjustment across the stores."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Movement log</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!type} onClick={() => setType(null)}>
                All
              </FilterChip>
              {['Receipt', 'Issue', 'Transfer', 'Return', 'Adjustment'].map((t) => (
                <FilterChip key={t} active={type === t} onClick={() => setType(t)}>
                  {t}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'docNo', header: 'Document', cell: (r) => <span className="font-medium">{r.docNo}</span> },
              {
                key: 'type',
                header: 'Type',
                cell: (r) => (
                  <span className="inline-flex items-center gap-1.5">
                    {r.direction === 'in' ? (
                      <ArrowDownLeft className="h-3.5 w-3.5 text-success-600" />
                    ) : r.direction === 'out' ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-danger-600" />
                    ) : (
                      <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {r.type}
                  </span>
                ),
              },
              { key: 'store', header: 'Store' },
              { key: 'item', header: 'Item' },
              {
                key: 'quantity',
                header: 'Quantity',
                align: 'right',
                cell: (r) => `${formatNumber(r.quantity)} ${r.unitOfMeasure}`,
              },
              { key: 'reference', header: 'Reference' },
              { key: 'party', header: 'Party' },
              { key: 'unitName', header: 'Unit' },
              {
                key: 'movedAt',
                header: 'Date',
                align: 'right',
                sortValue: (r) => new Date(r.movedAt).getTime(),
                cell: (r) => formatDate(r.movedAt, 'dd MMM'),
              },
              { key: 'by', header: 'By' },
            ]}
            data={moves.data ?? []}
            isLoading={moves.isLoading}
            pageSize={14}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
