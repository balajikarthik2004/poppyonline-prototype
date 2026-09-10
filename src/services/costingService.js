import { simulateDelay } from './delay'
import { costSheets, samples, styles } from '@/mock'
import { calculateGarmentCost, calculateYarnPerPiece, calculateCmCost } from '@/lib/costing'

export async function getCostSheets(filters = {}) {
  let result = costSheets
  if (filters.segment) {
    result = result.filter((c) => c.segment === filters.segment)
  }
  return simulateDelay(result)
}

export async function getSamples(filters = {}) {
  let result = samples
  if (filters.stage) {
    result = result.filter((s) => s.stage === filters.stage)
  }
  if (filters.status) {
    result = result.filter((s) => s.status === filters.status)
  }
  return simulateDelay(result)
}

export async function simulateCostEstimate(params) {
  const { gsm = 180, areaSqMeters = 0.85, smv = 14.5, targetMarginPct = 12 } = params
  const yarnKg = calculateYarnPerPiece(gsm, areaSqMeters)
  const yarnCost = yarnKg * 4.2 // $4.20 per kg avg yarn cost
  const cmCost = calculateCmCost(smv)

  const estimate = calculateGarmentCost({
    yarnCost,
    knittingDyeingCost: yarnKg * 1.8,
    printEmbroideryCost: 0.45,
    cmCost,
    trimsAndAccessories: 0.35,
    packingAndFreight: 0.25,
    overheadUsd: 0.2,
    targetMarginPct,
  })

  return simulateDelay({
    ...estimate,
    yarnKg,
    smv,
  })
}
