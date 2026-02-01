"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from 'recharts'
import { CustomTooltip } from '../../../CustomTooltip'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChartData, HDShotsInsights } from '../shared/types'
import { getBarRadius, getYAxisDomain, getYAxisTicks } from '../shared/chartHelpers'

interface HighDangerChartProps {
  chartData: ChartData[]
  highDangerData: ChartData[]
  hdShotsInsights: HDShotsInsights
}

export function HighDangerChart({ chartData, highDangerData, hdShotsInsights }: HighDangerChartProps) {
  return (
    <Card variant="secondary" className="col-span-1 transition-opacity duration-300 flex flex-col">
      <CardHeader className="pt-3 pb-3 px-4 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--chart-title))' }}
          >
            High Danger Shots
          </CardTitle>
          <div className="flex flex-col items-end">
            <div className="text-xl font-bold text-red-500">
              {hdShotsInsights.average.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {hdShotsInsights.diff >= 0 ? '+' : ''}{hdShotsInsights.diff.toFixed(1)} vs season avg
            </div>
          </div>
        </div>
        {/* Additional HD Stats */}
        <TooltipProvider>
          <div className="flex items-center gap-4 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground">HD Shot %</div>
                  <div className="text-sm font-semibold text-foreground">{hdShotsInsights.hdShotPct.toFixed(1)}%</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>High Danger Shot Percentage: HD Shots divided by Total Shots on Goal</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground">HD Shooting %</div>
                  <div className="text-sm font-semibold text-foreground">{hdShotsInsights.hdShootingPct.toFixed(1)}%</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>High Danger Shooting Percentage: HD Goals divided by HD Shots on Goal</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={highDangerData} 
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            key={`hd-chart-${highDangerData.length}`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
              width={35} 
              domain={getYAxisDomain('sat_HD', chartData)}
              ticks={getYAxisTicks(Math.max(...chartData.map(d => d.sat_HD || 0)), 'sat_HD')}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '2px', paddingBottom: '2px' }} 
              iconSize={10}
              content={({ payload }) => (
                <div className="flex items-center justify-center gap-4 pt-1 pb-1 flex-wrap">
                  {payload?.map((entry, index) => {
                    if (entry.dataKey === 'sat_HD_avg_5' || entry.dataKey === 'sat_HD_avg_20') {
                      return (
                        <TooltipProvider key={index}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 cursor-help">
                                <div 
                                  style={{ 
                                    width: '10px', 
                                    height: '2px', 
                                    backgroundColor: entry.color,
                                  }} 
                                />
                                <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                                  {entry.value}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{entry.dataKey === 'sat_HD_avg_5' ? '5-Game Moving Average: Average of High Danger Shots over the last 5 games' : '20-Game Moving Average: Average of High Danger Shots over the last 20 games'}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    }
                    return (
                      <div key={index} className="flex items-center gap-1.5">
                        <div 
                          style={{ 
                            width: '10px', 
                            height: '10px', 
                            backgroundColor: entry.color,
                            borderRadius: '2px'
                          }} 
                        />
                        <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                          {entry.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            />
            <Bar 
              dataKey="sog_HD" 
              stackId="a"
              name="HD Shots"
              fill="#ef4444" 
              radius={[0, 0, 0, 0]}
              isAnimationActive={false}
            >
              <LabelList 
                dataKey="sog_HD" 
                position="top" 
                style={{ fill: 'hsl(var(--foreground))', fontSize: '9px' }}
                formatter={(value: any) => value > 0 ? value : ''}
              />
            </Bar>
            <Bar 
              dataKey="hd_remaining_attempts" 
              stackId="a"
              name="HD Attempts"
              fill="rgba(239, 68, 68, 0.3)"
              radius={getBarRadius(chartData.length)}
              isAnimationActive={false}
            >
              <LabelList 
                dataKey="hd_remaining_attempts" 
                position="top" 
                style={{ fill: 'hsl(var(--foreground))', fontSize: '9px', opacity: 0.7 }}
                formatter={(value: any) => value > 0 ? value : ''}
              />
            </Bar>
            <Line
              type="monotone"
              dataKey="sat_HD_avg_5"
              stroke="#3b82f6"
              strokeOpacity={0.85}
              strokeWidth={2}
              dot={false}
              name="5-Game MA"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="sat_HD_avg_20"
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

