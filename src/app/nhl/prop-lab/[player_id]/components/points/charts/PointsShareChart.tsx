"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts"
import { CustomTooltip } from "../../../CustomTooltip"
import { ChartData } from "../../goals/shared/types"

interface PointsShareChartProps {
  chartData: ChartData[]
}

interface PointsShareTooltipProps {
  active?: boolean
  payload?: Array<{ dataKey?: string; value?: number; payload?: ChartData & { sharePct?: number; share_avg_5?: number; share_avg_20?: number } }>
}

const formatPct = (value: number | undefined) => (value == null ? "—" : `${value.toFixed(1)}%`)

function PointsShareTooltip({ active, payload }: PointsShareTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload
  if (!data) return null

  const avg5 = data.share_avg_5 ?? 0
  const avg20 = data.share_avg_20 ?? 0

  return (
    <div className="rounded-md border border-gray-700 bg-[#1a1a1a] px-3 py-2 shadow-2xl">
      <div className="text-xs text-gray-400">Points Share</div>
      <div className="mt-1 text-sm text-gray-300">Calculation: (Points ÷ Team Goals) × 100</div>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-gray-300">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            5G Avg
          </span>
          <span className="font-semibold text-white">{formatPct(avg5)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-gray-300">
            <span className="h-2 w-2 rounded-full bg-[#a855f7]" />
            20G Avg
          </span>
          <span className="font-semibold text-white">{formatPct(avg20)}</span>
        </div>
      </div>
    </div>
  )
}

export function PointsShareChart({ chartData }: PointsShareChartProps) {
  type RollingEntry = ChartData & { sharePct?: number; share_avg_5?: number; share_avg_20?: number }

  const rollingData = useMemo(() => {
    const pointsShare = chartData.map((item) => {
      const teamGoals = item.team_goals ?? 0
      const points = item.points ?? 0
      const sharePct = teamGoals > 0 ? (points / teamGoals) * 100 : 0
      return { ...item, sharePct }
    })

    const rollingAverage = (data: RollingEntry[], window: number, key: "share_avg_5" | "share_avg_20") =>
      data.map((_, index) => {
        const start = Math.max(0, index - window + 1)
        const subset = data.slice(start, index + 1)
        const avg = subset.reduce((sum, d) => sum + (d.sharePct ?? 0), 0) / subset.length
        return { ...data[index], [key]: avg } as RollingEntry
      })

    const withAvg5 = rollingAverage(pointsShare, 5, "share_avg_5")
    return rollingAverage(withAvg5, 20, "share_avg_20")
  }, [chartData])

  const yAxisMax = useMemo(() => {
    const maxValue = Math.max(
      0,
      ...rollingData.map((d) => Math.max(d.share_avg_5 ?? 0, d.share_avg_20 ?? 0))
    )
    return Math.max(10, Math.ceil(maxValue + 5))
  }, [rollingData])

  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
          Points Share
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-0 pr-2 transition-opacity duration-300 flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rollingData} margin={{ top: 5, right: 5, left: 5, bottom: 2 }} key={`points-share-${rollingData.length}`}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="opponentAndDate" tick={false} height={10} />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              width={35}
              domain={[0, yAxisMax]}
              tickFormatter={(value) => `${value}%`}
            />
            <RechartsTooltip content={<PointsShareTooltip />} />
            <Area
              type="monotone"
              dataKey="share_avg_5"
              name="5G Avg"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ r: 1.5 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="share_avg_20"
              name="20G Avg"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={{ r: 1.5 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
