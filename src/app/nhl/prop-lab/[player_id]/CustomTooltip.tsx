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
  '5v5_points_avg': 'Rolling Avg'
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const opponent = label?.split('\n')[0] || ''
    const date = label?.split('\n')[1] || ''
    
    return (
      <div style={{ 
        backgroundColor: '#0f1419', 
        border: '1px solid #4a5568', 
        borderRadius: '8px',
        padding: '12px',
        fontSize: '12px',
        fontFamily: 'sans-serif',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
        minWidth: '160px',
        transition: 'all 0.2s ease'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '8px', 
          paddingBottom: '8px', 
          borderBottom: '1px solid #374151' 
        }}>
          <p style={{ 
            color: '#60a5fa', 
            fontWeight: '600', 
            fontSize: '13px',
            marginBottom: '2px'
          }}>
            vs {opponent}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '11px' }}>
            {date}
          </p>
        </div>
        
        {/* Stats */}
        <div>
          {payload.map((entry: any, index: number) => {
            const displayName = FIELD_NAME_MAP[entry.name] || entry.name
            const value = typeof entry.value === 'number' 
              ? (entry.value % 1 === 0 ? entry.value : entry.value.toFixed(2))
              : entry.value
            
            return (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                margin: '4px 0',
                padding: '3px 0'
              }}>
                <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                  {displayName}:
                </span>
                <span style={{ 
                  color: entry.fill || '#f3f4f6', 
                  fontWeight: '700', 
                  fontSize: '13px',
                  marginLeft: '8px'
                }}>
                  {value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

