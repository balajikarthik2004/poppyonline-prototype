import { simulateDelay } from './delay'
import {
  fabricStock,
  finishedGoods,
  stockMovements,
  wipStock,
  yarnLots,
  yarnStock,
} from '@/mock'

export async function getYarnInventory(filters = {}) {
  let result = yarnStock
  if (filters.lowStockOnly) {
    result = result.filter((y) => y.status === 'Low Stock' || y.bags < 20)
  }
  return simulateDelay(result)
}

export async function getFabricInventory(filters = {}) {
  let result = fabricStock
  if (filters.shadeBand) {
    result = result.filter((f) => f.shadeBand === filters.shadeBand)
  }
  return simulateDelay(result)
}

export async function getWipInventory(filters = {}) {
  let result = wipStock
  if (filters.unitId && filters.unitId !== 'all') {
    result = result.filter((w) => w.unitId === filters.unitId)
  }
  if (filters.stage) {
    result = result.filter((w) => w.stageKey === filters.stage || w.stage === filters.stage)
  }
  return simulateDelay(result)
}

export async function getFinishedGoodsInventory() {
  return simulateDelay(finishedGoods)
}

export async function getStockMovements() {
  return simulateDelay(stockMovements)
}

export async function getInventorySummary() {
  const totalYarnBags = yarnStock.reduce((sum, y) => sum + (y.bags || 0), 0)
  const totalFabricRolls = fabricStock.length
  const totalWipPieces = wipStock.reduce((sum, w) => sum + (w.quantityPcs || w.qty || 1500), 0)
  const totalFinishedCartons = finishedGoods.reduce((sum, f) => sum + (f.cartons || 25), 0)

  return simulateDelay({
    totalYarnBags,
    totalFabricRolls,
    totalWipPieces,
    totalFinishedCartons,
    agingWipCount: wipStock.filter((w) => (w.agingDays || 2) > 3).length,
  })
}
