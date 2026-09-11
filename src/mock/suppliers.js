import { makeRng } from '@/lib/random'

/**
 * Enterprise Supplier & Mill Master across Spinning, Dye Chemicals, Trims, Packaging, and Services.
 */
const rng = makeRng(9182)

const seedSuppliers = [
  { name: 'Sakthi Spinners', category: 'Yarn', supplierType: 'Spinning Mill', city: 'Coimbatore', moqKg: 1000 },
  { name: 'Kongu Cotton Mills', category: 'Yarn', supplierType: 'Spinning Mill', city: 'Erode', moqKg: 2000 },
  { name: 'Vellamal Textiles', category: 'Yarn', supplierType: 'Spinning Mill', city: 'Dindigul', moqKg: 1500 },
  { name: 'Amaravathi Spinning', category: 'Yarn', supplierType: 'Spinning Mill', city: 'Udumalpet', moqKg: 1000 },
  { name: 'Sree Karpagam Mills', category: 'Yarn', supplierType: 'Spinning Mill', city: 'Tirupur', moqKg: 500 },
  { name: 'Bharathi Compact Yarns', category: 'Yarn', supplierType: 'Spinning Mill', city: 'Coimbatore', moqKg: 1200 },
  { name: 'Nachimuthu Melange', category: 'Yarn', supplierType: 'Spinning Mill', city: 'Palladam', moqKg: 800 },
  { name: 'Dyestuff India', category: 'Chemicals & Dyes', supplierType: 'Dye Chemical Supplier', city: 'Ahmedabad', moqKg: 200 },
  { name: 'Colourtex Agencies', category: 'Chemicals & Dyes', supplierType: 'Dye Chemical Supplier', city: 'Surat', moqKg: 250 },
  { name: 'Rossari Auxiliaries', category: 'Chemicals & Dyes', supplierType: 'Dye Chemical Supplier', city: 'Mumbai', moqKg: 300 },
  { name: 'Coats Thread India', category: 'Trims', supplierType: 'Trim Supplier', city: 'Bengaluru', moqKg: 50 },
  { name: 'YKK Fasteners', category: 'Trims', supplierType: 'Accessory Supplier', city: 'Chennai', moqKg: 1000 },
  { name: 'Tirupur Label House', category: 'Trims', supplierType: 'Trim Supplier', city: 'Tirupur', moqKg: 5000 },
  { name: 'Precision Elastics', category: 'Trims', supplierType: 'Accessory Supplier', city: 'Tirupur', moqKg: 500 },
  { name: 'Sundaram Buttons', category: 'Trims', supplierType: 'Accessory Supplier', city: 'Tirupur', moqKg: 2000 },
  { name: 'Kovai Corrugators', category: 'Packaging', supplierType: 'Packaging Supplier', city: 'Coimbatore', moqKg: 1000 },
  { name: 'Poly Pack Solutions', category: 'Packaging', supplierType: 'Packaging Supplier', city: 'Tirupur', moqKg: 5000 },
  { name: 'Sri Balaji Printers', category: 'Packaging', supplierType: 'Packaging Supplier', city: 'Tirupur', moqKg: 2500 },
  { name: 'Anandha Compacting Works', category: 'Job Work', supplierType: 'Service Supplier', city: 'Tirupur', moqKg: 500 },
  { name: 'Velan Embroidery Unit', category: 'Job Work', supplierType: 'Service Supplier', city: 'Tirupur', moqKg: 200 },
  { name: 'Kaveri Washing Plant', category: 'Job Work', supplierType: 'Service Supplier', city: 'Tirupur', moqKg: 300 },
  { name: 'Southern Logistics', category: 'Logistics', supplierType: 'Service Supplier', city: 'Tuticorin', moqKg: 0 },
]

export const supplierCategories = [...new Set(seedSuppliers.map((s) => s.category))]
export const supplierTypes = [...new Set(seedSuppliers.map((s) => s.supplierType))]

export const suppliers = seedSuppliers.map((seed, i) => {
  const onTimePct = rng.float(76, 99, 1)
  const qualityPct = rng.float(88, 99.5, 1)
  const state = ['Ahmedabad', 'Surat'].includes(seed.city) ? 'Gujarat' : seed.city === 'Mumbai' ? 'Maharashtra' : seed.city === 'Bengaluru' ? 'Karnataka' : 'Tamil Nadu'

  return {
    id: `SUP-${String(i + 1).padStart(3, '0')}`,
    code: `${seed.category.slice(0, 2).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
    ...seed,
    state,
    country: 'India',
    onTimePct,
    qualityPct,
    deliveryScore: Math.round(onTimePct * 10) / 10,
    qualityScore: Math.round(qualityPct * 10) / 10,
    /** Blended rating (0-5 scale) */
    rating: Math.round(((onTimePct * 0.45 + qualityPct * 0.55) / 20) * 10) / 10,
    leadTimeDays: rng.int(4, 32),
    paymentTerms: rng.pick(['30 days', '45 days', '60 days', 'Advance 20%']),
    activePos: rng.int(0, 9),
    ytdSpendInr: rng.int(18, 940) * 100000,
    status: rng.pick(['Approved', 'Approved', 'Approved', 'Approved', 'On Hold', 'Probation']),
    oekoTex: rng.bool(0.7),
    gotsCertified: rng.bool(0.55),
    materialCategory: seed.category,
  }
})

export const supplierById = new Map(suppliers.map((s) => [s.id, s]))
