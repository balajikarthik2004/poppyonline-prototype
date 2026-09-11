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

