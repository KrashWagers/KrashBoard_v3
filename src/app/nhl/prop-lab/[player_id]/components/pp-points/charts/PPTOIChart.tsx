"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"

interface PPTOIChartProps {
  chartData: ChartData[]
}

export function PPTOIChart({ chartData }: PPTOIChartProps) {
  const avgPpToi =
    chartData.length > 0 ? chartData.reduce((sum, d) => sum + (d.pp_toi_minutes ?? 0), 0) / chartData.length : 0

  return (
    <Card variant="secondary" className="col-span-1 transition-opacity duration-300 flex flex-col">
      <CardHeader className="pt-3 pb-3 px-4 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
            PP TOI
          </CardTitle>
          <div className="flex flex-col items-end">
            <div className="text-xl font-bold text-foreground">{avgPpToi.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">avg minutes</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} key={`pp-toi-${chartData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={35} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar dataKey="pp_toi_minutes" name="PP TOI (min)" fill="#38bdf8" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="pp_toi_minutes"
                position="top"
                style={{ fill: "hsl(var(--foreground))", fontSize: "9px" }}
                formatter={(value: number) => (value > 0 ? value.toFixed(1) : "")}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
