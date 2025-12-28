"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ArrowDown, ArrowUp } from "lucide-react"

interface PlayerVsOppRow {
  game_id: string | null
  game_date: string | null
  team_abbr: string | null
  opponent_abbr: string | null
  player_id: number | null
  full_name: string | null
  position_code: string | null
  position_name: string | null
  jersey_number: string | null
  shoots_catches: string | null
  gp_vs_opp: number | null
  goals_vs_opp: number | null
  assists_vs_opp: number | null
  points_vs_opp: number | null
  shots_on_goal_vs_opp: number | null
  corsi_vs_opp: number | null
  first_goal_scorer_vs_opp: number | null
  last_goal_scorer_vs_opp: number | null
  pp_goals_vs_opp: number | null
  pp_assists_vs_opp: number | null
  pp_points_vs_opp: number | null
  goals_per_game_vs_opp: number | null
  assists_per_game_vs_opp: number | null
  points_per_game_vs_opp: number | null
  shots_on_goal_per_game_vs_opp: number | null
  corsi_per_game_vs_opp: number | null
  pp_goals_per_game_vs_opp: number | null
  pp_assists_per_game_vs_opp: number | null
  pp_points_per_game_vs_opp: number | null
  games_goals_ge1: number | null
  games_goals_ge2: number | null
  games_goals_ge3: number | null
  games_shots_ge1: number | null
  games_shots_ge2: number | null
  games_shots_ge3: number | null
  games_shots_ge4: number | null
  games_shots_ge5: number | null
  games_shots_ge6: number | null
  games_shots_ge7: number | null
  games_assists_ge1: number | null
  games_assists_ge2: number | null
  games_assists_ge3: number | null
  games_points_ge1: number | null
  games_points_ge2: number | null
  games_points_ge3: number | null
  games_points_ge4: number | null
}

type SortField = 'full_name' | 'team_abbr' | 'opponent_abbr' | 'gp_vs_opp' | 'goals_vs_opp' | 'assists_vs_opp' | 'points_vs_opp' | 'shots_on_goal_vs_opp' | 'goals_per_game_vs_opp' | 'points_per_game_vs_opp'
type SortDirection = 'asc' | 'desc'

export default function PlayerVsOppPage() {
  const [allData, setAllData] = useState<PlayerVsOppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [players, setPlayers] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [opponents, setOpponents] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])
  const [playerSearch, setPlayerSearch] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [opponentSearch, setOpponentSearch] = useState('')
  const [positionSearch, setPositionSearch] = useState('')

  // Sort state
  const [sortField, setSortField] = useState<SortField>('full_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/nhl/player-vs-opp?limit=10000')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load data')
        if (!('data' in json)) throw new Error('Invalid response format')
        
        console.log('[Player vs Opp Page] Loaded', json.data.length, 'rows')
        setAllData(json.data)
      } catch (e: any) {
        console.error('[Player vs Opp Page] Error:', e)
        setError(e?.message || 'Failed to load Player vs Opp data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const uniquePlayers = Array.from(new Set(allData.map(r => r.full_name).filter(Boolean))) as string[]
    const uniqueTeams = Array.from(new Set(allData.map(r => r.team_abbr).filter(Boolean))) as string[]
    const uniqueOpponents = Array.from(new Set(allData.map(r => r.opponent_abbr).filter(Boolean))) as string[]
    const uniquePositions = Array.from(new Set(allData.map(r => r.position_code).filter(Boolean))) as string[]
    
    return {
      players: uniquePlayers.sort(),
      teams: uniqueTeams.sort(),
      opponents: uniqueOpponents.sort(),
      positions: uniquePositions.sort(),
    }
  }, [allData])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = allData.filter(r => {
      if (players.length && (!r.full_name || !players.includes(r.full_name))) return false
      if (teams.length && (!r.team_abbr || !teams.includes(r.team_abbr))) return false
      if (opponents.length && (!r.opponent_abbr || !opponents.includes(r.opponent_abbr))) return false
      if (positions.length && (!r.position_code || !positions.includes(r.position_code))) return false
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return dir * aVal.localeCompare(bVal)
      }
      return dir * ((bVal ?? 0) - (aVal ?? 0))
    })

    return filtered
  }, [allData, players, teams, opponents, positions, sortField, sortDirection])

  const clearAll = () => {
    setPlayers([])
    setTeams([])
    setOpponents([])
    setPositions([])
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-auto p-0 font-bold justify-start hover:text-primary hover:bg-transparent">
      {children}
      {sortField === field && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 text-primary"/> : <ArrowDown className="ml-1 h-3 w-3 text-primary"/>)}
    </Button>
  )

  const formatNumber = (val: number | null) => val == null ? '-' : val.toFixed(val % 1 === 0 ? 0 : 2)
  const formatPercent = (val: number | null) => val == null ? '-' : `${(val * 100).toFixed(1)}%`

  if (loading) return <div className="p-6">Loading Player vs Opp data...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="flex flex-col h-[calc(100vh-3rem-3rem)] gap-6">
      <Card className="border-2 shadow-lg flex-shrink-0">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-2xl font-bold">Player vs Opponent</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[220px]">
                <Label className="text-sm font-semibold text-foreground">Players</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {players.length === 0 ? 'All Players' : `${players.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <Input placeholder="Search players" value={playerSearch} onChange={e=>setPlayerSearch(e.target.value)} className="mb-2"/>
                      <div className="max-h-60 overflow-y-auto">
                        {filterOptions.players.filter(p=>p.toLowerCase().includes(playerSearch.toLowerCase())).map(p=> (
                          <DropdownMenuCheckboxItem key={p} checked={players.includes(p)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setPlayers(c?[...players,p]: players.filter(x=>x!==p))}>
                            {p}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 min-w-[220px]">
                <Label className="text-sm font-semibold text-foreground">Teams</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {teams.length === 0 ? 'All Teams' : `${teams.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <Input placeholder="Search teams" value={teamSearch} onChange={e=>setTeamSearch(e.target.value)} className="mb-2"/>
                      <div className="max-h-60 overflow-y-auto">
                        {filterOptions.teams.filter(t=>t.toLowerCase().includes(teamSearch.toLowerCase())).map(t=> (
                          <DropdownMenuCheckboxItem key={t} checked={teams.includes(t)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setTeams(c?[...teams,t]: teams.filter(x=>x!==t))}>
                            {t}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 min-w-[220px]">
                <Label className="text-sm font-semibold text-foreground">Opponents</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {opponents.length === 0 ? 'All Opponents' : `${opponents.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <Input placeholder="Search opponents" value={opponentSearch} onChange={e=>setOpponentSearch(e.target.value)} className="mb-2"/>
                      <div className="max-h-60 overflow-y-auto">
                        {filterOptions.opponents.filter(o=>o.toLowerCase().includes(opponentSearch.toLowerCase())).map(o=> (
                          <DropdownMenuCheckboxItem key={o} checked={opponents.includes(o)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setOpponents(c?[...opponents,o]: opponents.filter(x=>x!==o))}>
                            {o}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 min-w-[220px]">
                <Label className="text-sm font-semibold text-foreground">Positions</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {positions.length === 0 ? 'All Positions' : `${positions.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <Input placeholder="Search positions" value={positionSearch} onChange={e=>setPositionSearch(e.target.value)} className="mb-2"/>
                      <div className="max-h-60 overflow-y-auto">
                        {filterOptions.positions.filter(p=>p.toLowerCase().includes(positionSearch.toLowerCase())).map(p=> (
                          <DropdownMenuCheckboxItem key={p} checked={positions.includes(p)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setPositions(c?[...positions,p]: positions.filter(x=>x!==p))}>
                            {p}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={clearAll} className="border-2 font-medium hover:bg-destructive/10 hover:border-destructive/50">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-lg flex-1 flex flex-col min-h-0">
        <CardHeader className="bg-muted/30 border-b border-border pb-4 flex-shrink-0">
          <CardTitle className="text-xl font-bold">
            Player vs Opponent Stats <span className="text-muted-foreground font-normal">({filteredData.length} total)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full w-full [&>[data-radix-scroll-area-viewport]]:scroll-snap-y [&>[data-radix-scroll-area-viewport]]:scroll-snap-mandatory">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-muted border-b-2 border-border">
                <tr>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="full_name">Player</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="team_abbr">Team</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="opponent_abbr">Opponent</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Pos</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="gp_vs_opp">GP</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="goals_vs_opp">G</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="assists_vs_opp">A</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="points_vs_opp">P</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="shots_on_goal_vs_opp">SOG</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Corsi</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="goals_per_game_vs_opp">G/GP</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="points_per_game_vs_opp">P/GP</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">PP G</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">PP A</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">PP P</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">G≥1</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">G≥2</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">G≥3</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">SOG≥1</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">SOG≥2</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">SOG≥3</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">SOG≥4</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">SOG≥5</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">A≥1</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">A≥2</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">P≥1</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">P≥2</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">P≥3</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr 
                    key={`${row.player_id}-${row.opponent_abbr}-${idx}`}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-150 group scroll-snap-align-start"
                  >
                    <td className="p-3 text-sm font-semibold text-foreground">{row.full_name}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{row.team_abbr}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{row.opponent_abbr}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{row.position_code}</td>
                    <td className="p-3 text-sm font-semibold text-foreground">{formatNumber(row.gp_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.goals_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.assists_vs_opp)}</td>
                    <td className="p-3 text-sm font-semibold text-foreground">{formatNumber(row.points_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.shots_on_goal_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.corsi_vs_opp)}</td>
                    <td className="p-3 text-sm font-semibold text-foreground">{formatNumber(row.goals_per_game_vs_opp)}</td>
                    <td className="p-3 text-sm font-semibold text-foreground">{formatNumber(row.points_per_game_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.pp_goals_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.pp_assists_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.pp_points_vs_opp)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_goals_ge1)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_goals_ge2)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_goals_ge3)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_shots_ge1)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_shots_ge2)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_shots_ge3)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_shots_ge4)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_shots_ge5)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_assists_ge1)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_assists_ge2)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_points_ge1)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_points_ge2)}</td>
                    <td className="p-3 text-sm font-medium text-foreground">{formatNumber(row.games_points_ge3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

