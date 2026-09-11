import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Eye,
  Factory,
  FileCheck,
  FileText,
  Filter,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  Leaf,
  Mail,
  Network,
  Phone,
  Radio,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import {
  getRoles,
  getPermissionMatrix,
  updatePermission,
  getAuditLogs,
  getSystemHealth,
  getCompanyProfile,
  logSystemAuditEvent,
} from '@/services'
import { useAppStore, userRoleTitles } from '@/store/appStore'
import { PERSONAS, personaByKey } from '@/lib/admin/roleLogic'
import { ENTERPRISE_MODULES } from '@/lib/admin/permissionLogic'
import { AUDIT_ACTIONS } from '@/lib/admin/auditLogic'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, InfoBanner, SectionLabel, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, StatusBadge } from '@/components/tables'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Modal, Select } from '@/components/ui'
import { formatDate, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PoppysAdminIcon } from '@/components/icons'

export function Administration() {
  const { userRole, setUserRole, canAccess } = useAppStore()
  const [activeTab, setActiveTab] = useState('rbac') // 'rbac' | 'audit' | 'company' | 'health'
  const [selectedRoleForMatrix, setSelectedRoleForMatrix] = useState('MD')
  const [auditActionFilter, setAuditActionFilter] = useState('all')
  const [auditModuleFilter, setAuditModuleFilter] = useState('all')
  const [auditSearch, setAuditSearch] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Data fetching
  const rolesData = useAsync(getRoles, [])
  const permData = useAsync(getPermissionMatrix, [refreshTrigger])
  const auditData = useAsync(
    () => getAuditLogs({ action: auditActionFilter, module: auditModuleFilter, search: auditSearch }),
    [auditActionFilter, auditModuleFilter, auditSearch, refreshTrigger],
  )
  const healthData = useAsync(getSystemHealth, [refreshTrigger])
  const companyData = useAsync(getCompanyProfile, [])

  const currentPersona = personaByKey.get(userRole) || PERSONAS[0]
  const matrix = permData.data?.matrix || {}

  const handleSwitchPersona = async (newRole) => {
    setUserRole(newRole)
    const persona = personaByKey.get(newRole)
    await logSystemAuditEvent({
      user: persona.name,
      role: newRole,
      action: 'Persona Switched',
      entity: `Session Identity -> ${persona.title}`,
      entityType: 'User Session',
      module: 'admin',
      oldStatus: userRole,
      newStatus: newRole,
      details: `Active user context switched to ${persona.title} (${persona.name})`,
    })
    setRefreshTrigger((c) => c + 1)
  }

  const handleTogglePermission = async (role, moduleKey, action) => {
    if (!canAccess('admin', 'edit')) return
    const currentVal = matrix[role]?.[moduleKey]?.[action]
    await updatePermission(role, moduleKey, action, !currentVal)
    setRefreshTrigger((c) => c + 1)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Enterprise Administration & Governance"
        description="Unified governance plane: Persona switching, 14-module RBAC permissions, immutable audit logs, multi-unit plant directory, and system health telemetry."
        icon={PoppysAdminIcon}
      >
        <div className="flex items-center gap-2">
          <Badge variant={currentPersona.tone === 'brand' ? 'brand' : currentPersona.tone === 'poppy' ? 'poppy' : 'info'} className="px-3 py-1 text-xs">
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            Active: {currentPersona.title}
          </Badge>
        </div>
      </PageHeader>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === 'rbac' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('rbac')}
          className="gap-2 text-xs"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Persona & RBAC Matrix
        </Button>
        <Button
          variant={activeTab === 'audit' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('audit')}
          className="gap-2 text-xs"
        >
          <FileText className="h-3.5 w-3.5" />
          Audit Trail Journal ({(auditData.data ?? []).length})
        </Button>
        <Button
          variant={activeTab === 'company' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('company')}
          className="gap-2 text-xs"
        >
          <Building2 className="h-3.5 w-3.5" />
          Corporate & Multi-Unit Directory
        </Button>
        <Button
          variant={activeTab === 'health' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('health')}
          className="gap-2 text-xs"
        >
          <Activity className="h-3.5 w-3.5" />
          System Health Telemetry
        </Button>
      </div>

      {/* ======================================================== TAB 1: RBAC ======================================================== */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* Persona Switcher Deck */}
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Operational Persona Profiles</h3>
                <p className="text-xs text-muted-foreground">
                  Switch persona to simulate access control, view scopes, and approval authorities across the system
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Local Policy Engine (Replaceable for Phase 7 SSO/JWT)
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PERSONAS.map((p) => {
                const isActive = userRole === p.key
                return (
                  <div
                    key={p.key}
                    onClick={() => handleSwitchPersona(p.key)}
                    className={cn(
                      'group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/20',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge
                          variant={p.key === 'MD' ? 'brand' : p.key === 'GM' ? 'poppy' : p.key === 'QA' ? 'success' : 'outline'}
                          className="text-[10px]"
                        >
                          {p.badge}
                        </Badge>
                        <h4 className="mt-1.5 text-sm font-bold text-foreground">{p.title}</h4>
                        <div className="text-xs font-medium text-muted-foreground">{p.name}</div>
                      </div>
                      {isActive ? (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="text-[11px] font-medium text-muted-foreground group-hover:text-primary">
                          Switch →
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {p.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <span className="truncate">Scope: {p.scope}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 14-Module Permission Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Enterprise Permission Matrix (14 Modules)</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Action guards: View (V), Edit (E), Approve (A), and Audit (Au) across every functional area
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Inspecting Role:</span>
                  <FilterChipGroup>
                    {PERSONAS.map((p) => (
                      <FilterChip
                        key={p.key}
                        active={selectedRoleForMatrix === p.key}
                        onClick={() => setSelectedRoleForMatrix(p.key)}
                      >
                        {p.key}
                      </FilterChip>
                    ))}
                  </FilterChipGroup>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                      <th className="py-2.5 pl-3 font-semibold text-foreground">Module</th>
                      <th className="py-2.5 font-semibold text-foreground">Route</th>
                      <th className="py-2.5 text-center font-semibold text-foreground">View (V)</th>
                      <th className="py-2.5 text-center font-semibold text-foreground">Edit (E)</th>
                      <th className="py-2.5 text-center font-semibold text-foreground">Approve (A)</th>
                      <th className="py-2.5 text-center font-semibold text-foreground">Audit (Au)</th>
                      <th className="py-2.5 pr-3 text-right font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ENTERPRISE_MODULES.map((mod) => {
                      const perms = matrix[selectedRoleForMatrix]?.[mod.key] || { view: false, edit: false, approve: false, audit: false }
                      return (
                        <tr key={mod.key} className="transition-colors hover:bg-secondary/20">
                          <td className="py-2.5 pl-3 font-medium text-foreground">{mod.label}</td>
                          <td className="py-2.5 font-mono text-[11px] text-muted-foreground">{mod.path}</td>

                          {/* View */}
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(selectedRoleForMatrix, mod.key, 'view')}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded transition-colors',
                                perms.view ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-secondary/50 text-muted-foreground/40',
                              )}
                            >
                              {perms.view ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          </td>

                          {/* Edit */}
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(selectedRoleForMatrix, mod.key, 'edit')}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded transition-colors',
                                perms.edit ? 'bg-brand-500/10 text-brand-700 dark:text-brand-400' : 'bg-secondary/50 text-muted-foreground/40',
                              )}
                            >
                              {perms.edit ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          </td>

                          {/* Approve */}
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(selectedRoleForMatrix, mod.key, 'approve')}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded transition-colors',
                                perms.approve ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-secondary/50 text-muted-foreground/40',
                              )}
                            >
                              {perms.approve ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          </td>

                          {/* Audit */}
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePermission(selectedRoleForMatrix, mod.key, 'audit')}
                              className={cn(
                                'inline-flex h-6 w-6 items-center justify-center rounded transition-colors',
                                perms.audit ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400' : 'bg-secondary/50 text-muted-foreground/40',
                              )}
                            >
                              {perms.audit ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                            </button>
                          </td>

                          <td className="py-2.5 pr-3 text-right">
                            <Badge
                              variant={
                                perms.approve
                                  ? 'success'
                                  : perms.edit
                                  ? 'brand'
                                  : perms.view
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {perms.approve ? 'Full Approval' : perms.edit ? 'Read / Write' : perms.view ? 'Read Only' : 'Restricted'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== TAB 2: AUDIT ======================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <StatGrid cols={4}>
            <StatCard label="Audit Events Logged" value={(auditData.data ?? []).length} sublabel="Immutable records" icon={FileText} tone="brand" />
            <StatCard label="Approval Actions" value={(auditData.data ?? []).filter((a) => a.action === 'Approved').length} sublabel="Executive authorizations" icon={CheckCircle2} tone="success" />
            <StatCard label="Master / BOM Revisions" value={(auditData.data ?? []).filter((a) => a.action === 'BOM Revised' || a.module === 'master').length} sublabel="Version changes" icon={GitBranch} tone="poppy" />
            <StatCard label="Security & RBAC Events" value={(auditData.data ?? []).filter((a) => a.module === 'admin').length} sublabel="Policy & Persona" icon={KeyRound} tone="warning" />
          </StatGrid>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Structured Audit Event Stream</CardTitle>
                  <p className="text-xs text-muted-foreground">Immutable journal of approvals, updates, master changes, and persona switches</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-48">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      placeholder="Search entity, ID, user..."
                      className="h-8 pl-8 text-xs"
                    />
                  </div>

                  <Select
                    value={auditActionFilter}
                    onValueChange={setAuditActionFilter}
                    className="h-8 w-36 text-xs"
                    options={[
                      { value: 'all', label: 'All Actions' },
                      ...AUDIT_ACTIONS.map((a) => ({ value: a, label: a })),
                    ]}
                  />

                  <Select
                    value={auditModuleFilter}
                    onValueChange={setAuditModuleFilter}
                    className="h-8 w-36 text-xs"
                    options={[
                      { value: 'all', label: 'All Modules' },
                      ...ENTERPRISE_MODULES.map((m) => ({ value: m.key, label: m.label })),
                    ]}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    key: 'id',
                    header: 'Event ID',
                    cell: (r) => <span className="font-mono text-xs font-semibold text-primary">{r.id}</span>,
                  },
                  {
                    key: 'timestamp',
                    header: 'Timestamp',
                    cell: (r) => (
                      <div className="text-xs">
                        <div className="font-medium text-foreground">{formatDate(r.timestamp, 'dd MMM yy')}</div>
                        <div className="text-[10px] text-muted-foreground">{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'user',
                    header: 'User & Persona',
                    cell: (r) => (
                      <div>
                        <span className="font-semibold text-foreground">{r.user}</span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Badge variant="outline" className="h-4 px-1 text-[9px]">
                            {r.role}
                          </Badge>
                          <span>{r.ipAddress?.split(' ')[0]}</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'action',
                    header: 'Action',
                    cell: (r) => (
                      <Badge
                        variant={
                          r.action === 'Approved'
                            ? 'success'
                            : r.action === 'BOM Revised' || r.action === 'Permission Changed'
                            ? 'poppy'
                            : r.action === 'Created'
                            ? 'brand'
                            : 'secondary'
                        }
                      >
                        {r.action}
                      </Badge>
                    ),
                  },
                  {
                    key: 'entity',
                    header: 'Entity / Target',
                    cell: (r) => (
                      <div>
                        <span className="font-medium text-foreground">{r.entity}</span>
                        <div className="text-[11px] text-muted-foreground">{r.entityType}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'statusChange',
                    header: 'State Transition',
                    cell: (r) => (
                      <div className="text-xs">
                        <span className="line-through opacity-60">{r.oldStatus}</span>
                        <span className="mx-1 text-muted-foreground">→</span>
                        <span className="font-semibold text-foreground">{r.newStatus}</span>
                      </div>
                    ),
                  },
                  {
                    key: 'details',
                    header: 'Event Detail / Rationale',
                    cell: (r) => <span className="text-xs text-muted-foreground">{r.details}</span>,
                  },
                ]}
                data={auditData.data ?? []}
                isLoading={auditData.isLoading}
                pageSize={12}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================= TAB 3: COMPANY ====================================================== */}
      {activeTab === 'company' && (
        <div className="space-y-6">
          {companyData.isLoading || !companyData.data?.company ? (
            <StatGridSkeleton count={4} />
          ) : (
            <>
              <StatGrid cols={4}>
                <StatCard label="Established" value={companyData.data.company.establishedYear} sublabel="Tirupur, Tamil Nadu" icon={Building2} tone="brand" />
                <StatCard label="Employees" value={formatNumber(companyData.data.company.scale.employees)} sublabel="Manufacturing workforce" icon={Users} tone="info" />
                <StatCard label="Operating Units" value={companyData.data.units.length} sublabel="Integrated supply chain" icon={Factory} tone="poppy" />
                <StatCard label="Export Footprint" value={`${companyData.data.company.scale.exportCountries}+`} sublabel="Global destination markets" icon={Globe} tone="success" />
              </StatGrid>

              {/* Plant Hierarchy */}
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Unit Plant Architecture & Division Hierarchy</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Organizational breakdown across Greige Knitting, Garment Assembly, Screen Printing, and Wet Processing
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {companyData.data.units.map((unit) => (
                      <div key={unit.id} className="rounded-xl border border-border bg-secondary/30 p-4 transition-all hover:bg-secondary/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Factory className="h-4 w-4 text-primary" />
                            <span className="font-bold text-foreground">{unit.shortName}</span>
                          </div>
                          <Badge variant="brand">Unit {unit.id.replace('unit-', '')}</Badge>
                        </div>
                        <h4 className="mt-2 text-sm font-semibold text-foreground">{unit.name}</h4>
                        <div className="text-xs text-muted-foreground">{unit.location}</div>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{unit.focus}</p>

                        <div className="mt-3 space-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
                          {unit.sewingMachines > 0 && <div>Sewing Lines: <span className="font-medium text-foreground">{unit.sewingMachines} machines</span></div>}
                          {unit.dailyPieces > 0 && <div>Capacity: <span className="font-medium text-foreground">{formatNumber(unit.dailyPieces)} pcs/day</span></div>}
                          <div>Commissioned: <span className="font-medium text-foreground">{unit.commissionedYear}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Leadership & Published Capacities */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Leadership & Governance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {companyData.data.company.leadership.map((person) => (
                      <div key={person.name} className="rounded-lg border border-border bg-secondary/20 p-3">
                        <div className="font-semibold text-foreground">{person.name}</div>
                        <div className="text-xs font-medium text-poppy-600">{person.title}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{person.note}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Published Capacity Registry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {companyData.data.publishedCapacity.map((cap) => (
                      <div key={cap.department} className="rounded-lg border border-border bg-secondary/20 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{cap.department}</span>
                          <span className="font-bold text-primary">{cap.capacity}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{cap.machines}</div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{cap.detail}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* ======================================================== TAB 4: HEALTH ====================================================== */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <InfoBanner title="Deterministic Simulated Telemetry Provider">
            The operational telemetry below is generated by the Phase 6 prototype provider. In Phase 7, this will be swapped with direct Prometheus / OpenTelemetry telemetry and live PostgreSQL / Redis health streams.
          </InfoBanner>

          <StatGrid cols={4}>
            <StatCard label="Gateway Latency" value={`${healthData.data?.averageLatencyMs || 24} ms`} sublabel="p95 response latency" icon={Zap} tone="success" />
            <StatCard label="Uptime Record" value={`${healthData.data?.overallUptimePct || 99.98}%`} sublabel="30-day SLA performance" icon={ShieldCheck} tone="brand" />
            <StatCard label="Active Sessions" value={healthData.data?.activeUserSessions || 42} sublabel="Concurrent factory users" icon={Users} tone="info" />
            <StatCard label="Error Rate" value={`${healthData.data?.errorRatePct || 0.02}%`} sublabel="0.02% failed API calls" icon={Activity} tone="poppy" />
          </StatGrid>

          <Card>
            <CardHeader>
              <CardTitle>Microservice & Infrastructure Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {(healthData.data?.services ?? []).map((srv) => (
                  <div
                    key={srv.name}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Server className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{srv.name}</div>
                        <div className="text-[11px] text-muted-foreground">{srv.type} • {srv.cluster}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <div className="font-mono font-medium text-foreground">{srv.latencyMs} ms</div>
                        <div className="text-[10px] text-muted-foreground">{srv.uptimePct}% uptime</div>
                      </div>
                      <Badge variant="success" className="gap-1">
                        <Check className="h-3 w-3" />
                        {srv.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
