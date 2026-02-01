"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MainGoalsChart } from './charts/MainGoalsChart'
import { HighDangerChart } from './charts/HighDangerChart'
import { ShotsOnGoalChart } from './charts/ShotsOnGoalChart'
import { TOIChart } from './charts/TOIChart'
import { TeamGoalsChart } from './charts/TeamGoalsChart'
import { GoalShareChart } from './charts/GoalShareChart'
import { GoalDistributionChart } from './charts/GoalDistributionChart'
import { ShootingPercentageChart } from './charts/ShootingPercentageChart'
import { ChartData, ChartSettings, SelectedProp, FilterButtons, PlayerGamelog } from './shared/types'
import type { TeamPayloadRow } from "@/types/nhlTeamPayload"
import { TeamStatsCard } from './TeamStatsCard'
import { 
  processChartData, 
  calculateMovingAverages, 
  calculateHDShotsInsights, 
  calculateShotsOnGoalInsights, 
  calculateTOIInsights,
  calculateAverageLine,
  calculateRollingAverage,
  calculateMovingAverage,
  calculateTrendLine,
  calculateGoalShareData,
  calculateShootingPercentageData,
  calculateGoalShareSeasonAvg,
  calculateShootingPercentageSeasonAvg
} from './shared/dataProcessors'

interface PropLabTabProps {
  gamelogs: PlayerGamelog[]
  selectedProp: SelectedProp
  lineValue: number
  allGamelogs?: PlayerGamelog[]
  chartSettings: ChartSettings
  filterButtons?: FilterButtons
  onSettingsOpen?: () => void
  onOpenGamelogs?: () => void
  playerId?: string
  timeFilter?: string
  teamPayload?: TeamPayloadRow | null
  opponentPayload?: TeamPayloadRow | null
  opponentTeam?: string | null
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
  playerId,
  timeFilter,
  teamPayload,
  opponentPayload,
  opponentTeam
}: PropLabTabProps) {
  // Process chart data
  const chartData = useMemo(() => processChartData(gamelogs), [gamelogs])

  // Calculate moving averages for shots on goal
  const shotsOnGoalData = useMemo(() => {
    return calculateMovingAverages(chartData, 'shots_on_goal', 5, 20)
  }, [chartData])

  // Calculate high danger data with moving averages
  const highDangerData = useMemo(() => {
    return calculateMovingAverages(chartData, 'sat_HD', 5, 20)
  }, [chartData])

  // Calculate TOI data with moving averages
  const toiData = useMemo(() => {
    return calculateMovingAverages(chartData, 'toi_seconds', 5, 20)
  }, [chartData])

  // Calculate team goals data with moving averages
  const teamGoalsData = useMemo(() => {
    return calculateMovingAverages(chartData, 'team_goals', 5, 20)
  }, [chartData])

  // Calculate average line value
  const averageLineValue = useMemo(() => {
    return calculateAverageLine(chartData, 'goals')
  }, [chartData])

  // Calculate rolling average data for goals
  const goalsRollingAverageData = useMemo(() => {
    if (!chartSettings.showRollingAverage) return chartData
    const window = chartSettings.rollingAverageWindow || 5
    return calculateRollingAverage(chartData, 'goals', window)
  }, [chartData, chartSettings.showRollingAverage, chartSettings.rollingAverageWindow])

  // Calculate moving average data for goals
  const goalsMovingAverageData = useMemo(() => {
    if (!chartSettings.showMovingAverage) return chartData
    const window = chartSettings.movingAverageWindow || 10
    return calculateMovingAverage(chartData, 'goals', window)
  }, [chartData, chartSettings.showMovingAverage, chartSettings.movingAverageWindow])

  // Calculate trend line data
  const goalsTrendLineData = useMemo(() => {
    if (!chartSettings.showTrendLine) return chartData
    return calculateTrendLine(chartData, 'goals')
  }, [chartData, chartSettings.showTrendLine])

  // Merge chart data with calculated averages and trend lines
  const recentData = useMemo(() => {
    let data = [...chartData]
    
    // Add average line data
    if (chartSettings.showAverageLine) {
      data = data.map((item) => ({
        ...item,
        averageLine: averageLineValue
      }))
    }
    
    // Merge rolling average data if enabled
    if (chartSettings.showRollingAverage && goalsRollingAverageData.length > 0) {
      data = data.map((item, i) => ({
        ...item,
        rollingAvg: goalsRollingAverageData[i]?.rollingAvg
      }))
    }
    
    // Merge moving average data if enabled
    if (chartSettings.showMovingAverage && goalsMovingAverageData.length > 0) {
      data = data.map((item, i) => ({
        ...item,
        movingAvg: goalsMovingAverageData[i]?.movingAvg
      }))
    }
    
    // Merge trend line data if enabled
    if (chartSettings.showTrendLine && goalsTrendLineData.length > 0) {
      data = data.map((item, i) => ({
        ...item,
        trendValue: goalsTrendLineData[i]?.trendValue
      }))
    }
    
    return data
  }, [chartData, chartSettings, averageLineValue, goalsRollingAverageData, goalsMovingAverageData, goalsTrendLineData])

  // Calculate insights
  const hdShotsInsights = useMemo(() => {
    return calculateHDShotsInsights(chartData, allGamelogs || gamelogs)
  }, [chartData, allGamelogs, gamelogs])

  const shotsOnGoalInsights = useMemo(() => {
    return calculateShotsOnGoalInsights(chartData, allGamelogs || gamelogs)
  }, [chartData, allGamelogs, gamelogs])

  const toiInsights = useMemo(() => {
    return calculateTOIInsights(chartData, allGamelogs || gamelogs)
  }, [chartData, allGamelogs, gamelogs])

  // Calculate goal share data with rolling average
  const goalShareData = useMemo(() => {
    return calculateGoalShareData(chartData, 5)
  }, [chartData])

  // Calculate shooting percentage data with rolling average
  const shootingPctData = useMemo(() => {
    return calculateShootingPercentageData(chartData, 5)
  }, [chartData])

  // Calculate season averages
  const goalShareSeasonAvg = useMemo(() => {
    return calculateGoalShareSeasonAvg(chartData, allGamelogs || gamelogs)
  }, [chartData, allGamelogs, gamelogs])

  const shootingPctSeasonAvg = useMemo(() => {
    return calculateShootingPercentageSeasonAvg(chartData, allGamelogs || gamelogs)
  }, [chartData, allGamelogs, gamelogs])

  const lastFiveGames = useMemo(() => {
    const source = allGamelogs ?? gamelogs
    const getGameTime = (value: PlayerGamelog['game_date']) => {
      if (!value) return 0
      if (value instanceof Date) return value.getTime()
      if (typeof value === 'string') return new Date(value).getTime()
      if (typeof value === 'object' && value !== null && 'value' in value) {
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
      {/* Main Chart Row - 2/3 + 1/3 */}
      <div className="grid grid-cols-3 gap-3">
        <MainGoalsChart
          chartData={recentData}
          selectedProp={selectedProp}
          lineValue={lineValue}
          chartSettings={chartSettings}
          filterButtons={filterButtons}
          onSettingsOpen={onSettingsOpen}
          averageLineValue={averageLineValue}
        />
        <HighDangerChart
          chartData={chartData}
          highDangerData={highDangerData}
          hdShotsInsights={hdShotsInsights}
        />
      </div>

      {/* Bottom Row - 1/3 + 1/3 + 1/3 */}
      <div className="grid grid-cols-3 gap-3">
        <ShotsOnGoalChart
          chartData={chartData}
          shotsOnGoalData={shotsOnGoalData}
          shotsOnGoalInsights={shotsOnGoalInsights}
        />
        <GoalShareChart
          chartData={chartData}
          goalShareData={goalShareData}
          seasonAvg={goalShareSeasonAvg}
        />
        <ShootingPercentageChart
          chartData={chartData}
          shootingPctData={shootingPctData}
          seasonAvg={shootingPctSeasonAvg}
        />
      </div>

      {/* New Chart Row - TOI, Team Goals, Goal Distribution */}
      <div className="grid grid-cols-3 gap-3">
        <TOIChart
          chartData={chartData}
          toiData={toiData}
          toiInsights={toiInsights}
        />
        <TeamGoalsChart
          chartData={chartData}
          teamGoalsData={teamGoalsData}
        />
        <GoalDistributionChart
          chartData={chartData}
        />
      </div>

      {/* Team Stats Card */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <TeamStatsCard
            teamPayload={teamPayload}
            opponentPayload={opponentPayload}
            opponentTeam={opponentTeam}
            timeFilter={timeFilter}
          />
        </div>
      </div>

      {/* Last 5 Games */}
      <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
        <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-sm font-medium"
              style={{ color: 'hsl(var(--chart-title))' }}
            >
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
                  <TableRow key={`${game.game_id ?? 'game'}-${index}`}>
                    <TableCell className="text-xs text-muted-foreground">
                      {typeof game.game_date === 'string'
                        ? game.game_date
                        : game.game_date instanceof Date
                          ? game.game_date.toISOString().slice(0, 10)
                          : (game as unknown as { formattedDate?: string }).formattedDate ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{game.opp ?? game.opponent ?? '—'}</TableCell>
                    <TableCell className="text-xs">{game.goals ?? 0}</TableCell>
                    <TableCell className="text-xs">{game.assists ?? 0}</TableCell>
                    <TableCell className="text-xs">{game.points ?? 0}</TableCell>
                    <TableCell className="text-xs">{game.shots_on_goal ?? 0}</TableCell>
                    <TableCell className="text-xs text-right">
                      {game.toi_seconds ? `${Math.round(game.toi_seconds / 60)}'` : '—'}
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

