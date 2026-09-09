import { addDays, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { suppliers } from './suppliers'
import { exportOrders } from './orders'
import { units } from './units'

/**
 * The buying desk: requisitions raised against confirmed orders, purchase
 * orders placed on the approved vendor list, and goods receipt notes closing
 * the loop at the gate.
 */
const rng = makeRng(3907)

const itemsByCategory = {
  Yarn: ['20s Combed Cotton', '26s Combed Cotton', '30s Compact', '32s Melange', '40s Organic', '2/40s Doubled'],
  'Chemicals & Dyes': ['Reactive Navy', 'Reactive Red', 'Softener', 'Caustic Soda', 'Hydrogen Peroxide', 'Enzyme'],
  Trims: ['Sewing thread 40/2', 'Woven main label', 'Care label', 'Elastic 25mm', 'Buttons 18L', 'Zipper 12cm'],
  Packaging: ['Poly bag 10x14', 'Master carton 5-ply', 'Hang tag', 'Barcode sticker', 'Tissue paper'],
  'Job Work': ['Compacting charges', 'Embroidery job work', 'Garment wash', 'Printing job work'],
  Logistics: ['Inland haulage', 'CHA charges', 'Container stuffing'],
}

const prStatuses = ['Draft', 'Pending Approval', 'Pending Approval', 'Approved', 'Approved', 'Converted', 'Rejected']

export const purchaseRequisitions = Array.from({ length: 58 }, (_, i) => {
  const supplier = rng.pick(suppliers)
  const item = rng.pick(itemsByCategory[supplier.category] ?? ['General item'])
  const order = rng.pick(exportOrders)
  const isKg = supplier.category === 'Yarn' || supplier.category === 'Chemicals & Dyes'
  const quantity = isKg ? rng.int(200, 6000) : rng.int(500, 40000)
  const rate = isKg ? rng.int(120, 420) : rng.float(1.2, 48, 2)

  return {
    id: `PR-${String(i + 1).padStart(4, '0')}`,
    prNo: `PR/26/${String(1200 + i)}`,
    category: supplier.category,
    item,
    quantity,
    unitOfMeasure: isKg ? 'kg' : 'pcs',
    estimatedRate: rate,
    estimatedValueInr: Math.round(quantity * rate),
    againstOrder: order.orderNo,
    buyerName: order.buyerName,
    unitName: rng.pick(units).shortName,
    raisedBy: rng.pick(['Merchandising', 'Store', 'Production Planning', 'Dye House']),
    raisedAt: subDays(new Date(), rng.int(0, 45)).toISOString(),
    requiredBy: addDays(new Date(), rng.int(2, 40)).toISOString(),
    priority: rng.pick(['Normal', 'Normal', 'Normal', 'Urgent', 'Critical']),
    status: rng.pick(prStatuses),
  }
})

const poStatuses = ['Open', 'Open', 'Partially Received', 'Received', 'Received', 'Closed', 'Cancelled']

export const purchaseOrders = Array.from({ length: 76 }, (_, i) => {
  const supplier = rng.pick(suppliers)
  const item = rng.pick(itemsByCategory[supplier.category] ?? ['General item'])
  const order = rng.pick(exportOrders)
  const isKg = supplier.category === 'Yarn' || supplier.category === 'Chemicals & Dyes'
  const quantity = isKg ? rng.int(300, 8000) : rng.int(1000, 60000)
  const rate = isKg ? rng.int(120, 420) : rng.float(1.2, 48, 2)
  const status = rng.pick(poStatuses)
  const receivedQty =
    status === 'Received' || status === 'Closed'
      ? quantity
      : status === 'Partially Received'
        ? Math.round(quantity * rng.float(0.2, 0.85, 2))
        : 0
  const deliveryDate = addDays(new Date(), rng.int(-18, 42))

  return {
    id: `PO-${String(i + 1).padStart(4, '0')}`,
    poNo: `PO/26/${String(3400 + i)}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    category: supplier.category,
    item,
    quantity,
    receivedQty,
    pendingQty: quantity - receivedQty,
    unitOfMeasure: isKg ? 'kg' : 'pcs',
    rate,
    valueInr: Math.round(quantity * rate),
    againstOrder: order.orderNo,
    orderedAt: subDays(new Date(), rng.int(2, 70)).toISOString(),
    deliveryDate: deliveryDate.toISOString(),
    isOverdue: deliveryDate < new Date() && status !== 'Received' && status !== 'Closed',
    paymentTerms: supplier.paymentTerms,
    status,
  }
})

export const goodsReceipts = purchaseOrders
  .filter((po) => po.receivedQty > 0)
  .slice(0, 62)
  .map((po, i) => {
    const acceptedQty = Math.round(po.receivedQty * rng.float(0.92, 1, 3))
    return {
      id: `GRN-${String(i + 1).padStart(4, '0')}`,
      grnNo: `GRN/26/${String(2200 + i)}`,
      poNo: po.poNo,
      supplierName: po.supplierName,
      category: po.category,
      item: po.item,
      receivedQty: po.receivedQty,
      acceptedQty,
      rejectedQty: po.receivedQty - acceptedQty,
      unitOfMeasure: po.unitOfMeasure,
      valueInr: Math.round(acceptedQty * po.rate),
      receivedAt: subDays(new Date(), rng.int(0, 40)).toISOString(),
      invoiceNo: `SI/${rng.int(10000, 99999)}`,
      store: po.category === 'Yarn' ? 'Yarn Store' : po.category === 'Packaging' ? 'Packing Store' : 'Trims Store',
      inspection: rng.pick(['Passed', 'Passed', 'Passed', 'Passed', 'Partial', 'Under Test']),
      receivedBy: rng.pick(['Store Keeper A', 'Store Keeper B', 'Gate Security']),
    }
  })

export function buildProcurementSummary() {
  const openPos = purchaseOrders.filter((p) => p.status === 'Open' || p.status === 'Partially Received')
  return {
    openPoCount: openPos.length,
    openPoValueInr: openPos.reduce((s, p) => s + p.valueInr, 0),
    overduePoCount: purchaseOrders.filter((p) => p.isOverdue).length,
    pendingPrCount: purchaseRequisitions.filter((p) => p.status === 'Pending Approval').length,
    urgentPrCount: purchaseRequisitions.filter((p) => p.priority !== 'Normal' && p.status !== 'Converted').length,
    grnThisMonth: goodsReceipts.length,
    grnValueInr: goodsReceipts.reduce((s, g) => s + g.valueInr, 0),
    activeSuppliers: suppliers.filter((s) => s.status === 'Approved').length,
    avgSupplierRating:
      Math.round((suppliers.reduce((s, v) => s + v.rating, 0) / suppliers.length) * 10) / 10,
    byCategory: [...new Set(suppliers.map((s) => s.category))].map((category) => ({
      category,
      valueInr: purchaseOrders.filter((p) => p.category === category).reduce((s, p) => s + p.valueInr, 0),
      orders: purchaseOrders.filter((p) => p.category === category).length,
    })),
  }
}
