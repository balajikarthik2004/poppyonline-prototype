import { latestProduction, productionHistory, productionOrders } from './production'
import { exportOrders } from './orders'
import { latestEnergy } from './energy'
import { buildQualitySummary } from './quality'

/**
 * The six figures the managing director looks at first. Each links through to
 * the module that owns it, so no headline is a dead end.
 */
const quality = buildQualitySummary()

const prev = productionHistory[productionHistory.length - 2]

function trend(current, previous) {
  if (!previous) return { direction: 'flat', changePct: 0 }
  const changePct = Math.round(((current - previous) / previous) * 1000) / 10
  return {
    direction: changePct > 0.2 ? 'up' : changePct < -0.2 ? 'down' : 'flat',
    changePct: Math.abs(changePct),
  }
}

const shippedThisMonth = exportOrders
  .filter((o) => o.status === 'Shipped')
  .reduce((s, o) => s + o.valueUsd, 0)

const onTimeOrders = exportOrders.filter((o) => o.risk === 'onSchedule' || o.risk === 'completed').length
const onTimePct = Math.round((onTimeOrders / exportOrders.length) * 1000) / 10

const avgEfficiency =
  productionOrders.reduce((s, p) => s + p.efficiencyPct, 0) / (productionOrders.length || 1)

export const kpiCards = [
  {
    id: 'garmentOutput',
    label: 'Garment Output',
    value: latestProduction.packing,
    displayValue: `${(latestProduction.packing / 1000).toFixed(1)}k pcs`,
    footnote: 'per day',
    compareLabel: 'vs yesterday',
    trend: trend(latestProduction.packing, prev?.packing),
    linkTo: '/production',
  },
  {
    id: 'fabricKnitted',
    label: 'Fabric Knitted',
    value: latestProduction.knitting,
    displayValue: `${(latestProduction.knitting / 1000).toFixed(1)}t`,
    footnote: 'per day',
    compareLabel: 'vs yesterday',
    trend: trend(latestProduction.knitting, prev?.knitting),
    linkTo: '/production/knitting',
  },
  {
    id: 'lineEfficiency',
    label: 'Line Efficiency',
    value: avgEfficiency,
    displayValue: `${avgEfficiency.toFixed(1)}%`,
    footnote: 'sewing floors',
    compareLabel: 'vs last week',
    trend: trend(latestProduction.efficiencyPct, prev?.efficiencyPct),
    linkTo: '/production/sewing',
  },
  {
    id: 'qualityPass',
    label: 'AQL Pass Rate',
    value: quality.aqlPassRatePct,
    displayValue: `${quality.aqlPassRatePct.toFixed(1)}%`,
    footnote: `DHU ${quality.avgDhuPct}%`,
    compareLabel: 'final audits',
    trend: { direction: 'up', changePct: 1.2 },
    linkTo: '/quality/aql',
  },
  {
    id: 'ordersOnTime',
    label: 'Orders On-Time',
    value: onTimePct,
    displayValue: `${onTimePct.toFixed(0)}%`,
    footnote: `${exportOrders.length} live orders`,
    compareLabel: 'order book',
    trend: { direction: onTimePct > 85 ? 'up' : 'down', changePct: 0.8 },
    linkTo: '/sales/export-orders',
  },
  {
    id: 'exportValue',
    label: 'Shipped Value',
    value: shippedThisMonth,
    displayValue: `$${(shippedThisMonth / 1_000_000).toFixed(1)}M`,
    footnote: 'season to date',
    compareLabel: 'FOB',
    trend: { direction: 'up', changePct: 4.6 },
    linkTo: '/sales/shipments',
  },
]

/** Secondary strip under the KPI row on the dashboard. */
export const sustainabilitySnapshot = {
  renewablePct: latestEnergy.renewablePct,
  kwhPerKg: latestEnergy.kwhPerKg,
  waterRecoveredPct: Math.round((latestEnergy.waterRecoveredKl / latestEnergy.waterKl) * 1000) / 10,
  co2Tonnes: latestEnergy.co2Tonnes,
}
