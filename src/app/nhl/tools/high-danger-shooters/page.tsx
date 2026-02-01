"use client"

import * as React from "react"
import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ArrowDown, ArrowUp, ChevronUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface GamelogRow {
  season_id: string | null
  game_id: string | null
  game_date: string | null
  player_id: number | null
  player_name: string | null
  Pos: string | null
  Headshot_URL: string | null
  player_team_abbrev: string | null
  opp: string | null
  venue: string | null
  shots_on_goal: number | null
  corsi: number | null
  sog_HD: number | null
  sat_HD: number | null
  goals: number | null
  goals_HD: number | null
  next_opponent: string | null
  next_venue: string | null
}

interface AggregatedPlayer {
  player_id: number | null
  player_name: string
  player_team_abbrev: string | null
  Headshot_URL: string | null
  Pos: string | null
  next_opponent: string | null
  next_venue: string | null
  gp: number
  shots: number
  shots_per_game: number
  attempts: number
  hd_shots: number
  hd_attempts: number
  hd_pct: number
  avg_hd_shots: number
  last5Games: Array<{ hd_shots: number; goals: number; game_date: string }>
}

type SortField = 'player_name' | 'player_team_abbrev' | 'Pos' | 'gp' | 'shots' | 'attempts' | 'hd_shots' | 'hd_attempts' | 'hd_pct'
type SortDirection = 'asc' | 'desc'

// Helper function for NHL team logos
const getNHLTeamLogo = (abbrev: string | null): string => {
  if (!abbrev) return '/Images/League_Logos/NHL-Logo.png'
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

export default function HighDangerShootersPage() {
  const [allData, setAllData] = useState<GamelogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [timeFilter, setTimeFilter] = useState<'20252026' | 'lastN'>('20252026')
  const [lastNGames, setLastNGames] = useState<number>(10)
  const [players, setPlayers] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])
  const [playerSearch, setPlayerSearch] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [positionSearch, setPositionSearch] = useState('')
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false)
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)
  const [showPerGame, setShowPerGame] = useState<boolean>(false)

  // Sort state
  const [sortField, setSortField] = useState<SortField>('hd_shots')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/nhl/high-danger-shooters')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load data')
        if (!('data' in json)) throw new Error('Invalid response format')
        
        setAllData(json.data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load High Danger Shooters data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const uniquePlayers = Array.from(new Set(allData.map(r => r.player_name).filter(Boolean))) as string[]
    const uniqueTeams = Array.from(new Set(allData.map(r => r.player_team_abbrev).filter(Boolean))) as string[]
    const uniquePositions = Array.from(new Set(allData.map(r => r.Pos).filter(Boolean))) as string[]
    
    return {
      players: uniquePlayers.sort(),
      teams: uniqueTeams.sort(),
      positions: uniquePositions.sort(),
    }
  }, [allData])

  // Filtered options for dropdown based on search
  const filteredPlayers = useMemo(() => {
    if (!playerSearch) return []
    return filterOptions.players.filter(p => 
      p.toLowerCase().includes(playerSearch.toLowerCase())
    ).slice(0, 10)
  }, [playerSearch, filterOptions.players])

  const filteredTeams = useMemo(() => {
    if (!teamSearch) return []
    return filterOptions.teams.filter(t => 
      t.toLowerCase().includes(teamSearch.toLowerCase())
    ).slice(0, 10)
  }, [teamSearch, filterOptions.teams])


  // Pre-filter games (memoized to avoid re-filtering on every render)
  const filteredGames = useMemo(() => {
    let filtered = allData

    // Apply player/team/position filters first (cheapest filters)
    if (players.length) {
      const playerSet = new Set(players)
      filtered = filtered.filter(game => game.player_name && playerSet.has(game.player_name))
    }
    if (teams.length) {
      const teamSet = new Set(teams)
      filtered = filtered.filter(game => game.player_team_abbrev && teamSet.has(game.player_team_abbrev))
    }
    if (positions.length) {
      const positionSet = new Set(positions)
      filtered = filtered.filter(game => game.Pos && positionSet.has(game.Pos))
    }

    return filtered
  }, [allData, players, teams, positions])

  // Pre-sort games by date for efficient "last N" filtering
  const sortedGamesByPlayer = useMemo(() => {
    const gamesByPlayer = new Map<string, GamelogRow[]>()
    
    for (const game of filteredGames) {
      const playerName = game.player_name
      if (!playerName) continue
      
      if (!gamesByPlayer.has(playerName)) {
        gamesByPlayer.set(playerName, [])
      }
      gamesByPlayer.get(playerName)!.push(game)
    }

    // Sort each player's games by date (most recent first)
    for (const games of gamesByPlayer.values()) {
      games.sort((a, b) => {
        const dateA = new Date(a.game_date || '').getTime()
        const dateB = new Date(b.game_date || '').getTime()
        return dateB - dateA
      })
    }

    return gamesByPlayer
  }, [filteredGames])

  // Aggregate and filter data
  const filteredAggregated = useMemo(() => {
    if (filteredGames.length === 0) return []

    const playerMap = new Map<string, AggregatedPlayer>()

    // Determine which games to use for each player
    for (const [playerName, games] of sortedGamesByPlayer.entries()) {
      let gamesToUse: GamelogRow[]
      
      if (timeFilter === 'lastN') {
        gamesToUse = games.slice(0, lastNGames)
      } else {
        gamesToUse = games
      }

      if (gamesToUse.length === 0) continue

      const firstGame = gamesToUse[0]
      
      // Initialize player if not exists
      if (!playerMap.has(playerName)) {
        playerMap.set(playerName, {
          player_id: firstGame.player_id,
          player_name: playerName,
          player_team_abbrev: firstGame.player_team_abbrev,
          Headshot_URL: firstGame.Headshot_URL,
          Pos: firstGame.Pos,
          next_opponent: firstGame.next_opponent,
          next_venue: firstGame.next_venue,
          gp: 0,
          shots: 0,
          shots_per_game: 0,
          attempts: 0,
          hd_shots: 0,
          hd_attempts: 0,
          hd_pct: 0,
          avg_hd_shots: 0,
          last5Games: []
        })
      }

      const player = playerMap.get(playerName)!

      // Aggregate stats from games
      for (const game of gamesToUse) {
        player.gp++
        player.shots += game.shots_on_goal || 0
        player.attempts += game.corsi || 0
        player.hd_shots += game.sog_HD || 0
        player.hd_attempts += game.sat_HD || 0
      }

      // Calculate per-game stats
      if (player.gp > 0) {
        player.shots_per_game = player.shots / player.gp
        player.avg_hd_shots = player.hd_shots / player.gp
        player.hd_pct = player.shots > 0 ? player.hd_shots / player.shots : 0
      }

      // Get last 5 games (already sorted by date)
      player.last5Games = games.slice(0, 5).map(game => ({
        hd_shots: game.sog_HD || 0,
        goals: game.goals || 0,
        game_date: game.game_date || ''
      }))
    }

    // Convert to array and sort
    const aggregated = Array.from(playerMap.values())
    
    aggregated.sort((a, b) => {
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

    return aggregated
  }, [sortedGamesByPlayer, timeFilter, lastNGames, sortField, sortDirection])

  const clearAll = useCallback(() => {
    setPlayers([])
    setTeams([])
    setPositions([])
    setPlayerSearch('')
    setTeamSearch('')
    setPositionSearch('')
    setTimeFilter('20252026')
    setLastNGames(10)
  }, [])

  const handleSort = useCallback((field: SortField) => {
    setSortField(prevField => {
      if (prevField === field) {
        setSortDirection(prevDir => prevDir === 'asc' ? 'desc' : 'asc')
        return prevField
      } else {
        setSortDirection('desc')
        return field
      }
    })
  }, [])

  const SortButton = ({ field, children, currentSortField, currentSortDirection }: { 
    field: SortField
    children: React.ReactNode
    currentSortField: SortField
    currentSortDirection: SortDirection
  }) => {
    const isActive = currentSortField === field
    const isAsc = currentSortDirection === 'asc'
    
    return (
      <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-auto p-0 font-bold justify-start hover:text-primary hover:bg-transparent">
        {children}
        {isActive && (isAsc ? <ArrowDown className="ml-1 h-3 w-3 text-primary"/> : <ArrowUp className="ml-1 h-3 w-3 text-primary"/>)}
      </Button>
    )
  }

  const formatNumber = useCallback((val: number | null) => val == null ? '-' : val.toFixed(val % 1 === 0 ? 0 : 2), [])
  const formatPercent = useCallback((val: number | null) => val == null ? '-' : `${(val * 100).toFixed(1)}%`, [])

  const formatNextOpp = useCallback((opponent: string | null, venue: string | null) => {
    if (!opponent) return '-'
    const prefix = venue === 'Away' ? '@' : 'vs'
    return `${prefix} ${opponent}`
  }, [])

  if (loading) return <div className="p-6">Loading High Danger Shooters data...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="flex flex-col h-[calc(100vh-3rem-3rem)] gap-6">
      <Card className="border-2 shadow-lg flex-1 flex flex-col min-h-0" id="high-danger-shooters-card">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-2xl font-bold">High Danger Shooters</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col min-h-0 gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Players Filter */}
              <div className="space-y-2 min-w-[220px] relative">
                <Label className="text-sm font-semibold text-foreground">Players</Label>
                <div className="relative">
                  <Input
                    placeholder="Search players..."
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value)
                      setShowPlayerDropdown(true)
                    }}
                    onFocus={() => setShowPlayerDropdown(true)}
                    className="w-full"
                  />
                  {showPlayerDropdown && filteredPlayers.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredPlayers.map((player) => (
                        <div
                          key={player}
                          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                          onClick={() => {
                            if (players.includes(player)) {
                              setPlayers(players.filter(p => p !== player))
                            } else {
                              setPlayers([...players, player])
                            }
                            setPlayerSearch('')
                            setShowPlayerDropdown(false)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={players.includes(player)}
                              onChange={() => {}}
                              className="h-4 w-4"
                            />
                            <span>{player}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {players.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {players.map((player) => (
                      <span
                        key={player}
                        className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {player}
                        <button
                          onClick={() => setPlayers(players.filter(p => p !== player))}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Teams Filter */}
              <div className="space-y-2 min-w-[220px]">
                <Label className="text-sm font-semibold text-foreground">Teams</Label>
                <div className="relative">
                  <Input
                    placeholder="Search teams..."
                    value={teamSearch}
                    onChange={(e) => {
                      setTeamSearch(e.target.value)
                      setShowTeamDropdown(true)
                    }}
                    onFocus={() => setShowTeamDropdown(true)}
                    className="w-full"
                  />
                  {showTeamDropdown && filteredTeams.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredTeams.map((team) => (
                        <div
                          key={team}
                          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                          onClick={() => {
                            if (teams.includes(team)) {
                              setTeams(teams.filter(t => t !== team))
                            } else {
                              setTeams([...teams, team])
                            }
                            setTeamSearch('')
                            setShowTeamDropdown(false)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={teams.includes(team)}
                              onChange={() => {}}
                              className="h-4 w-4"
                            />
                            <span>{team}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {teams.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teams.map((team) => (
                      <span
                        key={team}
                        className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {team}
                        <button
                          onClick={() => setTeams(teams.filter(t => t !== team))}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Positions Filter */}
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

              {/* Last N Games Input - Always visible */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">Last # Games</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setLastNGames(Math.max(1, lastNGames - 1))
                      setTimeFilter('lastN')
                    }}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={lastNGames}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setLastNGames(Math.max(1, val))
                      setTimeFilter('lastN')
                    }}
                    className="h-7 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setLastNGames(lastNGames + 1)
                      setTimeFilter('lastN')
                    }}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-semibold text-foreground">Per Game</Label>
                <input
                  type="checkbox"
                  checked={showPerGame}
                  onChange={(e) => setShowPerGame(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>
              <Button variant="outline" size="sm" onClick={clearAll} className="border-2 font-medium hover:bg-destructive/10 hover:border-destructive/50">
                Clear
              </Button>
            </div>
          </div>

          {/* Table */}
          <ScrollArea className="flex-1 border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/95 backdrop-blur-sm sticky top-0 z-10">
                <tr>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="player_name" currentSortField={sortField} currentSortDirection={sortDirection}>Player</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="player_team_abbrev" currentSortField={sortField} currentSortDirection={sortDirection}>Team</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Next Opp
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="Pos" currentSortField={sortField} currentSortDirection={sortDirection}>Pos</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="gp" currentSortField={sortField} currentSortDirection={sortDirection}>GP</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="shots" currentSortField={sortField} currentSortDirection={sortDirection}>Shots</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="attempts" currentSortField={sortField} currentSortDirection={sortDirection}>Att</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider bg-red-500/20">
                    <SortButton field="hd_shots" currentSortField={sortField} currentSortDirection={sortDirection}>HD Shots</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hd_attempts" currentSortField={sortField} currentSortDirection={sortDirection}>HD Att</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hd_pct" currentSortField={sortField} currentSortDirection={sortDirection}>HD%</SortButton>
                  </th>
                  <th className="text-center p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider" colSpan={5}>
                    Last 5 Games
                  </th>
                </tr>
                <tr className="border-b border-border/50">
                  <th colSpan={10} className="p-0"></th>
                  <th className="text-center p-1 text-xs font-semibold text-muted-foreground w-[60px]">5</th>
                  <th className="text-center p-1 text-xs font-semibold text-muted-foreground w-[60px]">4</th>
                  <th className="text-center p-1 text-xs font-semibold text-muted-foreground w-[60px]">3</th>
                  <th className="text-center p-1 text-xs font-semibold text-muted-foreground w-[60px]">2</th>
                  <th className="text-center p-1 text-xs font-semibold text-muted-foreground w-[60px]">1</th>
                </tr>
              </thead>
              <tbody>
                {filteredAggregated.map((row) => (
                  <TableRow 
                    key={row.player_id || row.player_name} 
                    row={row} 
                    showPerGame={showPerGame} 
                    formatNumber={formatNumber} 
                    formatPercent={formatPercent} 
                    formatNextOpp={formatNextOpp} 
                  />
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

// Memoized table row component for better performance
const TableRow = React.memo(({ 
  row, 
  showPerGame, 
  formatNumber, 
  formatPercent, 
  formatNextOpp 
}: { 
  row: AggregatedPlayer
  showPerGame: boolean
  formatNumber: (val: number | null) => string
  formatPercent: (val: number | null) => string
  formatNextOpp: (opponent: string | null, venue: string | null) => string
}) => {
  const posMapping: { [key: string]: string } = {
    'C': 'C',
    'L': 'LW',
    'R': 'RW',
    'D': 'D'
  }

  return (
    <tr className="border-b border-border/50 hover:bg-muted/30">
      <td className="p-2">
        <div className="flex items-center gap-2">
          {row.Headshot_URL ? (
            <Image
              src={row.Headshot_URL}
              alt={row.player_name}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">
              {row.player_name.charAt(0)}
            </div>
          )}
          <Link
            href={`/nhl/prop-lab/${row.player_id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            {row.player_name}
          </Link>
        </div>
      </td>
      <td className="p-2">
        {row.player_team_abbrev && (
          <Image
            src={getNHLTeamLogo(row.player_team_abbrev)}
            alt={row.player_team_abbrev}
            width={24}
            height={24}
          />
        )}
      </td>
      <td className="p-2 text-sm font-medium text-foreground">
        {formatNextOpp(row.next_opponent, row.next_venue)}
      </td>
      <td className="p-2 text-sm font-medium text-foreground">
        {row.Pos ? (posMapping[row.Pos] || row.Pos) : '-'}
      </td>
      <td className="p-2 text-sm font-semibold text-foreground">{formatNumber(row.gp)}</td>
      <td className="p-2 text-sm font-medium text-foreground">
        {showPerGame ? formatNumber(row.shots_per_game) : formatNumber(row.shots)}
      </td>
      <td className="p-2 text-sm font-medium text-foreground">
        {showPerGame ? (row.gp > 0 ? formatNumber(row.attempts / row.gp) : '-') : formatNumber(row.attempts)}
      </td>
      <td className="p-2 text-sm font-medium text-foreground bg-red-500/20">
        {showPerGame ? formatNumber(row.avg_hd_shots) : formatNumber(row.hd_shots)}
      </td>
      <td className="p-2 text-sm font-medium text-foreground">
        {showPerGame ? (row.gp > 0 ? formatNumber(row.hd_attempts / row.gp) : '-') : formatNumber(row.hd_attempts)}
      </td>
      <td className="p-2 text-sm font-medium text-foreground">{formatPercent(row.hd_pct)}</td>
      {[4, 3, 2, 1, 0].map((i) => {
        const game = row.last5Games[i]
        if (!game) {
          return <td key={i} className="p-2 text-center text-sm text-muted-foreground w-[60px]">-</td>
        }
        return (
          <td key={i} className={`p-2 text-center text-sm font-medium w-[60px] ${game.goals > 0 ? 'text-red-500' : 'text-foreground'}`}>
            {game.hd_shots}
          </td>
        )
      })}
    </tr>
  )
})

TableRow.displayName = 'TableRow'

