/**
 * Process loss breakdowns across apparel manufacturing stages.
 */

export const defaultLossStages = {
  knitting: 2.5, // 2.5% yarn to greige loss (lint, fly, cone ends)
  dyeing: 4.0,   // 4.0% dye house loss (bleaching loss, trim ends)
  compacting: 1.5, // 1.5% shrinkage loss
  cutting: 3.0,  // 3.0% marker fallout & edge trims
  sewing: 1.0,   // 1.0% sewing reject scrap
  embellishment: 1.0, // Print/embroidery reject loss
}

/**
 * Calculates cumulative process loss percentage.
 * @param {object} customLosses - Stage-specific loss percentages.
 * @returns {number} Combined process loss percentage.
 */
export function calculateCumulativeLoss(customLosses = {}) {
  const losses = { ...defaultLossStages, ...customLosses }
  const total = Object.values(losses).reduce((sum, val) => sum + val, 0)
  return Number(total.toFixed(2))
}
