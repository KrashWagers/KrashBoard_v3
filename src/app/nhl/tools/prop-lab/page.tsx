"use client"

import * as React from "react"
import { useEffect, useMemo, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Check, Filter, Heart, ArrowDown, ArrowUp, Square } from "lucide-react"
import Image from "next/image"

interface NHLProp {
  unique_id: string
  event_id: string
  commence_time_utc: string | null
  home_team: string | null
  away_team: string | null
  kw_player_name: string | null
  kw_player_id: string | null
  O_U: string | null
  line: number | null
  prop_name: string | null
  is_alternate: number
  bookmaker: string | null
  price_american: number | null
  implied_win_pct: number | null
  espn_headshot: string | null
  hit_2025: number | null
  hit_2024: number | null
  hit_L30: number | null
  hit_L10: number | null
  hit_L5: number | null
  n_L30: number | null
  n_L10: number | null
  n_L5: number | null
  streak: number | null
  all_books: { bookmaker: string | null; price_american: number | null; implied_win_pct: number | null; fetch_ts_utc: string | null }[]
}

interface FilterOptions {
  players: string[]
  props: string[]
  games: string[]
  sportsbooks: string[]
}

type SortField = 'odds' | 'implied' | 'streak' | 'hitL10' | 'hitL5' | 'hitL30' | 'hit2025' | 'hit2024' | 'line' | 'player' | 'prop'
type SortDirection = 'asc' | 'desc'

export default function NHLPropLabPage() {
  const router = useRouter()
  const [allData, setAllData] = useState<NHLProp[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ players: [], props: [], games: [], sportsbooks: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [players, setPlayers] = useState<string[]>([])
  const [props, setProps] = useState<string[]>([])
  const [games, setGames] = useState<string[]>([])
  const [matchups, setMatchups] = useState<string[]>([])
  const [sportsbooks, setSportsbooks] = useState<string[]>([])
  const [ou, setOu] = useState<string>('both')
  const [altProps, setAltProps] = useState(false)

  const [playerSearch, setPlayerSearch] = useState('')
  const [propSearch, setPropSearch] = useState('')
  const [gameSearch, setGameSearch] = useState('')
  const [matchupSearch, setMatchupSearch] = useState('')
  const [sportsbookSearch, setSportsbookSearch] = useState('')

  const [minOdds, setMinOdds] = useState<number | null>(null)
  const [maxOdds, setMaxOdds] = useState<number | null>(null)
  const [minLine, setMinLine] = useState<number | null>(null)
  const [maxLine, setMaxLine] = useState<number | null>(null)
  const [minGamesL10, setMinGamesL10] = useState<number | null>(null)

  const [savedProps, setSavedProps] = useState<Set<string>>(new Set())

  const [sortField, setSortField] = useState<SortField>('hitL10')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Track if we've loaded initial filters to avoid saving during initial load
  const filtersLoadedRef = useRef(false)

  // Save filter state to localStorage
  const saveFiltersToStorage = React.useCallback(() => {
    // Only save if we've already loaded the initial filters
    if (!filtersLoadedRef.current) return
    
    const filterState = {
      players,
      props,
      games,
      matchups,
      sportsbooks,
      ou,
      altProps,
      minOdds,
      maxOdds,
      minLine,
      maxLine,
      minGamesL10,
      sortField,
      sortDirection
    }
    localStorage.setItem('nhlPropLabFilters', JSON.stringify(filterState))
  }, [players, props, games, matchups, sportsbooks, ou, altProps, minOdds, maxOdds, minLine, maxLine, minGamesL10, sortField, sortDirection])

  // Load filter state from localStorage
  const loadFiltersFromStorage = () => {
    try {
      const stored = localStorage.getItem('nhlPropLabFilters')
      if (stored) {
        const filterState = JSON.parse(stored)
        if (filterState.players) setPlayers(filterState.players)
        if (filterState.props) setProps(filterState.props)
        if (filterState.games) setGames(filterState.games)
        if (filterState.matchups) setMatchups(filterState.matchups)
        if (filterState.sportsbooks) setSportsbooks(filterState.sportsbooks)
        if (filterState.ou) setOu(filterState.ou)
        if (filterState.altProps !== undefined) setAltProps(filterState.altProps)
        if (filterState.minOdds !== undefined) setMinOdds(filterState.minOdds)
        if (filterState.maxOdds !== undefined) setMaxOdds(filterState.maxOdds)
        if (filterState.minLine !== undefined) setMinLine(filterState.minLine)
        if (filterState.maxLine !== undefined) setMaxLine(filterState.maxLine)
        if (filterState.minGamesL10 !== undefined) setMinGamesL10(filterState.minGamesL10)
        if (filterState.sortField) setSortField(filterState.sortField)
        if (filterState.sortDirection) setSortDirection(filterState.sortDirection)
      }
    } catch (e) {
      console.error('Failed to load filters from storage:', e)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [filtersRes, firstPage] = await Promise.all([
          fetch('/api/nhl/props/filters'),
          fetch('/api/nhl/props?page=1&limit=10000'),
        ])
        const filtersJson = await filtersRes.json()
        const dataJson = await firstPage.json()
        if (!filtersRes.ok) throw new Error('Failed to load filters')
        if (!('data' in dataJson)) throw new Error('Failed to load props')
        setFilterOptions(filtersJson)
        setAllData(dataJson.data)
        
        // Load saved filters after data is loaded
        loadFiltersFromStorage()
        // Mark filters as loaded so we can start saving changes
        filtersLoadedRef.current = true
      } catch (e: any) {
        setError(e?.message || 'Failed to load NHL props')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Save filters to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (filtersLoadedRef.current && !loading) {
      saveFiltersToStorage()
    }
  }, [saveFiltersToStorage, loading])

  const filteredGrouped = useMemo(() => {
    let rows = allData
    rows = rows.filter(r => {
      if (players.length && (!r.kw_player_name || !players.includes(r.kw_player_name))) return false
      if (props.length && (!r.prop_name || !props.includes(r.prop_name))) return false
      if (games.length) {
        const g = `${r.away_team} @ ${r.home_team}`
        if (!games.includes(g)) return false
      }
      if (matchups.length) {
        const matchup = `${getTeamAbbreviation(r.away_team)} @ ${getTeamAbbreviation(r.home_team)}`
        if (!matchups.includes(matchup)) return false
      }
      if (sportsbooks.length && (!r.bookmaker || !sportsbooks.includes(r.bookmaker))) return false
      if (ou !== 'both') {
        if (ou === 'over' && r.O_U !== 'Over') return false
        if (ou === 'under' && r.O_U !== 'Under') return false
      }
      if (!altProps && r.is_alternate === 1) return false
      if (minOdds != null && (r.price_american ?? -999999) < minOdds) return false
      if (maxOdds != null && (r.price_american ?? 999999) > maxOdds) return false
      if (minLine != null && (r.line ?? -999999) < minLine) return false
      if (maxLine != null && (r.line ?? 999999) > maxLine) return false
      if (minGamesL10 != null && (r.n_L10 ?? 0) < minGamesL10) return false
      return true
    })

    const arr = [...rows]
    arr.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      switch (sortField) {
        case 'odds':
          return dir * (((b.price_american ?? 0) - (a.price_american ?? 0)))
        case 'implied':
          return dir * (((b.implied_win_pct ?? 0) - (a.implied_win_pct ?? 0)))
        case 'streak':
          return dir * (((b.streak ?? 0) - (a.streak ?? 0)))
        case 'hitL10':
          return dir * (((b.hit_L10 ?? 0) - (a.hit_L10 ?? 0)))
        case 'hitL5':
          return dir * (((b.hit_L5 ?? 0) - (a.hit_L5 ?? 0)))
        case 'hitL30':
          return dir * (((b.hit_L30 ?? 0) - (a.hit_L30 ?? 0)))
        case 'hit2025':
          return dir * (((b.hit_2025 ?? 0) - (a.hit_2025 ?? 0)))
        case 'hit2024':
          return dir * (((b.hit_2024 ?? 0) - (a.hit_2024 ?? 0)))
        case 'line':
          return dir * (((b.line ?? 0) - (a.line ?? 0)))
        case 'player':
          return dir * ((a.kw_player_name || '').localeCompare(b.kw_player_name || ''))
        case 'prop':
          return dir * ((a.prop_name || '').localeCompare(b.prop_name || ''))
        default:
          return dir * (((b.hit_L10 ?? 0) - (a.hit_L10 ?? 0)))
      }
    })
    return arr
  }, [allData, players, props, games, matchups, sportsbooks, ou, altProps, minOdds, maxOdds, minLine, maxLine, minGamesL10, sortField, sortDirection])

  // Calculate column-specific min/max for hit rate columns
  const columnStats = useMemo(() => {
    const stats = {
      hit2025: { min: 0, max: 0 },
      hit2024: { min: 0, max: 0 },
      hitL30: { min: 0, max: 0 },
      hitL10: { min: 0, max: 0 },
      hitL5: { min: 0, max: 0 },
    }
    
    if (filteredGrouped.length === 0) return stats

    const values2025 = filteredGrouped.map(r => r.hit_2025).filter(v => v != null) as number[]
    const values2024 = filteredGrouped.map(r => r.hit_2024).filter(v => v != null) as number[]
    const valuesL30 = filteredGrouped.map(r => r.hit_L30).filter(v => v != null) as number[]
    const valuesL10 = filteredGrouped.map(r => r.hit_L10).filter(v => v != null) as number[]
    const valuesL5 = filteredGrouped.map(r => r.hit_L5).filter(v => v != null) as number[]

    if (values2025.length > 0) {
      stats.hit2025.min = Math.min(...values2025)
      stats.hit2025.max = Math.max(...values2025)
    }
    if (values2024.length > 0) {
      stats.hit2024.min = Math.min(...values2024)
      stats.hit2024.max = Math.max(...values2024)
    }
    if (valuesL30.length > 0) {
      stats.hitL30.min = Math.min(...valuesL30)
      stats.hitL30.max = Math.max(...valuesL30)
    }
    if (valuesL10.length > 0) {
      stats.hitL10.min = Math.min(...valuesL10)
      stats.hitL10.max = Math.max(...valuesL10)
    }
    if (valuesL5.length > 0) {
      stats.hitL5.min = Math.min(...valuesL5)
      stats.hitL5.max = Math.max(...valuesL5)
    }

    return stats
  }, [filteredGrouped])

  const clearAll = () => {
    setPlayers([]); setProps([]); setGames([]); setMatchups([]); setSportsbooks([]); setOu('both'); setAltProps(false)
    setMinOdds(null); setMaxOdds(null); setMinLine(null); setMaxLine(null); setMinGamesL10(null)
    // Clear from localStorage as well
    localStorage.removeItem('nhlPropLabFilters')
  }

  // Handle row click to navigate to player prop dashboard
  const handleRowClick = (item: NHLProp) => {
    // Save current filter state before navigating
    saveFiltersToStorage()
    
    // Store prop info in sessionStorage for the dashboard to use
    const propInfo = {
      propName: item.prop_name,
      line: item.line,
      ou: item.O_U,
      playerId: item.kw_player_id,
      playerName: item.kw_player_name
    }
    sessionStorage.setItem('selectedNHLProp', JSON.stringify(propInfo))
    
    // Navigate to player dashboard
    router.push(`/nhl/prop-lab/${item.kw_player_id}`)
  }

  const formatPct = (v: number | null) => v == null ? '-' : `${Math.round(v * 100)}%`

  const getHitRateBadgeStyle = (hitRate: number | null, columnType: 'hit2025' | 'hit2024' | 'hitL30' | 'hitL10' | 'hitL5') => {
    if (hitRate == null) return 'bg-muted border-border text-muted-foreground'
    
    const stats = columnStats[columnType]
    const range = stats.max - stats.min
    
    // If all values are the same, treat as neutral
    if (range === 0) {
      return 'bg-yellow-500/20 dark:bg-yellow-500/30 border-yellow-500 dark:border-yellow-500 text-yellow-700 dark:text-yellow-400'
    }
    
    // Calculate relative position (0 = min, 1 = max)
    const relativePosition = (hitRate - stats.min) / range
    
    // Map relative position to color thresholds
    // Top 30% = green, next 30% = yellow, next 30% = orange, bottom 10% = red
    if (relativePosition >= 0.7) return 'bg-green-500/20 dark:bg-green-500/30 border-green-500 dark:border-green-500 text-green-700 dark:text-green-400'
    if (relativePosition >= 0.4) return 'bg-yellow-500/20 dark:bg-yellow-500/30 border-yellow-500 dark:border-yellow-500 text-yellow-700 dark:text-yellow-400'
    if (relativePosition >= 0.1) return 'bg-orange-500/20 dark:bg-orange-500/30 border-orange-500 dark:border-orange-500 text-orange-700 dark:text-orange-400'
    return 'bg-red-500/20 dark:bg-red-500/30 border-red-500 dark:border-red-500 text-red-700 dark:text-red-400'
  }

  const getTeamAbbreviation = (teamName: string | null) => {
    if (!teamName) return 'N/A'
    const teamAbbreviations: { [key: string]: string } = {
      'Anaheim Ducks': 'ANA',
      'Arizona Coyotes': 'ARI',
      'Boston Bruins': 'BOS',
      'Buffalo Sabres': 'BUF',
      'Calgary Flames': 'CGY',
      'Carolina Hurricanes': 'CAR',
      'Chicago Blackhawks': 'CHI',
      'Colorado Avalanche': 'COL',
      'Columbus Blue Jackets': 'CBJ',
      'Dallas Stars': 'DAL',
      'Detroit Red Wings': 'DET',
      'Edmonton Oilers': 'EDM',
      'Florida Panthers': 'FLA',
      'Los Angeles Kings': 'LAK',
      'Minnesota Wild': 'MIN',
      'Montreal Canadiens': 'MTL',
      'Montréal Canadiens': 'MTL', // Handle accent
      'Nashville Predators': 'NSH',
      'New Jersey Devils': 'NJD',
      'New York Islanders': 'NYI',
      'New York Rangers': 'NYR',
      'Ottawa Senators': 'OTT',
      'Philadelphia Flyers': 'PHI',
      'Pittsburgh Penguins': 'PIT',
      'San Jose Sharks': 'SJ',
      'Seattle Kraken': 'SEA',
      'St. Louis Blues': 'STL',
      'Tampa Bay Lightning': 'TB',
      'Toronto Maple Leafs': 'TOR',
      'Vancouver Canucks': 'VAN',
      'Vegas Golden Knights': 'VGK',
      'Washington Capitals': 'WSH',
      'Winnipeg Jets': 'WPG'
    }
    return teamAbbreviations[teamName] || teamName
  }

  const getBookmakerLogo = (bookmaker: string | null) => {
    if (!bookmaker) return '/Images/Sportsbook_Logos/Icon.png'
    const bookmakerMap: { [key: string]: string } = {
      'DraftKings': '/Images/Sportsbook_Logos/DraftKingsLogo.png',
      'FanDuel': '/Images/Sportsbook_Logos/fanDuel.jpg',
      'Fanatics': '/Images/Sportsbook_Logos/Fanatics.jpeg',
      'Bet365': '/Images/Sportsbook_Logos/bet365.png',
      'BetRivers': '/Images/Sportsbook_Logos/betriverslogo.png',
      'Caesars Sportsbook': '/Images/Sportsbook_Logos/caesars-logo.png',
      'BetMGM': '/Images/Sportsbook_Logos/betmgm.png',
      'BetOnline': '/Images/Sportsbook_Logos/betonline.jpg',
      'Bally Bet': '/Images/Sportsbook_Logos/bally_bet.jpg',
      'ESPN Bet': '/Images/Sportsbook_Logos/ESPN-BET-Logo-Secondary.jpg',
      'Fliff': '/Images/Sportsbook_Logos/fliff.png',
      'Hardrock': '/Images/Sportsbook_Logos/hardrock.jpg',
      'Novig': '/Images/Sportsbook_Logos/novig.webp',
      'Pinnacle': '/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg',
      'Prizepicks': '/Images/Sportsbook_Logos/Prizepicks.png',
      'Underdog': '/Images/Sportsbook_Logos/underdogfantasy.webp',
      'Sleeper': '/Images/Sportsbook_Logos/sleeper.jpg',
      'ProphetX': '/Images/Sportsbook_Logos/prophetx.png',
      'Pick6': '/Images/Sportsbook_Logos/pick6.png'
    }
    return bookmakerMap[bookmaker] || '/Images/Sportsbook_Logos/Icon.png'
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-auto p-0 font-bold justify-start hover:text-primary hover:bg-transparent">
      {children}
      {sortField === field && (sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 text-primary"/> : <ArrowDown className="ml-1 h-3 w-3 text-primary"/>)}
    </Button>
  )

  if (loading) return <div className="p-6">Loading NHL props...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="flex flex-col h-[calc(100vh-3rem-3rem)] gap-6">
      <Card className="border-2 shadow-lg flex-shrink-0">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-2xl font-bold">NHL Prop Lab</CardTitle>
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
                        {(filterOptions.players||[]).filter(p=>p.toLowerCase().includes(playerSearch.toLowerCase())).map(p=> (
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
                <Label className="text-sm font-semibold text-foreground">Props</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {props.length === 0 ? 'All Props' : `${props.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <Input placeholder="Search props" value={propSearch} onChange={e=>setPropSearch(e.target.value)} className="mb-2"/>
                      <div className="max-h-60 overflow-y-auto">
                        {(filterOptions.props||[]).filter(p=>p.toLowerCase().includes(propSearch.toLowerCase())).map(p=> (
                          <DropdownMenuCheckboxItem key={p} checked={props.includes(p)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setProps(c?[...props,p]: props.filter(x=>x!==p))}>
                            {p}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 min-w-[220px]">
                <Label className="text-sm font-semibold text-foreground">Matchups</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {matchups.length === 0 ? 'All Matchups' : `${matchups.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <Input placeholder="Search matchups" value={matchupSearch} onChange={e=>setMatchupSearch(e.target.value)} className="mb-2"/>
                      <div className="max-h-60 overflow-y-auto">
                        {Array.from(new Set(allData.map(r => 
                          `${getTeamAbbreviation(r.away_team)} @ ${getTeamAbbreviation(r.home_team)}`
                        ))).filter(m=>m.toLowerCase().includes(matchupSearch.toLowerCase())).sort().map(m=> (
                          <DropdownMenuCheckboxItem key={m} checked={matchups.includes(m)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setMatchups(c?[...matchups,m]: matchups.filter(x=>x!==m))}>
                            {m}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 min-w-[220px]">
                <Label className="text-sm font-semibold text-foreground">Sportsbooks</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {sportsbooks.length === 0 ? 'All Sportsbooks' : `${sportsbooks.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <div className="p-2">
                      <Input placeholder="Search sportsbooks" value={sportsbookSearch} onChange={e=>setSportsbookSearch(e.target.value)} className="mb-2"/>
                      <div className="max-h-60 overflow-y-auto">
                        {(filterOptions.sportsbooks||[]).filter(s=>s.toLowerCase().includes(sportsbookSearch.toLowerCase())).map(s=> (
                          <DropdownMenuCheckboxItem key={s} checked={sportsbooks.includes(s)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setSportsbooks(c?[...sportsbooks,s]: sportsbooks.filter(x=>x!==s))}>
                            {s}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 min-w-[180px]">
                <Label className="text-sm font-semibold text-foreground">O/U</Label>
                <select value={ou} onChange={e=>setOu(e.target.value)} className="w-full px-3 py-2 border-2 border-input bg-background rounded-md text-sm font-medium hover:border-primary/50 transition-colors">
                  <option value="both">Both</option>
                  <option value="over">Over</option>
                  <option value="under">Under</option>
                </select>
              </div>

              <div className="space-y-2 min-w-[180px]">
                <Label className="text-sm font-semibold text-foreground">Alt Props</Label>
                <div className="flex items-center gap-3 px-1">
                  <Switch checked={altProps} onCheckedChange={setAltProps}/>
                  <span className="text-sm font-medium text-foreground">Show alternate</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={clearAll} className="border-2 font-medium hover:bg-destructive/10 hover:border-destructive/50">
                Clear
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="border-2 font-medium hover:bg-primary/10 hover:border-primary/50">
                    <Filter className="h-4 w-4 mr-2"/> Advanced
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Advanced Filters</h4>
                    
                    {/* Odds Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Odds Range</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Min</Label>
                          <Input
                            type="number"
                            placeholder="Min odds"
                            value={minOdds || ''}
                            onChange={(e) => setMinOdds(e.target.value ? Number(e.target.value) : null)}
                            className="h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Max</Label>
                          <Input
                            type="number"
                            placeholder="Max odds"
                            value={maxOdds || ''}
                            onChange={(e) => setMaxOdds(e.target.value ? Number(e.target.value) : null)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Line Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Line Range</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Min</Label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="Min line"
                            value={minLine || ''}
                            onChange={(e) => setMinLine(e.target.value ? Number(e.target.value) : null)}
                            className="h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Max</Label>
                          <Input
                            type="number"
                            step="0.5"
                            placeholder="Max line"
                            value={maxLine || ''}
                            onChange={(e) => setMaxLine(e.target.value ? Number(e.target.value) : null)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Min Games L10 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Min Games (L10)</Label>
                      <Input
                        type="number"
                        placeholder="Min games in last 10"
                        value={minGamesL10 || ''}
                        onChange={(e) => setMinGamesL10(e.target.value ? Number(e.target.value) : null)}
                        className="h-8"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-lg flex-1 flex flex-col min-h-0">
        <CardHeader className="bg-muted/30 border-b border-border pb-4 flex-shrink-0">
          <CardTitle className="text-xl font-bold">
            Player Props <span className="text-muted-foreground font-normal">({filteredGrouped.length} total)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full w-full [&>[data-radix-scroll-area-viewport]]:scroll-snap-y [&>[data-radix-scroll-area-viewport]]:scroll-snap-mandatory">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-muted border-b-2 border-border">
                <tr>
                  <th className="text-left p-3 w-12 text-xs font-bold text-muted-foreground uppercase tracking-wider"></th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="player">Player</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Matchup</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Side</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="line">Line</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="prop">Prop</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Book</th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="odds">Odds</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="implied">Implied %</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hit2025">2024-25</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hit2024">2025-26</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hitL30">L30</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hitL10">L10</SortButton>
                  </th>
                  <th className="text-left p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hitL5">L5</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGrouped.map((row) => {
                  const propId = row.unique_id
                  const isSaved = savedProps.has(propId)
                  const others = (row.all_books || []).sort((a,b)=> (b.price_american ?? 0) - (a.price_american ?? 0))
                  return (
                    <tr 
                      key={propId} 
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors duration-150 group scroll-snap-align-start" 
                      onClick={() => handleRowClick(row)}
                    >
                      <td className="p-3">
                        <button 
                          className="p-1.5 hover:bg-muted rounded-md transition-colors" 
                          onClick={(e)=>{e.stopPropagation(); setSavedProps(prev=>{const s=new Set(prev); s.has(propId)?s.delete(propId):s.add(propId); return s})}}
                        >
                          <Heart className={`h-4 w-4 transition-colors ${isSaved? 'fill-red-500 text-red-500':'text-muted-foreground group-hover:text-red-500'}`}/>
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {row.espn_headshot ? (
                            <Image src={row.espn_headshot} alt={row.kw_player_name || ''} width={40} height={40} className="rounded-md"/>
                          ) : (
                            <div className="w-10 h-10 bg-muted border border-border rounded-md flex items-center justify-center text-xs font-semibold text-foreground">
                              {(row.kw_player_name||'').split(' ').map(n=>n[0]).join('')}
                            </div>
                          )}
                          <div className="text-sm font-semibold text-foreground">{row.kw_player_name}</div>
                        </div>
                      </td>
                      <td className="p-3 text-sm font-medium text-foreground">
                        {row.away_team && row.home_team ? 
                          `${getTeamAbbreviation(row.away_team)} @ ${getTeamAbbreviation(row.home_team)}` : 
                          <span className="text-muted-foreground">N/A</span>
                        }
                      </td>
                      <td className="p-3 text-sm font-medium text-foreground">{row.O_U}</td>
                      <td className="p-3 text-sm font-semibold text-foreground">{row.line}</td>
                      <td className="p-3 text-sm font-medium text-foreground">{row.prop_name}</td>
                      <td className="p-3">
                        <Image 
                          src={getBookmakerLogo(row.bookmaker)} 
                          alt={row.bookmaker || 'Unknown'} 
                          width={28} 
                          height={28} 
                          className="rounded-md border border-border"
                        />
                      </td>
                      <td className="p-3">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="link" className="h-auto p-0 text-sm font-semibold text-foreground hover:text-primary">
                              {row.price_american != null && row.price_american > 0 ? '+' : ''}{row.price_american}
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 border-2">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm mb-2">All Books</div>
                              {(others||[]).map((o, i)=> (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                                  <span className="text-sm font-medium text-foreground">{o.bookmaker}</span>
                                  <span className="text-sm font-semibold text-foreground">{o.price_american != null && o.price_american > 0 ? '+' : ''}{o.price_american}</span>
                                </div>
                              ))}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="p-3 text-sm font-semibold text-foreground">{formatPct(row.implied_win_pct)}</td>
                      <td className="p-3">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_2025, 'hit2025')}`}>
                          {formatPct(row.hit_2025)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_2024, 'hit2024')}`}>
                          {formatPct(row.hit_2024)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_L30, 'hitL30')}`}>
                          {formatPct(row.hit_L30)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_L10, 'hitL10')}`}>
                          {formatPct(row.hit_L10)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_L5, 'hitL5')}`}>
                          {formatPct(row.hit_L5)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}



