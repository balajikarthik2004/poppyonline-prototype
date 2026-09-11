import { subDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { exportOrders } from './orders'
import { yarnLots } from './yarn'
import { buyers } from './buyers'
import { processStages } from './units'

/**
 * Quality records across the complete Closed-Loop QMS Pipeline for Poppys Knitwear:
 * 1. Testing Laboratory (Yarn, Fabric, Garment)
 * 2. ASTM D5430 4-Point Fabric Inspection Rolls
 * 3. Inline Sewing DHU Gate & Line-Stops
 * 4. Pre-Shipment Final AQL (ISO 2859-1 Level II) Audits & Certificates
 * 5. Rejection & Scrap Quantification
 * 6. Closed-Loop 8D CAPA & Root Cause Problem Solving
 */
const rng = makeRng(6677)

export const labTestCategories = ['All Tests', 'Physical Tests', 'Colour Fastness', 'Chemical & Eco', 'Yarn Quality']

export const labTestTypes = [
  { name: 'Shrinkage (3 Cycles)', category: 'Physical Tests', standard: 'ISO 6330', unit: '%', tolerance: '-5% to +2%', target: 'Length: -3.0%, Width: -1.5%' },
  { name: 'Colour Fastness to Washing', category: 'Colour Fastness', standard: 'ISO 105-C06', unit: 'grade', tolerance: 'Min 4', target: 'Grade 4-5' },
  { name: 'Colour Fastness to Rubbing (Dry/Wet)', category: 'Colour Fastness', standard: 'ISO 105-X12', unit: 'grade', tolerance: 'Dry 4, Wet 3-4', target: 'Dry: 4-5, Wet: 4' },
  { name: 'Colour Fastness to Saliva (Babywear)', category: 'Colour Fastness', standard: 'DIN 53160', unit: 'grade', tolerance: 'Grade 5', target: 'Grade 5 (No stain)' },
  { name: 'Pilling Resistance (Martindale)', category: 'Physical Tests', standard: 'ISO 12945-2', unit: 'grade', tolerance: 'Min 3-4 @ 2000 revs', target: 'Grade 4' },
  { name: 'Bursting Strength', category: 'Physical Tests', standard: 'ISO 13938-1', unit: 'kPa', tolerance: 'Min 250 kPa', target: '310 kPa' },
  { name: 'Spirality / Torque', category: 'Physical Tests', standard: 'ISO 16322', unit: '%', tolerance: 'Max 4.0%', target: '1.8%' },
  { name: 'GSM Verification (Conditioned)', category: 'Physical Tests', standard: 'ISO 3801', unit: 'g/m2', tolerance: '+/- 5% of target', target: '180 +/- 5 GSM' },
  { name: 'pH Value (Aqueous Extract)', category: 'Chemical & Eco', standard: 'ISO 3071', unit: 'pH', tolerance: '4.5 - 7.5', target: '6.2 pH' },
  { name: 'Formaldehyde Content', category: 'Chemical & Eco', standard: 'ISO 14184-1', unit: 'ppm', tolerance: '< 16 ppm (Babywear)', target: 'Not detected (< 5 ppm)' },
  { name: 'Azo Dye Free Certification', category: 'Chemical & Eco', standard: 'EN 14362-1', unit: 'ppm', tolerance: 'Not detected (< 20 ppm)', target: 'Zero detected' },
  { name: 'Yarn Count & CSP Strength', category: 'Yarn Quality', standard: 'ASTM D1907 / D1425', unit: 'CSP', tolerance: 'Min 2100 CSP', target: '2450 CSP' },
]

const labStages = ['Yarn', 'Greige Fabric', 'Dyed Fabric', 'Garment']

export const labTests = Array.from({ length: 110 }, (_, i) => {
  const testType = rng.pick(labTestTypes)
  const stage = rng.pick(labStages)
  const order = rng.pick(exportOrders)
  const result = rng.pick(['Pass', 'Pass', 'Pass', 'Pass', 'Pass', 'Pass', 'Pass', 'Rework', 'Fail'])

  return {
    id: `LAB-${String(i + 1).padStart(4, '0')}`,
    testNo: `CTL/${String(9200 + i)}`,
    stage,
    testName: testType.name,
    category: testType.category,
    standard: testType.standard,
    tolerance: testType.tolerance,
    target: testType.target,
    unit: testType.unit,
    orderId: order.id,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    lotNo: stage === 'Yarn' ? rng.pick(yarnLots).lotNo : `LOT-DY-${rng.int(100, 999)}`,
    testedDate: subDays(new Date(), rng.int(0, 30)).toISOString(),
    testedBy: rng.pick(['A. Kavitha (Senior Technologist)', 'S. Ramesh (Lab Lead)', 'D. Priya (QC Chemist)', 'M. Gopinath (Physical Analyst)']),
    result,
    measuredValue: result === 'Pass' ? testType.target : 'Exceeds limit',
    remarks:
      result === 'Pass'
        ? 'Cleared against buyer standard with full compliance buffer'
        : rng.pick([
            'Shrinkage beyond buyer tolerance after third wash cycle (-5.8% length)',
            'Shade variation delta E > 1.2 between roll head and tail',
            'Pilling grade 2-3 below the required 3-4 standard at 2,000 cycles',
            'GSM measured 165 g/m2 against required 180 g/m2 (-8.3% underweight)',
            'Spirality on side seam exceeds 5.2% after tumble dry',
          ]),
  }
})

/**
 * ASTM D5430 4-Point Fabric Inspection Rolls.
 * Calculation: Points per 100 sq. yd = (Total Points * 3600) / (Width in inches * Length in yards)
 * Pass threshold: <= 28.0 points / 100 sq. yd
 */
export const fabricRollInspections = Array.from({ length: 48 }, (_, i) => {
  const order = rng.pick(exportOrders)
  const widthInches = rng.pick([60, 62, 64, 72])
  const lengthYards = rng.int(80, 140)
  const fabricType = rng.pick(['100% Combed Cotton 1x1 Rib', '95/5 Cotton Elastane Single Jersey', '100% BCI Organic Interlock', 'Cotton Pique 220 GSM'])
  const colour = rng.pick(['Navy Heather', 'Optic White', 'Poppy Crimson', 'Sage Green', 'Charcoal Melange', 'Baby Sky Blue'])
  
  // Simulated defect points across the roll
  const defectCount = rng.int(2, 14)
  const defects = Array.from({ length: defectCount }, (_, dIdx) => ({
    yardPosition: rng.int(2, lengthYards - 2),
    defectName: rng.pick(['Hole / Drop Stitch (4 pts)', 'Barre / Sinker Mark (2 pts)', 'Dye Stain / Spot (3 pts)', 'Slub / Thick Yarn (1 pt)', 'Oil Spot (2 pts)', 'Edge Curled (1 pt)']),
    points: rng.pick([1, 2, 3, 4]),
  })).sort((a, b) => a.yardPosition - b.yardPosition)

  const totalPoints = defects.reduce((s, d) => s + d.points, 0)
  const pointsPer100SqYd = Number(((totalPoints * 3600) / (widthInches * lengthYards)).toFixed(1))
  const verdict = pointsPer100SqYd <= 28.0 ? 'Pass' : 'Hold'

  return {
    id: `FBR-${String(i + 1).padStart(4, '0')}`,
    rollBatch: `ROLL-${String(4100 + i)}`,
    dyeLotNo: `DY-${String(8800 + (i % 12))}`,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    fabricType,
    colour,
    shadeLot: `Shade ${String.fromCharCode(65 + (i % 4))}`,
    widthInches,
    lengthYards,
    weightKg: Math.round(lengthYards * 0.32),
    inspectedLength: lengthYards,
    defects,
    totalPoints,
    pointsPer100SqYd,
    maxAllowedPoints: 28.0,
    verdict,
    inspectedDate: subDays(new Date(), rng.int(0, 15)).toISOString(),
    inspector: rng.pick(['M. Karthik (4-Point Senior Inspector)', 'S. Balan (Master QC)', 'P. Gunasekaran']),
    quarantineAction: verdict === 'Hold' ? rng.pick(['Quarantined for Shade Strip', 'Allowance of 3% for Cut-loss', 'Return to Dyehouse for Stripping']) : null,
  }
})

/** Inline inspection - the sewing-floor gate, measured as defects per hundred units. */
export const inlineInspections = Array.from({ length: 96 }, (_, i) => {
  const order = rng.pick(exportOrders)
  const checked = rng.int(140, 950)
  const defects = Math.round(checked * rng.float(0.01, 0.11, 4))
  const dhu = Math.round((defects / checked) * 1000) / 10

  return {
    id: `INL-${String(i + 1).padStart(4, '0')}`,
    reportNo: `INL/${String(3300 + i)}`,
    orderNo: order.orderNo,
    buyerName: order.buyerName,
    styleNo: order.styleNo,
    unitName: order.unitName,
    lineNo: `Line ${String(rng.int(1, 24)).padStart(2, '0')}`,
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

/**
 * ISO 2859-1 (ANSI/ASQ Z1.4) General Inspection Level II Sampling Table.
 */
export function getAqlSamplingPlan(lotSize, aqlLevel = 'AQL 1.5') {
  let codeLetter = 'A'
  let sampleSize = 20
  if (lotSize <= 150) { codeLetter = 'C'; sampleSize = 13 }
  else if (lotSize <= 500) { codeLetter = 'E'; sampleSize = 20 }
  else if (lotSize <= 1200) { codeLetter = 'G'; sampleSize = 32 }
  else if (lotSize <= 3200) { codeLetter = 'K'; sampleSize = 125 }
  else if (lotSize <= 10000) { codeLetter = 'L'; sampleSize = 200 }
  else if (lotSize <= 35000) { codeLetter = 'M'; sampleSize = 315 }
  else { codeLetter = 'N'; sampleSize = 500 }

  let acceptLimit = 7
  let rejectLimit = 8

  if (aqlLevel === 'AQL 1.0') {
    acceptLimit = sampleSize >= 315 ? 7 : sampleSize >= 200 ? 5 : sampleSize >= 125 ? 3 : 1
  } else if (aqlLevel === 'AQL 1.5') {
    acceptLimit = sampleSize >= 315 ? 10 : sampleSize >= 200 ? 7 : sampleSize >= 125 ? 5 : 2
  } else if (aqlLevel === 'AQL 2.5') {
    acceptLimit = sampleSize >= 315 ? 14 : sampleSize >= 200 ? 10 : sampleSize >= 125 ? 7 : 3
  }
  rejectLimit = acceptLimit + 1

  return {
    lotSize,
    codeLetter,
    sampleSize,
    aqlLevel,
    acceptLimit,
    rejectLimit,
  }
}

/** Final AQL audit against each buyer's own published sampling level. */
export const aqlAudits = Array.from({ length: 72 }, (_, i) => {
  const order = rng.pick(exportOrders)
  const buyer = buyers.find((b) => b.id === order.buyerId) ?? rng.pick(buyers)
  const lotSize = order.quantityPcs
  const plan = getAqlSamplingPlan(lotSize, buyer.aqlLevel || 'AQL 1.5')
  const majorDefects = rng.int(0, plan.acceptLimit + 4)
  const criticalDefects = rng.pick([0, 0, 0, 0, 0, 0, 0, 1]) // 0 allowed
  const minorDefects = rng.int(1, 24)

  const verdict = criticalDefects === 0 && majorDefects <= plan.acceptLimit ? 'Pass' : rng.bool(0.4) ? 'Re-inspect' : 'Fail'

  return {
    id: `AQL-${String(i + 1).padStart(4, '0')}`,
    auditNo: `FA/${String(2400 + i)}`,
    orderNo: order.orderNo,
    buyerName: buyer.name,
    styleNo: order.styleNo,
    unitName: order.unitName,
    aqlLevel: buyer.aqlLevel || 'AQL 1.5',
    lotSize,
    codeLetter: plan.codeLetter,
    sampleSize: plan.sampleSize,
    acceptLimit: plan.acceptLimit,
    rejectLimit: plan.rejectLimit,
    criticalDefects,
    majorDefects,
    minorDefects,
    auditedAt: subDays(new Date(), rng.int(0, 28)).toISOString(),
    verdict,
    containerReleaseStatus: verdict === 'Pass' ? 'Authorized for Container Stuffing' : 'Container Release On Hold 🔴',
    auditor: rng.pick(['Third-party: SGS India (BV Certified)', 'Third-party: Intertek Global', 'Internal Lead QA Auditor', 'Buyer Nominated QA']),
    cartonChecked: Math.ceil(plan.sampleSize / 24),
    totalCartons: Math.ceil(lotSize / 24),
    keyDefects: majorDefects > 0 ? ['Needle cut on armhole (1 pc)', 'Sleeve length -1.5cm out of tolerance (2 pcs)'] : [],
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

export const rejections = Array.from({ length: 80 }, (_, i) => {
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

export const complaints = Array.from({ length: 28 }, (_, i) => {
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
      'Chest measurement running above tolerance (+1.5cm) on size L',
      'Shade of the second delivery lot does not match the approved lab dip swatch',
      'Loose threads and untrimmed tails reported at retail UK distribution centre',
      'Care label language set was missing European French/German translations',
      'Cartons received with mixed size ratios contrary to packing list',
      'Neck rib elastane recovery below the approved standard after 5 home washes',
    ]),
    status: rng.pick(['Open', 'Investigating', 'Investigating', 'Resolved', 'Resolved', 'Closed']),
    owner: rng.pick(['QA Head (R. Subramaniam)', 'Merchandising Team', 'Production Master', 'Packing In-charge']),
    has8dCapa: rng.bool(0.75),
    capaId: `CAPA-2026-${String(i + 1).padStart(3, '0')}`,
  }
})

/**
 * Formal 8D Closed-Loop Root Cause Problem Solving Cases.
 */
export const eightDCapaCases = [
  {
    id: 'CAPA-2026-001',
    complaintRef: 'QC/562',
    title: 'Neck Rib Elasticity Recovery Failure after 5 Home Washes',
    buyerName: 'Marks & Spencer',
    styleNo: 'PK2641',
    orderNo: 'ORD-1045',
    raisedDate: subDays(new Date(), 18).toISOString(),
    targetClosureDate: subDays(new Date(), 3).toISOString(),
    status: 'Implemented & Closed',
    severity: 'Critical',
    copqExposureUsd: 4200,
    d1_team: 'Lead: R. Subramaniam (QA Head), S. Ramesh (Knitting Master), V. Anand (Dyeing Technologist)',
    d2_problem: 'Buyer reported neck rib deformation after home wash cycles. Elastic recovery was 72% vs required > 88%.',
    d3_containment: 'Quarantined 3,200 pcs of ready garment in Carton Bay. 100% steam recovery test performed on current line WIP.',
    d4_rootCause5Whys: [
      'Why 1: Neck rib expanded and lost shape during home washing.',
      'Why 2: Elastane / Lycra yarn count was 20D instead of 30D core spun.',
      'Why 3: Yarn supplier lot mix-up occurred in yarn store unlabelled bins.',
      'Why 4: Visual inspection failed to differentiate 20D vs 30D elastane thread.',
      'Why 5: Barcode gate scan was not mandated for auxiliary elastane spools.',
    ],
    d5_correctiveAction: 'Replaced all neck rib trims with certified 30D Lycra lot. Re-stitched 850 held pieces with fresh neck binding.',
    d6_validation: 'Washing laboratory tested 5 consecutive wash cycles: recovery passed at 91.4% (standard > 88%).',
    d7_preventiveAction: 'Introduced mandatory 2D Datamatrix scanning on all Lycra / elastane inward cartons before issue to knitting floor.',
    d8_signOff: 'Approved by M&S Country Quality Director & Poppys Executive Vice President.',
  },
  {
    id: 'CAPA-2026-002',
    complaintRef: 'QC/568',
    title: 'Chest Width Measurement Deviation (+1.8cm Out of Spec)',
    buyerName: 'Next Sourcing Ltd',
    styleNo: 'PK2608',
    orderNo: 'ORD-1048',
    raisedDate: subDays(new Date(), 12).toISOString(),
    targetClosureDate: subDays(new Date(), -4).toISOString(),
    status: 'In Progress (Validation)',
    severity: 'High',
    copqExposureUsd: 2850,
    d1_team: 'Lead: D. Priya (QC Lead), M. Suresh (Cutting In-charge), K. Lakshmi (Sewing Master)',
    d2_problem: 'Size L chest width measured 56.8cm against spec 55.0cm (+/- 1.0cm tolerance).',
    d3_containment: 'Halted packing of Size L. Inspected 100% of finished cartons and separated 450 out-of-tolerance units.',
    d4_rootCause5Whys: [
      'Why 1: Finished chest width exceeded upper tolerance limit by 0.8cm.',
      'Why 2: Cutting lay height was set to 120 plies instead of standard 80 plies.',
      'Why 3: Top plies stretched under knife pressure, while bottom plies compressed.',
      'Why 4: Spreader tension adjustment was loose on the automatic spreading table.',
      'Why 5: Spreader calibration cycle was overdue by 2 weeks.',
    ],
    d5_correctiveAction: 'Reduced cutting lay height limit to max 75 plies for 100% cotton single jersey.',
    d6_validation: 'Conducted audit across 300 cut panels from 3 fresh lays: all within +/- 0.3cm tolerance.',
    d7_preventiveAction: 'Added automatic ply-counter interlock on CAD spreader software preventing lay execution > 80 plies.',
    d8_signOff: 'Pending final buyer QA random audit.',
  },
  {
    id: 'CAPA-2026-003',
    complaintRef: 'QC/574',
    title: 'Dispersed Pigment Print Smear after Packaging Heat Transit',
    buyerName: 'Tesco F&F',
    styleNo: 'PK2634',
    orderNo: 'ORD-1052',
    raisedDate: subDays(new Date(), 6).toISOString(),
    targetClosureDate: subDays(new Date(), -10).toISOString(),
    status: 'Under Investigation',
    severity: 'Medium',
    copqExposureUsd: 1400,
    d1_team: 'Lead: P. Manoj (Printing Manager), S. Balaji (Chemical QA)',
    d2_problem: 'Print pigment offset onto backside of polybag during container transit in tropical temperatures.',
    d3_containment: 'Inspected 1,200 printed panels before sewing. Re-cured held lot through infrared tunnel.',
    d4_rootCause5Whys: [
      'Why 1: Print surface tacky and transferred onto packaging plastic.',
      'Why 2: Curing tunnel temperature dropped to 142°C against required 165°C.',
      'Why 3: Heating element in Zone 3 was partially blown.',
      'Why 4: Temperature sensor alert was overridden by shift operator.',
      'Why 5: Sensor alert sound was disabled during maintenance.',
    ],
    d5_correctiveAction: 'Replaced heating element and locked temperature PID controller with password access.',
    d6_validation: '5-wash crocking test and 60°C oven transit test passed with zero transfer.',
    d7_preventiveAction: 'Connected printing tunnel telemetry to central Energy & QC dashboard with auto-shutoff if temp < 160°C.',
    d8_signOff: 'Internal review complete; awaiting shipment arrival in Felixstowe.',
  },
]

export const copqSummary = {
  totalCopqUsd: 48600,
  scrapValueUsd: 21400,
  reworkLaborUsd: 14200,
  testingAppraisalUsd: 8600,
  customerDebitNotesUsd: 4400,
  copqPctOfTurnover: 0.82,
}

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
    activeCapaCount: eightDCapaCases.filter((c) => c.status !== 'Implemented & Closed').length,
    copq: copqSummary,
  }
}
