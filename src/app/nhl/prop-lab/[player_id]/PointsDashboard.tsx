"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, ComposedChart, BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend, LabelList, ReferenceLine, Label } from 'recharts'
import { CustomTooltip } from './CustomTooltip'
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

// Custom X-Axis Tick component with stacked logo and date
const CustomXAxisTick = ({ x, y, payload, dataLength }: any) => {
  if (!payload || !payload.value) return null
  
  const [opponent, date] = payload.value.split('\n')
  const logoPath = getNHLTeamLogo(opponent)
  
  // Dynamic sizing based on number of data points
  let logoSize = 16
  let fontSize = 9
  let yOffset = 28
  
  if (dataLength > 50) {
    logoSize = 10
    fontSize = 7
    yOffset = 22
  } else if (dataLength > 30) {
    logoSize = 13
    fontSize = 8
    yOffset = 25
  }
  
  const halfSize = logoSize / 2
  
  return (
    <g transform={`translate(${x},${y})`}>
      {/* Team Logo */}
      <image
        x={-halfSize}
        y={5}
        width={logoSize}
        height={logoSize}
        href={logoPath}
      />
      {/* Date */}
      <text 
        x={0} 
        y={yOffset + 3} 
        textAnchor="middle" 
        fill="#9ca3af" 
        fontSize={fontSize}
      >
        {date}
      </text>
    </g>
  )
}

// Enhanced tooltip component for main bar chart
const MainChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null
  
  const data = payload[0].payload
  const [opponent, date] = label.split('\n')
  
  return (
    <div className="bg-[#1a1a1a] border-2 border-gray-700 rounded-lg p-4 shadow-2xl">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
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
          <div className="text-white font-bold text-sm">{opponent}</div>
          <div className="text-gray-400 text-xs">{date}</div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center gap-6">
          <span className="text-gray-400 text-xs">Points</span>
          <span className="text-white font-bold text-lg">{data.points}</span>
        </div>
        
        {data.team_goals !== undefined && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-gray-400 text-xs">Team Goals</span>
            <span className="text-gray-300 text-sm">{data.team_goals}</span>
          </div>
        )}
        
        {data.shifts !== undefined && (
          <div className="flex justify-between items-center gap-6">
            <span className="text-gray-400 text-xs">Shifts</span>
            <span className="text-gray-300 text-sm">{data.shifts}</span>
          </div>
        )}
        
        {data.pp_points !== undefined && data['5v5_points'] !== undefined && (
          <>
            <div className="h-px bg-gray-700 my-2" />
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-400 text-xs">PP Points</span>
              <span className="text-blue-400 text-sm">{data.pp_points}</span>
            </div>
            <div className="flex justify-between items-center gap-6">
              <span className="text-gray-400 text-xs">5v5 Points</span>
              <span className="text-blue-400 text-sm">{data['5v5_points']}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

interface PointsDashboardProps {
  gamelogs: any[]
  selectedProp: any
  lineValue: number
}

export function PointsDashboard({ gamelogs, selectedProp, lineValue }: PointsDashboardProps) {
  const [showRollingAvg, setShowRollingAvg] = useState(false)
  const [showShifts, setShowShifts] = useState(false)
  
  const chartData = useMemo(() => {
    return gamelogs.map((game) => {
      let formattedDate = ''
      try {
        if (game.game_date) {
          let dateStr = ''
          if (typeof game.game_date === 'string') {
            dateStr = game.game_date
          } else if (game.game_date instanceof Date) {
            dateStr = game.game_date.toISOString().split('T')[0]
          } else if (typeof game.game_date === 'object' && game.game_date.value) {
            dateStr = game.game_date.value
          } else {
            dateStr = new Date(game.game_date).toISOString().split('T')[0]
          }
          const dateParts = dateStr.split('-')
          if (dateParts.length === 3) {
            formattedDate = `${dateParts[1]}/${dateParts[2]}`
          }
        }
      } catch (e) {
        console.warn('Date parsing error:', game.game_date, e)
      }
      
      return {
      opponent: game.away_abbrev === game.player_team_abbrev ? game.home_abbrev : game.away_abbrev,
      opponentAndDate: `${game.away_abbrev === game.player_team_abbrev ? game.home_abbrev : game.away_abbrev}\n${formattedDate || ''}`,
      points: game.points,
      team_goals: game.team_goals,
      '5v5_points': game['5v5_points'],
      shifts: game.shifts,
      pp_points: game.pp_points,
      points_total: (game['5v5_points'] || 0) + (game.pp_points || 0),
      team_points: game.team_points,
      player_team_total: (game.points || 0) + (game.team_points || 0)
    }
    })
  }, [gamelogs])

  // Calculate rolling averages
  const teamGoalsDataWithRolling = useMemo(() => {
    return chartData.map((_, i) => {
      const start = Math.max(0, i - 3 + 1)
      const subset = chartData.slice(start, i + 1)
      const avg = subset.reduce((sum, d) => sum + d.team_goals, 0) / subset.length
      return { ...chartData[i], team_goals_avg: avg }
    })
  }, [chartData])

  const fivev5PointsDataWithRolling = useMemo(() => {
    return chartData.map((_, i) => {
      const start = Math.max(0, i - 3 + 1)
      const subset = chartData.slice(start, i + 1)
      const avg = subset.reduce((sum, d) => sum + d['5v5_points'], 0) / subset.length
      return { ...chartData[i], '5v5_points_avg': avg }
    })
  }, [chartData])

  // Determine color for points - Simple green/red based on hit/miss
  const getPointsBarColor = (points: number) => {
    const isOver = selectedProp?.ou === 'Over'
    const line = lineValue
    
    // Hit = Green, Miss = Red
    if (isOver) {
      return points > line ? '#22c55e' : '#ef4444'
    } else {
      return points < line ? '#22c55e' : '#ef4444'
    }
  }

  const recentData = chartData

  return (
    <div className="space-y-4">
      {/* Main Chart Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Main Points Chart - 2/3 width */}
        <Card className="col-span-2 border border-gray-700 bg-[#171717] transition-all duration-200 hover:border-gray-600">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Points</CardTitle>
              <button
                onClick={() => setShowShifts(!showShifts)}
                className={`text-xs px-3 py-1 rounded transition-colors ${
                  showShifts
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600 hover:border-gray-500'
                }`}
              >
                {showShifts ? '● Shifts' : 'Shifts'}
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-0 pr-2">
            <ResponsiveContainer width="100%" height={315}>
              <ComposedChart data={recentData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="opponentAndDate" 
                  tick={<CustomXAxisTick dataLength={recentData.length} />}
                  height={50}
                  interval={recentData.length > 40 ? 1 : 0}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  domain={[0, 'auto']}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: showShifts ? '#60a5fa' : 'transparent' }}
                  domain={[0, 'auto']}
                  width={showShifts ? 40 : 0}
                />
                <Tooltip content={<MainChartTooltip />} />
                <ReferenceLine 
                  y={lineValue}
                  yAxisId="left" 
                  stroke="#eab308" 
                  strokeDasharray="5 5" 
                  strokeWidth={2}
                >
                  <Label 
                    value={lineValue.toString()} 
                    position="left" 
                    fill="#eab308"
                    fontSize={11}
                    fontWeight="bold"
                    style={{
                      backgroundColor: '#854d0e',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  />
                </ReferenceLine>
                <Bar 
                  dataKey="points"
                  yAxisId="left"
                  name="Points"
                  radius={[4, 4, 0, 0]} 
                  label={{ position: 'top', fill: '#f3f4f6', fontSize: 9, formatter: (value: any) => value > 0 ? value : '' }}
                >
                  {recentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPointsBarColor(entry.points)} />
                  ))}
                </Bar>
                {showShifts && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="shifts"
                    stroke="#60a5fa"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#60a5fa', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    name="Shifts"
                    isAnimationActive={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Secondary Chart - Team Goals */}
        <Card className="col-span-1 border border-gray-700 bg-[#171717] transition-all duration-200 hover:border-gray-600">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base font-semibold">Team Goals</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-0 pr-2">
            <ResponsiveContainer width="100%" height={315}>
              <BarChart data={recentData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="opponentAndDate" tick={false} height={0} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="team_goals" 
                  name="Team Goals"
                  fill="#5F85DB" 
                  radius={[4, 4, 0, 0]} 
                >
                  <LabelList 
                    dataKey="team_goals" 
                    position="top" 
                    style={{ fill: '#f3f4f6', fontSize: '9px' }}
                    formatter={(value: any) => value > 0 ? value : ''}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team Goals with Rolling Avg */}
        <Card className="border border-gray-700 bg-[#171717] transition-all duration-200 hover:border-gray-600">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Team Goals</CardTitle>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showRollingAvg} 
                  onChange={() => setShowRollingAvg(!showRollingAvg)} 
                  className="w-3 h-3 cursor-pointer" 
                />
                Rolling Avg
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-0 pr-2">
            <ResponsiveContainer width="100%" height={260}>
              {showRollingAvg ? (
                <LineChart data={teamGoalsDataWithRolling} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="opponentAndDate" tick={false} height={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="team_goals_avg" stroke="#5F85DB" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={recentData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="opponentAndDate" tick={false} height={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar 
                    dataKey="team_goals" 
                    name="Team Goals"
                    fill="#5F85DB" 
                    radius={[4, 4, 0, 0]} 
                  >
                    <LabelList 
                      dataKey="team_goals" 
                      position="top" 
                      style={{ fill: '#f3f4f6', fontSize: '9px' }}
                      formatter={(value: any) => value > 0 ? value : ''}
                    />
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 5v5 Points with Rolling Avg */}
        <Card className="border border-gray-700 bg-[#171717] transition-all duration-200 hover:border-gray-600">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">5v5 Points</CardTitle>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showRollingAvg} 
                  onChange={() => setShowRollingAvg(!showRollingAvg)} 
                  className="w-3 h-3 cursor-pointer" 
                />
                Rolling Avg
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-0 pb-0 pr-2">
            <ResponsiveContainer width="100%" height={260}>
              {showRollingAvg ? (
                <LineChart data={fivev5PointsDataWithRolling} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="opponentAndDate" tick={false} height={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="5v5_points_avg" stroke="#5F85DB" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={recentData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="opponentAndDate" tick={false} height={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar 
                    dataKey="5v5_points" 
                    name="5v5 Points"
                    fill="#5F85DB" 
                    radius={[4, 4, 0, 0]} 
                  >
                    <LabelList 
                      dataKey="5v5_points" 
                      position="top" 
                      style={{ fill: '#f3f4f6', fontSize: '9px' }}
                      formatter={(value: any) => value > 0 ? value : ''}
                    />
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Shifts */}
        <Card className="border border-gray-700 bg-[#171717] transition-all duration-200 hover:border-gray-600">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold">Shifts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-0 pr-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={recentData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="opponentAndDate" tick={false} height={0} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="shifts" 
                  name="Shifts"
                  fill="#5F85DB" 
                  radius={[4, 4, 0, 0]} 
                >
                  <LabelList 
                    dataKey="shifts" 
                    position="top" 
                    style={{ fill: '#f3f4f6', fontSize: '9px' }}
                    formatter={(value: any) => value > 0 ? value : ''}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Points by Situation */}
        <Card className="border border-gray-700 bg-[#171717] transition-all duration-200 hover:border-gray-600">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm font-semibold">Points by Situation</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-0 pr-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={recentData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="opponentAndDate" tick={false} height={0} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                <Bar dataKey="5v5_points" stackId="a" name="5v5 Points" fill="#5F85DB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pp_points" stackId="a" name="PP Points" fill="#4a90e2" radius={[0, 0, 0, 0]} >
                  <LabelList dataKey="points_total" position="top" style={{ fill: '#f3f4f6', fontSize: '9px' }} formatter={(value: any) => value > 0 ? value : ''} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Points / Team Points */}
      <Card className="border border-gray-700 bg-[#171717]">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">Player vs Team Points</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-0 pr-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={recentData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="opponentAndDate" tick={false} height={0} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} iconSize={10} />
              <Bar dataKey="points" stackId="a" name="Points" fill="#5F85DB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="team_points" stackId="a" name="Team Points" fill="#4a90e2" radius={[0, 0, 0, 0]} >
                <LabelList dataKey="player_team_total" position="top" style={{ fill: '#f3f4f6', fontSize: '9px' }} formatter={(value: any) => value > 0 ? value : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

