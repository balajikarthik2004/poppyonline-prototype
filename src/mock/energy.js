import { format, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { units } from './units'
import { secBenchmarks, calculateDepartmentSec } from '@/lib/energy/secCalculation'
import { calculateZldMassBalance } from '@/lib/energy/zldCalculation'
import { calculateBoilerEfficiency } from '@/lib/energy/boilerEfficiency'
import { calculateCarbonOffset } from '@/lib/energy/carbonCalculation'

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
  const waterRecoveredKl = Math.round(waterKl * rng.float(0.88, 0.94, 3))
  const steamTonnes = Math.round(fabricKg * rng.float(0.0035, 0.0048, 5) * 100) / 100
  const biomassTons = Math.round((steamTonnes / 3.85) * 10) / 10

  const carbon = calculateCarbonOffset({ solarKwh: solar, windKwh: wind, gridKwh: grid, dieselLitres: diesel / 2 })

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
    waterRecoveredKl,
    recoveryPct: Math.round((waterRecoveredKl / waterKl) * 1000) / 10,
    steamTonnes,
    biomassTons,
    co2Tonnes: carbon.actualEmissionsTons,
    co2AvoidedTonnes: carbon.co2AvoidedTons,
  }
})

export const latestEnergy = energyHistory[energyHistory.length - 1]

/** Targets the sustainability committee reports against. */
export const energyTargets = {
  kwhPerKg: 6.4,
  renewablePct: 45,
  waterLitresPerKg: 62,
  recoveryPct: 92,
  boilerEfficiencyPct: 82,
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
    renewablePct: rng.float(32, 62, 1),
    kwhPerKg: rng.float(4.8, 8.4, 2),
  }
})

export const energyByDepartment = [
  { department: 'Dyeing & Processing', kwh: Math.round(latestEnergy.total * 0.41) },
  { department: 'Knitting', kwh: Math.round(latestEnergy.total * 0.17) },
  { department: 'Compacting & Finishing', kwh: Math.round(latestEnergy.total * 0.12) },
  { department: 'Sewing Floors', kwh: Math.round(latestEnergy.total * 0.13) },
  { department: 'Printing & Embroidery', kwh: Math.round(latestEnergy.total * 0.09) },
  { department: 'Utilities & Lighting', kwh: Math.round(latestEnergy.total * 0.08) },
]

/** Granular Department SEC Breakdown compared against benchmarks */
export const departmentSecData = [
  {
    departmentKey: 'dyeing',
    name: 'Dyeing & Processing',
    stageLabel: 'Dyeing & Processing',
    unitName: 'Unit IV Processing',
    kwh: Math.round(latestEnergy.total * 0.41),
    productionKg: 6200,
    actualKwhPerKg: 1.98,
    benchmarkKwhPerKg: secBenchmarks.dyeing.benchmarkKwhPerKg,
    variancePct: 7.0,
    status: 'Normal',
  },
  {
    departmentKey: 'knitting',
    name: 'Knitting Operations',
    stageLabel: 'Knitting',
    unitName: 'Unit I',
    kwh: Math.round(latestEnergy.total * 0.17),
    productionKg: 9500,
    actualKwhPerKg: 0.72,
    benchmarkKwhPerKg: secBenchmarks.knitting.benchmarkKwhPerKg,
    variancePct: -4.0,
    status: 'Energy Efficient',
  },
  {
    departmentKey: 'compacting',
    name: 'Compacting & Finishing',
    stageLabel: 'Compacting',
    unitName: 'Unit IV Processing',
    kwh: Math.round(latestEnergy.total * 0.12),
    productionKg: 5800,
    actualKwhPerKg: 0.94,
    benchmarkKwhPerKg: secBenchmarks.compacting.benchmarkKwhPerKg,
    variancePct: 4.4,
    status: 'Normal',
  },
  {
    departmentKey: 'sewing',
    name: '24 Sewing Lines',
    stageLabel: 'Sewing',
    unitName: 'Units I, II, III',
    kwh: Math.round(latestEnergy.total * 0.13),
    productionKg: 7800,
    actualKwhPerKg: 0.58,
    benchmarkKwhPerKg: secBenchmarks.sewing.benchmarkKwhPerKg,
    variancePct: 5.5,
    status: 'Normal',
  },
  {
    departmentKey: 'printing',
    name: 'Printing & Embroidery',
    stageLabel: 'Printing',
    unitName: 'Unit III',
    kwh: Math.round(latestEnergy.total * 0.09),
    productionKg: 3200,
    actualKwhPerKg: 0.74,
    benchmarkKwhPerKg: secBenchmarks.printing.benchmarkKwhPerKg,
    variancePct: 13.8,
    status: 'High Consumption',
  },
  {
    departmentKey: 'utilities',
    name: 'Compressed Air & RO Plant',
    stageLabel: 'Utilities',
    unitName: 'Group Wide',
    kwh: Math.round(latestEnergy.total * 0.08),
    productionKg: 11000,
    actualKwhPerKg: 0.22,
    benchmarkKwhPerKg: 0.20,
    variancePct: 10.0,
    status: 'Normal',
  },
]

/** ZLD Water Mass Balance */
export const zldWaterBalance = calculateZldMassBalance({
  freshWaterIntakeKl: 85,
  dyeingProcessDemandKl: 540,
  washingProcessDemandKl: 180,
  roStage1FeedKl: 650,
  roStage1PermeateKl: 488, // 75%
  roStage2PermeateKl: 113, // 70% of reject
  meeCondensateKl: 38,     // MEE recovery
  etpInflowCodPpm: 2600,
  etpInflowBodPpm: 920,
  finalDischargeCodPpm: 24,
  finalDischargeBodPpm: 3,
})

/** Biomass Boiler Steam Analytics */
export const boilerAnalytics = calculateBoilerEfficiency({
  biomassBriquettesTons: 11.8,
  steamGeneratedTons: 46.5,
  feedWaterTempC: 68,
  steamPressureBar: 8.5,
  steamTempC: 175,
  fuelCalorificValueKcalPerKg: 3850,
})

/** Carbon Reduction & Renewable Summary */
export const carbonReduction = calculateCarbonOffset({
  solarKwh: latestEnergy.solar,
  windKwh: latestEnergy.wind,
  gridKwh: latestEnergy.grid,
  dieselLitres: Math.round(latestEnergy.diesel / 2.2),
})
