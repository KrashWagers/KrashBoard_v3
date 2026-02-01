"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from 'recharts'
import { CustomTooltip } from '../../../CustomTooltip'
import { ChartData, ShotsOnGoalInsights } from '../shared/types'
import { getBarRadius, getYAxisDomain, getYAxisTicks } from '../shared/chartHelpers'

interface ShotsOnGoalChartProps {
  chartData: ChartData[]
  shotsOnGoalData: ChartData[]
  shotsOnGoalInsights: ShotsOnGoalInsights
}

export function ShotsOnGoalChart({ chartData, shotsOnGoalData, shotsOnGoalInsights }: ShotsOnGoalChartProps) {
  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="pt-3 pb-3 px-4 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--chart-title))' }}
          >
            Shots on Goal
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <div className="text-lg font-bold text-foreground">
              {shotsOnGoalInsights.avgShots.toFixed(1)} / {shotsOnGoalInsights.avgCorsi.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {shotsOnGoalInsights.diffShots >= 0 ? '+' : ''}{shotsOnGoalInsights.diffShots.toFixed(1)} / {shotsOnGoalInsights.diffCorsi >= 0 ? '+' : ''}{shotsOnGoalInsights.diffCorsi.toFixed(1)} vs season avg
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={shotsOnGoalData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 2 }}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            key={`sog-chart-${shotsOnGoalData.length}`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              width={35} 
              domain={getYAxisDomain('corsi', chartData)}
              ticks={getYAxisTicks(Math.max(...chartData.map(d => (d.corsi || 0))), 'shots_on_goal')}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} iconSize={10} />
            <Bar 
              dataKey="shots_on_goal" 
              stackId="a"
              name="Shots on Goal"
              fill="#6b7280" 
              radius={[0, 0, 0, 0]}
              isAnimationActive={false}
            >
              <LabelList 
                dataKey="shots_on_goal" 
                position="top" 
                style={{ fill: 'hsl(var(--foreground))', fontSize: '9px' }}
                formatter={(value: any) => value > 0 ? value : ''}
              />
            </Bar>
            <Bar 
              dataKey="shot_attempts" 
              stackId="a"
              name="Shot Attempts"
              fill="#374151" 
              radius={getBarRadius(chartData.length)}
              isAnimationActive={false}
            >
              <LabelList 
                dataKey="shot_attempts" 
                position="top" 
                style={{ fill: 'hsl(var(--foreground))', fontSize: '9px', opacity: 0.7 }}
                formatter={(value: any) => value > 0 ? value : ''}
              />
            </Bar>
            <Line
              type="monotone"
              dataKey="shots_on_goal_avg_5"
              stroke="#3b82f6"
              strokeOpacity={0.85}
              strokeWidth={2}
              dot={false}
              name="5-Game MA"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="shots_on_goal_avg_20"
              stroke="#8b5cf6"
              strokeOpacity={0.85}
              strokeWidth={2}
              dot={false}
              name="20-Game MA"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

