"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartData } from '../shared/types'

interface GoalDistributionChartProps {
  chartData: ChartData[]
}

interface PercentageBarProps {
  label: string
  percentage: number
  leagueAverage?: number
  tooltip?: string
}

function PercentageBar({ label, percentage, leagueAverage, tooltip }: PercentageBarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const safePercentage = Math.min(Math.max(percentage, 0), 100) // Clamp between 0 and 100
  const safeLeagueAvg = leagueAverage !== undefined ? Math.min(Math.max(leagueAverage, 0), 100) : undefined
  const exceedsAverage = safeLeagueAvg !== undefined && safePercentage > safeLeagueAvg
  
  return (
    <div 
      className="flex items-center gap-3 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <div className="relative flex-1 min-w-[340px] max-w-[340px]">
        <div className="relative h-4 bg-muted rounded-full overflow-visible">
          <div 
            className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
            style={{ width: `${safePercentage}%` }}
          />
          {safeLeagueAvg !== undefined && (
            <div 
              className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-[#fbbf24] opacity-80"
              style={{ 
                left: `${safeLeagueAvg}%`,
                transform: 'translateX(-50%)'
              }}
            />
          )}
        </div>
        {isHovered && tooltip && (
          <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-card border border-border rounded text-[10px] text-foreground z-10 shadow-lg">
            <div>{tooltip}</div>
            {safeLeagueAvg !== undefined && (
              <div className="text-muted-foreground mt-0.5">
                League Avg: {safeLeagueAvg.toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </div>
      <span 
        className={`text-xs whitespace-nowrap flex-shrink-0 ${
          exceedsAverage ? 'text-[#16A34A] font-bold' : 'text-foreground font-medium'
        }`}
      >
        {safePercentage.toFixed(1)}%
      </span>
    </div>
  )
}

export function GoalDistributionChart({ chartData }: GoalDistributionChartProps) {
  // Calculate cumulative totals across all games
  const totals = useMemo(() => {
    const totalGoals = chartData.reduce((sum, d) => sum + (d.goals ?? 0), 0)
    const total5v5Goals = chartData.reduce((sum, d) => sum + (d['5v5_goals'] ?? 0), 0)
    const totalPPGoals = chartData.reduce((sum, d) => sum + (d.pp_goals ?? 0), 0)
    
    const totalTOI = chartData.reduce((sum, d) => sum + (d.toi_seconds ?? 0), 0)
    const total5v5TOI = chartData.reduce((sum, d) => sum + ((d.ev_5v5_mmss as number) ?? 0), 0)
    const totalPPTOI = chartData.reduce((sum, d) => sum + ((d.pp_mmss as number) ?? 0), 0)
    
    const totalHDGoals = chartData.reduce((sum, d) => sum + ((d.goals_HD as number) ?? 0), 0)
    const totalMDGoals = chartData.reduce((sum, d) => sum + (d.goals_MD ?? 0), 0)
    const totalLDGoals = chartData.reduce((sum, d) => sum + (d.goals_LD ?? 0), 0)
    
    const totalHDShots = chartData.reduce((sum, d) => sum + (d.sog_HD ?? 0), 0)
    // Check if sog_MD and sog_LD exist, otherwise use sat_MD and sat_LD
    const totalMDShots = chartData.reduce((sum, d) => {
      const sogMD = (d as any).sog_MD ?? 0
      return sum + (sogMD > 0 ? sogMD : (d.sat_MD ?? 0))
    }, 0)
    const totalLDShots = chartData.reduce((sum, d) => {
      const sogLD = (d as any).sog_LD ?? 0
      return sum + (sogLD > 0 ? sogLD : (d.sat_LD ?? 0))
    }, 0)
    
    return {
      totalGoals,
      total5v5Goals,
      totalPPGoals,
      totalTOI,
      total5v5TOI,
      totalPPTOI,
      totalHDGoals,
      totalMDGoals,
      totalLDGoals,
      totalHDShots,
      totalMDShots,
      totalLDShots
    }
  }, [chartData])

  // Calculate percentages
  const goal5v5Pct = totals.totalGoals > 0 ? (totals.total5v5Goals / totals.totalGoals) * 100 : 0
  const goalPPPct = totals.totalGoals > 0 ? (totals.totalPPGoals / totals.totalGoals) * 100 : 0
  
  const toi5v5Pct = totals.totalTOI > 0 ? (totals.total5v5TOI / totals.totalTOI) * 100 : 0
  const toiPPPct = totals.totalTOI > 0 ? (totals.totalPPTOI / totals.totalTOI) * 100 : 0
  
  const hdSharePct = totals.totalGoals > 0 ? (totals.totalHDGoals / totals.totalGoals) * 100 : 0
  const mdSharePct = totals.totalGoals > 0 ? (totals.totalMDGoals / totals.totalGoals) * 100 : 0
  const ldSharePct = totals.totalGoals > 0 ? (totals.totalLDGoals / totals.totalGoals) * 100 : 0

  return (
    <Card variant="secondary" className="transition-opacity duration-300 flex flex-col">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--chart-title))' }}
          >
            Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#fbbf24] opacity-80"></div>
            <span className="text-[10px] text-muted-foreground">League Avg</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 transition-opacity duration-300">
        <div className="space-y-4">
          {/* Goal Distribution */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Goal Distribution
            </h3>
            <div className="space-y-2.5">
              <PercentageBar 
                label="5v5 Goals" 
                percentage={goal5v5Pct} 
                leagueAverage={66}
                tooltip="5v5 Goals ÷ Total Goals"
              />
              <PercentageBar 
                label="PP Goals" 
                percentage={goalPPPct} 
                leagueAverage={19.6}
                tooltip="PP Goals ÷ Total Goals"
              />
            </div>
          </div>

          {/* TOI Distribution */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              TOI Distribution
            </h3>
            <div className="space-y-2.5">
              <PercentageBar 
                label="5v5 Share" 
                percentage={toi5v5Pct} 
                leagueAverage={85}
                tooltip="5v5 TOI ÷ Total TOI"
              />
              <PercentageBar 
                label="PP Share" 
                percentage={toiPPPct} 
                leagueAverage={7}
                tooltip="PP TOI ÷ Total TOI"
              />
            </div>
          </div>

          {/* Scoring Distribution */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Scoring Distribution
            </h3>
            <div className="space-y-2.5">
              <PercentageBar 
                label="High Danger" 
                percentage={hdSharePct} 
                leagueAverage={61.8}
                tooltip="HD Goals ÷ Total Goals"
              />
              <PercentageBar 
                label="Med Danger" 
                percentage={mdSharePct} 
                leagueAverage={23.6}
                tooltip="MD Goals ÷ Total Goals"
              />
              <PercentageBar 
                label="Low Danger" 
                percentage={ldSharePct} 
                leagueAverage={14.5}
                tooltip="LD Goals ÷ Total Goals"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
