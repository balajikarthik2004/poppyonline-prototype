import { makeRng } from '@/lib/random'
import { exportOrders } from './orders'
import { machines } from './machines'
import { sewingLines } from './production'

/**
 * The AI module. Everything here is deterministic and computed locally over the
 * mock dataset - there is no model call. Insights are derived from real
 * anomalies in the data so the panel never contradicts the pages behind it.
 */
const rng = makeRng(1357)

const delayed = exportOrders.filter((o) => o.risk === 'delayed')
const atRisk = exportOrders.filter((o) => o.risk === 'atRisk')
const downMachines = machines.filter((m) => m.status === 'Breakdown')
const weakLines = sewingLines.filter((l) => l.efficiencyPct < 60)

export const aiInsights = [
  {
    id: 'INS-001',
    severity: 'critical',
    category: 'Delivery risk',
    title: `${delayed.length} orders have slipped past their ship window`,
    detail: `Combined exposure of $${Math.round(delayed.reduce((s, o) => s + o.valueUsd, 0) / 1000)}k FOB. The largest is ${delayed[0]?.buyerName ?? 'a key buyer'} on style ${delayed[0]?.styleNo ?? '-'}.`,
    recommendation:
      'Re-sequence the affected cuts onto the two highest-efficiency lines and confirm a revised ship date with the buyer before the week closes.',
    linkTo: '/sales/export-orders?risk=delayed',
    confidence: 0.93,
  },
  {
    id: 'INS-002',
    severity: 'high',
    category: 'Capacity',
    title: `${atRisk.length} orders are tracking behind their expected curve`,
    detail:
      'These have not breached the ship date yet, but progress is more than eight points below where a 45-day cycle would put them.',
    recommendation: 'Pull the two nearest cuts forward and add an overtime shift on the kidswear lines at Unit II.',
    linkTo: '/sales/export-orders?risk=atRisk',
    confidence: 0.86,
  },
  {
    id: 'INS-003',
    severity: 'high',
    category: 'Machine',
    title: `${downMachines.length} machines are down across the installed base`,
    detail: `Affected stages: ${[...new Set(downMachines.map((m) => m.stageLabel))].slice(0, 4).join(', ') || 'none'}.`,
    recommendation: 'Prioritise the knitting and dye-house tickets first - both sit upstream of every garment stage.',
    linkTo: '/maintenance/breakdowns',
    confidence: 0.9,
  },
  {
    id: 'INS-004',
    severity: 'medium',
    category: 'Efficiency',
    title: `${weakLines.length} sewing lines are running below 60% efficiency`,
    detail:
      'Low efficiency clusters on lines that changed style within the last two days, which points to a learning-curve loss rather than a machine problem.',
    recommendation: 'Hold style changeovers to a maximum of two per line per week and pre-stage trims before the changeover.',
    linkTo: '/ai/shop-floor',
    confidence: 0.78,
  },
  {
    id: 'INS-005',
    severity: 'medium',
    category: 'Sustainability',
    title: 'Dye-house energy intensity is drifting above target',
    detail: 'kWh per kilo processed has stayed above the 6.4 target on recent working days.',
    recommendation: 'Batch light shades together to cut the number of machine wash-downs between lots.',
    linkTo: '/energy',
    confidence: 0.71,
  },
  {
    id: 'INS-006',
    severity: 'low',
    category: 'Inventory',
    title: 'Work in progress is aging between cutting and sewing',
    detail: 'Several bundles have been waiting more than four days, which ties up fabric already paid for.',
    recommendation: 'Cap the cutting release to two days of sewing cover per line.',
    linkTo: '/inventory/wip',
    confidence: 0.74,
  },
]

export const playbooks = [
  {
    id: 'PB-01',
    title: 'Order is going to miss its ship date',
    trigger: 'Completion is more than 20 points behind the expected curve inside the last two weeks.',
    owner: 'Merchandising + Planning',
    avgResolutionHours: 26,
    steps: [
      'Confirm the true bottleneck stage from the work-order route, not from the floor report.',
      'Check whether fabric and trims are fully in-house; a fabric shortfall cannot be solved with overtime.',
      'Re-sequence onto the highest-efficiency line running the same fabric family.',
      'Model a part-shipment: full sizes now, balance on the next sailing.',
      'Get the buyer merchandiser to agree the revised date in writing before committing capacity.',
    ],
  },
  {
    id: 'PB-02',
    title: 'Inline DHU crosses 6%',
    trigger: 'Any inline inspection reports defects per hundred units above six.',
    owner: 'Quality Assurance',
    avgResolutionHours: 6,
    steps: [
      'Stop the line and hold the last two hours of output for re-check.',
      'Separate machine-caused defects from operator-caused defects before assigning a fix.',
      'Re-train on the top defect only - broad re-training dilutes the correction.',
      'Re-check after one hour and release the line only below 3% DHU.',
      'Log the root cause against the style so the same fault is caught at the next PP meeting.',
    ],
  },
  {
    id: 'PB-03',
    title: 'Shade variation reported between rolls',
    trigger: 'Lab or cutting reports a shade mismatch inside one order.',
    owner: 'Dye House + QA',
    avgResolutionHours: 14,
    steps: [
      'Quarantine the affected shade lot and pull the approved swatch.',
      'Grade every roll against the swatch under D65 in the light box.',
      'Group rolls into shade bands and cut each band as a separate bundle set.',
      'Keep one shade band per carton so the retail floor never sees a mismatch.',
      'If the band spread is beyond tolerance, re-dye rather than ship a compromise.',
    ],
  },
  {
    id: 'PB-04',
    title: 'Yarn stock drops below two days of cover',
    trigger: 'Any yarn count falls under its reorder level with an open knitting programme.',
    owner: 'Procurement + Store',
    avgResolutionHours: 18,
    steps: [
      'Confirm the true open requirement from the knitting plan, not the reorder level alone.',
      'Check whether an approved substitute count already sits in the store.',
      'Place a spot order with the nearest approved spinner in the Tirupur belt.',
      'Re-sequence the knitting programme so machines run counts that are in stock.',
      'Flag the shortfall to merchandising before it reaches the buyer as a delay.',
    ],
  },
  {
    id: 'PB-05',
    title: 'Machine breakdown on a critical stage',
    trigger: 'A knitting, dyeing or compacting machine stops with orders queued behind it.',
    owner: 'Maintenance',
    avgResolutionHours: 9,
    steps: [
      'Confirm whether the spare is in the store before promising a restoration time.',
      'Re-route the queued lots to a machine of the same gauge and diameter.',
      'If no in-house route exists, release the lot to an approved job-work partner.',
      'Record downtime against the machine so the MTBF trend stays honest.',
      'Raise a preventive task if the same cause has appeared twice this quarter.',
    ],
  },
]

const expertAreas = [
  'Circular knitting & gauge selection',
  'Reactive dyeing and shade matching',
  'Compacting and shrinkage control',
  'Industrial engineering & SMV',
  'AQL auditing and buyer standards',
  'Screen printing and curing',
  'Embroidery digitising',
  'Export documentation and customs',
  'Oeko-Tex and chemical compliance',
  'Zero liquid discharge operations',
]

export const experts = expertAreas.map((area, i) => ({
  id: `EXP-${String(i + 1).padStart(2, '0')}`,
  name: rng.pick([
    'R. Sundaramoorthy',
    'K. Chitra',
    'M. Palanivel',
    'S. Deepalakshmi',
    'V. Rajkumar',
    'A. Meenambigai',
    'T. Karthikeyan',
    'J. Saravanan',
    'P. Vasanthi',
    'N. Elangovan',
  ]),
  area,
  years: rng.int(8, 34),
  unitName: rng.pick(['U-I', 'U-II', 'U-III', 'PROC', 'Group']),
  availability: rng.pick(['Available', 'Available', 'On floor', 'In meeting']),
  responseMins: rng.int(5, 90),
  solved: rng.int(12, 240),
}))

/** Canned copilot exchanges - deterministic, grounded in the mock dataset. */
export const suggestedQuestions = [
  'Which orders are at risk this week?',
  'What is holding up the Mothercare programme?',
  'Show me yarn below reorder level',
  'Which sewing line is underperforming?',
  'How is the dye house tracking against energy target?',
  'What failed the final AQL audit recently?',
]

export function answerFor(question) {
  const q = question.toLowerCase()

  if (q.includes('risk') || q.includes('delay') || q.includes('late')) {
    const rows = [...delayed, ...atRisk].slice(0, 5)
    return {
      headline: `${delayed.length} orders are past their ship window and ${atRisk.length} more are tracking behind.`,
      body: 'Delivery risk is concentrated in the styles below. Completion is measured against a 45-day confirmation-to-ship cycle.',
      table: {
        columns: ['Order', 'Buyer', 'Style', 'Complete', 'Ship in'],
        rows: rows.map((o) => [
          o.orderNo,
          o.buyerName,
          o.styleNo,
          `${o.completionPct.toFixed(0)}%`,
          `${o.daysToShip}d`,
        ]),
      },
      linkTo: '/sales/export-orders?risk=high',
      linkLabel: 'Open the at-risk order list',
    }
  }

  if (q.includes('yarn') || q.includes('reorder') || q.includes('stock')) {
    return {
      headline: 'Yarn cover is thin on a handful of counts.',
      body: 'Counts below their reorder level cannot support the current knitting programme for more than two days. Procurement has open requisitions against most of them.',
      linkTo: '/inventory/yarn',
      linkLabel: 'Open the yarn store',
    }
  }

  if (q.includes('line') || q.includes('efficiency') || q.includes('sewing')) {
    const worst = [...sewingLines].sort((a, b) => a.efficiencyPct - b.efficiencyPct).slice(0, 5)
    return {
      headline: `${weakLines.length} lines are running below 60% efficiency.`,
      body: 'Most of the loss sits on lines that changed style in the last two days, which is a learning-curve effect rather than a machine fault.',
      table: {
        columns: ['Line', 'Unit', 'Style', 'Efficiency', 'DHU'],
        rows: worst.map((l) => [l.name, l.unitName, l.styleNo, `${l.efficiencyPct}%`, `${l.dhuPct}%`]),
      },
      linkTo: '/ai/shop-floor',
      linkLabel: 'Open the shop floor board',
    }
  }

  if (q.includes('energy') || q.includes('dye house') || q.includes('kwh') || q.includes('water')) {
    return {
      headline: 'The dye house is the swing factor on group energy intensity.',
      body: 'Processing accounts for roughly two fifths of group consumption. Intensity has been drifting above the 6.4 kWh/kg target, largely from wash-downs between shade changes.',
      linkTo: '/energy',
      linkLabel: 'Open energy and utilities',
    }
  }

  if (q.includes('aql') || q.includes('quality') || q.includes('audit') || q.includes('defect')) {
    return {
      headline: 'Final audit performance is holding, but inline DHU is the leading indicator to watch.',
      body: 'Failures cluster on measurement and shade rather than workmanship, which usually points upstream to the dye house and the cutting marker rather than to the sewing floor.',
      linkTo: '/quality/aql',
      linkLabel: 'Open the final AQL register',
    }
  }

  if (q.includes('mothercare') || q.includes('buyer') || q.includes('marks')) {
    return {
      headline: 'Buyer programmes are tracked order by order on the export order book.',
      body: 'Filter the order book by buyer to see every live style, its stage on the route and its ship window in one view.',
      linkTo: '/sales/buyers',
      linkLabel: 'Open the buyer list',
    }
  }

  return {
    headline: 'I can answer from the live order book, production route, quality register and stores.',
    body: 'Try asking about delivery risk, yarn cover, line efficiency, energy intensity or audit performance. Every answer links through to the module that owns the data.',
    linkTo: '/ai/insights',
    linkLabel: 'Browse insights and anomalies',
  }
}
