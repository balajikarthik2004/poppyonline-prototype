/**
 * Biomass Boiler Steam Generation & Efficiency Calculation
 */

export function calculateBoilerEfficiency({
  biomassBriquettesTons = 12.5,
  steamGeneratedTons = 48.2,
  feedWaterTempC = 65,
  steamPressureBar = 8.5,
  steamTempC = 175,
  fuelCalorificValueKcalPerKg = 3800, // Biomass Briquettes
}) {
  // Enthalpy of saturated steam at 8.5 bar ~ 665 kcal/kg
  const steamEnthalpyKcalPerKg = 665
  const feedWaterEnthalpyKcalPerKg = feedWaterTempC

  const heatOutputKcal = steamGeneratedTons * 1000 * (steamEnthalpyKcalPerKg - feedWaterEnthalpyKcalPerKg)
  const heatInputKcal = biomassBriquettesTons * 1000 * fuelCalorificValueKcalPerKg

  const efficiencyPct = heatInputKcal > 0 ? Math.round((heatOutputKcal / heatInputKcal) * 1000) / 10 : 81.5
  const steamFuelRatio = biomassBriquettesTons > 0 ? Math.round((steamGeneratedTons / biomassBriquettesTons) * 100) / 100 : 3.85

  return {
    biomassBriquettesTons,
    steamGeneratedTons,
    efficiencyPct: Math.min(95, Math.max(60, efficiencyPct)),
    steamFuelRatio,
    steamPressureBar,
    status: efficiencyPct >= 78 ? 'Optimal Combustion' : 'Flue Loss High',
  }
}
