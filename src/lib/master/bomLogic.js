/**
 * Multi-level Bill of Materials (BOM) Calculation Engine.
 *
 * Calculates structured consumption, weight breakdowns, and process routes
 * across Fabric, Yarn, Trims, and the 9 Garment Manufacturing Stages.
 */

export const PROCESS_STAGES_ROUTING = [
  { key: 'knitting', label: 'Knitting', defaultSmv: 2.2, machineType: 'Circular Knitting' },
  { key: 'dyeing', label: 'Dyeing & Processing', defaultSmv: 3.5, machineType: 'Soft-Flow Dyeing' },
  { key: 'compacting', label: 'Compacting & Finishing', defaultSmv: 1.1, machineType: 'Felt Compactor' },
  { key: 'cutting', label: 'Precision Cutting', defaultSmv: 1.8, machineType: 'Auto Spreader / Gerber Cutter' },
  { key: 'printing', label: 'Screen / Rotary Printing', defaultSmv: 2.4, machineType: 'Rotary Print / MHM Table' },
  { key: 'embroidery', label: 'Multi-Head Embroidery', defaultSmv: 1.9, machineType: 'Tajima 20-Head' },
  { key: 'sewing', label: 'Line Assembly & Sewing', defaultSmv: 8.5, machineType: 'Overlock / Flatlock' },
  { key: 'checking', label: 'Inline & Final Checking', defaultSmv: 1.6, machineType: 'Inspection Table' },
  { key: 'packing', label: 'Steam Ironing & Packing', defaultSmv: 1.4, machineType: 'Conveyor Tunnel / Pack Station' },
]

/**
 * Calculates total SMV, estimated standard cycle time, and material weight roll-up for a style BOM.
 */
export function calculateBomSummary(bom) {
  if (!bom) return { totalSmv: 0, fabricTotalKg: 0, yarnTotalKg: 0, trimsCount: 0, stagesCount: 0 }

  const fabricTotalKg = (bom.fabric ?? []).reduce((sum, f) => sum + (f.consumptionKg || 0), 0)
  const yarnTotalKg = (bom.yarn ?? []).reduce((sum, y) => sum + (y.consumptionKg || 0), 0)
  const trimsCount = (bom.trims ?? []).length
  const stagesCount = (bom.processes ?? []).length
  const totalSmv = (bom.processes ?? []).reduce((sum, p) => sum + (p.smv || 0), 0)

  return {
    totalSmv: Math.round(totalSmv * 10) / 10,
    fabricTotalKg: Math.round(fabricTotalKg * 1000) / 1000,
    yarnTotalKg: Math.round(yarnTotalKg * 1000) / 1000,
    trimsCount,
    stagesCount,
  }
}

/**
 * Builds a default standardized BOM template for any garment category.
 */
export function generateDefaultBom(style) {
  const fabricConsumption = style.fabricConsumptionKg || 0.32
  const gsm = style.gsm || 180
  const fabricType = style.fabric || 'Single Jersey'

  return {
    fabric: [
      {
        id: 'FAB-01',
        name: `${gsm} GSM ${fabricType}`,
        construction: '100% Combed Cotton Ring Spun',
        gsm,
        widthInches: 32,
        color: style.name?.includes('Polo') ? 'Navy / White Tip' : 'Standard Melange / Solid',
        consumptionKg: fabricConsumption,
        lossAllowancePct: 4.5,
        supplierCategory: 'In-House Processing',
      },
      {
        id: 'FAB-02',
        name: '1x1 Rib Neck / Cuff',
        construction: '95% Cotton / 5% Elastane',
        gsm: gsm + 40,
        widthInches: 24,
        color: 'Matching Body',
        consumptionKg: Math.round(fabricConsumption * 0.08 * 1000) / 1000,
        lossAllowancePct: 3.0,
        supplierCategory: 'In-House Knitting',
      },
    ],
    yarn: [
      {
        id: 'YRN-01',
        count: style.yarnCount || '30s Ne Combed',
        composition: '100% BCI Cotton',
        consumptionKg: Math.round(fabricConsumption * 0.92 * 1000) / 1000,
        lossAllowancePct: 2.5,
        targetCsp: 2950,
      },
      {
        id: 'YRN-02',
        count: '40s Ne Lycra Spun',
        composition: 'Cotton / Lycra 95/5',
        consumptionKg: Math.round(fabricConsumption * 0.08 * 1000) / 1000,
        lossAllowancePct: 2.0,
        targetCsp: 2750,
      },
    ],
    trims: [
      { id: 'TRM-01', item: 'Woven Main Brand Label', spec: 'Damask woven soft fold', uom: 'pcs', qtyPerGarment: 1, supplierType: 'Trim Vendor' },
      { id: 'TRM-02', item: 'Care / Composition Label', spec: 'Satin printed multi-language', uom: 'pcs', qtyPerGarment: 1, supplierType: 'Trim Vendor' },
      { id: 'TRM-03', item: '100% Spun Polyester Sewing Thread', spec: '2/120s Coats Epic matching', uom: 'meters', qtyPerGarment: 110, supplierType: 'Thread Supplier' },
      { id: 'TRM-04', item: 'Hangtag & Recycled Barcode Sticker', spec: 'FSC Certified 350 GSM Board', uom: 'pcs', qtyPerGarment: 1, supplierType: 'Packaging Vendor' },
      { id: 'TRM-05', item: 'Self-Sealing Polybag', spec: 'Biodegradable 40 Micron with Vent', uom: 'pcs', qtyPerGarment: 1, supplierType: 'Packaging Vendor' },
    ],
    processes: PROCESS_STAGES_ROUTING.map((st, idx) => ({
      sequence: idx + 1,
      stageKey: st.key,
      processName: st.label,
      machineGroup: st.machineType,
      smv: idx === 6 ? (style.smv ? Math.round((style.smv * 0.45) * 10) / 10 : st.defaultSmv) : st.defaultSmv,
      standardHourlyRateInr: 450,
      criticalQualityGate: idx === 1 || idx === 6 || idx === 7,
    })),
  }
}
