import { useMemo, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  Factory,
  Filter,
  Flame,
  HelpCircle,
  History,
  Info,
  Layers,
  Percent,
  Play,
  RefreshCw,
  Search,
  Scissors,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Shirt,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Wrench,
  Zap,
} from 'lucide-react'

import { PoppysPlanningIcon, PoppysProductionIcon } from '@/components/icons'
import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import {
  getCapacityHierarchy,
  getSewingLineMatrix,
  getCommercialWorkOrders,
  getPlanningAuditTrail,
  getDownstreamGateCheck,
  simulateProductionAdjustment,
  commitProductionAdjustment,
} from '@/services'
import { PageContainer, PageHeader, StatCard, StatGrid, FilterChip, FilterChipGroup } from '@/components/common'
import { DataTable, MiniBar, RiskBadge, StatusBadge } from '@/components/tables'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Modal,
  Skeleton,
} from '@/components/ui'
import { formatDate, formatInrCompact, formatNumber, formatPct } from '@/lib/format'
import { cn } from '@/lib/utils'

/* ==========================================================================
   PRODUCTION ORDERS & CAPACITY ALLOCATION (ENTERPRISE DECISION ENGINE)
========================================================================== */

export function ProductionOrders() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Query params
  const targetStyleParam = searchParams.get('style') || '26AW-W-1042'
  const actionParam = searchParams.get('action') || 'increase'
  const sourceParam = searchParams.get('source') || 'demand-intelligence'
  const categoryParam = searchParams.get('category') || 'women'

  // Local state
  const [activeTab, setActiveTab] = useState('allocation') // 'allocation' | 'workOrders' | 'auditTrail'
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [lineFilter, setLineFilter] = useState('all') // 'all' | 'available' | 'recommended' | 'overloaded'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStyleCode, setSelectedStyleCode] = useState(targetStyleParam)
  const [activeWorkOrderStatus, setActiveWorkOrderStatus] = useState(null)
  const [showExplanationModal, setShowExplanationModal] = useState(null)
  const [selectedWorkOrderDetail, setSelectedWorkOrderDetail] = useState(null)

  // Simulation & Modal state
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationData, setSimulationData] = useState(null)
  const [selectedLineForSim, setSelectedLineForSim] = useState('L-05')
  const [additionalQtyForSim, setAdditionalQtyForSim] = useState(1500)
  const [simulationStep, setSimulationStep] = useState(1) // 1: Simulate, 2: Review Downstream, 3: Committed
  const [isCommitting, setIsCommitting] = useState(false)
  const [commitSuccess, setCommitSuccess] = useState(false)

  // Queries
  const capacityQuery = useAsync(() => getCapacityHierarchy(), [])
  const linesQuery = useAsync(
    () => getSewingLineMatrix({ unitId: selectedUnit, targetStyle: selectedStyleCode }),
    [selectedUnit, selectedStyleCode, commitSuccess],
  )
  const workOrdersQuery = useAsync(
    () =>
      getCommercialWorkOrders({
        styleCode: searchQuery ? null : null,
        unitId: selectedUnit,
        status: activeWorkOrderStatus,
        search: searchQuery,
      }),
    [selectedUnit, activeWorkOrderStatus, searchQuery, commitSuccess],
  )
  const auditQuery = useAsync(() => getPlanningAuditTrail(), [commitSuccess])

  const hierarchy = capacityQuery.data || {
    installedCapacityPcs: 150000,
    availableCapacityPcs: 28500,
    allocatableCapacityPcs: 21200,
    units: [],
  }

  const lines = linesQuery.data || []
  const workOrders = workOrdersQuery.data || []
  const auditLogs = auditQuery.data || []

  // Filter lines by status / recommendation
  const filteredLines = useMemo(() => {
    let result = lines
    if (lineFilter === 'available') {
      result = result.filter((l) => l.loadPct < 60)
    } else if (lineFilter === 'recommended') {
      result = result.filter((l) => l.compatibility?.score >= 80)
    } else if (lineFilter === 'overloaded') {
      result = result.filter((l) => l.loadPct >= 90)
    }
    return result
  }, [lines, lineFilter])

  // Top recommended line
  const topRecommendedLine = useMemo(() => {
    const sorted = [...lines].sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0))
    return sorted.find((l) => l.compatibility?.score >= 80) || sorted[0]
  }, [lines])

  // Open simulation modal
  const handleOpenSimulation = async (lineId = 'L-05', qty = 1500) => {
    setSelectedLineForSim(lineId)
    setAdditionalQtyForSim(qty)
    setSimulationStep(1)
    setIsSimulating(true)
    const result = await simulateProductionAdjustment({
      styleCode: selectedStyleCode,
      additionalQty: qty,
      targetLineId: lineId,
    })
    setSimulationData(result)
  }

  // Commit adjustment
  const handleCommitAdjustment = async () => {
    setIsCommitting(true)
    await commitProductionAdjustment({
      styleCode: selectedStyleCode,
      styleName: 'Floral Printed Tiered Midi Dress',
      buyer: 'Next Retail UK',
      additionalQty: additionalQtyForSim,
      targetLineNo: simulationData?.assignedLine?.lineNo || 'Line 05',
      unitId: simulationData?.assignedLine?.unitId || 'unit-1',
      unitName: simulationData?.assignedLine?.unitName || 'Unit 1',
      action: 'Line Reallocation & Batch Scale-Up',
      trigger: 'AI Commercial Demand Signal (+42% Breakout)',
    })
    setIsCommitting(false)
    setSimulationStep(3)
    setCommitSuccess((prev) => !prev)
  }

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysPlanningIcon}
        title="Production Planning & Capacity Allocation"
        description="Transform commercial demand signals into feasible shop-floor line loading across 36 sewing lines and 3 garment units."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-xs"
          >
            ← Back to Executive Dashboard
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => handleOpenSimulation('L-05', 1500)}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Simulate Allocation
          </Button>
        </div>
      </PageHeader>

      {/* =========================================================================
          1. DEMAND INTELLIGENCE DIRECTIVE BANNER (Why am I seeing this?)
      ========================================================================= */}
      {selectedStyleCode && (
        <Card className="border-brand-500/40 bg-linear-to-r from-card via-card to-brand-500/10 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              {/* Left Column: Style & Demand Signal */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand" className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
                    🔥 Breakout Demand Signal
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {selectedStyleCode}
                  </span>
                  <span className="text-xs text-muted-foreground">· Floral Printed Tiered Midi Dress (Women's Wear)</span>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    +42% Growth
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 pt-1">
                  <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
                    <div className="text-[10px] font-medium uppercase text-muted-foreground">Market Demand</div>
                    <div className="text-sm font-bold text-foreground">82,000 <span className="text-[10px] font-normal text-muted-foreground">pcs</span></div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
                    <div className="text-[10px] font-medium uppercase text-muted-foreground">Current Production</div>
                    <div className="text-sm font-bold text-brand-600 dark:text-brand-400">70,000 <span className="text-[10px] font-normal text-muted-foreground">pcs</span></div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
                    <div className="text-[10px] font-medium uppercase text-muted-foreground">Net Gap</div>
                    <div className="text-sm font-bold text-danger-600 dark:text-danger-400">-12,000 <span className="text-[10px] font-normal text-muted-foreground">Shortage</span></div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/60 p-2.5">
                    <div className="text-[10px] font-medium uppercase text-muted-foreground">Coverage</div>
                    <div className="text-sm font-bold text-amber-600">85% <span className="text-[10px] font-normal text-muted-foreground">(Under)</span></div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-brand-500/10 p-2.5">
                    <div className="text-[10px] font-medium uppercase text-brand-700 dark:text-brand-300">Action Directive</div>
                    <div className="text-sm font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" /> INCREASE
                    </div>
                  </div>
                </div>

                {/* Commercial Context / Why Am I Seeing This? */}
                <div className="rounded-lg bg-secondary/40 p-2 text-xs text-muted-foreground flex items-start gap-2 mt-2">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground font-semibold">Why this style is prioritized:</strong> Commercial sales velocity (+42% YoY, ₹18.4L revenue) has created a -12,000 pcs category shortage. Next UK & M&S online inventory is running low with high sell-through rate (86%). Capacity allocation required.
                  </div>
                </div>
              </div>

              {/* Right Column: CTA Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 justify-center">
                <Button
                  size="sm"
                  variant="brand"
                  onClick={() => handleOpenSimulation(topRecommendedLine?.id || 'L-05', 1500)}
                  className="gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <Zap className="h-3.5 w-3.5" />
                  ⚡ Fast-Track Line Reallocation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveTab('workOrders')}
                  className="text-xs gap-1.5"
                >
                  <Layers className="h-3.5 w-3.5" />
                  View Child Work Orders
                </Button>
                {targetStyleParam && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchParams({})
                      setSelectedStyleCode(null)
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground h-7"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========================================================================
          2. THREE-TIER CAPACITY HIERARCHY OVERVIEW
      ========================================================================= */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Installed Capacity</span>
              <span className="rounded-md bg-secondary p-1.5 text-muted-foreground">
                <Factory className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              {formatNumber(hierarchy.installedCapacityPcs)} <span className="text-xs font-normal text-muted-foreground">pcs/mo</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              <span>36 Total Sewing Lines across 3 Units</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Capacity</span>
              <span className="rounded-md bg-emerald-500/10 p-1.5 text-emerald-600">
                <CalendarRange className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatNumber(hierarchy.availableCapacityPcs)} <span className="text-xs font-normal text-muted-foreground">pcs (19.0% open)</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Nominal open slots across idle lines & shifts
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Allocatable Headroom</span>
              <span className="rounded-md bg-brand-500/10 p-1.5 text-brand-600">
                <Zap className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
              {formatNumber(hierarchy.allocatableCapacityPcs)} <span className="text-xs font-normal text-muted-foreground">pcs</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Factoring PM maintenance & 2.5h changeovers
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Factory Load</span>
              <span className="rounded-md bg-amber-500/10 p-1.5 text-amber-600">
                <Activity className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold text-foreground">
              81.0% <span className="text-xs font-normal text-muted-foreground">Balanced</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px]">
              <span className="text-muted-foreground">U1: <strong className="text-foreground">82%</strong></span>
              <span className="text-muted-foreground">U2: <strong className="text-foreground">74%</strong></span>
              <span className="text-muted-foreground">U3: <strong className="text-foreground">91%</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          3. NAVIGATION TABS (Allocation Matrix | Work Orders | Audit Trail)
      ========================================================================= */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('allocation')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5',
              activeTab === 'allocation'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <Factory className="h-3.5 w-3.5" />
            36-Line Capacity Matrix & Compatibility
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workOrders')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5',
              activeTab === 'workOrders'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Work Order Book ({workOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('auditTrail')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5',
              activeTab === 'auditTrail'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
          >
            <History className="h-3.5 w-3.5" />
            Planning Audit Trail ({auditLogs.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Unit:</span>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground cursor-pointer focus:outline-hidden"
          >
            <option value="all">All Units (36 Lines)</option>
            <option value="unit-1">Unit 1 - Tirupur (18 Lines)</option>
            <option value="unit-2">Unit 2 - Avinashi (12 Lines)</option>
            <option value="unit-3">Unit 3 - Palladam (6 Lines)</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: 36-LINE CAPACITY MATRIX & STYLE-LINE COMPATIBILITY (HEART OF THE PAGE)
      ========================================================================= */}
      {activeTab === 'allocation' && (
        <div className="space-y-4">
          {/* Top Recommended Allocation Proposal Strip */}
          {selectedStyleCode && topRecommendedLine && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 font-bold">
                  💡
                </span>
                <div>
                  <span className="font-bold text-foreground">
                    Recommended Allocation Strategy for {selectedStyleCode}:
                  </span>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Allocate <strong className="text-foreground">{topRecommendedLine.unitName} / {topRecommendedLine.lineNo}</strong> ({topRecommendedLine.compatibility?.score}% Match, {topRecommendedLine.loadPct}% Load) for <strong className="text-foreground">1,500 pcs</strong>. Completion on <strong className="text-foreground">18 Sep</strong> without overtime.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="brand"
                onClick={() => handleOpenSimulation(topRecommendedLine.id, 1500)}
                className="shrink-0 text-xs gap-1 shadow-2xs"
              >
                Accept & Simulate →
              </Button>
            </div>
          )}

          {/* Line Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip active={lineFilter === 'all'} onClick={() => setLineFilter('all')}>
                All Lines ({lines.length})
              </FilterChip>
              <FilterChip active={lineFilter === 'available'} onClick={() => setLineFilter('available')}>
                🟢 Available / Open Slots (&lt;60% load)
              </FilterChip>
              <FilterChip active={lineFilter === 'recommended'} onClick={() => setLineFilter('recommended')}>
                ⭐ Recommended for {selectedStyleCode} (&gt;80% match)
              </FilterChip>
              <FilterChip active={lineFilter === 'overloaded'} onClick={() => setLineFilter('overloaded')}>
                🔴 Overloaded (&gt;90% load)
              </FilterChip>
            </div>

            <div className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{filteredLines.length}</strong> of 36 Sewing Lines
            </div>
          </div>

          {/* Line Matrix Grid */}
          {linesQuery.isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLines.map((line) => {
                const isSelected = selectedLineForSim === line.id
                const comp = line.compatibility

                return (
                  <Card
                    key={line.id}
                    className={cn(
                      'transition-all duration-200 hover:shadow-md border cursor-pointer flex flex-col justify-between',
                      comp?.score >= 85
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : comp?.score >= 70
                        ? 'border-brand-500/40 bg-card'
                        : 'border-border/70 bg-card',
                      isSelected && 'ring-2 ring-brand-500 shadow-md',
                    )}
                    onClick={() => handleOpenSimulation(line.id, 1500)}
                  >
                    <CardHeader className="pb-2 pt-3 px-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground font-mono">{line.lineNo}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {line.unitName}
                          </Badge>
                        </div>

                        {/* Compatibility Badge */}
                        {comp && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowExplanationModal(line)
                            }}
                            className="inline-flex items-center gap-1 hover:opacity-80 cursor-pointer"
                          >
                            <Badge
                              variant={
                                comp.score >= 85
                                  ? 'success'
                                  : comp.score >= 70
                                  ? 'warning'
                                  : 'danger'
                              }
                              className="text-[10px] font-bold px-2 py-0.5"
                            >
                              {comp.score}% Match
                            </Badge>
                          </button>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {line.activeStyle} · <span className="font-medium text-foreground">{line.activeBuyer}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="px-3.5 pb-3 space-y-2.5 text-xs">
                      {/* Load Progress Track */}
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">Floor Load</span>
                          <span
                            className={cn(
                              'font-bold',
                              line.loadPct > 90
                                ? 'text-danger-600'
                                : line.loadPct < 60
                                ? 'text-emerald-600'
                                : 'text-foreground',
                            )}
                          >
                            {line.loadPct}%
                          </span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              line.loadPct > 90
                                ? 'bg-danger-500'
                                : line.loadPct < 60
                                ? 'bg-emerald-500'
                                : 'bg-brand-500',
                            )}
                            style={{ width: `${Math.max(line.loadPct, 6)}%` }}
                          />
                        </div>
                      </div>

                      {/* Line Attributes */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] border-t border-border/50 pt-2 text-muted-foreground">
                        <div>
                          Efficiency: <strong className="text-foreground">{line.efficiencyPct}%</strong>
                        </div>
                        <div>
                          Skill: <strong className="text-foreground">{line.operatorSkillGrade}</strong>
                        </div>
                        <div>
                          Daily Cap: <strong className="text-foreground">{line.dailyCapacityPcs} pcs</strong>
                        </div>
                        <div>
                          Changeover: <strong className="text-foreground">{line.changeoverWindowHours}h</strong>
                        </div>
                      </div>

                      {/* Explainable Rationale Snippet */}
                      {comp && (
                        <div className="rounded-lg bg-background/80 p-1.5 text-[10px] text-muted-foreground border border-border/40">
                          <div className="font-semibold text-foreground flex items-center justify-between">
                            <span>Fit: {comp.tier}</span>
                            <span className="text-primary text-[9px] hover:underline">Why? ℹ️</span>
                          </div>
                          <p className="mt-0.5 line-clamp-2">{comp.rationale}</p>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        size="sm"
                        variant={comp?.score >= 80 ? 'brand' : 'outline'}
                        className="w-full text-xs h-7 gap-1 mt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenSimulation(line.id, 1500)
                        }}
                      >
                        <Zap className="h-3 w-3" />
                        {comp?.score >= 80 ? 'Select Line for Scale-Up' : 'Simulate Line Loading'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CLEAN, SCANNABLE WORK ORDER BOOK (COMMERCIAL DEMAND SIGNALS)
      ========================================================================= */}
      {activeTab === 'workOrders' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Production Work Orders</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Live work order schedule connected to commercial buyer demand signals.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search WO #, Style, Buyer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 rounded-lg border border-border bg-background pl-8 pr-3 text-xs text-foreground focus:outline-hidden"
                  />
                </div>

                <FilterChipGroup>
                  <FilterChip active={!activeWorkOrderStatus} onClick={() => setActiveWorkOrderStatus(null)}>
                    All
                  </FilterChip>
                  <FilterChip active={activeWorkOrderStatus === 'In Progress'} onClick={() => setActiveWorkOrderStatus('In Progress')}>
                    In Progress
                  </FilterChip>
                  <FilterChip active={activeWorkOrderStatus === 'Released'} onClick={() => setActiveWorkOrderStatus('Released')}>
                    Released
                  </FilterChip>
                  <FilterChip active={activeWorkOrderStatus === 'On Hold'} onClick={() => setActiveWorkOrderStatus('On Hold')}>
                    On Hold
                  </FilterChip>
                </FilterChipGroup>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={[
                {
                  key: 'woNo',
                  header: 'WO #',
                  cell: (r) => (
                    <div>
                      <span className="font-mono font-bold text-foreground">{r.woNo}</span>
                      <div className="text-[10px] text-muted-foreground">{r.orderNo}</div>
                    </div>
                  ),
                },
                {
                  key: 'buyerName',
                  header: 'Buyer & Category',
                  cell: (r) => (
                    <div>
                      <span className="font-semibold text-foreground">{r.buyerName}</span>
                      <div className="text-[10px] text-muted-foreground">{r.category}</div>
                    </div>
                  ),
                },
                {
                  key: 'styleCode',
                  header: 'Style Code',
                  cell: (r) => (
                    <div>
                      <span className="font-mono font-bold text-primary">{r.styleCode}</span>
                      <div className="text-[10px] text-muted-foreground truncate max-w-40">{r.styleName}</div>
                    </div>
                  ),
                },
                {
                  key: 'demandSignal',
                  header: 'Demand Signal',
                  cell: (r) => (
                    <Badge
                      variant={
                        r.demandSignal === 'Breakout'
                          ? 'brand'
                          : r.demandSignal === 'Stable'
                          ? 'success'
                          : 'danger'
                      }
                      className="text-[10px] px-2 py-0.5 font-bold"
                    >
                      {r.demandSignalEmoji} {r.demandSignal}
                    </Badge>
                  ),
                },
                {
                  key: 'plannedQty',
                  header: 'Planned',
                  align: 'right',
                  cell: (r) => (
                    <span className="font-mono font-bold text-foreground">
                      {formatNumber(r.plannedQty)} <span className="text-[10px] font-normal text-muted-foreground">pcs</span>
                    </span>
                  ),
                },
                {
                  key: 'actualOutput',
                  header: 'Output / Done',
                  align: 'right',
                  cell: (r) => (
                    <span className="font-mono text-foreground">
                      {formatNumber(r.actualOutput)}
                    </span>
                  ),
                },
                {
                  key: 'lineNo',
                  header: 'Line & Unit',
                  cell: (r) => (
                    <div>
                      <span className="font-medium text-foreground">{r.lineNo}</span>
                      <div className="text-[10px] text-muted-foreground">{r.unitName}</div>
                    </div>
                  ),
                },
                {
                  key: 'currentStage',
                  header: 'Current Stage',
                  cell: (r) => <Badge variant="outline" className="text-[10px]">{r.currentStage}</Badge>,
                },
                {
                  key: 'dueDate',
                  header: 'Target Date',
                  align: 'right',
                  cell: (r) => formatDate(r.dueDate, 'dd MMM'),
                },
                {
                  key: 'status',
                  header: 'Status',
                  cell: (r) => <StatusBadge status={r.status} />,
                },
                {
                  key: 'risk',
                  header: 'Risk',
                  cell: (r) => <RiskBadge risk={r.risk} />,
                },
                {
                  key: 'actions',
                  header: 'Action',
                  align: 'right',
                  cell: (r) => (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenSimulation('L-05', 1500)}
                      className="h-7 px-2 text-[10px]"
                    >
                      Adjust Line →
                    </Button>
                  ),
                },
              ]}
              data={workOrders}
              isLoading={workOrdersQuery.isLoading}
              pageSize={10}
            />
          </CardContent>
        </Card>
      )}

      {/* =========================================================================
          TAB 3: PLANNING AUDIT TRAIL LOGS
      ========================================================================= */}
      {activeTab === 'auditTrail' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Capacity Allocation Audit Trail</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified governance log of line reallocations, batch size adjustments, and AI commercial demand responses.
            </p>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 space-y-1 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{log.action}</span>
                      <Badge variant="brand" className="text-[10px] px-1.5 py-0 font-mono">
                        {log.styleCode}
                      </Badge>
                      <span className="text-muted-foreground">· {log.styleName} ({log.buyer})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">
                        ✓ {log.status}
                      </Badge>
                      <span className="text-muted-foreground font-mono text-[11px]">{log.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-foreground">{log.changeDetails}</p>
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>
                      Trigger: <strong className="text-primary font-medium">{log.trigger}</strong>
                    </span>
                    <span>
                      Logged by: <strong className="text-foreground font-semibold">{log.loggedBy}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* =========================================================================
          EXPLAINABLE STYLE-LINE COMPATIBILITY MODAL
      ========================================================================= */}
      {showExplanationModal && (
        <Modal
          open={!!showExplanationModal}
          onClose={() => setShowExplanationModal(null)}
          title={`Line Compatibility Breakdown: ${showExplanationModal.lineNo}`}
          className="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <p className="text-xs text-muted-foreground">
              Algorithmic fit analysis for style <strong className="text-foreground">{selectedStyleCode}</strong>.
            </p>

            <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-3">
              <div>
                <span className="text-muted-foreground block text-[11px]">Overall Fit Score</span>
                <span className="text-lg font-bold text-foreground">
                  {showExplanationModal.compatibility?.score}% · {showExplanationModal.compatibility?.tier}
                </span>
              </div>
              <Badge
                variant={
                  showExplanationModal.compatibility?.score >= 85
                    ? 'success'
                    : showExplanationModal.compatibility?.score >= 70
                    ? 'warning'
                    : 'danger'
                }
                className="px-2.5 py-1 text-xs"
              >
                {showExplanationModal.compatibility?.tier}
              </Badge>
            </div>

            {/* 4 Scoring Factor Progress Bars */}
            <div className="space-y-2 border-t border-border pt-2">
              <div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Machine Fleet Capability</span>
                  <strong className="text-foreground">{showExplanationModal.compatibility?.reasons?.machineFleetMatch}%</strong>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${showExplanationModal.compatibility?.reasons?.machineFleetMatch}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">SMV Alignment (14.2 min benchmark)</span>
                  <strong className="text-foreground">{showExplanationModal.compatibility?.reasons?.smvAlignment}%</strong>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${showExplanationModal.compatibility?.reasons?.smvAlignment}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Operator Skill Grade (Tiered Dress Gathering)</span>
                  <strong className="text-foreground">{showExplanationModal.compatibility?.reasons?.operatorSkillMatrix}%</strong>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-brand-500"
                    style={{ width: `${showExplanationModal.compatibility?.reasons?.operatorSkillMatrix}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Changeover Penalty ({showExplanationModal.changeoverWindowHours}h window)</span>
                  <strong className="text-foreground">{showExplanationModal.compatibility?.reasons?.changeoverPenalty}%</strong>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${showExplanationModal.compatibility?.reasons?.changeoverPenalty}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/30 p-2.5 text-[11px] text-muted-foreground">
              <strong className="text-foreground">AI Engineering Note:</strong> {showExplanationModal.compatibility?.rationale}
            </div>

            <div className="pt-2">
              <Button
                variant="brand"
                size="sm"
                onClick={() => {
                  const lineId = showExplanationModal.id
                  setShowExplanationModal(null)
                  handleOpenSimulation(lineId, 1500)
                }}
                className="w-full text-xs"
              >
                Simulate Allocation on this Line →
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          PLANNING IMPACT & 3-STEP SIMULATION MODAL (PRE-COMMIT BOUNDARY)
      ========================================================================= */}
      {isSimulating && (
        <Modal
          open={isSimulating}
          onClose={() => setIsSimulating(false)}
          title={`Planning Impact & Simulation: ${selectedStyleCode}`}
          className="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <p className="text-xs text-muted-foreground">
              Pre-commit governance verification: calculate capacity, schedule impact, and downstream bottleneck feasibility before updating the shop floor.
            </p>

            {/* Stepper Wizard Indicator */}
            <div className="flex items-center justify-between border-y border-border py-2 text-xs">
              <div className={cn('flex items-center gap-1.5 font-semibold', simulationStep >= 1 ? 'text-primary' : 'text-muted-foreground')}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px]">1</span>
                <span>Simulate & Impact</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <div className={cn('flex items-center gap-1.5 font-semibold', simulationStep >= 2 ? 'text-primary' : 'text-muted-foreground')}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px]">2</span>
                <span>Downstream Gate Check</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <div className={cn('flex items-center gap-1.5 font-semibold', simulationStep === 3 ? 'text-emerald-600' : 'text-muted-foreground')}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[11px]">3</span>
                <span>Committed</span>
              </div>
            </div>

            {/* STEP 1: SIDE-BY-SIDE IMPACT COMPARISON */}
            {simulationStep === 1 && simulationData && (
              <div className="space-y-3 py-1 text-xs">
                <div className="rounded-xl border border-border/80 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-muted-foreground">
                        <th className="py-2 pl-3 font-semibold text-foreground">Decision Metric</th>
                        <th className="py-2 text-right font-semibold text-foreground">Current Plan</th>
                        <th className="py-2 text-right font-semibold text-foreground">Proposed Scaled Plan</th>
                        <th className="py-2 pr-3 text-right font-semibold text-primary">Delta / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      <tr>
                        <td className="py-2 pl-3 font-medium text-foreground">Planned Batch Quantity</td>
                        <td className="py-2 text-right text-muted-foreground font-mono">2,500 pcs</td>
                        <td className="py-2 text-right font-mono font-bold text-foreground">4,000 pcs</td>
                        <td className="py-2 pr-3 text-right font-bold text-emerald-600">+1,500 pcs (+60%)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pl-3 font-medium text-foreground">Assigned Sewing Lines</td>
                        <td className="py-2 text-right text-muted-foreground">Line 04 (Unit 1)</td>
                        <td className="py-2 text-right font-bold text-foreground">Line 04 + Line 05</td>
                        <td className="py-2 pr-3 text-right text-emerald-600 font-semibold">✓ 94% Compatibility</td>
                      </tr>
                      <tr>
                        <td className="py-2 pl-3 font-medium text-foreground">Unit 1 Floor Utilization</td>
                        <td className="py-2 text-right text-muted-foreground font-mono">82%</td>
                        <td className="py-2 text-right font-mono font-bold text-foreground">91%</td>
                        <td className="py-2 pr-3 text-right text-amber-600 font-semibold">+9% (Safe Buffer)</td>
                      </tr>
                      <tr>
                        <td className="py-2 pl-3 font-medium text-foreground">Target Completion Date</td>
                        <td className="py-2 text-right text-muted-foreground">18 Sep 2026</td>
                        <td className="py-2 text-right font-bold text-foreground">15 Sep 2026</td>
                        <td className="py-2 pr-3 text-right text-emerald-600 font-semibold">⚡ 3 Days Faster</td>
                      </tr>
                      <tr>
                        <td className="py-2 pl-3 font-medium text-foreground">Greige Fabric Lot Status</td>
                        <td className="py-2 text-right text-muted-foreground font-mono">3,200 kg</td>
                        <td className="py-2 text-right font-mono font-bold text-foreground">4,800 kg Req.</td>
                        <td className="py-2 pr-3 text-right font-bold text-emerald-600">✓ 4,800 kg In Stock</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Capacity and fabric availability verified. Proceed to downstream gate check.</span>
                  </div>
                  <Badge variant="success" className="text-[10px]">Confidence: 96%</Badge>
                </div>
              </div>
            )}

            {/* STEP 2: DOWNSTREAM BOTTLENECK VALIDATION */}
            {simulationStep === 2 && simulationData && (
              <div className="space-y-3 py-1 text-xs">
                <p className="text-muted-foreground text-xs">
                  Full manufacturing route feasibility check across preparatory and finishing departments:
                </p>

                <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card">
                  {simulationData.downstreamGates.map((gate) => (
                    <div key={gate.gateId} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                            gate.status === 'pass'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600',
                          )}
                        >
                          {gate.status === 'pass' ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                        </span>
                        <div>
                          <span className="font-semibold text-foreground">{gate.stage}</span>
                          <p className="text-[11px] text-muted-foreground">{gate.notes}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant={gate.status === 'pass' ? 'success' : 'warning'}
                          className="text-[10px] px-2 py-0.5 font-bold"
                        >
                          {gate.statusLabel} ({gate.metric})
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-secondary/40 p-2.5 text-[11px] text-muted-foreground">
                  <strong className="text-foreground">Governance Audit Note:</strong> Clicking "Confirm & Apply Allocation" will create supplementary Work Order <strong className="text-foreground font-mono">WO-1042-B</strong> and log your user ID to the permanent factory audit trail.
                </div>
              </div>
            )}

            {/* STEP 3: COMMITTED SUCCESS STATE */}
            {simulationStep === 3 && (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-base font-bold text-foreground">Capacity Allocation Successfully Committed!</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Line 05 in Unit 1 has been officially loaded for style <strong className="text-foreground">{selectedStyleCode}</strong> (+1,500 pcs). Work order schedule, cutting releases, and audit logs have been updated.
                </p>
                <div className="inline-flex rounded-lg border border-border bg-secondary/30 p-2 text-xs font-mono text-muted-foreground">
                  Logged: Yuvan K · AUD-902 · 11 Sep 2026
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-3">
              {simulationStep === 1 && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsSimulating(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button variant="brand" size="sm" onClick={() => setSimulationStep(2)} className="text-xs gap-1">
                    Proceed to Downstream Gate Check →
                  </Button>
                </>
              )}

              {simulationStep === 2 && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setSimulationStep(1)} className="text-xs">
                    ← Back to Metrics
                  </Button>
                  <Button
                    variant="brand"
                    size="sm"
                    onClick={handleCommitAdjustment}
                    disabled={isCommitting}
                    className="text-xs gap-1 shadow-sm font-semibold"
                  >
                    {isCommitting ? 'Committing...' : '✓ Confirm & Apply Allocation'}
                  </Button>
                </>
              )}

              {simulationStep === 3 && (
                <Button
                  variant="brand"
                  size="sm"
                  onClick={() => {
                    setIsSimulating(false)
                    setActiveTab('workOrders')
                  }}
                  className="w-full text-xs"
                >
                  View Updated Work Order Book →
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  )
}

/* ==========================================================================
   CAPACITY PLANNING COMPONENT (AGGREGATED 12-WEEK PROJECTIONS)
========================================================================== */

export function CapacityPlanning() {
  const { unitId } = useAppStore()
  const hierarchyQuery = useAsync(() => getCapacityHierarchy(), [])
  const linesQuery = useAsync(() => getSewingLineMatrix({ unitId }), [unitId])

  const hierarchy = hierarchyQuery.data || {
    installedCapacityPcs: 150000,
    availableCapacityPcs: 28500,
    allocatableCapacityPcs: 21200,
    units: [],
  }

  const lines = linesQuery.data || []

  return (
    <PageContainer>
      <PageHeader
        icon={PoppysProductionIcon}
        title="Capacity Planning"
        description="Twelve-week rolling sewing capacity across the 36 lines in Unit 1, Unit 2, and Unit 3."
      />

      <StatGrid cols={4}>
        <StatCard
          label="Installed capacity"
          value={formatNumber(hierarchy.installedCapacityPcs)}
          sublabel="pcs/month"
          icon={Factory}
          tone="brand"
        />
        <StatCard
          label="Available capacity"
          value={formatNumber(hierarchy.availableCapacityPcs)}
          sublabel="19% open headroom"
          icon={CalendarRange}
          tone="success"
        />
        <StatCard
          label="Allocatable capacity"
          value={formatNumber(hierarchy.allocatableCapacityPcs)}
          sublabel="after PM & changeovers"
          icon={Zap}
          tone="info"
        />
        <StatCard
          label="Total sewing lines"
          value="36 Lines"
          sublabel="Unit 1 (18) · Unit 2 (12) · Unit 3 (6)"
          icon={Layers}
          tone="poppy"
        />
      </StatGrid>

      {/* Per-Unit Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {hierarchy.units.map((unit) => (
          <Card key={unit.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{unit.name}</span>
              <Badge variant={unit.loadPct > 85 ? 'warning' : 'success'} className="text-[10px]">
                {unit.loadPct}% Load
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{unit.specialty}</p>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Installed:</span>
                <strong className="text-foreground">{formatNumber(unit.installedPcs)} pcs ({unit.totalLines} lines)</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Booked Output:</span>
                <strong className="text-foreground">{formatNumber(unit.bookedPcs)} pcs</strong>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Allocatable Open:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{formatNumber(unit.allocatablePcs)} pcs</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
              <Link to={`/planning/production-orders?unit=${unit.id}`} className="text-primary font-medium hover:underline flex items-center gap-1">
                View Lines in Production Planning →
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
