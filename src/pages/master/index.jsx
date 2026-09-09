import { useState } from 'react'
import { Boxes, Cog, Shirt, Truck, Users } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { getBuyers, getMachines, getStyles, getSuppliers, getYarnLots } from '@/services'
import { processStages } from '@/mock/units'
import { segments } from '@/mock/styles'
import { supplierCategories } from '@/mock/suppliers'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatDate, formatKg, formatNumber, formatUsd, formatUsdCompact } from '@/lib/format'

/**
 * Master data registers. These are the reference records every transaction in
 * the app points back to, so they are read-only lists rather than dashboards.
 */

/* ======================================================= MasterStyles ===== */

export function MasterStyles() {
  const [segment, setSegment] = useState(null)
  const styles = useAsync(() => getStyles(segment ? { segment } : {}), [segment])

  return (
    <PageContainer>
      <PageHeader title="Styles" description="The master style record: fabric, GSM, cotton programme, size set and standard minute value." />

      <StatGrid cols={3}>
        <StatCard label="Styles on file" value={(styles.data ?? []).length} icon={Shirt} tone="brand" />
        <StatCard label="Segments" value={segments.length} icon={Boxes} tone="info" />
        <StatCard
          label="Active"
          value={(styles.data ?? []).filter((s) => s.status === 'Active').length}
          icon={Shirt}
          tone="success"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Style master</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!segment} onClick={() => setSegment(null)}>
                All
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
              { key: 'garment', header: 'Garment' },
              { key: 'fabric', header: 'Fabric' },
              { key: 'gsm', header: 'GSM', align: 'right' },
              { key: 'cottonProgramme', header: 'Cotton' },
              { key: 'finish', header: 'Finish' },
              { key: 'sizes', header: 'Size set', cell: (r) => r.sizes.join(', '), sortable: false },
              {
                key: 'fabricConsumptionKg',
                header: 'Consumption',
                align: 'right',
                cell: (r) => `${r.fabricConsumptionKg} kg`,
              },
              { key: 'smv', header: 'SMV', align: 'right', cell: (r) => r.smv.toFixed(1) },
              { key: 'fobUsd', header: 'FOB', align: 'right', cell: (r) => formatUsd(r.fobUsd) },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={styles.data ?? []}
            isLoading={styles.isLoading}
            pageSize={14}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ======================================================= MasterBuyers ===== */

export function MasterBuyers() {
  const buyers = useAsync(() => getBuyers(), [])

  return (
    <PageContainer>
      <PageHeader title="Buyers" description="The buyer master: commercial terms, incoterms and the AQL level each account audits to." />

      <StatGrid cols={3}>
        <StatCard label="Buyers on file" value={(buyers.data ?? []).length} icon={Users} tone="brand" />
        <StatCard
          label="Key accounts"
          value={(buyers.data ?? []).filter((b) => b.tier === 'Key').length}
          icon={Users}
          tone="poppy"
        />
        <StatCard
          label="Countries"
          value={new Set((buyers.data ?? []).map((b) => b.country)).size}
          icon={Truck}
          tone="info"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Buyer master</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'code', header: 'Code' },
              { key: 'name', header: 'Buyer', cell: (r) => <span className="font-medium">{r.name}</span> },
              { key: 'country', header: 'Country' },
              { key: 'region', header: 'Region', cell: (r) => <Badge variant="outline">{r.region}</Badge> },
              { key: 'tier', header: 'Tier', cell: (r) => <Badge variant={r.tier === 'Key' ? 'poppy' : 'secondary'}>{r.tier}</Badge> },
              { key: 'since', header: 'Since', align: 'right' },
              { key: 'paymentTerms', header: 'Payment terms' },
              { key: 'incoterm', header: 'Incoterm' },
              { key: 'aqlLevel', header: 'AQL', cell: (r) => <Badge variant="info">{r.aqlLevel}</Badge> },
              { key: 'merchandiser', header: 'Merchandiser' },
              { key: 'annualValueUsd', header: 'Annual value', align: 'right', cell: (r) => formatUsdCompact(r.annualValueUsd) },
            ]}
            data={buyers.data ?? []}
            isLoading={buyers.isLoading}
            pageSize={14}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ==================================================== MasterSuppliers ===== */

export function MasterSuppliers() {
  const [category, setCategory] = useState(null)
  const suppliers = useAsync(() => getSuppliers(category ? { category } : {}), [category])

  return (
    <PageContainer>
      <PageHeader title="Suppliers" description="The vendor master across yarn, dyes and chemicals, trims, packaging, job work and logistics." />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Supplier master</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!category} onClick={() => setCategory(null)}>
                All
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
              { key: 'state', header: 'State' },
              { key: 'leadTimeDays', header: 'Lead days', align: 'right' },
              { key: 'paymentTerms', header: 'Terms' },
              { key: 'rating', header: 'Rating', align: 'right' },
              { key: 'oekoTex', header: 'Oeko-Tex', cell: (r) => (r.oekoTex ? <Badge variant="success">Yes</Badge> : <Badge variant="secondary">No</Badge>) },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={suppliers.data ?? []}
            isLoading={suppliers.isLoading}
            pageSize={14}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ===================================================== MasterMachines ===== */

export function MasterMachines() {
  const [stageKey, setStageKey] = useState(null)
  const machines = useAsync(() => getMachines(stageKey ? { stageKey } : {}), [stageKey])

  return (
    <PageContainer>
      <PageHeader title="Machines" description="The machine master across every stage of the route, with make, model and rated capacity." />

      <StatGrid cols={3}>
        <StatCard label="Machines on file" value={(machines.data ?? []).length} icon={Cog} tone="brand" />
        <StatCard label="Stages" value={processStages.length} icon={Boxes} tone="info" />
        <StatCard
          label="Makes"
          value={new Set((machines.data ?? []).map((m) => m.make)).size}
          icon={Cog}
          tone="poppy"
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Machine master</CardTitle>
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
              { key: 'code', header: 'Code', cell: (r) => <span className="font-medium">{r.code}</span> },
              { key: 'stageLabel', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              { key: 'make', header: 'Make' },
              { key: 'model', header: 'Model' },
              { key: 'unitName', header: 'Unit' },
              { key: 'gauge', header: 'Gauge', cell: (r) => r.gauge ?? '-' },
              { key: 'diameterInch', header: 'Dia', align: 'right', cell: (r) => (r.diameterInch ? `${r.diameterInch}"` : '-') },
              { key: 'installedYear', header: 'Installed', align: 'right' },
              {
                key: 'capacityPerDay',
                header: 'Capacity/day',
                align: 'right',
                cell: (r) => `${formatNumber(r.capacityPerDay)} ${r.unitOfMeasure}`,
              },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={machines.data ?? []}
            isLoading={machines.isLoading}
            pageSize={14}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ===================================================== MasterYarnLots ===== */

export function MasterYarnLots() {
  const lots = useAsync(getYarnLots, [])

  return (
    <PageContainer>
      <PageHeader
        title="Yarn Lots"
        description="The lot master with the laboratory figures a knitter checks before releasing yarn to machines: CSP, Uster, imperfections and RKM."
      />

      <Card>
        <CardHeader>
          <CardTitle>Lot master</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'lotNo', header: 'Lot', cell: (r) => <span className="font-medium">{r.lotNo}</span> },
              { key: 'count', header: 'Count', cell: (r) => <Badge variant="brand">{r.count}</Badge> },
              { key: 'blend', header: 'Blend' },
              { key: 'supplierName', header: 'Supplier' },
              {
                key: 'receivedAt',
                header: 'Received',
                align: 'right',
                sortValue: (r) => new Date(r.receivedAt).getTime(),
                cell: (r) => formatDate(r.receivedAt, 'dd MMM yy'),
              },
              { key: 'quantityKg', header: 'Received', align: 'right', cell: (r) => formatKg(r.quantityKg) },
              { key: 'balanceKg', header: 'Balance', align: 'right', cell: (r) => formatKg(r.balanceKg) },
              { key: 'rateInrPerKg', header: 'Rate/kg', align: 'right' },
              { key: 'csp', header: 'CSP', align: 'right' },
              { key: 'uster', header: 'Uster U%', align: 'right' },
              { key: 'imperfections', header: 'IPI', align: 'right' },
              { key: 'rkm', header: 'RKM', align: 'right' },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={lots.data ?? []}
            isLoading={lots.isLoading}
            pageSize={14}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
