"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
  Legend,
  LabelList,
  Label,
  ReferenceLine,
} from "recharts"
import { Filter } from "lucide-react"
import { CustomXAxisTick } from "../../goals/charts/CustomXAxisTick"
import { MainChartTooltip } from "./MainChartTooltip"
import { ChartData, ChartSettings, FilterButtons, SelectedProp } from "../../goals/shared/types"
import { getBarLabelFontSize, getBarRadius, getYAxisDomain, getYAxisTicks } from "../../goals/shared/chartHelpers"

interface MainShotsChartProps {
  chartData: ChartData[]
  selectedProp: SelectedProp
  lineValue: number
  chartSettings: ChartSettings
  filterButtons?: FilterButtons
  onSettingsOpen?: () => void
  averageLineValue: number
}

const getShotBarColor = (shots: number | undefined, selectedProp: { ou: string }, lineValue: number) => {
  const shotsValue = shots ?? 0
  const isOver = selectedProp?.ou === "Over"
  if (isOver) return shotsValue > lineValue ? "#16A34A" : "#ef4444"
  return shotsValue < lineValue ? "#16A34A" : "#ef4444"
}

export function MainShotsChart({
  chartData,
  selectedProp,
  lineValue,
  chartSettings,
  filterButtons,
  onSettingsOpen,
  averageLineValue,
}: MainShotsChartProps) {
  const recentData = useMemo(() => {
    if (!chartSettings.showAverageLine) return chartData
    return chartData.map((item) => ({
      ...item,
      averageLine: averageLineValue,
    }))
  }, [chartData, chartSettings.showAverageLine, averageLineValue])

  return (
    <Card variant="secondary" className="col-span-2 transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-3 pb-2 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 mb-2 overflow-x-auto">
          <div className="flex items-center gap-3 flex-nowrap flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Period:</span>
              {filterButtons?.period}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Venue:</span>
              {filterButtons?.venue}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">{filterButtons?.actions}</div>
          </div>
          {onSettingsOpen && (
            <button
              onClick={onSettingsOpen}
              className="p-1.5 rounded transition-colors bg-muted text-muted-foreground border border-border hover:border-foreground/20 hover:text-foreground flex-shrink-0"
              title="Filters"
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={recentData}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            style={{ transition: "opacity 0.3s ease-in-out" }}
            key={`main-shots-chart-${recentData.length}`}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis
              dataKey="opponentAndDate"
              tick={<CustomXAxisTick dataLength={recentData.length} />}
              height={50}
              interval={recentData.length > 40 ? 1 : 0}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", opacity: 0.6 }}
              domain={getYAxisDomain("shots_on_goal", recentData)}
              width={35}
              ticks={getYAxisTicks(Math.max(...recentData.map((d) => d.shots_on_goal || 0)), "shots_on_goal")}
            />
            <RechartsTooltip content={<MainChartTooltip />} />
            <ReferenceLine y={lineValue} yAxisId="left" stroke="#eab308" strokeDasharray="5 5" strokeWidth={2}>
              <Label
                value={lineValue.toString()}
                position="left"
                fill="#eab308"
                fontSize={11}
                fontWeight="bold"
                style={{ backgroundColor: "#854d0e", padding: "2px 6px", borderRadius: "4px" }}
              />
            </ReferenceLine>
            {chartSettings.showAverageLine && (
              <Line
                type="monotone"
                dataKey="averageLine"
                yAxisId="left"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="3 3"
                name={`Average (${averageLineValue.toFixed(2)})`}
              />
            )}
            {chartSettings.showRollingAverage && (
              <Line
                type="monotone"
                dataKey="rollingAvg"
                yAxisId="left"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                name={`Rolling Avg (${chartSettings.rollingAverageWindow || 5})`}
              />
            )}
            {chartSettings.showMovingAverage && (
              <Line
                type="monotone"
                dataKey="movingAvg"
                yAxisId="left"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                strokeDasharray="3 3"
                name={`Moving Avg (${chartSettings.movingAverageWindow || 10})`}
              />
            )}
            {chartSettings.showTrendLine && (
              <Line type="linear" dataKey="trendValue" yAxisId="left" stroke="#f59e0b" strokeWidth={2} dot={false} name="Trend Line" />
            )}
            {(chartSettings.showAverageLine ||
              chartSettings.showRollingAverage ||
              chartSettings.showMovingAverage ||
              chartSettings.showTrendLine) && (
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} iconSize={10} iconType="line" />
            )}
            <Bar dataKey="shots_on_goal" yAxisId="left" radius={getBarRadius(recentData.length)} isAnimationActive={false}>
              <LabelList
                dataKey="shots_on_goal"
                position="insideBottom"
                offset={5}
                style={{ fill: "hsl(var(--foreground))", fontSize: getBarLabelFontSize(recentData.length), fontWeight: "bold" }}
                formatter={(value: number) => (value > 0 ? value : "")}
              />
              {recentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getShotBarColor(entry.shots_on_goal, selectedProp, lineValue)} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
