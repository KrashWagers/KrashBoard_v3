"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MainPointsChart } from "./charts/MainPointsChart"
import { PointsBySituationChart } from "./charts/PointsBySituationChart"
import { AssistsVsGoalsChart } from "./charts/AssistsVsGoalsChart"
import { PointsVsTeamPointsChart } from "./charts/PointsVsTeamPointsChart"
import { PointsShareChart } from "./charts/PointsShareChart"
import { TOIChart } from "../goals/charts/TOIChart"
import { TeamGoalsChart } from "../goals/charts/TeamGoalsChart"
import { GoalDistributionChart } from "../goals/charts/GoalDistributionChart"
import {
  processChartData,
  calculateMovingAverages,
  calculateTOIInsights,
  calculateAverageLine,
  calculateRollingAverage,
  calculateMovingAverage,
  calculateTrendLine,
} from "../goals/shared/dataProcessors"
import { ChartSettings, FilterButtons, PlayerGamelog, SelectedProp } from "../goals/shared/types"

interface PropLabTabProps {
  gamelogs: PlayerGamelog[]
  selectedProp: SelectedProp
  lineValue: number
  allGamelogs?: PlayerGamelog[]
  chartSettings: ChartSettings
  filterButtons?: FilterButtons
  onSettingsOpen?: () => void
  onOpenGamelogs?: () => void
}

export function PropLabTab({
  gamelogs,
  selectedProp,
  lineValue,
  allGamelogs,
  chartSettings,
  filterButtons,
  onSettingsOpen,
  onOpenGamelogs,
}: PropLabTabProps) {
  const chartData = useMemo(() => processChartData(gamelogs), [gamelogs])

  const toiData = useMemo(() => calculateMovingAverages(chartData, "toi_seconds", 5, 20), [chartData])
  const teamGoalsData = useMemo(() => calculateMovingAverages(chartData, "team_goals", 5, 20), [chartData])
  const toiInsights = useMemo(() => calculateTOIInsights(chartData, allGamelogs || gamelogs), [chartData, allGamelogs, gamelogs])

  const averageLineValue = useMemo(() => calculateAverageLine(chartData, "points"), [chartData])

  const pointsRollingAverageData = useMemo(() => {
    if (!chartSettings.showRollingAverage) return chartData
    const window = chartSettings.rollingAverageWindow || 5
    return calculateRollingAverage(chartData, "points", window)
  }, [chartData, chartSettings.showRollingAverage, chartSettings.rollingAverageWindow])

  const pointsMovingAverageData = useMemo(() => {
    if (!chartSettings.showMovingAverage) return chartData
    const window = chartSettings.movingAverageWindow || 10
    return calculateMovingAverage(chartData, "points", window)
  }, [chartData, chartSettings.showMovingAverage, chartSettings.movingAverageWindow])

  const pointsTrendLineData = useMemo(() => {
    if (!chartSettings.showTrendLine) return chartData
    return calculateTrendLine(chartData, "points")
  }, [chartData, chartSettings.showTrendLine])

  const recentData = useMemo(() => {
    let data = [...chartData]

    if (chartSettings.showAverageLine) {
      data = data.map((item) => ({
        ...item,
        averageLine: averageLineValue,
      }))
    }

    if (chartSettings.showRollingAverage && pointsRollingAverageData.length > 0) {
      data = data.map((item, i) => ({
        ...item,
        rollingAvg: pointsRollingAverageData[i]?.rollingAvg,
      }))
    }

    if (chartSettings.showMovingAverage && pointsMovingAverageData.length > 0) {
      data = data.map((item, i) => ({
        ...item,
        movingAvg: pointsMovingAverageData[i]?.movingAvg,
      }))
    }

    if (chartSettings.showTrendLine && pointsTrendLineData.length > 0) {
      data = data.map((item, i) => ({
        ...item,
        trendValue: pointsTrendLineData[i]?.trendValue,
      }))
    }

    return data
  }, [
    chartData,
    chartSettings,
    averageLineValue,
    pointsRollingAverageData,
    pointsMovingAverageData,
    pointsTrendLineData,
  ])

  const lastFiveGames = useMemo(() => {
    const source = allGamelogs ?? gamelogs
    const getGameTime = (value: PlayerGamelog["game_date"]) => {
      if (!value) return 0
      if (value instanceof Date) return value.getTime()
      if (typeof value === "string") return new Date(value).getTime()
      if (typeof value === "object" && value !== null && "value" in value) {
        const raw = (value as { value?: string }).value
        return raw ? new Date(raw).getTime() : 0
      }
      return new Date(value as string).getTime()
    }

    return source
      .slice()
      .sort((a, b) => getGameTime(b.game_date) - getGameTime(a.game_date))
      .slice(0, 5)
  }, [allGamelogs, gamelogs])

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        <MainPointsChart
          chartData={recentData}
          selectedProp={selectedProp}
          lineValue={lineValue}
          chartSettings={chartSettings}
          filterButtons={filterButtons}
          onSettingsOpen={onSettingsOpen}
          averageLineValue={averageLineValue}
        />
        <PointsBySituationChart chartData={chartData} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AssistsVsGoalsChart chartData={chartData} />
        <PointsVsTeamPointsChart chartData={chartData} />
        <PointsShareChart chartData={chartData} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <TOIChart chartData={chartData} toiData={toiData} toiInsights={toiInsights} />
        <TeamGoalsChart chartData={chartData} teamGoalsData={teamGoalsData} />
        <GoalDistributionChart chartData={chartData} />
      </div>

      <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
        <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
              Last 5 Games
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs font-medium rounded-md"
              onClick={onOpenGamelogs}
            >
              View Full Gamelogs
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Date</TableHead>
                  <TableHead className="w-[70px]">Opp</TableHead>
                  <TableHead>G</TableHead>
                  <TableHead>A</TableHead>
                  <TableHead>P</TableHead>
                  <TableHead>SOG</TableHead>
                  <TableHead className="text-right">TOI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lastFiveGames.map((game, index) => (
                  <TableRow key={`${game.game_id ?? "game"}-${index}`}>
                    <TableCell className="text-xs text-muted-foreground">
                      {typeof game.game_date === "string"
                        ? game.game_date
                        : game.game_date instanceof Date
                          ? game.game_date.toISOString().slice(0, 10)
                          : (game as unknown as { formattedDate?: string }).formattedDate ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{game.opp ?? game.opponent ?? "—"}</TableCell>
                    <TableCell className="text-xs">{game.goals ?? 0}</TableCell>
                    <TableCell className="text-xs">{game.assists ?? 0}</TableCell>
                    <TableCell className="text-xs">{game.points ?? 0}</TableCell>
                    <TableCell className="text-xs">{game.shots_on_goal ?? 0}</TableCell>
                    <TableCell className="text-xs text-right">
                      {game.toi_seconds ? `${Math.round(game.toi_seconds / 60)}'` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
