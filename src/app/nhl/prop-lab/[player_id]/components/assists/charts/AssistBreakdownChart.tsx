"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"
import { getBarRadius, getYAxisDomain, getYAxisTicks } from "../../goals/shared/chartHelpers"

interface AssistBreakdownChartProps {
  chartData: ChartData[]
}

export function AssistBreakdownChart({ chartData }: AssistBreakdownChartProps) {
  const avgAssists =
    chartData.length > 0 ? chartData.reduce((sum, d) => sum + (d.assists ?? 0), 0) / chartData.length : 0

  return (
    <Card variant="secondary" className="col-span-1 transition-opacity duration-300 flex flex-col">
      <CardHeader className="pt-3 pb-3 px-4 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
            Assist Breakdown
          </CardTitle>
          <div className="flex flex-col items-end">
            <div className="text-xl font-bold text-foreground">{avgAssists.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">avg per game</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} key={`assist-breakdown-${chartData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              width={35}
              domain={getYAxisDomain("assists", chartData)}
              ticks={getYAxisTicks(Math.max(...chartData.map((d) => d.assists ?? 0)), "assists")}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "2px", paddingBottom: "2px" }} iconSize={10} />
            <Bar dataKey="assists1" stackId="a" name="Primary" fill="#16A34A" radius={[0, 0, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="assists2" stackId="a" name="Secondary" fill="#4ade80" radius={getBarRadius(chartData.length)} isAnimationActive={false}>
              <LabelList
                dataKey="assists_total"
                position="top"
                style={{ fill: "hsl(var(--foreground))", fontSize: "9px" }}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
