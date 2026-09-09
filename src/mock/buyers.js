import { makeRng } from '@/lib/random'

/**
 * The buyer book. The seven named retailers are the ones the company lists
 * publicly; the remainder round the book out to the published "50+ countries"
 * export footprint. Volumes and values are illustrative.
 */
const rng = makeRng(7301)

const seedBuyers = [
  { name: 'Marks & Spencer', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 1996 },
  { name: 'Next', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 1999 },
  { name: 'Tesco', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2002 },
  { name: 'Waitrose', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2006 },
  { name: 'Mothercare', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2001 },
  { name: 'Debenhams', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2004 },
  { name: 'John Lewis', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2007 },
  { name: 'Carrefour', country: 'France', region: 'Europe', tier: 'Volume', since: 2009 },
  { name: 'Galeries Lafayette', country: 'France', region: 'Europe', tier: 'Boutique', since: 2013 },
  { name: 'KiK Textilien', country: 'Germany', region: 'Europe', tier: 'Volume', since: 2010 },
  { name: 'Ernsting’s Family', country: 'Germany', region: 'Europe', tier: 'Volume', since: 2012 },
  { name: 'Zeeman', country: 'Netherlands', region: 'Europe', tier: 'Volume', since: 2011 },
  { name: 'H&M Sourcing', country: 'Sweden', region: 'Europe', tier: 'Key', since: 2008 },
  { name: 'Kappahl', country: 'Sweden', region: 'Europe', tier: 'Growth', since: 2015 },
  { name: 'Dansk Supermarked', country: 'Denmark', region: 'Europe', tier: 'Growth', since: 2014 },
  { name: 'El Corte Ingles', country: 'Spain', region: 'Europe', tier: 'Growth', since: 2012 },
  { name: 'OVS', country: 'Italy', region: 'Europe', tier: 'Growth', since: 2016 },
  { name: 'Kohl’s', country: 'United States', region: 'Americas', tier: 'Key', since: 2005 },
  { name: 'Target Sourcing', country: 'United States', region: 'Americas', tier: 'Volume', since: 2009 },
  { name: 'Carter’s', country: 'United States', region: 'Americas', tier: 'Growth', since: 2017 },
  { name: 'Hudson’s Bay', country: 'Canada', region: 'Americas', tier: 'Growth', since: 2016 },
  { name: 'Falabella', country: 'Chile', region: 'Americas', tier: 'Boutique', since: 2018 },
  { name: 'Kmart Australia', country: 'Australia', region: 'Oceania', tier: 'Volume', since: 2011 },
  { name: 'Cotton On', country: 'Australia', region: 'Oceania', tier: 'Growth', since: 2015 },
  { name: 'The Warehouse', country: 'New Zealand', region: 'Oceania', tier: 'Growth', since: 2017 },
  { name: 'Muji Sourcing', country: 'Japan', region: 'Asia', tier: 'Boutique', since: 2014 },
  { name: 'Uniqlo Partner Mill', country: 'Japan', region: 'Asia', tier: 'Growth', since: 2019 },
  { name: 'Landmark Group', country: 'United Arab Emirates', region: 'Middle East', tier: 'Volume', since: 2010 },
  { name: 'Alshaya Trading', country: 'Kuwait', region: 'Middle East', tier: 'Growth', since: 2016 },
  { name: 'Woolworths SA', country: 'South Africa', region: 'Africa', tier: 'Growth', since: 2013 },
]

const paymentTerms = ['LC 60 days', 'LC 90 days', 'TT 30 days', 'DA 45 days', 'Open account 60 days']
const incoterms = ['FOB Tuticorin', 'FOB Chennai', 'CIF Felixstowe', 'CIF Rotterdam', 'DDP Hamburg']

export const buyers = seedBuyers.map((seed, i) => {
  const annualPieces = rng.int(120_000, 2_400_000)
  const avgFobUsd = rng.float(2.4, 11.5, 2)
  return {
    id: `BYR-${String(i + 1).padStart(3, '0')}`,
    code: `${seed.name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}${String(i + 1).padStart(2, '0')}`,
    ...seed,
    annualPieces,
    annualValueUsd: Math.round(annualPieces * avgFobUsd),
    avgFobUsd,
    paymentTerms: rng.pick(paymentTerms),
    incoterm: rng.pick(incoterms),
    onTimePct: rng.float(88, 99.4, 1),
    qualityScore: rng.float(91, 99.2, 1),
    activeStyles: rng.int(3, 26),
    /** Buyers run their own technical standards; this drives the AQL page. */
    aqlLevel: rng.pick(['AQL 1.5', 'AQL 2.5', 'AQL 2.5', 'AQL 4.0']),
    merchandiser: rng.pick([
      'K. Revathi',
      'S. Arunkumar',
      'M. Priyadarshini',
      'R. Vigneshwaran',
      'A. Bhuvaneswari',
      'T. Nandakumar',
    ]),
  }
})

export const buyerById = new Map(buyers.map((b) => [b.id, b]))

export const buyerRegions = [...new Set(buyers.map((b) => b.region))]
