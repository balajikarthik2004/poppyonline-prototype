/**
 * Standardized Universal Defect Master Taxonomy for Knitwear Manufacturing.
 * Single source of truth consumed across Production, Inline QA, AQL Audits, Rejections, and 8D CAPA.
 */

export const defectCategories = [
  'Sewing',
  'Fabric & Knitting',
  'Dyeing & Finishing',
  'Printing & Embroidery',
  'Cutting & Pattern',
  'Packing & Measurement',
]

export const defectCodes = [
  // Sewing
  { code: 'DEF-SEW-01', name: 'Broken / Skipped Stitch', process: 'Sewing', category: 'Major', stage: 'Sewing', qualityGate: 'Inline / Final', dhuEligible: true, capaTrigger: false, dhuImpact: 1.2 },
  { code: 'DEF-SEW-02', name: 'Seam Puckering / Tension Wave', process: 'Sewing', category: 'Minor', stage: 'Sewing', qualityGate: 'Inline', dhuEligible: true, capaTrigger: false, dhuImpact: 0.8 },
  { code: 'DEF-SEW-03', name: 'Uneven Hem / Differential Feed', process: 'Sewing', category: 'Major', stage: 'Sewing', qualityGate: 'Inline / Final', dhuEligible: true, capaTrigger: false, dhuImpact: 1.0 },
  { code: 'DEF-SEW-04', name: 'Open Seam / Raw Edge Drop', process: 'Sewing', category: 'Major', stage: 'Sewing', qualityGate: 'Inline / Final', dhuEligible: true, capaTrigger: true, dhuImpact: 1.5 },
  { code: 'DEF-SEW-05', name: 'Needle Cut / Fabric Hole', process: 'Sewing', category: 'Critical', stage: 'Sewing', qualityGate: 'Inline / Final', dhuEligible: true, capaTrigger: true, dhuImpact: 1.8 },
  { code: 'DEF-SEW-06', name: 'Incorrect Label Placement / Shift', process: 'Sewing', category: 'Major', stage: 'Sewing', qualityGate: 'Final Checking', dhuEligible: true, capaTrigger: false, dhuImpact: 0.6 },
  { code: 'DEF-SEW-07', name: 'Oil / Lubricant Stain from Machine', process: 'Sewing', category: 'Major', stage: 'Sewing', qualityGate: 'Inline', dhuEligible: true, capaTrigger: true, dhuImpact: 1.4 },

  // Fabric & Knitting
  { code: 'DEF-KNT-01', name: 'Yarn Contamination / Foreign Fiber', process: 'Knitting', category: 'Major', stage: 'Knitting', qualityGate: '4-Point Roll Inspection', dhuEligible: true, capaTrigger: true, dhuImpact: 0.9 },
  { code: 'DEF-KNT-02', name: 'Knitting Sinker / Barré Mark', process: 'Knitting', category: 'Major', stage: 'Knitting', qualityGate: 'Greige Fabric Inspection', dhuEligible: true, capaTrigger: true, dhuImpact: 1.1 },
  { code: 'DEF-KNT-03', name: 'Lycra Drop / Elastane Spurt', process: 'Knitting', category: 'Critical', stage: 'Knitting', qualityGate: 'Greige Fabric Inspection', dhuEligible: true, capaTrigger: true, dhuImpact: 1.4 },
  { code: 'DEF-KNT-04', name: 'Thick & Thin / Slub Defect', process: 'Knitting', category: 'Minor', stage: 'Knitting', qualityGate: '4-Point Roll Inspection', dhuEligible: false, capaTrigger: false, dhuImpact: 0.5 },

  // Dyeing & Finishing
  { code: 'DEF-DYE-01', name: 'Roll-to-Roll Shade Variation (Delta E > 0.8)', process: 'Dyeing', category: 'Critical', stage: 'Dyeing & Processing', qualityGate: 'Lab Spectrophotometer', dhuEligible: false, capaTrigger: true, dhuImpact: 2.0 },
  { code: 'DEF-DYE-02', name: 'Dye Spot / Softener Patch / Bleed', process: 'Dyeing', category: 'Major', stage: 'Dyeing & Processing', qualityGate: 'Finished Fabric Inspection', dhuEligible: true, capaTrigger: true, dhuImpact: 1.3 },
  { code: 'DEF-DYE-03', name: 'High Shrinkage / Spirality (> 5%)', process: 'Compacting', category: 'Critical', stage: 'Compacting', qualityGate: 'Lab Wash Test (ISO 6330)', dhuEligible: false, capaTrigger: true, dhuImpact: 1.7 },
  { code: 'DEF-DYE-04', name: 'Surface Pilling / Fuzzing Grade < 3.5', process: 'Finishing', category: 'Major', stage: 'Compacting', qualityGate: 'Martindale Abrasion Lab', dhuEligible: false, capaTrigger: false, dhuImpact: 1.1 },

  // Cutting & Pattern
  { code: 'DEF-CUT-01', name: 'Pattern Notching Error / Size Mix', process: 'Cutting', category: 'Critical', stage: 'Cutting', qualityGate: 'Cut Panel Inspection', dhuEligible: true, capaTrigger: true, dhuImpact: 2.0 },
  { code: 'DEF-CUT-02', name: 'End-Bit Fraying / Knife Burn', process: 'Cutting', category: 'Minor', stage: 'Cutting', qualityGate: 'Cut Panel Inspection', dhuEligible: true, capaTrigger: false, dhuImpact: 0.4 },

  // Printing & Embroidery
  { code: 'DEF-PRT-01', name: 'Screen Print Smear / Registration Bleed', process: 'Printing', category: 'Major', stage: 'Printing', qualityGate: 'Printed Panel Inspection', dhuEligible: true, capaTrigger: true, dhuImpact: 0.9 },
  { code: 'DEF-PRT-02', name: 'Curing Wash-Fastness Failure', process: 'Printing', category: 'Critical', stage: 'Printing', qualityGate: 'Lab Wash Fastness Test', dhuEligible: false, capaTrigger: true, dhuImpact: 2.2 },
  { code: 'DEF-EMB-01', name: 'Embroidery Thread Break / Missed Stitch', process: 'Embroidery', category: 'Minor', stage: 'Embroidery', qualityGate: 'Embroidery Table Gate', dhuEligible: true, capaTrigger: false, dhuImpact: 0.7 },

  // Packing & Measurement
  { code: 'DEF-PCK-01', name: 'Measurement Out of Tolerance (+/- 1.5cm)', process: 'Checking', category: 'Critical', stage: 'Checking', qualityGate: 'Final AQL Audit', dhuEligible: true, capaTrigger: true, dhuImpact: 2.5 },
  { code: 'DEF-PCK-02', name: 'Missing Polybag Barcode / Wrong Hangtag', process: 'Packing', category: 'Major', stage: 'Ironing & Packing', qualityGate: 'Carton Inspection', dhuEligible: true, capaTrigger: false, dhuImpact: 0.5 },
  { code: 'DEF-PCK-03', name: 'Metal / Needle Contamination Trigger', process: 'Packing', category: 'Critical', stage: 'Checking', qualityGate: '100% Metal Detector Conveyor', dhuEligible: false, capaTrigger: true, dhuImpact: 5.0 },
]

export const defectCodeById = new Map(defectCodes.map((d) => [d.code, d]))
