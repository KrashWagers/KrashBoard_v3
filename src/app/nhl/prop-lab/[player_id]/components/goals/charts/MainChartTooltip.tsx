"use client"

import Image from "next/image"
import { getNHLTeamLogo } from '../shared/utils'
import { MainChartTooltipProps, ChartData } from '../shared/types'

export const MainChartTooltip = ({ active, payload, label }: MainChartTooltipProps) => {
  if (!active || !payload || !payload.length || !label) return null
  
  const data = payload[0].payload as ChartData
  const [opponent, date] = label.split('\n')
  
  return (
    <div className="bg-card border-2 border-border rounded-lg p-4 shadow-2xl">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <div className="relative w-8 h-8">
          <Image
            src={getNHLTeamLogo(opponent)}
            alt={opponent}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div>
          <div className="text-foreground font-bold text-sm">{opponent}</div>
          <div className="text-muted-foreground text-xs">{date}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center gap-6">
          <span className="text-muted-foreground text-xs">Goals</span>
          <span className="text-foreground font-bold text-lg">{data.goals}</span>
        </div>
        
        {data.shots_on_goal !== undefined && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-muted-foreground text-xs">Shots on Goal</span>
            <span className="text-foreground text-sm">{data.shots_on_goal}</span>
          </div>
        )}
        
        
        {data.pp_goals !== undefined && data['5v5_goals'] !== undefined && (
          <>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center gap-6">
              <span className="text-muted-foreground text-xs">PP Goals</span>
              <span className="text-blue-400 text-sm">{data.pp_goals}</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-muted-foreground text-xs">5v5 Goals</span>
              <span className="text-blue-400 text-sm">{data['5v5_goals']}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

