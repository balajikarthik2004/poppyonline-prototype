/**
 * Costing & Yarn Consumption formulas for knitwear manufacturing.
 */

/**
 * Calculates raw yarn required per dozen garments (in kg) based on GSM and pattern area.
 * @param {number} gsm - Grams per square meter of fabric.
 * @param {number} areaSqMeters - Pattern surface area in sq meters per garment.
 * @param {number} wastagePct - Total process loss % (knitting + dyeing + cutting).
 * @returns {number} Yarn required in kg per dozen garments.
 */
export function calculateYarnPerDozen(gsm, areaSqMeters, wastagePct = 10) {
  if (!gsm || !areaSqMeters) return 0
  const garmentGrams = gsm * areaSqMeters
  const dozenGrams = garmentGrams * 12
  const dozenWithWastage = dozenGrams * (1 + wastagePct / 100)
  return Number((dozenWithWastage / 1000).toFixed(3))
}

/**
 * Calculates raw yarn required per single piece (in kg).
 * @param {number} gsm - Fabric GSM.
 * @param {number} areaSqMeters - Area in sq meters.
 * @param {number} wastagePct - Wastage percentage.
 * @returns {number} Yarn in kg per piece.
 */
export function calculateYarnPerPiece(gsm, areaSqMeters, wastagePct = 10) {
  return Number((calculateYarnPerDozen(gsm, areaSqMeters, wastagePct) / 12).toFixed(4))
}
