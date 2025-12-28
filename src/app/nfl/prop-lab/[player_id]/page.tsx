"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, TrendingUp, TrendingDown, Target, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ReferenceLine, Label } from 'recharts'

// Types
interface PlayerGamelog {
  season: number
  season_type: string
  week: number
  game_id: string
  home_team: string
  away_team: string
  venue: string
  gsis_id: string
  player_name: string
  team: string
  opponent: string
  team_2025: string
  position: string
  espn_id: number
  cbs_id: number
  espn_headshot: string
  pbp_player_name: string
  pfr_id: string
  Off_snaps: number
  Off_snap_pct: number
  pos_rank: number
  depth_label_by_snaps: string
  starter_flag: number
  attempts: number
  completions: number
  pass_comp_pct: number
  passing_yards: number
  pass_ypa: number
  passing_tds: number
  interceptions: number
  sacks: number
  sack_yards: number
  passing_air_yards: number
  passing_yac: number
  passing_first_downs: number
  targets: number
  receptions: number
  receiving_yards: number
  receiving_tds: number
  receiving_air_yards: number
  receiving_yac: number
  receiving_first_downs: number
  carries: number
  rushing_yards: number
  rushing_tds: number
  rushing_first_downs: number
  td_rush: number
  td_rec: number
  td_total: number
  longest_pass: number
  longest_rec: number
  longest_rush: number
  player_display_name: string
}

interface SelectedProp {
  propName: string
  line: number
  ou: string
  playerId: string
  playerName: string
}

// Prop mapping helper
const getPropField = (propName: string): string => {
  const mappings: { [key: string]: string } = {
    'Touchdown': 'td_total',
    'First Touchdown': 'td_total',
    'Last Touchdown': 'td_total',
    'Passing Yds': 'passing_yards',
    'Passing Att': 'attempts',
    'Passing Cmp': 'completions',
    'Passing TDs': 'passing_tds',
    'Passing Int': 'interceptions',
    'Passing Yds Q1': 'passing_yards',
    'Longest Pass': 'longest_pass',
    'Receptions': 'receptions',
    'Receiving Yds': 'receiving_yards',
    'Longest Reception': 'longest_rec',
    'Rushing Att': 'carries',
    'Rushing Yds': 'rushing_yards',
    'Longest Rush': 'longest_rush',
    'Rush + Rec Yds': 'rushing_yards + receiving_yards',
    'PATs': 'kicking_points',
    'Kicking Points': 'kicking_points',
    'Field Goals': 'field_goals'
  }
  return mappings[propName] || 'td_total'
}

// Get secondary stat for prop-specific analysis
const getSecondaryStat = (propName: string): { field: string; label: string; calculation?: (game: any) => number } => {
  const mappings: { [key: string]: { field: string; label: string; calculation?: (game: any) => number } } = {
    'Passing Att': { field: 'passer_dropbacks', label: 'Dropbacks' },
    'Passing Yds': { field: 'pass_ypa', label: 'Yards per Attempt', calculation: (game) => game.passing_yards / (game.attempts || 1) },
    'Passing Int': { field: 'attempts', label: 'Pass Attempts' },
    'Passing TDs': { field: 'passer_rz20_tds', label: 'Red Zone TDs' },
    'Passing Cmp': { field: 'pass_comp_pct', label: 'Completion %', calculation: (game) => (game.completions / (game.attempts || 1)) * 100 },
    'Receptions': { field: 'targets', label: 'Targets' },
    'Receiving Yds': { field: 'receiver_yards_per_reception', label: 'Yards per Reception', calculation: (game) => game.receiving_yards / (game.receptions || 1) },
    'Receiving TDs': { field: 'receiver_rz20_tds', label: 'Red Zone TDs' },
    'Rushing Att': { field: 'rusher_designed_carries', label: 'Designed Carries' },
    'Rushing Yds': { field: 'rusher_yards_per_carry', label: 'Yards per Carry', calculation: (game) => game.rushing_yards / (game.carries || 1) },
    'Rushing TDs': { field: 'rusher_rz20_tds', label: 'Red Zone TDs' },
    'Touchdown': { field: 'td_total', label: 'Total TDs' },
    'First Touchdown': { field: 'td_total', label: 'Total TDs' },
    'Last Touchdown': { field: 'td_total', label: 'Total TDs' },
    'Longest Pass': { field: 'passing_air_yards', label: 'Air Yards' },
    'Longest Reception': { field: 'receiver_air_yards', label: 'Air Yards' },
    'Longest Rush': { field: 'rusher_explosive20_plus', label: '20+ Yard Runs' },
    'Rush + Rec Yds': { field: 'targets', label: 'Targets' }
  }
  return mappings[propName] || { field: 'td_total', label: 'Total TDs' }
}

// Get third supporting stat for trend analysis
const getTrendStat = (propName: string): { field: string; label: string; calculation?: (game: any) => number } => {
  const mappings: { [key: string]: { field: string; label: string; calculation?: (game: any) => number } } = {
    'Passing Att': { field: 'completions', label: 'Completion Rate', calculation: (game) => (game.completions / (game.attempts || 1)) * 100 },
    'Passing Yds': { field: 'passer_adot', label: 'ADOT (Air Depth)' },
    'Passing Int': { field: 'pass_comp_pct', label: 'Completion %', calculation: (game) => (game.completions / (game.attempts || 1)) * 100 },
    'Passing TDs': { field: 'passer_rz20_att', label: 'Red Zone Attempts' },
    'Passing Cmp': { field: 'pass_ypa', label: 'Yards per Attempt', calculation: (game) => game.passing_yards / (game.attempts || 1) },
    'Receptions': { field: 'receiver_catch_rate', label: 'Catch Rate', calculation: (game) => (game.receptions / (game.targets || 1)) * 100 },
    'Receiving Yds': { field: 'receiver_adot', label: 'ADOT (Air Depth)' },
    'Receiving TDs': { field: 'receiver_rz20_targets', label: 'Red Zone Targets' },
    'Rushing Att': { field: 'rusher_success_rate', label: 'Success Rate' },
    'Rushing Yds': { field: 'rusher_explosive10_plus', label: '10+ Yard Runs' },
    'Rushing TDs': { field: 'rusher_rz20_carries', label: 'Red Zone Carries' },
    'Touchdown': { field: 'receiver_rz20_tds', label: 'Red Zone TDs' },
    'First Touchdown': { field: 'receiver_rz20_tds', label: 'Red Zone TDs' },
    'Last Touchdown': { field: 'receiver_rz20_tds', label: 'Red Zone TDs' },
    'Longest Pass': { field: 'passer_deep_att', label: 'Deep Attempts' },
    'Longest Reception': { field: 'receiver_deep_targets', label: 'Deep Targets' },
    'Longest Rush': { field: 'rusher_explosive15_plus', label: '15+ Yard Runs' },
    'Rush + Rec Yds': { field: 'receiver_target_share', label: 'Target Share %', calculation: (game) => (game.targets / (game.team_targets || 1)) * 100 }
  }
  return mappings[propName] || { field: 'td_total', label: 'Total TDs' }
}

// Team logo helper
const getTeamLogo = (team: string): string => {
  const teamMap: { [key: string]: string } = {
    'ARI': '/Images/NFL_Logos/ARI.png',
    'ATL': '/Images/NFL_Logos/ATL.png',
    'BAL': '/Images/NFL_Logos/BAL.png',
    'BUF': '/Images/NFL_Logos/BUF.png',
    'CAR': '/Images/NFL_Logos/CAR.png',
    'CHI': '/Images/NFL_Logos/CHI.png',
    'CIN': '/Images/NFL_Logos/CIN.png',
    'CLE': '/Images/NFL_Logos/CLE.png',
    'DAL': '/Images/NFL_Logos/DAL.png',
    'DEN': '/Images/NFL_Logos/DEN.png',
    'DET': '/Images/NFL_Logos/DET.png',
    'GB': '/Images/NFL_Logos/GB.png',
    'HOU': '/Images/NFL_Logos/HOU.png',
    'IND': '/Images/NFL_Logos/IND.png',
    'JAX': '/Images/NFL_Logos/JAX.png',
    'KC': '/Images/NFL_Logos/KC.png',
    'LV': '/Images/NFL_Logos/LV.png',
    'LAC': '/Images/NFL_Logos/LAC.png',
    'LAR': '/Images/NFL_Logos/LAR.png',
    'MIA': '/Images/NFL_Logos/MIA.png',
    'MIN': '/Images/NFL_Logos/MIN.png',
    'NE': '/Images/NFL_Logos/NE.png',
    'NO': '/Images/NFL_Logos/NO.png',
    'NYG': '/Images/NFL_Logos/NYG.png',
    'NYJ': '/Images/NFL_Logos/NYJ.png',
    'PHI': '/Images/NFL_Logos/PHI.png',
    'PIT': '/Images/NFL_Logos/PIT.png',
    'SF': '/Images/NFL_Logos/SF.png',
    'SEA': '/Images/NFL_Logos/SEA.png',
    'TB': '/Images/NFL_Logos/TB.png',
    'TEN': '/Images/NFL_Logos/TEN.png',
    'WAS': '/Images/NFL_Logos/WAS.png'
  }
  return teamMap[team] || '/Images/NFL_Logos/NFL.png'
}

// Bookmaker logo helper
const getBookmakerLogo = (bookmaker: string): string => {
  const bookmakerMap: { [key: string]: string } = {
    'DraftKings': '/Images/Sportsbook_Logos/DraftKingsLogo.png',
    'FanDuel': '/Images/Sportsbook_Logos/FanDuelLogo.png',
    'BetMGM': '/Images/Sportsbook_Logos/BetMGMLogo.png',
    'Caesars Sportsbook': '/Images/Sportsbook_Logos/CaesarsLogo.png',
    'Bet365': '/Images/Sportsbook_Logos/Bet365Logo.png',
    'BetRivers': '/Images/Sportsbook_Logos/betriverslogo.png',
    'Fanatics': '/Images/Sportsbook_Logos/Fanatics.jpeg',
    'ESPN Bet': '/Images/Sportsbook_Logos/ESPNBetLogo.png',
    'Bally Bet': '/Images/Sportsbook_Logos/BallyBetLogo.png',
    'Hard Rock': '/Images/Sportsbook_Logos/HardRockLogo.png',
    'Pinnacle': '/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg',
    'BetOnline': '/Images/Sportsbook_Logos/BetOnlineLogo.png',
    'Fliff': '/Images/Sportsbook_Logos/FliffLogo.png',
    'Novig': '/Images/Sportsbook_Logos/NovigLogo.png',
    'PrizePicks': '/Images/Sportsbook_Logos/PrizePicksLogo.png',
    'Underdog': '/Images/Sportsbook_Logos/UnderdogLogo.png',
    'Sleeper': '/Images/Sportsbook_Logos/SleeperLogo.png',
    'ProphetX': '/Images/Sportsbook_Logos/ProphetXLogo.png'
  }
  return bookmakerMap[bookmaker] || '/Images/Sportsbook_Logos/DraftKingsLogo.png'
}

export default function PlayerPropDashboard() {
  const params = useParams()
  const playerId = params.player_id as string
  
  // State
  const [gamelogs, setGamelogs] = useState<PlayerGamelog[]>([])
  const [selectedProp, setSelectedProp] = useState<SelectedProp | null>(null)
  const [availableProps, setAvailableProps] = useState<string[]>([])
  const [lineValue, setLineValue] = useState<number>(0)
  const [lineRange, setLineRange] = useState<{ min: number; max: number }>({ min: 0, max: 100 })
  const [bestOdds, setBestOdds] = useState<number | null>(null)
  const [allPlayerProps, setAllPlayerProps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load selected prop from sessionStorage
  useEffect(() => {
    const storedProp = sessionStorage.getItem('selectedProp')
    if (storedProp) {
      setSelectedProp(JSON.parse(storedProp))
    }
  }, [])

  // Fetch gamelogs data
  useEffect(() => {
    const fetchGamelogs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/nfl/players/${playerId}/gamelogs`)
        if (!response.ok) {
          throw new Error('Failed to fetch player gamelogs')
        }
        const data = await response.json()
        setGamelogs(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (playerId) {
      fetchGamelogs()
    }
  }, [playerId])

  // Fetch available props for the player
  useEffect(() => {
    const fetchAvailableProps = async () => {
      try {
        console.log('Fetching props for player:', playerId)
        
        // Fetch all props data in batches
        let allProps: any[] = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const response = await fetch(`/api/nfl/props?page=${page}&limit=1000`)
          if (!response.ok) {
            throw new Error('Failed to fetch player props')
          }
          const data = await response.json()
          
          allProps = [...allProps, ...data.data]
          hasMore = data.pagination.hasNext
          page++
          
          // Safety break to prevent infinite loops
          if (page > 10) break
        }
        
        console.log('Total props fetched:', allProps.length)
        
        // Filter props for this specific player
        const playerProps = allProps.filter((prop: any) => prop.kw_player_id === playerId)
        console.log('Props for player:', playerProps.length)
        
        const uniqueProps = [...new Set(playerProps.map((prop: any) => prop.prop_name))]
        console.log('Unique props:', uniqueProps)
        
        setAvailableProps(uniqueProps.sort())
        setAllPlayerProps(playerProps)
        
        // Calculate line range for the selected prop
        if (selectedProp) {
          const selectedPropData = playerProps.filter((prop: any) => prop.prop_name === selectedProp.propName)
          if (selectedPropData.length > 0) {
            const lines = selectedPropData.map((prop: any) => prop.line).filter((line: any) => line != null)
            if (lines.length > 0) {
              const minLine = Math.min(...lines)
              const maxLine = Math.max(...lines)
              setLineRange({ min: minLine, max: maxLine })
              setLineValue(selectedProp.line)
              console.log('Line range:', { min: minLine, max: maxLine })
            }
          }
        }
      } catch (err) {
        console.error('Error fetching available props:', err)
      }
    }

    if (playerId) {
      fetchAvailableProps()
    }
  }, [playerId, selectedProp])

  // Update line range when selected prop changes
  useEffect(() => {
    if (selectedProp && availableProps.length > 0) {
      // Re-fetch props to get line range for the new prop
      const fetchLineRange = async () => {
        try {
          let allProps: any[] = []
          let page = 1
          let hasMore = true
          
          while (hasMore) {
            const response = await fetch(`/api/nfl/props?page=${page}&limit=1000`)
            if (!response.ok) break
            
            const data = await response.json()
            allProps = [...allProps, ...data.data]
            hasMore = data.pagination.hasNext
            page++
            
            if (page > 10) break
          }
          
          const playerProps = allProps.filter((prop: any) => prop.kw_player_id === playerId)
          const selectedPropData = playerProps.filter((prop: any) => prop.prop_name === selectedProp.propName)
          
          if (selectedPropData.length > 0) {
            const lines = selectedPropData.map((prop: any) => prop.line).filter((line: any) => line != null)
            if (lines.length > 0) {
              const minLine = Math.min(...lines)
              const maxLine = Math.max(...lines)
              setLineRange({ min: minLine, max: maxLine })
              setLineValue(selectedProp.line)
            }
          }
        } catch (err) {
          console.error('Error fetching line range:', err)
        }
      }
      
      fetchLineRange()
    }
  }, [selectedProp, playerId])

  // Calculate best odds for current prop and line
  const bestOddsInfo = useMemo(() => {
    if (!selectedProp || !lineValue || allPlayerProps.length === 0) return null

    // Find props matching the current selection
    const matchingProps = allPlayerProps.filter((prop: any) => 
      prop.prop_name === selectedProp.propName &&
      prop.O_U === selectedProp.ou &&
      Math.abs(prop.line - lineValue) < 0.1 // Allow small floating point differences
    )

    if (matchingProps.length === 0) return null

    // Find the prop with the highest price_american
    const bestProp = matchingProps.reduce((best, current) => 
      current.price_american > best.price_american ? current : best
    )

    return {
      price: bestProp.price_american,
      bookmaker: bestProp.bookmaker,
      link: bestProp.outcome_link
    }
  }, [selectedProp, lineValue, allPlayerProps])

  // Chart filter state
  const [chartFilters, setChartFilters] = useState({
    season: 'all', // 'all', '2024', '2025'
    games: 'all', // 'all', 'L20', 'L15', 'L10', 'L5'
    venue: 'all' // 'all', 'Home', 'Away'
  })

  // Process data for charts
  const chartData = useMemo(() => {
    if (!selectedProp || !gamelogs.length) return []

    const field = getPropField(selectedProp.propName)
    const line = lineValue || selectedProp.line
    const isOver = selectedProp.ou === 'Over'

    let filteredGamelogs = gamelogs

    // Apply season filter
    if (chartFilters.season !== 'all') {
      filteredGamelogs = filteredGamelogs.filter(game => game.season.toString() === chartFilters.season)
    }

    // Apply games filter
    if (chartFilters.games !== 'all') {
      const gameCount = parseInt(chartFilters.games.replace('L', ''))
      filteredGamelogs = filteredGamelogs.slice(-gameCount)
    }

    // Apply venue filter
    if (chartFilters.venue !== 'all') {
      filteredGamelogs = filteredGamelogs.filter(game => 
        chartFilters.venue === 'Home' ? game.venue === 'Home' : game.venue === 'Away'
      )
    }

    return filteredGamelogs.map((game, index) => {
      let statValue = 0
      
      // Handle different field types
      if (field === 'rushing_yards + receiving_yards') {
        statValue = (game.rushing_yards || 0) + (game.receiving_yards || 0)
      } else {
        statValue = game[field as keyof PlayerGamelog] as number || 0
      }

      const isWin = isOver ? statValue > line : statValue < line
      
      return {
        week: game.week,
        season: game.season,
        opponent: game.opponent,
        stat: statValue,
        line: line,
        isWin: isWin,
        color: isWin ? '#10b981' : '#ef4444', // green or red
        game: `Week ${game.week} vs ${game.opponent}`,
        opponentAbbr: game.opponent
      }
    }).sort((a, b) => {
      // Sort by season then week, most recent on right
      if (a.season !== b.season) {
        return a.season - b.season
      }
      return a.week - b.week
    })
  }, [selectedProp, gamelogs, chartFilters, lineValue])

  // Process secondary chart data
  const secondaryChartData = useMemo(() => {
    if (!selectedProp || !gamelogs.length) return []

    const secondaryStat = getSecondaryStat(selectedProp.propName)
    const line = lineValue || selectedProp.line
    const isOver = selectedProp.ou === 'Over'

    let filteredGamelogs = gamelogs

    // Apply same filters as main chart
    if (chartFilters.season !== 'all') {
      filteredGamelogs = filteredGamelogs.filter(game => game.season.toString() === chartFilters.season)
    }

    if (chartFilters.games !== 'all') {
      const gameCount = parseInt(chartFilters.games.replace('L', ''))
      filteredGamelogs = filteredGamelogs.slice(-gameCount)
    }

    if (chartFilters.venue !== 'all') {
      filteredGamelogs = filteredGamelogs.filter(game => 
        chartFilters.venue === 'Home' ? game.venue === 'Home' : game.venue === 'Away'
      )
    }

    return filteredGamelogs.map((game, index) => {
      let statValue = 0
      
      if (secondaryStat.calculation) {
        statValue = secondaryStat.calculation(game)
      } else {
        statValue = game[secondaryStat.field as keyof PlayerGamelog] as number || 0
      }

      // For secondary chart, we'll show the stat value without win/loss coloring
      return {
        week: game.week,
        season: game.season,
        opponent: game.opponent,
        stat: Math.round(statValue * 100) / 100, // Round to 2 decimal places
        game: `Week ${game.week} vs ${game.opponent}`,
        opponentAbbr: game.opponent
      }
    }).sort((a, b) => {
      if (a.season !== b.season) {
        return a.season - b.season
      }
      return a.week - b.week
    })
  }, [selectedProp, gamelogs, chartFilters, lineValue])

  // Process trend chart data
  const trendChartData = useMemo(() => {
    if (!selectedProp || !gamelogs.length) return []

    const trendStat = getTrendStat(selectedProp.propName)
    const line = lineValue || selectedProp.line
    const isOver = selectedProp.ou === 'Over'

    let filteredGamelogs = gamelogs

    // Apply same filters as main chart
    if (chartFilters.season !== 'all') {
      filteredGamelogs = filteredGamelogs.filter(game => game.season.toString() === chartFilters.season)
    }

    if (chartFilters.games !== 'all') {
      const gameCount = parseInt(chartFilters.games.replace('L', ''))
      filteredGamelogs = filteredGamelogs.slice(-gameCount)
    }

    if (chartFilters.venue !== 'all') {
      filteredGamelogs = filteredGamelogs.filter(game => 
        chartFilters.venue === 'Home' ? game.venue === 'Home' : game.venue === 'Away'
      )
    }

    return filteredGamelogs.map((game, index) => {
      let statValue = 0
      
      if (trendStat.calculation) {
        statValue = trendStat.calculation(game)
      } else {
        statValue = game[trendStat.field as keyof PlayerGamelog] as number || 0
      }

      return {
        week: game.week,
        season: game.season,
        opponent: game.opponent,
        stat: Math.round(statValue * 100) / 100, // Round to 2 decimal places
        game: `Week ${game.week} vs ${game.opponent}`,
        opponentAbbr: game.opponent
      }
    }).sort((a, b) => {
      if (a.season !== b.season) {
        return a.season - b.season
      }
      return a.week - b.week
    })
  }, [selectedProp, gamelogs, chartFilters, lineValue])

  // Calculate stats
  const stats = useMemo(() => {
    if (!chartData.length) return null

    const wins = chartData.filter(d => d.isWin).length
    const total = chartData.length
    const winRate = total > 0 ? (wins / total) * 100 : 0
    const avgStat = chartData.reduce((sum, d) => sum + d.stat, 0) / total
    const maxStat = Math.max(...chartData.map(d => d.stat))
    const minStat = Math.min(...chartData.map(d => d.stat))

    return {
      winRate: Math.round(winRate),
      avgStat: Math.round(avgStat),
      maxStat,
      minStat,
      wins,
      total
    }
  }, [chartData])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading player data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error: {error}</div>
          <Link href="/nfl/tools/prop-lab">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Prop Lab
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!gamelogs.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="text-lg mb-4">No gamelog data found for this player</div>
          <Link href="/nfl/tools/prop-lab">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Prop Lab
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const player = gamelogs[0] // Use first game for player info
  const currentTeam = player.team_2025

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/nfl/tools/prop-lab">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Prop Lab
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {player.espn_headshot ? (
                <Image
                  src={player.espn_headshot}
                  alt={player.player_name}
                  width={80}
                  height={80}
                  className="rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center text-2xl font-bold">
                  {player.player_name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl font-semibold">{player.player_name}</h1>
                <Image
                  src={getTeamLogo(currentTeam)}
                  alt={currentTeam}
                  width={24}
                  height={24}
                  className="rounded"
                />
                <Badge variant="secondary" className="text-sm px-2 py-1">
                  {player.position}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.avgStat}</div>
              <div className="text-sm text-muted-foreground">Avg {selectedProp?.propName}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.maxStat}</div>
              <div className="text-sm text-muted-foreground">Best Game</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.wins}/{stats.total}</div>
              <div className="text-sm text-muted-foreground">Wins/Total</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section - 2/3 Main Chart, 1/3 Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedProp ? `${selectedProp.ou} ${lineValue || selectedProp.line} ${selectedProp.propName}` : 'Performance'}
                </CardTitle>
                {bestOddsInfo && (
                  <div className="flex items-center gap-2">
                    <Image
                      src={getBookmakerLogo(bestOddsInfo.bookmaker)}
                      alt={bestOddsInfo.bookmaker}
                      width={20}
                      height={20}
                      className="rounded-sm"
                    />
                    <a
                      href={bestOddsInfo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand-blue hover:text-brand-blue/80 transition-colors"
                    >
                      {bestOddsInfo.price > 0 ? '+' : ''}{bestOddsInfo.price}
                    </a>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chart Filters */}
              <div className="flex flex-wrap gap-2 p-6 pb-4">
                {/* Season Filter */}
                <div className="flex gap-1">
                  <Button
                    variant={chartFilters.season === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, season: 'all' }))}
                  >
                    All
                  </Button>
                  <Button
                    variant={chartFilters.season === '2024' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, season: '2024' }))}
                  >
                    2024
                  </Button>
                  <Button
                    variant={chartFilters.season === '2025' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, season: '2025' }))}
                  >
                    2025
                  </Button>
                </div>

                {/* Games Filter */}
                <div className="flex gap-1">
                  <Button
                    variant={chartFilters.games === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, games: 'all' }))}
                  >
                    All
                  </Button>
                  <Button
                    variant={chartFilters.games === 'L20' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, games: 'L20' }))}
                  >
                    L20
                  </Button>
                  <Button
                    variant={chartFilters.games === 'L15' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, games: 'L15' }))}
                  >
                    L15
                  </Button>
                  <Button
                    variant={chartFilters.games === 'L10' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, games: 'L10' }))}
                  >
                    L10
                  </Button>
                  <Button
                    variant={chartFilters.games === 'L5' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, games: 'L5' }))}
                  >
                    L5
                  </Button>
                </div>

                {/* Venue Filter */}
                <div className="flex gap-1">
                  <Button
                    variant={chartFilters.venue === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, venue: 'all' }))}
                  >
                    All
                  </Button>
                  <Button
                    variant={chartFilters.venue === 'Home' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, venue: 'Home' }))}
                  >
                    Home
                  </Button>
                  <Button
                    variant={chartFilters.venue === 'Away' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartFilters(prev => ({ ...prev, venue: 'Away' }))}
                  >
                    Away
                  </Button>
                </div>

                {/* Prop Selector */}
                <div className="flex gap-1 ml-auto">
                  <Select
                    value={selectedProp?.propName || ''}
                    onValueChange={(value) => {
                      if (value && selectedProp) {
                        setSelectedProp({
                          ...selectedProp,
                          propName: value
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Prop" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProps.map((prop) => (
                        <SelectItem key={prop} value={prop}>
                          {prop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

                  <div className="h-96 px-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                      >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      horizontal={true} 
                      vertical={false}
                      stroke="hsl(var(--muted))"
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="opponentAbbr" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'stat' ? `${value} ${selectedProp?.propName}` : value,
                        name === 'stat' ? 'Stat' : name
                      ]}
                      labelFormatter={(label) => `vs ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="stat" 
                      radius={[4, 4, 0, 0]}
                      label={{ 
                        position: 'top', 
                        fill: 'hsl(var(--foreground))', 
                        fontSize: 10 
                      }}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                    <ReferenceLine 
                      y={lineValue || selectedProp?.line} 
                      stroke="#ffc658" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    >
                      <Label 
                        value={`Line: ${lineValue || selectedProp?.line}`}
                        position="right"
                        fill="#ffc658"
                        fontSize={12}
                      />
                    </ReferenceLine>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Slider */}
              <div className="p-6 pt-4 border-t">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Line Value: {lineValue || selectedProp?.line}
                    </label>
                    <div className="text-xs text-muted-foreground">
                      Range: {lineRange.min} - {lineRange.max}
                    </div>
                  </div>
                  <Slider
                    value={[lineValue || selectedProp?.line || 0]}
                    onValueChange={(value) => setLineValue(value[0])}
                    min={lineRange.min}
                    max={lineRange.max}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts - 1/3 width */}
        <div className="space-y-6">
          {/* Prop-Specific Secondary Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                {selectedProp ? getSecondaryStat(selectedProp.propName).label : 'Secondary Stats'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={secondaryChartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      horizontal={true} 
                      vertical={false}
                      stroke="hsl(var(--muted))"
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="opponentAbbr" 
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      fontSize={8}
                      tick={{ fontSize: 8 }}
                    />
                    <YAxis fontSize={8} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}`, getSecondaryStat(selectedProp?.propName || '').label]}
                      labelFormatter={(label) => `vs ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '10px'
                      }}
                    />
                    <Bar 
                      dataKey="stat" 
                      fill="#8884d8"
                      radius={[2, 2, 0, 0]}
                      label={{ 
                        position: 'top', 
                        fill: 'hsl(var(--foreground))', 
                        fontSize: 8 
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Prop-Specific Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <TrendingDown className="w-4 h-4 mr-2" />
                {selectedProp ? getTrendStat(selectedProp.propName).label : 'Trend Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={trendChartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      horizontal={true} 
                      vertical={false}
                      stroke="hsl(var(--muted))"
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="week" 
                      fontSize={8}
                      tick={{ fontSize: 8 }}
                    />
                    <YAxis fontSize={8} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}`, getTrendStat(selectedProp?.propName || '').label]}
                      labelFormatter={(week) => `Week ${week}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '10px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="stat" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Performance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Zap className="w-4 h-4 mr-2" />
                Recent Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last 5 Games</span>
                  <span className="text-sm font-medium">
                    {chartData.slice(-5).filter(d => d.isWin).length}/5
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Last 10 Games</span>
                  <span className="text-sm font-medium">
                    {chartData.slice(-10).filter(d => d.isWin).length}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Last 5</span>
                  <span className="text-sm font-medium">
                    {Math.round(chartData.slice(-5).reduce((sum, d) => sum + d.stat, 0) / 5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Streak</span>
                  <span className="text-sm font-medium">
                    {(() => {
                      const recent = chartData.slice(-5).reverse()
                      let streak = 0
                      for (const game of recent) {
                        if (game.isWin) streak++
                        else break
                      }
                      return streak > 0 ? `W${streak}` : 'L' + (recent.length - streak)
                    })()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
