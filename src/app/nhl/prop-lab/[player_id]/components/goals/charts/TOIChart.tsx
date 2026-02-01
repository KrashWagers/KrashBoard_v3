"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from 'recharts'
import { CustomTooltip } from '../../../CustomTooltip'
import { Layers } from "lucide-react"
import { ChartData, TOIInsights } from '../shared/types'
import { getBarRadius, getYAxisDomain, getYAxisTicks } from '../shared/chartHelpers'

interface TOIChartProps {
  chartData: ChartData[]
  toiData: ChartData[]
  toiInsights: TOIInsights
}

export function TOIChart({ chartData, toiData, toiInsights }: TOIChartProps) {
  const [showToiBreakdown, setShowToiBreakdown] = useState(false)

  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="pt-3 pb-3 px-4 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--chart-title))' }}
          >
            TOI
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <div className="text-lg font-bold text-foreground">
              {Math.round(toiInsights.average / 60)}'
            </div>
            <div className="text-xs text-muted-foreground">
              {toiInsights.diff >= 0 ? '+' : ''}{Math.round(toiInsights.diff / 60)}' vs season avg
            </div>
          </div>
          <button
            onClick={() => setShowToiBreakdown(!showToiBreakdown)}
            className={`p-2 rounded transition-colors ${
              showToiBreakdown
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                : 'bg-muted text-muted-foreground border border-border hover:border-foreground/20'
            }`}
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {showToiBreakdown ? (
            <BarChart 
              data={toiData} 
              margin={{ top: 5, right: 5, left: 5, bottom: 2 }}
              style={{ transition: 'opacity 0.3s ease-in-out' }}
              key={`toi-breakdown-${toiData.length}`}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="opponentAndDate" tick={false} height={10} />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                width={35} 
                domain={getYAxisDomain('toi_total', chartData)}
                ticks={getYAxisTicks(Math.max(...chartData.map(d => d.toi_total || 0)), 'toi_seconds')}
                tickFormatter={(value) => `${Math.round((value as number) / 60)}'`}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: '10px' } }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} iconSize={10} />
              <Bar dataKey="ev_5v5_mmss" stackId="a" name="5v5" fill="#3b82f6" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="pp_mmss" stackId="a" name="PP" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="pk_mmss" stackId="a" name="PK" fill="#f59e0b" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="ev_4v4_mmss" stackId="a" name="4v4" fill="#8b5cf6" radius={[0, 0, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="ev_3v3_mmss" stackId="a" name="3v3" fill="#ec4899" radius={getBarRadius(chartData.length)} isAnimationActive={false}>
                <LabelList 
                  dataKey="toi_total" 
                  position="top" 
                  style={{ fill: 'hsl(var(--foreground))', fontSize: '9px' }} 
                  formatter={(value: number) => value > 0 ? `${Math.round(value / 60)}'` : ''} 
                />
              </Bar>
            </BarChart>
          ) : (
            <ComposedChart 
              data={toiData} 
              margin={{ top: 5, right: 5, left: 5, bottom: 2 }}
              style={{ transition: 'opacity 0.3s ease-in-out' }}
              key={`toi-chart-${toiData.length}`}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="opponentAndDate" tick={false} height={10} />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                width={35} 
                domain={getYAxisDomain('toi_seconds', chartData)}
                ticks={getYAxisTicks(Math.max(...chartData.map(d => d.toi_seconds || 0)), 'toi_seconds')}
                tickFormatter={(value) => `${Math.round((value as number) / 60)}'`}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: '10px' } }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} iconSize={10} />
              <Bar 
                dataKey="toi_seconds" 
                name="TOI"
                fill="#6b7280" 
                radius={getBarRadius(chartData.length)}
                isAnimationActive={false}
              >
                <LabelList 
                  dataKey="toi_seconds" 
                  position="top" 
                  style={{ fill: 'hsl(var(--foreground))', fontSize: '9px' }}
                  formatter={(value: number) => value > 0 ? `${Math.round(value / 60)}'` : ''}
                />
              </Bar>
              <Line
                type="monotone"
                dataKey="toi_avg_5"
                stroke="#3b82f6"
                strokeOpacity={0.85}
                strokeWidth={2}
                dot={false}
                name="5-Game MA"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="toi_avg_20"
                stroke="#8b5cf6"
                strokeOpacity={0.85}
                strokeWidth={2}
                dot={false}
                name="20-Game MA"
                isAnimationActive={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

