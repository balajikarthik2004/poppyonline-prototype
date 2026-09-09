import { makeRng } from '@/lib/random'

/**
 * The supply base a Tirupur export house actually buys from: yarn from the
 * Coimbatore/Tirupur spinning belt, plus trims, packaging, chemicals and
 * job-work partners. All records are illustrative.
 */
const rng = makeRng(9182)

const seedSuppliers = [
  { name: 'Sakthi Spinners', category: 'Yarn', city: 'Coimbatore' },
  { name: 'Kongu Cotton Mills', category: 'Yarn', city: 'Erode' },
  { name: 'Vellamal Textiles', category: 'Yarn', city: 'Dindigul' },
  { name: 'Amaravathi Spinning', category: 'Yarn', city: 'Udumalpet' },
  { name: 'Sree Karpagam Mills', category: 'Yarn', city: 'Tirupur' },
  { name: 'Bharathi Compact Yarns', category: 'Yarn', city: 'Coimbatore' },
  { name: 'Nachimuthu Melange', category: 'Yarn', city: 'Palladam' },
  { name: 'Dyestuff India', category: 'Chemicals & Dyes', city: 'Ahmedabad' },
  { name: 'Colourtex Agencies', category: 'Chemicals & Dyes', city: 'Surat' },
  { name: 'Rossari Auxiliaries', category: 'Chemicals & Dyes', city: 'Mumbai' },
  { name: 'Coats Thread India', category: 'Trims', city: 'Bengaluru' },
  { name: 'YKK Fasteners', category: 'Trims', city: 'Chennai' },
  { name: 'Tirupur Label House', category: 'Trims', city: 'Tirupur' },
  { name: 'Precision Elastics', category: 'Trims', city: 'Tirupur' },
  { name: 'Sundaram Buttons', category: 'Trims', city: 'Tirupur' },
  { name: 'Kovai Corrugators', category: 'Packaging', city: 'Coimbatore' },
  { name: 'Poly Pack Solutions', category: 'Packaging', city: 'Tirupur' },
  { name: 'Sri Balaji Printers', category: 'Packaging', city: 'Tirupur' },
  { name: 'Anandha Compacting Works', category: 'Job Work', city: 'Tirupur' },
  { name: 'Velan Embroidery Unit', category: 'Job Work', city: 'Tirupur' },
  { name: 'Kaveri Washing Plant', category: 'Job Work', city: 'Tirupur' },
  { name: 'Southern Logistics', category: 'Logistics', city: 'Tuticorin' },
]

export const supplierCategories = [...new Set(seedSuppliers.map((s) => s.category))]

export const suppliers = seedSuppliers.map((seed, i) => {
  const onTimePct = rng.float(76, 99, 1)
  const qualityPct = rng.float(88, 99.5, 1)
  return {
    id: `SUP-${String(i + 1).padStart(3, '0')}`,
    code: `${seed.category.slice(0, 2).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
    ...seed,
    state: 'Tamil Nadu',
    country: 'India',
    onTimePct,
    qualityPct,
    /** Simple blended vendor rating used on the procurement scorecard. */
    rating: Math.round((onTimePct * 0.45 + qualityPct * 0.55) * 10) / 10,
    leadTimeDays: rng.int(4, 32),
    paymentTerms: rng.pick(['30 days', '45 days', '60 days', 'Advance 20%']),
    activePos: rng.int(0, 9),
    ytdSpendInr: rng.int(18, 940) * 100000,
    status: rng.pick(['Approved', 'Approved', 'Approved', 'Approved', 'On Hold', 'Probation']),
    oekoTex: rng.bool(0.7),
  }
})

export const supplierById = new Map(suppliers.map((s) => [s.id, s]))
