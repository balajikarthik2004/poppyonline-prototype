import { makeRng } from '@/lib/random'

/**
 * Enterprise Buyer Master with Complete Commercial, Compliance, and Logistics Profiles.
 */
const rng = makeRng(7301)

const seedBuyers = [
  { name: 'Marks & Spencer', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 1996, currency: 'GBP', forwarder: 'DHL Global Forwarding', edi: 'EDIFACT / Tradacoms', testingReq: 'M&S C20 Colorfastness, Nickel Free, Oeko-Tex Class I' },
  { name: 'Next', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 1999, currency: 'GBP', forwarder: 'Kuehne + Nagel', edi: 'AS2 Next Direct Hub', testingReq: 'Next TM13 Pilling, Pull Test 90N, Shrinkage < 4%' },
  { name: 'Tesco', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2002, currency: 'GBP', forwarder: 'APL Logistics', edi: 'Tesco TradeExchange', testingReq: 'F&F Technical Manual 2026, Metal Detection 100%' },
  { name: 'Waitrose', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2006, currency: 'GBP', forwarder: 'DSV Logistics', edi: 'John Lewis EDI Portal', testingReq: 'Organic Cotton Certification GOTS, Formaldehyde Free' },
  { name: 'Mothercare', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2001, currency: 'GBP', forwarder: 'Kuehne + Nagel', edi: 'EDIFACT 850/856', testingReq: 'Infant Safety BS EN 14682, Saliva Fastness, Lead Free' },
  { name: 'Debenhams', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2004, currency: 'GBP', forwarder: 'CEVA Logistics', edi: 'Standard ANSI X12', testingReq: 'BS EN ISO 105 B02 Lightfastness Grade 4+' },
  { name: 'John Lewis', country: 'United Kingdom', region: 'Europe', tier: 'Key', since: 2007, currency: 'GBP', forwarder: 'DHL Global Forwarding', edi: 'JLP Vendor Gateway', testingReq: 'Fair Trade Sourcing, Seam Strength > 180N' },
  { name: 'Carrefour', country: 'France', region: 'Europe', tier: 'Volume', since: 2009, currency: 'EUR', forwarder: 'Bolloré Logistics', edi: 'DESADV / ORDERS', testingReq: 'REACH Compliance, ISO 6330 Dimensional Stability' },
  { name: 'Galeries Lafayette', country: 'France', region: 'Europe', tier: 'Boutique', since: 2013, currency: 'EUR', forwarder: 'Geodis', edi: 'WebEDI XML', testingReq: 'Luxury Finishing Spec, Zero Azo Dyes, Silk Handfeel' },
  { name: 'KiK Textilien', country: 'Germany', region: 'Europe', tier: 'Volume', since: 2010, currency: 'EUR', forwarder: 'DB Schenker', edi: 'KiK EDI Portal', testingReq: 'OEKO-TEX Standard 100 Appendix 6, Barcode Scannability' },
  { name: 'Ernsting’s Family', country: 'Germany', region: 'Europe', tier: 'Volume', since: 2012, currency: 'EUR', forwarder: 'Dachser', edi: 'EDIFACT D96A', testingReq: 'Kids Safety DIN EN 14878, Azo-free Certification' },
  { name: 'Zeeman', country: 'Netherlands', region: 'Europe', tier: 'Volume', since: 2011, currency: 'EUR', forwarder: 'Nippon Express', edi: 'Zeeman B2B XML', testingReq: 'Basic Wear Quality Matrix, Shrinkage Max 5%' },
  { name: 'H&M Sourcing', country: 'Sweden', region: 'Europe', tier: 'Key', since: 2008, currency: 'USD', forwarder: 'Maersk Logistics', edi: 'H&M Supply Chain API', testingReq: 'H&M Chemical Restrictions List RSL 2026, Higg Index' },
  { name: 'Kappahl', country: 'Sweden', region: 'Europe', tier: 'Growth', since: 2015, currency: 'EUR', forwarder: 'Scan Global Logistics', edi: 'EDIFACT ORDERS', testingReq: 'Nordic Swan Ecolabel Criteria, Microplastic Wash Test' },
  { name: 'Dansk Supermarked', country: 'Denmark', region: 'Europe', tier: 'Growth', since: 2014, currency: 'EUR', forwarder: 'DSV Logistics', edi: 'Salling EDI', testingReq: 'Danish Environmental Agency Standards' },
  { name: 'El Corte Ingles', country: 'Spain', region: 'Europe', tier: 'Growth', since: 2012, currency: 'EUR', forwarder: 'Noatum Logistics', edi: 'ECI Portal EDI', testingReq: 'Color Fastness to Perspiration UNE-EN ISO 105-E04' },
  { name: 'OVS', country: 'Italy', region: 'Europe', tier: 'Growth', since: 2016, currency: 'EUR', forwarder: 'Savino Del Bene', edi: 'OVS EDIFACT', testingReq: 'Italian Cotton Quality Standards, OEKO-TEX Standard' },
  { name: 'Kohl’s', country: 'United States', region: 'Americas', tier: 'Key', since: 2005, currency: 'USD', forwarder: 'Expeditors International', edi: 'ANSI X12 850/856/810', testingReq: 'CPSIA Lead & Phthalates, Flammability 16 CFR 1610' },
  { name: 'Target Sourcing', country: 'United States', region: 'Americas', tier: 'Volume', since: 2009, currency: 'USD', forwarder: 'C.H. Robinson', edi: 'Target EDI Green Hub', testingReq: 'Target Protocol TM-09, Fiber Identification AATCC 20' },
  { name: 'Carter’s', country: 'United States', region: 'Americas', tier: 'Growth', since: 2017, currency: 'USD', forwarder: 'Expeditors International', edi: 'Carter EDI Net', testingReq: 'Infant Sleepwear 16 CFR 1615/1616, Small Parts 16 CFR 1501' },
  { name: 'Hudson’s Bay', country: 'Canada', region: 'Americas', tier: 'Growth', since: 2016, currency: 'CAD', forwarder: 'Kintetsu World Express', edi: 'HBC Trade Portal', testingReq: 'Canada Consumer Product Safety Act (CCPSA)' },
  { name: 'Falabella', country: 'Chile', region: 'Americas', tier: 'Boutique', since: 2018, currency: 'USD', forwarder: 'Hellmann Worldwide', edi: 'Falabella B2B', testingReq: 'INN Chilean Textile Standards, Spanish Care Label' },
  { name: 'Kmart Australia', country: 'Australia', region: 'Oceania', tier: 'Volume', since: 2011, currency: 'USD', forwarder: 'Toll Global Forwarding', edi: 'Kmart EDIFACT', testingReq: 'AS/NZS 1249 Children Nightwear, UPF 50+ Sun Protection' },
  { name: 'Cotton On', country: 'Australia', region: 'Oceania', tier: 'Growth', since: 2015, currency: 'AUD', forwarder: 'Mainfreight', edi: 'Cotton On Vendor Hub', testingReq: 'BCI Chain of Custody, Color Rubbing AS 2001.4.21' },
  { name: 'The Warehouse', country: 'New Zealand', region: 'Oceania', tier: 'Growth', since: 2017, currency: 'NZD', forwarder: 'Fliway Logistics', edi: 'TWG EDI', testingReq: 'NZ Product Safety Standard, Formaldehyde < 20ppm' },
  { name: 'Muji Sourcing', country: 'Japan', region: 'Asia', tier: 'Boutique', since: 2014, currency: 'JPY', forwarder: 'Yusen Logistics', edi: 'Ryohin Keikaku XML', testingReq: 'JIS L 1096 Tensile & Tear, Zero Optical Brightener' },
  { name: 'Uniqlo Partner Mill', country: 'Japan', region: 'Asia', tier: 'Growth', since: 2019, currency: 'USD', forwarder: 'Yamato Transport', edi: 'Fast Retailing Supply Net', testingReq: 'Fast Retailing Standard QMS, Pilling JIS 4.5+' },
  { name: 'Landmark Group', country: 'United Arab Emirates', region: 'Middle East', tier: 'Volume', since: 2010, currency: 'USD', forwarder: 'GAC Logistics', edi: 'Landmark Max EDI', testingReq: 'GSO 1956 Textile Care Labeling, Color Fastness' },
  { name: 'Alshaya Trading', country: 'Kuwait', region: 'Middle East', tier: 'Growth', since: 2016, currency: 'USD', forwarder: 'Agility Logistics', edi: 'Alshaya Trade Direct', testingReq: 'SASO Certification, Heat Resistance Shrinkage' },
  { name: 'Woolworths SA', country: 'South Africa', region: 'Africa', tier: 'Growth', since: 2013, currency: 'USD', forwarder: 'Grindrod Logistics', edi: 'Woolworths B2B', testingReq: 'Good Business Journey Standards, Nickel & Chrome VI Free' },
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
    /** AQL Inspection policy configured per buyer account */
    aqlLevel: rng.pick(['AQL 1.5', 'AQL 2.5', 'AQL 2.5', 'AQL 4.0']),
    shipmentRules: 'Carton barcode mandatory, Single drop palletization, Moisture absorber in every export master carton',
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
