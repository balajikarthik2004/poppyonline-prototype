import { addDays, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { buyers } from './buyers'
import { styles } from './styles'
import { units, processStages } from './units'

/**
 * The export order book. Every order carries a buyer, a style, a ship window
 * and a live position on the process route, so the dashboard can answer the
 * only question that matters in an export house: will it ship on time.
 */
const rng = makeRng(2210)

const orderStatuses = ['Confirmed', 'In Production', 'In Production', 'In Production', 'Ready to Ship', 'Shipped']

/** Where an order currently sits on the route. */
const routeKeys = processStages.map((s) => s.key)

function riskFor(daysToShip, completionPct, status) {
  if (status === 'Shipped') return 'completed'
  if (daysToShip < 0) return 'delayed'
  // Expected progress assumes a 45-day cycle from confirmation to ship.
  const expected = Math.max(0, Math.min(100, ((45 - daysToShip) / 45) * 100))
  if (completionPct < expected - 22) return 'delayed'
  if (completionPct < expected - 8) return 'atRisk'
  return 'onSchedule'
}

export const exportOrders = Array.from({ length: 186 }, (_, i) => {
  const style = rng.pick(styles)
  const buyer = buyers.find((b) => b.id === style.buyerId) ?? rng.pick(buyers)
  const unit = rng.pick(units.slice(0, 3))
  const quantityPcs = rng.int(1500, 68000)
  const status = rng.pick(orderStatuses)
  const completionPct = status === 'Shipped' ? 100 : status === 'Ready to Ship' ? rng.float(96, 100, 1) : rng.float(4, 95, 1)
  const daysToShip = status === 'Shipped' ? -rng.int(1, 40) : rng.int(-9, 62)
  const shipDate = addDays(new Date(), daysToShip)
  const orderDate = subDays(shipDate, rng.int(38, 78))
  const fobUsd = style.fobUsd
  const stageIndex = Math.min(routeKeys.length - 1, Math.floor((completionPct / 100) * routeKeys.length))

  return {
    id: `EXP-${String(i + 1).padStart(4, '0')}`,
    orderNo: `PO/${buyer.code}/${String(4100 + i)}`,
    buyerId: buyer.id,
    buyerName: buyer.name,
    country: buyer.country,
    region: buyer.region,
    styleId: style.id,
    styleNo: style.styleNo,
    styleName: style.name,
    segment: style.segment,
    fabric: style.fabric,
    unitId: unit.id,
    unitName: unit.shortName,
    quantityPcs,
    shippedPcs: status === 'Shipped' ? quantityPcs : Math.round(quantityPcs * (completionPct / 100) * rng.float(0, 0.4, 2)),
    fobUsd,
    valueUsd: Math.round(quantityPcs * fobUsd),
    orderDate: orderDate.toISOString(),
    shipDate: shipDate.toISOString(),
    daysToShip,
    status,
    completionPct,
    currentStage: routeKeys[stageIndex],
    currentStageLabel: processStages[stageIndex].label,
    risk: riskFor(daysToShip, completionPct, status),
    incoterm: buyer.incoterm,
    paymentTerms: buyer.paymentTerms,
    merchandiser: buyer.merchandiser,
    season: style.season,
    /** Fabric booked against the order, in kg - drives the fabric store view. */
    fabricRequiredKg: Math.round(quantityPcs * style.fabricConsumptionKg),
  }
})

export const orderById = new Map(exportOrders.map((o) => [o.id, o]))

export const orderStatusTiles = [
  {
    key: 'onSchedule',
    label: 'On Schedule',
    tone: 'success',
    count: exportOrders.filter((o) => o.risk === 'onSchedule').length,
  },
  {
    key: 'atRisk',
    label: 'At Risk',
    tone: 'warning',
    count: exportOrders.filter((o) => o.risk === 'atRisk').length,
  },
  {
    key: 'delayed',
    label: 'Delayed',
    tone: 'danger',
    count: exportOrders.filter((o) => o.risk === 'delayed').length,
  },
  {
    key: 'completed',
    label: 'Shipped',
    tone: 'info',
    count: exportOrders.filter((o) => o.risk === 'completed').length,
  },
]

/** Container bookings against shipped and ready orders. */
const ports = ['Tuticorin', 'Chennai', 'Cochin', 'Nhava Sheva']
const shippingLines = ['Maersk', 'MSC', 'CMA CGM', 'Hapag-Lloyd', 'ONE']
const shipmentStatuses = ['Planned', 'Stuffed', 'Gated In', 'Sailed', 'In Transit', 'Delivered']

export const shipments = exportOrders
  .filter((o) => o.status === 'Shipped' || o.status === 'Ready to Ship')
  .slice(0, 72)
  .map((order, i) => {
    const status = order.status === 'Shipped' ? rng.pick(['Sailed', 'In Transit', 'Delivered']) : rng.pick(['Planned', 'Stuffed', 'Gated In'])
    const sailDate = addDays(new Date(order.shipDate), rng.int(-3, 6))
    return {
      id: `SHP-${String(i + 1).padStart(4, '0')}`,
      invoiceNo: `INV/26/${String(1800 + i)}`,
      orderId: order.id,
      orderNo: order.orderNo,
      buyerName: order.buyerName,
      country: order.country,
      styleNo: order.styleNo,
      cartons: Math.ceil(order.quantityPcs / rng.int(40, 90)),
      quantityPcs: order.quantityPcs,
      valueUsd: order.valueUsd,
      containerNo: `${rng.pick(['MSKU', 'MSCU', 'CMAU', 'HLXU'])}${rng.int(1000000, 9999999)}`,
      containerType: rng.pick(['20FT', '40FT', '40HC']),
      port: rng.pick(ports),
      line: rng.pick(shippingLines),
      incoterm: order.incoterm,
      sailDate: sailDate.toISOString(),
      etaDate: addDays(sailDate, rng.int(18, 34)).toISOString(),
      status,
      /** Export documentation completeness - a real gating item at the port. */
      docsComplete: rng.bool(0.82),
    }
  })

export const shipmentStatusOptions = shipmentStatuses
