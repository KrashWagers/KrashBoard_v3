"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IceRinkVisualizationProps {
  playerId: string
  gameId?: string
  gamelogs?: any[] // Pass in the gamelogs from parent
  timeFilter?: string // Pass in the time filter from parent
}

interface ShotEvent {
  x: number
  y: number
  type_desc: string
  type: 'goal' | 'shot-on-goal' | 'missed-shot' | 'blocked-shot'
}

// NHL rink constants
const RINK = {
  width: 85,
  halfLen: 100,
  cornerR: 28,
  goalLineX: 89,
  blueLineX: 36,  // 64 ft from end boards = 100 - 64 = 36
  creaseR: 6,
  zFO: { x: 69, y: 22, r: 15 },
}


export function IceRinkVisualization({ playerId, gameId, gamelogs: parentGamelogs, timeFilter: parentTimeFilter }: IceRinkVisualizationProps) {
  const [data, setData] = useState<any[]>([])
  const [playerName, setPlayerName] = useState<string>('')
  const [gameLogs, setGameLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'dots' | 'heatmap' | 'zones'>('dots')
  const [eventTypes, setEventTypes] = useState<string[]>(['all'])
  const [hoveredShot, setHoveredShot] = useState<any>(null)
  const [hoveredHex, setHoveredHex] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Filter states
  const [strengthFilter, setStrengthFilter] = useState<string>('all')
  const [advantageFilter, setAdvantageFilter] = useState<string>('all')
  const [opponentFilter, setOpponentFilter] = useState<string>('all')
  const [goalieFilter, setGoalieFilter] = useState<string>('all')
  const [shotTypeFilter, setShotTypeFilter] = useState<string>('all')
  const [missReasonFilter, setMissReasonFilter] = useState<string>('all')
  const [selectedGameIds, setSelectedGameIds] = useState<string>('all')

  // Use parent gamelogs if provided, otherwise fetch
  useEffect(() => {
    if (parentGamelogs) {
      setGameLogs(parentGamelogs)
      if (parentGamelogs.length > 0) {
        setPlayerName(parentGamelogs[0].player_name || '')
      }
    } else {
      const fetchGameLogs = async () => {
        try {
          const response = await fetch(`/api/nhl/players/${playerId}/gamelogs`)
          if (response.ok) {
            const result = await response.json()
            setGameLogs(result.data || [])
            if (result.data && result.data.length > 0) {
              setPlayerName(result.data[0].player_name || '')
            }
          }
        } catch (error) {
          console.error('Error fetching gamelogs:', error)
        }
      }
      fetchGameLogs()
    }
  }, [playerId, parentGamelogs])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch all seasons to get complete data
        const url = `/api/nhl/players/${playerId}/play-by-play`
        const response = await fetch(url)
        if (response.ok) {
          const result = await response.json()
          setData(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching play by play data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [playerId, playerName])

  // Filter gamelogs based on parent time filter
  const filteredGameLogs = useMemo(() => {
    if (!parentTimeFilter || !gameLogs.length) return gameLogs
    
    const now = new Date()
    const filterMap: { [key: string]: number } = {
      'all': Infinity,
      '2024-25': new Date('2025-06-30').getTime(),
      '2025-26': Infinity,
      'L50': 50,
      'L30': 30,
      'L20': 20,
      'L10': 10,
      'L5': 5
    }
    
    const cutoff = filterMap[parentTimeFilter]
    if (cutoff === Infinity) return gameLogs
    
    if (typeof cutoff === 'number') {
      return gameLogs.slice(0, cutoff)
    }
    
    const cutoffDate = new Date(cutoff)
    return gameLogs.filter(g => new Date(g.game_date).getTime() >= cutoffDate.getTime())
  }, [gameLogs, parentTimeFilter])
  
  // Get unique filter values from the actual displayed data
  const strengths = [...new Set(data.map(d => d.Strength).filter(Boolean))].sort()
  const opponents = [...new Set(data.map(d => d.Opponent).filter(Boolean))].sort()
  const goalies = [...new Set(data.map(d => d.Goalie_Name).filter(Boolean))].sort()
  const shotTypes = [...new Set(data.map(d => d.Shot_Type).filter(Boolean))].sort()
  const missReasons = [...new Set(data.map(d => d.Miss_Reason).filter(Boolean))].sort()
  
  // Get selected game IDs from filtered gamelogs
  const selectedGameIdsArray = selectedGameIds === 'all' 
    ? filteredGameLogs.map(g => String(g.game_id)) 
    : [selectedGameIds]
  
  // Debug logging
  console.log('Total shots fetched:', data.length)
  console.log('Game IDs from gamelogs:', selectedGameIdsArray.length)
  console.log('First few game IDs:', selectedGameIdsArray.slice(0, 5))
  console.log('First few shot Game_IDs:', data.slice(0, 5).map(d => d.Game_ID))
  
  // Data is already standardized - filter by all criteria (API already filters by player)
  const filteredData = data.filter((item) => {
    // Player filtering is already done on the API side
    
    // Filter by game IDs (convert to strings for comparison)
    if (selectedGameIdsArray.length > 0 && !selectedGameIdsArray.includes(String(item.Game_ID))) {
      return false
    }
    
    // Filter by event type - handle multi-select
    if (!eventTypes.includes('all')) {
      let matches = false
      if (eventTypes.includes('goals') && item.Is_Goal === 1) matches = true
      if (eventTypes.includes('shots') && item.Is_SOG === 1) matches = true // Includes goals when showing SOG
      if (eventTypes.includes('missed') && item.Is_Missed === 1) matches = true
      if (eventTypes.includes('blocked') && item.Is_Blocked === 1) matches = true
      if (!matches) return false
    }
    
    // Filter by strength
    if (strengthFilter !== 'all' && item.Strength !== strengthFilter) return false
    
    // Filter by advantage
    if (advantageFilter !== 'all' && item.Advantage !== advantageFilter) return false
    
    // Filter by opponent
    if (opponentFilter !== 'all' && item.Opponent !== opponentFilter) return false
    
    // Filter by goalie
    if (goalieFilter !== 'all' && item.Goalie_Name !== goalieFilter) return false
    
    // Filter by shot type
    if (shotTypeFilter !== 'all' && item.Shot_Type !== shotTypeFilter) return false
    
    // Filter by miss reason
    if (missReasonFilter !== 'all' && item.Miss_Reason !== missReasonFilter) return false
    
    return true
  }).filter(item => item.x !== null && item.y !== null)

  const shotsData = filteredData

  const getEventColor = (event: any) => {
    if (event.Is_Goal === 1) return '#3b82f6' // blue for goals
    if (event.Is_SOG === 1 && event.Is_Goal === 0) return '#22c55e' // green for shots on goal
    if (event.Is_Missed === 1) return '#eab308' // yellow for missed
    if (event.Is_Blocked === 1) return '#f97316' // orange for blocked
    return '#5F85DB'
  }
  
  const isGoal = (event: any) => {
    return event.Is_Goal === 1
  }

  const goals = shotsData.filter(s => s.Is_Goal === 1).length
  const shots = shotsData.filter(s => s.Is_SOG === 1 && s.Is_Goal === 0).length
  const missed = shotsData.filter(s => s.Is_Missed === 1).length
  const blocked = shotsData.filter(s => s.Is_Blocked === 1).length
  const total = shotsData.length

  // SVG dimensions
  const svgWidth = 700
  const svgHeight = 595


  if (loading) {
    return (
      <Card className="border border-gray-700 bg-[#171717]">
        <CardHeader>
          <CardTitle className="text-sm">Shot Location Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-700 bg-[#171717]">
      <CardHeader>
        <CardTitle className="text-sm">Shot Location Map</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground pb-1 border-b border-gray-700 mb-2">Events</div>
            <div className="text-lg font-semibold">{total}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground pb-1 border-b border-gray-700 mb-2">Goals</div>
            <div className="text-lg font-semibold text-green-500">{goals}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground pb-1 border-b border-gray-700 mb-2">Shots</div>
            <div className="text-lg font-semibold">{shots}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground pb-1 border-b border-gray-700 mb-2">Shot %</div>
            <div className="text-lg font-semibold">{goals > 0 && shots > 0 ? ((goals / shots) * 100).toFixed(1) : '0'}%</div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap mb-2">
            <Button
              size="sm"
              variant={viewMode === 'dots' ? 'default' : 'outline'}
              onClick={() => setViewMode('dots')}
              className="h-8 text-xs"
            >
              Dots
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'heatmap' ? 'default' : 'outline'}
              onClick={() => setViewMode('heatmap')}
              className="h-8 text-xs"
            >
              Heat Map
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'zones' ? 'default' : 'outline'}
              onClick={() => setViewMode('zones')}
              className="h-8 text-xs"
            >
              Zones
            </Button>
          </div>
          
          {/* Filters - Default Visible + Accordion */}
          <div className="space-y-2">
            {/* Default Visible Filters */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Event Type</label>
                <Select 
                  value={eventTypes.join(',')} 
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setEventTypes(['all'])
                    } else {
                      const values = value.split(',')
                      const filtered = values.filter(v => v !== 'all')
                      setEventTypes(filtered.length > 0 ? filtered : ['all'])
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All Events">
                      {eventTypes.includes('all') ? 'All Events' : `${eventTypes.length} selected`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="goals">Goals</SelectItem>
                    <SelectItem value="shots">Shots on Goal (includes Goals)</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Advantage</label>
                <Select value={advantageFilter} onValueChange={setAdvantageFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PP">Power Play</SelectItem>
                    <SelectItem value="PK">Penalty Kill</SelectItem>
                    <SelectItem value="EV">Even Strength</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Collapsible Advanced Filters */}
            <details className="border border-gray-700 rounded p-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-white py-2">
                Advanced Filters
              </summary>
              <div className="grid grid-cols-3 gap-3 mt-2 pt-2 border-t border-gray-700">
                {strengths.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Strength</label>
                      <Select value={strengthFilter} onValueChange={setStrengthFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all">All</SelectItem>
                          {strengths.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                )}
                
                {shotTypes.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Shot Type</label>
                      <Select value={shotTypeFilter} onValueChange={setShotTypeFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all">All</SelectItem>
                          {shotTypes.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                )}
                
                {opponents.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Opponent</label>
                      <Select value={opponentFilter} onValueChange={setOpponentFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all">All</SelectItem>
                          {opponents.slice(0, 20).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                )}
                
                {goalies.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Goalie</label>
                      <Select value={goalieFilter} onValueChange={setGoalieFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all">All</SelectItem>
                          {goalies.slice(0, 20).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                )}
                
                {filteredGameLogs.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Specific Game</label>
                    <Select value={selectedGameIds} onValueChange={setSelectedGameIds}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All Games" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Games ({filteredGameLogs.length})</SelectItem>
                        {filteredGameLogs.slice(0, 20).map(g => (
                          <SelectItem key={g.game_id} value={g.game_id}>
                            {g.away_abbrev} vs {g.home_abbrev} ({new Date(g.game_date).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {missReasons.length > 0 && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Miss Reason</label>
                      <Select value={missReasonFilter} onValueChange={setMissReasonFilter}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all">All</SelectItem>
                          {missReasons.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* Ice Rink SVG */}
        <div className="relative border border-gray-700 rounded overflow-hidden" style={{ background: 'transparent' }}>
          <svg
            width={svgHeight}
            height={svgWidth * 0.7}
            viewBox="-42.5 0 85 65"
            className="w-full h-auto"
            style={{ background: 'transparent' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Pulse animation for goal dots */}
              <animate 
                attributeName="r"
                attributeType="XML"
                from="1"
                to="1.3"
                dur="2s"
                repeatCount="indefinite"
                id="goalPulse"
              />
            </defs>
            <g transform="translate(0, 50) rotate(-90) translate(-50, 0)">
            {/* Rink boards outline with rounded corners */}
            <path 
              d="M 0 -42.5 L 72 -42.5 Q 100 -42.5 100 -14.5 L 100 14.5 Q 100 42.5 72 42.5 L 0 42.5 Z"
              fill="none" 
              stroke="#888" 
              strokeWidth="0.8"
              opacity="0.8"
              clipPath="url(#rinkClip)"
            />
            <defs>
              <clipPath id="rinkClip">
                <path d="M 0 -42.5 L 72 -42.5 Q 100 -42.5 100 -14.5 L 100 14.5 Q 100 42.5 72 42.5 L 0 42.5 Z" />
              </clipPath>
            </defs>
            
            {/* Center ice half-circle (at left edge) */}
            <path 
              d={`M 0 15 A 15 15 0 0 1 0 -15`}
              fill="none" 
              stroke="#888" 
              strokeWidth="0.6"
              opacity="0.7"
            />
            
            {/* Center line (left edge) */}
            <line x1="0" y1="-42.5" x2="0" y2="42.5" stroke="#888" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.8" clipPath="url(#rinkClip)"/>
            
            {/* Blue line */}
            <line x1={RINK.blueLineX} y1="-42.5" x2={RINK.blueLineX} y2="42.5" stroke="#888" strokeWidth="2" opacity="0.8" clipPath="url(#rinkClip)"/>
            
            {/* Goal line (right end) */}
            <line x1="89" y1="-42.5" x2="89" y2="42.5" stroke="#888" strokeWidth="0.8" opacity="0.8" clipPath="url(#rinkClip)"/>
            
            {/* Goal frame (facing left towards center ice) */}
            <rect x="85" y="-2" width="4" height="4" fill="none" stroke="#888" strokeWidth="0.8" opacity="0.8"/>
            
            {/* Goal crease arc (facing left) */}
            <path 
              d={`M 89 -6 A 6 6 0 0 0 89 6`} 
              fill="none" 
              stroke="#888" 
              strokeWidth="0.8"
              opacity="0.8"
            />
            
            {/* End zone faceoff circles */}
            {[+1, -1].map(sign => (
              <circle
                key={sign}
                cx="69"
                cy={sign * 22}
                r="15"
                fill="none"
                stroke="#888"
                strokeWidth="0.8"
                opacity="0.8"
              />
            ))}
            
            {/* Faceoff dots */}
            <circle cx="69" cy="22" r="0.8" fill="#888" opacity="0.8" />
            <circle cx="69" cy="-22" r="0.8" fill="#888" opacity="0.8" />
            <circle cx={RINK.blueLineX} cy="0" r="0.8" fill="#888" opacity="0.8" />
            
            {/* Points for shots/goals */}
            {viewMode === 'dots' && shotsData.map((shot, index) => {
              const shotIsGoal = isGoal(shot)
              const r = 1 // same size for all
              
              // Flip y-axis to match standard rink orientation
              const flippedY = -shot.y
              
              // Determine if this shot should be greyed out
              const shouldGreyOut = hoveredShot && (
                hoveredShot.Is_Goal !== shot.Is_Goal ||
                hoveredShot.Is_SOG !== shot.Is_SOG ||
                hoveredShot.Is_Missed !== shot.Is_Missed ||
                hoveredShot.Is_Blocked !== shot.Is_Blocked
              )
              
              return (
                <circle
                  key={index}
                  cx={shot.x}
                  cy={flippedY}
                  r={r}
                  fill={shouldGreyOut ? '#4a5568' : getEventColor(shot)}
                  opacity={shouldGreyOut ? 0.3 : (shotIsGoal ? 0.95 : 0.9)}
                  stroke={shotIsGoal && !shouldGreyOut ? '#60a5fa' : 'none'}
                  strokeWidth={shotIsGoal ? 0.3 : 0}
                  onMouseEnter={() => setHoveredShot(shot)}
                  onMouseLeave={() => setHoveredShot(null)}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  {shotIsGoal && (
                    <>
                    <animate 
                      attributeName="r"
                      values="1;1.3;1"
                      dur="3.5s"
                      repeatCount="indefinite"
                      calcMode="spline"
                      keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                      keyTimes="0;0.5;1"
                    />
                    </>
                  )}
                </circle>
              )
            })}

            {/* Heatmap - Hexagonal Grid */}
            {viewMode === 'heatmap' && (() => {
              // Generate hexagonal grid
              const hexSize = 3 // size of each hexagon (reduced from 5 to 3)
              const hexWidth = hexSize * 2
              const hexHeight = Math.sqrt(3) * hexSize
              const hexMap = new Map<string, any>()
              
              // Count shots in each hex and store shot details
              shotsData.forEach(shot => {
                const flippedY = -shot.y
                
                // Convert x,y to hex coordinates (offset coordinates)
                const col = Math.round(shot.x / (hexWidth * 0.75))
                const row = Math.round((flippedY - (col % 2) * hexHeight / 2) / hexHeight)
                const key = `${col},${row}`
                
                if (!hexMap.has(key)) {
                  hexMap.set(key, { count: 0, shots: [], goals: 0, shotsOnGoal: 0, missed: 0, blocked: 0 })
                }
                
                const hexData = hexMap.get(key)
                hexData.count++
                hexData.shots.push(shot)
                if (shot.Is_Goal === 1) hexData.goals++
                if (shot.Is_SOG === 1) hexData.shotsOnGoal++
                if (shot.Is_Missed === 1) hexData.missed++
                if (shot.Is_Blocked === 1) hexData.blocked++
              })
              
              // Find max count for color scaling
              const maxCount = Math.max(...Array.from(hexMap.values()).map(h => h.count))
              
              // Generate hexagon path
              const hexPath = (cx: number, cy: number, size: number) => {
                const points = []
                for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i
                  const x = cx + size * Math.cos(angle)
                  const y = cy + size * Math.sin(angle)
                  points.push(`${x},${y}`)
                }
                return `M ${points.join(' L ')} Z`
              }
              
              // Get color based on count (dark grey -> solid blue)
              const getHexColor = (count: number) => {
                const intensity = count / maxCount
                // Interpolate from dark grey (#2d3748) to solid blue (#3b82f6)
                const r = Math.round(45 + (59 - 45) * intensity)
                const g = Math.round(55 + (130 - 55) * intensity)
                const b = Math.round(72 + (246 - 72) * intensity)
                return `rgb(${r}, ${g}, ${b})`
              }
              
              return (
                <g opacity="0.85">
                  {Array.from(hexMap.entries()).map(([key, hexData]) => {
                    const [col, row] = key.split(',').map(Number)
                    
                    // Convert hex coordinates back to x,y
                    const x = col * hexWidth * 0.75
                    const y = row * hexHeight + (col % 2) * hexHeight / 2
                    
                    return (
                      <path
                        key={key}
                        d={hexPath(x, y, hexSize)}
                        fill={getHexColor(hexData.count)}
                        stroke="#1a1a1a"
                        strokeWidth="0.2"
                        opacity={0.7 + (hexData.count / maxCount) * 0.3}
                        onMouseEnter={() => setHoveredHex({ ...hexData, totalShots: shotsData.length })}
                        onMouseLeave={() => setHoveredHex(null)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      />
                    )
                  })}
                </g>
              )
            })()}

            {/* Zones View */}
            {viewMode === 'zones' && (() => {
              // Generate hexagonal heatmap for each zone
              const hexSize = 3
              const hexWidth = hexSize * 2
              const hexHeight = Math.sqrt(3) * hexSize
              
              // Separate hex maps for each zone
              const zoneHexMaps: any = {
                point: new Map(),
                leftCircle: new Map(),
                rightCircle: new Map(),
                slot: new Map()
              }

              // Categorize shots into zones and hex grids
              shotsData.forEach(shot => {
                const flippedY = -shot.y
                const blueLineX = 36
                
                let zone = null
                if (shot.x <= blueLineX + 10) {
                  zone = 'point'
                } else if (flippedY < -8 && shot.x > blueLineX + 10) {
                  zone = 'leftCircle'
                } else if (flippedY > 8 && shot.x > blueLineX + 10) {
                  zone = 'rightCircle'
                } else if (Math.abs(flippedY) <= 8 && shot.x > blueLineX + 10) {
                  zone = 'slot'
                }
                
                if (zone) {
                  const col = Math.round(shot.x / (hexWidth * 0.75))
                  const row = Math.round((flippedY - (col % 2) * hexHeight / 2) / hexHeight)
                  const key = `${col},${row}`
                  
                  const hexMap = zoneHexMaps[zone]
                  if (!hexMap.has(key)) {
                    hexMap.set(key, { count: 0, shots: [], goals: 0, shotsOnGoal: 0, missed: 0, blocked: 0 })
                  }
                  
                  const hexData = hexMap.get(key)
                  hexData.count++
                  hexData.shots.push(shot)
                  if (shot.Is_Goal === 1) hexData.goals++
                  if (shot.Is_SOG === 1) hexData.shotsOnGoal++
                  if (shot.Is_Missed === 1) hexData.missed++
                  if (shot.Is_Blocked === 1) hexData.blocked++
                }
              })

              // Generate hexagon path
              const hexPath = (cx: number, cy: number, size: number) => {
                const points = []
                for (let i = 0; i < 6; i++) {
                  const angle = (Math.PI / 3) * i
                  const x = cx + size * Math.cos(angle)
                  const y = cy + size * Math.sin(angle)
                  points.push(`${x},${y}`)
                }
                return `M ${points.join(' L ')} Z`
              }

              // Color scales for each zone (dark -> bright)
              const getZoneColor = (zone: string, intensity: number) => {
                const scales: any = {
                  point: { dark: [45, 20, 9], bright: [220, 38, 38] }, // brown -> red
                  slot: { dark: [49, 46, 129], bright: [99, 102, 241] }, // dark blue -> indigo
                  leftCircle: { dark: [20, 83, 45], bright: [34, 197, 94] }, // dark green -> green
                  rightCircle: { dark: [120, 53, 15], bright: [249, 115, 22] } // dark brown -> orange
                }
                
                const scale = scales[zone]
                const r = Math.round(scale.dark[0] + (scale.bright[0] - scale.dark[0]) * intensity)
                const g = Math.round(scale.dark[1] + (scale.bright[1] - scale.dark[1]) * intensity)
                const b = Math.round(scale.dark[2] + (scale.bright[2] - scale.dark[2]) * intensity)
                return `rgb(${r}, ${g}, ${b})`
              }

              return (
                <g>
                  {/* Render zone boundaries with thin borders */}
                  <rect x="0" y="-42.5" width="46" height="85" fill="none" stroke="#555" strokeWidth="0.3" />
                  <rect x="46" y="-8" width="54" height="16" fill="none" stroke="#555" strokeWidth="0.3" />
                  <path d="M 46 -42.5 L 100 -42.5 L 100 -8 L 46 -8 Z" fill="none" stroke="#555" strokeWidth="0.3" />
                  <path d="M 46 8 L 100 8 L 100 42.5 L 46 42.5 Z" fill="none" stroke="#555" strokeWidth="0.3" />

                  {/* Render hexagons for each zone */}
                  {Object.entries(zoneHexMaps).map(([zoneName, hexMap]: [string, any]) => {
                    const maxCount = Math.max(...Array.from(hexMap.values()).map((h: any) => h.count), 1)
                    
                    return (
                      <g key={zoneName} opacity="0.85">
                        {Array.from(hexMap.entries()).map((entry: any) => {
                          const [key, hexData] = entry as [string, any]
                          const [col, row] = key.split(',').map(Number)
                          const x = col * hexWidth * 0.75
                          const y = row * hexHeight + (col % 2) * hexHeight / 2
                          const intensity = hexData.count / maxCount
                          
                          return (
                            <path
                              key={`${zoneName}-${key}`}
                              d={hexPath(x, y, hexSize)}
                              fill={getZoneColor(zoneName, intensity)}
                              stroke="#1a1a1a"
                              strokeWidth="0.2"
                              opacity={0.7 + intensity * 0.3}
                              onMouseEnter={() => setHoveredHex({ 
                                ...hexData, 
                                totalShots: shotsData.length,
                                zone: zoneName.replace('Circle', ' Circle').replace(/([A-Z])/g, ' $1').trim()
                              })}
                              onMouseLeave={() => setHoveredHex(null)}
                              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                            />
                          )
                        })}
                      </g>
                    )
                  })}

                  {/* Zone labels - small, clean */}
                  <text x="23" y="0" textAnchor="middle" fill="#ddd" fontSize="4" fontWeight="600" opacity="0.8">
                    Point
                  </text>
                  <text x="73" y="0" textAnchor="middle" fill="#ddd" fontSize="4" fontWeight="600" opacity="0.8">
                    Slot
                  </text>
                  <text x="73" y="-25" textAnchor="middle" fill="#ddd" fontSize="4" fontWeight="600" opacity="0.8">
                    Left Circle
                  </text>
                  <text x="73" y="25" textAnchor="middle" fill="#ddd" fontSize="4" fontWeight="600" opacity="0.8">
                    Right Circle
                  </text>
                </g>
              )
            })()}
            
            {/* Define blue-to-red gradient like reference image */}
            <defs>
              <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />   {/* Light red center */}
                <stop offset="25%" stopColor="#fb923c" stopOpacity="0.6" />   {/* Orange */}
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.4" />    {/* Yellow */}
                <stop offset="75%" stopColor="#60a5fa" stopOpacity="0.2" />   {/* Light blue */}
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />   {/* Dark blue edge */}
              </radialGradient>
            </defs>
            </g>
          </svg>
        </div>

        {/* Footer - Hovered Shot/Hex Info (Static Height) */}
        <div className="mt-4 min-h-[180px]">
          <div className={`bg-[#1a1a1a] border-2 rounded-lg p-4 shadow-2xl transition-all duration-200 ${
            hoveredShot 
              ? hoveredShot.Is_Goal === 1 
                ? 'border-blue-500' 
                : hoveredShot.Is_SOG === 1 && hoveredShot.Is_Goal === 0
                  ? 'border-green-500'
                  : hoveredShot.Is_Missed === 1
                    ? 'border-yellow-500'
                    : 'border-orange-500'
              : hoveredHex
                ? 'border-blue-500'
                : 'border-gray-700'
          }`}>
            {hoveredHex ? (
              <>
                {/* Hexagon Stats Header */}
                <div className="mb-3 pb-2 border-b border-gray-700">
                  <div className="text-white font-bold text-sm">
                    {hoveredHex.zone ? `${hoveredHex.zone}` : 'Zone Statistics'}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {hoveredHex.count} {hoveredHex.count === 1 ? 'shot' : 'shots'} from this area
                  </div>
                </div>
                
                {/* Hexagon Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-6">
                    <span className="text-gray-400 text-xs">Total Shots</span>
                    <span className="text-white font-bold text-sm">{hoveredHex.count}</span>
                  </div>
                  
                  <div className="flex justify-between items-center gap-6">
                    <span className="text-gray-400 text-xs">% of All Shots</span>
                    <span className="text-white font-bold text-sm">
                      {((hoveredHex.count / hoveredHex.totalShots) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  {hoveredHex.goals > 0 && (
                    <>
                      <div className="h-px bg-gray-700 my-2" />
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-gray-400 text-xs">Goals</span>
                        <span className="text-blue-500 font-bold text-sm">{hoveredHex.goals}</span>
                      </div>
                    </>
                  )}
                  
                  {hoveredHex.shotsOnGoal > 0 && (
                    <div className="flex justify-between items-center gap-6">
                      <span className="text-gray-400 text-xs">Shots on Goal</span>
                      <span className="text-green-500 text-sm">{hoveredHex.shotsOnGoal}</span>
                    </div>
                  )}
                  
                  {hoveredHex.missed > 0 && (
                    <div className="flex justify-between items-center gap-6">
                      <span className="text-gray-400 text-xs">Missed</span>
                      <span className="text-yellow-500 text-sm">{hoveredHex.missed}</span>
                    </div>
                  )}
                  
                  {hoveredHex.blocked > 0 && (
                    <div className="flex justify-between items-center gap-6">
                      <span className="text-gray-400 text-xs">Blocked</span>
                      <span className="text-orange-500 text-sm">{hoveredHex.blocked}</span>
                    </div>
                  )}
                  
                  {hoveredHex.shotsOnGoal > 0 && (
                    <>
                      <div className="h-px bg-gray-700 my-2" />
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-gray-400 text-xs">Shooting %</span>
                        <span className="text-blue-400 text-sm">
                          {((hoveredHex.goals / hoveredHex.shotsOnGoal) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : hoveredShot ? (
              <>
                {/* Header - Game Info */}
                {hoveredShot.Player_Team && hoveredShot.Opponent && (
                  <div className="mb-3 pb-2 border-b border-gray-700 flex items-start justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">
                        {String(hoveredShot.Player_Team)} vs {String(hoveredShot.Opponent)}
                      </div>
                      {hoveredShot.Game_Date && (
                        <div className="text-gray-400 text-xs mt-1">
                          {hoveredShot.Game_Date}
                        </div>
                      )}
                    </div>
                    {/* Shot Result - Top Right */}
                    <div className={`font-bold text-sm ${
                      hoveredShot.Is_Goal === 1 ? 'text-blue-500' : 
                      hoveredShot.Is_SOG === 1 && hoveredShot.Is_Goal === 0 ? 'text-green-500' :
                      hoveredShot.Is_Missed === 1 ? 'text-yellow-500' : 'text-orange-500'
                    }`}>
                      {hoveredShot.Is_Goal === 1 ? 'Goal' : 
                       hoveredShot.Is_SOG === 1 ? 'Shot on Goal' :
                       hoveredShot.Is_Missed === 1 ? 'Missed' : 'Blocked'}
                    </div>
                  </div>
                )}
                
                {/* Shot Details */}
                <div className="space-y-2">
                  
                  {hoveredShot.Shot_Type && (
                    <div className="flex justify-between items-center gap-6">
                      <span className="text-gray-400 text-xs">Shot Type</span>
                      <span className="text-white font-bold text-sm">
                        {String(hoveredShot.Shot_Type).charAt(0).toUpperCase() + String(hoveredShot.Shot_Type).slice(1).toLowerCase()}
                      </span>
                    </div>
                  )}
                  
                  {hoveredShot.Strength && (
                    <div className="flex justify-between items-center gap-6">
                      <span className="text-gray-400 text-xs">Strength</span>
                      <span className="text-gray-300 text-sm">{String(hoveredShot.Strength)}</span>
                    </div>
                  )}
                  
                  {hoveredShot.Dist_To_Net_Ft !== undefined && hoveredShot.Dist_To_Net_Ft !== null && (
                    <div className="flex justify-between items-center gap-6">
                      <span className="text-gray-400 text-xs">Distance</span>
                      <span className="text-gray-300 text-sm">{Number(hoveredShot.Dist_To_Net_Ft).toFixed(1)} ft</span>
                    </div>
                  )}
                  
                  {hoveredShot.Goalie_Name && (
                    <>
                      <div className="h-px bg-gray-700 my-2" />
                      <div className="flex justify-between items-center gap-6">
                        <span className="text-gray-400 text-xs">Goalie</span>
                        <span className="text-gray-300 text-sm">{String(hoveredShot.Goalie_Name)}</span>
                      </div>
                    </>
                  )}
                  
                  {hoveredShot.Period !== undefined && hoveredShot.Time && (
                    <div className="flex justify-between items-center gap-6">
                      <span className="text-gray-400 text-xs">Period/Time</span>
                      <span className="text-blue-400 text-sm">P{String(hoveredShot.Period)} - {String(hoveredShot.Time)}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 text-center flex items-center justify-center h-[148px]">
                {viewMode === 'zones' ? 'Hover over a zone to see detailed statistics' : viewMode === 'heatmap' ? 'Hover over a hexagon to see zone statistics' : 'Hover over a shot to see details'}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-xs flex-wrap items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
            <span>Goals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Shots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Blocked</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="text-xs text-muted-foreground mt-2">
          Blocked: {blocked} | Missed: {missed}
        </div>
      </CardContent>
    </Card>
  )
}

