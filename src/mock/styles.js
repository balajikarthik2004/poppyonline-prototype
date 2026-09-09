import { makeRng } from '@/lib/random'
import { buyers } from './buyers'

/**
 * The style library. Segments and fabric constructions mirror the public
 * product menu and capability list; individual styles are illustrative.
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

/**
 * Segment weighting follows the public product galleries, where infants (22
 * images) and boys (12) carry far more styles than the adult categories (4
 * each). Home textiles sit with the group's separate Madeups division, so they
 * barely appear in this style library.
 */
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

  return {
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
    cottonProgramme: rng.pick(cottonProgrammes),
    finish: rng.pick(finishes),
    decoration: rng.pick(decorations),
    colours: rng.int(2, 8),
    sizes: sizeSetFor(segment),
    fabricConsumptionKg,
    smv: rng.float(4.5, 28, 1),
    fobUsd,
    status: rng.pick(['Active', 'Active', 'Active', 'Development', 'Discontinued']),
    /** Approval gate a style must clear before bulk cutting is released. */
    approval: rng.pick(['Approved', 'Approved', 'Approved', 'Pending PP', 'Pending Fit']),
  }
})

export const styleById = new Map(styles.map((s) => [s.id, s]))

export const activeStyles = styles.filter((s) => s.status === 'Active')
