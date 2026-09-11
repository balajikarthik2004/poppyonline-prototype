import React, { useId, useLayoutEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

/**
 * Interactive AmCharts 5 Clustered Column Chart for Production vs Demand
 */
function Am5ProductionDemandChartComponent({
  data = [],
  categoryField = 'name',
  productionField = 'productionUnits',
  demandField = 'demandUnits',
  height = 200,
  className = '',
  onBarClick,
}) {
  const chartRef = useRef(null)
  const uniqueId = useId().replace(/:/g, '_')
  const rootRef = useRef(null)
  const xAxisRef = useRef(null)
  const prodSeriesRef = useRef(null)
  const demandSeriesRef = useRef(null)
  const onBarClickRef = useRef(onBarClick)
  onBarClickRef.current = onBarClick

  // 1. Initialize Chart ONCE
  useLayoutEffect(() => {
    if (!chartRef.current) return

    const root = am5.Root.new(chartRef.current)
    rootRef.current = root

    root.setThemes([am5themes_Animated.new(root)])

    if (root._logo) {
      root._logo.dispose()
    }

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: 'none',
        wheelY: 'none',
        paddingTop: 10,
        paddingBottom: 16,
        paddingLeft: 0,
        paddingRight: 10,
        layout: root.verticalLayout,
      })
    )

    const cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'none',
      })
    )
    cursor.lineY.set('visible', false)
    cursor.lineX.set('stroke', am5.color(0x94a3b8))
    cursor.lineX.set('strokeDasharray', [2, 2])

    // X-Axis
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 25,
      cellStartLocation: 0.15,
      cellEndLocation: 0.85,
    })

    xRenderer.grid.template.setAll({
      stroke: am5.color(0xe2e8f0),
      strokeOpacity: 0.5,
      visible: false,
    })

    xRenderer.labels.template.setAll({
      fontSize: 10.5,
      fontWeight: '600',
      fill: am5.color(0x475569),
      paddingTop: 6,
    })

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: categoryField,
        renderer: xRenderer,
      })
    )
    xAxisRef.current = xAxis

    // Y-Axis
    const yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0,
    })

    yRenderer.grid.template.setAll({
      stroke: am5.color(0xe2e8f0),
      strokeOpacity: 0.8,
      strokeDasharray: [3, 3],
    })

    yRenderer.labels.template.setAll({
      fontSize: 10,
      fontWeight: '500',
      fill: am5.color(0x94a3b8),
    })

    yRenderer.labels.template.adapters.add('text', (text, target) => {
      const val = target.dataItem?.get('value')
      if (val == null) return text
      if (val >= 1000) return `${Math.round(val / 1000)}k`
      return `${val}`
    })

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: yRenderer,
      })
    )

    // Series 1: Production Output (Bright Sky / Royal Blue)
    const prodSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Output',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: productionField,
        categoryXField: categoryField,
        clustered: true,
        tooltip: am5.Tooltip.new(root, {
          labelText: '[bold]{categoryX}[/]\nOutput: [bold]{valueY.formatNumber("#,###")} pcs[/]',
        }),
      })
    )
    prodSeriesRef.current = prodSeries

    prodSeries.columns.template.setAll({
      fill: am5.color(0x3b82f6),
      stroke: am5.color(0x3b82f6),
      width: am5.percent(70),
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      tooltipY: 0,
      shadowColor: am5.color(0x3b82f6),
      shadowBlur: 3,
      shadowOpacity: 0.12,
    })

    // Series 2: Market Demand (Fresh Vibrant Emerald Green)
    const demandSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Demand',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: demandField,
        categoryXField: categoryField,
        clustered: true,
        tooltip: am5.Tooltip.new(root, {
          labelText: '[bold]{categoryX}[/]\nDemand: [bold]{valueY.formatNumber("#,###")} pcs[/]',
        }),
      })
    )
    demandSeriesRef.current = demandSeries

    demandSeries.columns.template.setAll({
      fill: am5.color(0x10b981),
      stroke: am5.color(0x10b981),
      width: am5.percent(70),
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      tooltipY: 0,
      shadowColor: am5.color(0x10b981),
      shadowBlur: 3,
      shadowOpacity: 0.12,
    })

    prodSeries.columns.template.events.on('click', (ev) => {
      const item = ev.target.dataItem?.dataContext
      if (item && onBarClickRef.current) onBarClickRef.current(item, 'production')
    })
    demandSeries.columns.template.events.on('click', (ev) => {
      const item = ev.target.dataItem?.dataContext
      if (item && onBarClickRef.current) onBarClickRef.current(item, 'demand')
    })
    prodSeries.columns.template.set('cursorOverStyle', 'pointer')
    demandSeries.columns.template.set('cursorOverStyle', 'pointer')

    // Initial populate
    xAxis.data.setAll(data)
    prodSeries.data.setAll(data)
    demandSeries.data.setAll(data)

    prodSeries.appear(700)
    demandSeries.appear(700)
    chart.appear(700, 50)

    return () => {
      root.dispose()
      rootRef.current = null
      xAxisRef.current = null
      prodSeriesRef.current = null
      demandSeriesRef.current = null
    }
  }, [categoryField, productionField, demandField])

  // 2. Smoothly Update Data
  useLayoutEffect(() => {
    if (!xAxisRef.current || !prodSeriesRef.current || !demandSeriesRef.current) return
    xAxisRef.current.data.setAll(data)
    prodSeriesRef.current.data.setAll(data)
    demandSeriesRef.current.data.setAll(data)
  }, [data])

  return (
    <div
      ref={chartRef}
      id={`am5_prod_demand_${uniqueId}`}
      className={`w-full ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    />
  )
}

export const Am5ProductionDemandChart = React.memo(Am5ProductionDemandChartComponent)

