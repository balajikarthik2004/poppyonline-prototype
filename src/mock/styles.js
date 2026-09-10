import { makeRng } from '@/lib/random'
import { buyers } from './buyers'
import { generateDefaultBom } from '@/lib/master/bomLogic'

/**
 * Garment Style Master with Multi-Level BOM & Version Revisions.
 */
const rng = makeRng(4412)

export const segments = [
  "Men's Wear",
  "Women's Wear",
  'Boys Wear',
  'Girls Wear',
  'Infants',
  'Inners',
  'Home Textiles',
]

export const fabricTypes = [
  'Single Jersey',
  'Rib',
  'Interlock',
  'Fleece',
  'Pique',
  'Jacquard',
  'Engineered Stripe',
  'Auto Stripe',
  'Lycra Blend',
]

const garmentsBySegment = {
  "Men's Wear": ['Crew Tee', 'Polo', 'Henley', 'Sweatshirt', 'Hoodie', 'Jogger', 'Knit Shirt'],
  "Women's Wear": ['Scoop Tee', 'Tunic', 'Legging', 'Knit Dress', 'Lounge Set', 'Cardigan'],
  'Boys Wear': ['Graphic Tee', 'Hoodie', 'Short Set', 'Polo', 'Track Pant'],
  'Girls Wear': ['Printed Tee', 'Skater Dress', 'Legging Set', 'Peplum Top', 'Playsuit'],
  Infants: ['Bodysuit', 'Sleepsuit', 'Layette Set', 'Bib Pack', 'Romper'],
  Inners: ['Vest', 'Brief Pack', 'Camisole', 'Base Layer Top', 'Boxer Pack'],
  'Home Textiles': ['Bath Towel', 'Cushion Cover', 'Throw', 'Kitchen Set'],
}

const finishes = ['Bio-wash', 'Enzyme wash', 'Softener finish', 'Peach finish', 'Anti-pill']
const decorations = ['Placement print', 'Rotary print', 'Embroidery', 'Appliqué', 'Plain dyed', 'Yarn dyed stripe']
const cottonProgrammes = ['BCI Cotton', 'Organic Cotton (GOTS)', 'Conventional Cotton', 'Cotton/Elastane', 'Cotton/Poly Blend']
const yarnCounts = ['20s Ne Combed', '24s Ne Combed', '30s Ne Combed', '34s Ne Combed', '40s Ne Compact', '30/2 Ne Melange']

const sizeSets = {
  adult: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  kids: ['2-3Y', '3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
  infant: ['0-3M', '3-6M', '6-9M', '9-12M', '12-18M'],
}

function sizeSetFor(segment) {
  if (segment === 'Infants') return sizeSets.infant
  if (segment === 'Boys Wear' || segment === 'Girls Wear') return sizeSets.kids
  return sizeSets.adult
}

const seasons = ['SS26', 'AW26', 'SS27']

const segmentWeights = {
  Infants: 22,
  'Boys Wear': 12,
  "Men's Wear": 4,
  "Women's Wear": 4,
  'Girls Wear': 4,
  Inners: 4,
  'Home Textiles': 1,
}

const weightedSegments = segments.flatMap((segment) =>
  Array.from({ length: segmentWeights[segment] ?? 1 }, () => segment),
)

export const styles = Array.from({ length: 64 }, (_, i) => {
  const segment = rng.pick(weightedSegments)
  const garment = rng.pick(garmentsBySegment[segment])
  const buyer = rng.pick(buyers)
  const fabric = rng.pick(fabricTypes)
  const gsm = rng.int(120, 320)
  const fabricConsumptionKg = rng.float(0.12, 0.62, 3)
  const fobUsd = rng.float(2.1, 13.5, 2)
  const yarnCount = rng.pick(yarnCounts)
  const smv = rng.float(4.5, 28, 1)

  const partialStyle = {
    id: `STY-${String(i + 1).padStart(4, '0')}`,
    styleNo: `PK${String(2600 + i)}`,
    name: `${segment.replace(/'s Wear| Wear|s$/, '')} ${garment}`.replace(/\s+/g, ' ').trim(),
    segment,
    garment,
    buyerId: buyer.id,
    buyerName: buyer.name,
    season: rng.pick(seasons),
    fabric,
    gsm,
    yarnCount,
    cottonProgramme: rng.pick(cottonProgrammes),
    finish: rng.pick(finishes),
    decoration: rng.pick(decorations),
    colours: rng.int(2, 8),
    sizes: sizeSetFor(segment),
    fabricConsumptionKg,
    smv,
    fobUsd,
    targetQuantityPcs: rng.int(5000, 120000),
    status: rng.pick(['Active', 'Active', 'Active', 'Development', 'Discontinued']),
    approval: rng.pick(['Approved', 'Approved', 'Approved', 'Pending PP', 'Pending Fit']),
    effectiveDate: '2026-01-15',
    activeRevisionVersion: i % 3 === 0 ? 'v1.1' : i % 5 === 0 ? 'v2.0' : 'v1.0',
  }

  const defaultBom = generateDefaultBom(partialStyle)

  const revisions = [
    {
      revisionId: `REV-${partialStyle.id}-v1_0`,
      version: 'v1.0',
      status: partialStyle.activeRevisionVersion === 'v1.0' ? 'Approved' : 'Superseded',
      createdAt: '2026-01-10T10:00:00.000Z',
      createdBy: 'Senior Merchandiser',
      approvedBy: 'Dr. C. Sakthivel (MD)',
      approvedAt: '2026-01-15T14:30:00.000Z',
      effectiveDate: '2026-01-15',
      changeReason: 'Initial baseline BOM sign-off for bulk order',
      bom: defaultBom,
    },
  ]

  if (partialStyle.activeRevisionVersion === 'v1.1') {
    const updatedBom = JSON.parse(JSON.stringify(defaultBom))
    updatedBom.fabric[0].consumptionKg = Math.round((fabricConsumptionKg - 0.015) * 1000) / 1000
    revisions.push({
      revisionId: `REV-${partialStyle.id}-v1_1`,
      version: 'v1.1',
      status: 'Approved',
      createdAt: '2026-02-18T09:15:00.000Z',
      createdBy: 'Senior Merchandiser',
      approvedBy: 'S. Rajagopalan (GM Operations)',
      approvedAt: '2026-02-20T11:45:00.000Z',
      effectiveDate: '2026-02-22',
      changeReason: 'Marker efficiency optimization reduced body fabric consumption by 15g',
      bom: updatedBom,
    })
  } else if (partialStyle.activeRevisionVersion === 'v2.0') {
    const v2Bom = JSON.parse(JSON.stringify(defaultBom))
    v2Bom.trims.push({
      id: 'TRM-06',
      item: 'Organic Cotton Ribbon Drawcord',
      spec: '15mm Flat Herringbone with Metal Tips',
      uom: 'meters',
      qtyPerGarment: 1.2,
      supplierType: 'Trim Vendor',
    })
    revisions.push({
      revisionId: `REV-${partialStyle.id}-v2_0`,
      version: 'v2.0',
      status: 'Draft',
      createdAt: '2026-08-28T16:00:00.000Z',
      createdBy: 'K. Priya Dharshini (Merchandiser)',
      approvedBy: null,
      approvedAt: null,
      effectiveDate: '2026-09-25',
      changeReason: 'Buyer requested upgraded drawcord with engraved tips for AW26 drop',
      bom: v2Bom,
    })
  }

  return {
    ...partialStyle,
    bom: revisions.find((r) => r.status === 'Approved')?.bom || defaultBom,
    revisions,
  }
})

export const styleById = new Map(styles.map((s) => [s.id, s]))

export const activeStyles = styles.filter((s) => s.status === 'Active')
