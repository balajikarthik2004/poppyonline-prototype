import { format, subDays, addDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { processStages, units } from './units'
import { exportOrders } from './orders'
import { styles } from './styles'

/**
 * Production history and the live work-order book.
 *
 * The daily series is anchored to the published capacities (10,000 kg knitted,
 * 12 t dyed, 100,000 pcs sewn per day) so the numbers move around a real
 * installed base rather than an invented one.
 */
const rng = makeRng(8890)

const HISTORY_DAYS = 90

/** Per-day output for every stage, 90 days back. */
export const productionHistory = Array.from({ length: HISTORY_DAYS }, (_, i) => {
  const date = subDays(new Date(), HISTORY_DAYS - 1 - i)
  const dow = date.getDay()
  // Sunday runs a maintenance shift only, so output drops sharply.
  const dayFactor = dow === 0 ? rng.float(0.18, 0.32, 2) : rng.float(0.86, 1.02, 2)

  const row = {
    date: date.toISOString(),
    label: format(date, 'dd MMM'),
    isSunday: dow === 0,
  }

  for (const stage of processStages) {
    const target = stage.dailyCapacity
    row[stage.key] = Math.round(target * dayFactor * rng.float(0.9, 1.0, 3))
    row[`${stage.key}Target`] = target
  }

  row.piecesShipped = Math.round(row.packing * rng.float(0.82, 1.0, 2))
  row.oeePct = rng.float(72, 91, 1)
  row.efficiencyPct = rng.float(58, 84, 1)
  row.dhuPct = rng.float(2.1, 8.4, 2)
  return row
})

export const latestProduction = productionHistory[productionHistory.length - 1]

/** Aggregate a slice of history for the selected date range. */
export function summariseHistory(days) {
  const slice = productionHistory.slice(-days)
  const sum = (key) => slice.reduce((acc, r) => acc + (r[key] ?? 0), 0)
  const avg = (key) => (slice.length ? sum(key) / slice.length : 0)
  return { slice, sum, avg }
}

const woStatuses = ['Released', 'In Progress', 'In Progress', 'In Progress', 'Completed', 'On Hold']

/** Work orders - one per cut, tracked stage by stage down the route. */
export const productionOrders = exportOrders.slice(0, 120).map((order, i) => {
  const style = styles.find((s) => s.id === order.styleId)
  const status = order.status === 'Shipped' ? 'Completed' : rng.pick(woStatuses)
  const plannedQty = order.quantityPcs
  const completedQty = status === 'Completed' ? plannedQty : Math.round(plannedQty * (order.completionPct / 100))
  const startDate = subDays(new Date(order.shipDate), rng.int(28, 52))

  const stageProgress = processStages.map((stage, idx) => {
    const reached = (order.completionPct / 100) * processStages.length
    const done = idx < Math.floor(reached)
    const active = idx === Math.floor(reached)
    return {
      key: stage.key,
      label: stage.label,
      pct: done ? 100 : active ? Math.round((reached - idx) * 100) : 0,
      state: done ? 'done' : active ? 'active' : 'pending',
    }
  })

  return {
    id: `WO-${String(i + 1).padStart(4, '0')}`,
    woNo: `WO/${format(startDate, 'yyMM')}/${String(700 + i)}`,
    orderId: order.id,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    styleName: order.styleName,
    segment: order.segment,
    unitId: order.unitId,
    unitName: order.unitName,
    lineNo: `Line ${rng.int(1, 24)}`,
    plannedQty,
    completedQty,
    rejectedQty: Math.round(completedQty * rng.float(0.005, 0.04, 4)),
    smv: style?.smv ?? 12,
    startDate: startDate.toISOString(),
    dueDate: subDays(new Date(order.shipDate), 5).toISOString(),
    status,
    progressPct: status === 'Completed' ? 100 : order.completionPct,
    currentStage: order.currentStageLabel,
    stageProgress,
    efficiencyPct: rng.float(52, 88, 1),
    risk: order.risk,
  }
})

export const productionOrderById = new Map(productionOrders.map((p) => [p.id, p]))

/** Rolling capacity load per unit against installed sewing capacity. */
export const capacityPlan = units.slice(0, 3).flatMap((unit) =>
  Array.from({ length: 12 }, (_, w) => {
    const weekStart = addDays(new Date(), w * 7)
    const capacityPcs = unit.dailyPieces * 6
    const bookedPcs = Math.round(capacityPcs * rng.float(0.62, 1.18, 2))
    return {
      unitId: unit.id,
      unitName: unit.shortName,
      week: `W${format(weekStart, 'ww')}`,
      weekStart: weekStart.toISOString(),
      capacityPcs,
      bookedPcs,
      loadPct: Math.round((bookedPcs / capacityPcs) * 1000) / 10,
      openPcs: Math.max(0, capacityPcs - bookedPcs),
    }
  }),
)

/** Live line board for the shop-floor view. */
export const sewingLines = Array.from({ length: 24 }, (_, i) => {
  const unit = rng.pick(units.slice(0, 3))
  const order = rng.pick(productionOrders)
  const targetPcs = rng.int(600, 1800)
  const actualPcs = Math.round(targetPcs * rng.float(0.62, 1.08, 2))
  return {
    id: `LN-${String(i + 1).padStart(2, '0')}`,
    name: `Line ${i + 1}`,
    unitId: unit.id,
    unitName: unit.shortName,
    operators: rng.int(22, 46),
    styleNo: order.styleNo,
    buyerName: order.buyerName,
    targetPcs,
    actualPcs,
    achievementPct: Math.round((actualPcs / targetPcs) * 1000) / 10,
    efficiencyPct: rng.float(48, 89, 1),
    dhuPct: rng.float(1.8, 9.2, 2),
    status: rng.pick(['Running', 'Running', 'Running', 'Changeover', 'Stopped']),
    supervisor: rng.pick([
      'M. Selvaraj',
      'P. Kalaivani',
      'R. Devendran',
      'S. Meenakshi',
      'V. Thangaraj',
      'J. Anitha',
    ]),
  }
})
