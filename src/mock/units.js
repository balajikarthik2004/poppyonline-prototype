/**
 * The manufacturing base. The public site states three factories on sprawling
 * campuses in Tirupur, with knitting, processing, printing, embroidery, sewing
 * and packing run in-house. Machine counts per unit are apportioned to the
 * published totals; the company does not publish a per-unit split.
 */
export const units = [
  {
    id: 'unit-1',
    name: 'Unit I - M.P. Nagar',
    shortName: 'U-I',
    type: 'Integrated Garmenting',
    location: 'M.P. Nagar, Tirupur',
    commissionedYear: 1973,
    focus: 'Mens and womens outerwear - tees, polos, sweatshirts',
    sewingMachines: 620,
    knittingMachines: 18,
    dailyPieces: 42000,
  },
  {
    id: 'unit-2',
    name: 'Unit II - Mannarai',
    shortName: 'U-II',
    type: 'Integrated Garmenting',
    location: 'Mannarai, Tirupur',
    commissionedYear: 1994,
    focus: 'Kidswear - boys, girls and infants programmes',
    sewingMachines: 540,
    knittingMachines: 16,
    dailyPieces: 36000,
  },
  {
    id: 'unit-3',
    name: 'Unit III - Perumanallur',
    shortName: 'U-III',
    type: 'Garmenting & Inners',
    location: 'Perumanallur Road, Tirupur',
    commissionedYear: 2008,
    focus: 'Inners, base layers and high-volume basics',
    sewingMachines: 340,
    knittingMachines: 15,
    dailyPieces: 22000,
  },
  {
    id: 'proc-unit',
    name: 'Processing House - Veerapandi',
    shortName: 'PROC',
    type: 'Dyeing & Processing',
    location: 'Veerapandi, Tirupur',
    commissionedYear: 1999,
    focus: 'Soft-flow dyeing, compacting, printing and embroidery for all units',
    sewingMachines: 0,
    knittingMachines: 0,
    dailyPieces: 0,
  },
]

export const unitById = new Map(units.map((u) => [u.id, u]))

/**
 * The process route a garment actually travels, in order. Each stage carries
 * the published daily capacity for its department so plans can be checked
 * against real installed capability.
 */
export const processStages = [
  {
    key: 'knitting',
    label: 'Knitting',
    path: '/production/knitting',
    unitOfMeasure: 'kg',
    dailyCapacity: 10000,
    machines: '45 circular + 4 flat knit',
    blurb: 'Greige fabric knitted from yarn on imported circular and flat-knit machines.',
    outputs: ['Single Jersey', 'Rib', 'Interlock', 'Fleece', 'Pique', 'Jacquard'],
  },
  {
    key: 'dyeing',
    label: 'Dyeing & Processing',
    path: '/production/dyeing',
    unitOfMeasure: 'kg',
    dailyCapacity: 12000,
    machines: 'Soft-flow dyeing and finishing ranges',
    blurb: 'Greige fabric scoured, reactive-dyed to buyer shade and finished.',
    outputs: ['Reactive dyed', 'Enzyme washed', 'Softener finished'],
  },
  {
    key: 'compacting',
    label: 'Compacting',
    path: '/production/compacting',
    unitOfMeasure: 'kg',
    dailyCapacity: 5000,
    machines: 'Tube Tex compactors',
    blurb: 'Dyed fabric stabilised for shrinkage and width before cutting.',
    outputs: ['Tubular compacted', 'Open-width compacted'],
  },
  {
    key: 'cutting',
    label: 'Cutting',
    path: '/production/cutting',
    unitOfMeasure: 'pcs',
    dailyCapacity: 110000,
    machines: 'CAD marker planning, straight knife and auto cutters',
    blurb: 'Fabric laid, marker-planned and cut into bundled panels by size ratio.',
    outputs: ['Cut bundles', 'Panel sets'],
  },
  {
    key: 'printing',
    label: 'Printing',
    path: '/production/printing',
    unitOfMeasure: 'pcs',
    dailyCapacity: 25000,
    machines: '10 semi-auto + 2 auto + 2 MHM computerised',
    blurb: 'Placement and rotary printing up to 12 colours on panels or garments.',
    outputs: ['Placement print', 'Rotary print', 'Discharge print'],
  },
  {
    key: 'embroidery',
    label: 'Embroidery',
    path: '/production/embroidery',
    unitOfMeasure: 'pcs',
    dailyCapacity: 25000,
    machines: 'Barudan and Tajima, 11 colour',
    blurb: 'Logo, appliqué and sequin embroidery on cut panels.',
    outputs: ['Logo embroidery', 'Appliqué', 'Sequin work'],
  },
  {
    key: 'sewing',
    label: 'Sewing',
    path: '/production/sewing',
    unitOfMeasure: 'pcs',
    dailyCapacity: 100000,
    machines: '1,500 machines - overlock, flatlock, flatseam, single needle',
    blurb: 'Panels assembled into garments on modular lines with inline checking.',
    outputs: ['Assembled garments'],
  },
  {
    key: 'checking',
    label: 'Checking',
    path: '/production/checking',
    unitOfMeasure: 'pcs',
    dailyCapacity: 105000,
    machines: 'Inspection tables, needle detection',
    blurb: '100% garment checking, measurement audit and needle detection.',
    outputs: ['Passed', 'Rework', 'Rejected'],
  },
  {
    key: 'packing',
    label: 'Ironing & Packing',
    path: '/production/packing',
    unitOfMeasure: 'pcs',
    dailyCapacity: 100000,
    machines: 'Steam presses, folding and carton lines',
    blurb: 'Pressed, tagged, polybagged and packed to the buyer carton plan.',
    outputs: ['Cartoned', 'Ready to ship'],
  },
]

export const stageByKey = new Map(processStages.map((s) => [s.key, s]))

/** Fabric-side stages run at the processing house, garment-side at the units. */
export const fabricStages = ['knitting', 'dyeing', 'compacting']
export const garmentStages = ['cutting', 'printing', 'embroidery', 'sewing', 'checking', 'packing']

export const unitOptions = [{ id: 'all', name: 'All Units', shortName: 'ALL' }, ...units]
