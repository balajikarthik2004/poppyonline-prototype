import { subDays, addDays } from 'date-fns'
import { makeRng } from '@/lib/random'
import { units, processStages } from './units'
import { exportOrders } from './orders'

/**
 * The machine register. Counts per stage are apportioned to the published
 * totals: 45 circular + 4 flat knit machines, Tube Tex compactors and soft-flow
 * dyeing ranges, 10 semi-auto + 2 auto + 2 MHM print tables, Barudan/Tajima
 * embroidery heads, and 1,500 sewing machines across three factories.
 *
 * Operational attributes (Gauge, Diameter, Liquor Ratio, SPM, Speed) are
 * modeled as configurable parameters.
 */
const rng = makeRng(3344)

const makersByStage = {
  knitting: ['Mayer & Cie', 'Terrot', 'Fukuhara', 'Pailung', 'Shima Seiki'],
  dyeing: ['Fongs', 'Thies', 'Sclavos', 'Dhall Softflow'],
  compacting: ['Tube Tex', 'Bianco', 'Ferraro'],
  cutting: ['Gerber', 'Bullmer', 'Eastman'],
  printing: ['MHM Austria', 'M&R', 'Anatol', 'Sarvodaya'],
  embroidery: ['Barudan', 'Tajima'],
  sewing: ['Juki', 'Brother', 'Pegasus', 'Yamato', 'Siruba'],
  checking: ['Hashima', 'Sanko'],
  packing: ['Veit', 'Naomoto', 'Hashima'],
}

/** How many machines to model per stage - a readable sample, not all 1,500. */
const sampleCountByStage = {
  knitting: 49,
  dyeing: 14,
  compacting: 6,
  cutting: 9,
  printing: 14,
  embroidery: 12,
  sewing: 40,
  checking: 10,
  packing: 12,
}

const statuses = ['Running', 'Running', 'Running', 'Running', 'Idle', 'Under Maintenance', 'Breakdown']

let counter = 0

export const machines = processStages.flatMap((stage) => {
  const count = sampleCountByStage[stage.key] ?? 8
  return Array.from({ length: count }, (_, i) => {
    counter += 1
    const unit = stage.key === 'dyeing' || stage.key === 'compacting' || stage.key === 'printing' || stage.key === 'embroidery'
      ? units[3]
      : rng.pick(units.slice(0, 3))
    const status = rng.pick(statuses)
    const lastServiceDaysAgo = rng.int(3, 120)
    const utilisationPct = status === 'Running' ? rng.float(62, 97, 1) : status === 'Idle' ? rng.float(0, 22, 1) : 0

    return {
      id: `MC-${String(counter).padStart(4, '0')}`,
      code: `${stage.key.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
      stageKey: stage.key,
      stageLabel: stage.label,
      make: rng.pick(makersByStage[stage.key] ?? ['Generic']),
      model: `M${rng.int(100, 990)}`,
      unitId: unit.id,
      unitName: unit.shortName,
      installedYear: rng.int(2004, 2024),
      status,
      utilisationPct,
      /** Sewing lines are grouped; knitting machines are addressed singly. */
      lineNo: stage.key === 'sewing' ? `Line ${rng.int(1, 24)}` : null,
      gauge: stage.key === 'knitting' ? `${rng.pick([18, 20, 24, 28])}G` : null,
      diameterInch: stage.key === 'knitting' ? rng.pick([26, 30, 32, 34, 36]) : null,
      capacityPerDay: Math.round((stage.dailyCapacity / count) * rng.float(0.85, 1.15, 2)),
      unitOfMeasure: stage.unitOfMeasure,
      lastServiceAt: subDays(new Date(), lastServiceDaysAgo).toISOString(),
      nextServiceAt: addDays(subDays(new Date(), lastServiceDaysAgo), 90).toISOString(),
      mtbfHours: rng.int(180, 1400),
      breakdownsThisMonth: rng.int(0, 5),
    }
  })
})

export const machineById = new Map(machines.map((m) => [m.id, m]))

export const machinesByStage = processStages.reduce((acc, stage) => {
  acc[stage.key] = machines.filter((m) => m.stageKey === stage.key)
  return acc
}, {})

/**
 * Detailed Configurable Machine Fleets for 9 Stages
 */
export const stageMachineFleets = {
  knitting: [
    {
      id: 'KNT-01',
      name: 'Mayer & Cie Relanit 3.2 II',
      unitId: 'U-I',
      unitName: 'Unit I',
      type: 'Single Jersey Circular Knit',
      status: 'Running',
      operators: 2,
      config: {
        gauge: '24G',
        diameter: '30"',
        feeders: 96,
        currentRpm: 28,
        maxRpm: 32,
        yarnTensionGrams: 4.2,
      },
      currentJob: {
        orderNo: 'PO-1042',
        buyerName: 'Primark UK',
        fabric: '100% Combed Cotton 160 GSM',
        targetKg: 1800,
        actualKg: 1620,
        defectRatePct: 1.2,
        topDefect: 'DEF-001 Lycra Drop / Hole',
      },
    },
    {
      id: 'KNT-02',
      name: 'Terrot I3P 196 Interlock',
      unitId: 'U-I',
      unitName: 'Unit I',
      type: 'Double Jersey Interlock',
      status: 'Running',
      operators: 2,
      config: {
        gauge: '28G',
        diameter: '34"',
        feeders: 108,
        currentRpm: 22,
        maxRpm: 26,
        yarnTensionGrams: 5.0,
      },
      currentJob: {
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        fabric: 'Cotton Elastane Rib 220 GSM',
        targetKg: 2200,
        actualKg: 1950,
        defectRatePct: 0.8,
        topDefect: 'DEF-003 Needle Mark',
      },
    },
    {
      id: 'KNT-03',
      name: 'Pailung PL-KS Single Knit',
      unitId: 'U-I',
      unitName: 'Unit I',
      type: 'Single Jersey High Speed',
      status: 'Setup',
      operators: 1,
      config: {
        gauge: '20G',
        diameter: '32"',
        feeders: 90,
        currentRpm: 0,
        maxRpm: 30,
        yarnTensionGrams: 4.5,
      },
      currentJob: {
        orderNo: 'PO-1048',
        buyerName: 'H&M Global',
        fabric: '100% Organic Cotton 140 GSM',
        targetKg: 1500,
        actualKg: 400,
        defectRatePct: 1.5,
        topDefect: 'DEF-002 Sinker Line',
      },
    },
    {
      id: 'KNT-04',
      name: 'Mayer & Cie MBF 3.2 3-Thread Fleece',
      unitId: 'U-I',
      unitName: 'Unit I',
      type: '3-Thread Fleece',
      status: 'Running',
      operators: 2,
      config: {
        gauge: '18G',
        diameter: '30"',
        feeders: 84,
        currentRpm: 24,
        maxRpm: 28,
        yarnTensionGrams: 5.5,
      },
      currentJob: {
        orderNo: 'PO-1050',
        buyerName: 'Zara / Inditex',
        fabric: 'Brushed Fleece 280 GSM',
        targetKg: 2600,
        actualKg: 2450,
        defectRatePct: 0.9,
        topDefect: 'DEF-001 Lycra Drop / Hole',
      },
    },
  ],

  dyeing: [
    {
      id: 'DYE-01',
      name: 'Fongs ALLWIN High Temp Soft-Flow',
      unitId: 'PROC',
      unitName: 'Processing Plant',
      type: 'High Temp Soft-Flow (Eco-Friendly)',
      status: 'Running',
      operators: 3,
      config: {
        vesselCapacityKg: 1000,
        liquorRatio: '1:6',
        nozzlePressureBar: 1.8,
        cycleTimeHours: 6.5,
        waterConsumptionLPerKg: 48,
        zldRecoveryPct: 96.5,
      },
      currentJob: {
        batchNo: 'BAT-2026-0881',
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        shadeName: 'M&S Midnight Navy (Shade #NAV-04)',
        loadKg: 950,
        stage: 'Rinsing & Neutralization (Cycle 78%)',
        phLevel: 6.2,
        temperatureC: 60,
      },
    },
    {
      id: 'DYE-02',
      name: 'Thies iMaster F Soft-Flow 500kg',
      unitId: 'PROC',
      unitName: 'Processing Plant',
      type: 'Ultra Low Liquor Ratio Soft-Flow',
      status: 'Running',
      operators: 2,
      config: {
        vesselCapacityKg: 500,
        liquorRatio: '1:5.5',
        nozzlePressureBar: 1.6,
        cycleTimeHours: 5.8,
        waterConsumptionLPerKg: 42,
        zldRecoveryPct: 97.2,
      },
      currentJob: {
        batchNo: 'BAT-2026-0882',
        orderNo: 'PO-1049',
        buyerName: 'Tommy Hilfiger',
        shadeName: 'Cabernet Burgundy (Shade #BUR-12)',
        loadKg: 480,
        stage: 'Dye Fixation (Cycle 92%)',
        phLevel: 5.8,
        temperatureC: 85,
      },
    },
    {
      id: 'DYE-03',
      name: 'Fongs ECO-6 Atmospheric Dyeing',
      unitId: 'PROC',
      unitName: 'Processing Plant',
      type: 'Atmospheric Soft-Flow',
      status: 'Drain & Refill',
      operators: 2,
      config: {
        vesselCapacityKg: 750,
        liquorRatio: '1:6.5',
        nozzlePressureBar: 1.5,
        cycleTimeHours: 6.0,
        waterConsumptionLPerKg: 52,
        zldRecoveryPct: 95.8,
      },
      currentJob: {
        batchNo: 'BAT-2026-0883',
        orderNo: 'PO-1051',
        buyerName: 'Next UK',
        shadeName: 'Sage Pastel Green (Shade #GRN-08)',
        loadKg: 720,
        stage: 'Batch Unloading',
        phLevel: 7.0,
        temperatureC: 38,
      },
    },
  ],

  compacting: [
    {
      id: 'CMP-01',
      name: 'Ferraro Tubular Compactor C-2000',
      unitId: 'PROC',
      unitName: 'Processing Plant',
      type: 'Tubular Felt Compactor',
      status: 'Running',
      operators: 2,
      config: {
        speedMPerMin: 28,
        overfeedPct: 18,
        steamPressureBar: 4.5,
        targetGsm: 180,
        targetShrinkagePct: -3.5,
      },
      currentJob: {
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        fabric: '100% Single Jersey Cotton',
        outputM: 4200,
        actualShrinkagePct: -3.2,
        gsmDeviationPct: 0.5,
      },
    },
    {
      id: 'CMP-02',
      name: 'Tube-Tex Pak-Nit II Open Width',
      unitId: 'PROC',
      unitName: 'Processing Plant',
      type: 'Open-Width Knit Sanforizer',
      status: 'Running',
      operators: 2,
      config: {
        speedMPerMin: 32,
        overfeedPct: 22,
        steamPressureBar: 5.0,
        targetGsm: 220,
        targetShrinkagePct: -4.0,
      },
      currentJob: {
        orderNo: 'PO-1049',
        buyerName: 'Tommy Hilfiger',
        fabric: 'French Terry 240 GSM',
        outputM: 3800,
        actualShrinkagePct: -3.8,
        gsmDeviationPct: 0.8,
      },
    },
  ],

  cutting: [
    {
      id: 'CUT-01',
      name: 'Lectra VectorFashion Auto-Cutter',
      unitId: 'U-I',
      unitName: 'Unit I',
      type: 'High-Ply CNC Vacuum Cutter',
      status: 'Running',
      operators: 4,
      config: {
        markerEfficiencyPct: 88.6,
        maxPlyHeightMm: 75,
        cutSpeedMPerMin: 45,
        cadSoftware: 'Lectra Diamino',
      },
      currentJob: {
        orderNo: 'PO-1042',
        buyerName: 'Primark UK',
        styleNo: 'STY-2026-004',
        pliesCut: 80,
        bundlesReleased: 320,
        cutQuantityPcs: 12800,
        fabricUtilizationPct: 88.9,
      },
    },
    {
      id: 'CUT-02',
      name: 'Gerber Paragon GT Auto-Cutter',
      unitId: 'U-I',
      unitName: 'Unit I',
      type: 'High-Ply CNC Multi-Tool Cutter',
      status: 'Running',
      operators: 4,
      config: {
        markerEfficiencyPct: 89.2,
        maxPlyHeightMm: 80,
        cutSpeedMPerMin: 50,
        cadSoftware: 'Gerber AccuMark',
      },
      currentJob: {
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        styleNo: 'STY-2026-001',
        pliesCut: 65,
        bundlesReleased: 260,
        cutQuantityPcs: 10400,
        fabricUtilizationPct: 89.4,
      },
    },
  ],

  printing: [
    {
      id: 'PRT-01',
      name: 'MHM Synchroprint 5000 (16-Color)',
      unitId: 'U-III',
      unitName: 'Unit III',
      type: 'Automated Rotary Carousel Screen Printer',
      status: 'Running',
      operators: 6,
      config: {
        colors: 16,
        strokeSpeedSecPerPiece: 4.8,
        curingTempC: 165,
        flashCureHeads: 4,
        squeegeePressurePsi: 45,
      },
      currentJob: {
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        artworkRef: 'M&S Graphic Botanical Print (6-Colors)',
        targetPcs: 14000,
        actualPcs: 10800,
        defectPcs: 142,
        topDefect: 'DEF-015 Print Misregistration',
      },
    },
    {
      id: 'PRT-02',
      name: 'MHM S-Type Xtreme (12-Color)',
      unitId: 'U-III',
      unitName: 'Unit III',
      type: 'Automated Screen Printing Carousel',
      status: 'Changeover',
      operators: 5,
      config: {
        colors: 12,
        strokeSpeedSecPerPiece: 5.2,
        curingTempC: 160,
        flashCureHeads: 3,
        squeegeePressurePsi: 40,
      },
      currentJob: {
        orderNo: 'PO-1052',
        buyerName: 'Target USA',
        artworkRef: 'Target Summer Floral Placement (4-Colors)',
        targetPcs: 8000,
        actualPcs: 2200,
        defectPcs: 38,
        topDefect: 'DEF-016 Color Bleeding',
      },
    },
  ],

  embroidery: [
    {
      id: 'EMB-01',
      name: 'Tajima TMAR-KC 20-Head High Speed',
      unitId: 'U-III',
      unitName: 'Unit III',
      type: '20-Head Multi-Needle Automatic Embroidery',
      status: 'Running',
      operators: 3,
      config: {
        heads: 20,
        needlesPerHead: 12,
        maxSpm: 1100,
        currentSpm: 950,
        threadTensionGrams: 110,
        threadBreaksPer100k: 1.4,
      },
      currentJob: {
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        designRef: 'M&S Chest Crest (7,800 stitches)',
        targetPcs: 12000,
        actualPcs: 8400,
        threadBreaksToday: 14,
        topDefect: 'DEF-022 Loose Loop Stitches',
      },
    },
    {
      id: 'EMB-02',
      name: 'Barudan BEXS-Y920 20-Head System',
      unitId: 'U-III',
      unitName: 'Unit III',
      type: '20-Head Precision Tubular Embroidery',
      status: 'Running',
      operators: 3,
      config: {
        heads: 20,
        needlesPerHead: 9,
        maxSpm: 1000,
        currentSpm: 920,
        threadTensionGrams: 115,
        threadBreaksPer100k: 1.8,
      },
      currentJob: {
        orderNo: 'PO-1049',
        buyerName: 'Tommy Hilfiger',
        designRef: 'TH Monogram Sleeve Badge (11,200 stitches)',
        targetPcs: 9500,
        actualPcs: 7100,
        threadBreaksToday: 21,
        topDefect: 'DEF-023 Skipped Embroidery Stitches',
      },
    },
  ],

  checking: [
    {
      id: 'CHK-01',
      name: 'Checking Bay A (100% Final Inspection Table Line)',
      unitId: 'U-I',
      unitName: 'Unit I (Main Plant)',
      type: 'Lighted Inspection Tables & Digital Measurement Calipers',
      status: 'Running',
      operators: 14,
      config: {
        lightBoxLux: 1200,
        measurementToleranceCm: 0.5,
        hourlyTargetPerAuditor: 45,
        auditMode: '100% Inline Table Audit',
        calibrationStatus: 'Certified Pass',
      },
      currentJob: {
        orderNo: 'PO-1042',
        buyerName: 'Primark UK',
        styleNo: 'STY-2026-004 Ladies Scoop Neck',
        inspectedPcs: 8400,
        passedPcs: 8180,
        repairedPcs: 160,
        rejectedPcs: 60,
        passRatePct: 97.4,
      },
    },
    {
      id: 'CHK-02',
      name: 'Checking Bay B (Critical Spec & Mannequin Fit Station)',
      unitId: 'U-II',
      unitName: 'Unit II (Apparel Park)',
      type: 'Precision Measurement Mannequins & Fabric Tension Frame',
      status: 'Running',
      operators: 12,
      config: {
        lightBoxLux: 1400,
        measurementToleranceCm: 0.3,
        hourlyTargetPerAuditor: 40,
        auditMode: 'Critical Spec & Neck Drop Audit',
        calibrationStatus: 'Certified Pass',
      },
      currentJob: {
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        styleNo: 'STY-2026-001 Men Crew Neck',
        inspectedPcs: 7200,
        passedPcs: 7100,
        repairedPcs: 80,
        rejectedPcs: 20,
        passRatePct: 98.6,
      },
    },
    {
      id: 'CHK-03',
      name: 'Hashima Conveyorized Needle Detector (Bay C)',
      unitId: 'U-I',
      unitName: 'Unit I (Main Plant)',
      type: 'Dual-Head High-Sensitivity Needle & Ferrous Detector',
      status: 'Running',
      operators: 4,
      config: {
        detectionSensitivityMm: 0.8,
        conveyorSpeedMPerMin: 25,
        testIntervalHours: 2,
        ferrousThreshold: '0.8mm Fe',
        alarmAction: 'Auto-Reverse & Reject Bin',
      },
      currentJob: {
        orderNo: 'PO-1051',
        buyerName: 'Next UK',
        styleNo: 'STY-2026-005 Kids Ribbed Set',
        inspectedPcs: 6800,
        passedPcs: 6800,
        repairedPcs: 0,
        rejectedPcs: 0,
        passRatePct: 100.0,
      },
    },
    {
      id: 'CHK-04',
      name: 'Sanko Metal Detection & Final Audit Line D',
      unitId: 'U-II',
      unitName: 'Unit II (Apparel Park)',
      type: 'Multi-Zone Conveyorized Metal Detector & Turners',
      status: 'Running',
      operators: 6,
      config: {
        detectionSensitivityMm: 0.8,
        conveyorSpeedMPerMin: 28,
        testIntervalHours: 2,
        ferrousThreshold: '0.8mm Fe',
        alarmAction: 'Auto-Reject Gate',
      },
      currentJob: {
        orderNo: 'PO-1049',
        buyerName: 'Tommy Hilfiger',
        styleNo: 'STY-2026-003 Pique Polo',
        inspectedPcs: 5400,
        passedPcs: 5399,
        repairedPcs: 0,
        rejectedPcs: 1,
        passRatePct: 99.98,
      },
    },
  ],

  packing: [
    {
      id: 'PCK-01',
      name: 'Veit Steam Tunnel & Auto-Bagging Line 1',
      unitId: 'U-I',
      unitName: 'Unit I (Main Plant)',
      type: 'Conveyorized Continuous Steam Finishing & Auto Polybagger',
      status: 'Running',
      operators: 16,
      config: {
        steamPressureBar: 6.0,
        tunnelSpeedMPerMin: 12,
        chamberTempC: 145,
        scannerBpm: 65,
        cartonPackFactor: 48,
      },
      currentJob: {
        orderNo: 'PO-1042',
        buyerName: 'Primark UK',
        styleNo: 'STY-2026-004 Ladies Scoop Neck',
        packedGarments: 7800,
        sealedCartons: 162,
        barcodesVerifiedPct: 100,
        dispatchStage: 'Palletized for Port of Tuticorin',
      },
    },
    {
      id: 'PCK-02',
      name: 'Naomoto Vacuum Pressing & Ironing Table Bank',
      unitId: 'U-I',
      unitName: 'Unit I (Main Plant)',
      type: 'Industrial All-Steam Ironing with Suction Tables',
      status: 'Running',
      operators: 14,
      config: {
        steamPressureBar: 5.5,
        ironPlateTempC: 135,
        vacuumSuctionMbar: -180,
        garmentsPerIronHour: 55,
        creaseQualityGrade: 'Grade A Premium',
      },
      currentJob: {
        orderNo: 'PO-1045',
        buyerName: 'Marks & Spencer',
        styleNo: 'STY-2026-001 Men Crew Neck',
        packedGarments: 6400,
        sealedCartons: 133,
        barcodesVerifiedPct: 100,
        dispatchStage: 'Pre-inspection Staging Area',
      },
    },
    {
      id: 'PCK-03',
      name: 'Veit Tunnel Finisher & Auto-Carton Sealer Line 2',
      unitId: 'U-II',
      unitName: 'Unit II (Apparel Park)',
      type: 'Continuous Steam Finishing Tunnel & Robotic Carton Sealer',
      status: 'Running',
      operators: 12,
      config: {
        steamPressureBar: 6.2,
        tunnelSpeedMPerMin: 14,
        chamberTempC: 150,
        scannerBpm: 70,
        cartonPackFactor: 36,
      },
      currentJob: {
        orderNo: 'PO-1049',
        buyerName: 'Tommy Hilfiger',
        styleNo: 'STY-2026-003 Pique Polo',
        packedGarments: 5900,
        sealedCartons: 164,
        barcodesVerifiedPct: 100,
        dispatchStage: 'Staged for Chennai CFS Container Stuffing',
      },
    },
    {
      id: 'PCK-04',
      name: 'Strapex Automated Strapping & Weight-Check Bay',
      unitId: 'U-II',
      unitName: 'Unit II (Apparel Park)',
      type: 'Conveyor Weight Checker & Barcode Verification Hub',
      status: 'Running',
      operators: 8,
      config: {
        weightToleranceGrams: 25,
        strapTensionKg: 40,
        conveyorSpeedMPerMin: 20,
        labelPrintSpeedSec: 2.5,
        tareWeightDeduction: 'Auto-Calibrated',
      },
      currentJob: {
        orderNo: 'PO-1050',
        buyerName: 'Zara / Inditex',
        styleNo: 'STY-2026-002 Brushed Fleece',
        packedGarments: 6200,
        sealedCartons: 210,
        barcodesVerifiedPct: 100,
        dispatchStage: 'Pre-stuffed into 40ft High Cube Container',
      },
    },
  ],
}

/**
 * 24-Line Sewing Digital Twin
 */
export const detailedSewingLines = Array.from({ length: 24 }, (_, i) => {
  const lineNum = i + 1
  const isUnit1 = lineNum <= 12
  const unitId = isUnit1 ? 'U-I' : 'U-II'
  const unitName = isUnit1 ? 'Unit I (Main Plant)' : 'Unit II (Apparel Park)'
  
  const tailors = rng.int(22, 34)
  const helpers = rng.int(4, 8)
  const checkers = rng.int(2, 4)
  const totalOperators = tailors + helpers + checkers

  const smvMinutes = rng.float(9.5, 18.2, 1)
  const pitchTimeSec = Math.round((smvMinutes * 60) / tailors)
  
  const hourlyTarget = Math.round((tailors * 60 * 0.85) / smvMinutes)
  const dailyTarget = hourlyTarget * 8

  // Generate 8-hour production progression
  const currentHour = 6 // currently at hour 6 of 8-hour shift
  const hourlyOutput = [
    { hour: 'H1 (08:30)', target: hourlyTarget, actual: Math.round(hourlyTarget * rng.float(0.70, 0.90, 2)) },
    { hour: 'H2 (09:30)', target: hourlyTarget, actual: Math.round(hourlyTarget * rng.float(0.85, 1.05, 2)) },
    { hour: 'H3 (10:30)', target: hourlyTarget, actual: Math.round(hourlyTarget * rng.float(0.90, 1.10, 2)) },
    { hour: 'H4 (11:30)', target: hourlyTarget, actual: Math.round(hourlyTarget * rng.float(0.88, 1.08, 2)) },
    { hour: 'H5 (13:30)', target: hourlyTarget, actual: Math.round(hourlyTarget * rng.float(0.80, 1.02, 2)) },
    { hour: 'H6 (14:30)', target: hourlyTarget, actual: Math.round(hourlyTarget * rng.float(0.85, 1.04, 2)) },
    { hour: 'H7 (15:30)', target: hourlyTarget, actual: 0 },
    { hour: 'H8 (16:30)', target: hourlyTarget, actual: 0 },
  ]

  const actualTotalSoFar = hourlyOutput.slice(0, currentHour).reduce((sum, h) => sum + h.actual, 0)
  const targetTotalSoFar = hourlyTarget * currentHour
  const achievementPct = Math.round((actualTotalSoFar / targetTotalSoFar) * 1000) / 10
  
  const efficiencyPct = Math.round(achievementPct * 0.88 * 10) / 10
  const dhuPct = rng.float(1.5, 7.8, 2)
  
  // Cut WIP Feeder status
  const cutWipHoursAvailable = rng.float(0.8, 6.5, 1)
  const wipStatus = cutWipHoursAvailable < 1.5 ? 'Starved / Critical' : cutWipHoursAvailable < 3.0 ? 'Low Buffer' : 'Healthy Feed'

  // Tied Export Order and Risk status
  const tiedOrder = exportOrders[i % exportOrders.length]
  const isBottleneck = efficiencyPct < 70 || dhuPct > 5.0 || cutWipHoursAvailable < 1.5
  const orderRiskStatus = isBottleneck
    ? 'High Risk - Delay'
    : efficiencyPct < 80
      ? 'Medium Risk'
      : 'On Track'

  const topDefects = [
    { code: 'DEF-008', name: 'Open Seam / Skipped Stitch', count: rng.int(4, 18), pct: 45 },
    { code: 'DEF-010', name: 'Uneven Hem / Puckering', count: rng.int(2, 11), pct: 30 },
    { code: 'DEF-012', name: 'Oil Stain / Needle Mark', count: rng.int(1, 6), pct: 25 },
  ]

  return {
    id: `LN-${String(lineNum).padStart(2, '0')}`,
    lineNum,
    name: `Line ${String(lineNum).padStart(2, '0')}`,
    unitId,
    unitName,
    status: isBottleneck ? 'Bottleneck' : rng.pick(['Running', 'Running', 'Running', 'Changeover']),
    supervisor: rng.pick([
      'M. Selvaraj (Senior Foreperson)',
      'P. Kalaivani (Line Leader)',
      'R. Devendran (IE Floor In-charge)',
      'S. Meenakshi (Quality Foreperson)',
      'V. Thangaraj (Master Tailor)',
      'J. Anitha (Section In-charge)',
    ]),
    operators: {
      tailors,
      helpers,
      checkers,
      total: totalOperators,
    },
    lineConfig: {
      smvMinutes,
      pitchTimeSec,
      targetEfficiencyPct: 85,
    },
    production: {
      hourlyTarget,
      dailyTarget,
      actualPcs: actualTotalSoFar,
      targetSoFar: targetTotalSoFar,
      achievementPct,
      efficiencyPct,
      dhuPct,
      hourlyLadder: hourlyOutput,
    },
    wipFeeder: {
      bufferStage: 'Cutting / Printing → Sewing Inflow',
      cutWipBundles: rng.int(40, 280),
      cutWipHoursAvailable,
      wipStatus,
      isAgingWip: cutWipHoursAvailable < 1.5,
    },
    tiedOrder: {
      orderNo: tiedOrder.orderNo,
      buyerName: tiedOrder.buyerName,
      styleNo: tiedOrder.styleNo,
      styleName: tiedOrder.styleName,
      orderQty: tiedOrder.quantityPcs,
      shipDate: tiedOrder.shipDate,
      daysToShip: tiedOrder.daysToShip,
      orderRiskStatus,
    },
    topDefects,
  }
})

/** Bottleneck engine calculations connecting WIP buffer aging, capacity and orders at risk */
export function buildBottleneckInsights() {
  return [
    {
      id: 'BN-01',
      upstreamStage: 'Printing',
      downstreamStage: 'Embroidery',
      wipPcs: 4500,
      bufferAgeDays: 3.8,
      severity: 'Critical',
      downstreamCapacity: '24,000 pcs/day',
      actualOutput: '18,200 pcs/day',
      deficitPct: -24.2,
      impactedOrders: [
        {
          orderNo: 'PO-1045',
          buyerName: 'Marks & Spencer',
          styleNo: 'STY-2026-001',
          styleName: 'Men Pure Cotton Crew Neck Tees',
          quantityPcs: 48000,
          shipDate: '2026-09-28',
          daysRemaining: 18,
          delayRiskDays: 3,
        },
        {
          orderNo: 'PO-1049',
          buyerName: 'Tommy Hilfiger',
          styleNo: 'STY-2026-003',
          styleName: 'Pique Polo with Contrast Collar',
          quantityPcs: 22000,
          shipDate: '2026-10-04',
          daysRemaining: 24,
          delayRiskDays: 2,
        },
      ],
      mitigationAction: 'Reallocate 4 heads on Barudan #2 and authorize 2 hours overtime at Unit III Embroidery.',
    },
    {
      id: 'BN-02',
      upstreamStage: 'Cutting',
      downstreamStage: 'Sewing (Line 04 & Line 07)',
      wipPcs: 3200,
      bufferAgeDays: 4.1,
      severity: 'Warning',
      downstreamCapacity: '1,600 pcs/day',
      actualOutput: '1,150 pcs/day',
      deficitPct: -28.1,
      impactedOrders: [
        {
          orderNo: 'PO-1042',
          buyerName: 'Primark UK',
          styleNo: 'STY-2026-004',
          styleName: 'Ladies Scoop Neck Organic Top',
          quantityPcs: 65000,
          shipDate: '2026-09-22',
          daysRemaining: 12,
          delayRiskDays: 2,
        },
      ],
      mitigationAction: 'Deploy auxiliary fabric spreading table in Cutting Bay 2 to release 60 cut bundles.',
    },
    {
      id: 'BN-03',
      upstreamStage: 'Dyeing',
      downstreamStage: 'Compacting',
      wipPcs: 2400,
      bufferAgeDays: 3.2,
      severity: 'Attention',
      downstreamCapacity: '5,000 kg/day',
      actualOutput: '4,650 kg/day',
      deficitPct: -7.0,
      impactedOrders: [
        {
          orderNo: 'PO-1051',
          buyerName: 'Next UK',
          styleNo: 'STY-2026-005',
          styleName: 'Kids Ribbed Pajama Set',
          quantityPcs: 30000,
          shipDate: '2026-10-12',
          daysRemaining: 32,
          delayRiskDays: 1,
        },
      ],
      mitigationAction: 'Schedule felt maintenance on Ferraro C-2000 at end of shift.',
    },
  ]
}
