import { subMinutes, subHours } from 'date-fns'
import { makeRng } from '@/lib/random'
import { exportOrders } from './orders'
import { machines } from './machines'
import { yarnStock } from './inventory'

/** Alerts and the activity feed - the two live rails on the dashboard. */
const rng = makeRng(2468)

const alertTemplates = [
  {
    severity: 'critical',
    category: 'Delivery',
    build: () => {
      const o = rng.pick(exportOrders.filter((x) => x.risk === 'delayed')) ?? exportOrders[0]
      return {
        title: `${o.buyerName} order ${o.orderNo} past ship window`,
        body: `Style ${o.styleNo} is ${Math.abs(o.daysToShip)} days past the agreed ship date at ${o.completionPct.toFixed(0)}% completion.`,
        linkTo: '/sales/export-orders?risk=delayed',
      }
    },
  },
  {
    severity: 'critical',
    category: 'Machine',
    build: () => {
      const m = rng.pick(machines.filter((x) => x.status === 'Breakdown')) ?? machines[0]
      return {
        title: `${m.code} down at ${m.unitName}`,
        body: `${m.make} ${m.stageLabel} machine stopped. Maintenance ticket raised, output being re-routed.`,
        linkTo: '/maintenance/breakdowns',
      }
    },
  },
  {
    severity: 'high',
    category: 'Quality',
    build: () => {
      const o = rng.pick(exportOrders)
      return {
        title: `Inline DHU above threshold on ${o.styleNo}`,
        body: `Defects per hundred units crossed 6% on the ${o.unitName} line. Supervisor asked to hold and re-check.`,
        linkTo: '/quality/inline',
      }
    },
  },
  {
    severity: 'high',
    category: 'Inventory',
    build: () => {
      const y = rng.pick(yarnStock)
      return {
        title: `${y.item} below reorder level`,
        body: `Only ${Math.round(y.balanceKg)} kg left in ${y.location}. Knitting programme covered for under two days.`,
        linkTo: '/inventory/yarn',
      }
    },
  },
  {
    severity: 'medium',
    category: 'Procurement',
    build: () => ({
      title: 'Purchase order past delivery date',
      body: 'A yarn PO has not been received against the committed date. Store has flagged the shortfall to merchandising.',
      linkTo: '/procurement/po',
    }),
  },
  {
    severity: 'medium',
    category: 'Shipment',
    build: () => ({
      title: 'Export documents incomplete for a sailing this week',
      body: 'Invoice and packing list are pending for a container gated in at Tuticorin.',
      linkTo: '/sales/shipments',
    }),
  },
  {
    severity: 'low',
    category: 'Energy',
    build: () => ({
      title: 'Dye house kWh per kilo above target',
      body: 'Processing intensity ran above the 6.4 kWh/kg target for the third consecutive day.',
      linkTo: '/energy',
    }),
  },
  {
    severity: 'info',
    category: 'Compliance',
    build: () => ({
      title: 'Oeko-Tex Standard 100 renewal window open',
      body: 'Annual re-certification documents are due for submission for the dyed fabric class.',
      linkTo: '/compliance',
    }),
  },
]

export const alerts = Array.from({ length: 28 }, (_, i) => {
  const template = rng.pick(alertTemplates)
  const built = template.build()
  return {
    id: `ALR-${String(i + 1).padStart(3, '0')}`,
    severity: template.severity,
    category: template.category,
    ...built,
    timestamp: subMinutes(new Date(), rng.int(3, 4200)).toISOString(),
    acknowledged: rng.bool(0.42),
  }
}).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

const activityTemplates = [
  { icon: 'order', build: () => `New order confirmed from ${rng.pick(exportOrders).buyerName}` },
  { icon: 'production', build: () => `Cutting released for style ${rng.pick(exportOrders).styleNo}` },
  { icon: 'quality', build: () => `Final AQL audit passed for ${rng.pick(exportOrders).orderNo}` },
  { icon: 'shipment', build: () => `Container stuffed for ${rng.pick(exportOrders).buyerName}` },
  { icon: 'procurement', build: () => 'GRN posted against a yarn purchase order' },
  { icon: 'maintenance', build: () => `Preventive maintenance completed on ${rng.pick(machines).code}` },
  { icon: 'sample', build: () => `PP sample approved for style ${rng.pick(exportOrders).styleNo}` },
  { icon: 'production', build: () => `Sewing line changeover completed at ${rng.pick(['U-I', 'U-II', 'U-III'])}` },
]

export const activities = Array.from({ length: 30 }, (_, i) => {
  const template = rng.pick(activityTemplates)
  return {
    id: `ACT-${String(i + 1).padStart(3, '0')}`,
    icon: template.icon,
    text: template.build(),
    by: rng.pick([
      'K. Revathi',
      'S. Arunkumar',
      'M. Priyadarshini',
      'R. Sudeep',
      'System',
      'A. Bhuvaneswari',
    ]),
    timestamp: subHours(new Date(), rng.float(0.1, 96, 2)).toISOString(),
  }
}).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
