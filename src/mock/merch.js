import { addDays, subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { styles } from './styles'
import { buyers } from './buyers'

/**
 * The merchandising desk: the sample pipeline every style must clear before
 * bulk is released, and the cost sheet that decides whether the order is worth
 * taking at the buyer's target FOB.
 */
const rng = makeRng(6023)

/** The sample stages a garment export house actually runs, in order. */
export const sampleStages = [
  'Proto',
  'Fit',
  'Size Set',
  'Pre-Production (PP)',
  'Photoshoot',
  'Shipment Sample',
]

const sampleStatuses = ['Submitted', 'Approved', 'Approved', 'Rejected', 'Revision Requested', 'In Development']

export const samples = Array.from({ length: 72 }, (_, i) => {
  const style = rng.pick(styles)
  const stage = rng.pick(sampleStages)
  const status = rng.pick(sampleStatuses)
  const requestedAt = subDays(new Date(), rng.int(2, 70))

  return {
    id: `SMP-${String(i + 1).padStart(4, '0')}`,
    sampleNo: `SM/${String(5100 + i)}`,
    styleId: style.id,
    styleNo: style.styleNo,
    styleName: style.name,
    segment: style.segment,
    buyerName: style.buyerName,
    season: style.season,
    stage,
    quantity: rng.int(2, 24),
    requestedAt: requestedAt.toISOString(),
    dueAt: addDays(requestedAt, rng.int(7, 24)).toISOString(),
    submittedAt: status === 'In Development' ? null : addDays(requestedAt, rng.int(5, 22)).toISOString(),
    status,
    /** Rounds of revision before approval - the real cost driver in sampling. */
    revisions: rng.int(0, 4),
    comments:
      status === 'Approved'
        ? null
        : rng.pick([
            'Neck rib width to be reduced by 2mm',
            'Sleeve length short by 1cm on size M',
            'Shade slightly warmer than the approved swatch',
            'Print placement to move 1.5cm higher',
            'Embroidery density causing puckering',
          ]),
    merchandiser: rng.pick(buyers).merchandiser,
  }
})

/** Cost sheets, built the way a Tirupur costing desk builds them. */
export const costSheets = styles.slice(0, 44).map((style, i) => {
  const fabricRateInr = rng.int(240, 420)
  const fabricCost = style.fabricConsumptionKg * fabricRateInr
  const trims = rng.float(8, 46, 2)
  const cmt = style.smv * rng.float(3.2, 5.4, 2)
  const printEmb = style.decoration.includes('print') || style.decoration.includes('Embroidery') ? rng.float(6, 32, 2) : 0
  const overhead = (fabricCost + trims + cmt) * rng.float(0.08, 0.16, 3)
  const totalInr = fabricCost + trims + cmt + printEmb + overhead
  const usdRate = 88.5
  const costUsd = Math.round((totalInr / usdRate) * 100) / 100
  const marginPct = Math.round(((style.fobUsd - costUsd) / style.fobUsd) * 1000) / 10

  return {
    id: `CST-${String(i + 1).padStart(4, '0')}`,
    styleId: style.id,
    styleNo: style.styleNo,
    styleName: style.name,
    segment: style.segment,
    buyerName: style.buyerName,
    season: style.season,
    fabricConsumptionKg: style.fabricConsumptionKg,
    fabricRateInr,
    fabricCostInr: Math.round(fabricCost * 100) / 100,
    trimsInr: trims,
    cmtInr: Math.round(cmt * 100) / 100,
    printEmbInr: printEmb,
    overheadInr: Math.round(overhead * 100) / 100,
    totalCostInr: Math.round(totalInr * 100) / 100,
    costUsd,
    quotedFobUsd: style.fobUsd,
    marginPct,
    status: marginPct < 8 ? 'Review' : marginPct < 14 ? 'Thin' : 'Healthy',
    preparedBy: rng.pick(buyers).merchandiser,
    preparedAt: subDays(new Date(), rng.int(1, 90)).toISOString(),
  }
})
