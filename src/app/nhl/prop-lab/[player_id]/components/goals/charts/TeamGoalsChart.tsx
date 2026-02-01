"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from 'recharts'
import { CustomTooltip } from '../../../CustomTooltip'
import { ChartData } from '../shared/types'
import { getBarRadius, getYAxisDomain, getYAxisTicks } from '../shared/chartHelpers'

interface TeamGoalsChartProps {
  chartData: ChartData[]
  teamGoalsData: ChartData[]
}

export function TeamGoalsChart({ chartData, teamGoalsData }: TeamGoalsChartProps) {
  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle 
          className="text-sm font-medium"
          style={{ color: 'hsl(var(--chart-title))' }}
        >
          Team Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={teamGoalsData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 2 }}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            key={`team-goals-chart-${teamGoalsData.length}`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              width={35} 
              domain={getYAxisDomain('team_goals', chartData)}
              ticks={getYAxisTicks(Math.max(...chartData.map(d => d.team_goals || 0)), 'team_goals')}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} iconSize={10} />
            <Bar 
              dataKey="team_goals" 
              name="Team Goals"
              fill="#6b7280" 
              radius={getBarRadius(chartData.length)}
              isAnimationActive={false}
            >
              <LabelList 
                dataKey="team_goals" 
                position="top" 
                style={{ fill: 'hsl(var(--foreground))', fontSize: '9px' }}
                formatter={(value: any) => value > 0 ? value : ''} 
              />
            </Bar>
            <Line
              type="monotone"
              dataKey="team_goals_avg_5"
              stroke="#3b82f6"
              strokeOpacity={0.85}
              strokeWidth={2}
              dot={false}
              name="5-Game MA"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="team_goals_avg_20"
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

