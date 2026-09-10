/**
 * Cut-Make-Trim (CMT) cost calculator based on Standard Minute Value (SMV).
 */

/**
 * Calculates garment manufacturing labor cost (CM) from SMV and operator hourly cost.
 * @param {number} smv - Standard Minute Value of the style.
 * @param {number} costPerOperatorHourUsd - Direct operator hourly rate in USD.
 * @param {number} efficiencyPct - Expected line efficiency percentage (e.g. 65 for 65%).
 * @returns {number} CM labor cost per piece in USD.
 */
export function calculateCmCost(smv, costPerOperatorHourUsd = 1.85, efficiencyPct = 65) {
  if (!smv || smv <= 0 || efficiencyPct <= 0) return 0
  const minuteCost = costPerOperatorHourUsd / 60
  const adjustedSmv = smv / (efficiencyPct / 100)
  return Number((adjustedSmv * minuteCost).toFixed(3))
}

/**
 * Calculates total garment FOB cost from cost components.
 * @param {object} components - Cost elements.
 * @returns {object} Breakdown and total FOB in USD.
 */
export function calculateGarmentCost(components) {
  const {
    yarnCost = 0,
    knittingDyeingCost = 0,
    printEmbroideryCost = 0,
    cmCost = 0,
    trimsAndAccessories = 0,
    packingAndFreight = 0,
    overheadUsd = 0,
    targetMarginPct = 12,
  } = components

  const netFactoryCost =
    yarnCost +
    knittingDyeingCost +
    printEmbroideryCost +
    cmCost +
    trimsAndAccessories +
    packingAndFreight +
    overheadUsd

  const marginFactor = (100 - targetMarginPct) / 100
  const fobPrice = marginFactor > 0 ? netFactoryCost / marginFactor : netFactoryCost
  const marginUsd = fobPrice - netFactoryCost

  return {
    netFactoryCost: Number(netFactoryCost.toFixed(3)),
    marginUsd: Number(marginUsd.toFixed(3)),
    fobPrice: Number(fobPrice.toFixed(3)),
    marginPct: targetMarginPct,
  }
}
