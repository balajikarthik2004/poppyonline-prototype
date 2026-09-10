import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Globe, Package, Ship, Timer, TrendingUp, Users } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import { getBuyers, getExportOrders, getExportSummary, getShipments } from '@/services'
import { segments } from '@/mock/styles'
import { buyerRegions } from '@/mock/buyers'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, MiniBar, RiskBadge, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { Am5DonutChart } from '@/components/charts/Am5DonutChart'
import { formatDate, formatNumber, formatPct, formatUsd, formatUsdCompact } from '@/lib/format'
import { chartItemStyle, chartLabelStyle, chartTooltipStyle, colorAt } from '@/lib/chartColors'

/* ============================================================== Buyers ==== */

export function Buyers() {
  const [region, setRegion] = useState(null)
  const buyers = useAsync(() => getBuyers(region ? { region } : {}), [region])
  const summary = useAsync(getExportSummary, [])

  const columns = [
    {
      key: 'name',
      header: 'Buyer',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{row.name}</span>
          {row.tier === 'Key' && <Badge variant="poppy">Key</Badge>}
        </div>
      ),
    },
    { key: 'country', header: 'Country' },
    { key: 'region', header: 'Region', cell: (row) => <Badge variant="outline">{row.region}</Badge> },
    { key: 'since', header: 'Since', align: 'right' },
    { key: 'activeStyles', header: 'Styles', align: 'right' },
    {
      key: 'annualPieces',
      header: 'Annual Pcs',
      align: 'right',
      cell: (row) => formatNumber(row.annualPieces),
    },
    {
      key: 'annualValueUsd',
      header: 'Annual Value',
      align: 'right',
      cell: (row) => formatUsdCompact(row.annualValueUsd),
    },
    { key: 'aqlLevel', header: 'AQL', cell: (row) => <Badge variant="info">{row.aqlLevel}</Badge> },
    {
      key: 'onTimePct',
      header: 'On-Time',
      align: 'right',
      cell: (row) => <MiniBar value={row.onTimePct} tone={row.onTimePct > 95 ? 'success' : 'warning'} />,
    },
    { key: 'merchandiser', header: 'Merchandiser' },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Buyers"
        description="The export customer book. Marks & Spencer, Next, Tesco, Waitrose, Mothercare, Debenhams and John Lewis are the anchor accounts."
      />

      {summary.isLoading || !summary.data ? (
        <StatGridSkeleton count={4} />
      ) : (
        <StatGrid cols={4}>
          <StatCard label="Active buyers" value={summary.data.activeBuyers} icon={Users} tone="brand" />
          <StatCard label="Countries shipped" value={summary.data.activeCountries} icon={Globe} tone="info" />
          <StatCard
            label="Order book value"
            value={formatUsdCompact(summary.data.totalValueUsd)}
            sublabel="FOB, live orders"
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            label="Pieces on order"
            value={formatNumber(summary.data.totalPieces)}
            icon={Package}
            tone="poppy"
          />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Buyer register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!region} onClick={() => setRegion(null)}>
                All regions
              </FilterChip>
              {buyerRegions.map((r) => (
                <FilterChip key={r} active={region === r} onClick={() => setRegion(r)}>
                  {r}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={buyers.data ?? []} isLoading={buyers.isLoading} pageSize={12} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ======================================================== ExportOrders ==== */

const riskFilters = [
  { value: null, label: 'All orders' },
  { value: 'onSchedule', label: 'On schedule' },
  { value: 'atRisk', label: 'At risk' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'completed', label: 'Shipped' },
  { value: 'high', label: 'At risk + delayed' },
]

export function ExportOrders() {
  const [params, setParams] = useSearchParams()
  const { unitId } = useAppStore()
  const risk = params.get('risk')

  const orders = useAsync(() => getExportOrders({ risk, unitId }), [risk, unitId])

  const stats = useMemo(() => {
    const rows = orders.data ?? []
    return {
      count: rows.length,
      pieces: rows.reduce((s, o) => s + o.quantityPcs, 0),
      value: rows.reduce((s, o) => s + o.valueUsd, 0),
      avgCompletion: rows.length ? rows.reduce((s, o) => s + o.completionPct, 0) / rows.length : 0,
    }
  }, [orders.data])

  const columns = [
    {
      key: 'orderNo',
      header: 'Order',
      cell: (row) => <span className="font-medium text-foreground">{row.orderNo}</span>,
    },
    { key: 'buyerName', header: 'Buyer' },
    { key: 'country', header: 'Country' },
    { key: 'styleNo', header: 'Style' },
    { key: 'segment', header: 'Segment', cell: (row) => <Badge variant="outline">{row.segment}</Badge> },
    { key: 'unitName', header: 'Unit' },
    { key: 'quantityPcs', header: 'Qty', align: 'right', cell: (row) => formatNumber(row.quantityPcs) },
    { key: 'valueUsd', header: 'Value', align: 'right', cell: (row) => formatUsdCompact(row.valueUsd) },
    { key: 'currentStageLabel', header: 'Stage' },
    {
      key: 'completionPct',
      header: 'Progress',
      align: 'right',
      cell: (row) => (
        <MiniBar
          value={row.completionPct}
          tone={row.risk === 'delayed' ? 'danger' : row.risk === 'atRisk' ? 'warning' : 'brand'}
        />
      ),
    },
    {
      key: 'shipDate',
      header: 'Ship',
      align: 'right',
      sortValue: (row) => new Date(row.shipDate).getTime(),
      cell: (row) => (
        <span className={row.daysToShip < 0 ? 'font-semibold text-danger-600' : undefined}>
          {formatDate(row.shipDate, 'dd MMM')}
        </span>
      ),
    },
    { key: 'risk', header: 'Status', cell: (row) => <RiskBadge risk={row.risk} /> },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Export Orders"
        description="Every live order with its position on the production route and its ship window."
      />

      <StatGrid cols={4}>
        <StatCard label="Orders" value={formatNumber(stats.count)} icon={Ship} tone="brand" />
        <StatCard label="Pieces" value={formatNumber(stats.pieces)} icon={Package} tone="info" />
        <StatCard label="FOB value" value={formatUsdCompact(stats.value)} icon={TrendingUp} tone="success" />
        <StatCard
          label="Avg completion"
          value={formatPct(stats.avgCompletion)}
          icon={Timer}
          tone="poppy"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Order book</CardTitle>
            <FilterChipGroup>
              {riskFilters.map((f) => (
                <FilterChip
                  key={f.label}
                  active={risk === f.value || (!risk && !f.value)}
                  tone={f.value === 'delayed' ? 'poppy' : 'brand'}
                  onClick={() => {
                    if (f.value) setParams({ risk: f.value })
                    else setParams({})
                  }}
                >
                  {f.label}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders.data ?? []}
            isLoading={orders.isLoading}
            pageSize={14}
            emptyMessage="No orders match this filter."
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* =========================================================== OrderBook ==== */

export function OrderBook() {
  const [params, setParams] = useSearchParams()
  const segment = params.get('segment')
  const orders = useAsync(() => getExportOrders(segment ? { segment } : {}), [segment])
  const summary = useAsync(getExportSummary, [])

  const regionSlices = useMemo(
    () => (summary.data?.byRegion ?? []).map((r) => ({ name: r.region, value: r.valueUsd })),
    [summary.data],
  )

  const bySeason = useMemo(() => {
    const map = new Map()
    for (const order of orders.data ?? []) {
      const entry = map.get(order.season) ?? { season: order.season, pieces: 0, value: 0, orders: 0 }
      entry.pieces += order.quantityPcs
      entry.value += order.valueUsd
      entry.orders += 1
      map.set(order.season, entry)
    }
    return [...map.values()].sort((a, b) => a.season.localeCompare(b.season))
  }, [orders.data])

  return (
    <PageContainer>
      <PageHeader
        title="Order Book"
        description="The commercial view of the same orders: value by region, by season and by product segment."
      />

      {summary.isLoading || !summary.data ? (
        <StatGridSkeleton count={4} />
      ) : (
        <StatGrid cols={4}>
          <StatCard label="Live orders" value={summary.data.orderCount} icon={Ship} tone="brand" />
          <StatCard
            label="Total FOB"
            value={formatUsdCompact(summary.data.totalValueUsd)}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard label="Pieces" value={formatNumber(summary.data.totalPieces)} icon={Package} tone="info" />
          <StatCard label="Countries" value={summary.data.activeCountries} icon={Globe} tone="poppy" />
        </StatGrid>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Value by region</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <Am5DonutChart
                data={regionSlices}
                height={260}
                innerRadius={55}
                showLegend={true}
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>By season</CardTitle>
            <p className="text-xs text-muted-foreground">Booked volume across the seasons currently in hand</p>
          </CardHeader>
          <CardContent>
            {orders.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="space-y-3">
                {bySeason.map((row) => {
                  const max = Math.max(...bySeason.map((r) => r.pieces))
                  return (
                    <div key={row.season}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{row.season}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {row.orders} orders - {formatNumber(row.pieces)} pcs - {formatUsdCompact(row.value)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-brand-500 to-poppy-500"
                          style={{ width: `${(row.pieces / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Orders by segment</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!segment} onClick={() => setParams({})}>
                All segments
              </FilterChip>
              {segments.map((s) => (
                <FilterChip key={s} active={segment === s} onClick={() => setParams({ segment: s })}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'styleNo', header: 'Style' },
              { key: 'styleName', header: 'Description' },
              { key: 'season', header: 'Season', cell: (r) => <Badge variant="outline">{r.season}</Badge> },
              { key: 'quantityPcs', header: 'Qty', align: 'right', cell: (r) => formatNumber(r.quantityPcs) },
              { key: 'fobUsd', header: 'FOB', align: 'right', cell: (r) => formatUsd(r.fobUsd) },
              { key: 'valueUsd', header: 'Value', align: 'right', cell: (r) => formatUsdCompact(r.valueUsd) },
              {
                key: 'shipDate',
                header: 'Ship',
                align: 'right',
                sortValue: (r) => new Date(r.shipDate).getTime(),
                cell: (r) => formatDate(r.shipDate, 'dd MMM yy'),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
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

/* =========================================================== Shipments ==== */

export function Shipments() {
  const [status, setStatus] = useState(null)
  const shipments = useAsync(() => getShipments(status ? { status } : {}), [status])

  const stats = useMemo(() => {
    const rows = shipments.data ?? []
    return {
      count: rows.length,
      cartons: rows.reduce((s, r) => s + r.cartons, 0),
      pieces: rows.reduce((s, r) => s + r.quantityPcs, 0),
      value: rows.reduce((s, r) => s + r.valueUsd, 0),
      docsPending: rows.filter((r) => !r.docsComplete).length,
    }
  }, [shipments.data])

  const statuses = ['Planned', 'Stuffed', 'Gated In', 'Sailed', 'In Transit', 'Delivered']

  return (
    <PageContainer>
      <PageHeader
        title="Shipments"
        description="Container bookings out of Tuticorin, Chennai, Cochin and Nhava Sheva, with export documentation status."
      />

      <StatGrid cols={5}>
        <StatCard label="Shipments" value={stats.count} icon={Ship} tone="brand" />
        <StatCard label="Cartons" value={formatNumber(stats.cartons)} icon={Package} tone="info" />
        <StatCard label="Pieces" value={formatNumber(stats.pieces)} icon={Package} tone="poppy" />
        <StatCard label="Invoice value" value={formatUsdCompact(stats.value)} icon={TrendingUp} tone="success" />
        <StatCard
          label="Docs pending"
          value={stats.docsPending}
          sublabel="Invoice or packing list"
          icon={Timer}
          tone={stats.docsPending > 0 ? 'danger' : 'default'}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Container register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {statuses.map((s) => (
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
              { key: 'invoiceNo', header: 'Invoice', cell: (r) => <span className="font-medium">{r.invoiceNo}</span> },
              { key: 'orderNo', header: 'Order' },
              { key: 'buyerName', header: 'Buyer' },
              { key: 'country', header: 'Country' },
              { key: 'containerNo', header: 'Container' },
              { key: 'containerType', header: 'Type', cell: (r) => <Badge variant="outline">{r.containerType}</Badge> },
              { key: 'port', header: 'Port' },
              { key: 'line', header: 'Line' },
              { key: 'cartons', header: 'Cartons', align: 'right', cell: (r) => formatNumber(r.cartons) },
              { key: 'valueUsd', header: 'Value', align: 'right', cell: (r) => formatUsdCompact(r.valueUsd) },
              {
                key: 'sailDate',
                header: 'Sails',
                align: 'right',
                sortValue: (r) => new Date(r.sailDate).getTime(),
                cell: (r) => formatDate(r.sailDate, 'dd MMM'),
              },
              {
                key: 'docsComplete',
                header: 'Docs',
                cell: (r) =>
                  r.docsComplete ? (
                    <Badge variant="success">Complete</Badge>
                  ) : (
                    <Badge variant="danger">Pending</Badge>
                  ),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={shipments.data ?? []}
            isLoading={shipments.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Documentation gaps block gate-in at the port.{' '}
        <Link to="/sales/export-orders?risk=delayed" className="font-medium text-primary hover:underline">
          Review delayed orders
        </Link>{' '}
        before committing a sailing.
      </div>
    </PageContainer>
  )
}
