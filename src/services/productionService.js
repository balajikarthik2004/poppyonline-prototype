import { simulateDelay } from './delay'
import {
  buildBottleneckInsights,
  detailedSewingLines,
  multiTierCapacityData,
  processStages,
  productionHistory,
  productionOrders,
  publishedCapacity,
  sewingLines,
  stageByKey,
  stageMachineFleets,
} from '@/mock'
import { calculateCapacityUtilization } from '@/lib/capacity'

export async function getProductionOrders(filters = {}) {
  let result = productionOrders
  if (filters.status) {
    result = result.filter((o) => o.status === filters.status)
  }
  if (filters.unitId && filters.unitId !== 'all') {
    result = result.filter((o) => o.unitId === filters.unitId)
  }
  return simulateDelay(result)
}

export async function getMultiTierCapacity(unitId = null) {
  let result = multiTierCapacityData
  if (unitId && unitId !== 'all') {
    result = result.filter((c) => c.unitId === unitId)
  }
  const enriched = result.map((c) => {
    const util = calculateCapacityUtilization(c.actualOutput, c.plannedCapacity)
    return {
      ...c,
      utilizationPct: util.utilizationPct,
      balance: util.balance,
      loadStatus: util.status,
    }
  })
  return simulateDelay(enriched)
}

export async function getProcessStages() {
  return simulateDelay(processStages)
}

export async function getStageDetails(stageKey) {
  const stage = stageByKey[stageKey] || processStages[0]
  const capacityInfo = multiTierCapacityData.find((c) => c.stageKey === stageKey)
  const machines = stageMachineFleets[stageKey] || []
  return simulateDelay({
    ...stage,
    capacityInfo,
    machines,
  })
}

export async function getStageMachines(stageKey) {
  return simulateDelay(stageMachineFleets[stageKey] || [])
}

export async function getSewingLines(unitId = null) {
  let result = detailedSewingLines
  if (unitId && unitId !== 'all') {
    result = result.filter((l) => l.unitId === unitId)
  }
  return simulateDelay(result)
}

export async function getDetailedSewingLines(unitId = null) {
  let result = detailedSewingLines
  if (unitId && unitId !== 'all') {
    result = result.filter((l) => l.unitId === unitId)
  }
  return simulateDelay(result)
}

export async function getBottleneckInsights() {
  return simulateDelay(buildBottleneckInsights())
}

export async function getProductionHistory(days = 30) {
  return simulateDelay(productionHistory.slice(-days))
}

// ── ENTERPRISE CAPACITY PLANNING & ALLOCATION SERVICES ───────────────────
import {
  capacityHierarchy,
  sewingLines36,
  calculateLineCompatibility,
  downstreamGateCheck,
  initialAuditTrail,
  commercialWorkOrders,
} from '@/mock'

// Mutable audit trail store for session simulation
let dynamicAuditTrail = [...initialAuditTrail]
let dynamicWorkOrders = [...commercialWorkOrders]

export async function getCapacityHierarchy() {
  return simulateDelay(capacityHierarchy)
}

export async function getSewingLineMatrix(filters = {}) {
  const { unitId = 'all', targetStyle = null } = filters
  let lines = sewingLines36

  if (unitId && unitId !== 'all') {
    lines = lines.filter((l) => l.unitId === unitId)
  }

  const enriched = lines.map((line) => {
    const compatibility = targetStyle ? calculateLineCompatibility(targetStyle, line) : null
    return {
      ...line,
      compatibility,
    }
  })

  // If targetStyle is passed, sort by compatibility score descending
  if (targetStyle) {
    enriched.sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0))
  }

  return simulateDelay(enriched)
}

export async function getDownstreamGateCheck(styleCode = '26AW-W-1042') {
  return simulateDelay(downstreamGateCheck)
}

export async function getCommercialWorkOrders(filters = {}) {
  const { styleCode = null, unitId = 'all', status = null, search = '' } = filters
  let result = dynamicWorkOrders

  if (styleCode) {
    result = result.filter((w) => w.styleCode === styleCode || w.styleCode.toLowerCase().includes(styleCode.toLowerCase()))
  }
  if (unitId && unitId !== 'all') {
    result = result.filter((w) => w.unitId === unitId)
  }
  if (status && status !== 'all') {
    result = result.filter((w) => w.status === status)
  }
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(
      (w) =>
        w.woNo.toLowerCase().includes(q) ||
        w.styleCode.toLowerCase().includes(q) ||
        w.buyerName.toLowerCase().includes(q) ||
        w.styleName.toLowerCase().includes(q),
    )
  }

  return simulateDelay(result)
}

export async function getPlanningAuditTrail() {
  return simulateDelay(dynamicAuditTrail)
}

export async function simulateProductionAdjustment({
  styleCode = '26AW-W-1042',
  additionalQty = 1500,
  targetLineId = 'L-05',
}) {
  const targetLine = sewingLines36.find((l) => l.id === targetLineId) || sewingLines36[4]
  const compatibility = calculateLineCompatibility(styleCode, targetLine)

  return simulateDelay({
    styleCode,
    currentPlannedQty: 2500,
    proposedPlannedQty: 2500 + additionalQty,
    deltaQty: additionalQty,
    currentLines: ['Line 04 (Unit 1)'],
    proposedLines: ['Line 04 (Unit 1)', `${targetLine.lineNo} (${targetLine.unitName})`],
    assignedLine: targetLine,
    compatibility,
    currentFloorUtilizationPct: 82,
    proposedFloorUtilizationPct: 91,
    utilizationDeltaPct: 9,
    currentCompletionDate: '18 Sep 2026',
    proposedCompletionDate: '15 Sep 2026',
    scheduleImprovementDays: 3,
    fabricRequiredKg: 4800,
    fabricAvailableKg: 4800,
    fabricStatus: 'AVAILABLE',
    downstreamGates: downstreamGateCheck.gates,
    overallRisk: 'LOW',
    confidenceScore: 96,
  })
}

export async function commitProductionAdjustment(payload) {
  const newAudit = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    action: payload.action || 'Line Reallocation & Batch Scale-Up',
    styleCode: payload.styleCode || '26AW-W-1042',
    styleName: payload.styleName || 'Floral Printed Tiered Midi Dress',
    buyer: payload.buyer || 'Next Retail UK',
    changeDetails: payload.changeDetails || `Assigned Line ${payload.targetLineNo || '05'} (+${payload.additionalQty || 1500} pcs batch).`,
    trigger: payload.trigger || 'AI Commercial Demand Signal (+42% Breakout)',
    loggedBy: 'Yuvan K (Head of Production Planning)',
    status: 'Committed',
  }

  dynamicAuditTrail = [newAudit, ...dynamicAuditTrail]

  // Add supplementary work order if needed
  const newWo = {
    id: `WO-${Date.now().toString().slice(-4)}`,
    woNo: `WO/2609/${Math.floor(700 + Math.random() * 200)}S`,
    orderNo: `PO-${payload.styleCode}-SUPP`,
    buyerName: payload.buyer || 'Next Retail UK',
    styleCode: payload.styleCode || '26AW-W-1042',
    styleName: payload.styleName || 'Floral Printed Tiered Midi Dress',
    category: "Women's Wear",
    unitId: payload.unitId || 'unit-1',
    unitName: payload.unitName || 'Unit 1',
    lineNo: payload.targetLineNo || 'Line 05 (Allocated)',
    plannedQty: payload.additionalQty || 1500,
    actualOutput: 0,
    remainingQty: payload.additionalQty || 1500,
    demandSignal: 'Breakout',
    demandSignalEmoji: '🔥',
    demandSignalTone: 'brand',
    smv: 14.2,
    currentStage: 'Fabric Cut Ready',
    progressPct: 0,
    status: 'Released',
    risk: 'onTrack',
    dueDate: '2026-09-22',
    greigeStockKg: 4800,
  }

  dynamicWorkOrders = [newWo, ...dynamicWorkOrders]

  return simulateDelay({
    success: true,
    audit: newAudit,
    workOrder: newWo,
  })
}


