import { subDays, addDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { units, processStages } from './units'

/**
 * The machine register. Counts per stage are apportioned to the published
 * totals: 45 circular + 4 flat knit machines, Tube Tex compactors and soft-flow
 * dyeing ranges, 10 semi-auto + 2 auto + 2 MHM print tables, Barudan/Tajima
 * embroidery heads, and 1,500 sewing machines across three factories.
 */
const rng = makeRng(3344)

const makersByStage = {
  knitting: ['Mayer & Cie', 'Terrot', 'Fukuhara', 'Pailung', 'Shima Seiki'],
  dyeing: ['Fongs', 'Thies', 'Sclavos', 'Dhall Softflow'],
  compacting: ['Tube Tex', 'Bianco', 'Ferraro'],
  cutting: ['Gerber', 'Bullmer', 'Eastman'],
  printing: ['MHM Austria', 'M&R', 'Anatol', 'Sarvodaya'],
  embroidery: ['Barudan', 'Tajima'],
  sewing: ['Juki', 'Brother', 'Pegasus', 'Yamato', 'Siruba'],
  checking: ['Hashima', 'Sanko'],
  packing: ['Veit', 'Naomoto', 'Hashima'],
}

/** How many machines to model per stage - a readable sample, not all 1,500. */
const sampleCountByStage = {
  knitting: 49,
  dyeing: 14,
  compacting: 6,
  cutting: 9,
  printing: 14,
  embroidery: 12,
  sewing: 40,
  checking: 10,
  packing: 12,
}

const statuses = ['Running', 'Running', 'Running', 'Running', 'Idle', 'Under Maintenance', 'Breakdown']

let counter = 0

export const machines = processStages.flatMap((stage) => {
  const count = sampleCountByStage[stage.key] ?? 8
  return Array.from({ length: count }, (_, i) => {
    counter += 1
    const unit = stage.key === 'dyeing' || stage.key === 'compacting' || stage.key === 'printing' || stage.key === 'embroidery'
      ? units[3]
      : rng.pick(units.slice(0, 3))
    const status = rng.pick(statuses)
    const lastServiceDaysAgo = rng.int(3, 120)
    const utilisationPct = status === 'Running' ? rng.float(62, 97, 1) : status === 'Idle' ? rng.float(0, 22, 1) : 0

    return {
      id: `MC-${String(counter).padStart(4, '0')}`,
      code: `${stage.key.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      stageKey: stage.key,
      stageLabel: stage.label,
      make: rng.pick(makersByStage[stage.key] ?? ['Generic']),
      model: `M${rng.int(100, 990)}`,
      unitId: unit.id,
      unitName: unit.shortName,
      installedYear: rng.int(2004, 2024),
      status,
      utilisationPct,
      /** Sewing lines are grouped; knitting machines are addressed singly. */
      lineNo: stage.key === 'sewing' ? `Line ${rng.int(1, 24)}` : null,
      gauge: stage.key === 'knitting' ? `${rng.pick([18, 20, 24, 28])}G` : null,
      diameterInch: stage.key === 'knitting' ? rng.pick([26, 30, 32, 34, 36]) : null,
      capacityPerDay: Math.round((stage.dailyCapacity / count) * rng.float(0.85, 1.15, 2)),
      unitOfMeasure: stage.unitOfMeasure,
      lastServiceAt: subDays(new Date(), lastServiceDaysAgo).toISOString(),
      nextServiceAt: addDays(subDays(new Date(), lastServiceDaysAgo), 90).toISOString(),
      mtbfHours: rng.int(180, 1400),
      breakdownsThisMonth: rng.int(0, 5),
    }
  })
})

export const machineById = new Map(machines.map((m) => [m.id, m]))

export const machinesByStage = processStages.reduce((acc, stage) => {
  acc[stage.key] = machines.filter((m) => m.stageKey === stage.key)
  return acc
}, {})
