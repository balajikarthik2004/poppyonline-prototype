/**
 * The backend swap-in point.
 *
 * Components never import from `src/mock/`. They call these functions, which
 * today wrap the mock modules in promises with simulated latency. Replacing the
 * bodies with REST or GraphQL calls requires no component changes.
 */
import { simulateDelay } from './delay'
import {
  activities,
  aiInsights,
  alerts,
  answerFor,
  aqlAudits,
  auditRecords,
  boilerAnalytics,
  breakdowns,
  buildInventorySummary,
  buildMaintenanceSummary,
  buildProcurementSummary,
  buildQualitySummary,
  buyers,
  capacityPlan,
  carbonReduction,
  company,
  complaints,
  complianceCertifications,
  copqSummary,
  costSheets,
  departmentSecData,
  eightDCapaCases,
  energyByDepartment,
  energyByUnit,
  energyHistory,
  energyTargets,
  esgMetrics,
  experts,
  exportOrders,
  fabricRollInspections,
  fabricStock,
  finishedGoods,
  getAqlSamplingPlan,
  getFleetHealthMatrix,
  goodsReceipts,
  inlineInspections,
  kpiCards,
  labTests,
  machines,
  nonConformanceCases,
  orderStatusTiles,
  playbooks,
  pmChecklistTemplates,
  pmSchedule,
  processStages,
  productionHistory,
  productionOrders,
  publishedCapacity,
  purchaseOrders,
  purchaseRequisitions,
  rejections,
  samples,
  sewingLines,
  shipments,
  spareParts,
  stageByKey,
  stockMovements,
  styles,
  suppliers,
  sustainabilitySnapshot,
  technicians,
  units,
  wipStock,
  yarnLots,
  yarnStock,
  zldWaterBalance,
} from '@/mock'
import { dateRangeDays } from '@/lib/dateRange'

/* ------------------------------------------------------------------ shared */

function byUnit(rows, unitId, key = 'unitId') {
  if (!unitId || unitId === 'all') return rows
  return rows.filter((r) => r[key] === unitId)
}

/* --------------------------------------------------------------------- kpi */

export async function getKpiCards() {
  return simulateDelay(kpiCards)
}

export async function getSustainabilitySnapshot() {
  return simulateDelay(sustainabilitySnapshot)
}

/* ------------------------------------------------------------------ orders */

export async function getExportOrders(filters = {}) {
  let result = exportOrders
  if (filters.risk === 'high') {
    result = result.filter((o) => o.risk === 'atRisk' || o.risk === 'delayed')
  } else if (filters.risk) {
    result = result.filter((o) => o.risk === filters.risk)
  }
  if (filters.buyerId) result = result.filter((o) => o.buyerId === filters.buyerId)
  if (filters.segment) result = result.filter((o) => o.segment === filters.segment)
  if (filters.region) result = result.filter((o) => o.region === filters.region)
  result = byUnit(result, filters.unitId)
  return simulateDelay(result)
}

export async function getOrderStatusTiles() {
  return simulateDelay(orderStatusTiles)
}

export async function getBuyers(filters = {}) {
  let result = buyers
  if (filters.region) result = result.filter((b) => b.region === filters.region)
  if (filters.tier) result = result.filter((b) => b.tier === filters.tier)
  return simulateDelay(result)
}

export async function getShipments(filters = {}) {
  let result = shipments
  if (filters.status) result = result.filter((s) => s.status === filters.status)
  return simulateDelay(result)
}

/** Export profile: the published footprint plus the live order book. */
export async function getExportSummary() {
  const byRegion = new Map()
  for (const order of exportOrders) {
    const entry = byRegion.get(order.region) ?? { orders: 0, valueUsd: 0, pieces: 0 }
    entry.orders += 1
    entry.valueUsd += order.valueUsd
    entry.pieces += order.quantityPcs
    byRegion.set(order.region, entry)
  }

  const bySegment = new Map()
  for (const order of exportOrders) {
    const entry = bySegment.get(order.segment) ?? { orders: 0, pieces: 0, valueUsd: 0 }
    entry.orders += 1
    entry.pieces += order.quantityPcs
    entry.valueUsd += order.valueUsd
    bySegment.set(order.segment, entry)
  }

  return simulateDelay({
    published: company.scale,
    keyBuyers: company.keyBuyers,
    orderCount: exportOrders.length,
    totalValueUsd: exportOrders.reduce((s, o) => s + o.valueUsd, 0),
    totalPieces: exportOrders.reduce((s, o) => s + o.quantityPcs, 0),
    activeCountries: new Set(exportOrders.map((o) => o.country)).size,
    activeBuyers: new Set(exportOrders.map((o) => o.buyerId)).size,
    byRegion: [...byRegion.entries()]
      .map(([region, v]) => ({ region, ...v }))
      .sort((a, b) => b.valueUsd - a.valueUsd),
    bySegment: [...bySegment.entries()]
      .map(([segment, v]) => ({ segment, ...v }))
      .sort((a, b) => b.pieces - a.pieces),
  })
}

/* -------------------------------------------------------------- production */

export async function getProductionHistory(preset = '7d') {
  const days = dateRangeDays[preset] ?? 7
  return simulateDelay(productionHistory.slice(-days))
}

export async function getProductionOrders(filters = {}) {
  let result = productionOrders
  if (filters.status) result = result.filter((p) => p.status === filters.status)
  if (filters.risk) result = result.filter((p) => p.risk === filters.risk)
  result = byUnit(result, filters.unitId)
  return simulateDelay(result)
}

export async function getProcessStages() {
  return simulateDelay(processStages)
}

/** Everything one production stage page needs, in a single call. */
export async function getStageDetail(stageKey, preset = '7d') {
  const stage = stageByKey.get(stageKey)
  if (!stage) throw new Error(`Unknown stage: ${stageKey}`)

  const days = dateRangeDays[preset] ?? 7
  const history = productionHistory.slice(-days).map((row) => ({
    label: row.label,
    date: row.date,
    output: row[stageKey],
    target: row[`${stageKey}Target`],
    achievementPct: Math.round((row[stageKey] / row[`${stageKey}Target`]) * 1000) / 10,
  }))

  const stageMachines = machines.filter((m) => m.stageKey === stageKey)
  const totalOutput = history.reduce((s, r) => s + r.output, 0)
  const totalTarget = history.reduce((s, r) => s + r.target, 0)

  return simulateDelay({
    stage,
    history,
    machines: stageMachines,
    totalOutput,
    totalTarget,
    achievementPct: totalTarget ? Math.round((totalOutput / totalTarget) * 1000) / 10 : 0,
    avgDaily: history.length ? Math.round(totalOutput / history.length) : 0,
    running: stageMachines.filter((m) => m.status === 'Running').length,
    down: stageMachines.filter((m) => m.status === 'Breakdown').length,
    utilisationPct: stageMachines.length
      ? Math.round(
          (stageMachines.reduce((s, m) => s + m.utilisationPct, 0) / stageMachines.length) * 10,
        ) / 10
      : 0,
    rejections: rejections.filter((r) => r.stageKey === stageKey),
  })
}

export async function getCapacityPlan(unitId = 'all') {
  return simulateDelay(byUnit(capacityPlan, unitId))
}

export async function getSewingLines(unitId = 'all') {
  return simulateDelay(byUnit(sewingLines, unitId))
}

/* ----------------------------------------------------------------- quality */

export async function getQualitySummary() {
  return simulateDelay(buildQualitySummary())
}

export async function getLabTests(filters = {}) {
  let result = labTests
  if (filters.result) result = result.filter((t) => t.result === filters.result)
  if (filters.stage) result = result.filter((t) => t.stage === filters.stage)
  return simulateDelay(result)
}

export async function getInlineInspections(filters = {}) {
  let result = inlineInspections
  if (filters.verdict) result = result.filter((r) => r.verdict === filters.verdict)
  return simulateDelay(result)
}

export async function getAqlAudits(filters = {}) {
  let result = aqlAudits
  if (filters.verdict) result = result.filter((a) => a.verdict === filters.verdict)
  return simulateDelay(result)
}

export async function getRejections(filters = {}) {
  let result = rejections
  if (filters.stageKey) result = result.filter((r) => r.stageKey === filters.stageKey)
  return simulateDelay(result)
}

export async function getComplaints(filters = {}) {
  let result = complaints
  if (filters.status) result = result.filter((c) => c.status === filters.status)
  return simulateDelay(result)
}

/** Fabric-side quality: the lab tests that gate fabric before cutting. */
export async function getFabricQuality() {
  const rows = labTests.filter((t) => t.stage === 'Greige Fabric' || t.stage === 'Dyed Fabric')
  const pass = rows.filter((t) => t.result === 'Pass').length
  return simulateDelay({
    rows,
    total: rows.length,
    pass,
    passRatePct: rows.length ? Math.round((pass / rows.length) * 1000) / 10 : 0,
    holds: fabricStock.filter((f) => f.status === 'On Hold'),
  })
}

/** ASTM D5430 4-Point System Fabric Roll Inspections */
export async function getFabricRollInspections(filters = {}) {
  let result = fabricRollInspections
  if (filters.verdict) result = result.filter((r) => r.verdict === filters.verdict)
  return simulateDelay(result)
}

/** 8D Closed-Loop Root Cause Problem Solving Cases */
export async function getEightDCapaCases(filters = {}) {
  let result = eightDCapaCases
  if (filters.status) result = result.filter((c) => c.status === filters.status)
  return simulateDelay(result)
}

/** Cost of Poor Quality (COPQ) Summary */
export async function getCopqSummary() {
  return simulateDelay(copqSummary)
}

/** Dynamic AQL Sampling Calculator */
export async function getAqlSamplingCalculator(lotSize, aqlLevel) {
  return simulateDelay(getAqlSamplingPlan(lotSize, aqlLevel))
}

/* -------------------------------------------------------------- compliance */

export async function getComplianceCertifications() {
  return simulateDelay(complianceCertifications)
}

export async function getAuditRecords(filters = {}) {
  let result = auditRecords
  if (filters.status) result = result.filter((a) => a.status === filters.status)
  return simulateDelay(result)
}

export async function getNonConformanceCases(filters = {}) {
  let result = nonConformanceCases
  if (filters.status) result = result.filter((n) => n.status === filters.status)
  return simulateDelay(result)
}

export async function getEsgMetrics() {
  return simulateDelay(esgMetrics)
}

/* --------------------------------------------------------------- inventory */

export async function getInventorySummary() {
  return simulateDelay(buildInventorySummary())
}

export async function getYarnStock() {
  return simulateDelay(yarnStock)
}

export async function getFabricStock(filters = {}) {
  let result = fabricStock
  if (filters.state) result = result.filter((f) => f.state === filters.state)
  return simulateDelay(result)
}

export async function getWipStock(unitId = 'all') {
  return simulateDelay(byUnit(wipStock, unitId))
}

export async function getFinishedGoods(filters = {}) {
  let result = finishedGoods
  if (filters.status) result = result.filter((f) => f.status === filters.status)
  return simulateDelay(result)
}

export async function getStockMovements(filters = {}) {
  let result = stockMovements
  if (filters.type) result = result.filter((m) => m.type === filters.type)
  if (filters.store) result = result.filter((m) => m.store === filters.store)
  return simulateDelay(result)
}

/* ------------------------------------------------------------- procurement */

export async function getProcurementSummary() {
  return simulateDelay(buildProcurementSummary())
}

export async function getSuppliers(filters = {}) {
  let result = suppliers
  if (filters.category) result = result.filter((s) => s.category === filters.category)
  if (filters.status) result = result.filter((s) => s.status === filters.status)
  return simulateDelay(result)
}

export async function getPurchaseRequisitions(filters = {}) {
  let result = purchaseRequisitions
  if (filters.status) result = result.filter((p) => p.status === filters.status)
  return simulateDelay(result)
}

export async function getPurchaseOrders(filters = {}) {
  let result = purchaseOrders
  if (filters.status) result = result.filter((p) => p.status === filters.status)
  if (filters.overdue) result = result.filter((p) => p.isOverdue)
  return simulateDelay(result)
}

export async function getGoodsReceipts() {
  return simulateDelay(goodsReceipts)
}

/* ------------------------------------------------------------- maintenance */

export async function getMaintenanceSummary() {
  return simulateDelay(buildMaintenanceSummary())
}

export async function getFleetHealth() {
  return simulateDelay(getFleetHealthMatrix())
}

export async function getMachines(filters = {}) {
  let result = machines
  if (filters.stageKey) result = result.filter((m) => m.stageKey === filters.stageKey)
  if (filters.status) result = result.filter((m) => m.status === filters.status)
  result = byUnit(result, filters.unitId)
  return simulateDelay(result)
}

export async function getPmSchedule(filters = {}) {
  let result = pmSchedule
  if (filters.status) result = result.filter((p) => p.status === filters.status)
  if (filters.stageKey) result = result.filter((p) => p.stageKey === filters.stageKey)
  return simulateDelay(result)
}

export async function executePmChecklist(taskId, checklistUpdates) {
  const task = pmSchedule.find((p) => p.id === taskId)
  if (task) {
    task.checklist = checklistUpdates
    const allDone = checklistUpdates.every((c) => c.done)
    if (allDone && task.status !== 'Completed') {
      task.status = 'In Progress'
    }
  }
  return simulateDelay(task)
}

export async function signOffPmTask(taskId, signOffData) {
  const task = pmSchedule.find((p) => p.id === taskId)
  if (task) {
    task.status = 'Completed'
    task.completedAt = new Date().toISOString()
    task.digitalSignOff = signOffData
  }
  return simulateDelay(task)
}

export async function getBreakdowns(filters = {}) {
  let result = breakdowns
  if (filters.status) result = result.filter((b) => b.status === filters.status)
  if (filters.severity) result = result.filter((b) => b.severity === filters.severity)
  if (filters.stageKey) result = result.filter((b) => b.stageKey === filters.stageKey)
  return simulateDelay(result)
}

export async function getTechnicians() {
  return simulateDelay(technicians)
}

export async function createBreakdownTicket(ticketData) {
  const newId = `BD-2026-${String(breakdowns.length + 90).padStart(3, '0')}`
  const newTicket = {
    id: newId,
    reportedAt: new Date().toISOString(),
    status: 'Diagnosis',
    downtimeHours: 0.5,
    machineIsolated: true,
    testRunPassed: false,
    ...ticketData,
  }
  breakdowns.unshift(newTicket)
  return simulateDelay(newTicket)
}

export async function updateBreakdownStatus(ticketId, nextStatus, updates = {}) {
  const ticket = breakdowns.find((b) => b.id === ticketId)
  if (ticket) {
    ticket.status = nextStatus
    Object.assign(ticket, updates)
    if (nextStatus === 'Released') {
      ticket.resolvedAt = new Date().toISOString()
      ticket.machineIsolated = false
      ticket.testRunPassed = true
    }
  }
  return simulateDelay(ticket)
}

export async function getSpareParts(filters = {}) {
  let result = spareParts
  if (filters.stageKey) result = result.filter((s) => s.stageKey === filters.stageKey)
  if (filters.category) result = result.filter((s) => s.category === filters.category)
  if (filters.criticalOnly) result = result.filter((s) => s.isStockOutRisk || s.isReorderNeeded)
  return simulateDelay(result)
}

export async function issueSparePart(partId, qty, reason = 'Breakdown Repair') {
  const part = spareParts.find((p) => p.id === partId)
  if (part) {
    part.stockQty = Math.max(0, part.stockQty - qty)
    part.lastIssuedAt = new Date().toISOString()
    if (part.stockQty <= part.reorderPoint && !part.openPrNo) {
      part.openPrNo = `PR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`
    }
  }
  return simulateDelay(part)
}

/* ------------------------------------------------------------------ energy */

export async function getEnergy(preset = '7d') {
  const days = dateRangeDays[preset] ?? 7
  const history = energyHistory.slice(-days)
  const total = history.reduce((s, r) => s + r.total, 0)
  const renewable = history.reduce((s, r) => s + r.wind + r.solar, 0)
  const fabricKg = history.reduce((s, r) => s + r.fabricKg, 0)
  const waterKl = history.reduce((s, r) => s + r.waterKl, 0)
  const recoveredKl = history.reduce((s, r) => s + r.waterRecoveredKl, 0)

  return simulateDelay({
    history,
    byUnit: energyByUnit,
    byDepartment: energyByDepartment,
    departmentSec: departmentSecData,
    zldBalance: zldWaterBalance,
    boilerAnalytics,
    carbonOffset: carbonReduction,
    targets: energyTargets,
    totalKwh: total,
    renewableKwh: renewable,
    renewablePct: total ? Math.round((renewable / total) * 1000) / 10 : 0,
    kwhPerKg: fabricKg ? Math.round((total / fabricKg) * 100) / 100 : 0,
    waterKl,
    waterRecoveredKl: recoveredKl,
    recoveryPct: waterKl ? Math.round((recoveredKl / waterKl) * 1000) / 10 : 0,
    co2Tonnes: Math.round(history.reduce((s, r) => s + r.co2Tonnes, 0) * 10) / 10,
    co2AvoidedTonnes: Math.round(history.reduce((s, r) => s + (r.co2AvoidedTonnes || 0), 0) * 10) / 10,
    mix: [
      { name: 'Grid', value: history.reduce((s, r) => s + r.grid, 0) },
      { name: 'Wind', value: history.reduce((s, r) => s + r.wind, 0) },
      { name: 'Solar', value: history.reduce((s, r) => s + r.solar, 0) },
      { name: 'Diesel', value: history.reduce((s, r) => s + r.diesel, 0) },
    ],
  })
}

/* ----------------------------------------------------------- merchandising */

export async function getStyles(filters = {}) {
  let result = styles
  if (filters.segment) result = result.filter((s) => s.segment === filters.segment)
  if (filters.status) result = result.filter((s) => s.status === filters.status)
  if (filters.buyerId) result = result.filter((s) => s.buyerId === filters.buyerId)
  return simulateDelay(result)
}

export async function getSamples(filters = {}) {
  let result = samples
  if (filters.stage) result = result.filter((s) => s.stage === filters.stage)
  if (filters.status) result = result.filter((s) => s.status === filters.status)
  return simulateDelay(result)
}

export async function getCostSheets(filters = {}) {
  let result = costSheets
  if (filters.status) result = result.filter((c) => c.status === filters.status)
  return simulateDelay(result)
}

/* --------------------------------------------------------------------- ops */

export async function getAlerts(filters = {}) {
  let result = alerts
  if (filters.severity) result = result.filter((a) => a.severity === filters.severity)
  return simulateDelay(result)
}

export async function getActivities() {
  return simulateDelay(activities)
}

/* ---------------------------------------------------------------------- ai */

export async function getAiInsights() {
  return simulateDelay(aiInsights)
}

export async function getPlaybooks() {
  return simulateDelay(playbooks)
}

export async function getExperts() {
  return simulateDelay(experts)
}

/** The copilot answer path. Deterministic, computed over the mock dataset. */
export async function askCopilot(question) {
  return simulateDelay(answerFor(question), 500, 1100)
}

/* ------------------------------------------------------------------ static */

export async function getCompanyProfile() {
  return simulateDelay({ company, publishedCapacity, units })
}

export async function getYarnLots() {
  return simulateDelay(yarnLots)
}

/* -------------------------------------------------------- modular services */
export * from './costingService'
export * from './qualityService'
export * from './inventoryService'
export * from './productionService'
export * from './shipmentService'
export * from './masterService'
export * from './adminService'
export * from './intelligenceService'


