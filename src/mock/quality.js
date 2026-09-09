import { subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { exportOrders } from './orders'
import { yarnLots } from './yarn'
import { buyers } from './buyers'
import { processStages } from './units'

/**
 * Quality records across the three gates a knitwear export house actually runs:
 * the laboratory (yarn and fabric), inline inspection on the sewing floor, and
 * the final AQL audit before cartons are sealed. Oeko-Tex Standard 100 and
 * SITRA assurance are the certifications the company publishes.
 */
const rng = makeRng(6677)

export const labTestTypes = [
  { name: 'Shrinkage', standard: 'ISO 6330', unit: '%', tolerance: '-5% to +2%' },
  { name: 'Colour Fastness to Washing', standard: 'ISO 105-C06', unit: 'grade', tolerance: 'Min 4' },
  { name: 'Colour Fastness to Rubbing', standard: 'ISO 105-X12', unit: 'grade', tolerance: 'Min 3-4' },
  { name: 'Pilling Resistance', standard: 'ISO 12945-2', unit: 'grade', tolerance: 'Min 3-4' },
  { name: 'Bursting Strength', standard: 'ISO 13938-1', unit: 'kPa', tolerance: 'Min 250' },
  { name: 'Spirality', standard: 'ISO 16322', unit: '%', tolerance: 'Max 5' },
  { name: 'GSM Verification', standard: 'ISO 3801', unit: 'g/m2', tolerance: '+/- 5%' },
  { name: 'pH Value', standard: 'ISO 3071', unit: 'pH', tolerance: '4.5 - 7.5' },
  { name: 'Yarn Count (CSP)', standard: 'ASTM D1907', unit: 'CSP', tolerance: 'Min 2100' },
  { name: 'Azo Free Certification', standard: 'EN 14362-1', unit: 'ppm', tolerance: 'Not detected' },
]

const labStages = ['Yarn', 'Greige Fabric', 'Dyed Fabric', 'Garment']

export const labTests = Array.from({ length: 96 }, (_, i) => {
  const testType = rng.pick(labTestTypes)
  const stage = rng.pick(labStages)
  const order = rng.pick(exportOrders)
  const result = rng.pick(['Pass', 'Pass', 'Pass', 'Pass', 'Pass', 'Pass', 'Pass', 'Rework', 'Fail'])

  return {
    id: `LAB-${String(i + 1).padStart(4, '0')}`,
    testNo: `CTL/${String(9200 + i)}`,
    stage,
    testName: testType.name,
    standard: testType.standard,
    tolerance: testType.tolerance,
    unit: testType.unit,
    orderId: order.id,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    lotNo: stage === 'Yarn' ? rng.pick(yarnLots).lotNo : null,
    testedDate: subDays(new Date(), rng.int(0, 30)).toISOString(),
    testedBy: rng.pick(['A. Kavitha', 'S. Ramesh', 'D. Priya', 'M. Gopinath']),
    result,
    remarks:
      result === 'Pass'
        ? null
        : rng.pick([
            'Shrinkage beyond buyer tolerance after third wash',
            'Shade variation between rolls of the same lot',
            'Pilling grade one step below the buyer standard',
            'GSM below the approved swatch',
            'Spirality on the side seam exceeds 5%',
          ]),
  }
})

/** Inline inspection - the sewing-floor gate, measured as defects per hundred units. */
export const inlineInspections = Array.from({ length: 84 }, (_, i) => {
  const order = rng.pick(exportOrders)
  const checked = rng.int(120, 900)
  const defects = Math.round(checked * rng.float(0.01, 0.11, 4))
  const dhu = Math.round((defects / checked) * 1000) / 10

  return {
    id: `INL-${String(i + 1).padStart(4, '0')}`,
    reportNo: `INL/${String(3300 + i)}`,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    unitName: order.unitName,
    lineNo: `Line ${rng.int(1, 24)}`,
    inspectedAt: subDays(new Date(), rng.int(0, 21)).toISOString(),
    checkedPcs: checked,
    defectsFound: defects,
    dhuPct: dhu,
    topDefect: rng.pick([
      'Broken stitch',
      'Skip stitch',
      'Uneven hem',
      'Open seam',
      'Puckering',
      'Shade variation',
      'Measurement out',
      'Loose thread',
    ]),
    verdict: dhu <= 3 ? 'Pass' : dhu <= 6 ? 'Rework' : 'Stop Line',
    inspector: rng.pick(['R. Lakshmi', 'K. Suresh', 'V. Nithya', 'P. Manoj']),
  }
})

/** Final AQL audit against each buyer's own published sampling level. */
export const aqlAudits = Array.from({ length: 66 }, (_, i) => {
  const order = rng.pick(exportOrders)
  const buyer = buyers.find((b) => b.id === order.buyerId) ?? rng.pick(buyers)
  const lotSize = order.quantityPcs
  const sampleSize = lotSize > 35000 ? 315 : lotSize > 10000 ? 200 : lotSize > 3200 ? 125 : 80
  const acceptLimit = buyer.aqlLevel === 'AQL 1.5' ? 7 : buyer.aqlLevel === 'AQL 2.5' ? 10 : 14
  const majorDefects = rng.int(0, acceptLimit + 6)
  const verdict = majorDefects <= acceptLimit ? 'Pass' : rng.bool(0.4) ? 'Re-inspect' : 'Fail'

  return {
    id: `AQL-${String(i + 1).padStart(4, '0')}`,
    auditNo: `FA/${String(2400 + i)}`,
    orderNo: order.orderNo,
    buyerName: buyer.name,
    styleNo: order.styleNo,
    unitName: order.unitName,
    aqlLevel: buyer.aqlLevel,
    lotSize,
    sampleSize,
    acceptLimit,
    majorDefects,
    minorDefects: rng.int(0, 28),
    auditedAt: subDays(new Date(), rng.int(0, 28)).toISOString(),
    verdict,
    auditor: rng.pick(['Third-party: SGS', 'Third-party: Intertek', 'Internal QA', 'Buyer QA']),
  }
})

const rejectionReasons = [
  'Measurement deviation',
  'Shade variation',
  'Stitching defect',
  'Fabric hole',
  'Print misalignment',
  'Embroidery puckering',
  'Dyeing patch',
  'Yarn contamination',
  'Trim mismatch',
]

export const rejections = Array.from({ length: 70 }, (_, i) => {
  const order = rng.pick(exportOrders)
  const stage = rng.pick(processStages)
  const qtyPcs = rng.int(12, 1400)
  return {
    id: `REJ-${String(i + 1).padStart(4, '0')}`,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    stage: stage.label,
    stageKey: stage.key,
    unitName: order.unitName,
    reason: rng.pick(rejectionReasons),
    qtyPcs,
    valueUsd: Math.round(qtyPcs * order.fobUsd),
    disposition: rng.pick(['Rework', 'Rework', 'Downgrade', 'Scrap']),
    reportedAt: subDays(new Date(), rng.int(0, 45)).toISOString(),
  }
})

export const complaints = Array.from({ length: 24 }, (_, i) => {
  const order = rng.pick(exportOrders)
  return {
    id: `CMP-${String(i + 1).padStart(3, '0')}`,
    refNo: `QC/${String(560 + i)}`,
    buyerName: order.buyerName,
    country: order.country,
    orderNo: order.orderNo,
    styleNo: order.styleNo,
    raisedAt: subDays(new Date(), rng.int(1, 120)).toISOString(),
    category: rng.pick(['Measurement', 'Shade', 'Workmanship', 'Packing', 'Late delivery', 'Labelling']),
    severity: rng.pick(['Low', 'Medium', 'Medium', 'High', 'Critical']),
    description: rng.pick([
      'Chest measurement running above tolerance on size L',
      'Shade of the second shipment does not match the approved swatch',
      'Loose threads reported at the retail distribution centre',
      'Care label language set incorrect for the destination market',
      'Cartons received with mixed size ratios',
      'Neck rib recovery below the approved standard',
    ]),
    status: rng.pick(['Open', 'Investigating', 'Investigating', 'Resolved', 'Resolved', 'Closed']),
    owner: rng.pick(['QA Head', 'Merchandising', 'Production Manager', 'Packing In-charge']),
  }
})

/** Rolling summary the quality dashboard reads. */
export function buildQualitySummary() {
  const total = labTests.length
  const pass = labTests.filter((t) => t.result === 'Pass').length
  const rework = labTests.filter((t) => t.result === 'Rework').length
  const fail = labTests.filter((t) => t.result === 'Fail').length

  const byStage = labStages.map((stage) => {
    const rows = labTests.filter((t) => t.stage === stage)
    const passed = rows.filter((t) => t.result === 'Pass').length
    return {
      stage,
      total: rows.length,
      passRatePct: rows.length ? Math.round((passed / rows.length) * 1000) / 10 : 0,
    }
  })

  const byReason = rejectionReasons
    .map((reason) => ({
      key: reason,
      qtyPcs: rejections.filter((r) => r.reason === reason).reduce((s, r) => s + r.qtyPcs, 0),
    }))
    .filter((r) => r.qtyPcs > 0)
    .sort((a, b) => b.qtyPcs - a.qtyPcs)

  const avgDhu =
    inlineInspections.reduce((s, r) => s + r.dhuPct, 0) / (inlineInspections.length || 1)

  const aqlPass = aqlAudits.filter((a) => a.verdict === 'Pass').length

  return {
    total,
    pass,
    rework,
    fail,
    passRatePct: Math.round((pass / total) * 1000) / 10,
    byStage,
    byReason,
    avgDhuPct: Math.round(avgDhu * 100) / 100,
    aqlPassRatePct: Math.round((aqlPass / aqlAudits.length) * 1000) / 10,
    rejectionPcs: rejections.reduce((s, r) => s + r.qtyPcs, 0),
    rejectionValueUsd: rejections.reduce((s, r) => s + r.valueUsd, 0),
    openComplaints: complaints.filter((c) => c.status === 'Open' || c.status === 'Investigating').length,
  }
}
