/**
 * Carbon Footprint & Renewable Offset Calculation
 */

// Central Electricity Authority (CEA) grid emission factor for India (kg CO2 / kWh) ~ 0.82
const GRID_EMISSION_FACTOR = 0.82
const DIESEL_EMISSION_FACTOR = 2.68 // kg CO2 / litre

export function calculateCarbonOffset({
  solarKwh = 9500,
  windKwh = 21000,
  gridKwh = 38000,
  dieselLitres = 450,
}) {
  const renewableKwh = solarKwh + windKwh
  const totalKwh = renewableKwh + gridKwh

  const renewableSharePct = totalKwh > 0 ? Math.round((renewableKwh / totalKwh) * 1000) / 10 : 44.5
  
  // CO2 avoided by using Solar + Wind instead of Grid
  const co2AvoidedTons = Math.round(((renewableKwh * GRID_EMISSION_FACTOR) / 1000) * 10) / 10
  
  // Actual emissions generated from Grid import + Diesel generators
  const actualEmissionsTons = Math.round((((gridKwh * GRID_EMISSION_FACTOR) + (dieselLitres * DIESEL_EMISSION_FACTOR)) / 1000) * 10) / 10

  return {
    solarKwh,
    windKwh,
    renewableKwh,
    gridKwh,
    totalKwh,
    renewableSharePct,
    co2AvoidedTons,
    actualEmissionsTons,
    treeEquivalentsPlanted: Math.round(co2AvoidedTons * 45), // ~45 trees per ton CO2/year
  }
}
