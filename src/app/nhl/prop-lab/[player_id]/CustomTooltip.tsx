import React from 'react'

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  labelFormatter?: (label: string) => string
}

const FIELD_NAME_MAP: { [key: string]: string } = {
  'goals': 'Goals',
  'assists': 'Assists',
  'points': 'Points',
  'shots_on_goal': 'Shots on Goal',
  'team_goals': 'Team Goals',
  'corsi': 'Corsi',
  'shifts': 'Shifts',
  'pp_goals': 'Power Play Goals',
  '5v5_goals': '5v5 Goals',
  'sat_HD': 'High Danger Shots',
  'sat_MD': 'Medium Danger Shots',
  'sat_LD': 'Low Danger Shots',
  'pp_shots_on_goal': 'PP Shots on Goal',
  '5v5_shots_on_goal': '5v5 Shots on Goal',
  'team_assists': 'Team Assists',
  '5v5_points': '5v5 Points',
  'pp_points': 'Power Play Points',
  'team_points': 'Team Points',
  'sog_HD': 'High Danger Shots on Goal',
  'goals_total': 'Total Goals',
  'sat_total': 'Total Shot Attempts',
  'points_total': 'Total Points',
  'player_team_total': 'Total',
  'shots_on_goal_avg': 'Rolling Avg',
  'sog_HD_avg': 'Rolling Avg',
  'team_goals_avg': 'Rolling Avg',
  '5v5_points_avg': 'Rolling Avg',
  'toi_seconds': 'TOI',
  'toi_avg': 'TOI Avg',
  'toi_total': 'Total TOI',
  'ev_5v5_mmss': '5v5 TOI',
  'pp_mmss': 'PP TOI',
  'pk_mmss': 'PK TOI',
  'ev_4v4_mmss': '4v4 TOI',
  'ev_3v3_mmss': '3v3 TOI',
  'other_goals': 'Other Goals',
  'pk_goals': 'PK Goals',
  'goal_share_rolling_avg': 'Goal Share %',
  'shooting_pct_rolling_avg': 'Shooting %'
}

// Helper to format seconds to mm:ss
const formatSecondsToMmss = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

import Image from "next/image"

const getNHLTeamLogo = (abbrev: string): string => {
  const teamMap: { [key: string]: string } = {
    'ANA': '/Images/NHL_Logos/ANA.png', 'ARI': '/Images/NHL_Logos/ARI.png', 'BOS': '/Images/NHL_Logos/BOS.png',
    'BUF': '/Images/NHL_Logos/BUF.png', 'CAR': '/Images/NHL_Logos/CAR.png', 'CBJ': '/Images/NHL_Logos/CBJ.png',
    'CGY': '/Images/NHL_Logos/CGY.png', 'CHI': '/Images/NHL_Logos/CHI.png', 'COL': '/Images/NHL_Logos/COL.png',
    'DAL': '/Images/NHL_Logos/DAL.png', 'DET': '/Images/NHL_Logos/DET.png', 'EDM': '/Images/NHL_Logos/EDM.png',
    'FLA': '/Images/NHL_Logos/FLA.png', 'LAK': '/Images/NHL_Logos/LAK.png', 'MIN': '/Images/NHL_Logos/MIN.png',
    'MTL': '/Images/NHL_Logos/MTL.png', 'NSH': '/Images/NHL_Logos/NSH.png', 'NJD': '/Images/NHL_Logos/NJD.png',
    'NYI': '/Images/NHL_Logos/NYI.png', 'NYR': '/Images/NHL_Logos/NYR.png', 'OTT': '/Images/NHL_Logos/OTT.png',
    'PHI': '/Images/NHL_Logos/PHI.png', 'PIT': '/Images/NHL_Logos/PIT.png', 'SJS': '/Images/NHL_Logos/SJS.png',
    'SEA': '/Images/NHL_Logos/SEA.png', 'STL': '/Images/NHL_Logos/STL.png', 'TB': '/Images/NHL_Logos/TB.png',
    'TBL': '/Images/NHL_Logos/TB.png', 'TOR': '/Images/NHL_Logos/TOR.png', 'VAN': '/Images/NHL_Logos/VAN.png', 
    'VGK': '/Images/NHL_Logos/VGK.png', 'WPG': '/Images/NHL_Logos/WPG.png', 'WSH': '/Images/NHL_Logos/WSH.png', 
    'UTA': '/Images/NHL_Logos/UTA.png'
  }
  return teamMap[abbrev] || '/Images/League_Logos/NHL-Logo.png'
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const opponent = label?.split('\n')[0] || label || ''
    const date = label?.split('\n')[1] || ''
    const data = payload[0]?.payload || {}
    
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
            {date && <div className="text-muted-foreground text-xs">{date}</div>}
          </div>
        </div>
        
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => {
            const displayName = FIELD_NAME_MAP[entry.name] || entry.name
            let value: string | number = entry.value
            
            // Special handling for TOI fields (convert seconds to mm:ss)
            if (entry.name === 'toi_seconds' || entry.name === 'toi_avg' || entry.name === 'toi_total' ||
                entry.name === 'ev_5v5_mmss' || entry.name === 'pp_mmss' || entry.name === 'pk_mmss' ||
                entry.name === 'ev_4v4_mmss' || entry.name === 'ev_3v3_mmss') {
              if (typeof entry.value === 'number' && entry.value > 0) {
                value = formatSecondsToMmss(entry.value)
              } else {
                value = '0:00'
              }
            } else if (typeof entry.value === 'number') {
              // Format percentage fields
              if (entry.name === 'goal_share_rolling_avg' || entry.name === 'shooting_pct_rolling_avg') {
                value = `${entry.value.toFixed(1)}%`
              } else {
                value = entry.value % 1 === 0 ? entry.value : entry.value.toFixed(2)
              }
            }
            
            // Special handling for trend/rolling avg
            if (entry.name?.includes('avg') || entry.name?.includes('Trend')) {
              return (
                <div key={index} className="flex justify-between items-center gap-6">
                  <span className="text-muted-foreground text-xs">Trend</span>
                  <span className="text-foreground font-bold text-lg">{value}</span>
                </div>
              )
            }
            
            return (
              <div key={index} className="flex justify-between items-center gap-6">
                <span className="text-muted-foreground text-xs">{displayName}</span>
                <span className="text-foreground font-bold text-lg">{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

