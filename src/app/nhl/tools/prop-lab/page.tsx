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
import { ChevronDown, Check, Filter, Heart, ArrowDown, ArrowUp, Square, RefreshCw } from "lucide-react"
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
  hit_L50: number | null
  hit_L30: number | null
  hit_L10: number | null
  hit_L5: number | null
  n_L50: number | null
  n_L30: number | null
  n_L10: number | null
  n_L5: number | null
  streak: number | null
  all_books: { bookmaker: string | null; price_american: number | null; implied_win_pct: number | null; fetch_ts_utc: string | null }[]
  // New optional fields from v3
  matchup?: string | null
  start_time_est?: string | null
  home_abbr?: string | null
  away_abbr?: string | null
}

interface FilterOptions {
  players: string[]
  props: string[]
  games: string[]
  sportsbooks: string[]
}

type SortField = 'odds' | 'implied' | 'streak' | 'hitL10' | 'hitL5' | 'hitL30' | 'hitL50' | 'hit2025' | 'hit2024' | 'l50VsIw' | 'line' | 'player' | 'prop'
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
    'PHI': '/Images/NHL_Logos/PHI.png', 'PIT': '/Images/NHL_Logos/PIT.png', 'SJ': '/Images/NHL_Logos/SJS.png',
    'SJS': '/Images/NHL_Logos/SJS.png', 'SEA': '/Images/NHL_Logos/SEA.png', 'STL': '/Images/NHL_Logos/STL.png',
    'TB': '/Images/NHL_Logos/TB.png', 'TOR': '/Images/NHL_Logos/TOR.png', 'VAN': '/Images/NHL_Logos/VAN.png',
    'VGK': '/Images/NHL_Logos/VGK.png', 'WPG': '/Images/NHL_Logos/WPG.png', 'WSH': '/Images/NHL_Logos/WSH.png',
    'UTA': '/Images/NHL_Logos/UTA.png'
  }
  return teamMap[abbrev] || '/Images/League_Logos/NHL-Logo.png'
}

export default function NHLPropLabPage() {
  const router = useRouter()
  const [allData, setAllData] = useState<NHLProp[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ players: [], props: [], games: [], sportsbooks: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
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

  const loadData = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const [filtersRes, firstPage] = await Promise.all([
        fetch('/api/nhl/props/filters'),
        fetch(`/api/nhl/props?page=1&limit=10000${refresh ? '&refresh=true' : ''}`),
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
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Save filters to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (filtersLoadedRef.current && !loading) {
      saveFiltersToStorage()
    }
  }, [saveFiltersToStorage, loading])

  // Helper function to normalize team names for matching (handles variations)
  const normalizeTeamName = (name: string): string => {
    return name
      .trim()
      .replace(/\./g, '') // Remove periods (St. -> St)
      .normalize('NFD') // Normalize unicode (é -> e)
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase()
  }

  // Helper function to get team abbreviation - must be defined before useMemo
  const getTeamAbbreviation = (teamName: string | null) => {
    if (!teamName) return 'N/A'
    
    // Normalize the input for flexible matching
    const normalized = normalizeTeamName(teamName)
    
    const teamAbbreviations: { [key: string]: string } = {
      'anaheim ducks': 'ANA',
      'arizona coyotes': 'ARI',
      'boston bruins': 'BOS',
      'buffalo sabres': 'BUF',
      'calgary flames': 'CGY',
      'carolina hurricanes': 'CAR',
      'chicago blackhawks': 'CHI',
      'colorado avalanche': 'COL',
      'columbus blue jackets': 'CBJ',
      'dallas stars': 'DAL',
      'detroit red wings': 'DET',
      'edmonton oilers': 'EDM',
      'florida panthers': 'FLA',
      'los angeles kings': 'LAK',
      'minnesota wild': 'MIN',
      'montreal canadiens': 'MTL', // Handles both "Montreal" and "Montréal"
      'nashville predators': 'NSH',
      'new jersey devils': 'NJD',
      'new york islanders': 'NYI',
      'new york rangers': 'NYR',
      'ottawa senators': 'OTT',
      'philadelphia flyers': 'PHI',
      'pittsburgh penguins': 'PIT',
      'san jose sharks': 'SJ',
      'seattle kraken': 'SEA',
      'st louis blues': 'STL', // Handles both "St. Louis" and "St Louis"
      'tampa bay lightning': 'TB',
      'toronto maple leafs': 'TOR',
      'vancouver canucks': 'VAN',
      'vegas golden knights': 'VGK',
      'washington capitals': 'WSH',
      'winnipeg jets': 'WPG'
    }
    
    return teamAbbreviations[normalized] || teamName
  }

  const filteredGrouped = useMemo(() => {
    let rows = allData
    // Temporarily filter out players with duplicate names until backend is fixed
    const duplicateNamePlayers = ['Sebastian Aho', 'Elias Pettersson']
    rows = rows.filter(r => {
      // Exclude duplicate name players
      if (r.kw_player_name && duplicateNamePlayers.includes(r.kw_player_name)) return false
      if (players.length && (!r.kw_player_name || !players.includes(r.kw_player_name))) return false
      if (props.length && (!r.prop_name || !props.includes(r.prop_name))) return false
      if (games.length) {
        const g = `${r.away_team} @ ${r.home_team}`
        if (!games.includes(g)) return false
      }
      if (matchups.length) {
        // Use Matchup field directly if available, otherwise build from team abbreviations
        const matchup = r.matchup || `${getTeamAbbreviation(r.away_team)} @ ${getTeamAbbreviation(r.home_team)}`
        if (!matchups.includes(matchup)) return false
      }
      // Check if any of the sportsbooks in all_books match the filter (not just the best one)
      if (sportsbooks.length > 0) {
        const hasMatchingBook = (r.all_books || []).some(book => book.bookmaker && sportsbooks.includes(book.bookmaker))
        if (!hasMatchingBook) return false
      }
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
        case 'hitL50':
          return dir * (((b.hit_L50 ?? 0) - (a.hit_L50 ?? 0)))
        case 'hit2025':
          return dir * (((b.hit_2025 ?? 0) - (a.hit_2025 ?? 0)))
        case 'hit2024':
          return dir * (((b.hit_2024 ?? 0) - (a.hit_2024 ?? 0)))
        case 'l50VsIw': {
          const bDiff = (b.hit_L50 ?? 0) - (b.implied_win_pct ?? 0)
          const aDiff = (a.hit_L50 ?? 0) - (a.implied_win_pct ?? 0)
          return dir * (bDiff - aDiff)
        }
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
      l50VsIw: { min: 0, max: 0 },
      hitL30: { min: 0, max: 0 },
      hitL50: { min: 0, max: 0 },
      hitL10: { min: 0, max: 0 },
      hitL5: { min: 0, max: 0 },
    }
    
    if (filteredGrouped.length === 0) return stats

    const values2025 = filteredGrouped.map(r => r.hit_2025).filter(v => v != null) as number[]
    const values2024 = filteredGrouped.map(r => r.hit_2024).filter(v => v != null) as number[]
    const valuesL50VsIw = filteredGrouped
      .map(r => (r.hit_L50 != null && r.implied_win_pct != null ? r.hit_L50 - r.implied_win_pct : null))
      .filter(v => v != null) as number[]
    const valuesL30 = filteredGrouped.map(r => r.hit_L30).filter(v => v != null) as number[]
    const valuesL50 = filteredGrouped.map(r => r.hit_L50).filter(v => v != null) as number[]
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
    if (valuesL50VsIw.length > 0) {
      stats.l50VsIw.min = Math.min(...valuesL50VsIw)
      stats.l50VsIw.max = Math.max(...valuesL50VsIw)
    }
    if (valuesL30.length > 0) {
      stats.hitL30.min = Math.min(...valuesL30)
      stats.hitL30.max = Math.max(...valuesL30)
    }
    if (valuesL50.length > 0) {
      stats.hitL50.min = Math.min(...valuesL50)
      stats.hitL50.max = Math.max(...valuesL50)
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
    
    // Map sortField to period filter for dashboard
    const getPeriodFromSortField = (field: SortField): string => {
      switch (field) {
        case 'hitL30': return 'L30'
        case 'hitL10': return 'L10'
        case 'hitL5': return 'L50'
        case 'hit2025': return '20242025'
        case 'hit2024': return '20252026'
        case 'l50VsIw': return 'L30'
        default: return 'all'
      }
    }
    
    // Store prop info in sessionStorage for the dashboard to use
    const propInfo = {
      propName: item.prop_name,
      line: item.line,
      ou: item.O_U,
      playerId: item.kw_player_id,
      playerName: item.kw_player_name,
      periodFilter: getPeriodFromSortField(sortField)
    }
    sessionStorage.setItem('selectedNHLProp', JSON.stringify(propInfo))
    
    // Navigate to player dashboard
    router.push(`/nhl/prop-lab/${item.kw_player_id}`)
  }

  const formatPct = (v: number | null) => v == null ? '-' : `${Math.round(v * 100)}%`
  const formatDiffPct = (v: number | null) => v == null ? '-' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`

  const getHitRateBadgeStyle = (
    hitRate: number | null,
    columnType: 'hit2025' | 'hit2024' | 'hitL30' | 'hitL50' | 'hitL10' | 'hitL5' | 'l50VsIw'
  ) => {
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

  // Compute matchups with times, sorted by start time
  const matchupList = useMemo(() => {
    const matchupMap = new Map<string, { matchup: string; time: string | null; awayAbbr: string; homeAbbr: string }>()
    
    allData.forEach(r => {
      // Use Matchup field directly if available, otherwise fall back to building from team names
      const matchup = r.matchup || (() => {
        const awayAbbr = r.away_abbr || getTeamAbbreviation(r.away_team)
        const homeAbbr = r.home_abbr || getTeamAbbreviation(r.home_team)
        return `${awayAbbr} @ ${homeAbbr}`
      })()
      
      if (!matchupMap.has(matchup)) {
        // Use Start_Time_est if available (already in EST format like "6:30 PM")
        // Otherwise parse from commence_time_utc
        let timeStr: string | null = null
        if (r.start_time_est) {
          // Start_Time_est is in format "6:30 PM", extract just the time part
          try {
            // Parse "6:30 PM" format to "18:30" format for sorting
            const timeMatch = r.start_time_est.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
            if (timeMatch) {
              let hours = parseInt(timeMatch[1])
              const minutes = timeMatch[2]
              const ampm = timeMatch[3].toUpperCase()
              if (ampm === 'PM' && hours !== 12) hours += 12
              if (ampm === 'AM' && hours === 12) hours = 0
              timeStr = `${hours.toString().padStart(2, '0')}:${minutes}`
            } else {
              // If format is different, try to use as-is
              timeStr = r.start_time_est
            }
          } catch (e) {
            // If parsing fails, leave as null
          }
        } else if (r.commence_time_utc) {
          // Fallback: parse from commence_time_utc and convert to EST (UTC-5, add 5 hours)
          try {
            const date = new Date(r.commence_time_utc)
            // Add 5 hours for EST conversion (UTC-5)
            date.setHours(date.getHours() + 5)
            const hours = date.getHours()
            const minutes = date.getMinutes()
            timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
          } catch (e) {
            // If parsing fails, leave as null
          }
        }
        
        // Extract abbreviations from matchup string or use fallback
        const awayAbbr = r.away_abbr || (r.matchup ? r.matchup.split(' @ ')[0] : getTeamAbbreviation(r.away_team))
        const homeAbbr = r.home_abbr || (r.matchup ? r.matchup.split(' @ ')[1] : getTeamAbbreviation(r.home_team))
        
        matchupMap.set(matchup, {
          matchup,
          time: timeStr,
          awayAbbr,
          homeAbbr
        })
      }
    })
    
    // Convert to array and sort by time
    return Array.from(matchupMap.values())
      .sort((a, b) => {
        // Sort by time (nulls go to end)
        if (!a.time && !b.time) return a.matchup.localeCompare(b.matchup)
        if (!a.time) return 1
        if (!b.time) return -1
        return a.time.localeCompare(b.time)
      })
  }, [allData])

  if (loading) return <div className="p-6">Loading NHL props...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div className="flex flex-col h-[calc(100vh-3rem-3rem)] gap-4" style={{ fontSize: '0.95rem' }}>
      <Card className="border-2 shadow-lg flex-shrink-0">
        <CardHeader className="bg-muted/30 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">NHL Prop Lab</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={refreshing || loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end justify-between">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5 min-w-[200px]">
                <Label className="text-sm font-semibold text-foreground">Players</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-8 text-sm">
                      {players.length === 0 ? 'All Players' : `${players.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 dark:bg-[#171717] border-gray-700" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <div className="p-2">
                      <Input
                        placeholder="Search players" 
                        value={playerSearch} 
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="mb-2 h-8 text-sm"
                        autoFocus
                      />
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const filtered = (filterOptions.players || []).filter(p => p.toLowerCase().includes(playerSearch.toLowerCase()))
                            setPlayers([...new Set([...players, ...filtered])])
                          }}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const filtered = (filterOptions.players || []).filter(p => p.toLowerCase().includes(playerSearch.toLowerCase()))
                            setPlayers(players.filter(p => !filtered.includes(p)))
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {(filterOptions.players||[]).filter(p=>p.toLowerCase().includes(playerSearch.toLowerCase())).map(p=> (
                          <DropdownMenuCheckboxItem 
                            key={p} 
                            checked={players.includes(p)} 
                            onSelect={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }} 
                            onCheckedChange={(c) => {
                              setPlayers(c ? [...players, p] : players.filter(x => x !== p))
                            }}
                          >
                            {p}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5 min-w-[200px]">
                <Label className="text-sm font-semibold text-foreground">Props</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-8 text-sm">
                      {props.length === 0 ? 'All Props' : `${props.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 dark:bg-[#171717] border-gray-700">
                    <div className="p-2">
                      <Input placeholder="Search props" value={propSearch} onChange={e=>setPropSearch(e.target.value)} className="mb-2 h-8 text-sm"/>
                      <div className="max-h-60 overflow-y-auto">
                        {(() => {
                          // Define the desired order
                          const propOrder = [
                            'Goals',
                            'Ast',
                            'Pts',
                            'SOG',
                            'PP Pts',
                            'First Goal Scorer',
                            'Last Goal Scorer',
                            'Blocked Shots'
                          ]
                          
                          // Filter and sort props
                          const filtered = (filterOptions.props || [])
                            .filter(p => {
                              // Remove player_blocked_shots_alternate
                              if (p === 'player_blocked_shots_alternate') return false
                              // Filter by search
                              return p.toLowerCase().includes(propSearch.toLowerCase())
                            })
                            .sort((a, b) => {
                              const aIndex = propOrder.indexOf(a)
                              const bIndex = propOrder.indexOf(b)
                              
                              // If both are in the order list, sort by their position
                              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
                              // If only a is in the list, it comes first
                              if (aIndex !== -1) return -1
                              // If only b is in the list, it comes first
                              if (bIndex !== -1) return 1
                              // If neither is in the list, sort alphabetically
                              return a.localeCompare(b)
                            })
                          
                          return filtered.map(p => (
                            <DropdownMenuCheckboxItem key={p} checked={props.includes(p)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setProps(c?[...props,p]: props.filter(x=>x!==p))}>
                              {p}
                            </DropdownMenuCheckboxItem>
                          ))
                        })()}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5 min-w-[200px]">
                <Label className="text-sm font-semibold text-foreground">Matchups</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-8 text-sm">
                      {matchups.length === 0 ? 'All Matchups' : `${matchups.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 dark:bg-[#171717] border-gray-700">
                    <div className="p-2">
                      <Input placeholder="Search matchups" value={matchupSearch} onChange={e=>setMatchupSearch(e.target.value)} className="mb-2 h-8 text-sm"/>
                      <div className="max-h-60 overflow-y-auto">
                        {matchupList
                          .filter(m => m.matchup.toLowerCase().includes(matchupSearch.toLowerCase()))
                          .map(m => (
                            <DropdownMenuCheckboxItem 
                              key={m.matchup} 
                              checked={matchups.includes(m.matchup)} 
                              onSelect={e=>e.preventDefault()} 
                              onCheckedChange={(c)=> setMatchups(c?[...matchups,m.matchup]: matchups.filter(x=>x!==m.matchup))}
                              className="flex items-center gap-2"
                            >
                              <div className="flex items-center gap-1.5 flex-1">
                                <Image 
                                  src={getNHLTeamLogo(m.awayAbbr)} 
                                  alt={m.awayAbbr} 
                                  width={16} 
                                  height={16} 
                                  className="object-contain"
                                />
                                <span>{m.awayAbbr}</span>
                                <span className="text-muted-foreground">@</span>
                                <Image 
                                  src={getNHLTeamLogo(m.homeAbbr)} 
                                  alt={m.homeAbbr} 
                                  width={16} 
                                  height={16} 
                                  className="object-contain"
                                />
                                <span>{m.homeAbbr}</span>
                              </div>
                              {m.time && (
                                <span className="text-xs text-muted-foreground ml-auto">{m.time}</span>
                              )}
                            </DropdownMenuCheckboxItem>
                          ))}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-1.5 min-w-[200px]">
                <Label className="text-sm font-semibold text-foreground">Sportsbooks</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-8 text-sm">
                      {sportsbooks.length === 0 ? 'All Sportsbooks' : `${sportsbooks.length} selected`}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 dark:bg-[#171717] border-gray-700">
                    <div className="p-2">
                      <Input placeholder="Search sportsbooks" value={sportsbookSearch} onChange={e=>setSportsbookSearch(e.target.value)} className="mb-2 h-8 text-sm"/>
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

              <div className="space-y-1.5 min-w-[160px]">
                <Label className="text-sm font-semibold text-foreground">O/U</Label>
                <select value={ou} onChange={e=>setOu(e.target.value)} className="w-full h-8 px-2 border-2 border-input bg-background rounded-md text-sm font-medium hover:border-primary/50 transition-colors">
                  <option value="both">Both</option>
                  <option value="over">Over</option>
                  <option value="under">Under</option>
                </select>
              </div>

              <div className="space-y-1.5 min-w-[160px]">
                <Label className="text-sm font-semibold text-foreground">Alt Props</Label>
                <div className="flex items-center gap-2 px-1">
                  <Switch checked={altProps} onCheckedChange={setAltProps}/>
                  <span className="text-sm font-medium text-foreground">Show alternate</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={clearAll} className="h-8 border-2 text-xs font-medium hover:bg-destructive/10 hover:border-destructive/50">
                Clear
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-2 text-xs font-medium hover:bg-primary/10 hover:border-primary/50">
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
                  <th className="text-left p-2 w-10 text-xs font-bold text-muted-foreground uppercase tracking-wider"></th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="player">Player</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Matchup</th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Side</th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="line">Line</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="prop">Prop</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="odds">Odds</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="implied">Implied %</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="l50VsIw">L50 vs IW%</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hit2025">2024-25</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hit2024">2025-26</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hitL50">L50</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hitL30">L30</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="hitL10">L10</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                      <td className="p-2">
                        <button 
                          className="p-1 hover:bg-muted rounded-md transition-colors" 
                          onClick={(e)=>{e.stopPropagation(); setSavedProps(prev=>{const s=new Set(prev); s.has(propId)?s.delete(propId):s.add(propId); return s})}}
                        >
                          <Heart className={`h-4 w-4 transition-colors ${isSaved? 'fill-red-500 text-red-500':'text-muted-foreground group-hover:text-red-500'}`}/>
                        </button>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0 w-9 h-9">
                            {row.espn_headshot ? (
                              <Image 
                                src={row.espn_headshot} 
                                alt={row.kw_player_name || ''} 
                                width={36} 
                                height={36} 
                                className="rounded object-cover"
                                unoptimized
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = `<div class="w-9 h-9 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">${(row.kw_player_name || '').charAt(0) || '?'}</div>`
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                {(row.kw_player_name || '').charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          {row.kw_player_name ? (() => {
                            const nameParts = row.kw_player_name.split(' ')
                            const firstName = nameParts[0] || ''
                            const lastName = nameParts.slice(1).join(' ') || ''
                            return (
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">{firstName}</span>
                                <span className="text-sm font-bold text-foreground">{lastName}</span>
                              </div>
                            )
                          })() : (
                            <span className="text-sm font-semibold text-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-sm font-medium text-foreground">
                        {row.away_team && row.home_team ? 
                          `${getTeamAbbreviation(row.away_team)} @ ${getTeamAbbreviation(row.home_team)}` : 
                          <span className="text-muted-foreground">N/A</span>
                        }
                      </td>
                      <td className="p-2 text-sm font-medium text-foreground">{row.O_U}</td>
                      <td className="p-2 text-sm font-semibold text-foreground">{row.line}</td>
                      <td className="p-2 text-sm font-medium text-foreground">{row.prop_name}</td>
                      <td className="p-2">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center gap-1.5">
                              <div className="relative">
                                <Image 
                                  src={getBookmakerLogo(row.bookmaker)} 
                                  alt={row.bookmaker || 'Unknown'} 
                                  width={28} 
                                  height={28} 
                                  className="rounded-md border border-border"
                                />
                                {others && others.length > 0 && (
                                  <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 h-5 min-w-[20px] flex items-center justify-center bg-blue-500 border-2 border-background text-white font-semibold shadow-md rounded-full hover:bg-blue-600 z-10">
                                    +{others.length}
                                  </Badge>
                                )}
                              </div>
                              <Button variant="link" className="h-auto p-0 text-sm font-semibold text-foreground hover:text-primary">
                                {row.price_american != null && row.price_american > 0 ? '+' : ''}{row.price_american}
                              </Button>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80 border-2">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm mb-2">All Books</div>
                              {(others||[]).map((o, i)=> (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                                  <div className="flex items-center gap-2">
                                    <Image 
                                      src={getBookmakerLogo(o.bookmaker)} 
                                      alt={o.bookmaker || 'Unknown'} 
                                      width={20} 
                                      height={20} 
                                      className="rounded border border-border"
                                    />
                                    <span className="text-sm font-medium text-foreground">{o.bookmaker}</span>
                                  </div>
                                  <span className="text-sm font-semibold text-foreground">{o.price_american != null && o.price_american > 0 ? '+' : ''}{o.price_american}</span>
                                </div>
                              ))}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="p-2">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <span className="text-sm font-semibold text-foreground cursor-help">
                              {formatPct(row.implied_win_pct)}
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-auto border-2">
                            <div className="space-y-3">
                              {row.price_american != null && row.implied_win_pct != null ? (
                                <>
                                  <div className="text-sm leading-relaxed">
                                    The odds of{' '}
                                    <span className="font-bold text-blue-400">{row.price_american > 0 ? '+' : ''}{row.price_american}</span>
                                    {' '}imply this prop will win{' '}
                                    <span className="font-bold text-green-400">{formatPct(row.implied_win_pct)}</span>
                                    {' '}of the time.
                                  </div>
                                  <div className="pt-2 border-t border-border space-y-1.5 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Formula:</span>
                                      <span className="font-mono text-xs">
                                        {row.price_american > 0 
                                          ? <>100 / (<span className="text-blue-400">{row.price_american}</span> + 100)</>
                                          : <><span className="text-blue-400">{Math.abs(row.price_american)}</span> / (<span className="text-blue-400">{Math.abs(row.price_american)}</span> + 100)</>
                                        }
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground">Calculation:</span>
                                      <span className="font-mono text-xs">
                                        {row.price_american > 0
                                          ? <>100 / <span className="text-blue-400">{row.price_american + 100}</span> = <span className="text-green-400">{(100 / (row.price_american + 100)).toFixed(4)}</span></>
                                          : <><span className="text-blue-400">{Math.abs(row.price_american)}</span> / <span className="text-blue-400">{Math.abs(row.price_american) + 100}</span> = <span className="text-green-400">{(Math.abs(row.price_american) / (Math.abs(row.price_american) + 100)).toFixed(4)}</span></>
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-xs text-muted-foreground">No odds data available</div>
                              )}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>
                      <td className="p-2">
                        {row.hit_L50 != null && row.implied_win_pct != null ? (() => {
                          const diff = (row.hit_L50 - row.implied_win_pct) * 100
                          return (
                            <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_L50 - row.implied_win_pct, 'l50VsIw')}`}>
                              {formatDiffPct(diff)}
                            </Badge>
                          )
                        })() : (
                          <Badge className="text-xs font-semibold border-2 px-2.5 py-1 bg-muted border-border text-muted-foreground">-</Badge>
                        )}
                      </td>
                      <td className="p-2">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_2025, 'hit2025')}`}>
                          {formatPct(row.hit_2025)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_2024, 'hit2024')}`}>
                          {formatPct(row.hit_2024)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_L50, 'hitL50')}`}>
                          {formatPct(row.hit_L50)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_L30, 'hitL30')}`}>
                          {formatPct(row.hit_L30)}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={`text-xs font-semibold border-2 px-2.5 py-1 ${getHitRateBadgeStyle(row.hit_L10, 'hitL10')}`}>
                          {formatPct(row.hit_L10)}
                        </Badge>
                      </td>
                      <td className="p-2">
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



