/**
 * Specific Energy Consumption (SEC) Calculation Engine
 * SEC = Energy (kWh) / Fabric Processed (kg)
 */

export const secBenchmarks = {
  knitting: { benchmarkKwhPerKg: 0.75, varianceTolerancePct: 10, unit: 'kWh/kg' },
  dyeing: { benchmarkKwhPerKg: 1.85, varianceTolerancePct: 12, unit: 'kWh/kg' },
  compacting: { benchmarkKwhPerKg: 0.90, varianceTolerancePct: 10, unit: 'kWh/kg' },
  cutting: { benchmarkKwhPerKg: 0.25, varianceTolerancePct: 15, unit: 'kWh/kg' },
  printing: { benchmarkKwhPerKg: 0.65, varianceTolerancePct: 10, unit: 'kWh/kg' },
  embroidery: { benchmarkKwhPerKg: 0.45, varianceTolerancePct: 10, unit: 'kWh/kg' },
  sewing: { benchmarkKwhPerKg: 0.55, varianceTolerancePct: 10, unit: 'kWh/kg' },
  checking: { benchmarkKwhPerKg: 0.15, varianceTolerancePct: 10, unit: 'kWh/kg' },
  packing: { benchmarkKwhPerKg: 0.20, varianceTolerancePct: 10, unit: 'kWh/kg' },
}

export function calculateDepartmentSec({ departmentKey, totalKwh = 0, productionKg = 1 }) {
  const actualKwhPerKg = productionKg > 0 ? Math.round((totalKwh / productionKg) * 100) / 100 : 0
  const cfg = secBenchmarks[departmentKey] ?? { benchmarkKwhPerKg: 1.0, varianceTolerancePct: 10 }
  const benchmark = cfg.benchmarkKwhPerKg

  const variancePct = benchmark > 0 ? Math.round(((actualKwhPerKg - benchmark) / benchmark) * 1000) / 10 : 0
  const isHighEnergyAlert = variancePct > cfg.varianceTolerancePct

  return {
    departmentKey,
    actualKwhPerKg,
    benchmarkKwhPerKg: benchmark,
    variancePct,
    isHighEnergyAlert,
    status: isHighEnergyAlert ? 'High Consumption' : variancePct < 0 ? 'Energy Efficient' : 'Normal',
  }
}
