import { addDays, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { suppliers } from './suppliers'

/**
 * Yarn lots as they arrive at the knitting store. A knitwear house tracks yarn
 * by count, blend and lot, because shade continuity within a buyer order
 * depends on staying inside one dye lot family.
 */
const rng = makeRng(5560)

const yarnSuppliers = suppliers.filter((s) => s.category === 'Yarn')

export const yarnCounts = ['20s', '24s', '26s', '30s', '32s', '34s', '40s', '2/40s']
export const yarnBlends = [
  '100% Cotton Combed',
  '100% Cotton Carded',
  'Cotton/Elastane 95/5',
  'Poly/Cotton 65/35',
  'Organic Cotton (GOTS)',
  'BCI Cotton',
  'Melange 90/10',
]

export const yarnLots = Array.from({ length: 42 }, (_, i) => {
  const supplier = rng.pick(yarnSuppliers)
  const receivedDaysAgo = rng.int(1, 75)
  const receivedAt = subDays(new Date(), receivedDaysAgo)
  const quantityKg = rng.int(800, 9500)
  const consumedKg = Math.min(quantityKg, Math.round(quantityKg * rng.float(0, 1, 2)))
  const count = rng.pick(yarnCounts)

  return {
    id: `YRN-${String(i + 1).padStart(4, '0')}`,
    lotNo: `L${String(48200 + i * 7)}`,
    count,
    blend: rng.pick(yarnBlends),
    supplierId: supplier.id,
    supplierName: supplier.name,
    receivedAt: receivedAt.toISOString(),
    expiryAt: addDays(receivedAt, 180).toISOString(),
    quantityKg,
    consumedKg,
    balanceKg: quantityKg - consumedKg,
    rateInrPerKg: rng.int(215, 395),
    /** Lab figures a knitter cares about before releasing a lot to machines. */
    csp: rng.int(2050, 2680),
    uster: rng.float(9.2, 14.8, 2),
    imperfections: rng.int(28, 145),
    rkm: rng.float(14.5, 21.5, 1),
    status: rng.pick(['Released', 'Released', 'Released', 'Quarantine', 'Under Test', 'Consumed']),
    location: rng.pick(['Yarn Store A', 'Yarn Store B', 'Mezzanine Rack', 'Transit Bay']),
  }
})

export const yarnLotById = new Map(yarnLots.map((l) => [l.id, l]))
