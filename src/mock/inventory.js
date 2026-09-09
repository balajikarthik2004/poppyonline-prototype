import { subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { yarnLots } from './yarn'
import { exportOrders } from './orders'
import { styles, fabricTypes } from './styles'
import { units, processStages } from './units'
import { suppliers } from './suppliers'

/**
 * Stock across the four stores a knitwear house runs: yarn, greige/dyed fabric,
 * work in progress on the floor, and finished goods awaiting shipment.
 */
const rng = makeRng(1145)

/** Yarn store, rolled up from the lot register. */
export const yarnStock = yarnLots
  .filter((l) => l.status !== 'Consumed')
  .map((lot) => ({
    id: lot.id,
    lotNo: lot.lotNo,
    item: `${lot.count} ${lot.blend}`,
    count: lot.count,
    blend: lot.blend,
    supplierName: lot.supplierName,
    location: lot.location,
    balanceKg: lot.balanceKg,
    valueInr: Math.round(lot.balanceKg * lot.rateInrPerKg),
    ageDays: Math.round((Date.now() - new Date(lot.receivedAt).getTime()) / 86400000),
    status: lot.status,
    reorderLevelKg: 1200,
  }))

const fabricStates = ['Greige', 'Dyed', 'Compacted', 'Printed']

export const fabricStock = Array.from({ length: 58 }, (_, i) => {
  const order = rng.pick(exportOrders)
  const quantityKg = rng.int(80, 3200)
  const state = rng.pick(fabricStates)
  return {
    id: `FAB-${String(i + 1).padStart(4, '0')}`,
    rollBatch: `FB/${String(7100 + i)}`,
    fabricType: rng.pick(fabricTypes),
    gsm: rng.int(120, 320),
    colour: rng.pick(['Navy', 'White', 'Black', 'Melange Grey', 'Sky Blue', 'Olive', 'Coral', 'Ecru']),
    state,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    quantityKg,
    rolls: Math.ceil(quantityKg / rng.int(18, 28)),
    location: rng.pick(['Fabric Store 1', 'Fabric Store 2', 'Dye House Bay', 'Cutting Feed Rack']),
    receivedAt: subDays(new Date(), rng.int(0, 60)).toISOString(),
    shadeLot: `SH-${rng.int(100, 999)}`,
    status: rng.pick(['Available', 'Available', 'Available', 'Allocated', 'On Hold']),
  }
})

/** WIP sitting between stages on the floor. */
export const wipStock = processStages.slice(3).flatMap((stage) =>
  units.slice(0, 3).map((unit, i) => {
    const quantityPcs = rng.int(1800, 26000)
    return {
      id: `WIP-${stage.key}-${unit.id}-${i}`,
      stage: stage.label,
      stageKey: stage.key,
      unitId: unit.id,
      unitName: unit.shortName,
      quantityPcs,
      styles: rng.int(2, 11),
      ageDays: rng.float(0.5, 9, 1),
      /** Anything sitting more than four days is a genuine flow problem. */
      isAging: rng.bool(0.22),
      valueUsd: Math.round(quantityPcs * rng.float(1.4, 7.5, 2)),
    }
  }),
)

export const finishedGoods = exportOrders
  .filter((o) => o.status === 'Ready to Ship' || o.status === 'In Production')
  .slice(0, 64)
  .map((order, i) => {
    const packedPcs = Math.round(order.quantityPcs * rng.float(0.1, 1, 2))
    return {
      id: `FG-${String(i + 1).padStart(4, '0')}`,
      orderNo: order.orderNo,
      buyerName: order.buyerName,
      country: order.country,
      styleNo: order.styleNo,
      styleName: order.styleName,
      segment: order.segment,
      packedPcs,
      cartons: Math.ceil(packedPcs / rng.int(40, 90)),
      valueUsd: Math.round(packedPcs * order.fobUsd),
      warehouse: rng.pick(['FG Warehouse A', 'FG Warehouse B', 'Dispatch Bay']),
      shipDate: order.shipDate,
      daysToShip: order.daysToShip,
      status: order.daysToShip < 0 ? 'Overdue' : packedPcs >= order.quantityPcs ? 'Ready' : 'Packing',
    }
  })

const movementTypes = ['Receipt', 'Issue', 'Transfer', 'Return', 'Adjustment']

export const stockMovements = Array.from({ length: 120 }, (_, i) => {
  const type = rng.pick(movementTypes)
  const store = rng.pick(['Yarn Store', 'Fabric Store', 'Trims Store', 'FG Warehouse'])
  const isKg = store === 'Yarn Store' || store === 'Fabric Store'
  return {
    id: `MOV-${String(i + 1).padStart(4, '0')}`,
    docNo: `${type.slice(0, 3).toUpperCase()}/${String(5400 + i)}`,
    type,
    store,
    item:
      store === 'Yarn Store'
        ? `${rng.pick(['20s', '26s', '30s', '32s', '40s'])} Combed Cotton`
        : store === 'Fabric Store'
          ? `${rng.pick(fabricTypes)} ${rng.int(140, 300)} GSM`
          : store === 'Trims Store'
            ? rng.pick(['Sewing thread', 'Woven label', 'Care label', 'Poly bag', 'Carton'])
            : rng.pick(styles).styleNo,
    quantity: isKg ? rng.int(40, 2400) : rng.int(200, 12000),
    unitOfMeasure: isKg ? 'kg' : 'pcs',
    direction: type === 'Receipt' || type === 'Return' ? 'in' : type === 'Adjustment' ? 'adj' : 'out',
    reference: rng.pick(exportOrders).orderNo,
    party: rng.pick([...suppliers.map((s) => s.name), 'Cutting Section', 'Sewing Floor', 'Dye House']),
    unitName: rng.pick(units).shortName,
    movedAt: subDays(new Date(), rng.int(0, 30)).toISOString(),
    by: rng.pick(['Store Keeper A', 'Store Keeper B', 'Floor Supervisor', 'Dispatch Clerk']),
  }
})

/** Headline numbers for the inventory overview. */
export function buildInventorySummary() {
  const yarnKg = yarnStock.reduce((s, r) => s + r.balanceKg, 0)
  const fabricKg = fabricStock.reduce((s, r) => s + r.quantityKg, 0)
  const wipPcs = wipStock.reduce((s, r) => s + r.quantityPcs, 0)
  const fgPcs = finishedGoods.reduce((s, r) => s + r.packedPcs, 0)

  return {
    yarnKg,
    yarnValueInr: yarnStock.reduce((s, r) => s + r.valueInr, 0),
    fabricKg,
    fabricRolls: fabricStock.reduce((s, r) => s + r.rolls, 0),
    wipPcs,
    wipValueUsd: wipStock.reduce((s, r) => s + r.valueUsd, 0),
    agingWipLots: wipStock.filter((r) => r.isAging).length,
    fgPcs,
    fgCartons: finishedGoods.reduce((s, r) => s + r.cartons, 0),
    fgValueUsd: finishedGoods.reduce((s, r) => s + r.valueUsd, 0),
    overdueFg: finishedGoods.filter((r) => r.status === 'Overdue').length,
    belowReorder: yarnStock.filter((r) => r.balanceKg < r.reorderLevelKg).length,
  }
}
