import { simulateDelay } from './delay'
import {
  categoryPerformance,
  newLaunches,
  regionalMultipliers,
} from '@/mock'

/**
 * Calculates demand coverage and strategic production recommendations
 * based on enterprise business rules:
 * - Demand Coverage % = (Production Units / Demand Units) * 100
 * - Net Gap = Production Units - Demand Units (Negative = Shortage, Positive = Surplus)
 */
export async function getIntelligenceData(filters = {}) {
  const {
    period = '30d',
    category = 'all',
    region = 'all',
    comparePrevious = false,
  } = filters

  const regionMultiplier = regionalMultipliers[region] || 1.0
  const baseCategories = categoryPerformance[period] || categoryPerformance['30d']

  // 1. Process category data with regional weighting and dynamic metrics
  const processedCategories = baseCategories
    .filter((cat) => (category === 'all' ? true : cat.id === category))
    .map((cat) => {
      const demandUnits = Math.round(cat.demandUnits * regionMultiplier)
      const productionUnits = Math.round(cat.productionUnits * regionMultiplier)
      const revenueInr = Math.round(cat.revenueInr * regionMultiplier)
      const unitsSold = Math.round(cat.unitsSold * regionMultiplier)

      // Exact mathematical formulas as requested:
      // Demand Coverage % = (Production Units / Demand Units) * 100
      const demandCoveragePct = demandUnits > 0 ? Math.round((productionUnits / demandUnits) * 100) : 100
      
      // Net Gap = Production - Demand (Negative = Shortage, Positive = Surplus)
      const netGapUnits = productionUnits - demandUnits

      // Status classification
      let status = 'Balanced'
      let action = 'Maintain'
      let tone = 'warning' // yellow/neutral for maintain
      let badgeTone = 'secondary'
      let evidence = ''

      if (demandCoveragePct < 95 || netGapUnits < 0) {
        status = 'Underproduction'
        action = 'Increase'
        tone = 'danger'
        badgeTone = 'success' // green for positive growth action: Increase
        evidence = `Demand exceeds production by ${Math.abs(netGapUnits).toLocaleString()} units. Dynamic demand coverage is ${demandCoveragePct}%. Category sales increased ${cat.growthPct}% vs previous period. Risk of lost export orders and retailer stockouts.`
      } else if (demandCoveragePct > 110) {
        status = 'Overproduction'
        action = 'Reduce'
        tone = 'warning'
        badgeTone = 'danger' // red for Reduce action
        evidence = `Production exceeds market demand by ${netGapUnits.toLocaleString()} units. Dynamic demand coverage is ${demandCoveragePct}%. High WIP holding costs and inventory overhang on factory floor.`
      } else {
        status = 'Balanced'
        action = 'Maintain'
        tone = 'success'
        badgeTone = 'warning' // yellow/amber for Maintain
        evidence = `Production is synchronized within healthy buffer tolerance (95%–110%). Dynamic demand coverage is ${demandCoveragePct}%. Maintain current line loading and SMV cadence.`
      }

      return {
        ...cat,
        revenueInr,
        unitsSold,
        demandUnits,
        productionUnits,
        demandCoveragePct,
        netGapUnits,
        status,
        action,
        tone,
        badgeTone,
        evidence,
        // Comparison delta if active
        prevRevenueInr: Math.round(cat.prevRevenueInr * regionMultiplier),
        prevUnitsSold: Math.round(cat.prevUnitsSold * regionMultiplier),
      }
    })

  // 2. Filter new launches
  const filteredLaunches = newLaunches
    .filter((nl) => (category === 'all' ? true : nl.categoryId === category))
    .map((nl) => ({
      ...nl,
      revenueInr: Math.round(nl.revenueInr * regionMultiplier),
      unitsSold: Math.round(nl.unitsSold * regionMultiplier),
    }))

  // 3. Overall aggregated metrics
  const totalDemand = processedCategories.reduce((s, c) => s + c.demandUnits, 0)
  const totalProduction = processedCategories.reduce((s, c) => s + c.productionUnits, 0)
  const totalRevenue = processedCategories.reduce((s, c) => s + c.revenueInr, 0)
  const overallCoveragePct = totalDemand > 0 ? Math.round((totalProduction / totalDemand) * 100) : 100
  const netTotalGap = totalProduction - totalDemand

  const launchCounts = {
    total: filteredLaunches.length,
    breakout: filteredLaunches.filter((l) => l.status === 'Breakout Winner').length,
    onTrack: filteredLaunches.filter((l) => l.status === 'On Track').length,
    slow: filteredLaunches.filter((l) => l.status === 'Slow Starter').length,
    underperforming: filteredLaunches.filter((l) => l.status === 'Underperforming').length,
  }

  return simulateDelay({
    period,
    category,
    region,
    comparePrevious,
    categories: processedCategories,
    launches: filteredLaunches,
    launchCounts,
    summary: {
      totalDemand,
      totalProduction,
      totalRevenue,
      overallCoveragePct,
      netTotalGap,
    },
  })
}
