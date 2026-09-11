import React, { useId, useLayoutEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { formatInrCompact, formatNumber } from '@/lib/format'

const defaultCategoryColors = [
  0x3f52ab, // Women's Wear (Indigo/Blue)
  0xd9534f, // Men's Wear (Coral/Red)
  0x10b981, // Baby & Infant (Emerald)
  0x8b5cf6, // Kids Wear (Purple)
  0xd97706, // Home Textiles (Amber)
]

/**
 * Interactive AmCharts 5 Donut Chart with center KPI label and responsive layout
 */
function Am5CategoryDonutComponent({
  data = [],
  activeMetric = 'revenue', // 'revenue' | 'units' | 'growth'
  height = 200,
  className = '',
  onSliceClick,
}) {
  const chartRef = useRef(null)
  const uniqueId = useId().replace(/:/g, '_')
  const rootRef = useRef(null)
  const seriesRef = useRef(null)
  const onSliceClickRef = useRef(onSliceClick)
  onSliceClickRef.current = onSliceClick

  const valueField = activeMetric === 'revenue' ? 'revenueInr' : activeMetric === 'units' ? 'unitsSold' : 'growthPct'

  // 1. Initialize Chart
  useLayoutEffect(() => {
    if (!chartRef.current) return

    const root = am5.Root.new(chartRef.current)
    rootRef.current = root

    root.setThemes([am5themes_Animated.new(root)])

    if (root._logo) {
      root._logo.dispose()
    }

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(58),
        radius: am5.percent(95),
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      })
    )

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: valueField,
        categoryField: 'name',
        alignLabels: false,
      })
    )
    seriesRef.current = series

    series.slices.template.setAll({
      stroke: am5.color(0xffffff),
      strokeWidth: 2,
      cornerRadius: 4,
      tooltipText:
        activeMetric === 'revenue'
          ? '[bold]{category}[/]\nRevenue: ₹{value.formatNumber("#,###")}\n[bold]{valuePercentTotal.formatNumber("0.0")}% of Total Sales[/]'
          : activeMetric === 'units'
          ? '[bold]{category}[/]\nVolume: {value.formatNumber("#,###")} pcs\n[bold]{valuePercentTotal.formatNumber("0.0")}% of Total Volume[/]'
          : '[bold]{category}[/]\nYoY Growth: +{value}%',
    })

    series.slices.template.states.create('hover', {
      scale: 1.05,
      shiftRadius: 6,
    })

    const colors = defaultCategoryColors.map((c) => am5.color(c))
    series.get('colors').set('colors', colors)

    series.labels.template.setAll({ forceHidden: true })
    series.ticks.template.setAll({ forceHidden: true })

    series.slices.template.events.on('click', (ev) => {
      const item = ev.target.dataItem?.dataContext
      if (item && onSliceClickRef.current) onSliceClickRef.current(item)
    })
    series.slices.template.set('cursorOverStyle', 'pointer')

    const formattedData = data.map((item) => ({
      ...item,
      [valueField]: Number(item[valueField] || 0),
    }))

    series.data.setAll(formattedData)
    series.appear(700, 50)
    chart.appear(700, 50)

    return () => {
      root.dispose()
      rootRef.current = null
      seriesRef.current = null
    }
  }, [activeMetric, valueField])

  // 2. Smoothly Update Data
  useLayoutEffect(() => {
    if (!seriesRef.current) return
    const formattedData = data.map((item) => ({
      ...item,
      [valueField]: Number(item[valueField] || 0),
    }))
    seriesRef.current.data.setAll(formattedData)
  }, [data, valueField])

  return (
    <div className={`relative w-full ${className}`} style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      <div
        ref={chartRef}
        id={`am5_donut_${uniqueId}`}
        className="h-full w-full"
      />
    </div>
  )
}

export const Am5CategoryDonut = React.memo(Am5CategoryDonutComponent)

