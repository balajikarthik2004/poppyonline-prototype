import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ClipboardCheck, FileText, Package, ShoppingCart, Star, TriangleAlert, Truck } from 'lucide-react'
import {
  PoppysProcurementIcon,
  PoppysSuppliersIcon,
  PoppysPurchaseRequisitionIcon,
  PoppysPurchaseOrderIcon,
  PoppysGrnIcon,
} from '@/components/icons'

import { useAsync } from '@/hooks/useAsync'
import {
  getGoodsReceipts,
  getProcurementSummary,
  getPurchaseOrders,
  getPurchaseRequisitions,
  getSuppliers,
} from '@/services'
import { supplierCategories } from '@/mock/suppliers'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, MiniBar, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatDate, formatInrCompact, formatNumber, formatPct } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt } from '@/lib/chartColors'

/* ============================================================ Overview ==== */

export function ProcurementOverview() {
  const summary = useAsync(getProcurementSummary, [])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysProcurementIcon}
        title="Procurement Overview"
        description="Yarn, dyes and chemicals, trims, packaging and job work bought against the confirmed order book."
      />

      {summary.isLoading || !summary.data ? (
        <StatGridSkeleton count={6} />
      ) : (
        <StatGrid cols={6}>
          <StatCard label="Open POs" value={summary.data.openPoCount} icon={ShoppingCart} tone="brand" to="/procurement/po" />
          <StatCard
            label="Open PO value"
            value={formatInrCompact(summary.data.openPoValueInr)}
            icon={FileText}
            tone="info"
            to="/procurement/po"
          />
          <StatCard
            label="Overdue POs"
            value={summary.data.overduePoCount}
            sublabel="past delivery date"
            icon={TriangleAlert}
            tone={summary.data.overduePoCount > 0 ? 'danger' : 'success'}
            to="/procurement/po"
          />
          <StatCard
            label="Pending PRs"
            value={summary.data.pendingPrCount}
            sublabel="awaiting approval"
            icon={ClipboardCheck}
            tone="warning"
            to="/procurement/pr"
          />
          <StatCard label="GRNs posted" value={summary.data.grnThisMonth} icon={Truck} tone="poppy" to="/procurement/grn" />
          <StatCard
            label="Vendor rating"
            value={summary.data.avgSupplierRating}
            sublabel={`${summary.data.activeSuppliers} approved`}
            icon={Star}
            tone="success"
            to="/procurement/suppliers"
          />
        </StatGrid>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Spend by category</CardTitle>
          <p className="text-xs text-muted-foreground">Purchase order value across the buying categories</p>
        </CardHeader>
        <CardContent>
          {summary.isLoading || !summary.data ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={summary.data.byCategory}
                  margin={{ top: 4, right: 24, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatInrCompact(v)}
                  />
                  <YAxis type="category" dataKey="category" width={128} tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    contentStyle={chartTooltipStyle}
                    formatter={(v) => [formatInrCompact(v), 'PO value']}
                  />
                  <Bar dataKey="valueInr" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {summary.data.byCategory.map((row, i) => (
                      <Cell key={row.category} fill={colorAt(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/procurement/suppliers', label: 'Suppliers', desc: 'Approved vendor list and scorecard', icon: Star },
          { to: '/procurement/pr', label: 'Purchase Requisitions', desc: 'Raised against confirmed orders', icon: ClipboardCheck },
          { to: '/procurement/po', label: 'Purchase Orders', desc: 'Placed, part-received and closed', icon: ShoppingCart },
          { to: '/procurement/grn', label: 'GRN', desc: 'Goods receipt at the gate', icon: Package },
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="hover-lift h-full p-4">
              <item.icon className="h-5 w-5 text-brand-500" />
              <div className="mt-2 text-sm font-semibold text-foreground">{item.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{item.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}

/* =========================================================== Suppliers ==== */

export function Suppliers() {
  const [category, setCategory] = useState(null)
  const suppliers = useAsync(() => getSuppliers(category ? { category } : {}), [category])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysSuppliersIcon}
        title="Suppliers"
        description="The approved vendor list across the Tirupur and Coimbatore supply belt, rated on delivery and quality."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Vendor scorecard</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!category} onClick={() => setCategory(null)}>
                All categories
              </FilterChip>
              {supplierCategories.map((c) => (
                <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'code', header: 'Code' },
              { key: 'name', header: 'Supplier', cell: (r) => <span className="font-medium">{r.name}</span> },
              { key: 'category', header: 'Category', cell: (r) => <Badge variant="outline">{r.category}</Badge> },
              { key: 'city', header: 'City' },
              { key: 'leadTimeDays', header: 'Lead days', align: 'right' },
              { key: 'paymentTerms', header: 'Terms' },
              { key: 'onTimePct', header: 'On-time', align: 'right', cell: (r) => <MiniBar value={r.onTimePct} tone={r.onTimePct > 92 ? 'success' : 'warning'} /> },
              { key: 'qualityPct', header: 'Quality', align: 'right', cell: (r) => formatPct(r.qualityPct) },
              { key: 'rating', header: 'Rating', align: 'right', cell: (r) => <span className="font-semibold">{r.rating}</span> },
              { key: 'ytdSpendInr', header: 'YTD spend', align: 'right', cell: (r) => formatInrCompact(r.ytdSpendInr) },
              {
                key: 'oekoTex',
                header: 'Oeko-Tex',
                cell: (r) => (r.oekoTex ? <Badge variant="success">Certified</Badge> : <Badge variant="secondary">-</Badge>),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={suppliers.data ?? []}
            isLoading={suppliers.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* =============================================== PurchaseRequisitions ===== */

export function PurchaseRequisitions() {
  const [status, setStatus] = useState(null)
  const prs = useAsync(() => getPurchaseRequisitions(status ? { status } : {}), [status])

  const stats = useMemo(() => {
    const rows = prs.data ?? []
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === 'Pending Approval').length,
      urgent: rows.filter((r) => r.priority !== 'Normal').length,
      value: rows.reduce((s, r) => s + r.estimatedValueInr, 0),
    }
  }, [prs.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysPurchaseRequisitionIcon}
        title="Purchase Requisitions"
        description="Requirements raised by merchandising, stores and the dye house."
      />

      <StatGrid cols={4}>
        <StatCard label="Requisitions" value={stats.total} icon={ClipboardCheck} tone="brand" />
        <StatCard label="Pending approval" value={stats.pending} icon={FileText} tone="warning" />
        <StatCard label="Urgent or critical" value={stats.urgent} icon={TriangleAlert} tone={stats.urgent > 0 ? 'danger' : 'default'} />
        <StatCard label="Estimated value" value={formatInrCompact(stats.value)} icon={ShoppingCart} tone="info" />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Requisition register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All
              </FilterChip>
              {['Pending Approval', 'Approved', 'Converted', 'Rejected'].map((s) => (
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
              { key: 'prNo', header: 'PR', cell: (r) => <span className="font-medium">{r.prNo}</span> },
              { key: 'category', header: 'Category', cell: (r) => <Badge variant="outline">{r.category}</Badge> },
              { key: 'item', header: 'Item' },
              {
                key: 'quantity',
                header: 'Qty',
                align: 'right',
                cell: (r) => `${formatNumber(r.quantity)} ${r.unitOfMeasure}`,
              },
              { key: 'estimatedValueInr', header: 'Est. value', align: 'right', cell: (r) => formatInrCompact(r.estimatedValueInr) },
              { key: 'againstOrder', header: 'Against order' },
              { key: 'raisedBy', header: 'Raised by' },
              {
                key: 'requiredBy',
                header: 'Required',
                align: 'right',
                sortValue: (r) => new Date(r.requiredBy).getTime(),
                cell: (r) => formatDate(r.requiredBy, 'dd MMM'),
              },
              {
                key: 'priority',
                header: 'Priority',
                cell: (r) => (
                  <Badge variant={r.priority === 'Critical' ? 'danger' : r.priority === 'Urgent' ? 'warning' : 'secondary'}>
                    {r.priority}
                  </Badge>
                ),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={prs.data ?? []}
            isLoading={prs.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ====================================================== PurchaseOrders ==== */

export function PurchaseOrders() {
  const [filter, setFilter] = useState(null)
  const pos = useAsync(
    () => getPurchaseOrders(filter === 'overdue' ? { overdue: true } : filter ? { status: filter } : {}),
    [filter],
  )

  const stats = useMemo(() => {
    const rows = pos.data ?? []
    return {
      total: rows.length,
      value: rows.reduce((s, r) => s + r.valueInr, 0),
      overdue: rows.filter((r) => r.isOverdue).length,
      pending: rows.reduce((s, r) => s + r.pendingQty, 0),
    }
  }, [pos.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysPurchaseOrderIcon}
        title="Purchase Orders"
        description="Orders placed on the approved vendor list, tracked to receipt."
      />

      <StatGrid cols={4}>
        <StatCard label="Purchase orders" value={stats.total} icon={ShoppingCart} tone="brand" />
        <StatCard label="Order value" value={formatInrCompact(stats.value)} icon={FileText} tone="info" />
        <StatCard label="Overdue" value={stats.overdue} icon={TriangleAlert} tone={stats.overdue > 0 ? 'danger' : 'success'} />
        <StatCard label="Pending quantity" value={formatNumber(stats.pending)} icon={Package} tone="poppy" />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Order register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!filter} onClick={() => setFilter(null)}>
                All
              </FilterChip>
              {['Open', 'Partially Received', 'Received', 'Closed'].map((s) => (
                <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
                  {s}
                </FilterChip>
              ))}
              <FilterChip active={filter === 'overdue'} tone="poppy" onClick={() => setFilter('overdue')}>
                Overdue
              </FilterChip>
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'poNo', header: 'PO', cell: (r) => <span className="font-medium">{r.poNo}</span> },
              { key: 'supplierName', header: 'Supplier' },
              { key: 'category', header: 'Category', cell: (r) => <Badge variant="outline">{r.category}</Badge> },
              { key: 'item', header: 'Item' },
              { key: 'quantity', header: 'Qty', align: 'right', cell: (r) => `${formatNumber(r.quantity)} ${r.unitOfMeasure}` },
              { key: 'receivedQty', header: 'Received', align: 'right', cell: (r) => formatNumber(r.receivedQty) },
              { key: 'valueInr', header: 'Value', align: 'right', cell: (r) => formatInrCompact(r.valueInr) },
              {
                key: 'deliveryDate',
                header: 'Delivery',
                align: 'right',
                sortValue: (r) => new Date(r.deliveryDate).getTime(),
                cell: (r) => (
                  <span className={r.isOverdue ? 'font-semibold text-danger-600' : undefined}>
                    {formatDate(r.deliveryDate, 'dd MMM')}
                  </span>
                ),
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={pos.data ?? []}
            isLoading={pos.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ================================================================= GRN ==== */

export function Grn() {
  const grns = useAsync(getGoodsReceipts, [])

  const stats = useMemo(() => {
    const rows = grns.data ?? []
    const received = rows.reduce((s, r) => s + r.receivedQty, 0)
    const rejected = rows.reduce((s, r) => s + r.rejectedQty, 0)
    return {
      total: rows.length,
      value: rows.reduce((s, r) => s + r.valueInr, 0),
      rejectRate: received ? (rejected / received) * 100 : 0,
      underTest: rows.filter((r) => r.inspection === 'Under Test').length,
    }
  }, [grns.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysGrnIcon}
        title="Goods Receipt Notes"
        description="Material booked in at the gate, with incoming inspection outcome."
      />

      <StatGrid cols={4}>
        <StatCard label="Receipts" value={stats.total} icon={Truck} tone="brand" />
        <StatCard label="Received value" value={formatInrCompact(stats.value)} icon={FileText} tone="success" />
        <StatCard
          label="Rejection rate"
          value={formatPct(stats.rejectRate)}
          icon={TriangleAlert}
          tone={stats.rejectRate > 3 ? 'danger' : 'default'}
        />
        <StatCard label="Under test" value={stats.underTest} sublabel="awaiting lab clearance" icon={ClipboardCheck} tone="warning" />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Receipt register</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'grnNo', header: 'GRN', cell: (r) => <span className="font-medium">{r.grnNo}</span> },
              { key: 'poNo', header: 'PO' },
              { key: 'supplierName', header: 'Supplier' },
              { key: 'item', header: 'Item' },
              { key: 'receivedQty', header: 'Received', align: 'right', cell: (r) => `${formatNumber(r.receivedQty)} ${r.unitOfMeasure}` },
              { key: 'acceptedQty', header: 'Accepted', align: 'right', cell: (r) => formatNumber(r.acceptedQty) },
              {
                key: 'rejectedQty',
                header: 'Rejected',
                align: 'right',
                cell: (r) => (
                  <span className={r.rejectedQty > 0 ? 'font-semibold text-danger-600' : undefined}>
                    {formatNumber(r.rejectedQty)}
                  </span>
                ),
              },
              { key: 'valueInr', header: 'Value', align: 'right', cell: (r) => formatInrCompact(r.valueInr) },
              { key: 'store', header: 'Store' },
              {
                key: 'receivedAt',
                header: 'Received',
                align: 'right',
                sortValue: (r) => new Date(r.receivedAt).getTime(),
                cell: (r) => formatDate(r.receivedAt, 'dd MMM'),
              },
              { key: 'inspection', header: 'Inspection', cell: (r) => <StatusBadge status={r.inspection} /> },
            ]}
            data={grns.data ?? []}
            isLoading={grns.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
