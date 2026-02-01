"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"
import { getBarRadius, getYAxisDomain, getYAxisTicks } from "../../goals/shared/chartHelpers"

interface PointsBySituationChartProps {
  chartData: ChartData[]
}

export function PointsBySituationChart({ chartData }: PointsBySituationChartProps) {
  return (
    <Card variant="secondary" className="col-span-1 transition-opacity duration-300 flex flex-col">
      <CardHeader className="pt-3 pb-3 px-4 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
          Points by Situation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} key={`points-situation-${chartData.length}`}>
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
            <Bar dataKey="pp_points" stackId="a" name="PP Points" fill="#60a5fa" radius={[0, 0, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="ev_points" stackId="a" name="EV Points" fill="#3b82f6" radius={getBarRadius(chartData.length)} isAnimationActive={false}>
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
