import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Cog,
  FileCheck,
  Filter,
  Layers,
  Package,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  User,
  Wrench,
  X,
} from 'lucide-react'
import {
  PoppysMaintenanceIcon,
  PoppysBreakdownIcon,
  PoppysPmIcon,
  PoppysSparePartsIcon,
} from '@/components/icons'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import {
  createBreakdownTicket,
  executePmChecklist,
  getBreakdowns,
  getFleetHealth,
  getMachines,
  getMaintenanceSummary,
  getPmSchedule,
  getSpareParts,
  getTechnicians,
  issueSparePart,
  signOffPmTask,
  updateBreakdownStatus,
} from '@/services'
import { processStages } from '@/mock/units'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, MiniBar, StatusBadge } from '@/components/tables'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, Select, Skeleton } from '@/components/ui'
import { formatDate, formatInrCompact, formatNumber, formatPct } from '@/lib/format'
import { cn } from '@/lib/utils'

/* =================================================== MachineDashboard ===== */

export function MachineDashboard() {
  const { unitId } = useAppStore()
  const summary = useAsync(getMaintenanceSummary, [])
  const fleetHealth = useAsync(getFleetHealth, [])
  const [stageKey, setStageKey] = useState(null)
  const machines = useAsync(() => getMachines({ unitId }), [unitId])

  const filteredMachines = useMemo(() => {
    const list = machines.data ?? []
    if (!stageKey) return list
    return list.filter((m) => m.stageKey === stageKey)
  }, [machines.data, stageKey])

  const s = summary.data

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysMaintenanceIcon}
        title="Asset Care & TPM Command Center"
        description="Overall Equipment Effectiveness (OEE), live fleet health matrix, and risk mitigation across all 9 manufacturing stages."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" as="a" href="/maintenance/pm">
              <CalendarClock className="mr-1.5 h-3.5 w-3.5 text-brand-500" />
              PM Compliance ({s?.pmCompliancePct || 94}%)
            </Button>
            <Button size="sm" variant="danger" as="a" href="/maintenance/breakdowns">
              <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
              {s?.openBreakdowns || 3} Active Breakdowns
            </Button>
          </div>
        }
      />

      {summary.isLoading || !s ? (
        <StatGridSkeleton count={6} />
      ) : (
        <StatGrid cols={6}>
          <StatCard
            label="Fleet OEE"
            value={`${s.fleetOeePct}%`}
            icon={Activity}
            tone="brand"
            trend="+1.2% vs tgt"
            trendDir="up"
            sublabel="Target: 80%"
          />
          <StatCard
            label="Availability"
            value={`${s.availabilityPct}%`}
            icon={ShieldCheck}
            tone="success"
            trend="+0.8% wk"
            trendDir="up"
            sublabel="Running Assets"
          />
          <StatCard
            label="MTBF"
            value={`${s.mtbfHours} hrs`}
            icon={Clock}
            tone="info"
            trend="+8h vs base"
            trendDir="up"
            sublabel="Time to Failure"
          />
          <StatCard
            label="MTTR"
            value={`${s.mttrHours} hrs`}
            icon={Wrench}
            tone="warning"
            trend="-0.4h fast"
            trendDir="down"
            sublabel="Time to Repair"
          />
          <StatCard
            label="PM Compliance"
            value={`${s.pmCompliancePct}%`}
            icon={FileCheck}
            tone="poppy"
            trend="+2% on-time"
            trendDir="up"
            sublabel="Audit Compliant"
          />
          <StatCard
            label="Assets At Risk"
            value={s.assetsAtRisk}
            icon={AlertTriangle}
            tone={s.assetsAtRisk > 0 ? 'danger' : 'default'}
            trend="Watch List"
            trendDir="up"
            sublabel="OEE < 75% or PM"
          />
        </StatGrid>
      )}

      {/* Fleet Health Matrix by Process Stage */}
      <Card className="overflow-hidden border-border/80 shadow-xs">
        <CardHeader className="bg-slate-50/50 border-b border-border/60 py-3.5 px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold tracking-tight">Fleet Health & Process Stage OEE Matrix</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Evaluates availability, OEE score, and operational risk across the 9-stage manufacturing route.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-semibold bg-background border-border">
              9 Departments Monitored
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10.5px]">
                  <th className="py-2.5 px-4">Process Stage</th>
                  <th className="py-2.5 px-3 text-right">Installed Assets</th>
                  <th className="py-2.5 px-3 text-right">Running</th>
                  <th className="py-2.5 px-3 text-right">Availability</th>
                  <th className="py-2.5 px-3 text-right">OEE Score</th>
                  <th className="py-2.5 px-3 text-center">Health Status</th>
                  <th className="py-2.5 px-4 text-center">Production Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(fleetHealth.data ?? s?.fleetHealthMatrix ?? []).map((row) => (
                  <tr key={row.stageKey} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-500" />
                      {row.stageLabel}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{row.totalAssets}</td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-semibold">{row.runningAssets}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold">{row.availabilityPct}%</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-foreground">
                      <span className={cn(row.oeePct >= 80 ? 'text-emerald-600' : row.oeePct >= 75 ? 'text-amber-600' : 'text-danger-600')}>
                        {row.oeePct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={row.health === 'Healthy' ? 'success' : 'warning'}>
                        {row.health}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={row.risk === 'Low' ? 'outline' : row.risk === 'Medium' ? 'warning' : 'danger'}>
                        {row.risk} Risk
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Machine Register */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Installed Machine Register</CardTitle>
              <p className="text-xs text-muted-foreground">Individual asset health, daily capacity, and MTBF track record.</p>
            </div>
            <FilterChipGroup>
              <FilterChip active={!stageKey} onClick={() => setStageKey(null)}>
                All Stages
              </FilterChip>
              {processStages.map((stg) => (
                <FilterChip key={stg.key} active={stageKey === stg.key} onClick={() => setStageKey(stg.key)}>
                  {stg.label}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'code', header: 'Machine Code', cell: (r) => <span className="font-semibold text-foreground">{r.code}</span> },
              { key: 'stageLabel', header: 'Stage', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              { key: 'make', header: 'Make & Model', cell: (r) => <span>{r.make} {r.model}</span> },
              { key: 'unitName', header: 'Unit' },
              { key: 'installedYear', header: 'Installed', align: 'right' },
              { key: 'capacityPerDay', header: 'Capacity/Day', align: 'right', cell: (r) => `${formatNumber(r.capacityPerDay)} ${r.unitOfMeasure}` },
              { key: 'utilisationPct', header: 'Utilisation', align: 'right', cell: (r) => <MiniBar value={r.utilisationPct} tone={r.utilisationPct > 80 ? 'success' : 'warning'} /> },
              { key: 'mtbfHours', header: 'MTBF', align: 'right', cell: (r) => `${formatNumber(r.mtbfHours)}h` },
              { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            ]}
            data={filteredMachines}
            isLoading={machines.isLoading}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ========================================================== Breakdowns ==== */

const LIFECYCLE_STEPS = [
  'Reported',
  'Triage',
  'Machine Isolated',
  'Technician Assigned',
  'Diagnosis',
  'Parts Issued',
  'Repair',
  'Test Run',
  'Released',
]

export function Breakdowns() {
  const [status, setStatus] = useState(null)
  const [severityFilter, setSeverityFilter] = useState(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const breakdowns = useAsync(() => getBreakdowns({ status, severity: severityFilter }), [status, severityFilter])
  const technicians = useAsync(getTechnicians, [])
  const machines = useAsync(getMachines, [])

  // New Ticket Form State
  const [formMachineCode, setFormMachineCode] = useState('KNT-004')
  const [formPoNo, setFormPoNo] = useState('PO-1050')
  const [formCategory, setFormCategory] = useState('Mechanical - Needle/Looper Jam')
  const [formSeverity, setFormSeverity] = useState('Critical')
  const [formTechId, setFormTechId] = useState('TECH-01')
  const [formNotes, setFormNotes] = useState('')

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const selectedTech = (technicians.data ?? []).find((t) => t.id === formTechId)
    await createBreakdownTicket({
      machineCode: formMachineCode,
      productionOrderId: formPoNo,
      failureCategory: formCategory,
      severity: formSeverity,
      technicianId: formTechId,
      technicianName: selectedTech?.name || 'R. Senthilkumar',
      notes: formNotes,
      stageKey: 'knitting',
      stageLabel: 'Knitting',
      unitName: 'Unit I',
      productionLossPcs: formSeverity === 'Critical' ? 250 : 100,
      orderRiskFobUsd: formSeverity === 'Critical' ? 1800 : 750,
    })
    setIsSubmitting(false)
    setReportModalOpen(false)
    breakdowns.reload()
  }

  const handleAdvanceStatus = async (ticket, nextStatus) => {
    await updateBreakdownStatus(ticket.id, nextStatus)
    breakdowns.reload()
    if (selectedTicket?.id === ticket.id) {
      setSelectedTicket({ ...selectedTicket, status: nextStatus })
    }
  }

  const stats = useMemo(() => {
    const rows = breakdowns.data ?? []
    return {
      total: rows.length,
      open: rows.filter((r) => r.status !== 'Released' && r.status !== 'Closed').length,
      hours: rows.reduce((s, r) => s + (r.downtimeHours || 0), 0),
      critical: rows.filter((r) => r.severity === 'Critical').length,
      fobExposure: rows.filter((r) => r.status !== 'Released').reduce((s, r) => s + (r.orderRiskFobUsd || 0), 0),
    }
  }, [breakdowns.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysBreakdownIcon}
        title="Breakdown Incident & Dispatch Hub"
        description="End-to-end breakdown lifecycle: Triage → Machine Isolation → Diagnosis → Spare Parts Issue → Repair → Test Run Release."
        actions={
          <Button size="sm" variant="danger" onClick={() => setReportModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Report Breakdown
          </Button>
        }
      />

      <StatGrid cols={4}>
        <StatCard
          label="Active Incidents"
          value={stats.open}
          icon={AlertTriangle}
          tone={stats.open > 0 ? 'danger' : 'success'}
          trend="+1 in last 4 hours"
          trendDir="up"
          sublabel="Machine Isolated"
        />
        <StatCard
          label="Total Downtime"
          value={`${stats.hours.toFixed(1)} hrs`}
          icon={Clock}
          tone="warning"
          trend="MTTR 3.8 hrs avg"
          trendDir="down"
          sublabel="Loss Quantified"
        />
        <StatCard
          label="Critical Severity"
          value={stats.critical}
          icon={ShieldAlert}
          tone="danger"
          trend="Direct Line Impact"
          trendDir="up"
          sublabel="Requires Lead Tech"
        />
        <StatCard
          label="FOB Order Exposure"
          value={`$${formatNumber(stats.fobExposure)}`}
          icon={Package}
          tone="poppy"
          trend="At-risk shipments"
          trendDir="up"
          sublabel="Cross-Module Linkage"
        />
      </StatGrid>

      {/* Breakdown Lifecycle Legend / Flow */}
      <Card className="border-border/80 bg-slate-50/50">
        <CardContent className="p-3.5">
          <div className="flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-semibold">
            {LIFECYCLE_STEPS.map((step, idx) => (
              <div key={step} className="flex items-center gap-1.5 shrink-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-[10px]">
                  {idx + 1}
                </span>
                <span className="text-foreground">{step}</span>
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <span className="text-muted-foreground ml-1">→</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incident Register */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Breakdown Incident Register</CardTitle>
              <p className="text-xs text-muted-foreground">Click any ticket to inspect root cause, spare parts issued, and advance repair state.</p>
            </div>
            <FilterChipGroup>
              <FilterChip active={!status} onClick={() => setStatus(null)}>
                All Status
              </FilterChip>
              {['Diagnosis', 'Parts Issued', 'Repair', 'Released'].map((st) => (
                <FilterChip key={st} active={status === st} tone={st === 'Diagnosis' ? 'poppy' : 'brand'} onClick={() => setStatus(st)}>
                  {st}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'id', header: 'Ticket No', cell: (r) => <span className="font-semibold text-brand-600">{r.id}</span> },
              { key: 'machineCode', header: 'Machine', cell: (r) => <span className="font-medium text-foreground">{r.machineCode}</span> },
              { key: 'stageLabel', header: 'Department', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              {
                key: 'productionOrderId',
                header: 'Linked Order',
                cell: (r) => (
                  <div className="text-xs">
                    <span className="font-semibold text-foreground">{r.productionOrderId}</span>
                    <span className="block text-[10.5px] text-muted-foreground">{r.buyerName}</span>
                  </div>
                ),
              },
              { key: 'failureCategory', header: 'Failure / Root Cause', cell: (r) => <span className="text-xs font-medium">{r.failureCategory}</span> },
              {
                key: 'severity',
                header: 'Severity',
                cell: (r) => (
                  <Badge variant={r.severity === 'Critical' ? 'danger' : r.severity === 'Major' ? 'warning' : 'secondary'}>
                    {r.severity}
                  </Badge>
                ),
              },
              { key: 'technicianName', header: 'Technician', cell: (r) => <span>{r.technicianName}</span> },
              { key: 'downtimeHours', header: 'Downtime', align: 'right', cell: (r) => `${r.downtimeHours}h` },
              {
                key: 'orderRiskFobUsd',
                header: 'Order Risk',
                align: 'right',
                cell: (r) => (
                  <span className="font-semibold text-danger-600">
                    ${formatNumber(r.orderRiskFobUsd || 0)}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Lifecycle State',
                cell: (r) => (
                  <Badge variant={r.status === 'Released' ? 'success' : r.status === 'Repair' ? 'warning' : 'danger'}>
                    {r.status}
                  </Badge>
                ),
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right',
                cell: (r) => (
                  <Button size="xs" variant="outline" onClick={() => setSelectedTicket(r)}>
                    Inspect
                  </Button>
                ),
              },
            ]}
            data={breakdowns.data ?? []}
            isLoading={breakdowns.isLoading}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Ticket Details & Action Drawer / Modal */}
      {selectedTicket && (
        <Modal
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Breakdown Incident: ${selectedTicket.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-border/80">
              <div>
                <span className="text-muted-foreground block text-[10.5px]">Machine Asset:</span>
                <span className="font-bold text-foreground text-sm">{selectedTicket.machineCode} ({selectedTicket.machineName || 'Circular Knit'})</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10.5px]">Linked Production Order:</span>
                <span className="font-bold text-brand-600 text-sm">{selectedTicket.productionOrderId} ({selectedTicket.buyerName})</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10.5px]">Failure Mode:</span>
                <span className="font-semibold text-foreground">{selectedTicket.failureCategory}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10.5px]">Assigned Technician:</span>
                <span className="font-semibold text-foreground">{selectedTicket.technicianName}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground block mb-1">Root Cause Analysis & Diagnostic Notes:</span>
              <p className="p-2.5 bg-background border border-border rounded-lg text-muted-foreground">
                {selectedTicket.rootCause || selectedTicket.notes || 'Awaiting diagnostic tear-down by maintenance technician.'}
              </p>
            </div>

            {/* Parts Used */}
            <div>
              <span className="font-semibold text-foreground block mb-1">Spare Parts Consumed:</span>
              {(selectedTicket.partsUsed ?? []).length > 0 ? (
                <div className="space-y-1.5">
                  {selectedTicket.partsUsed.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-border/60">
                      <span className="font-medium text-foreground">{p.partName}</span>
                      <span className="font-semibold text-brand-600">Qty: {p.qty} (₹{formatNumber(p.costInr)})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs italic">No parts issued yet for this ticket.</p>
              )}
            </div>

            {/* Lifecycle Progression Buttons */}
            <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-foreground">Current State: {selectedTicket.status}</span>
              <div className="flex items-center gap-2">
                {selectedTicket.status === 'Diagnosis' && (
                  <Button size="sm" variant="brand" onClick={() => handleAdvanceStatus(selectedTicket, 'Parts Issued')}>
                    Issue Parts & Advance →
                  </Button>
                )}
                {selectedTicket.status === 'Parts Issued' && (
                  <Button size="sm" variant="warning" onClick={() => handleAdvanceStatus(selectedTicket, 'Repair')}>
                    Start Repair →
                  </Button>
                )}
                {selectedTicket.status === 'Repair' && (
                  <Button size="sm" variant="success" onClick={() => handleAdvanceStatus(selectedTicket, 'Released')}>
                    Pass Test Run & Release Machine ✓
                  </Button>
                )}
                {selectedTicket.status === 'Released' && (
                  <Badge variant="success" className="py-1 px-3">
                    Machine Released to Production
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Breakdown Modal */}
      {reportModalOpen && (
        <Modal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title="Report New Machine Breakdown"
        >
          <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-foreground mb-1">Select Machine Asset</label>
              <Select value={formMachineCode} onChange={(e) => setFormMachineCode(e.target.value)}>
                <option value="KNT-004">KNT-004 (Mayer & Cie 3-Thread Fleece)</option>
                <option value="DYE-003">DYE-003 (Fongs Softflow Vessel 500kg)</option>
                <option value="CMP-002">CMP-002 (Tube Tex Pak-Nit II)</option>
                <option value="PRN-002">PRN-002 (MHM 12-Color Carousel)</option>
                <option value="SEW-018">SEW-018 (Juki Overlock Line 18)</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Linked Export PO</label>
                <Input value={formPoNo} onChange={(e) => setFormPoNo(e.target.value)} placeholder="e.g. PO-1050" />
              </div>
              <div>
                <label className="block font-semibold text-foreground mb-1">Severity Triage</label>
                <Select value={formSeverity} onChange={(e) => setFormSeverity(e.target.value)}>
                  <option value="Critical">Critical (Immediate Line Stop)</option>
                  <option value="Major">Major (Degraded Capacity)</option>
                  <option value="Minor">Minor (Routine)</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Failure Category</label>
              <Select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                <option value="Mechanical - Sinker Ring / Needle Jam">Mechanical - Sinker Ring / Needle Jam</option>
                <option value="Electrical - Main Inverter Drive Fault">Electrical - Main Inverter Drive Fault</option>
                <option value="Pneumatics - Pressure Leak / Actuator Stalling">Pneumatics - Pressure Leak / Actuator Stalling</option>
                <option value="Thermal - Heating Shoe / Temperature Drift">Thermal - Heating Shoe / Temperature Drift</option>
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Assign Lead Technician</label>
              <Select value={formTechId} onChange={(e) => setFormTechId(e.target.value)}>
                {(technicians.data ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.specialty}) — {t.unit}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Technician Floor Notes</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-border p-2 text-xs focus:ring-1 focus:ring-brand-500"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Describe symptoms, noise, or error code..."
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setReportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={isSubmitting}>
                {isSubmitting ? 'Logging...' : 'Dispatch Technician & Isolate Machine'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  )
}

/* ========================================================= Preventive Maintenance ==== */

export function PmSchedule() {
  const [statusFilter, setStatusFilter] = useState(null)
  const [selectedPm, setSelectedPm] = useState(null)
  const [checklistState, setChecklistState] = useState([])
  const [signOffName, setSignOffName] = useState('S. Dharmaraj')
  const [qaName, setQaName] = useState('K. Balaji')
  const [isSigning, setIsSigning] = useState(false)

  const pm = useAsync(() => getPmSchedule(statusFilter ? { status: statusFilter } : {}), [statusFilter])

  const openChecklistModal = (task) => {
    setSelectedPm(task)
    setChecklistState(task.checklist || [])
  }

  const toggleCheckItem = (id) => {
    setChecklistState((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done, passed: !item.done } : item))
    )
  }

  const handleSignOff = async () => {
    setIsSigning(true)
    await executePmChecklist(selectedPm.id, checklistState)
    await signOffPmTask(selectedPm.id, {
      signedBy: `${signOffName} (Lead Maintenance Engineer)`,
      qualityApprovedBy: `${qaName} (QA Audit Manager)`,
      timestamp: new Date().toISOString(),
    })
    setIsSigning(false)
    setSelectedPm(null)
    pm.reload()
  }

  const stats = useMemo(() => {
    const rows = pm.data ?? []
    return {
      total: rows.length,
      completed: rows.filter((r) => r.status === 'Completed').length,
      inProgress: rows.filter((r) => r.status === 'In Progress').length,
      overdue: rows.filter((r) => r.status === 'Overdue').length,
      compliancePct: rows.length ? Math.round((rows.filter((r) => r.status === 'Completed').length / rows.length) * 100) : 94,
    }
  }, [pm.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysPmIcon}
        title="Preventive Maintenance Schedule & Digital PM Logs"
        description="Total Productive Maintenance (TPM) checklists covering electrical, mechanical, pneumatic and calibration checks across all stages."
      />

      <StatGrid cols={4}>
        <StatCard
          label="PM Compliance"
          value={`${stats.compliancePct}%`}
          icon={FileCheck}
          tone="success"
          trend="+3% on-time rate"
          trendDir="up"
          sublabel="Audit Ready"
        />
        <StatCard
          label="Scheduled Tasks"
          value={stats.total}
          icon={CalendarClock}
          tone="brand"
          trend="Monthly Cycle"
          trendDir="up"
          sublabel="Across 9 Stages"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Wrench}
          tone="warning"
          trend="Live Checklist"
          trendDir="up"
          sublabel="Technician on floor"
        />
        <StatCard
          label="Overdue Alerts"
          value={stats.overdue}
          icon={AlertTriangle}
          tone={stats.overdue > 0 ? 'danger' : 'default'}
          trend="Requires Escalation"
          trendDir="up"
          sublabel="Grace Period: 48h"
        />
      </StatGrid>

      {/* PM Task Register */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>PM Execution Register</CardTitle>
              <p className="text-xs text-muted-foreground">Click 'Execute Checklist' to inspect parameters, verify pass/fail, and submit digital sign-offs.</p>
            </div>
            <FilterChipGroup>
              <FilterChip active={!statusFilter} onClick={() => setStatusFilter(null)}>
                All Tasks
              </FilterChip>
              {['Scheduled', 'In Progress', 'Completed', 'Overdue'].map((s) => (
                <FilterChip key={s} active={statusFilter === s} tone={s === 'Overdue' ? 'poppy' : 'brand'} onClick={() => setStatusFilter(s)}>
                  {s}
                </FilterChip>
              ))}
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'id', header: 'Task ID', cell: (r) => <span className="font-semibold text-brand-600">{r.id}</span> },
              { key: 'machineCode', header: 'Machine', cell: (r) => <span className="font-medium text-foreground">{r.machineCode}</span> },
              { key: 'stageLabel', header: 'Department', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              { key: 'planType', header: 'Maintenance Plan', cell: (r) => <span className="font-medium">{r.planType}</span> },
              { key: 'assignedTechnicianName', header: 'Technician' },
              {
                key: 'dueDate',
                header: 'Due Date',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-medium', r.status === 'Overdue' && 'text-danger-600 font-bold')}>
                    {formatDate(r.dueDate, 'dd MMM yyyy')}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                cell: (r) => (
                  <Badge variant={r.status === 'Completed' ? 'success' : r.status === 'Overdue' ? 'danger' : r.status === 'In Progress' ? 'warning' : 'secondary'}>
                    {r.status}
                  </Badge>
                ),
              },
              {
                key: 'action',
                header: 'Execution',
                align: 'right',
                cell: (r) => (
                  <Button size="xs" variant={r.status === 'Completed' ? 'outline' : 'brand'} onClick={() => openChecklistModal(r)}>
                    {r.status === 'Completed' ? 'View Sign-Off' : 'Execute Checklist →'}
                  </Button>
                ),
              },
            ]}
            data={pm.data ?? []}
            isLoading={pm.isLoading}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Digital Checklist & Sign-Off Modal */}
      {selectedPm && (
        <Modal
          open={!!selectedPm}
          onClose={() => setSelectedPm(null)}
          title={`PM Digital Checklist: ${selectedPm.machineCode} (${selectedPm.id})`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground text-sm">{selectedPm.planType}</span>
                <span className="block text-muted-foreground text-[11px]">Assigned: {selectedPm.assignedTechnicianName} • Unit: {selectedPm.unitName}</span>
              </div>
              <Badge variant={selectedPm.status === 'Completed' ? 'success' : 'warning'}>
                {selectedPm.status}
              </Badge>
            </div>

            {/* Interactive Checklist Items */}
            <div>
              <span className="font-bold text-foreground block mb-2">Mandatory Inspection Points:</span>
              <div className="space-y-2">
                {checklistState.map((chk) => (
                  <label
                    key={chk.id}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer',
                      chk.done ? 'bg-emerald-50/70 border-emerald-300' : 'bg-background border-border hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={chk.done}
                        onChange={() => toggleCheckItem(chk.id)}
                        disabled={selectedPm.status === 'Completed'}
                        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                      <span className={cn('font-medium', chk.done ? 'text-emerald-900 font-semibold' : 'text-foreground')}>
                        {chk.item}
                      </span>
                    </div>
                    {chk.done ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-muted-foreground font-semibold">PENDING</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Consumables Required */}
            <div>
              <span className="font-bold text-foreground block mb-1">Required Consumables / Oils:</span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedPm.partsRequired ?? []).map((p, i) => (
                  <Badge key={i} variant="outline" className="bg-slate-100 text-slate-700">
                    {p}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Digital Sign-Off Section */}
            {selectedPm.status === 'Completed' && selectedPm.digitalSignOff ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Digital Certificate Verified
                </span>
                <p className="text-emerald-800 text-[11px]">
                  Technician Sign-Off: <span className="font-semibold">{selectedPm.digitalSignOff.signedBy}</span>
                </p>
                <p className="text-emerald-800 text-[11px]">
                  QA Approved By: <span className="font-semibold">{selectedPm.digitalSignOff.qualityApprovedBy}</span>
                </p>
                <p className="text-emerald-700 text-[10.5px]">Timestamp: {formatDate(selectedPm.digitalSignOff.timestamp, 'dd MMM yyyy, HH:mm')}</p>
              </div>
            ) : (
              <div className="pt-3 border-t border-border space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Maintenance Lead Sign-Off</label>
                    <Input value={signOffName} onChange={(e) => setSignOffName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">QA Floor Inspector</label>
                    <Input value={qaName} onChange={(e) => setQaName(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedPm(null)}>
                    Cancel
                  </Button>
                  <Button variant="success" onClick={handleSignOff} disabled={isSigning || checklistState.some((c) => !c.done)}>
                    {isSigning ? 'Certifying...' : 'Submit Digital PM Sign-Off ✓'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}

/* ========================================================= SpareParts ===== */

export function SpareParts() {
  const spares = useAsync(getSpareParts, [])
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [selectedSpare, setSelectedSpare] = useState(null)
  const [issueQty, setIssueQty] = useState(1)
  const [issueReason, setIssueReason] = useState('Breakdown BD-2026-089')
  const [isIssuing, setIsIssuing] = useState(false)

  const handleIssueSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSpare) return
    setIsIssuing(true)
    await issueSparePart(selectedSpare.id, issueQty, issueReason)
    setIsIssuing(false)
    setIssueModalOpen(false)
    spares.reload()
  }

  const rows = useMemo(() => {
    const data = spares.data ?? []
    return criticalOnly ? data.filter((r) => r.isStockOutRisk || r.isReorderNeeded) : data
  }, [spares.data, criticalOnly])

  const stats = useMemo(() => {
    const data = spares.data ?? []
    return {
      totalItems: data.length,
      stockValue: data.reduce((s, r) => s + (r.stockQty * r.unitCostInr), 0),
      reorderAlerts: data.filter((r) => r.isReorderNeeded).length,
      criticalLow: data.filter((r) => r.isStockOutRisk).length,
    }
  }, [spares.data])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysSparePartsIcon}
        title="Critical Spare Parts & Spares Stock Matrix"
        description="Critical spares inventory, minimum stock thresholds, fast-moving consumption rates, and real-time replenishment lead times."
      />

      <StatGrid cols={4}>
        <StatCard
          label="Catalog Items"
          value={stats.totalItems}
          icon={Package}
          tone="brand"
          trend="9 Stages Covered"
          trendDir="up"
          sublabel="Active SKUs"
        />
        <StatCard
          label="Inventory Value"
          value={formatInrCompact(stats.stockValue)}
          icon={Cog}
          tone="info"
          trend="Safety Stock Maintained"
          trendDir="up"
          sublabel="Stores Ledger"
        />
        <StatCard
          label="Reorder Alerts"
          value={stats.reorderAlerts}
          icon={AlertTriangle}
          tone={stats.reorderAlerts > 0 ? 'warning' : 'success'}
          trend="Below Reorder Point"
          trendDir="up"
          sublabel="Auto PR Triggered"
        />
        <StatCard
          label="Critical Low Stock"
          value={stats.criticalLow}
          icon={ShieldAlert}
          tone={stats.criticalLow > 0 ? 'danger' : 'default'}
          trend="Stock-out Risk"
          trendDir="up"
          sublabel="Lead Time: 3-7 days"
        />
      </StatGrid>

      {/* Spare Parts Ledger */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Spare Parts Inventory Matrix</CardTitle>
              <p className="text-xs text-muted-foreground">Real-time stock on-hand, safety buffers, days of cover, and open PR tracking.</p>
            </div>
            <FilterChipGroup>
              <FilterChip active={!criticalOnly} onClick={() => setCriticalOnly(false)}>
                All Spares
              </FilterChip>
              <FilterChip active={criticalOnly} tone="poppy" onClick={() => setCriticalOnly(true)}>
                Reorder & Stockout Alerts ({stats.reorderAlerts})
              </FilterChip>
            </FilterChipGroup>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'partNumber', header: 'Part No', cell: (r) => <span className="font-semibold text-brand-600">{r.partNumber}</span> },
              { key: 'partName', header: 'Description', cell: (r) => <span className="font-medium text-foreground">{r.partName}</span> },
              { key: 'stageLabel', header: 'Department', cell: (r) => <Badge variant="outline">{r.stageLabel}</Badge> },
              {
                key: 'stockQty',
                header: 'On Hand',
                align: 'right',
                cell: (r) => (
                  <span className={cn('font-bold', r.isStockOutRisk ? 'text-danger-600' : 'text-foreground')}>
                    {r.stockQty} {r.unit}
                  </span>
                ),
              },
              { key: 'minStockLevel', header: 'Safety Stock', align: 'right', cell: (r) => `${r.minStockLevel} ${r.unit}` },
              { key: 'daysOfCover', header: 'Days Cover', align: 'right', cell: (r) => `${r.daysOfCover}d` },
              { key: 'unitCostInr', header: 'Unit Rate', align: 'right', cell: (r) => `₹${formatNumber(r.unitCostInr)}` },
              {
                key: 'openPrNo',
                header: 'Procurement Link',
                cell: (r) => (
                  r.openPrNo ? (
                    <Badge variant="brand" className="text-[10px]">
                      {r.openPrNo}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">—</span>
                  )
                ),
              },
              {
                key: 'stockStatus',
                header: 'Buffer Status',
                cell: (r) => (
                  <Badge variant={r.stockStatus === 'Optimal' ? 'success' : r.stockStatus === 'Critical Low' ? 'danger' : 'warning'}>
                    {r.stockStatus}
                  </Badge>
                ),
              },
              {
                key: 'action',
                header: 'Action',
                align: 'right',
                cell: (r) => (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setSelectedSpare(r)
                      setIssueModalOpen(true)
                    }}
                  >
                    Issue Part
                  </Button>
                ),
              },
            ]}
            data={rows}
            isLoading={spares.isLoading}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Issue Spare Part Modal */}
      {issueModalOpen && selectedSpare && (
        <Modal
          open={issueModalOpen}
          onClose={() => setIssueModalOpen(false)}
          title={`Issue Spare Part: ${selectedSpare.partName}`}
        >
          <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-foreground">Current Stock:</span>
                <span className="font-bold text-brand-600">{selectedSpare.stockQty} {selectedSpare.unit}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span>Reorder Point: {selectedSpare.reorderPoint} {selectedSpare.unit}</span>
                <span>Location: {selectedSpare.locationBin}</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Quantity to Issue</label>
              <Input
                type="number"
                min={1}
                max={selectedSpare.stockQty}
                value={issueQty}
                onChange={(e) => setIssueQty(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Breakdown / Work Order Reference</label>
              <Input
                value={issueReason}
                onChange={(e) => setIssueReason(e.target.value)}
                placeholder="e.g. BD-2026-089 or PM Routine"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIssueModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={isIssuing}>
                {isIssuing ? 'Issuing...' : 'Deduct Stock & Update Buffer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  )
}

export { PmSchedule as PreventiveMaintenance }
