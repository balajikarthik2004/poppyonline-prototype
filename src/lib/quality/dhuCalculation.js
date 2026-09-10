/**
 * Defect per Hundred Units (DHU) and Quality Yield formulas.
 */

/**
 * Calculates Defects per Hundred Units (DHU %).
 * @param {number} totalDefects - Total defect count found.
 * @param {number} totalInspected - Total pieces inspected.
 * @returns {number} DHU percentage.
 */
export function calculateDhu(totalDefects, totalInspected) {
  if (!totalInspected || totalInspected <= 0) return 0
  return Number(((totalDefects / totalInspected) * 100).toFixed(2))
}

/**
 * Calculates First-Time-Right (FTR) percentage.
 * @param {number} passCount - Number of pieces passed on first check without rework.
 * @param {number} totalInspected - Total pieces checked.
 * @returns {number} FTR percentage.
 */
export function calculateFtr(passCount, totalInspected) {
  if (!totalInspected || totalInspected <= 0) return 100
  return Number(((passCount / totalInspected) * 100).toFixed(2))
}
