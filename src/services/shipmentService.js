import { simulateDelay } from './delay'
import { exportOrders, exportPorts, shipments } from '@/mock'

export async function getShipments(filters = {}) {
  let result = shipments
  if (filters.portOfLoading) {
    result = result.filter((s) => s.pol === filters.portOfLoading)
  }
  return simulateDelay(result)
}

export async function getExportPorts() {
  return simulateDelay(exportPorts)
}

export async function getShipmentSummary() {
  const activeShipments = shipments.filter((s) => s.status !== 'Delivered')
  const totalContainers = shipments.reduce((sum, s) => sum + (s.containers || 1), 0)
  const delayedShipments = shipments.filter((s) => s.status === 'Delayed' || s.risk === 'delayed')

  return simulateDelay({
    activeShipmentsCount: activeShipments.length,
    totalContainers,
    delayedCount: delayedShipments.length,
    onTimeVesselPct: 96.4,
  })
}
