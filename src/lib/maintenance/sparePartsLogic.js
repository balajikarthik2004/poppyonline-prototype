/**
 * Spare Parts Inventory & Safety Buffer Evaluation Engine
 */

export function evaluateSparePartBuffer(part) {
  const onHand = part.stockQty ?? 0
  const minStock = part.minStockLevel ?? 10
  const reorderPoint = part.reorderPoint ?? 15
  const dailyBurnRate = (part.monthlyConsumption ?? 30) / 30

  const daysOfCover = dailyBurnRate > 0 ? Math.round(onHand / dailyBurnRate) : 999
  const isStockOutRisk = onHand <= minStock
  const isReorderNeeded = onHand <= reorderPoint

  let stockStatus = 'Optimal'
  if (onHand === 0) stockStatus = 'Stockout'
  else if (isStockOutRisk) stockStatus = 'Critical Low'
  else if (isReorderNeeded) stockStatus = 'Reorder Needed'

  return {
    ...part,
    daysOfCover,
    isStockOutRisk,
    isReorderNeeded,
    stockStatus,
    autoPrGenerated: isReorderNeeded && !part.openPrNo,
  }
}
