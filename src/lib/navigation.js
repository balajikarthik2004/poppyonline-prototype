import {
  Bot,
  Boxes,
  ClipboardList,
  Factory,
  Gauge,
  LayoutDashboard,
  Leaf,
  Package,
  Palette,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Wrench,
  Zap,
} from 'lucide-react'

/**
 * Navigation covers only what Poppys Knitwear actually operates per the public
 * record at poppysonline.com: knitting, soft-flow dyeing and compacting,
 * printing, embroidery, cutting and sewing, checking, ironing and packing -
 * feeding an export-led order book across 50+ countries.
 *
 * This is the knitwear-export analogue of a spinning mill's process tree: where
 * a mill runs blow room through ring spinning, a garment export house runs
 * greige knitting through final packing, with merchandising sitting upstream of
 * production rather than a yarn-count planning desk.
 */

/** The AI module gets its own visual treatment in the sidebar. */
export const AI_SECTION_LABEL = 'Poppys AI'

export const navTree = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  {
    label: AI_SECTION_LABEL,
    icon: Bot,
    children: [
      { label: 'AI Copilot', path: '/ai' },
      { label: 'Insights & Anomalies', path: '/ai/insights' },
      { label: 'Resolution Playbooks', path: '/ai/playbooks' },
      { label: 'Expert Network', path: '/ai/experts' },
      { label: 'Shop Floor', path: '/ai/shop-floor' },
    ],
  },
  {
    label: 'Sales & Export',
    icon: ShoppingCart,
    children: [
      { label: 'Buyers', path: '/sales/buyers' },
      { label: 'Export Orders', path: '/sales/export-orders' },
      { label: 'Order Book', path: '/sales/order-book' },
      { label: 'Shipments', path: '/sales/shipments' },
    ],
  },
  {
    label: 'Merchandising',
    icon: Palette,
    children: [
      { label: 'Style Library', path: '/merch/styles' },
      { label: 'Sampling', path: '/merch/sampling' },
      { label: 'Costing', path: '/merch/costing' },
    ],
  },
  {
    label: 'Planning',
    icon: ClipboardList,
    children: [
      { label: 'Production Orders', path: '/planning/production-orders' },
      { label: 'Capacity Planning', path: '/planning/capacity' },
    ],
  },
  {
    label: 'Procurement',
    icon: Package,
    children: [
      { label: 'Overview', path: '/procurement' },
      { label: 'Suppliers', path: '/procurement/suppliers' },
      { label: 'Purchase Requisitions', path: '/procurement/pr' },
      { label: 'Purchase Orders', path: '/procurement/po' },
      { label: 'GRN', path: '/procurement/grn' },
    ],
  },
  {
    label: 'Inventory',
    icon: Boxes,
    children: [
      { label: 'Overview', path: '/inventory' },
      { label: 'Yarn Store', path: '/inventory/yarn' },
      { label: 'Fabric Store', path: '/inventory/fabric' },
      { label: 'WIP', path: '/inventory/wip' },
      { label: 'Finished Goods', path: '/inventory/finished-goods' },
      { label: 'Stock Movements', path: '/inventory/stock-movements' },
    ],
  },
  {
    label: 'Production',
    icon: Factory,
    children: [
      { label: 'Overview', path: '/production' },
      { label: 'Knitting', path: '/production/knitting' },
      { label: 'Dyeing & Processing', path: '/production/dyeing' },
      { label: 'Compacting', path: '/production/compacting' },
      { label: 'Cutting', path: '/production/cutting' },
      { label: 'Printing', path: '/production/printing' },
      { label: 'Embroidery', path: '/production/embroidery' },
      { label: 'Sewing', path: '/production/sewing' },
      { label: 'Checking', path: '/production/checking' },
      { label: 'Ironing & Packing', path: '/production/packing' },
    ],
  },
  {
    label: 'Quality Management',
    icon: ShieldCheck,
    children: [
      { label: 'Dashboard', path: '/quality' },
      { label: 'Lab Tests', path: '/quality/lab-tests' },
      { label: 'Fabric Quality', path: '/quality/fabric' },
      { label: 'Inline Inspection', path: '/quality/inline' },
      { label: 'Final AQL Audit', path: '/quality/aql' },
      { label: 'Rejections', path: '/quality/rejections' },
      { label: 'Buyer Complaints', path: '/quality/complaints' },
    ],
  },
  {
    label: 'Maintenance',
    icon: Wrench,
    children: [
      { label: 'Machine Dashboard', path: '/maintenance' },
      { label: 'Preventive Maintenance', path: '/maintenance/pm' },
      { label: 'Breakdowns', path: '/maintenance/breakdowns' },
      { label: 'Spare Parts', path: '/maintenance/spare-parts' },
    ],
  },
  { label: 'Energy & Utilities', icon: Zap, path: '/energy' },
  // { label: 'Compliance & CSR', icon: Leaf, path: '/compliance' },
  {
    label: 'Master Data',
    icon: Gauge,
    children: [
      { label: 'Styles', path: '/master/styles' },
      { label: 'Buyers', path: '/master/buyers' },
      { label: 'Suppliers', path: '/master/suppliers' },
      { label: 'Machines', path: '/master/machines' },
      { label: 'Yarn Lots', path: '/master/yarn-lots' },
      { label: 'Defect Taxonomy', path: '/master/defects' },
      { label: 'Ports & Logistics', path: '/master/ports' },
    ],
  },
  { label: 'Administration', icon: Settings, path: '/admin' },
]

/** Flattened for global search and breadcrumbs. */
export const flatNavEntries = navTree.flatMap((section) => {
  if (section.path) {
    return [{ label: section.label, path: section.path, sectionLabel: section.label }]
  }
  return (section.children ?? []).map((child) => ({
    label: child.label,
    path: child.path,
    sectionLabel: section.label,
  }))
})
