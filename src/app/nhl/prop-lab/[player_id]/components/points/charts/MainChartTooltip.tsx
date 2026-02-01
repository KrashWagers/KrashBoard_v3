"use client"

import Image from "next/image"
import { getNHLTeamLogo } from "../../goals/shared/utils"
import { MainChartTooltipProps } from "../../goals/shared/types"

export function MainChartTooltip({ active, payload, label }: MainChartTooltipProps) {
  if (!active || !payload || !payload.length || !label) return null

  const data = payload[0].payload
  const [opponent, date] = label.split("\n")

  return (
    <div className="bg-[#1a1a1a] border-2 border-gray-700 rounded-lg p-4 shadow-2xl">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
        <div className="relative w-8 h-8">
          <Image src={getNHLTeamLogo(opponent)} alt={opponent} width={32} height={32} className="object-contain" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">{opponent}</div>
          <div className="text-gray-400 text-xs">{date}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">Points</span>
          <span className="text-white font-bold text-lg">{data.points ?? 0}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">Assists</span>
          <span className="text-gray-300 text-sm">{data.assists ?? 0}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">Goals</span>
          <span className="text-gray-300 text-sm">{data.goals ?? 0}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">Team Goals</span>
          <span className="text-gray-300 text-sm">{data.team_goals ?? 0}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">Shifts</span>
          <span className="text-gray-300 text-sm">{data.shifts ?? 0}</span>
        </div>

        <div className="h-px bg-gray-700 my-2" />
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">PP Points</span>
          <span className="text-blue-400 text-sm">{data.pp_points ?? 0}</span>
        </div>
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">5v5 Points</span>
          <span className="text-blue-400 text-sm">{data["5v5_points"] ?? 0}</span>
        </div>
      </div>
    </div>
  )
}
