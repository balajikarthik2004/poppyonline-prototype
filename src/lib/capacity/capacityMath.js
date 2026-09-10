/**
 * Multi-Tier Capacity math for apparel factories.
 * Differentiates: Rated Capacity != Available Capacity != Planned Capacity != Actual Output.
 */

/**
 * Calculates available capacity considering machine availability and planned maintenance downtime.
 * @param {number} ratedCapacity - Nameplate/rated capacity (e.g. 100,000 pcs/day).
 * @param {number} machineAvailabilityPct - Running/available asset % (e.g. 95%).
 * @returns {number} Available capacity.
 */
export function calculateAvailableCapacity(ratedCapacity, machineAvailabilityPct = 95) {
  return Math.round(ratedCapacity * (machineAvailabilityPct / 100))
}

/**
 * Calculates planned capacity considering expected line efficiency.
 * @param {number} availableCapacity - Available capacity.
 * @param {number} plannedEfficiencyPct - Target line efficiency % (e.g. 70%).
 * @returns {number} Planned capacity.
 */
export function calculatePlannedCapacity(availableCapacity, plannedEfficiencyPct = 70) {
  return Math.round(availableCapacity * (plannedEfficiencyPct / 100))
}

/**
 * Calculates capacity utilization and loading ratio.
 * @param {number} plannedLoad - Committed order load.
 * @param {number} plannedCapacity - Effective planned capacity.
 * @returns {object} Utilization percentage and variance.
 */
export function calculateCapacityUtilization(plannedLoad, plannedCapacity) {
  if (!plannedCapacity || plannedCapacity <= 0) return { utilizationPct: 0, balance: 0, status: 'Normal' }
  const utilizationPct = Number(((plannedLoad / plannedCapacity) * 100).toFixed(1))
  const balance = plannedCapacity - plannedLoad

  let status = 'Normal'
  if (utilizationPct > 100) status = 'Overloaded'
  else if (utilizationPct < 75) status = 'Underloaded'

  return {
    utilizationPct,
    balance,
    status,
  }
}
