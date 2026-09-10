import React, { useId, useLayoutEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'

/**
 * Reusable AmCharts 5 Donut Chart Component
 * Implements smooth animated circular labels, interactive lifting slice states,
 * and optional integrated legend.
 */
export function Am5DonutChart({
  data = [],
  valueField = 'value',
  categoryField = 'category',
  innerRadius = 55,
  showLegend = true,
  showLabels = false,
  showCircularLabels = false,
  onSliceClick,
  height = 280,
  className = '',
  colors,
}) {
  const chartRef = useRef(null)
  const uniqueId = useId().replace(/:/g, '_')
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (!chartRef.current) return

    // 1. Create root element
    const root = am5.Root.new(chartRef.current)
    rootRef.current = root

    // 2. Set theme
    root.setThemes([am5themes_Animated.new(root)])

    // Hide amcharts watermark logo cleanly
    if (root._logo) {
      root._logo.dispose()
    }

    // 3. Create chart with padding
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(innerRadius),
        paddingTop: 8,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
      })
    )

    // 4. Create series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: valueField,
        categoryField: categoryField,
        alignLabels: true,
      })
    )

    // Customize slices with clean white borders and rich tooltips
    series.slices.template.setAll({
      stroke: am5.color(0xffffff),
      strokeWidth: 2,
      cornerRadius: 5,
      tooltipText: '{category}: [bold]{value}[/] ({valuePercentTotal.formatNumber("0.00")}%)',
      templateField: 'sliceSettings',
    })

    // Slice hover lift animation & state
    series.slices.template.states.create('hover', {
      scale: 1.06,
      shiftRadius: 10,
    })

    // Slice active state
    series.slices.template.states.create('active', {
      shiftRadius: 12,
      scale: 1.07,
    })

    // Hide outer circular overlapping arc labels to keep chart crystal clear & readable
    if (showLabels || showCircularLabels) {
      series.labels.template.setAll({
        text: '{category}: {valuePercentTotal.formatNumber("0.0")}%',
        fontSize: 11,
        fill: am5.color(0x334155),
        fontWeight: '500',
        oversizedBehavior: 'hide',
      })
      series.ticks.template.setAll({
        stroke: am5.color(0xcbd5e1),
        strokeWidth: 1,
      })
    } else {
      series.labels.template.setAll({
        forceHidden: true,
      })
      series.ticks.template.setAll({
        forceHidden: true,
      })
    }

    // Custom color set if provided
    if (colors && colors.length > 0) {
      const am5Colors = colors.map((c) => am5.color(c))
      series.get('colors').set('colors', am5Colors)
    }

    // Click handler
    if (onSliceClick) {
      series.slices.template.events.on('click', (ev) => {
        const dataItem = ev.target.dataItem
        if (dataItem && dataItem.dataContext) {
          onSliceClick(dataItem.dataContext)
        }
      })
      series.slices.template.set('cursorOverStyle', 'pointer')
    }

    // 5. Format & populate data
    const formattedData = data.map((item) => ({
      ...item,
      [categoryField]: item[categoryField] || item.name || '',
      [valueField]: item[valueField] != null ? Number(item[valueField]) : Number(item.value || 0),
    }))

    series.data.setAll(formattedData)

    // 6. Create clean 2-column legend
    if (showLegend) {
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          marginTop: 12,
          marginBottom: 4,
          layout: root.gridLayout,
          maxColumns: 2,
        })
      )

      legend.labels.template.setAll({
        fontSize: 11,
        fontWeight: '500',
        fill: am5.color(0x475569),
      })

      legend.valueLabels.template.setAll({
        fontSize: 11,
        fontWeight: '600',
        fill: am5.color(0x0f172a),
      })

      legend.markers.template.setAll({
        width: 10,
        height: 10,
      })

      legend.markerRectangles.template.setAll({
        cornerRadiusTL: 3,
        cornerRadiusTR: 3,
        cornerRadiusBL: 3,
        cornerRadiusBR: 3,
      })

      legend.data.setAll(series.dataItems)
    }

    // 7. Initial smooth appearance animation
    series.appear(1000, 100)
    chart.appear(1000, 100)

    // Cleanup on unmount
    return () => {
      root.dispose()
    }
  }, [
    data,
    valueField,
    categoryField,
    innerRadius,
    showLegend,
    showCircularLabels,
    onSliceClick,
    colors,
  ])

  return (
    <div
      ref={chartRef}
      id={`am5_donut_${uniqueId}`}
      className={`w-full ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    />
  )
}
