import { useState } from 'react'
import {
  Anchor,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  Cog,
  FileCheck,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Shirt,
  Sliders,
  Truck,
  Users,
} from 'lucide-react'
import {
  PoppysMasterDataIcon,
  PoppysDefectsIcon,
  PoppysPortIcon,
  PoppysSalesIcon,
  PoppysBuyerIcon,
  PoppysSuppliersIcon,
  PoppysStyleLibraryIcon,
} from '@/components/icons'

import { useAsync } from '@/hooks/useAsync'
import {
  getMasterStyles,
  getMasterBuyers,
  getMasterSuppliers,
  getMasterDefects,
  getMasterPorts,
  getMasterHealthDiagnostics,
  createStyleBomRevision,
  approveStyleBomRevision,
  updateBuyerTerms,
  updateSupplierStatus,
} from '@/services'
import { useAppStore } from '@/store/appStore'
import { segments } from '@/mock/styles'
import { supplierCategories, supplierTypes } from '@/mock/suppliers'
import { calculateBomSummary } from '@/lib/master/bomLogic'
import { diffBomRevisions } from '@/lib/master/revisionLogic'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, Select } from '@/components/ui'
import { formatDate, formatKg, formatNumber, formatUsd, formatUsdCompact } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * Master Data Governance Control Plane.
 * Centralized Single Source of Truth for Styles, Multi-Level BOMs, Revisions,
 * Buyers, Suppliers, Universal Defect Dictionary, and Ports.
 */

export function MasterStyles() {
  const { userRole, canAccess } = useAppStore()
  const [segment, setSegment] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false)
  const [revisionReason, setRevisionReason] = useState('')
  const [diffViewRev, setDiffViewRev] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const styles = useAsync(
    () => getMasterStyles(segment ? { segment } : {}),
    [segment, refreshTrigger],
  )
  const health = useAsync(getMasterHealthDiagnostics, [refreshTrigger])

  const styleList = (styles.data ?? []).filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return s.styleNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.buyerName?.toLowerCase().includes(q)
  })

  // Set default selected style
  const activeStyle = selectedStyle || (styles.data && styles.data[0])
  const bomSummary = activeStyle ? calculateBomSummary(activeStyle.bom) : null
  const currentApprovedRev = activeStyle?.revisions?.find((r) => r.status === 'Approved')
  const draftRev = activeStyle?.revisions?.find((r) => r.status === 'Draft')

  const handleCreateRevision = async () => {
    if (!activeStyle || !revisionReason.trim()) return
    await createStyleBomRevision(activeStyle.id, revisionReason, userRole === 'MD' ? 'Vicky' : 'Senior Merchandiser')
    setIsRevisionModalOpen(false)
    setRevisionReason('')
    setRefreshTrigger((c) => c + 1)
  }

  const handleApproveRevision = async (revId) => {
    if (!activeStyle) return
    await approveStyleBomRevision(activeStyle.id, revId, 'Vicky (MD)')
    setRefreshTrigger((c) => c + 1)
  }

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysStyleLibraryIcon}
        title="Garment Style Master & BOM Governance"
        description="The universal style library with multi-level BOM structures (Fabric, Yarn, Trims, 9 Processes), version control, and bulk cutting approval gates."
      >
        <div className="flex items-center gap-2">
          {health.data && (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Integrity: {health.data.healthScorePct}% {health.data.status}</span>
            </div>
          )}
        </div>
      </PageHeader>

      <StatGrid cols={4}>
        <StatCard label="Styles on file" value={(styles.data ?? []).length} sublabel="64 registered styles" icon={Shirt} tone="brand" />
        <StatCard label="Active BOM Revisions" value={(styles.data ?? []).filter((s) => s.activeRevisionVersion === 'v1.1' || s.activeRevisionVersion === 'v2.0').length} sublabel="Optimized iterations" icon={GitBranch} tone="poppy" />
        <StatCard label="Fabric Categories" value={segments.length} sublabel="Men, Women, Kids, Infants" icon={Boxes} tone="info" />
        <StatCard label="Bulk Approved" value={(styles.data ?? []).filter((s) => s.approval === 'Approved').length} sublabel="Cutting release gates" icon={CheckCircle2} tone="success" />
      </StatGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Style Directory Table */}
        <div className="space-y-4 lg:col-span-7">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Garment Style Master</CardTitle>
                  <p className="text-xs text-muted-foreground">Select a style to view BOM hierarchy and version history</p>
                </div>
                <div className="relative w-full max-w-xs sm:w-56">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter style or buyer..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>
              <FilterChipGroup className="mt-2">
                <FilterChip active={!segment} onClick={() => setSegment(null)}>
                  All ({styles.data?.length || 0})
                </FilterChip>
                {segments.map((s) => (
                  <FilterChip key={s} active={segment === s} onClick={() => setSegment(s)}>
                    {s}
                  </FilterChip>
                ))}
              </FilterChipGroup>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    key: 'styleNo',
                    header: 'Style',
                    cell: (r) => (
                      <div>
                        <span className={cn('font-semibold', activeStyle?.id === r.id ? 'text-primary' : 'text-foreground')}>
                          {r.styleNo}
                        </span>
                        <div className="text-[11px] text-muted-foreground">{r.id}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'name',
                    header: 'Garment / Segment',
                    cell: (r) => (
                      <div>
                        <div className="font-medium text-foreground">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">{r.buyerName}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'fabric',
                    header: 'Fabric & GSM',
                    cell: (r) => (
                      <div className="text-xs">
                        <span>{r.fabric}</span>
                        <span className="ml-1 text-muted-foreground">({r.gsm}g)</span>
                      </div>
                    ),
                  },
                  {
                    key: 'activeRevisionVersion',
                    header: 'BOM Rev',
                    cell: (r) => (
                      <Badge variant={r.activeRevisionVersion === 'v1.0' ? 'secondary' : r.activeRevisionVersion === 'v1.1' ? 'brand' : 'warning'}>
                        {r.activeRevisionVersion || 'v1.0'}
                      </Badge>
                    ),
                  },
                  {
                    key: 'fabricConsumptionKg',
                    header: 'Consumption',
                    align: 'right',
                    cell: (r) => `${r.fabricConsumptionKg} kg`,
                  },
                  {
                    key: 'smv',
                    header: 'SMV',
                    align: 'right',
                    cell: (r) => `${r.smv.toFixed(1)}m`,
                  },
                  {
                    key: 'approval',
                    header: 'Gate',
                    cell: (r) => (
                      <Badge variant={r.approval === 'Approved' ? 'success' : 'warning'}>
                        {r.approval}
                      </Badge>
                    ),
                  },
                ]}
                data={styleList}
                isLoading={styles.isLoading}
                pageSize={10}
                onRowClick={(row) => setSelectedStyle(row)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Style BOM & Revision Inspector */}
        <div className="space-y-4 lg:col-span-5">
          {activeStyle ? (
            <div className="space-y-4">
              <Card className="border-primary/20 bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="brand">{activeStyle.styleNo}</Badge>
                        <Badge variant="outline">{activeStyle.segment}</Badge>
                        <Badge variant={activeStyle.activeRevisionVersion === 'v2.0' ? 'warning' : 'success'}>
                          BOM {activeStyle.activeRevisionVersion}
                        </Badge>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-foreground">{activeStyle.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Account: <span className="font-medium text-foreground">{activeStyle.buyerName}</span> • Season: {activeStyle.season}
                      </p>
                    </div>

                    {canAccess('master', 'edit') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsRevisionModalOpen(true)}
                        className="gap-1 text-xs"
                      >
                        <Plus className="h-3 w-3" />
                        Revise BOM
                      </Button>
                    )}
                  </div>

                  {/* Summary Bar */}
                  {bomSummary && (
                    <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg bg-secondary/50 p-2.5 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Fabric Wt</div>
                        <div className="font-semibold text-foreground">{bomSummary.fabricTotalKg} kg</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Yarn Wt</div>
                        <div className="font-semibold text-foreground">{bomSummary.yarnTotalKg} kg</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Trims Spec</div>
                        <div className="font-semibold text-foreground">{bomSummary.trimsCount} items</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Route SMV</div>
                        <div className="font-semibold text-primary">{bomSummary.totalSmv} min</div>
                      </div>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  {/* BOM Level 1: Fabric */}
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-1 font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-brand-600" />
                        1. Fabric Construction
                      </span>
                      <span className="text-[11px] text-muted-foreground">{(activeStyle.bom?.fabric ?? []).length} components</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {(activeStyle.bom?.fabric ?? []).map((fab) => (
                        <div key={fab.id} className="flex items-center justify-between rounded-md bg-secondary/30 px-2.5 py-1.5">
                          <div>
                            <div className="font-medium text-foreground">{fab.name}</div>
                            <div className="text-[10px] text-muted-foreground">{fab.construction} • {fab.widthInches}&quot; width</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">{fab.consumptionKg} kg</div>
                            <div className="text-[10px] text-muted-foreground">+{fab.lossAllowancePct}% loss</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOM Level 2: Yarn */}
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-1 font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Boxes className="h-3.5 w-3.5 text-indigo-500" />
                        2. Yarn Blend & Count
                      </span>
                      <span className="text-[11px] text-muted-foreground">Target CSP &gt; 2900</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {(activeStyle.bom?.yarn ?? []).map((y) => (
                        <div key={y.id} className="flex items-center justify-between rounded-md bg-secondary/30 px-2.5 py-1.5">
                          <div>
                            <div className="font-medium text-foreground">{y.count}</div>
                            <div className="text-[10px] text-muted-foreground">{y.composition}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">{y.consumptionKg} kg</div>
                            <div className="text-[10px] text-muted-foreground">CSP {y.targetCsp}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOM Level 3: Trims */}
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-1 font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-warning-500" />
                        3. Trims & Packaging Specification
                      </span>
                      <span className="text-[11px] text-muted-foreground">{(activeStyle.bom?.trims ?? []).length} items</span>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {(activeStyle.bom?.trims ?? []).map((trim) => (
                        <div key={trim.id} className="flex items-center justify-between rounded-md bg-secondary/30 px-2.5 py-1.5">
                          <div className="max-w-[70%]">
                            <div className="truncate font-medium text-foreground">{trim.item}</div>
                            <div className="truncate text-[10px] text-muted-foreground">{trim.spec}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-foreground">{trim.qtyPerGarment} {trim.uom}</div>
                            <div className="text-[10px] text-muted-foreground">{trim.supplierType}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOM Level 4: 9 Processes Routing */}
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-1 font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <Cog className="h-3.5 w-3.5 text-emerald-500" />
                        4. 9-Stage Manufacturing Route
                      </span>
                      <span className="text-[11px] font-semibold text-primary">{activeStyle.smv.toFixed(1)} Total SMV</span>
                    </div>
                    <div className="mt-2 max-h-44 space-y-1 overflow-y-auto pr-1">
                      {(activeStyle.bom?.processes ?? []).map((proc) => (
                        <div key={proc.stageKey} className="flex items-center justify-between rounded bg-secondary/20 px-2 py-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary font-mono text-[9px]">
                              {proc.sequence}
                            </span>
                            <span className="font-medium text-foreground">{proc.processName}</span>
                            {proc.criticalQualityGate && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] text-poppy-600">
                                QA Gate
                              </Badge>
                            )}
                          </div>
                          <span className="font-mono text-muted-foreground">{proc.smv} min</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BOM Revision History & Versioning */}
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="h-3.5 w-3.5 text-poppy-500" />
                        BOM Revision History
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {(activeStyle.revisions ?? []).map((rev) => (
                        <div
                          key={rev.revisionId}
                          className={cn(
                            'rounded-lg border p-2.5 transition-all',
                            rev.status === 'Approved'
                              ? 'border-emerald-500/30 bg-emerald-500/5'
                              : rev.status === 'Draft'
                              ? 'border-amber-500/30 bg-amber-500/5'
                              : 'border-border bg-secondary/20',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{rev.version}</span>
                              <Badge
                                variant={
                                  rev.status === 'Approved'
                                    ? 'success'
                                    : rev.status === 'Draft'
                                    ? 'warning'
                                    : 'secondary'
                                }
                              >
                                {rev.status}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(rev.createdAt, 'dd MMM yy')}
                              </span>
                            </div>

                            {rev.status === 'Draft' && canAccess('master', 'approve') && (
                              <Button
                                size="sm"
                                variant="primary"
                                className="h-6 px-2 text-[10px]"
                                onClick={() => handleApproveRevision(rev.revisionId)}
                              >
                                Approve Revision
                              </Button>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{rev.changeReason}</p>
                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>By: {rev.createdBy}</span>
                            {rev.approvedBy && <span>Approved by: {rev.approvedBy}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex h-64 items-center justify-center p-6 text-center text-muted-foreground">
              Select a style to view BOM specifications
            </Card>
          )}
        </div>
      </div>

      {/* Revision Modal */}
      <Modal
        open={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title={`Create New Draft Revision for ${activeStyle?.styleNo}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-muted-foreground">
            This will clone the active BOM structure and create a new editable draft revision for approval by the Managing Director / GM.
          </p>

          <div>
            <label className="block text-xs font-semibold text-foreground">Change Rationale & Scope</label>
            <Input
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="e.g. Marker yield improvement, upgraded care label or trim spec"
              className="mt-1"
            />
          </div>

          <div className="rounded-lg bg-secondary/50 p-3 text-muted-foreground">
            <div className="font-medium text-foreground">Target Version: {activeStyle?.activeRevisionVersion === 'v1.0' ? 'v1.1' : 'v2.0'}</div>
            <div className="mt-0.5 text-[11px]">Effective Date: Immediate next production batch release</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsRevisionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateRevision} disabled={!revisionReason.trim()}>
              Generate Draft Revision
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}

/* ======================================================= MasterBuyers ===== */

export function MasterBuyers() {
  const { userRole, canAccess } = useAppStore()
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [paymentTerms, setPaymentTerms] = useState('')
  const [incoterm, setIncoterm] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const buyers = useAsync(getMasterBuyers, [refreshTrigger])

  const handleEditBuyer = (buyer) => {
    setSelectedBuyer(buyer)
    setPaymentTerms(buyer.paymentTerms)
    setIncoterm(buyer.incoterm)
    setEditModalOpen(true)
  }

  const handleSaveBuyer = async () => {
    if (!selectedBuyer) return
    await updateBuyerTerms(selectedBuyer.id, { paymentTerms, incoterm })
    setEditModalOpen(false)
    setRefreshTrigger((c) => c + 1)
  }

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysBuyerIcon}
        title="Buyer Master & Commercial Governance"
        description="Single source of truth for international account profiles: commercial payment terms, Incoterms, AQL audit standards, EDI protocols, and designated forwarders."
      />

      <StatGrid cols={4}>
        <StatCard label="Buyers on file" value={(buyers.data ?? []).length} sublabel="High-street retailers" icon={Users} tone="brand" />
        <StatCard label="Key Accounts" value={(buyers.data ?? []).filter((b) => b.tier === 'Key').length} sublabel="M&S, Next, Tesco, Target" icon={Users} tone="poppy" />
        <StatCard label="Export Regions" value={new Set((buyers.data ?? []).map((b) => b.region)).size} sublabel="Europe, USA, Japan, GCC" icon={Globe} tone="info" />
        <StatCard label="AQL 1.5 Strict" value={(buyers.data ?? []).filter((b) => b.aqlLevel === 'AQL 1.5').length} sublabel="Highest audit tier" icon={ShieldCheck} tone="success" />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Buyer Commercial Register</CardTitle>
            <p className="text-xs text-muted-foreground">Click any buyer row to view full logistics & EDI profile</p>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'code', header: 'Code', cell: (r) => <span className="font-mono text-xs font-semibold">{r.code}</span> },
              {
                key: 'name',
                header: 'Buyer Account',
                cell: (r) => (
                  <div>
                    <span className="font-semibold text-foreground">{r.name}</span>
                    <div className="text-[11px] text-muted-foreground">{r.country} • Since {r.since}</div>
                  </div>
                ),
              },
              { key: 'region', header: 'Region', cell: (r) => <Badge variant="outline">{r.region}</Badge> },
              { key: 'tier', header: 'Tier', cell: (r) => <Badge variant={r.tier === 'Key' ? 'poppy' : 'secondary'}>{r.tier}</Badge> },
              { key: 'currency', header: 'Currency', cell: (r) => <Badge variant="brand">{r.currency || 'USD'}</Badge> },
              { key: 'paymentTerms', header: 'Payment Terms', cell: (r) => <span className="font-medium text-foreground">{r.paymentTerms}</span> },
              { key: 'incoterm', header: 'Incoterm' },
              { key: 'aqlLevel', header: 'AQL Standard', cell: (r) => <Badge variant="info">{r.aqlLevel}</Badge> },
              { key: 'forwarder', header: 'Designated Forwarder', cell: (r) => <span className="text-xs text-muted-foreground">{r.forwarder || 'DHL Global'}</span> },
              {
                key: 'annualValueUsd',
                header: 'Annual Volume',
                align: 'right',
                cell: (r) => formatUsdCompact(r.annualValueUsd),
              },
              {
                key: 'actions',
                header: '',
                cell: (r) => (
                  canAccess('master', 'edit') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditBuyer(r)
                      }}
                    >
                      Edit Terms
                    </Button>
                  )
                ),
              },
            ]}
            data={buyers.data ?? []}
            isLoading={buyers.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>

      {/* Edit Terms Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Commercial Terms: ${selectedBuyer?.name}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-foreground">Payment Terms</label>
            <Input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block font-semibold text-foreground">Incoterm Policy</label>
            <Input
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="rounded-lg bg-secondary/50 p-3 space-y-1 text-muted-foreground">
            <div><span className="font-semibold text-foreground">Testing Requirement:</span> {selectedBuyer?.testingReq}</div>
            <div><span className="font-semibold text-foreground">EDI Protocol:</span> {selectedBuyer?.edi}</div>
            <div><span className="font-semibold text-foreground">Shipment Rules:</span> {selectedBuyer?.shipmentRules}</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveBuyer}>
              Save Terms
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  )
}

/* ==================================================== MasterSuppliers ===== */

export function MasterSuppliers() {
  const { canAccess } = useAppStore()
  const [category, setCategory] = useState(null)
  const [supplierType, setSupplierType] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const suppliers = useAsync(
    () => getMasterSuppliers({ category: category || undefined, supplierType: supplierType || undefined }),
    [category, supplierType, refreshTrigger],
  )

  const handleToggleStatus = async (supplier) => {
    const nextStatus = supplier.status === 'Approved' ? 'On Hold' : 'Approved'
    await updateSupplierStatus(supplier.id, nextStatus)
    setRefreshTrigger((c) => c + 1)
  }

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysSuppliersIcon}
        title="Supplier & Mill Master Governance"
        description="Unified vendor ledger across Spinning Mills, Dye Chemicals, Trims, Packaging, and Job-Work with ratings, quality scores, and lead times."
      />

      <StatGrid cols={4}>
        <StatCard label="Registered Vendors" value={(suppliers.data ?? []).length} sublabel="Multi-echelon network" icon={Truck} tone="brand" />
        <StatCard label="Spinning Mills" value={(suppliers.data ?? []).filter((s) => s.supplierType === 'Spinning Mill').length} sublabel="Coimbatore / Erode belt" icon={Boxes} tone="info" />
        <StatCard label="Oeko-Tex Certified" value={(suppliers.data ?? []).filter((s) => s.oekoTex).length} sublabel="Eco-compliant materials" icon={FileCheck} tone="success" />
        <StatCard label="Approved Status" value={(suppliers.data ?? []).filter((s) => s.status === 'Approved').length} sublabel="Active purchase routing" icon={CheckCircle2} tone="poppy" />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Supplier Master Register</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!category} onClick={() => setCategory(null)}>
                All Categories
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
              { key: 'code', header: 'Code', cell: (r) => <span className="font-mono text-xs font-semibold">{r.code}</span> },
              {
                key: 'name',
                header: 'Supplier / Mill',
                cell: (r) => (
                  <div>
                    <span className="font-semibold text-foreground">{r.name}</span>
                    <div className="text-[11px] text-muted-foreground">{r.city}, {r.state}</div>
                  </div>
                ),
              },
              { key: 'supplierType', header: 'Supplier Type', cell: (r) => <Badge variant="outline">{r.supplierType}</Badge> },
              { key: 'leadTimeDays', header: 'Lead Days', align: 'right', cell: (r) => `${r.leadTimeDays}d` },
              { key: 'moqKg', header: 'MOQ', align: 'right', cell: (r) => r.moqKg ? `${formatNumber(r.moqKg)} kg/u` : 'None' },
              { key: 'deliveryScore', header: 'Delivery', align: 'right', cell: (r) => `${r.deliveryScore}%` },
              { key: 'qualityScore', header: 'Quality', align: 'right', cell: (r) => `${r.qualityScore}%` },
              {
                key: 'rating',
                header: 'Rating (0-5)',
                align: 'right',
                cell: (r) => (
                  <Badge variant={r.rating >= 4.5 ? 'success' : r.rating >= 4.0 ? 'brand' : 'warning'}>
                    ★ {r.rating.toFixed(1)}
                  </Badge>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                cell: (r) => (
                  <StatusBadge status={r.status} />
                ),
              },
              {
                key: 'toggle',
                header: '',
                cell: (r) => (
                  canAccess('master', 'edit') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => handleToggleStatus(r)}
                    >
                      {r.status === 'Approved' ? 'Set Hold' : 'Approve'}
                    </Button>
                  )
                ),
              },
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

/* ===================================================== MasterDefects ====== */

export function MasterDefects() {
  const [category, setCategory] = useState(null)
  const defects = useAsync(() => getMasterDefects(category), [category])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysDefectsIcon}
        title="Defect Taxonomy & Root Cause Library"
        description="Standardised defect classification across all 9 manufacturing departments, with severe classification rules and standard operating procedures."
      />

      <StatGrid cols={4}>
        <StatCard label="Defect Codes" value={(defects.data ?? []).length} sublabel="Universal codes" icon={ShieldCheck} tone="brand" />
        <StatCard label="Critical Severity" value={(defects.data ?? []).filter((d) => d.category === 'Critical').length} sublabel="Zero-tolerance defects" icon={ShieldCheck} tone="poppy" />
        <StatCard label="DHU Eligible" value={(defects.data ?? []).filter((d) => d.dhuEligible).length} sublabel="Calculates inline DHU" icon={Cog} tone="info" />
        <StatCard label="CAPA Triggers" value={(defects.data ?? []).filter((d) => d.capaTrigger).length} sublabel="Auto-initiates 8D case" icon={CheckCircle2} tone="warning" />
      </StatGrid>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Defect Master Taxonomy</CardTitle>
            <FilterChipGroup>
              <FilterChip active={!category} onClick={() => setCategory(null)}>
                All Stages
              </FilterChip>
              {['Sewing', 'Knitting', 'Dyeing', 'Printing', 'Cutting', 'Packing'].map((c) => (
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
              { key: 'code', header: 'Defect Code', cell: (r) => <span className="font-mono text-xs font-semibold text-primary">{r.code}</span> },
              {
                key: 'name',
                header: 'Defect Description',
                cell: (r) => <span className="font-medium text-foreground">{r.name}</span>,
              },
              { key: 'process', header: 'Origin Process', cell: (r) => <Badge variant="outline">{r.process}</Badge> },
              {
                key: 'category',
                header: 'Severity',
                cell: (r) => (
                  <Badge variant={r.category === 'Critical' ? 'danger' : r.category === 'Major' ? 'warning' : 'secondary'}>
                    {r.category}
                  </Badge>
                ),
              },
              { key: 'qualityGate', header: 'Quality Gate', cell: (r) => <span className="text-xs text-muted-foreground">{r.qualityGate}</span> },
              {
                key: 'dhuEligible',
                header: 'DHU Calc',
                cell: (r) => (
                  <Badge variant={r.dhuEligible ? 'brand' : 'outline'}>
                    {r.dhuEligible ? 'Eligible' : 'No'}
                  </Badge>
                ),
              },
              {
                key: 'capaTrigger',
                header: '8D Trigger',
                cell: (r) => (
                  <Badge variant={r.capaTrigger ? 'poppy' : 'secondary'}>
                    {r.capaTrigger ? 'CAPA Trigger' : 'Standard'}
                  </Badge>
                ),
              },
              { key: 'dhuImpact', header: 'DHU Impact', align: 'right', cell: (r) => `+${r.dhuImpact}%` },
            ]}
            data={defects.data ?? []}
            isLoading={defects.isLoading}
            pageSize={12}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ======================================================= MasterPorts ====== */

export function MasterPorts() {
  const ports = useAsync(getMasterPorts, [])

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysPortIcon}
        title="Ports, Corridors & Global Gateways"
        description="International sea routes, air hubs, typical maritime transit days, cut-off gates, and container terminal tracking parameters."
      />

      <StatGrid cols={4}>
        <StatCard label="Logistics Nodes" value={(ports.data ?? []).length} sublabel="Air & Sea corridors" icon={Anchor} tone="brand" />
        <StatCard label="Loading Hubs (POL)" value={(ports.data ?? []).filter((p) => p.type.includes('Loading')).length} sublabel="Tuticorin, Chennai, Cochin, CJB" icon={Truck} tone="info" />
        <StatCard label="Avg Europe Transit" value="18 Days" sublabel="Tuticorin -> Felixstowe" icon={Clock} tone="success" />
        <StatCard label="Forwarder Direct Hubs" value="6 Networks" sublabel="DHL, Kuehne+Nagel, Schenker" icon={Globe} tone="poppy" />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Port & Corridor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { key: 'code', header: 'Port Code', cell: (r) => <span className="font-mono text-xs font-semibold text-foreground">{r.code}</span> },
              {
                key: 'name',
                header: 'Port / Terminal Name',
                cell: (r) => (
                  <div>
                    <span className="font-semibold text-foreground">{r.name}</span>
                    <div className="text-[11px] text-muted-foreground">{r.country}</div>
                  </div>
                ),
              },
              { key: 'type', header: 'Gateway Type', cell: (r) => <Badge variant={r.type.includes('Loading') ? 'brand' : 'info'}>{r.type}</Badge> },
              { key: 'transportMode', header: 'Transport Mode', cell: (r) => <Badge variant="outline">{r.transportMode}</Badge> },
              { key: 'transitCorridor', header: 'Transit Corridor', cell: (r) => <span className="text-xs text-muted-foreground">{r.transitCorridor}</span> },
              {
                key: 'transitDaysToEurope',
                header: 'Transit Days',
                align: 'right',
                cell: (r) => (
                  <span className="font-medium text-foreground">
                    {r.transitDaysToEurope ? `${r.transitDaysToEurope}d (EU)` : r.transitDaysToUs ? `${r.transitDaysToUs}d (US)` : 'Custom'}
                  </span>
                ),
              },
              { key: 'freightForwarder', header: 'Forwarder Partners', cell: (r) => <span className="text-xs text-muted-foreground">{r.freightForwarder}</span> },
            ]}
            data={ports.data ?? []}
            isLoading={ports.isLoading}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

/* ===================================================== MasterMachines ===== */
export { MasterMachines, MasterYarnLots } from './legacyMasters'
