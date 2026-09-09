import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Droplets, Factory, Gauge, Leaf, Wind, Zap } from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import { getEnergy } from '@/services'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle, Progress, Skeleton } from '@/components/ui'
import { formatNumber, formatPct } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

export function EnergyDashboard() {
  const { dateRangePreset } = useAppStore()
  const energy = useAsync(() => getEnergy(dateRangePreset), [dateRangePreset])

  const data = energy.data

  const targets = useMemo(() => {
    if (!data) return []
    return [
      {
        label: 'Energy intensity',
        value: data.kwhPerKg,
        target: data.targets.kwhPerKg,
        unit: 'kWh/kg',
        lowerIsBetter: true,
      },
      {
        label: 'Renewable share',
        value: data.renewablePct,
        target: data.targets.renewablePct,
        unit: '%',
        lowerIsBetter: false,
      },
      {
        label: 'Water recovery',
        value: data.recoveryPct,
        target: data.targets.recoveryPct,
        unit: '%',
        lowerIsBetter: false,
      },
    ]
  }, [data])

  return (
    <PageContainer>
      <PageHeader
        title="Energy & Utilities"
        description="The dye house is the heavy consumer in a knitwear group, so intensity is tracked per kilo of fabric processed alongside water recovery."
      />

      {energy.isLoading || !data ? (
        <StatGridSkeleton count={5} />
      ) : (
        <StatGrid cols={5}>
          <StatCard label="Consumption" value={`${formatNumber(Math.round(data.totalKwh / 1000))} MWh`} icon={Zap} tone="brand" />
          <StatCard
            label="Renewable share"
            value={formatPct(data.renewablePct)}
            sublabel={`target ${data.targets.renewablePct}%`}
            icon={Wind}
            tone={data.renewablePct >= data.targets.renewablePct ? 'success' : 'warning'}
          />
          <StatCard
            label="Energy intensity"
            value={`${data.kwhPerKg} kWh/kg`}
            sublabel={`target ${data.targets.kwhPerKg}`}
            icon={Gauge}
            tone={data.kwhPerKg <= data.targets.kwhPerKg ? 'success' : 'danger'}
          />
          <StatCard
            label="Water recovered"
            value={formatPct(data.recoveryPct)}
            sublabel={`${formatNumber(data.waterKl)} kl drawn`}
            icon={Droplets}
            tone="info"
          />
          <StatCard label="CO2 emitted" value={`${formatNumber(data.co2Tonnes)} t`} icon={Leaf} tone="poppy" />
        </StatGrid>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Consumption by source</CardTitle>
            <p className="text-xs text-muted-foreground">Grid, captive wind, rooftop solar and standby diesel</p>
          </CardHeader>
          <CardContent>
            {energy.isLoading || !data ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.history} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={axisTick}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v, n) => [`${formatNumber(v)} kWh`, n]} />
                    <Area type="monotone" dataKey="grid" name="Grid" stackId="1" stroke={colorAt(0)} fill={colorAt(0)} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="wind" name="Wind" stackId="1" stroke={colorAt(5)} fill={colorAt(5)} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="solar" name="Solar" stackId="1" stroke={colorAt(4)} fill={colorAt(4)} fillOpacity={0.7} />
                    <Area type="monotone" dataKey="diesel" name="Diesel" stackId="1" stroke={colorAt(1)} fill={colorAt(1)} fillOpacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source mix</CardTitle>
          </CardHeader>
          <CardContent>
            {energy.isLoading || !data ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.mix} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="94%" paddingAngle={2} isAnimationActive={false}>
                        {data.mix.map((slice, i) => (
                          <Cell key={slice.name} fill={colorAt(i === 1 ? 5 : i === 2 ? 4 : i === 3 ? 1 : 0)} stroke="hsl(var(--card))" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v, n) => [`${formatNumber(v)} kWh`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1">
                  {data.mix.map((slice, i) => (
                    <div key={slice.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: colorAt(i === 1 ? 5 : i === 2 ? 4 : i === 3 ? 1 : 0) }}
                        />
                        <span className="font-medium text-foreground">{slice.name}</span>
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatPct((slice.value / data.totalKwh) * 100, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Against target</CardTitle>
            <p className="text-xs text-muted-foreground">What the sustainability committee reports on</p>
          </CardHeader>
          <CardContent>
            {energy.isLoading || !data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div className="space-y-4">
                {targets.map((row) => {
                  const pct = row.lowerIsBetter
                    ? Math.min(100, (row.target / row.value) * 100)
                    : Math.min(100, (row.value / row.target) * 100)
                  const good = row.lowerIsBetter ? row.value <= row.target : row.value >= row.target
                  return (
                    <div key={row.label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{row.label}</span>
                        <span className={cn('font-semibold tabular-nums', good ? 'text-success-700' : 'text-warning-700')}>
                          {row.value}
                          {row.unit === '%' ? '%' : ` ${row.unit}`}
                          <span className="ml-1 font-normal text-muted-foreground">
                            vs {row.target}
                            {row.unit === '%' ? '%' : ''}
                          </span>
                        </span>
                      </div>
                      <Progress value={pct} indicatorClassName={good ? 'bg-success-500' : 'bg-warning-500'} />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Where the power goes</CardTitle>
            <p className="text-xs text-muted-foreground">Consumption by department across the group</p>
          </CardHeader>
          <CardContent>
            {energy.isLoading || !data ? (
              <Skeleton className="h-56 w-full" />
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={data.byDepartment} margin={{ top: 4, right: 24, left: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <YAxis type="category" dataKey="department" width={148} tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }} contentStyle={chartTooltipStyle} formatter={(v) => [`${formatNumber(v)} kWh`, 'Consumption']} />
                    <Bar dataKey="kwh" radius={[0, 4, 4, 0]} maxBarSize={22}>
                      {data.byDepartment.map((row, i) => (
                        <Cell key={row.department} fill={colorAt(i)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By unit</CardTitle>
        </CardHeader>
        <CardContent>
          {energy.isLoading || !data ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.byUnit.map((unit) => (
                <div key={unit.unitId} className="rounded-xl border border-border bg-secondary/40 p-3.5">
                  <div className="flex items-center gap-2">
                    <Factory className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[13px] font-semibold text-foreground">{unit.fullName}</span>
                  </div>
                  <div className="num mt-2 text-lg font-bold text-foreground">{formatNumber(unit.kwh)} kWh</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{unit.sharePct}% of group</span>
                    <span>{unit.kwhPerKg} kWh/kg</span>
                  </div>
                  <Progress value={unit.renewablePct} className="mt-2" indicatorClassName="bg-success-500" />
                  <div className="mt-1 text-[11px] text-muted-foreground">{unit.renewablePct}% renewable</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}
