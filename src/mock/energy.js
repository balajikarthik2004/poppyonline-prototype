import { format, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { units } from './units'

/**
 * Energy and utilities. A dye house is the heavy consumer in a knitwear group,
 * so the mix separates grid, captive wind and rooftop solar, and tracks the two
 * intensities a Tirupur processor is actually judged on: kWh per kilo of fabric
 * processed and litres of water per kilo, with zero-liquid-discharge recovery.
 */
const rng = makeRng(7712)

const HISTORY_DAYS = 90

export const energyHistory = Array.from({ length: HISTORY_DAYS }, (_, i) => {
  const date = subDays(new Date(), HISTORY_DAYS - 1 - i)
  const isSunday = date.getDay() === 0
  const factor = isSunday ? rng.float(0.22, 0.36, 2) : rng.float(0.9, 1.05, 2)

  const grid = Math.round(38000 * factor * rng.float(0.92, 1.06, 3))
  const wind = Math.round(21000 * factor * rng.float(0.6, 1.25, 3))
  const solar = Math.round(9500 * factor * rng.float(0.55, 1.2, 3))
  const diesel = Math.round(1800 * factor * rng.float(0.1, 1.4, 3))
  const total = grid + wind + solar + diesel

  const fabricKg = Math.round(11000 * factor * rng.float(0.9, 1.05, 3))
  const waterKl = Math.round(fabricKg * rng.float(0.055, 0.085, 4))

  return {
    date: date.toISOString(),
    label: format(date, 'dd MMM'),
    grid,
    wind,
    solar,
    diesel,
    total,
    renewablePct: Math.round(((wind + solar) / total) * 1000) / 10,
    fabricKg,
    kwhPerKg: Math.round((total / fabricKg) * 100) / 100,
    waterKl,
    waterRecoveredKl: Math.round(waterKl * rng.float(0.78, 0.94, 3)),
    steamTonnes: Math.round(fabricKg * rng.float(0.0018, 0.0031, 5) * 100) / 100,
    co2Tonnes: Math.round(((grid * 0.71 + diesel * 2.68) / 1000) * 10) / 10,
  }
})

export const latestEnergy = energyHistory[energyHistory.length - 1]

/** Targets the sustainability committee reports against. */
export const energyTargets = {
  kwhPerKg: 6.4,
  renewablePct: 45,
  waterLitresPerKg: 62,
  recoveryPct: 88,
}

export const energyByUnit = units.map((unit, i) => {
  const share = [0.24, 0.2, 0.13, 0.43][i] ?? 0.2
  const total = Math.round(latestEnergy.total * share)
  return {
    unitId: unit.id,
    unitName: unit.shortName,
    fullName: unit.name,
    kwh: total,
    sharePct: Math.round(share * 1000) / 10,
    renewablePct: rng.float(28, 58, 1),
    kwhPerKg: rng.float(4.8, 9.2, 2),
  }
})

/** Where the power actually goes inside the group. */
export const energyByDepartment = [
  { department: 'Dyeing & Processing', kwh: Math.round(latestEnergy.total * 0.41) },
  { department: 'Knitting', kwh: Math.round(latestEnergy.total * 0.17) },
  { department: 'Compacting & Finishing', kwh: Math.round(latestEnergy.total * 0.12) },
  { department: 'Sewing Floors', kwh: Math.round(latestEnergy.total * 0.13) },
  { department: 'Printing & Embroidery', kwh: Math.round(latestEnergy.total * 0.09) },
  { department: 'Utilities & Lighting', kwh: Math.round(latestEnergy.total * 0.08) },
]
