import { createBrowserRouter, Navigate } from 'react-router-dom'

import { Shell } from '@/components/layout/Shell'
import ExecutiveDashboard from '@/pages/dashboard/ExecutiveDashboard'

import { Copilot, AiInsights, Playbooks, ExpertNetwork } from '@/pages/ai'
import { Buyers, ExportOrders, OrderBook, Shipments } from '@/pages/sales'
import { StyleLibrary, Sampling, Costing } from '@/pages/merch'
import { ProductionOrders, CapacityPlanning } from '@/pages/planning'
import {
  ProcurementOverview,
  Suppliers,
  PurchaseRequisitions,
  PurchaseOrders,
  Grn,
} from '@/pages/procurement'
import {
  InventoryOverview,
  YarnStore,
  FabricStore,
  Wip,
  FinishedGoods,
  StockMovements,
} from '@/pages/inventory'
import { ProductionOverview, ProcessPage, ShopFloor } from '@/pages/production'
import {
  QualityDashboard,
  LabTests,
  FabricQuality,
  InlineInspection,
  AqlAudit,
  Rejections,
  Complaints,
} from '@/pages/quality'
import {
  MachineDashboard,
  PreventiveMaintenance,
  Breakdowns,
  SpareParts,
} from '@/pages/maintenance'
import { EnergyDashboard } from '@/pages/energy'
import { Administration, Compliance } from '@/pages/admin'
import {
  MasterStyles,
  MasterBuyers,
  MasterSuppliers,
  MasterMachines,
  MasterYarnLots,
} from '@/pages/master'

/** Every leaf in the navigation tree resolves to a real, data-backed page. */
export const routes = [
  { path: 'ai', element: <Copilot /> },
  { path: 'ai/insights', element: <AiInsights /> },
  { path: 'ai/playbooks', element: <Playbooks /> },
  { path: 'ai/experts', element: <ExpertNetwork /> },
  { path: 'ai/shop-floor', element: <ShopFloor /> },

  { path: 'sales/buyers', element: <Buyers /> },
  { path: 'sales/export-orders', element: <ExportOrders /> },
  { path: 'sales/order-book', element: <OrderBook /> },
  { path: 'sales/shipments', element: <Shipments /> },

  { path: 'merch/styles', element: <StyleLibrary /> },
  { path: 'merch/sampling', element: <Sampling /> },
  { path: 'merch/costing', element: <Costing /> },

  { path: 'planning/production-orders', element: <ProductionOrders /> },
  { path: 'planning/capacity', element: <CapacityPlanning /> },

  { path: 'procurement', element: <ProcurementOverview /> },
  { path: 'procurement/suppliers', element: <Suppliers /> },
  { path: 'procurement/pr', element: <PurchaseRequisitions /> },
  { path: 'procurement/po', element: <PurchaseOrders /> },
  { path: 'procurement/grn', element: <Grn /> },

  { path: 'inventory', element: <InventoryOverview /> },
  { path: 'inventory/yarn', element: <YarnStore /> },
  { path: 'inventory/fabric', element: <FabricStore /> },
  { path: 'inventory/wip', element: <Wip /> },
  { path: 'inventory/finished-goods', element: <FinishedGoods /> },
  { path: 'inventory/stock-movements', element: <StockMovements /> },

  // One component serves all nine stages; the route carries the stage key.
  { path: 'production', element: <ProductionOverview /> },
  { path: 'production/:stageKey', element: <ProcessPage /> },

  { path: 'quality', element: <QualityDashboard /> },
  { path: 'quality/lab-tests', element: <LabTests /> },
  { path: 'quality/fabric', element: <FabricQuality /> },
  { path: 'quality/inline', element: <InlineInspection /> },
  { path: 'quality/aql', element: <AqlAudit /> },
  { path: 'quality/rejections', element: <Rejections /> },
  { path: 'quality/complaints', element: <Complaints /> },

  { path: 'maintenance', element: <MachineDashboard /> },
  { path: 'maintenance/pm', element: <PreventiveMaintenance /> },
  { path: 'maintenance/breakdowns', element: <Breakdowns /> },
  { path: 'maintenance/spare-parts', element: <SpareParts /> },

  { path: 'energy', element: <EnergyDashboard /> },
  { path: 'compliance', element: <Compliance /> },

  { path: 'master/styles', element: <MasterStyles /> },
  { path: 'master/buyers', element: <MasterBuyers /> },
  { path: 'master/suppliers', element: <MasterSuppliers /> },
  { path: 'master/machines', element: <MasterMachines /> },
  { path: 'master/yarn-lots', element: <MasterYarnLots /> },

  { path: 'admin', element: <Administration /> },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <ExecutiveDashboard /> },
      ...routes,
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
