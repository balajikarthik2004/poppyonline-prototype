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

export const experts = [
  {
    id: 'EXP-01',
    name: 'N. Elangovan',
    area: 'Circular knitting & gauge selection',
    role: 'Principal Knitting Technologist',
    years: 25,
    unitName: 'PROC',
    availability: 'Available',
    responseMins: 12,
    solved: 203,
    email: 'n.elangovan@poppysknitwear.com',
    phone: '+91 (421) 247-8101 · Ext 104',
    rating: 4.9,
    activeCases: 2,
    skills: ['Fukuhara 28-34GG', 'Single/Double Jersey', 'Lycra Feeder Settings', 'Loop Length Calibration', 'Yarn Tension Optimization'],
    bio: 'Lead circular knitting technical authority across all Poppys manufacturing units. Specializes in fine-gauge 100% combed organic cotton and modal blends with zero-needle-line tolerance.',
    recentResolutions: [
      { id: 'RES-8912', title: 'Barre effect correction on 34GG Single Jersey lot #8912', unit: 'Unit II Knitting Floor', time: 'Yesterday', outcome: 'Recalibrated positive yarn feeders and synchronized tension rings.' },
      { id: 'RES-8840', title: 'Needle line defect mitigation on Mothercare Pique order', unit: 'Unit I Fabric Unit', time: '3 days ago', outcome: 'Replaced cylinder latch needles with Groz-Beckert SAN-5.2 spec.' },
    ],
    authoredPlaybooks: ['PB-KNIT-01: Fine Gauge Needle Line Elimination', 'PB-KNIT-04: Lycra Plating Tension Chart'],
  },
  {
    id: 'EXP-02',
    name: 'K. Chitra',
    area: 'Reactive dyeing and shade matching',
    role: 'Chief Colorist & Dyehouse Master',
    years: 27,
    unitName: 'U-III',
    availability: 'In Consultation',
    responseMins: 9,
    solved: 201,
    email: 'k.chitra@poppysknitwear.com',
    phone: '+91 (421) 247-8102 · Ext 240',
    rating: 5.0,
    activeCases: 4,
    skills: ['DataColor Spectrophotometer', 'Low Liquor Ratio Jet Dyeing', 'Shade Correction & Stripping', 'OEKO-TEX Class 1 Dyes', 'Batch Delta-E ≤ 0.5'],
    bio: 'Over 27 years directing dyeing chemistry and spectrophotometer calibration for top European and North American buyers. Group escalation authority for high-precision pastel & dark shade tolerances.',
    recentResolutions: [
      { id: 'RES-8942', title: 'Delta-E 1.4 deviation on Marks & Spencer Navy batch #309', unit: 'Unit III Dyehouse', time: '2 hours ago', outcome: 'Calculated 0.08% salt top-up curve and pH 11.2 fixation adjustment.' },
      { id: 'RES-8890', title: 'Rubbing fastness enhancement for NEXT Jet Black order', unit: 'Unit III Dyehouse', time: '2 days ago', outcome: 'Implemented enzyme post-scouring cycle at 85°C with cationic fixer.' },
    ],
    authoredPlaybooks: ['PB-DYE-02: Reactive Dye Metamerism Diagnostic', 'PB-DYE-05: Low-Liquor Jet Soft-Flow Recipe'],
  },
  {
    id: 'EXP-03',
    name: 'V. Rajkumar',
    area: 'Compacting and shrinkage control',
    role: 'Finishing & Compacting Senior Engineer',
    years: 25,
    unitName: 'PROC',
    availability: 'Available',
    responseMins: 18,
    solved: 49,
    email: 'v.rajkumar@poppysknitwear.com',
    phone: '+91 (421) 247-8108 · Ext 808',
    rating: 4.8,
    activeCases: 1,
    skills: ['Ferraro Tubular Compactor', 'Santex Open-Width Compactor', 'Residual Shrinkage ≤ 4%', 'Spirality & Skewness Correction', 'Steam Pressure & Overfeed Tuning'],
    bio: 'Authority in dimensional stability, length/width residual shrinkage control, and zero-spirality finishing on high-twist single jersey and interlock fabrics.',
    recentResolutions: [
      { id: 'RES-8955', title: 'Residual length shrinkage spike on 180 GSM Bio-Washed Jersey', unit: 'Process Unit Compacting', time: 'Yesterday', outcome: 'Increased overfeed by 4.5% and adjusted felt blanket cylinder temperature to 135°C.' },
      { id: 'RES-8812', title: 'Spirality angle reduction on 100% cotton pique fabric', unit: 'Process Unit Finishing', time: '3 days ago', outcome: 'Corrected slub differential tension on Santex slitting stenter.' },
    ],
    authoredPlaybooks: ['PB-FIN-02: Dimensional Stability & Shrinkage Calibration', 'PB-FIN-05: Spirality Elimination on Single Jersey'],
  },
  {
    id: 'EXP-04',
    name: 'M. Palanivel',
    area: 'Industrial engineering & SMV',
    role: 'Head of Industrial Engineering',
    years: 26,
    unitName: 'U-II',
    availability: 'In Consultation',
    responseMins: 24,
    solved: 148,
    email: 'm.palanivel@poppysknitwear.com',
    phone: '+91 (421) 247-8103 · Ext 310',
    rating: 4.8,
    activeCases: 3,
    skills: ['GSD (General Sewing Data)', 'Line Balancing & Ergonomics', 'SMV Benchmarking', 'Hourly SAM Target Audits', 'Kanban Buffer Design'],
    bio: 'Pioneered GSD-based micro-motion studies and progressive bundle system layouts across 48 active sewing lines. Expert in bottleneck de-coupling and takt time synchronization.',
    recentResolutions: [
      { id: 'RES-8960', title: 'Line 07 bottleneck de-coupling on Polo Neck attachment', unit: 'Unit II Sewing Line 7', time: '4 hours ago', outcome: 'Re-engineered workstation jig and reassigned auxiliary feed helper.' },
      { id: 'RES-8874', title: 'SMV target reset for Zara Raglan Tee style #ZR-440', unit: 'Unit I Sewing', time: '4 days ago', outcome: 'Saved 2.4 SAM per garment through pneumatically guided flatlock hem.' },
    ],
    authoredPlaybooks: ['PB-IE-03: Line Balancing for Multi-Operation T-Shirts', 'PB-IE-07: Ergonomic Feed Jigs for Overlock'],
  },
  {
    id: 'EXP-05',
    name: 'S. Deepalakshmi',
    area: 'AQL auditing and buyer standards',
    role: 'Quality Assurance Director',
    years: 22,
    unitName: 'Group',
    availability: 'In Consultation',
    responseMins: 6,
    solved: 188,
    email: 's.deepalakshmi@poppysknitwear.com',
    phone: '+91 (421) 247-8107 · Ext 712',
    rating: 5.0,
    activeCases: 2,
    skills: ['AQL Level II (1.5 / 2.5 / 4.0)', 'Buyer Protocol Mapping (Primark, M&S, Zara)', 'Pre-Final Audit Sampling', 'Defect Pareto Analytics', 'CAPA Execution'],
    bio: 'Lead internal auditor for all international retail brand standards across Poppys. Implemented zero-defect pre-final audit gating protocols group-wide.',
    recentResolutions: [
      { id: 'RES-8971', title: 'Pre-final AQL 1.5 pass clearance for Primark 45k unit consignment', unit: 'Unit I QA Finishing', time: '5 hours ago', outcome: 'Conducted 315-piece sample audit with 0 critical and 2 minor defects (accepted).' },
      { id: 'RES-8833', title: 'Measurement tolerance dispute resolution on kids sleepwear', unit: 'Unit II QA Bay', time: '2 days ago', outcome: 'Standardized steam-relaxed conditioning time prior to measuring chest width.' },
    ],
    authoredPlaybooks: ['PB-QA-01: Buyer-Specific Tolerance Matrix', 'PB-QA-03: Pre-Final AQL Sampling Guidelines'],
  },
  {
    id: 'EXP-06',
    name: 'R. Sundaramoorthy',
    area: 'Screen printing and curing',
    role: 'Master Printer & Screen Chemistry Lead',
    years: 15,
    unitName: 'U-III',
    availability: 'Available',
    responseMins: 15,
    solved: 39,
    email: 'r.sundaramoorthy@poppysknitwear.com',
    phone: '+91 (421) 247-8105 · Ext 520',
    rating: 4.7,
    activeCases: 1,
    skills: ['MHM Automatic Carousel', 'Plastisol & Water-Based Inks', 'High-Density Puff & Discharge', 'Conveyor Curing Thermography', 'GOTS Approved Pigments'],
    bio: 'Specialist in 12-color automatic rotary and carousel screen printing with stringent wash-fastness criteria and phthalate-free formulation standards.',
    recentResolutions: [
      { id: 'RES-8980', title: 'Discharge print opacity optimization on 100% cotton black tee', unit: 'Unit III Printing Wing', time: '1 hour ago', outcome: 'Adjusted activator dosage to 5.2% and increased tunnel dwell time to 160s.' },
      { id: 'RES-8802', title: 'Screen mesh bleeding prevention on fine half-tone graphics', unit: 'Unit III Darkroom', time: '3 days ago', outcome: 'Re-tensioned mesh to 24 N/cm and applied dual-cure photopolymer emulsion.' },
    ],
    authoredPlaybooks: ['PB-PRN-02: Water-Based Discharge Curing Windows', 'PB-PRN-05: Phthalate-Free Ink Fastness Audit'],
  },
  {
    id: 'EXP-07',
    name: 'A. Meenambigai',
    area: 'Embroidery digitising',
    role: 'Principal Embroidery & CAD Specialist',
    years: 31,
    unitName: 'U-III',
    availability: 'On floor',
    responseMins: 8,
    solved: 139,
    email: 'a.meenambigai@poppysknitwear.com',
    phone: '+91 (421) 247-8104 · Ext 415',
    rating: 4.9,
    activeCases: 1,
    skills: ['Wilcom Embroidery Studio', 'Tajima 20-Head Multi-Needle', 'Puckering Prevention', '3D Puff Digitizing', 'Metallic Thread Tensioning'],
    bio: 'Over three decades mastering high-density embroidery digitizing and micro-stitch tensioning on elastic knit bases without fabric distortion or backing show-through.',
    recentResolutions: [
      { id: 'RES-8991', title: 'Puckering mitigation on 140 GSM Organic Viscose Jersey', unit: 'Unit III Embroidery Section', time: '30 mins ago', outcome: 'Underlay stitch density reduced by 30% with 80/12 ball-point titanium needles.' },
      { id: 'RES-8860', title: 'Tajima multi-head thread break diagnostic on gold lurex', unit: 'Unit III CAD Lab', time: 'Yesterday', outcome: 'Applied silicone mist lubricant and tuned rotary hook timing by 0.5mm.' },
    ],
    authoredPlaybooks: ['PB-EMB-01: Micro-Pucker Prevention on Lightweight Knits', 'PB-EMB-03: Multi-Head Tension Harmonization'],
  },
  {
    id: 'EXP-08',
    name: 'J. Saravanan',
    area: 'Export documentation and customs',
    role: 'Chief Shipping & Customs Compliance Officer',
    years: 22,
    unitName: 'U-II',
    availability: 'In Consultation',
    responseMins: 29,
    solved: 121,
    email: 'j.saravanan@poppysknitwear.com',
    phone: '+91 (421) 247-8106 · Ext 601',
    rating: 4.9,
    activeCases: 5,
    skills: ['EDI Shipping Bill Filing', 'Duty Drawback & RoDTEP', 'EUR.1 / GSP Certificate of Origin', 'Customs Port Clearance (Tuticorin/Chennai)', 'FMCG Buyer Compliance'],
    bio: 'Oversees end-to-end export documentation, multimodal logistics tracking, port clearance protocols, and FTAs for fast-turnaround shipments.',
    recentResolutions: [
      { id: 'RES-8995', title: 'Emergency COO EUR.1 clearance for Hamburg air-freight parcel', unit: 'Unit II Export Cell', time: '3 hours ago', outcome: 'Expedited digital DGFT certificate authorization within 45 minutes.' },
      { id: 'RES-8847', title: 'Container seal discrepancy reconciliation at Tuticorin port', unit: 'Tuticorin CFS Deck', time: 'Yesterday', outcome: 'Liaised with customs examiner for seamless RFID verification without demurrage.' },
    ],
    authoredPlaybooks: ['PB-DOC-01: Expedited EUR.1 Issuance SOP', 'PB-DOC-04: Port Gateway Detention Prevention'],
  },
  {
    id: 'EXP-09',
    name: 'T. Karthikeyan',
    area: 'Oeko-Tex and chemical compliance',
    role: 'Senior Compliance & Chemical Safety Manager',
    years: 19,
    unitName: 'U-III',
    availability: 'Available',
    responseMins: 35,
    solved: 159,
    email: 't.karthikeyan@poppysknitwear.com',
    phone: '+91 (421) 247-8109 · Ext 901',
    rating: 4.9,
    activeCases: 2,
    skills: ['OEKO-TEX Standard 100 Class 1 (Babywear)', 'ZDHC MRSL Level 3', 'REACH SVHC Screening', 'Heavy Metals & Formaldehyde Testing', 'MSDS & Chemical Inventory Governance'],
    bio: 'Directs chemical screening, ZDHC gateway MRSL level compliance, and toxicological safety for sensitive export infantwear and organic collections.',
    recentResolutions: [
      { id: 'RES-8998', title: 'ZDHC MRSL Level 3 compliance audit for new silicone softener batch', unit: 'Chemical Store Lab', time: '6 hours ago', outcome: 'Validated certificate of analysis; approved batch for OEKO-TEX babywear run.' },
      { id: 'RES-8820', title: 'Formaldehyde trace screening on resin-finished pique collars', unit: 'Testing Laboratory', time: 'Yesterday', outcome: 'Confirmed < 16 ppm free formaldehyde, comfortably below the 20 ppm infant threshold.' },
    ],
    authoredPlaybooks: ['PB-CMP-01: ZDHC MRSL In-House Verification Protocol', 'PB-CMP-04: Heavy Metal Extraction Limits for Infantwear'],
  },
  {
    id: 'EXP-10',
    name: 'P. Vasanthi',
    area: 'Zero liquid discharge operations',
    role: 'Lead Environmental & ZLD Plant Engineer',
    years: 30,
    unitName: 'U-II',
    availability: 'On floor',
    responseMins: 19,
    solved: 191,
    email: 'p.vasanthi@poppysknitwear.com',
    phone: '+91 (421) 247-8110 · Ext 980',
    rating: 5.0,
    activeCases: 2,
    skills: ['Biological Aeration & Clarifiers', 'Multi-Stage Reverse Osmosis (RO)', 'Multiple Effect Evaporation (MEE)', 'ATFD Salt Recovery', 'TDS & COD Real-Time SCADA'],
    bio: 'Leads Poppys cutting-edge 1.2 MLD Zero Liquid Discharge recycling facility, achieving >96% pure water recovery and 100% Glauber salt crystallisation.',
    recentResolutions: [
      { id: 'RES-9002', title: 'Stage-2 RO membrane flux drop mitigation during high-TDS batch', unit: 'ZLD Plant Control Room', time: '1 hour ago', outcome: 'Initiated automated CIP anti-scalant acid wash; restored permeate flux to 18 LMH.' },
      { id: 'RES-8889', title: 'MEE steam condensate recovery optimization', unit: 'Evaporator Yard', time: 'Yesterday', outcome: 'Calibrated vacuum booster pump; saved 1.2 tons of boiler steam per shift.' },
    ],
    authoredPlaybooks: ['PB-ENV-01: RO Membrane CIP & Flux Recovery SOP', 'PB-ENV-03: Glauber Salt Crystallization Purity Standards'],
  },
]

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
