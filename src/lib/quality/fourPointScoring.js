/**
 * Standard 4-Point Fabric Inspection System penalty point calculator.
 * (ASTM D5430)
 */

/**
 * Calculates penalty points per 100 square yards of fabric.
 * @param {number} totalPenaltyPoints - Total defect penalty points assigned.
 * @param {number} fabricLengthYards - Total inspected roll length in linear yards.
 * @param {number} fabricWidthInches - Roll width in inches.
 * @returns {number} Points per 100 square yards.
 */
export function calculateFourPointScore(totalPenaltyPoints, fabricLengthYards, fabricWidthInches) {
  if (!fabricLengthYards || !fabricWidthInches || fabricLengthYards <= 0 || fabricWidthInches <= 0) return 0
  const score = (totalPenaltyPoints * 3600) / (fabricLengthYards * fabricWidthInches)
  return Number(score.toFixed(2))
}

/**
 * Evaluates fabric roll grade based on 4-point penalty score.
 * Max acceptable standard is typically 28 points per 100 sq yds for first-quality garment fabric.
 * @param {number} scorePer100SqYds - Penalty point score.
 * @param {number} maxAcceptable - Threshold (default 28).
 * @returns {'Pass' | 'Fail'}
 */
export function getFabricRollGrade(scorePer100SqYds, maxAcceptable = 28) {
  return scorePer100SqYds <= maxAcceptable ? 'Pass' : 'Fail'
}
