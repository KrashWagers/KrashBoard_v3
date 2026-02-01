"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"
import { getBarRadius, getYAxisDomain, getYAxisTicks } from "../../goals/shared/chartHelpers"

interface PPPointsBySituationChartProps {
  chartData: ChartData[]
}

export function PPPointsBySituationChart({ chartData }: PPPointsBySituationChartProps) {
  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
          PP vs 5v5 Points
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 2 }} key={`pp-points-situation-${chartData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              width={35}
              domain={getYAxisDomain("points", chartData)}
              ticks={getYAxisTicks(Math.max(...chartData.map((d) => d.points ?? 0)), "points")}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} iconSize={10} />
            <Bar dataKey="pp_points" stackId="a" name="PP Points" fill="#38bdf8" radius={[0, 0, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="5v5_points" stackId="a" name="5v5 Points" fill="#1d4ed8" radius={getBarRadius(chartData.length)} isAnimationActive={false}>
              <LabelList
                dataKey="points_total"
                position="top"
                style={{ fill: "hsl(var(--foreground))", fontSize: "9px" }}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
