import { addDays, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { machines } from './machines'
import { processStages } from './units'
import { initialBreakdowns, breakdownTechnicians } from './breakdowns'
import { initialPmTasks, pmChecklistTemplates } from './pmTasks'
import { initialSpareParts } from './spareParts'
import { aggregateFleetOee } from '@/lib/maintenance/oeeCalculation'
import { calculateFleetMtMetrics } from '@/lib/maintenance/mtbfCalculation'
import { calculatePmCompliance } from '@/lib/maintenance/pmCompliance'
import { evaluateSparePartBuffer } from '@/lib/maintenance/sparePartsLogic'

const rng = makeRng(4501)

export let breakdowns = [...initialBreakdowns]
export let pmSchedule = [...initialPmTasks]
export let spareParts = initialSpareParts.map(evaluateSparePartBuffer)
export const technicians = breakdownTechnicians

/** Fleet Health matrix for all 9 process stages with OEE and Risk classification */
export function getFleetHealthMatrix() {
  return processStages.map((stage) => {
    const stageMachines = machines.filter((m) => m.stageKey === stage.key)
    const running = stageMachines.filter((m) => m.status === 'Running').length
    const total = stageMachines.length
    const availabilityPct = total > 0 ? Math.round((running / total) * 1000) / 10 : 92
    
    // Average utilisation
    const avgUtil = stageMachines.length
      ? Math.round((stageMachines.reduce((s, m) => s + (m.utilisationPct || 0), 0) / stageMachines.length) * 10) / 10
      : 80
    
    const qualityPct = 96.5
    const oeePct = Math.round(((availabilityPct / 100) * (avgUtil / 100) * (qualityPct / 100)) * 1000) / 10

    let health = 'Healthy'
    let risk = 'Low'
    if (oeePct < 75 || availabilityPct < 88) {
      health = 'Watch'
      risk = oeePct < 72 ? 'High' : 'Medium'
    }

    return {
      stageKey: stage.key,
      stageLabel: stage.label,
      totalAssets: total,
      runningAssets: running,
      availabilityPct,
      oeePct,
      health,
      risk,
    }
  })
}

export function buildMaintenanceSummary() {
  const running = machines.filter((m) => m.status === 'Running').length
  const breakdown = machines.filter((m) => m.status === 'Breakdown').length
  const underMaintenance = machines.filter((m) => m.status === 'Under Maintenance').length
  const idle = machines.filter((m) => m.status === 'Idle').length

  const fleetOee = aggregateFleetOee(machines)
  const mtMetrics = calculateFleetMtMetrics(breakdowns)
  const pmComp = calculatePmCompliance(pmSchedule)

  return {
    totalMachines: machines.length,
    running,
    idle,
    underMaintenance,
    breakdown,
    fleetOeePct: fleetOee.fleetOeePct,
    availabilityPct: fleetOee.availabilityPct,
    mtbfHours: mtMetrics.mtbfHours,
    mttrHours: mtMetrics.mttrHours,
    pmCompliancePct: pmComp.compliancePct,
    assetsAtRisk: fleetOee.assetsAtRisk,
    openBreakdowns: breakdowns.filter((b) => b.status !== 'Released').length,
    downtimeHours: mtMetrics.totalDowntimeHours,
    sparesBelowReorder: spareParts.filter((s) => s.isReorderNeeded).length,
    fleetHealthMatrix: getFleetHealthMatrix(),
    byStage: processStages.map((stage) => {
      const stageMachines = machines.filter((m) => m.stageKey === stage.key)
      return {
        stage: stage.label,
        total: stageMachines.length,
        running: stageMachines.filter((m) => m.status === 'Running').length,
        down: stageMachines.filter((m) => m.status === 'Breakdown').length,
        utilisationPct: stageMachines.length
          ? Math.round(
              (stageMachines.reduce((s, m) => s + m.utilisationPct, 0) / stageMachines.length) * 10,
            ) / 10
          : 0,
      }
    }),
  }
}
