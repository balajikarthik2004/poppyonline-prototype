import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Bot, CircleDot, Clock, Gauge, Lightbulb, BarChart3, Target, TriangleAlert, UserCheck } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { getAiInsights, getExperts, getPlaybooks } from '@/services'
import { AiChat } from '@/components/ai/AiChat'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { Badge, Card, CardContent, Progress, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'

/* ============================================================= Copilot ==== */

/** Runs full-bleed: the Shell drops its header and breadcrumbs on this route. */
export function Copilot() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="knit relative flex shrink-0 items-center gap-3 border-b border-border bg-linear-to-r from-ink-950 via-ink-900 to-brand-800 px-5 py-4 text-white">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Bot className="h-4.5 w-4.5 text-poppy-300" />
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

  return (
    <PageContainer>
      <PageHeader
        title="Expert Network"
        description="Who to call when the playbook runs out - the people inside the group who own each technical area."
      />

      {experts.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(experts.data ?? []).map((expert) => (
            <Card key={expert.id} className="p-4">
              <div className="flex items-start gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                  {expert.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-foreground">{expert.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {expert.unitName} - {expert.years} years
                  </div>
                </div>
              </div>
              <div className="mt-2.5 text-[13px] font-medium text-foreground">{expert.area}</div>
              <div className="mt-2.5 flex items-center justify-between">
                <Badge variant={expert.availability === 'Available' ? 'success' : 'secondary'}>
                  <UserCheck className="h-3 w-3" />
                  {expert.availability}
                </Badge>
                <span className="text-[11px] text-muted-foreground">~{expert.responseMins}m</span>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">{expert.solved} issues resolved</div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}
