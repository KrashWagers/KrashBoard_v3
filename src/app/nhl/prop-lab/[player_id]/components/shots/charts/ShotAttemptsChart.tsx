"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"

interface ShotAttemptsChartProps {
  chartData: ChartData[]
}

export function ShotAttemptsChart({ chartData }: ShotAttemptsChartProps) {
  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
          Shot Attempts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }} key={`shot-attempts-${chartData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={0} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={35} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "3px" }} iconSize={8} />
            <Bar dataKey="shots_on_goal" stackId="a" name="SOG" fill="#22c55e" radius={[0, 0, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="shots_on_goal"
                position="inside"
                style={{ fill: "hsl(var(--foreground))", fontSize: "8px" }}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
            </Bar>
            <Bar dataKey="missed_and_blocked" stackId="a" name="Missed + Blocked" fill="#6b7280" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="missed_and_blocked"
                position="inside"
                style={{ fill: "hsl(var(--foreground))", fontSize: "8px" }}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
