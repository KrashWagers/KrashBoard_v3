"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"

interface TeamPPGoalsChartProps {
  chartData: ChartData[]
}

export function TeamPPGoalsChart({ chartData }: TeamPPGoalsChartProps) {
  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
          Team PP Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 2 }} key={`team-pp-goals-${chartData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={35} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="team_pp_goals" name="Team PP Goals" fill="#f97316" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="team_pp_goals"
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
