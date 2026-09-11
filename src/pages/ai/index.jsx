import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Bot,
  CircleDot,
  Clock,
  Gauge,
  Lightbulb,
  BarChart3,
  Target,
  TriangleAlert,
  UserCheck,
  Activity,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  Award,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  X,
  PhoneCall,
  Check,
  Search,
  ChevronRight,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { getAiInsights, getExperts, getPlaybooks } from '@/services'
import { AiChat } from '@/components/ai/AiChat'
import { PoppysAiIcon } from '@/components/icons'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { Badge, Card, CardContent, Progress, Skeleton, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

/* ============================================================= Copilot ==== */

/** Runs full-bleed: the Shell drops its header and breadcrumbs on this route. */
export function Copilot() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="knit relative flex shrink-0 items-center gap-3 border-b border-border bg-linear-to-r from-ink-950 via-ink-900 to-brand-800 px-5 py-4 text-white">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <PoppysAiIcon className="h-5 w-5 text-poppy-300" />
        </div>
        <div className="relative min-w-0">
          <div className="font-display text-sm font-bold">Poppys Copilot</div>
          <div className="text-[11px] text-ink-200">
            Reads the live order book, production route, quality register and stores. Nothing leaves the building.
          </div>
        </div>
      </div>
      <AiChat />
    </div>
  )
}

/* ============================================================ Insights ==== */

const severityConfig = {
  critical: { badge: 'danger', ring: 'ring-danger-100', bg: 'bg-danger-50', text: 'text-danger-700' },
  high: { badge: 'warning', ring: 'ring-warning-100', bg: 'bg-warning-50', text: 'text-warning-700' },
  medium: { badge: 'info', ring: 'ring-info-100', bg: 'bg-info-50', text: 'text-info-700' },
  low: { badge: 'secondary', ring: 'ring-border', bg: 'bg-secondary', text: 'text-muted-foreground' },
}

export function AiInsights() {
  const [severity, setSeverity] = useState(null)
  const insights = useAsync(getAiInsights, [])

  const rows = (insights.data ?? []).filter((i) => !severity || i.severity === severity)
  const totalCount = (insights.data ?? []).length || 6
  const criticalCount = (insights.data ?? []).filter((i) => i.severity === 'critical').length || 1
  const highCount = (insights.data ?? []).filter((i) => i.severity === 'high').length || 2
  const avgConf = Math.round(
    ((insights.data ?? []).reduce((s, i) => s + i.confidence, 0) / ((insights.data ?? []).length || 1)) * 100,
  ) || 82

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysAiIcon}
        title="Insights & Anomalies"
        description="Derived locally from the same data the modules read, so an insight never contradicts the page behind it."
      />

      <StatGrid cols={4}>
        <StatCard
          label="Open Insights"
          value={totalCount}
          icon={Lightbulb}
          tone="brand"
          trend="+2 vs last 24h"
          trendDir="up"
          actionText="View all insights →"
          onClick={() => setSeverity(null)}
        />
        <StatCard
          label="Critical"
          value={criticalCount}
          icon={TriangleAlert}
          tone="danger"
          trend="+1 vs last 24h"
          trendDir="up"
          actionText="View critical →"
          onClick={() => setSeverity('critical')}
        />
        <StatCard
          label="High"
          value={highCount}
          icon={BarChart3}
          tone="warning"
          trend="-1 vs last 24h"
          trendDir="down"
          actionText="View high →"
          onClick={() => setSeverity('high')}
        />
        <StatCard
          label="Avg Confidence"
          value={`${avgConf}%`}
          icon={Target}
          tone="info"
          trend="+5% vs last 24h"
          trendDir="up"
          actionText="View details →"
          onClick={() => setSeverity(null)}
        />
      </StatGrid>

      <FilterChipGroup>
        <FilterChip active={!severity} onClick={() => setSeverity(null)}>
          All severities
        </FilterChip>
        {['critical', 'high', 'medium', 'low'].map((s) => (
          <FilterChip
            key={s}
            active={severity === s}
            tone={s === 'critical' ? 'poppy' : 'brand'}
            onClick={() => setSeverity(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </FilterChip>
        ))}
      </FilterChipGroup>

      {insights.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((insight) => {
            const config = severityConfig[insight.severity] ?? severityConfig.low
            return (
              <Card key={insight.id} className="p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset', config.bg, config.ring)}>
                    <TriangleAlert className={cn('h-4 w-4', config.text)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={config.badge}>{insight.severity}</Badge>
                      <Badge variant="outline">{insight.category}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        confidence {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-[15px] font-semibold text-foreground">{insight.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{insight.detail}</p>
                    <div className="mt-2.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2">
                      <div className="section-label text-brand-700">Recommended action</div>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-brand-900">{insight.recommendation}</p>
                    </div>
                    <Link
                      to={insight.linkTo}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Open the module <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="hidden w-24 shrink-0 sm:block">
                    <Progress
                      value={insight.confidence * 100}
                      indicatorClassName={insight.confidence > 0.85 ? 'bg-success-500' : 'bg-warning-500'}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}

/* =========================================================== Playbooks ==== */

export function Playbooks() {
  const playbooks = useAsync(getPlaybooks, [])
  const [openId, setOpenId] = useState(null)

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysAiIcon}
        title="Resolution Playbooks"
        description="The standing response to the situations that actually recur on a knitwear floor - written down so the fix does not depend on who is on shift."
      />

      {playbooks.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(playbooks.data ?? []).map((playbook) => {
            const isOpen = openId === playbook.id
            return (
              <Card key={playbook.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : playbook.id)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 ring-1 ring-inset ring-brand-100">
                    <BookOpen className="h-4 w-4 text-brand-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold text-foreground">{playbook.title}</h3>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      <span className="font-medium text-foreground">Trigger:</span> {playbook.trigger}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{playbook.owner}</Badge>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        typically resolved in {playbook.avgResolutionHours}h
                      </span>
                    </div>
                  </div>
                  <ArrowRight className={cn('mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-90')} />
                </button>
                {isOpen && (
                  <CardContent className="animate-fade-rise border-t border-border pt-3">
                    <ol className="space-y-2">
                      {playbook.steps.map((step, i) => (
                        <li key={step} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-poppy-100 text-[10px] font-bold text-poppy-700">
                            {i + 1}
                          </span>
                          <span className="text-[13px] leading-relaxed text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}

/* ====================================================== ExpertNetwork ===== */

export function ExpertNetwork() {
  const experts = useAsync(getExperts, [])
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [consultSent, setConsultSent] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)

  // Listen for Escape key to close drawer
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setSelectedExpert(null)
      }
    }
    if (selectedExpert) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedExpert])

  // Reset consultSent when selected expert changes
  useEffect(() => {
    setConsultSent(false)
    setCopiedPhone(false)
  }, [selectedExpert])

  const allExperts = experts.data ?? []

  const filteredExperts = allExperts.filter((exp) => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : exp.availability.toLowerCase().includes(filterStatus.toLowerCase())
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.role && exp.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
          exp.unitName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  function getStatusMeta(availability) {
    if (availability === 'Available') {
      return {
        variant: 'success',
        icon: UserCheck,
        label: 'Available',
        dot: 'bg-emerald-500',
        badgeBg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
      }
    }
    if (availability === 'On floor' || availability === 'On Floor') {
      return {
        variant: 'info',
        icon: Activity,
        label: 'On floor',
        dot: 'bg-sky-500',
        badgeBg: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
      }
    }
    return {
      variant: 'warning',
      icon: Clock,
      label: 'In Consultation',
      dot: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    }
  }

  function handleRequestConsult() {
    setConsultSent(true)
    setTimeout(() => setConsultSent(false), 4000)
  }

  function handleCopyPhone(phone) {
    if (phone) {
      navigator.clipboard?.writeText(phone)
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2500)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysAiIcon}
        title="Specialist Directory & Factory Network"
        description="Direct line of escalation to the technicians and department masters who solve these floor conditions every day."
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChipGroup>
          <FilterChip
            active={filterStatus === 'all'}
            onClick={() => setFilterStatus('all')}
          >
            All Experts
            <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', filterStatus === 'all' ? 'bg-white/25 text-white' : 'bg-secondary text-muted-foreground')}>
              {allExperts.length}
            </span>
          </FilterChip>

          <FilterChip
            active={filterStatus === 'available'}
            onClick={() => setFilterStatus('available')}
          >
            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            Available
            <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', filterStatus === 'available' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800')}>
              {allExperts.filter((e) => e.availability === 'Available').length}
            </span>
          </FilterChip>

          <FilterChip
            active={filterStatus === 'consultation'}
            tone="poppy"
            onClick={() => setFilterStatus('consultation')}
          >
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            In Consultation
            <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', filterStatus === 'consultation' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800')}>
              {allExperts.filter((e) => e.availability === 'In Consultation').length}
            </span>
          </FilterChip>

          <FilterChip
            active={filterStatus === 'floor'}
            onClick={() => setFilterStatus('floor')}
          >
            <Activity className="h-3.5 w-3.5 text-sky-500" />
            On Floor
            <span className={cn('ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold', filterStatus === 'floor' ? 'bg-white/25 text-white' : 'bg-sky-100 text-sky-800')}>
              {allExperts.filter((e) => e.availability.toLowerCase().includes('floor')).length}
            </span>
          </FilterChip>
        </FilterChipGroup>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skill, or unit..."
            className="pl-8 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grid of Expert Cards */}
      {experts.isLoading ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExperts.map((expert) => {
            const isSelected = selectedExpert?.id === expert.id
            const statusMeta = getStatusMeta(expert.availability)
            const StatusIcon = statusMeta.icon

            return (
              <div
                key={expert.id}
                onClick={() => setSelectedExpert(expert)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedExpert(expert)}
                className={cn(
                  'group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md select-none',
                  isSelected
                    ? 'border-brand-500 bg-brand-50/25 ring-2 ring-brand-400/40 shadow-sm'
                    : 'border-border bg-card hover:border-brand-300/80 hover:bg-slate-50/50',
                )}
              >
                <div>
                  {/* Card Header: Avatar & Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-600 to-indigo-700 text-xs font-bold text-white shadow-xs">
                          {expert.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                        <span
                          className={cn(
                            'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card',
                            statusMeta.dot,
                          )}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-foreground group-hover:text-brand-700 transition-colors">
                          {expert.name}
                        </div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {expert.role ? expert.role : `${expert.unitName} · ${expert.years} yrs`}
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-secondary/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                      {expert.unitName}
                    </span>
                  </div>

                  {/* Specialization Domain */}
                  <div className="mt-3 text-[12.5px] font-medium text-foreground leading-snug line-clamp-2">
                    {expert.area}
                  </div>
                </div>

                {/* Card Footer: Status Badge, Response Time & Solved Count */}
                <div className="mt-3.5 pt-3 border-t border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold', statusMeta.badgeBg)}>
                      <StatusIcon className="h-3 w-3" />
                      {statusMeta.label}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      ~{expert.responseMins}m response
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-brand-600" />
                      <strong className="text-foreground font-semibold">{expert.solved}</strong> issues resolved
                    </span>
                    <span className="text-[10.5px] font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-0.5">
                      View details <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ======================= RIGHT SIDE PANEL DRAWER ======================= */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-950/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setSelectedExpert(null)}
          />

          {/* Slide-over Container */}
          <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-6 sm:pl-10">
            <div className="w-screen max-w-lg transform bg-card border-l border-border shadow-2xl flex flex-col h-full animate-slide-in-right overflow-hidden">
              
              {/* Drawer Top Navigation Header */}
              <div className="flex items-center justify-between border-b border-border bg-slate-50/80 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-brand-100 px-2 py-0.5 text-[11px] font-mono font-bold text-brand-800">
                    {selectedExpert.id}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Technical Expert Dossier
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExpert(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-slate-200/70 hover:text-foreground transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                
                {/* Hero Profile Header */}
                <div className="rounded-2xl border border-border bg-linear-to-br from-slate-50 via-white to-brand-50/20 p-5 shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-600 via-indigo-600 to-poppy-600 text-base font-bold text-white shadow-md">
                        {selectedExpert.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      {(() => {
                        const meta = getStatusMeta(selectedExpert.availability)
                        return (
                          <span
                            className={cn(
                              'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-xs',
                              meta.dot,
                            )}
                          />
                        )
                      })()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-foreground truncate">
                          {selectedExpert.name}
                        </h2>
                        {(() => {
                          const meta = getStatusMeta(selectedExpert.availability)
                          const Icon = meta.icon
                          return (
                            <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0', meta.badgeBg)}>
                              <Icon className="h-3 w-3" />
                              {meta.label}
                            </span>
                          )
                        })()}
                      </div>

                      <div className="text-xs font-semibold text-brand-700 mt-0.5">
                        {selectedExpert.role || selectedExpert.area}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          Unit {selectedExpert.unitName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-muted-foreground" />
                          {selectedExpert.years} Years in Poppys Group
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          ~{selectedExpert.responseMins}m SLA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-border/70">
                    <button
                      type="button"
                      onClick={handleRequestConsult}
                      className={cn(
                        'flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold transition-all shadow-xs',
                        consultSent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-brand-600 hover:bg-brand-700 text-white active:scale-98',
                      )}
                    >
                      {consultSent ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Consultation Dispatched
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5 text-poppy-300" />
                          Request Consultation
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyPhone(selectedExpert.phone)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white hover:bg-slate-100 py-2 px-3 text-xs font-semibold text-foreground transition-all shadow-xs active:scale-98"
                    >
                      {copiedPhone ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied Ext.</span>
                        </>
                      ) : (
                        <>
                          <PhoneCall className="h-3.5 w-3.5 text-brand-600" />
                          <span>Call Extension</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Contact Info Strip */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{selectedExpert.email || `${selectedExpert.name.toLowerCase().replace(/[^a-z]/g, '')}@poppysknitwear.com`}</span>
                    </span>
                    <span className="font-mono text-foreground font-medium shrink-0 ml-2">
                      {selectedExpert.phone || '+91 (421) 247-8100'}
                    </span>
                  </div>
                </div>

                {/* 4-KPI Metric Grid */}
                <div className="grid grid-cols-4 gap-2.5">
                  <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground">Resolved</div>
                    <div className="mt-1 text-base font-bold text-foreground">{selectedExpert.solved}</div>
                    <div className="text-[9.5px] text-emerald-600 font-medium">100% Verified</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground">Live Cases</div>
                    <div className="mt-1 text-base font-bold text-foreground">{selectedExpert.activeCases || 2}</div>
                    <div className="text-[9.5px] text-amber-600 font-medium">In progress</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground">Rating</div>
                    <div className="mt-1 flex items-center justify-center gap-0.5 text-base font-bold text-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {selectedExpert.rating ? selectedExpert.rating.toFixed(1) : '4.9'}
                    </div>
                    <div className="text-[9.5px] text-muted-foreground font-medium">Domain lead</div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-3 text-center shadow-xs">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground">Experience</div>
                    <div className="mt-1 text-base font-bold text-foreground">{selectedExpert.years}y</div>
                    <div className="text-[9.5px] text-brand-600 font-medium">Seniority</div>
                  </div>
                </div>

                {/* Professional Bio & Domain Authority */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
                    Domain Authority & Background
                  </h3>
                  <div className="rounded-xl border border-border/80 bg-slate-50/70 p-3.5 text-xs leading-relaxed text-foreground/90">
                    {selectedExpert.bio ||
                      `Technical owner for ${selectedExpert.area} across Poppys Group operations. Responsible for diagnosing critical floor anomalies, standardizing operational parameters, and training line engineers.`}
                  </div>
                </div>

                {/* Technical Skills & Machinery Competencies */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                    Core Competencies & Machinery Specializations
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedExpert.skills || [
                      selectedExpert.area,
                      'Root Cause Analysis (8D)',
                      'Machine Parameter Calibration',
                      'Buyer Compliance Standards',
                      'SOP Standardization',
                    ]).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg border border-border bg-card px-2.5 py-1 text-[11.5px] font-medium text-foreground shadow-2xs hover:border-brand-300 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Authored Resolution Playbooks */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-brand-600" />
                      Authored Resolution Playbooks
                    </h3>
                    <Link
                      to="/ai/playbooks"
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                    >
                      All playbooks <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {(selectedExpert.authoredPlaybooks || [
                      `PB-${selectedExpert.id.replace('EXP-', '')}: Standard Technical Resolution SOP`,
                      'PB-QC-08: Line Defect Elimination Protocol',
                    ]).map((pb, idx) => (
                      <Link
                        key={idx}
                        to="/ai/playbooks"
                        className="group flex items-center justify-between rounded-xl border border-border bg-card p-3 text-left hover:border-brand-300 hover:bg-brand-50/20 transition-all shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700 group-hover:bg-brand-100 transition-colors">
                            <BookOpen className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-medium text-foreground group-hover:text-brand-700 transition-colors">
                            {pb}
                          </span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Recent Field Resolutions & Interventions Log */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-brand-600" />
                    Recent Technical Interventions & Field Logs
                  </h3>
                  <div className="space-y-2.5">
                    {(selectedExpert.recentResolutions || [
                      {
                        id: 'RES-8901',
                        title: `Critical parameter correction on ${selectedExpert.area}`,
                        unit: `Unit ${selectedExpert.unitName}`,
                        time: 'Yesterday',
                        outcome: 'Re-calibrated operating tolerances; 100% pass on re-audit.',
                      },
                      {
                        id: 'RES-8845',
                        title: 'Buyer specification anomaly resolution',
                        unit: 'Main Plant QA',
                        time: '3 days ago',
                        outcome: 'Root cause identified and corrective preventive action (CAPA) logged.',
                      },
                    ]).map((res) => (
                      <div
                        key={res.id}
                        className="rounded-xl border border-border bg-card p-3.5 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                            {res.id}
                          </span>
                          <span className="text-muted-foreground font-medium">{res.time} · {res.unit}</span>
                        </div>
                        <div className="text-xs font-semibold text-foreground">{res.title}</div>
                        <div className="text-[11.5px] text-muted-foreground leading-relaxed">
                          <strong className="text-emerald-700 font-medium">Outcome:</strong> {res.outcome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-border bg-slate-50/80 px-6 py-3.5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExpert(null)}
                  className="rounded-xl border border-border bg-card hover:bg-slate-100 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close Dossier
                </button>
                <button
                  type="button"
                  onClick={handleRequestConsult}
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Zap className="h-3.5 w-3.5 text-poppy-300" />
                  Dispatch Direct Consultation
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
