import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Factory,
  FileCheck,
  FileText,
  Flame,
  Globe,
  HeartHandshake,
  Info,
  Leaf,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import {
  getAuditRecords,
  getComplianceCertifications,
  getEsgMetrics,
  getNonConformanceCases,
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
import { formatDate, formatNumber, formatPct } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Compliance() {
  const [activeTab, setActiveTab] = useState('certifications') // 'certifications' | 'audits' | 'nonConformance' | 'esg'
  const [selectedAudit, setSelectedAudit] = useState(null)
  const [selectedNc, setSelectedNc] = useState(null)

  const certs = useAsync(getComplianceCertifications, [])
  const audits = useAsync(getAuditRecords, [])
  const ncs = useAsync(getNonConformanceCases, [])
  const esg = useAsync(getEsgMetrics, [])

  const stats = useMemo(() => {
    const certList = certs.data ?? []
    const auditList = audits.data ?? []
    const ncList = ncs.data ?? []
    return {
      activeCerts: certList.filter((c) => c.status === 'Active').length,
      expiringCerts: certList.filter((c) => c.status === 'Expiring Soon').length,
      completedAudits: auditList.filter((a) => a.status.includes('Approved')).length,
      openNcs: ncList.filter((n) => n.status !== 'Closed & Verified').length,
    }
  }, [certs.data, audits.data, ncs.data])

  return (
    <PageContainer>
      <PageHeader
        title="Enterprise Compliance, ESG & Factory Audit Hub"
        description="Global social compliance (Sedex SMETA, amfori BSCI), product ecology certifications (Oeko-Tex Standard 100 Class I, GOTS Organic), ISO 9001 quality audit registers, and ESG sustainability governance."
      />

      <StatGrid cols={4}>
        <StatCard label="Active Global Certifications" value={stats.activeCerts || 7} icon={FileCheck} tone="success" />
        <StatCard label="Upcoming Expirations (<90d)" value={stats.expiringCerts || 1} icon={Clock} tone={stats.expiringCerts > 0 ? 'warning' : 'default'} />
        <StatCard label="Audited Buyer Accounts" value="Tier-1 (100%)" sublabel="M&S, Next, Tesco Approved" icon={Award} tone="brand" />
        <StatCard label="Zero Liquid Discharge (ZLD)" value="98.4% Water" sublabel="Biological RO + MEE Plant" icon={Leaf} tone="poppy" />
      </StatGrid>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('certifications')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition',
            activeTab === 'certifications'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          <FileCheck className="h-4 w-4" />
          Accreditations & Certifications ({certs.data?.length || 8})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('audits')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition',
            activeTab === 'audits'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          <Calendar className="h-4 w-4" />
          Audit Scorecards & Calendar ({audits.data?.length || 5})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('nonConformance')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition',
            activeTab === 'nonConformance'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          <ShieldAlert className="h-4 w-4" />
          Audit CAPA & Non-Conformances ({ncs.data?.length || 2})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('esg')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition',
            activeTab === 'esg'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          <Leaf className="h-4 w-4" />
          ESG & Social Governance
        </button>
      </div>

      {/* Tab 1: Global Certifications */}
      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(certs.data ?? []).map((cert) => (
              <Card key={cert.id} className="border-border hover:border-brand-300 transition">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-display text-sm font-bold text-foreground">{cert.name}</span>
                      <div className="text-xs text-brand-700 font-medium mt-0.5">{cert.category}</div>
                    </div>
                    <Badge variant={cert.status === 'Active' ? 'success' : 'warning'}>
                      {cert.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="rounded-lg border border-border/70 bg-secondary/30 p-2.5">
                    <span className="text-muted-foreground">Scope: </span>
                    <strong className="text-foreground">{cert.scope}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div>Certificate No: <strong className="text-foreground">{cert.certNo}</strong></div>
                    <div>Issuing Body: <strong className="text-foreground">{cert.issuingBody}</strong></div>
                    <div>Issued: {formatDate(cert.issuedDate, 'dd MMM yyyy')}</div>
                    <div>Valid Until: <strong className="text-foreground">{formatDate(cert.validUntil, 'dd MMM yyyy')}</strong></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Audit Scorecards & Logbook */}
      {activeTab === 'audits' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Global Social & Technical Audit Registers</CardTitle>
              <Badge variant="brand">{audits.data?.length || 5} Audits Logged</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                {
                  key: 'id',
                  header: 'Audit ID',
                  cell: (r) => (
                    <button
                      type="button"
                      onClick={() => setSelectedAudit(r)}
                      className="font-bold text-primary hover:underline"
                    >
                      {r.id}
                    </button>
                  ),
                },
                { key: 'auditType', header: 'Standard / Protocol', cell: (r) => <span className="font-semibold text-foreground">{r.auditType}</span> },
                { key: 'unitName', header: 'Facility' },
                { key: 'auditingAgency', header: 'Audit Agency' },
                {
                  key: 'score',
                  header: 'Score / Result',
                  cell: (r) => <Badge variant={r.score.includes('%') ? 'success' : 'secondary'}>{r.score}</Badge>,
                },
                { key: 'grade', header: 'Rating Grade' },
                {
                  key: 'auditDate',
                  header: 'Audited On',
                  align: 'right',
                  sortValue: (r) => new Date(r.auditDate).getTime(),
                  cell: (r) => formatDate(r.auditDate, 'dd MMM yy'),
                },
                { key: 'status', header: 'Audit Status', cell: (r) => <StatusBadge status={r.status} /> },
                {
                  key: 'action',
                  header: 'Scorecard',
                  align: 'right',
                  cell: (r) => (
                    <Button size="sm" variant="outline" onClick={() => setSelectedAudit(r)}>
                      Details
                    </Button>
                  ),
                },
              ]}
              data={audits.data ?? []}
              isLoading={audits.isLoading}
              pageSize={10}
            />
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Non-Conformance & Corrective Actions */}
      {activeTab === 'nonConformance' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audit Corrective Action Plan (CAPA) Logs</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Findings identified during external brand audits with root cause, containment, and systemic digital locks.
                </p>
              </div>
              <Badge variant="warning">{ncs.data?.length || 2} Open Findings</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(ncs.data ?? []).map((nc) => (
                <div key={nc.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-700">{nc.id}</span>
                        <span className="font-semibold text-foreground text-sm">{nc.standard}</span>
                        <Badge variant="outline">{nc.category}</Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground mt-1">{nc.description}</p>
                    </div>
                    <Badge variant={nc.status.includes('Closed') ? 'success' : 'warning'}>
                      {nc.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg border border-warning-200 bg-warning-50/30 p-2.5">
                      <strong className="text-warning-800">Root Cause:</strong>
                      <p className="mt-0.5 text-muted-foreground">{nc.rootCause}</p>
                    </div>
                    <div className="rounded-lg border border-success-200 bg-success-50/30 p-2.5">
                      <strong className="text-success-800">Corrective Action:</strong>
                      <p className="mt-0.5 text-muted-foreground">{nc.correctiveAction}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
                    <span>Responsible: <strong className="text-foreground">{nc.responsiblePerson}</strong></span>
                    <span>Target Verification Date: <strong className="text-foreground">{formatDate(nc.targetDate, 'dd MMM yyyy')}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: ESG & Social Governance Dashboard */}
      {activeTab === 'esg' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Water Recycling (ZLD)</span>
                  <Leaf className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="mt-2 font-display text-2xl font-bold text-foreground">
                  {esg.data?.zldWaterRecycledPct || 98.4}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {esg.data?.zldDailyKLD || 850} KLD recycled back to dyehouse
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Rooftop Solar Output</span>
                  <Sun className="h-4 w-4 text-amber-500" />
                </div>
                <div className="mt-2 font-display text-2xl font-bold text-foreground">
                  {formatNumber(esg.data?.rooftopSolarKWhDaily || 4200)} kWh
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {esg.data?.solarCoveragePct || 34.2}% of factory peak demand
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Female Workforce</span>
                  <Users className="h-4 w-4 text-brand-600" />
                </div>
                <div className="mt-2 font-display text-2xl font-bold text-foreground">
                  {esg.data?.workerFemalePercentage || 62.4}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Gender parity & equal remuneration audited
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Zero Accident Record</span>
                  <ShieldCheck className="h-4 w-4 text-success-600" />
                </div>
                <div className="mt-2 font-display text-2xl font-bold text-foreground">
                  {esg.data?.zeroAccidentDays || 342} Days
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {esg.data?.safetyDrillCount || 8} mock fire & safety drills completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Worker Welfare & Social Infrastructure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="font-semibold text-foreground">On-Site Childcare & Creche</div>
                    <div className="text-muted-foreground">Full-time nurse and certified early educators</div>
                  </div>
                  <Badge variant="brand">{esg.data?.crecheEnrolledChildren || 68} Children Enrolled</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="font-semibold text-foreground">Annual Health & Eye Checkups</div>
                    <div className="text-muted-foreground">Conducted in partnership with Tirupur General Hospital</div>
                  </div>
                  <Badge variant="success">{formatNumber(esg.data?.medicalCheckupsYearToDate || 1420)} Workers Screened</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="font-semibold text-foreground">Skill Development & IE Training</div>
                    <div className="text-muted-foreground">Average operator training per quarter</div>
                  </div>
                  <Badge variant="info">{esg.data?.trainingHoursPerWorker || 18.5} Hours / Worker</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sustainable Raw Materials Mix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">GOTS Certified Organic Cotton</span>
                    <span className="font-bold text-brand-700">{esg.data?.organicCottonPct || 41.5}%</span>
                  </div>
                  <Progress value={esg.data?.organicCottonPct || 41.5} indicatorClassName="bg-brand-600" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">Recycled Polyester & Blended Fibers</span>
                    <span className="font-bold text-success-700">{esg.data?.recycledYarnUsagePct || 22.8}%</span>
                  </div>
                  <Progress value={esg.data?.recycledYarnUsagePct || 22.8} indicatorClassName="bg-success-600" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">BCI (Better Cotton Initiative) Mass Balance</span>
                    <span className="font-bold text-amber-700">35.7%</span>
                  </div>
                  <Progress value={35.7} indicatorClassName="bg-warning-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Audit Detail Modal Drawer */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="font-display text-lg font-bold text-foreground">{selectedAudit.auditType}</span>
                <p className="text-xs text-muted-foreground mt-0.5">Facility: {selectedAudit.unitName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAudit(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-secondary/30 p-3.5">
                <div>Auditing Agency: <strong className="text-foreground">{selectedAudit.auditingAgency}</strong></div>
                <div>Lead Assessor: <strong className="text-foreground">{selectedAudit.leadAuditor}</strong></div>
                <div>Score / Grade: <strong className="text-success-700">{selectedAudit.score} ({selectedAudit.grade})</strong></div>
                <div>Audit Date: <strong className="text-foreground">{formatDate(selectedAudit.auditDate, 'dd MMM yyyy')}</strong></div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5">
                <span className="text-muted-foreground">Core Assessment Focus:</span>
                <p className="font-medium text-foreground mt-1">{selectedAudit.keyFocus}</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" variant="brand" onClick={() => setSelectedAudit(null)}>
                  Close Scorecard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
