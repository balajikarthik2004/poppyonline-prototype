import { addDays, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { machines } from './machines'
import { processStages } from './units'

/**
 * Maintenance across the installed base: a preventive schedule per machine,
 * the breakdown log, and the spare-parts store that feeds both.
 */
const rng = makeRng(4501)

const pmTypes = ['Lubrication', 'Needle & sinker change', 'Belt inspection', 'Electrical audit', 'Calibration', 'Overhaul']

export const pmSchedule = machines.slice(0, 90).map((machine, i) => {
  const dueDate = addDays(new Date(), rng.int(-12, 45))
  const isOverdue = dueDate < new Date()
  return {
    id: `PM-${String(i + 1).padStart(4, '0')}`,
    taskNo: `PM/${String(6100 + i)}`,
    machineId: machine.id,
    machineCode: machine.code,
    stageLabel: machine.stageLabel,
    unitName: machine.unitName,
    make: machine.make,
    type: rng.pick(pmTypes),
    frequency: rng.pick(['Weekly', 'Monthly', 'Quarterly', 'Half-yearly']),
    lastDoneAt: machine.lastServiceAt,
    dueDate: dueDate.toISOString(),
    estimatedHours: rng.float(0.5, 8, 1),
    assignedTo: rng.pick(['G. Murugan', 'S. Kathiresan', 'A. Balamurugan', 'N. Prakash', 'T. Sivakumar']),
    status: isOverdue ? 'Overdue' : rng.pick(['Scheduled', 'Scheduled', 'In Progress', 'Completed']),
    isOverdue,
  }
})

const breakdownCauses = [
  'Needle breakage cluster',
  'Motor bearing failure',
  'Sinker cam wear',
  'Pneumatic line leak',
  'Control card fault',
  'Belt snap',
  'Temperature sensor drift',
  'Dye pump seal failure',
  'Cutter blade jam',
]

export const breakdowns = Array.from({ length: 54 }, (_, i) => {
  const machine = rng.pick(machines)
  const reportedAt = subDays(new Date(), rng.int(0, 40))
  const downtimeHours = rng.float(0.4, 26, 1)
  const status = rng.pick(['Open', 'In Progress', 'Resolved', 'Resolved', 'Resolved', 'Closed'])
  return {
    id: `BRK-${String(i + 1).padStart(4, '0')}`,
    ticketNo: `BD/${String(4700 + i)}`,
    machineId: machine.id,
    machineCode: machine.code,
    stageLabel: machine.stageLabel,
    unitName: machine.unitName,
    cause: rng.pick(breakdownCauses),
    reportedAt: reportedAt.toISOString(),
    resolvedAt:
      status === 'Resolved' || status === 'Closed'
        ? addDays(reportedAt, rng.float(0.02, 1.5, 3)).toISOString()
        : null,
    downtimeHours,
    /** Pieces or kilos that never got made while the machine was down. */
    lostOutput: Math.round((machine.capacityPerDay / 24) * downtimeHours),
    unitOfMeasure: machine.unitOfMeasure,
    severity: downtimeHours > 12 ? 'Critical' : downtimeHours > 4 ? 'High' : 'Medium',
    technician: rng.pick(['G. Murugan', 'S. Kathiresan', 'A. Balamurugan', 'N. Prakash']),
    status,
  }
})

const spareItems = [
  { name: 'Knitting needles (pack 100)', category: 'Knitting' },
  { name: 'Sinkers set', category: 'Knitting' },
  { name: 'Cylinder oil 20L', category: 'Consumable' },
  { name: 'Overlock looper', category: 'Sewing' },
  { name: 'Feed dog assembly', category: 'Sewing' },
  { name: 'Servo motor 550W', category: 'Sewing' },
  { name: 'Dye pump mechanical seal', category: 'Processing' },
  { name: 'PT100 temperature probe', category: 'Processing' },
  { name: 'Squeegee blade 90 shore', category: 'Printing' },
  { name: 'Embroidery rotary hook', category: 'Embroidery' },
  { name: 'Compactor felt belt', category: 'Processing' },
  { name: 'Cutting blade 8 inch', category: 'Cutting' },
  { name: 'V-belt B-series', category: 'Consumable' },
  { name: 'Air filter cartridge', category: 'Consumable' },
]

export const spareParts = spareItems.map((item, i) => {
  const stockQty = rng.int(0, 260)
  const reorderLevel = rng.int(20, 90)
  return {
    id: `SPR-${String(i + 1).padStart(3, '0')}`,
    partNo: `SP-${String(1400 + i)}`,
    ...item,
    stockQty,
    reorderLevel,
    unitOfMeasure: 'nos',
    rateInr: rng.int(120, 24000),
    valueInr: 0,
    location: rng.pick(['Spares Store', 'Unit I Cage', 'Processing Store']),
    leadTimeDays: rng.int(3, 45),
    lastIssuedAt: subDays(new Date(), rng.int(0, 60)).toISOString(),
    isBelowReorder: stockQty < reorderLevel,
  }
}).map((p) => ({ ...p, valueInr: p.stockQty * p.rateInr }))

export function buildMaintenanceSummary() {
  const running = machines.filter((m) => m.status === 'Running').length
  const breakdown = machines.filter((m) => m.status === 'Breakdown').length
  const underMaintenance = machines.filter((m) => m.status === 'Under Maintenance').length
  const idle = machines.filter((m) => m.status === 'Idle').length
  const totalDowntime = breakdowns.reduce((s, b) => s + b.downtimeHours, 0)

  return {
    totalMachines: machines.length,
    running,
    idle,
    underMaintenance,
    breakdown,
    availabilityPct: Math.round((running / machines.length) * 1000) / 10,
    avgUtilisationPct:
      Math.round((machines.reduce((s, m) => s + m.utilisationPct, 0) / machines.length) * 10) / 10,
    pmDue: pmSchedule.filter((p) => p.status === 'Scheduled').length,
    pmOverdue: pmSchedule.filter((p) => p.isOverdue).length,
    openBreakdowns: breakdowns.filter((b) => b.status === 'Open' || b.status === 'In Progress').length,
    downtimeHours: Math.round(totalDowntime * 10) / 10,
    sparesBelowReorder: spareParts.filter((s) => s.isBelowReorder).length,
    sparesValueInr: spareParts.reduce((s, p) => s + p.valueInr, 0),
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
