"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"
import { getBarRadius, getYAxisDomain, getYAxisTicks } from "../../goals/shared/chartHelpers"

interface ShotAttemptsByDangerChartProps {
  chartData: ChartData[]
}

export function ShotAttemptsByDangerChart({ chartData }: ShotAttemptsByDangerChartProps) {
  return (
    <Card variant="secondary" className="col-span-1 transition-opacity duration-300 flex flex-col">
      <CardHeader className="pt-3 pb-3 px-4 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
          Shot Attempts by Danger
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} key={`shot-danger-${chartData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              width={35}
              domain={getYAxisDomain("sat_HD", chartData)}
              ticks={getYAxisTicks(
                Math.max(
                  ...chartData.map((d) => (typeof d.sat_total === "number" ? d.sat_total : 0))
                ),
                "sat_HD"
              )}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} iconSize={10} />
            <Bar dataKey="sat_HD" stackId="a" name="High Danger" fill="#ef4444" radius={[0, 0, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="sat_MD" stackId="a" name="Medium Danger" fill="#f97316" radius={[0, 0, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="sat_LD" stackId="a" name="Low Danger" fill="#facc15" radius={getBarRadius(chartData.length)} isAnimationActive={false}>
              <LabelList
                dataKey="sat_total"
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
