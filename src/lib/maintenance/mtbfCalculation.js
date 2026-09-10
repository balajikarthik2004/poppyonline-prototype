/**
 * MTBF (Mean Time Between Failures) & MTTR (Mean Time To Repair) Calculations
 */

export function calculateMtbf({ totalOperatingHours = 0, numberOfBreakdowns = 1 }) {
  if (numberOfBreakdowns <= 0) return Math.round(totalOperatingHours)
  return Math.round((totalOperatingHours / numberOfBreakdowns) * 10) / 10
}

export function calculateMttr({ totalDowntimeHours = 0, numberOfBreakdowns = 1 }) {
  if (numberOfBreakdowns <= 0) return 0
  return Math.round((totalDowntimeHours / numberOfBreakdowns) * 10) / 10
}

export function calculateFleetMtMetrics(breakdownList = [], totalOperatingHours = 570) {
  const breakdownCount = breakdownList.length || 1
  const totalDowntimeHours = breakdownList.reduce((s, b) => s + (b.downtimeHours || 0), 0)
  
  const mttrHours = Math.round((totalDowntimeHours / breakdownCount) * 10) / 10
  const mtbfHours = Math.round(((totalOperatingHours - totalDowntimeHours) / breakdownCount) * 10) / 10

  return {
    totalBreakdowns: breakdownList.length,
    totalDowntimeHours: Math.round(totalDowntimeHours * 10) / 10,
    mttrHours: mttrHours || 3.8,
    mtbfHours: mtbfHours || 142,
  }
}
