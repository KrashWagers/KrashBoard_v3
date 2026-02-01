"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LabelList } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"
import { getBarRadius, getYAxisDomain, getYAxisTicks } from "../../goals/shared/chartHelpers"

interface PPPointsShareChartProps {
  chartData: ChartData[]
}

type BarShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  payload?: ChartData
  kind: "sog" | "sat"
}

const getRoundedPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  rtl: number,
  rtr: number,
  rbr: number,
  rbl: number
) => {
  const right = x + width
  const bottom = y + height
  return [
    `M${x + rtl},${y}`,
    `H${right - rtr}`,
    `Q${right},${y} ${right},${y + rtr}`,
    `V${bottom - rbr}`,
    `Q${right},${bottom} ${right - rbr},${bottom}`,
    `H${x + rbl}`,
    `Q${x},${bottom} ${x},${bottom - rbl}`,
    `V${y + rtl}`,
    `Q${x},${y} ${x + rtl},${y}`,
    "Z",
  ].join(" ")
}

const StackedBarShape = ({ x, y, width, height, fill, payload, kind }: BarShapeProps) => {
  if (x == null || y == null || width == null || height == null || height <= 0) return null

  const hasTop = kind === "sog" && (payload?.pp_sat ?? 0) > 0
  const baseRadius = 4
  const maxRadius = Math.min(width / 2, height / 2, baseRadius)

  const radii = kind === "sat"
    ? { rtl: maxRadius, rtr: maxRadius, rbr: 0, rbl: 0 }
    : hasTop
      ? { rtl: 0, rtr: 0, rbr: maxRadius, rbl: maxRadius }
      : { rtl: maxRadius, rtr: maxRadius, rbr: maxRadius, rbl: maxRadius }

  return <path d={getRoundedPath(x, y, width, height, radii.rtl, radii.rtr, radii.rbr, radii.rbl)} fill={fill} />
}

export function PPPointsShareChart({ chartData }: PPPointsShareChartProps) {
  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
          PP Shot Attempts (PP_SOG vs PP_SAT)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 2 }} key={`pp-points-share-${chartData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              width={35}
              domain={getYAxisDomain("pp_corsi", chartData)}
              ticks={getYAxisTicks(Math.max(...chartData.map((d) => d.pp_corsi ?? 0)), "pp_corsi")}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} iconSize={10} />
            <Bar
              dataKey="pp_shots_on_goal"
              stackId="a"
              name="PP_SOG"
              fill="#38bdf8"
              shape={(props) => <StackedBarShape {...props} kind="sog" />}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="pp_shots_on_goal"
                position="insideBottom"
                style={{ fill: "hsl(var(--foreground))", fontSize: "9px" }}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
            </Bar>
            <Bar
              dataKey="pp_sat"
              stackId="a"
              name="PP_SAT"
              fill="#1e3a8a"
              fillOpacity={0.45}
              shape={(props) => <StackedBarShape {...props} kind="sat" />}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="pp_sat"
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
