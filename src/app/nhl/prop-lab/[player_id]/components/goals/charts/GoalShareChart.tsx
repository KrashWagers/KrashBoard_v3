"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts'
import { CustomTooltip } from '../../../CustomTooltip'
import { ChartData } from '../shared/types'

interface GoalShareChartProps {
  chartData: ChartData[]
  goalShareData: Array<ChartData & { goal_share_rolling_avg?: number }>
  seasonAvg: number
}

export function GoalShareChart({ chartData, goalShareData, seasonAvg }: GoalShareChartProps) {
  // Calculate max value for Y-axis domain (filter out undefined values)
  const validValues = goalShareData
    .map(d => d.goal_share_rolling_avg)
    .filter((val): val is number => val !== undefined)
  const maxValue = validValues.length > 0 
    ? Math.max(...validValues, seasonAvg)
    : seasonAvg
  const yAxisMax = Math.ceil(Math.max(maxValue * 1.1, 10)) // Add 10% padding, min 10%

  // Get current average (last value in the data, find last defined value)
  const currentAvg = goalShareData.length > 0 
    ? (goalShareData.slice().reverse().find(d => d.goal_share_rolling_avg !== undefined)?.goal_share_rolling_avg ?? 0)
    : 0

  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--chart-title))' }}
          >
            Goal Share %
          </CardTitle>
          <div className="text-lg font-bold" style={{ color: '#16A34A' }}>
            {currentAvg.toFixed(1)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={goalShareData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 2 }}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            key={`goal-share-chart-${goalShareData.length}`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              width={35} 
              domain={[0, yAxisMax]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].filter(t => t <= yAxisMax)}
              tickFormatter={(value) => `${value}%`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={seasonAvg} 
              stroke="#fbbf24" 
              strokeDasharray="5 5" 
              strokeOpacity={0.7}
            />
            <Area
              type="monotone"
              dataKey="goal_share_rolling_avg"
              fill="#16A34A"
              fillOpacity={0.2}
              stroke="none"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="goal_share_rolling_avg"
              stroke="#16A34A"
              strokeWidth={2}
              dot={{ fill: '#16A34A', r: 3 }}
              activeDot={{ r: 5 }}
              name="Goal Share %"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

