import React, { useCallback, useId, useLayoutEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { formatInrCompact, formatNumber } from '@/lib/format'

const statusColorHex = {
  Breakout: 0x3f52ab,
  'On Track': 0x10b981,
  Slow: 0xb8791a,
  Underperforming: 0xa92920,
}

/**
 * Interactive AmCharts 5 Horizontal Bar Chart for New Launch Performance
 */
function Am5NewLaunchBarChartComponent({
  data = [],
  categoryField = 'code',
  valueField = 'revenueInr',
  height = 200,
  className = '',
  selectedId = null,
  onBarClick,
}) {
  const chartRef = useRef(null)
  const uniqueId = useId().replace(/:/g, '_')
  const rootRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const yAxisRef = useRef(null)
  const seriesRef = useRef(null)
  const onBarClickRef = useRef(onBarClick)
  onBarClickRef.current = onBarClick

  // 1. Initialize Chart Instance ONCE
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
        paddingTop: 6,
        paddingBottom: 4,
        paddingLeft: 0,
        paddingRight: 16,
        layout: root.verticalLayout,
      })
    )
    chartInstanceRef.current = chart

    // Cursor
    const cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'none',
      })
    )
    cursor.lineX.set('visible', false)
    cursor.lineY.set('stroke', am5.color(0x94a3b8))
    cursor.lineY.set('strokeDasharray', [2, 2])

    // Y-Axis (Style Codes)
    const yRenderer = am5xy.AxisRendererY.new(root, {
      inversed: true,
      minGridDistance: 20,
      cellStartLocation: 0.15,
      cellEndLocation: 0.85,
    })

    yRenderer.grid.template.setAll({
      visible: false,
    })

    yRenderer.labels.template.setAll({
      fontSize: 10,
      fontWeight: '600',
      fontFamily: 'monospace',
      fill: am5.color(0x334155),
      paddingRight: 6,
    })

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: categoryField,
        renderer: yRenderer,
      })
    )
    yAxisRef.current = yAxis

    // X-Axis (Revenue)
    const xRenderer = am5xy.AxisRendererX.new(root, {
      strokeOpacity: 0,
    })

    xRenderer.grid.template.setAll({
      stroke: am5.color(0xe2e8f0),
      strokeOpacity: 0.8,
      strokeDasharray: [3, 3],
    })

    xRenderer.labels.template.setAll({
      fontSize: 10,
      fontWeight: '500',
      fill: am5.color(0x94a3b8),
    })

    xRenderer.labels.template.adapters.add('text', (text, target) => {
      const val = target.dataItem?.get('value')
      if (val == null) return text
      return formatInrCompact(val)
    })

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: xRenderer,
      })
    )

    // Series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: valueField,
        categoryYField: categoryField,
        tooltip: am5.Tooltip.new(root, {
          labelText: '[bold]{name}[/]\nCode: {code}\nRevenue: [bold]₹{revenueInr.formatNumber("#,###")}[/]\nSold: [bold]{unitsSold.formatNumber("#,###")} pcs[/] ({growthPct}% YoY)',
        }),
      })
    )
    seriesRef.current = series

    series.columns.template.setAll({
      height: am5.percent(70),
      cornerRadiusTR: 4,
      cornerRadiusBR: 4,
      shadowBlur: 3,
      shadowOpacity: 0.12,
    })

    series.columns.template.adapters.add('fill', (fill, target) => {
      const context = target.dataItem?.dataContext
      if (!context) return fill
      const hex = statusColorHex[context.status] || 0x3f52ab
      return am5.color(hex)
    })

    series.columns.template.adapters.add('stroke', (stroke, target) => {
      const context = target.dataItem?.dataContext
      if (!context) return stroke
      const hex = statusColorHex[context.status] || 0x3f52ab
      return am5.color(hex)
    })

    series.columns.template.events.on('click', (ev) => {
      const item = ev.target.dataItem?.dataContext
      if (item && onBarClickRef.current) {
        onBarClickRef.current(item)
      }
    })
    series.columns.template.set('cursorOverStyle', 'pointer')

    // Initial load
    yAxis.data.setAll(data)
    series.data.setAll(data)
    series.appear(600)
    chart.appear(600, 50)

    return () => {
      root.dispose()
      rootRef.current = null
      chartInstanceRef.current = null
      yAxisRef.current = null
      seriesRef.current = null
    }
  }, [categoryField, valueField])

  // 2. Smoothly Update Data when `data` actually changes (without full root disposal)
  useLayoutEffect(() => {
    if (!yAxisRef.current || !seriesRef.current) return
    yAxisRef.current.data.setAll(data)
    seriesRef.current.data.setAll(data)
  }, [data])

  return (
    <div
      ref={chartRef}
      id={`am5_launch_bar_${uniqueId}`}
      className={`w-full ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    />
  )
}

export const Am5NewLaunchBarChart = React.memo(Am5NewLaunchBarChartComponent)

