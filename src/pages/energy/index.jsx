import { useMemo, useState } from 'react'
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
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Droplets,
  Factory,
  Flame,
  Gauge,
  Leaf,
  Layers,
  Recycle,
  ShieldCheck,
  Sun,
  TreeDeciduous,
  Wind,
  Zap,
} from 'lucide-react'

import { useAsync } from '@/hooks/useAsync'
import { useAppStore } from '@/store/appStore'
import { getEnergy } from '@/services'
import { PageContainer, PageHeader, StatCard, StatGrid, StatGridSkeleton, FilterChip, FilterChipGroup } from '@/components/common'
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress, Skeleton } from '@/components/ui'
import { Am5DonutChart } from '@/components/charts/Am5DonutChart'
import { formatNumber, formatPct } from '@/lib/format'
import { axisTick, chartTooltipStyle, colorAt } from '@/lib/chartColors'
import { cn } from '@/lib/utils'

export function EnergyDashboard() {
  const { dateRangePreset } = useAppStore()
  const energy = useAsync(() => getEnergy(dateRangePreset), [dateRangePreset])
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'sec' | 'zld' | 'biomass'

  const data = energy.data
  const zld = data?.zldBalance
  const boiler = data?.boilerAnalytics
  const carbon = data?.carbonOffset
  const deptSec = data?.departmentSec ?? []

  return (
    <PageContainer>
      <PageHeader
        title="Smart Energy, SEC & Zero Liquid Discharge (ZLD) Hub"
        description="Departmental Specific Energy Consumption (SEC kWh/kg), 2-stage RO water mass balance, rooftop solar grid injection, and biomass boiler efficiency."
      />

      {energy.isLoading || !data ? (
        <StatGridSkeleton count={5} />
      ) : (
        <StatGrid cols={5}>
          <StatCard
            label="Total Power"
            value={`${formatNumber(Math.round(data.totalKwh / 1000))} MWh`}
            icon={Zap}
            tone="brand"
            trend="44.5% Renewable"
            trendDir="up"
            sublabel="Solar + Wind Grid"
          />
          <StatCard
            label="Factory SEC"
            value={`${data.kwhPerKg} kWh/kg`}
            icon={Gauge}
            tone={data.kwhPerKg <= data.targets.kwhPerKg ? 'success' : 'danger'}
            trend={`Target: ${data.targets.kwhPerKg}`}
            trendDir="down"
            sublabel="Benchmark Aligned"
          />
          <StatCard
            label="ZLD Recovery"
            value={`${zld?.recoveryPct || 92.5}%`}
            icon={Droplets}
            tone="info"
            trend="+4.5% vs CPCB norm"
            trendDir="up"
            sublabel="639 kL/day Recycled"
          />
          <StatCard
            label="Boiler Efficiency"
            value={`${boiler?.efficiencyPct || 81.5}%`}
            icon={Flame}
            tone="warning"
            trend="3.85 Steam/Fuel ratio"
            trendDir="up"
            sublabel="100% Biomass Briquette"
          />
          <StatCard
            label="CO₂ Offset"
            value={`${data.co2AvoidedTonnes || 25.4} t`}
            icon={Leaf}
            tone="poppy"
            trend="1,143 trees equiv"
            trendDir="up"
            sublabel="Clean Energy Credit"
          />
        </StatGrid>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <FilterChipGroup>
          <FilterChip active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span>Power Mix & Grid Trends</span>
          </FilterChip>
          <FilterChip active={activeTab === 'sec'} onClick={() => setActiveTab('sec')}>
            <Gauge className="h-3.5 w-3.5 shrink-0" />
            <span>Department SEC Intelligence</span>
          </FilterChip>
          <FilterChip active={activeTab === 'zld'} onClick={() => setActiveTab('zld')}>
            <Droplets className="h-3.5 w-3.5 shrink-0" />
            <span>ZLD Water Mass Balance</span>
          </FilterChip>
          <FilterChip active={activeTab === 'biomass'} onClick={() => setActiveTab('biomass')}>
            <Flame className="h-3.5 w-3.5 shrink-0" />
            <span>Biomass Steam & Carbon</span>
          </FilterChip>
        </FilterChipGroup>
      </div>

      {/* TAB 1: POWER MIX & GRID TRENDS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Power Generation & Grid Import Mix</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Captive wind turbines, rooftop solar arrays, state grid import, and standby generators.</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-slate-50">90-Day Telemetry</Badge>
                </div>
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
                        <Area type="monotone" dataKey="grid" name="TANGEDCO Grid" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.65} />
                        <Area type="monotone" dataKey="wind" name="Captive Wind (Udumalpet)" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.65} />
                        <Area type="monotone" dataKey="solar" name="Rooftop Solar (Unit I & IV)" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.65} />
                        <Area type="monotone" dataKey="diesel" name="Diesel Genset (Standby)" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.65} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Source Mix Donut */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Source Share</CardTitle>
                <p className="text-xs text-muted-foreground">Renewable vs. Fossil Grid dependency</p>
              </CardHeader>
              <CardContent>
                {energy.isLoading || !data ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <Am5DonutChart
                    data={data.mix}
                    height={260}
                    innerRadius={55}
                    showLegend={true}
                    colors={['#0284c7', '#0d9488', '#10b981', '#f59e0b']}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Unit-Wise Energy Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Unit-Wise Consumption & Renewable Share</CardTitle>
              <p className="text-xs text-muted-foreground">Energy intensity (kWh/kg) and rooftop solar generation across factory campuses.</p>
            </CardHeader>
            <CardContent>
              {energy.isLoading || !data ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {data.byUnit.map((unit) => (
                    <div key={unit.unitId} className="rounded-xl border border-border bg-slate-50/70 p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-foreground">{unit.fullName}</span>
                        <Badge variant="outline">{unit.unitName}</Badge>
                      </div>
                      <div className="mt-2 text-lg font-bold text-brand-600 tabular-nums">{formatNumber(unit.kwh)} kWh</div>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{unit.sharePct}% of group</span>
                        <span className="font-semibold text-foreground">{unit.kwhPerKg} kWh/kg</span>
                      </div>
                      <Progress value={unit.renewablePct} className="mt-2.5 h-1.5" indicatorClassName="bg-emerald-500" />
                      <div className="mt-1 flex items-center justify-between text-[10.5px] font-semibold text-emerald-700">
                        <span>{unit.renewablePct}% Renewable</span>
                        <span>Solar & Wind</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: SPECIFIC ENERGY CONSUMPTION (SEC) INTELLIGENCE */}
      {activeTab === 'sec' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle>Departmental Specific Energy Consumption (SEC) vs Benchmark</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Calculates actual kWh per kg of fabric against SITRA & global textile export energy benchmarks.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs bg-slate-50 font-semibold">
                  SITRA Standard: 6.4 kWh/kg Overall
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/80 text-muted-foreground font-semibold uppercase tracking-wider text-[10.5px]">
                      <th className="py-2.5 px-4">Department / Process</th>
                      <th className="py-2.5 px-3">Location Campus</th>
                      <th className="py-2.5 px-3 text-right">Throughput (kg)</th>
                      <th className="py-2.5 px-3 text-right">Power Consumed</th>
                      <th className="py-2.5 px-3 text-right">Actual SEC</th>
                      <th className="py-2.5 px-3 text-right">Benchmark SEC</th>
                      <th className="py-2.5 px-3 text-right">Variance %</th>
                      <th className="py-2.5 px-4 text-center">Efficiency Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {deptSec.map((row) => (
                      <tr key={row.departmentKey} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-brand-500" />
                          {row.name}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{row.unitName}</td>
                        <td className="py-3 px-3 text-right tabular-nums font-semibold">{formatNumber(row.productionKg)} kg</td>
                        <td className="py-3 px-3 text-right tabular-nums font-medium">{formatNumber(row.kwh)} kWh</td>
                        <td className="py-3 px-3 text-right tabular-nums font-bold text-foreground">
                          {row.actualKwhPerKg} kWh/kg
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-muted-foreground">
                          {row.benchmarkKwhPerKg} kWh/kg
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-semibold">
                          <span className={cn(row.variancePct <= 0 ? 'text-emerald-600' : row.variancePct > 10 ? 'text-danger-600' : 'text-amber-600')}>
                            {row.variancePct > 0 ? `+${row.variancePct}%` : `${row.variancePct}%`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={row.status === 'Energy Efficient' ? 'success' : row.status === 'High Consumption' ? 'danger' : 'outline'}>
                            {row.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Root Cause & Anomaly Alert Card */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <span className="font-bold text-sm block">SEC Variance Alert: Printing & Screen Curing</span>
                <p>
                  Screen printing quartz flash cure units at Unit III consumed <span className="font-semibold">0.74 kWh/kg (+13.8% vs 0.65 kWh/kg benchmark)</span> due to continuous idle heater standby between print batches. Poppys AI recommends auto-standby thermostat calibration.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: ZLD WATER MASS BALANCE */}
      {activeTab === 'zld' && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-border">
            <CardHeader className="bg-slate-50/70 border-b border-border/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold">Zero Liquid Discharge (ZLD) Mass-Balance Architecture</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Closed-loop biological effluent treatment + 2-stage Reverse Osmosis + Multi-Effect Evaporator (MEE).
                  </p>
                </div>
                <Badge variant="success" className="text-xs font-bold py-1 px-2.5">
                  92.5% Water Recovery (Zero Discharge)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* Mass Balance Stepper Flow */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                <div className="bg-slate-50 border border-border p-3 rounded-xl space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">1. Process Demand</span>
                  <span className="text-base font-bold text-foreground">720 kL / day</span>
                  <p className="text-[11px] text-muted-foreground">Dyeing (540kL) + Washing (180kL)</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-brand-600">Fresh Draw: {zld?.freshWaterIntakeKl || 85} kL</span>
                </div>

                <div className="bg-slate-50 border border-border p-3 rounded-xl space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground block">2. ETP Inflow</span>
                  <span className="text-base font-bold text-foreground">650 kL / day</span>
                  <p className="text-[11px] text-muted-foreground">Equalization + Clarifier</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600">COD: 2,600 ppm</span>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 block">3. RO Stage 1</span>
                  <span className="text-base font-bold text-emerald-900">488 kL Recovered</span>
                  <p className="text-[11px] text-emerald-700">75% Recovery Permeate</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800">TDS: &lt; 80 ppm Soft</span>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 block">4. RO Stage 2 & MEE</span>
                  <span className="text-base font-bold text-emerald-900">151 kL Recovered</span>
                  <p className="text-[11px] text-emerald-700">RO2 (113kL) + MEE (38kL)</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800">High-Rejection Permeate</span>
                </div>

                <div className="bg-brand-50/70 border border-brand-200 p-3 rounded-xl space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-brand-800 block">5. Reused in Process</span>
                  <span className="text-base font-bold text-brand-900">639 kL / day</span>
                  <p className="text-[11px] text-brand-700">Soft Water Dyehouse Reuse</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-brand-800">86.2% Fresh Water Saved</span>
                </div>
              </div>

              {/* Environmental COD / BOD Reduction Indicators */}
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-border/80">
                  <span className="text-[11px] font-semibold text-muted-foreground block">COD Reduction Efficiency</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-foreground">99.1%</span>
                    <span className="text-xs text-muted-foreground">2,600 ppm → 24 ppm</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-border/80">
                  <span className="text-[11px] font-semibold text-muted-foreground block">BOD Reduction Efficiency</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-foreground">99.7%</span>
                    <span className="text-xs text-muted-foreground">920 ppm → 3 ppm</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-border/80">
                  <span className="text-[11px] font-semibold text-muted-foreground block">Solid Brine / Salt Output</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-foreground">138 kg / day</span>
                    <span className="text-xs text-muted-foreground">Salt Crystallizer</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: BIOMASS BOILER & CARBON INTELLIGENCE */}
      {activeTab === 'biomass' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Biomass Boiler */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Biomass Briquette Steam Boiler</CardTitle>
                    <p className="text-xs text-muted-foreground">Generates saturated process steam for dyeing vessels & compactor heating shoes.</p>
                  </div>
                  <Badge variant="success">81.5% Efficiency</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-border">
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">Steam Generated Daily:</span>
                    <span className="text-base font-bold text-foreground">46.5 Tonnes</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">Biomass Fuel Consumed:</span>
                    <span className="text-base font-bold text-foreground">11.8 Tonnes</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">Steam-to-Fuel Ratio:</span>
                    <span className="text-sm font-semibold text-brand-600">3.85 kg steam / kg fuel</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">Operating Steam Pressure:</span>
                    <span className="text-sm font-semibold text-foreground">8.5 Bar (175°C)</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% Fossil-Fuel Free Steam
                  </span>
                  <p className="text-emerald-800 text-[11px]">
                    Utilizes compressed agricultural waste briquettes (groundnut shells and sawdust) instead of coal/furnace oil, eliminating sulfur dioxide emissions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Carbon Offset & ESG Credit */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ESG Carbon Reduction Ledger</CardTitle>
                    <p className="text-xs text-muted-foreground">CO₂ avoided via Rooftop Solar + Captive Wind vs Central Grid.</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                    Scope 1 & 2 ESG
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-border">
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">CO₂ Avoided Today:</span>
                    <span className="text-base font-bold text-emerald-700">25.4 Tonnes CO₂e</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">Equivalent Trees Planted:</span>
                    <span className="text-base font-bold text-foreground">1,143 Trees</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">Solar Generation:</span>
                    <span className="text-sm font-semibold text-amber-600">9,500 kWh</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10.5px] block">Captive Wind Output:</span>
                    <span className="text-sm font-semibold text-emerald-600">21,000 kWh</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-border rounded-xl space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <TreeDeciduous className="h-4 w-4 text-emerald-600" /> Buyer ESG Compliance Verified
                  </span>
                  <p className="text-muted-foreground text-[11px]">
                    Certified under ISO 14001:2015 & Higg FEM (Facility Environmental Module) index score of 88.4/100.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
