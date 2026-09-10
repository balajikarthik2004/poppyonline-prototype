import { simulateDelay } from './delay'
import {
  aqlAudits,
  complaints,
  defectCodes,
  fabricStock,
  inlineInspections,
  labTests,
  rejections,
} from '@/mock'
import { calculateDhu, calculateFtr, getAqlSamplingPlan } from '@/lib/quality'

export async function getDefectCodes(category = null) {
  let result = defectCodes
  if (category) {
    result = result.filter((d) => d.category === category)
  }
  return simulateDelay(result)
}

export async function getLabTests(status = null) {
  let result = labTests
  if (status) {
    result = result.filter((t) => t.result === status)
  }
  return simulateDelay(result)
}

export async function getFabricQualityInspections() {
  // Enriches fabric stock with 4-point penalty scores
  const enriched = fabricStock.map((roll) => ({
    ...roll,
    penaltyPoints: roll.pointsPer100SqYd || Math.round(12 + (parseInt(roll.rollNo?.slice(-2) || '10', 10) % 18)),
    grade: (roll.pointsPer100SqYd || 15) <= 28 ? 'Pass' : 'Fail',
  }))
  return simulateDelay(enriched)
}

export async function getInlineInspections(unitId = null) {
  let result = inlineInspections
  if (unitId && unitId !== 'all') {
    result = result.filter((i) => i.unitId === unitId)
  }
  return simulateDelay(result)
}

export async function getAqlAudits(aqlStandard = null) {
  let result = aqlAudits
  if (aqlStandard) {
    result = result.filter((a) => a.aqlStandard === aqlStandard)
  }
  return simulateDelay(result)
}

export async function getRejections(stage = null) {
  let result = rejections
  if (stage) {
    result = result.filter((r) => r.stage === stage)
  }
  return simulateDelay(result)
}

export async function getBuyerComplaints() {
  return simulateDelay(complaints)
}

export async function getQualitySummary() {
  const totalChecked = inlineInspections.reduce((sum, r) => sum + (r.checkedQty || 200), 0)
  const totalDefects = inlineInspections.reduce((sum, r) => sum + (r.defectQty || 8), 0)
  const avgDhu = calculateDhu(totalDefects, totalChecked)

  const aqlPassed = aqlAudits.filter((a) => a.status === 'Passed').length
  const aqlTotal = aqlAudits.length || 1
  const aqlPassRate = Math.round((aqlPassed / aqlTotal) * 100)

  return simulateDelay({
    avgDhu,
    ftrRate: calculateFtr(totalChecked - totalDefects, totalChecked),
    aqlPassRate,
    openComplaints: complaints.filter((c) => c.status !== 'Closed').length,
    totalLabTests: labTests.length,
  })
}
