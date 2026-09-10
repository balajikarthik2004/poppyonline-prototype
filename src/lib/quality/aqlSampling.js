/**
 * Statistical AQL Sampling tables and calculations based on ISO 2859-1 (Normal Inspection Level II).
 */

const aqlTable = [
  { min: 2, max: 8, letter: 'A', sampleSize: 2, accept15: 0, reject15: 1, accept25: 0, reject25: 1 },
  { min: 9, max: 15, letter: 'B', sampleSize: 3, accept15: 0, reject15: 1, accept25: 0, reject25: 1 },
  { min: 16, max: 25, letter: 'C', sampleSize: 5, accept15: 0, reject15: 1, accept25: 0, reject25: 1 },
  { min: 26, max: 50, letter: 'D', sampleSize: 8, accept15: 0, reject15: 1, accept25: 0, reject25: 1 },
  { min: 51, max: 90, letter: 'E', sampleSize: 13, accept15: 0, reject15: 1, accept25: 1, reject25: 2 },
  { min: 91, max: 150, letter: 'F', sampleSize: 20, accept15: 1, reject15: 2, accept25: 1, reject25: 2 },
  { min: 151, max: 280, letter: 'G', sampleSize: 32, accept15: 1, reject15: 2, accept25: 2, reject25: 3 },
  { min: 281, max: 500, letter: 'H', sampleSize: 50, accept15: 2, reject15: 3, accept25: 3, reject25: 4 },
  { min: 501, max: 1200, letter: 'J', sampleSize: 80, accept15: 3, reject15: 4, accept25: 5, reject25: 6 },
  { min: 1201, max: 3200, letter: 'K', sampleSize: 125, accept15: 5, reject15: 6, accept25: 7, reject25: 8 },
  { min: 3201, max: 10000, letter: 'L', sampleSize: 200, accept15: 7, reject15: 8, accept25: 10, reject25: 11 },
  { min: 10001, max: 35000, letter: 'M', sampleSize: 315, accept15: 10, reject15: 11, accept25: 14, reject25: 15 },
  { min: 35001, max: 150000, letter: 'N', sampleSize: 500, accept15: 14, reject15: 15, accept25: 21, reject25: 22 },
  { min: 150001, max: 500000, letter: 'P', sampleSize: 800, accept15: 21, reject15: 22, accept25: 21, reject25: 22 },
]

/**
 * Returns required sample size and accept/reject criteria for lot size under Level II normal inspection.
 * @param {number} lotSize - Total batch quantity.
 * @param {'1.5' | '2.5' | '4.0'} aqlStandard - Target AQL level.
 * @returns {object} Sample size, accept limit (Ac), reject limit (Re).
 */
export function getAqlSamplingPlan(lotSize, aqlStandard = '2.5') {
  const row = aqlTable.find((r) => lotSize >= r.min && lotSize <= r.max) || aqlTable[aqlTable.length - 1]
  const acceptLimit = aqlStandard === '1.5' ? row.accept15 : row.accept25
  const rejectLimit = aqlStandard === '1.5' ? row.reject15 : row.reject25

  return {
    codeLetter: row.letter,
    sampleSize: row.sampleSize,
    acceptLimit,
    rejectLimit,
    aqlStandard,
  }
}
