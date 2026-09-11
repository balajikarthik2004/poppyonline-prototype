/**
 * Company profile. The descriptive facts here (founding, leadership, published
 * capacities, buyer list, certifications, contact details) are drawn from the
 * public website at poppysonline.com. Every transactional figure elsewhere in
 * this app is illustrative demo data shaped around these real capabilities.
 */
export const company = {
  legalName: 'Poppys Knitwear (P) Limited',
  shortName: 'Poppys Knitwear',
  group: 'Poppys Group',
  tagline: 'Knit with conscience. Shipped with confidence.',
  establishedYear: 1973,
  founder: 'Padmashri Dr. A. Vicky',
  positioning:
    'One of the leading knitwear exporters of India, manufacturing knitted and woven apparel for men, women and children from a vertically integrated base in Tirupur.',
  about:
    'Founded in 1973 in Tirupur, Poppys Knitwear grew alongside the town that became India’s knitwear capital. The house runs knitting, dyeing, printing, embroidery, cutting, sewing and packing under one group, supplying high-street retailers across more than fifty countries.',
  vision: [
    'Maximise returns to shareholders',
    'Create an inspiring workplace',
    'Deliver a quality knitwear portfolio',
    'Nurture long-term partner relationships',
    'Practise responsible global citizenship',
  ],
  mission:
    'A people-oriented professional organisation that places customer comfort and safety at the centre of everything it makes.',

  headquarters: {
    address: 'No. 9, M.P. Nagar, 1st Street, Tirupur - 641 607',
    state: 'Tamil Nadu',
    country: 'India',
  },
  contact: {
    phones: ['+91 421 2221144', '+91 421 2221155', '+91 421 2221166'],
    fax: '+91 421 2221133',
    email: 'info@poppysknitwear.com',
    website: 'https://poppysonline.com/',
    homeTextiles: 'http://poppysmadeups.com/',
  },

  leadership: [
    {
      name: 'Padmashri Dr. A. Vicky',
      title: 'Chairman',
      note: 'A pioneer of knitwear manufacturing and export from Tirupur, recognised for his work on export infrastructure, industrial parks and fashion education in the region.',
    },
    {
      name: 'Shri Vicky Kaleswara Vignesh',
      title: 'Managing Director',
      note: 'MBA in International Business (London) with 14 years across manufacturing and shipping. Has extended the group into hotels, travel and online retail.',
    },
  ],

  /** Published group profile. */
  scale: {
    groupTurnoverUsd: 100_000_000,
    employees: 5000,
    divisions: 14,
    factories: 3,
    exportCountries: 50,
  },

  /** Buyers named on the public site. */
  keyBuyers: [
    "Marks & Spencer",
    'Next',
    'Tesco',
    'Waitrose',
    'Mothercare',
    'Debenhams',
    'John Lewis',
  ],

  /** Product segments carried in the public product menu. */
  productSegments: [
    { name: "Men's Wear", detail: 'T-shirts, polos, sweatshirts, joggers and knitted shirting' },
    { name: "Women's Wear", detail: 'Tops, tunics, leggings, dresses and loungewear' },
    { name: 'Boys Wear', detail: 'Tees, hoodies, shorts and school-season knits' },
    { name: 'Girls Wear', detail: 'Tops, dresses, leggings and printed sets' },
    { name: 'Infants', detail: 'Bodysuits, sleepsuits, bibs and layette sets' },
    { name: 'Inners', detail: 'Vests, briefs, camisoles and base layers' },
    { name: 'Home Textiles', detail: 'Made-ups supplied through the group’s Poppys Madeups division' },
  ],

  /** Fabric constructions named on the public capability list. */
  fabricTypes: [
    'Single Jersey',
    'Rib',
    'Interlock',
    'Fleece',
    'Pique',
    'Jacquard',
    'Engineered Stripe',
    'Auto Stripe',
    'Lycra Blend',
  ],

  /**
   * `sourced: true` means the item is named in text on poppysonline.com.
   * `sourced: false` means it is a plausible illustrative addition for the
   * prototype - the site shows an unlabelled logo or image, or nothing at all.
   * The Compliance page renders the distinction, so nothing invented is ever
   * presented to a reader as published fact.
   */
  certifications: [
    { name: 'Oeko-Tex Standard 100', sourced: true },
    { name: 'SITRA', sourced: true },
    { name: 'ISO 9001 quality management', sourced: false },
  ],

  groupDivisions: [
    { name: 'Spinning', sourced: true },
    { name: 'Knitting', sourced: true },
    { name: 'Dyeing & Processing', sourced: true },
    { name: 'Printing', sourced: true },
    { name: 'Embroidery', sourced: true },
    { name: 'Labels & Trims', sourced: true },
    { name: 'Packaging', sourced: true },
    { name: 'Hotels', sourced: true },
    { name: 'Travel Services', sourced: true },
    { name: 'Online Retail', sourced: true },
    { name: 'Garmenting', sourced: false },
    { name: 'Home Textiles (Madeups)', sourced: false },
    { name: 'Logistics & Shipping', sourced: false },
    { name: 'Corporate Services', sourced: false },
  ],

  csr: {
    /**
     * The public CSR page carries two images and no descriptive text, so
     * everything below is illustrative - written to be typical of a Tirupur
     * export house, not quoted from the company.
     */
    sourced: false,
    principle:
      'The public CSR page carries images only. The commitments below are illustrative of a Tirupur export house and are not published by the company.',
    pillars: [
      {
        title: 'Worker welfare',
        detail: 'Subsidised canteens, hostel accommodation, creche facilities and on-site medical cover for factory staff.',
      },
      {
        title: 'Education',
        detail: 'Scholarships and skill-development programmes for the children of employees and for first-generation learners in Tirupur district.',
      },
      {
        title: 'Zero liquid discharge',
        detail: 'Effluent from dyeing is routed through recovery so treated water returns to process rather than to the Noyyal river.',
      },
      {
        title: 'Responsible sourcing',
        detail: 'Cotton traced to BCI and organic programmes, with Oeko-Tex Standard 100 assurance on dyes and finishes.',
      },
    ],
  },

  /**
   * The public Memberships page shows four logos with no readable captions, so
   * the bodies below are the ones a Tirupur knitwear exporter would typically
   * belong to - inferred, not confirmed from the site.
   */
  memberships: [
    { name: 'Apparel Export Promotion Council (AEPC)', sourced: false },
    { name: 'Tiruppur Exporters Association (TEA)', sourced: false },
    { name: 'Confederation of Indian Industry (CII)', sourced: false },
    { name: 'Federation of Indian Export Organisations (FIEO)', sourced: false },
  ],

  /**
   * Image counts in each public product gallery. The weighting is the clearest
   * signal the site gives about where the range is concentrated: infants and
   * boys carry far more styles than the adult categories.
   */
  productGallery: [
    { segment: 'Infants', images: 22 },
    { segment: 'Boys Wear', images: 12 },
    { segment: "Men's Wear", images: 4 },
    { segment: "Women's Wear", images: 4 },
    { segment: 'Girls Wear', images: 4 },
    { segment: 'Inners', images: 4 },
  ],

  /** Observations from crawling the public site, surfaced on Administration. */
  siteNotes: [
    'The public site was last copyrighted 2017 and carries no published financial statements.',
    'Product pages are image galleries with no descriptive text, so garment specifications in this app are illustrative.',
    'The Home Textiles link points to poppysmadeups.com, which did not respond when this app was built.',
  ],
}

/**
 * The published departmental capability list - the spine of the whole app.
 * Every figure below is the company's own published capacity.
 */
export const publishedCapacity = [
  {
    department: 'Knitting',
    machines: '45 imported circular knitting machines + 4 flat knit',
    capacity: '10,000 kg per day',
    detail: 'Jersey, Rib, Interlock, Fleece, Pique, Jacquard, engineered and auto stripes, Lycra blends.',
  },
  {
    department: 'Processing',
    machines: 'Imported soft-flow dyeing and finishing ranges, Tube Tex compactors',
    capacity: '12 tonnes dyed per day / 5,000 kg compacted per day',
    detail: 'Reactive dyeing on soft-flow machines with tubular and open-width compacting.',
  },
  {
    department: 'Printing',
    machines: '10 semi-automatic + 2 automatic + 2 computerised MHM (Austria)',
    capacity: 'Rotary 6 tonnes per day / placement 25,000 pcs per day',
    detail: 'Up to 12 colours, covering rotary, placement, discharge and pigment work.',
  },
  {
    department: 'Embroidery',
    machines: 'Barudan and Tajima heads from Japan',
    capacity: '25,000 pcs per day',
    detail: 'Up to 11 colours, including appliqué and sequin work.',
  },
  {
    department: 'Production',
    machines: '1,500 sewing machines across three factories',
    capacity: '100,000 pcs per day',
    detail: 'Overlock, flatlock, flatseam, single needle, button and buttonhole, and specialised fastening.',
  },
  {
    department: 'Packing',
    machines: 'Inline metal detection, carton lines and dispatch bays',
    capacity: 'Final assembly and dispatch',
    detail: 'Buyer-specific folding, tagging, polybagging and carton make-up.',
  },
]
