"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Heart
} from "lucide-react"
import Image from "next/image"

interface PlayerProp {
  event_id: string
  commence_time_utc: string
  home_team: string
  away_team: string
  bookmaker: string
  line: number
  line_str: string
  price_american: number
  kw_player_id: string
  kw_player_name: string
  kw_2025_team: string
  position_group: string
  depth_position: string
  espn_headshot: string
  is_alternate: number
  prop_name: string
  O_U: string
  implied_win_pct: number
  team: string
  opponent: string
  venue: string
  hit_2024: number
  hit_2025: number
  hit_L20: number
  hit_L15: number
  hit_L10: number
  hit_L5: number
  streak: number
  outcome_link: string
  gp_2024: number
  gp_2025: number
}

interface FilterOptions {
  players: string[]
  props: string[]
  games: string[]
  sportsbooks: string[]
}

type SortField = 'bestOdds' | 'impliedWinPct' | 'streak' | 'hit2024' | 'hit2025' | 'hitL20' | 'hitL15' | 'hitL10' | 'hitL5'
type SortDirection = 'asc' | 'desc'

export default function PropLabPage() {
  const router = useRouter()
  
  // Data state
  const [allData, setAllData] = useState<PlayerProp[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    players: [],
    props: [],
    games: [],
    sportsbooks: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search state
  const [playerSearch, setPlayerSearch] = useState('')
  const [propSearch, setPropSearch] = useState('')
  const [gameSearch, setGameSearch] = useState('')
  const [sportsbookSearch, setSportsbookSearch] = useState('')

  // Filter state
  const [players, setPlayers] = useState<string[]>([])
  const [props, setProps] = useState<string[]>([])
  const [games, setGames] = useState<string[]>([])
  const [sportsbooks, setSportsbooks] = useState<string[]>([])
  const [ou, setOu] = useState<string>('both')
  const [altProps, setAltProps] = useState(false)

  // Advanced filter state
  const [minOdds, setMinOdds] = useState<number | null>(null)
  const [maxOdds, setMaxOdds] = useState<number | null>(null)
  const [minLine, setMinLine] = useState<number | null>(null)
  const [maxLine, setMaxLine] = useState<number | null>(null)
  const [minGamesPlayed, setMinGamesPlayed] = useState<number | null>(null)
  const [maxGamesPlayed, setMaxGamesPlayed] = useState<number | null>(null)

  // Betslip state
  const [savedProps, setSavedProps] = useState<Set<string>>(new Set())

  // Clear all filters
  const clearAllFilters = () => {
    setPlayers([])
    setProps([])
    setGames([])
    setSportsbooks([])
    setOu('both')
    setAltProps(false)
    setMinOdds(null)
    setMaxOdds(null)
    setMinLine(null)
    setMaxLine(null)
    setMinGamesPlayed(null)
    setMaxGamesPlayed(null)
  }

  // Toggle prop save state
  const togglePropSave = (propId: string) => {
    setSavedProps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(propId)) {
        newSet.delete(propId)
      } else {
        newSet.add(propId)
      }
      return newSet
    })
  }

  // Handle row click to navigate to player prop dashboard
  const handleRowClick = (item: PlayerProp) => {
    // Store prop info in sessionStorage for the dashboard to use
    const propInfo = {
      propName: item.prop_name,
      line: item.line,
      ou: item.O_U,
      playerId: item.kw_player_id,
      playerName: item.kw_player_name
    }
    sessionStorage.setItem('selectedProp', JSON.stringify(propInfo))
    
    // Navigate to player dashboard
    router.push(`/nfl/prop-lab/${item.kw_player_id}`)
  }

  // Get hit rate badge styling with unified color scale
  const getHitRateBadgeStyle = (hitRate: number) => {
    // Convert hit rate to percentage if it's in decimal format (0.71 -> 71)
    const percentageValue = hitRate < 1 ? Math.round(hitRate * 100) : Math.round(hitRate)
    
    // Unified color scale for all columns: 0-10%, 10-20%, 20-30%, etc.
    const colors = [
      { min: 0, max: 10, class: "border-red-600 bg-red-600/20 text-red-600" },
      { min: 11, max: 20, class: "border-red-500 bg-red-500/20 text-red-500" },
      { min: 21, max: 30, class: "border-orange-600 bg-orange-600/20 text-orange-600" },
      { min: 31, max: 40, class: "border-orange-500 bg-orange-500/20 text-orange-500" },
      { min: 41, max: 50, class: "border-yellow-600 bg-yellow-600/20 text-yellow-600" },
      { min: 51, max: 60, class: "border-yellow-500 bg-yellow-500/20 text-yellow-500" },
      { min: 61, max: 70, class: "border-lime-500 bg-lime-500/20 text-lime-500" },
      { min: 71, max: 80, class: "border-green-600 bg-green-600/20 text-green-600" },
      { min: 81, max: 90, class: "border-green-500 bg-green-500/20 text-green-500" },
      { min: 91, max: 100, class: "border-emerald-500 bg-emerald-500/20 text-emerald-500" }
    ]

    const colorRange = colors.find(range => percentageValue >= range.min && percentageValue <= range.max)
    return colorRange?.class || "border-gray-500 bg-gray-500/20 text-gray-500"
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Sorting state - default to L10 descending
  const [sortField, setSortField] = useState<SortField>('hitL10')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/nfl/props/filters')
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch filter options')
        }
        
        setFilterOptions(result)
      } catch (err) {
        console.error('Error fetching filter options:', err)
      }
    }

    fetchFilterOptions()
  }, [])

  // Fetch all data once on load
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        // Fetch all data in batches
        const allData: PlayerProp[] = []
        let currentPage = 1
        let hasMore = true
        
        while (hasMore) {
          const response = await fetch(`/api/nfl/props?page=${currentPage}&limit=1000`)
          const result = await response.json()
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch data')
          }
          
          allData.push(...result.data)
          hasMore = result.pagination.hasNext
          currentPage++
        }
        
        setAllData(allData)
        setDataLoaded(true)
        
        // Extract filter options from all data
        const players = [...new Set(allData.map(item => item.kw_player_name).filter(Boolean))]
        const props = [...new Set(allData.map(item => item.prop_name).filter(Boolean))]
        const games = [...new Set(allData.map(item => `${item.away_team} @ ${item.home_team}`).filter(Boolean))]
        const sportsbooks = [...new Set(allData.map(item => item.bookmaker).filter(Boolean))]
        
        setFilterOptions({
          players: players.sort(),
          props: props.sort(),
          games: games.sort(),
          sportsbooks: sportsbooks.sort()
        })
        
        setTotalPages(Math.ceil(allData.length / 100))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (!dataLoaded) {
      fetchAllData()
    }
  }, [dataLoaded])

  // Client-side filtering and grouping
  const { filteredData, groupedData } = useMemo(() => {
    if (!allData.length) return { filteredData: [], groupedData: [] }

    // Filter data
    let filtered = allData.filter(item => {
      // Player filter
      if (players.length > 0 && !players.includes(item.kw_player_name)) return false
      
      // Prop filter
      if (props.length > 0 && !props.includes(item.prop_name)) return false
      
      // Game filter
      if (games.length > 0) {
        const gameString = `${item.away_team} @ ${item.home_team}`
        if (!games.includes(gameString)) return false
      }
      
      // Sportsbook filter
      if (sportsbooks.length > 0 && !sportsbooks.includes(item.bookmaker)) return false
      
      // Over/Under filter - fix the mapping
      if (ou !== 'both') {
        if (ou === 'over' && item.O_U !== 'Over') return false
        if (ou === 'under' && item.O_U !== 'Under') return false
      }
      
      // Alt props filter
      if (!altProps && item.is_alternate === 1) return false
      
      // Advanced filters
      // Odds range filter
      if (minOdds !== null && item.price_american < minOdds) return false
      if (maxOdds !== null && item.price_american > maxOdds) return false
      
      // Line range filter
      if (minLine !== null && item.line < minLine) return false
      if (maxLine !== null && item.line > maxLine) return false
      
      // Games played filter
      const totalGamesPlayed = (item.gp_2024 || 0) + (item.gp_2025 || 0)
      if (minGamesPlayed !== null && totalGamesPlayed < minGamesPlayed) return false
      if (maxGamesPlayed !== null && totalGamesPlayed > maxGamesPlayed) return false
      
      return true
    })

    // Group by player, prop, O/U, and line to find best odds
    const grouped = new Map<string, PlayerProp>()
    
    filtered.forEach(item => {
      const key = `${item.kw_player_name}|${item.prop_name}|${item.O_U}|${item.line}`
      const existing = grouped.get(key)
      
      if (!existing || item.price_american > existing.price_american) {
        grouped.set(key, item)
      }
    })

    const groupedArray = Array.from(grouped.values())

    // Sort data
    groupedArray.sort((a, b) => {
      let aValue: number
      let bValue: number

      switch (sortField) {
        case 'bestOdds':
          aValue = a.price_american
          bValue = b.price_american
          break
        case 'impliedWinPct':
          aValue = a.implied_win_pct
          bValue = b.implied_win_pct
          break
        case 'streak':
          aValue = a.streak
          bValue = b.streak
          break
        case 'hit2024':
          aValue = a.hit_2024
          bValue = b.hit_2024
          break
        case 'hit2025':
          aValue = a.hit_2025
          bValue = b.hit_2025
          break
        case 'hitL20':
          aValue = a.hit_L20
          bValue = b.hit_L20
          break
        case 'hitL15':
          aValue = a.hit_L15
          bValue = b.hit_L15
          break
        case 'hitL10':
          aValue = a.hit_L10
          bValue = b.hit_L10
          break
        case 'hitL5':
          aValue = a.hit_L5
          bValue = b.hit_L5
          break
        default:
          aValue = a.price_american
          bValue = b.price_american
      }

      if (sortDirection === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return { filteredData: filtered, groupedData: groupedArray }
  }, [allData, players, props, games, sportsbooks, ou, altProps, sortField, sortDirection])

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * 100
    const endIndex = startIndex + 100
    return groupedData.slice(startIndex, endIndex)
  }, [groupedData, currentPage])

  // Update total pages when data changes
  useEffect(() => {
    setTotalPages(Math.ceil(groupedData.length / 100))
  }, [groupedData])

  // Custom prop ordering with groups
  const getPropOrder = (prop: string) => {
    const order = [
      'Touchdown',
      'First Touchdown', 
      'Last Touchdown',
      'Passing Yds',
      'Passing Att',
      'Passing Cmp',
      'Passing TDs',
      'Passing Int',
      'Passing Yds Q1',
      'Longest Pass',
      'Receptions',
      'Receiving Yds',
      'Longest Reception',
      'Rushing Att',
      'Rushing Yds',
      'Longest Rush',
      'Rush + Rec Yds',
      'PATs',
      'Kicking Points',
      'Field Goals'
    ]
    const index = order.indexOf(prop)
    return index === -1 ? 999 : index
  }

  const getPropGroup = (prop: string) => {
    if (['Touchdown', 'First Touchdown', 'Last Touchdown'].includes(prop)) return 'touchdown'
    if (['Passing Yds', 'Passing Att', 'Passing Cmp', 'Passing TDs', 'Passing Int', 'Passing Yds Q1', 'Longest Pass'].includes(prop)) return 'passing'
    if (['Receptions', 'Receiving Yds', 'Longest Reception'].includes(prop)) return 'receiving'
    if (['Rushing Att', 'Rushing Yds', 'Longest Rush'].includes(prop)) return 'rushing'
    if (['Rush + Rec Yds'].includes(prop)) return 'combined'
    if (['PATs', 'Kicking Points', 'Field Goals'].includes(prop)) return 'kicking'
    return 'other'
  }

  // Filtered options for dropdowns
  const filteredPlayers = useMemo(() => {
    return filterOptions.players.filter(player =>
      player.toLowerCase().includes(playerSearch.toLowerCase())
    )
  }, [filterOptions.players, playerSearch])

  const filteredProps = useMemo(() => {
    return filterOptions.props
      .filter(prop => prop.toLowerCase().includes(propSearch.toLowerCase()))
      .sort((a, b) => getPropOrder(a) - getPropOrder(b))
  }, [filterOptions.props, propSearch])

  const filteredGames = useMemo(() => {
    return filterOptions.games.filter(game =>
      game.toLowerCase().includes(gameSearch.toLowerCase())
    )
  }, [filterOptions.games, gameSearch])

  const filteredSportsbooks = useMemo(() => {
    return filterOptions.sportsbooks.filter(sportsbook =>
      sportsbook.toLowerCase().includes(sportsbookSearch.toLowerCase())
    )
  }, [filterOptions.sportsbooks, sportsbookSearch])

  // Helper functions
  const getTeamAbbreviation = (teamName: string) => {
    const teamAbbreviations: { [key: string]: string } = {
      'Arizona Cardinals': 'ARI',
      'Atlanta Falcons': 'ATL',
      'Baltimore Ravens': 'BAL',
      'Buffalo Bills': 'BUF',
      'Carolina Panthers': 'CAR',
      'Chicago Bears': 'CHI',
      'Cincinnati Bengals': 'CIN',
      'Cleveland Browns': 'CLE',
      'Dallas Cowboys': 'DAL',
      'Denver Broncos': 'DEN',
      'Detroit Lions': 'DET',
      'Green Bay Packers': 'GB',
      'Houston Texans': 'HOU',
      'Indianapolis Colts': 'IND',
      'Jacksonville Jaguars': 'JAX',
      'Kansas City Chiefs': 'KC',
      'Las Vegas Raiders': 'LV',
      'Los Angeles Chargers': 'LAC',
      'Los Angeles Rams': 'LAR',
      'Miami Dolphins': 'MIA',
      'Minnesota Vikings': 'MIN',
      'New England Patriots': 'NE',
      'New Orleans Saints': 'NO',
      'New York Giants': 'NYG',
      'New York Jets': 'NYJ',
      'Philadelphia Eagles': 'PHI',
      'Pittsburgh Steelers': 'PIT',
      'San Francisco 49ers': 'SF',
      'Seattle Seahawks': 'SEA',
      'Tampa Bay Buccaneers': 'TB',
      'Tennessee Titans': 'TEN',
      'Washington Commanders': 'WAS'
    }
    return teamAbbreviations[teamName] || teamName
  }

  const getTeamLogo = (teamName: string) => {
    const teamMap: { [key: string]: string } = {
      'Arizona Cardinals': '/Images/NFL_Logos/ARI.png',
      'Atlanta Falcons': '/Images/NFL_Logos/ATL.png',
      'Baltimore Ravens': '/Images/NFL_Logos/BAL.png',
      'Buffalo Bills': '/Images/NFL_Logos/BUF.png',
      'Carolina Panthers': '/Images/NFL_Logos/CAR.png',
      'Chicago Bears': '/Images/NFL_Logos/CHI.png',
      'Cincinnati Bengals': '/Images/NFL_Logos/CIN.png',
      'Cleveland Browns': '/Images/NFL_Logos/CLE.png',
      'Dallas Cowboys': '/Images/NFL_Logos/DAL.png',
      'Denver Broncos': '/Images/NFL_Logos/DEN.png',
      'Detroit Lions': '/Images/NFL_Logos/DET.png',
      'Green Bay Packers': '/Images/NFL_Logos/GB.png',
      'Houston Texans': '/Images/NFL_Logos/HOU.png',
      'Indianapolis Colts': '/Images/NFL_Logos/IND.png',
      'Jacksonville Jaguars': '/Images/NFL_Logos/JAX.png',
      'Kansas City Chiefs': '/Images/NFL_Logos/KC.png',
      'Las Vegas Raiders': '/Images/NFL_Logos/LV.png',
      'Los Angeles Chargers': '/Images/NFL_Logos/LAC.png',
      'Los Angeles Rams': '/Images/NFL_Logos/LAR.png',
      'Miami Dolphins': '/Images/NFL_Logos/MIA.png',
      'Minnesota Vikings': '/Images/NFL_Logos/MIN.png',
      'New England Patriots': '/Images/NFL_Logos/NE.png',
      'New Orleans Saints': '/Images/NFL_Logos/NO.png',
      'New York Giants': '/Images/NFL_Logos/NYG.png',
      'New York Jets': '/Images/NFL_Logos/NYJ.png',
      'Philadelphia Eagles': '/Images/NFL_Logos/PHI.png',
      'Pittsburgh Steelers': '/Images/NFL_Logos/PIT.png',
      'San Francisco 49ers': '/Images/NFL_Logos/SF.png',
      'Seattle Seahawks': '/Images/NFL_Logos/SEA.png',
      'Tampa Bay Buccaneers': '/Images/NFL_Logos/TB.png',
      'Tennessee Titans': '/Images/NFL_Logos/TEN.png',
      'Washington Commanders': '/Images/NFL_Logos/WAS.png'
    }
    return teamMap[teamName] || '/Images/NFL_Logos/default.png'
  }

  const getBookmakerLogo = (bookmaker: string) => {
    const bookmakerMap: { [key: string]: string } = {
      'DraftKings': '/Images/Sportsbook_Logos/DraftKingsLogo.png',
      'FanDuel': '/Images/Sportsbook_Logos/fanDuel.jpg',
      'Fanatics': '/Images/Sportsbook_Logos/Fanatics.jpeg',
      'Bet365': '/Images/Sportsbook_Logos/bet365.png',
      'BetRivers': '/Images/Sportsbook_Logos/betriverslogo.png',
      'Caesars Sportsbook': '/Images/Sportsbook_Logos/caesars.png',
      'BetMGM': '/Images/Sportsbook_Logos/betmgm.png',
      'BetOnline': '/Images/Sportsbook_Logos/betonline.png',
      'Bally Bet': '/Images/Sportsbook_Logos/ballybet.png',
      'ESPN Bet': '/Images/Sportsbook_Logos/espnbet.png',
      'Fliff': '/Images/Sportsbook_Logos/fliff.png',
      'Hardrock': '/Images/Sportsbook_Logos/hardrock.png',
      'Novig': '/Images/Sportsbook_Logos/novig.png',
      'Pinnacle': '/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg',
      'Prizepicks': '/Images/Sportsbook_Logos/prizepicks.png',
      'Underdog': '/Images/Sportsbook_Logos/underdog.png',
      'Sleeper': '/Images/Sportsbook_Logos/sleeper.png',
      'ProphetX': '/Images/Sportsbook_Logos/prophetx.png'
    }
    return bookmakerMap[bookmaker] || '/Images/Sportsbook_Logos/default.png'
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
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-normal justify-start"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
      )}
    </Button>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div>
            <p className="text-lg font-medium">Loading player props...</p>
            <p className="text-sm text-muted-foreground">Loading data...</p>
          </div>
          <div className="w-64 bg-muted rounded-full h-2 mx-auto">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-destructive">Failed to load data</p>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
          </div>
          <Button onClick={() => {
            setError(null)
            setDataLoaded(false)
            setLoading(true)
          }}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end justify-between">
            <div className="flex flex-wrap gap-3 items-end">
            {/* Player Selection */}
            <div className="space-y-1 min-w-[200px]">
              <Label className="text-xs">Player Selection</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {players.length === 0 ? 'All Players' : `${players.length} selected`}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="p-2">
                    <Input
                      placeholder="Search players..."
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filtered = filteredPlayers.filter(p =>
                            p.toLowerCase().includes(playerSearch.toLowerCase())
                          )
                          setPlayers(filtered)
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPlayers([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredPlayers
                        .filter(player =>
                          player.toLowerCase().includes(playerSearch.toLowerCase())
                        )
                        .map((player) => {
                          const playerData = allData.find(item => item.kw_player_name === player)
                          return (
                            <DropdownMenuCheckboxItem
                              key={player}
                              checked={players.includes(player)}
                              onSelect={(e) => e.preventDefault()}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setPlayers([...players, player])
                                } else {
                                  setPlayers(players.filter(p => p !== player))
                                }
                              }}
                              className="flex items-center gap-3 py-2"
                            >
                              <div className="w-4 h-4 border border-input rounded flex items-center justify-center">
                                {players.includes(player) && (
                                  <Check className="w-3 h-3" />
                                )}
                              </div>
                              {playerData?.espn_headshot ? (
                                <Image
                                  src={playerData.espn_headshot}
                                  alt={player}
                                  width={32}
                                  height={32}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                                  {player.split(' ').map(n => n[0]).join('')}
                                </div>
                              )}
                              <span className="text-sm font-medium">{player}</span>
                            </DropdownMenuCheckboxItem>
                          )
                        })}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Prop Selection */}
            <div className="space-y-1 min-w-[200px]">
              <Label className="text-xs">Prop Selection</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {props.length === 0 ? 'All Props' : `${props.length} selected`}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="p-2">
                    <Input
                      placeholder="Search props..."
                      value={propSearch}
                      onChange={(e) => setPropSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filtered = filteredProps.filter(p =>
                            p.toLowerCase().includes(propSearch.toLowerCase())
                          )
                          setProps(filtered)
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setProps([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredProps
                        .filter(prop =>
                          prop.toLowerCase().includes(propSearch.toLowerCase())
                        )
                        .map((prop, index) => {
                          const currentGroup = getPropGroup(prop)
                          const prevProp = index > 0 ? filteredProps[index - 1] : null
                          const prevGroup = prevProp ? getPropGroup(prevProp) : null
                          const showSeparator = prevGroup && prevGroup !== currentGroup
                          
                          return (
                            <div key={prop}>
                              {showSeparator && (
                                <div className="px-2 py-1">
                                  <div className="h-px bg-border"></div>
                                </div>
                              )}
                              <DropdownMenuCheckboxItem
                                checked={props.includes(prop)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setProps([...props, prop])
                                  } else {
                                    setProps(props.filter(p => p !== prop))
                                  }
                                }}
                                className="flex items-center gap-2"
                              >
                                <div className="w-4 h-4 border border-input rounded flex items-center justify-center">
                                  {props.includes(prop) && (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>
                                {prop}
                              </DropdownMenuCheckboxItem>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Game Selection */}
            <div className="space-y-1 min-w-[200px]">
              <Label className="text-xs">Game Selection</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {games.length === 0 ? 'All Games' : `${games.length} selected`}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="p-2">
                    <Input
                      placeholder="Search games..."
                      value={gameSearch}
                      onChange={(e) => setGameSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filtered = filteredGames.filter(g =>
                            g.toLowerCase().includes(gameSearch.toLowerCase())
                          )
                          setGames(filtered)
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setGames([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredGames
                        .filter(game =>
                          game.toLowerCase().includes(gameSearch.toLowerCase())
                        )
                        .map((game) => {
                          const [awayTeam, homeTeam] = game.split(' @ ')
                          const awayAbbr = getTeamAbbreviation(awayTeam)
                          const homeAbbr = getTeamAbbreviation(homeTeam)
                          return (
                            <DropdownMenuCheckboxItem
                              key={game}
                              checked={games.includes(game)}
                              onSelect={(e) => e.preventDefault()}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setGames([...games, game])
                                } else {
                                  setGames(games.filter(g => g !== game))
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <div className="w-4 h-4 border border-input rounded flex items-center justify-center">
                                {games.includes(game) && (
                                  <Check className="w-3 h-3" />
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={getTeamLogo(awayTeam)}
                                  alt={awayAbbr}
                                  width={20}
                                  height={20}
                                  className="rounded"
                                />
                                <span className="text-sm">{awayAbbr}</span>
                                <span className="text-muted-foreground">@</span>
                                <span className="text-sm">{homeAbbr}</span>
                                <Image
                                  src={getTeamLogo(homeTeam)}
                                  alt={homeAbbr}
                                  width={20}
                                  height={20}
                                  className="rounded"
                                />
                              </div>
                            </DropdownMenuCheckboxItem>
                          )
                        })}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Sportsbook Selection */}
            <div className="space-y-1 min-w-[200px]">
              <Label className="text-xs">Sportsbook Selection</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {sportsbooks.length === 0 ? 'All Sportsbooks' : `${sportsbooks.length} selected`}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="p-2">
                    <Input
                      placeholder="Search sportsbooks..."
                      value={sportsbookSearch}
                      onChange={(e) => setSportsbookSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const filtered = filteredSportsbooks.filter(s =>
                            s.toLowerCase().includes(sportsbookSearch.toLowerCase())
                          )
                          setSportsbooks(filtered)
                        }}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSportsbooks([])}
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredSportsbooks
                        .filter(sportsbook =>
                          sportsbook.toLowerCase().includes(sportsbookSearch.toLowerCase())
                        )
                        .map((sportsbook) => (
                          <DropdownMenuCheckboxItem
                            key={sportsbook}
                            checked={sportsbooks.includes(sportsbook)}
                            onSelect={(e) => e.preventDefault()}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSportsbooks([...sportsbooks, sportsbook])
                              } else {
                                setSportsbooks(sportsbooks.filter(s => s !== sportsbook))
                              }
                            }}
                            className="flex items-center gap-2"
                          >
                            <div className="w-4 h-4 border border-input rounded flex items-center justify-center">
                              {sportsbooks.includes(sportsbook) && (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                            <Image
                              src={getBookmakerLogo(sportsbook)}
                              alt={sportsbook}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                            {sportsbook}
                          </DropdownMenuCheckboxItem>
                        ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Over/Under Toggle */}
            <div className="space-y-1 min-w-[150px]">
              <Label className="text-xs">Over/Under</Label>
              <select
                value={ou}
                onChange={(e) => setOu(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="both">Both</option>
                <option value="over">Over Only</option>
                <option value="under">Under Only</option>
              </select>
            </div>

            {/* Alt Props Toggle */}
            <div className="space-y-1 min-w-[150px]">
              <Label className="text-xs">Alt Props</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="altProps"
                  checked={altProps}
                  onCheckedChange={setAltProps}
                />
                <Label htmlFor="altProps" className="text-sm">
                  Show Alternate Props
                </Label>
              </div>
            </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filters
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

                    {/* Games Played Range */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Games Played (2024 + 2025)</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Min</Label>
                          <Input
                            type="number"
                            placeholder="Min games"
                            value={minGamesPlayed || ''}
                            onChange={(e) => setMinGamesPlayed(e.target.value ? Number(e.target.value) : null)}
                            className="h-8"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">Max</Label>
                          <Input
                            type="number"
                            placeholder="Max games"
                            value={maxGamesPlayed || ''}
                            onChange={(e) => setMaxGamesPlayed(e.target.value ? Number(e.target.value) : null)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Player Props ({groupedData.length} total)</CardTitle>
          <CardDescription>
            Showing {paginatedData.length} of {groupedData.length} props
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full">
            <table className="w-full">
              <thead className="sticky top-0 bg-background z-10">
                <tr className="border-b">
                  <th className="text-left p-1 w-8 text-sm"></th>
                  <th className="text-left p-1 text-sm">Player</th>
                  <th className="text-left p-1 text-sm">Game</th>
                  <th className="text-left p-1 text-sm">Line</th>
                  <th className="text-left p-1 text-sm">Prop</th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="bestOdds">Odds</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="impliedWinPct">Implied %</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="streak">Streak</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="hit2024">2024</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="hit2025">2025</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="hitL20">L20</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="hitL15">L15</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="hitL10">L10</SortButton>
                  </th>
                  <th className="text-left p-1 text-sm">
                    <SortButton field="hitL5">L5</SortButton>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => {
                  const propId = `${item.kw_player_name}-${item.prop_name}-${item.O_U}-${item.line}`
                  const isSaved = savedProps.has(propId)
                  
                  // Format hit rates as percentages
                  const formatHitRate = (value: number) => {
                    return Math.round(value) + '%'
                  }

                  // Format implied win percentage
                  const formatImpliedWinPct = (value: number) => {
                    return Math.round(value) + '%'
                  }

                  // Get all odds for this prop from different books
                  const allOddsForProp = allData.filter(prop => 
                    prop.kw_player_name === item.kw_player_name &&
                    prop.prop_name === item.prop_name &&
                    prop.O_U === item.O_U &&
                    prop.line === item.line
                  ).sort((a, b) => b.price_american - a.price_american)

                  return (
                    <tr 
                      key={index} 
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleRowClick(item)}
                    >
                      <td className="p-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePropSave(propId)
                          }}
                          className="p-0.5 hover:bg-muted rounded transition-colors"
                        >
                          <Heart 
                            className={`h-3 w-3 ${
                              isSaved 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-muted-foreground hover:text-red-500'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="p-1">
                        <div className="flex items-center gap-2">
                {item.espn_headshot ? (
                  <Image
                    src={item.espn_headshot}
                    alt={item.kw_player_name}
                    width={38}
                    height={38}
                    className="rounded"
                  />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs font-medium">
                    {item.kw_player_name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                          <div className="flex flex-col justify-center">
                            <div className="font-medium text-base">{item.kw_player_name}</div>
                            <div className="text-xs text-blue-500">
                              {item.depth_position || item.position_group || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-1">
                        <div className="text-sm">
                          {getTeamAbbreviation(item.away_team)} @ {getTeamAbbreviation(item.home_team)}
                        </div>
                      </td>
                      <td className="p-1">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">
                            {item.O_U === 'Over' ? 'o' : item.O_U === 'Under' ? 'u' : 'o'}{item.line}
                          </span>
                        </div>
                      </td>
                      <td className="p-1">
                        <div className="font-medium text-sm">{item.prop_name}</div>
                      </td>
                      <td className="p-1">
                        <div className="flex items-center gap-1">
                          <Image
                            src={getBookmakerLogo(item.bookmaker)}
                            alt={item.bookmaker}
                            width={20}
                            height={20}
                            className="rounded-sm"
                          />
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="link"
                                className="h-auto p-0 text-sm text-brand-blue hover:text-brand-blue/80"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(item.outcome_link, '_blank')
                                }}
                              >
                                {item.price_american > 0 ? '+' : ''}{item.price_american}
                              </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">All Available Odds</h4>
                                <div className="space-y-1">
                                  {allOddsForProp.map((odds, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Image
                                          src={getBookmakerLogo(odds.bookmaker)}
                                          alt={odds.bookmaker}
                                          width={16}
                                          height={16}
                                          className="rounded"
                                        />
                                        <span className="text-sm">{odds.bookmaker}</span>
                                      </div>
                                      <span className="text-sm">
                                        {odds.price_american > 0 ? '+' : ''}{odds.price_american}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </td>
                      <td className="p-1 text-sm">
                        {formatImpliedWinPct(item.implied_win_pct)}
                      </td>
                      <td className="p-1 text-xs">
                        <span className={`px-1 py-0.5 rounded border text-xs font-medium ${getHitRateBadgeStyle(item.streak)}`}>
                          {item.streak}
                        </span>
                      </td>
                      <td className="p-1 text-xs">
                        <span className={`px-1 py-0.5 rounded border text-xs font-medium ${getHitRateBadgeStyle(item.hit_2024)}`}>
                          {formatHitRate(item.hit_2024)}
                        </span>
                      </td>
                      <td className="p-1 text-xs">
                        <span className={`px-1 py-0.5 rounded border text-xs font-medium ${getHitRateBadgeStyle(item.hit_2025)}`}>
                          {formatHitRate(item.hit_2025)}
                        </span>
                      </td>
                      <td className="p-1 text-xs">
                        <span className={`px-1 py-0.5 rounded border text-xs font-medium ${getHitRateBadgeStyle(item.hit_L20)}`}>
                          {formatHitRate(item.hit_L20)}
                        </span>
                      </td>
                      <td className="p-1 text-xs">
                        <span className={`px-1 py-0.5 rounded border text-xs font-medium ${getHitRateBadgeStyle(item.hit_L15)}`}>
                          {formatHitRate(item.hit_L15)}
                        </span>
                      </td>
                      <td className="p-1 text-xs">
                        <span className={`px-1 py-0.5 rounded border text-xs font-medium ${getHitRateBadgeStyle(item.hit_L10)}`}>
                          {formatHitRate(item.hit_L10)}
                        </span>
                      </td>
                      <td className="p-1 text-xs">
                        <span className={`px-1 py-0.5 rounded border text-xs font-medium ${getHitRateBadgeStyle(item.hit_L5)}`}>
                          {formatHitRate(item.hit_L5)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}