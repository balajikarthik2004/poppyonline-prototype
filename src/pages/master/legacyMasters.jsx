import { useState } from 'react'
import { Boxes, Cog } from 'lucide-react'
import { PoppysMaintenanceIcon, PoppysKnittingIcon } from '@/components/icons'

import { useAsync } from '@/hooks/useAsync'
import { getMachines, getYarnLots } from '@/services'
import { processStages } from '@/mock/units'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { formatDate, formatKg, formatNumber } from '@/lib/format'

/* ===================================================== MasterMachines ===== */

export function MasterMachines() {
  const [stageKey, setStageKey] = useState(null)
  const machines = useAsync(() => getMachines(stageKey ? { stageKey } : {}), [stageKey])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysMaintenanceIcon}
        title="Machines Master"
        description="The machine master across every stage of the route, with make, model and rated capacity."
      />

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
        icon={PoppysKnittingIcon}
        title="Yarn Lots Master"
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
