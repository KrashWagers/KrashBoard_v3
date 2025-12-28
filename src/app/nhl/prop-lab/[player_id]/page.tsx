"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import Link from "next/link"
import { GoalsDashboard } from "./GoalsDashboard"
import { ShotsDashboard } from "./ShotsDashboard"
import { AssistsDashboard } from "./AssistsDashboard"
import { PointsDashboard } from "./PointsDashboard"
import { PlayerVsOpponentHistory } from "./PlayerVsOpponentHistory"
import { IceRinkVisualization } from "./IceRinkVisualization"
import { ArrowLeft, RotateCcw, ChevronDown, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PlayerGamelog {
  [key: string]: any
}

interface SelectedProp {
  propName: string
  line: number
  ou: string
  playerId: string
  playerName: string
}

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
    'TOR': '/Images/NHL_Logos/TOR.png', 'VAN': '/Images/NHL_Logos/VAN.png', 'VGK': '/Images/NHL_Logos/VGK.png',
    'WPG': '/Images/NHL_Logos/WPG.png', 'WSH': '/Images/NHL_Logos/WSH.png'
  }
  return teamMap[abbrev] || '/Images/League_Logos/NHL-Logo.png'
}

const getBookmakerLogo = (bookmaker: string): string => {
  const bookmakerMap: { [key: string]: string } = {
    'Fanatics': '/Images/Sportsbook_Logos/Fanatics.jpeg',
    'BetRivers': '/Images/Sportsbook_Logos/betriverslogo.png',
    'DraftKings': '/Images/Sportsbook_Logos/DraftKingsLogo.png',
    'FanDuel': '/Images/Sportsbook_Logos/fanDuel.jpg',
    'Pinnacle': '/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg',
    'BetMGM': '/Images/Sportsbook_Logos/betmgm.png'
  }
  return bookmakerMap[bookmaker] || ''
}

export default function NHLPlayerPropDashboard() {
  const params = useParams()
  const playerId = params.player_id as string
  
  const [gamelogs, setGamelogs] = useState<PlayerGamelog[]>([])
  const [allProps, setAllProps] = useState<any[]>([])
  const [selectedProp, setSelectedProp] = useState<SelectedProp | null>(null)
  const [availableProps, setAvailableProps] = useState<string[]>([])
  const [lineValue, setLineValue] = useState(0.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Separate filter states - time filters are mutually exclusive, venue works independently
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [venueFilter, setVenueFilter] = useState<string>('all')
  const [daysRestFilter, setDaysRestFilter] = useState<string>('all')
  const [gameTimeFilter, setGameTimeFilter] = useState<string>('all')
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState<string>('all')
  
  // Reset all filters to default
  const resetFilters = () => {
    setTimeFilter('all')
    setVenueFilter('all')
    setDaysRestFilter('all')
    setGameTimeFilter('all')
    setDayOfWeekFilter('all')
  }
  
  // Format position to add W for wing positions
  const formatPosition = (pos: string): string => {
    if (!pos) return ''
    const upperPos = pos.toUpperCase()
    if (upperPos === 'L' || upperPos === 'R') {
      return `${upperPos}W`
    }
    return pos
  }
  
  // Load selected prop from sessionStorage
  useEffect(() => {
    const storedProp = sessionStorage.getItem('selectedNHLProp')
    if (storedProp) {
      const prop = JSON.parse(storedProp)
      setSelectedProp(prop)
      setLineValue(prop.line)
    }
  }, [])
  
  // Fetch gamelogs and all props data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch gamelogs
        const gamelogsResponse = await fetch(`/api/nhl/players/${playerId}/gamelogs`)
        if (!gamelogsResponse.ok) throw new Error('Failed to fetch gamelogs')
        const gamelogsData = await gamelogsResponse.json()
        setGamelogs(gamelogsData.data)
        
        // Get player name from gamelogs for matching with props
        const playerName = gamelogsData.data[0]?.player_name
        
        if (!playerName) {
          throw new Error('Player name not found in gamelogs')
        }
        
        // Fetch all props to get available prop types
        let propsArray: any[] = []
        let page = 1
        while (page <= 5) {
          const response = await fetch(`/api/nhl/props?page=${page}&limit=1000`)
          if (!response.ok) break
          const data = await response.json()
          propsArray = [...propsArray, ...data.data]
          if (!data.pagination.hasNext) break
          page++
        }
        
        // Filter props for this player by matching player name
        // The props API returns "kw_player_name" field, gamelogs use "player_name"
        const playerProps = propsArray.filter((prop: any) => 
          prop.kw_player_name?.trim().toLowerCase() === playerName.trim().toLowerCase()
        )
        
        console.log('Player name from gamelogs:', playerName)
        console.log('Total props fetched:', propsArray.length)
        console.log('Props matched for this player:', playerProps.length)
        if (playerProps.length > 0) {
          console.log('Sample prop:', playerProps[0])
        }
        
        const uniqueProps = [...new Set(playerProps.map((prop: any) => prop.prop_name))].sort()
        setAvailableProps(uniqueProps)
        setAllProps(playerProps)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    if (playerId) fetchData()
  }, [playerId])
  
  // Filter gamelogs based on active filters
  const filteredGamelogs = useMemo(() => {
    let filtered = [...gamelogs]
    
    // FIRST: Apply season filter if needed
    if (timeFilter === '20242025') {
      filtered = filtered.filter(game => game.season_id === '20242025')
    } else if (timeFilter === '20252026') {
      filtered = filtered.filter(game => game.season_id === '20252026')
    }
    
    // Apply venue filter BEFORE sorting
    if (venueFilter !== 'all') {
      filtered = filtered.filter(game => {
        const gameVenue = game.venue?.trim() || ''
        return gameVenue.toLowerCase() === venueFilter.toLowerCase()
      })
    }
    
    // Apply days rest filter
    if (daysRestFilter !== 'all') {
      if (daysRestFilter === '3') {
        // 3D+ means 3 or more days rest
        filtered = filtered.filter(game => game.days_rest >= 3)
      } else {
        const daysRest = parseInt(daysRestFilter)
        filtered = filtered.filter(game => game.days_rest === daysRest)
      }
    }
    
    // Apply game time bucket filter
    if (gameTimeFilter !== 'all') {
      filtered = filtered.filter(game => {
        const gameTime = game.game_time_bucket?.trim() || ''
        return gameTime.toLowerCase() === gameTimeFilter.toLowerCase()
      })
    }
    
    // Apply day of week filter
    if (dayOfWeekFilter !== 'all') {
      filtered = filtered.filter(game => {
        const dayOfWeek = game.day_of_week?.trim() || ''
        return dayOfWeek.toLowerCase() === dayOfWeekFilter.toLowerCase()
      })
    }
    
    // Sort by game_date DESCENDING (newest first)
    filtered.sort((a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime())
    
    // NOW apply L10/L30/L50 - take the most recent games from the start
    if (timeFilter.startsWith('L')) {
      const count = parseInt(timeFilter.replace('L', ''))
      filtered = filtered.slice(0, count)
    }
    
    // Reverse so oldest is first (chart order: oldest on left, newest on right)
    filtered.reverse()
    
    return filtered
  }, [gamelogs, timeFilter, venueFilter, daysRestFilter, gameTimeFilter, dayOfWeekFilter])
  
  // Calculate stats from filtered data
  const stats = useMemo(() => {
    if (!selectedProp || !filteredGamelogs.length) return null
    
    const line = lineValue
    const isOver = selectedProp.ou === 'Over'
    const field = getPropField(selectedProp.propName)
    
    const results = filteredGamelogs.map(game => {
      const value = game[field] || 0
      // For Over: need value > line, for Under: need value < line
      const hit = isOver ? value > line : value < line
      return { value, hit, game }
    })
    
    const hits = results.filter(r => r.hit).length
    const total = results.length
    const hitRate = total > 0 ? (hits / total) * 100 : 0
    const avgValue = total > 0 ? results.reduce((sum, r) => sum + r.value, 0) / total : 0
    const recent10 = results.slice(-10)
    const recentHits = recent10.filter(r => r.hit).length
    
    return { hitRate: Math.round(hitRate), hits, total, avgValue, recentHits, recentTotal: recent10.length }
  }, [selectedProp, filteredGamelogs, lineValue])
  
  // Get prop field mapping
  function getPropField(propName: string): string {
    const mappings: { [key: string]: string } = {
      'Goals': 'goals',
      'Assists': 'assists',
      'Ast': 'assists',
      'Points': 'points',
      'Pts': 'points',
      'Shots on Goal': 'shots_on_goal',
      'Shots': 'shots_on_goal',
      'SOG': 'shots_on_goal',
      'Corsi': 'corsi',
      'Fenwick': 'fenwick',
      'Blocks': 'blocks',
      'Hits': 'hits_for',
    }
    return mappings[propName] || 'goals'
  }

  // Get available lines for current prop - MUST be before early returns
  const availableLines = useMemo(() => {
    if (!selectedProp || !allProps.length) return []
    
    // Match prop_name and O_U (Over/Under) from the API
    const propLines = allProps.filter(p => 
      p.prop_name === selectedProp.propName && 
      p.O_U === selectedProp.ou
    )
    
    console.log('Available lines filter:', {
      selectedPropName: selectedProp.propName,
      selectedOU: selectedProp.ou,
      allPropsCount: allProps.length,
      matchingLines: propLines.length
    })
    
    // Group by line value, collect all books for each line
    const lineMap = new Map()
    propLines.forEach(prop => {
      if (!lineMap.has(prop.line)) {
        lineMap.set(prop.line, {
          line: prop.line,
          books: [],
          bestOdds: null,
          bestBook: null
        })
      }
      
      const lineData = lineMap.get(prop.line)
      lineData.books.push(prop)
      
      // Track the best odds for this line
      if (!lineData.bestOdds || (prop.price_american && prop.price_american > lineData.bestOdds)) {
        lineData.bestOdds = prop.price_american
        lineData.bestBook = prop
      }
    })
    
    // Sort books within each line by odds (descending)
    lineMap.forEach(lineData => {
      lineData.books.sort((a: any, b: any) => (b.price_american || -Infinity) - (a.price_american || -Infinity))
    })
    
    return Array.from(lineMap.values()).sort((a, b) => a.line - b.line)
  }, [selectedProp, allProps])
  
  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }
  
  if (error || !selectedProp || !gamelogs.length) {
    return (
      <div className="w-full p-4">
        <div className="text-center py-8">
          <div className="text-red-500 text-sm mb-4">{error || 'No data available'}</div>
          <Link href="/nhl/tools/prop-lab">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prop Lab
            </Button>
          </Link>
        </div>
      </div>
    )
  }
  
  const player = gamelogs[0]

  // Define prop order and implementation status
  const propOrder = [
    'SOG',
    'Goals', 
    'Ast',
    'Pts',
    'PP Pts',
    'First Goal Scorer',
    'Last Goal Scorer'
  ]

  // Props that don't have dashboards yet
  const unimplementedProps = ['PP Pts', 'First Goal Scorer', 'Last Goal Scorer']

  // Normalize prop names for matching
  const normalizeProps = (propName: string) => {
    const mappings: { [key: string]: string } = {
      'Shots on Goal': 'SOG',
      'Shots': 'SOG',
      'Assists': 'Ast',
      'Points': 'Pts'
    }
    return mappings[propName] || propName
  }

  // Create ordered list with availability status
  const orderedProps = propOrder.map(prop => {
    const hasData = availableProps.some(p => normalizeProps(p) === prop)
    const isImplemented = !unimplementedProps.includes(prop)
    const isAvailable = hasData && isImplemented
    
    return {
      displayName: prop,
      hasData,
      isImplemented,
      isAvailable,
      actualPropName: availableProps.find(p => normalizeProps(p) === prop) || prop
    }
  })

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-[1600px] mx-auto p-3 md:p-4 lg:p-5 space-y-3" style={{ fontSize: '0.9rem' }}>
        {/* Back Button */}
        <Link href="/nhl/tools/prop-lab">
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Props</span>
          </Button>
        </Link>

        {/* Hero Section - PropsMadness Style */}
        <Card className="border border-gray-700 bg-[#171717] shadow-lg transition-all duration-200 hover:border-gray-600">
          <CardContent className="p-0">
            {/* Prop Type Tabs */}
            <div className="border-b border-border">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {orderedProps.map((prop) => {
                  const isActive = normalizeProps(selectedProp.propName) === prop.displayName
                  const isDisabled = !prop.isAvailable
                  
                  return (
                    <button
                      key={prop.displayName}
                      onClick={() => {
                        if (prop.isAvailable) {
                          setSelectedProp(prev => prev ? {...prev, propName: prop.actualPropName} : null)
                        }
                      }}
                      disabled={isDisabled}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        isActive 
                          ? 'border-green-500 text-green-500' 
                          : isDisabled
                            ? 'border-transparent text-gray-600 cursor-not-allowed'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
                      }`}
                    >
                      {prop.displayName}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Player Info & Stats Section */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_350px] gap-3 items-center">
                {/* Left: Player Info */}
                <div className="flex items-center gap-3">
                  {player['Headshot URL'] && (
                    <div className="relative">
                      <Image 
                        src={player['Headshot URL']} 
                        alt={player.player_name} 
                        width={80} 
                        height={80} 
                        className="rounded-full border-2 border-border shadow-lg" 
                      />
                      {player.player_team_abbrev && (
                        <div className="absolute -bottom-2 -right-2 flex items-center justify-center">
                          <Image 
                            src={getNHLTeamLogo(player.player_team_abbrev)} 
                            alt={player.player_team_abbrev} 
                            width={40} 
                            height={40}
                            style={{ backgroundColor: 'transparent' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{player.player_name}</h1>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      {player.player_team_abbrev && (
                        <span className="font-medium">{player.player_team_abbrev}</span>
                      )}
                      {player.Pos && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{formatPosition(player.Pos)}</span>
                        </>
                      )}
                      {player.Hand && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{player.Hand}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Key Stats */}
                <div className="flex items-center justify-center gap-6">
                  {/* Hit Rate (Percentage) */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Hit Rate</div>
                    <div className="text-3xl font-bold text-green-500">
                      {stats?.hitRate}%
                    </div>
                  </div>
                  
                  {/* Hit Rate (Fraction) */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Hit Rate</div>
                    <div className="text-3xl font-bold">
                      {stats?.hits}/{stats?.total}
                    </div>
                  </div>
                  
                  {/* Average */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Average</div>
                    <div className="text-3xl font-bold text-green-500">
                      {stats?.avgValue.toFixed(1)}
                    </div>
                  </div>
                  
                  {/* Implied Win % */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Implied Win %</div>
                    <div className="text-3xl font-bold">
                      {(() => {
                        const selectedLine = availableLines.find(l => l.line === lineValue)
                        if (!selectedLine || !selectedLine.bestOdds) return '-'
                        
                        const odds = selectedLine.bestOdds
                        let impliedPct: number
                        
                        if (odds > 0) {
                          // Positive odds: 100 / (odds + 100)
                          impliedPct = (100 / (odds + 100)) * 100
                        } else {
                          // Negative odds: |odds| / (|odds| + 100)
                          impliedPct = (Math.abs(odds) / (Math.abs(odds) + 100)) * 100
                        }
                        
                        return `${impliedPct.toFixed(1)}%`
                      })()}
                    </div>
                  </div>
                  
                  {/* Hit Rate vs IW% */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      HR vs IW%
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground hover:text-foreground transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="space-y-2">
                              <p className="font-semibold">HR VS IW% = Hit Rate vs Implied Win %</p>
                              <div className="space-y-1 text-xs">
                                <p>
                                  <strong>Implied Win %</strong> is calculated from the best available odds:
                                </p>
                                <ul className="list-disc list-inside space-y-0.5 ml-1">
                                  <li>Positive odds: 100 ÷ (odds + 100) × 100</li>
                                  <li>Negative odds: |odds| ÷ (|odds| + 100) × 100</li>
                                </ul>
                                <p className="mt-2">
                                  We compare the hit rate being shown to the implied win % to get a basic value indicator. 
                                  This is not a catch-all indicator but could be useful for establishing value.
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-3xl font-bold">
                      {(() => {
                        const selectedLine = availableLines.find(l => l.line === lineValue)
                        if (!selectedLine || !selectedLine.bestOdds || !stats) return '-'
                        
                        const odds = selectedLine.bestOdds
                        let impliedPct: number
                        
                        if (odds > 0) {
                          impliedPct = (100 / (odds + 100)) * 100
                        } else {
                          impliedPct = (Math.abs(odds) / (Math.abs(odds) + 100)) * 100
                        }
                        
                        const difference = stats.hitRate - impliedPct
                        const color = difference > 0 ? 'text-green-500' : difference < 0 ? 'text-red-500' : ''
                        
                        return (
                          <span className={color}>
                            {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right: Available Lines */}
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Available Lines</div>
                  {availableLines.length > 0 ? (
                    <Select 
                      value={lineValue.toString()} 
                      onValueChange={(val) => setLineValue(parseFloat(val))}
                    >
                      <SelectTrigger className="h-auto p-0 border-0 bg-transparent [&>svg]:hidden">
                        {(() => {
                          const selectedLine = availableLines.find(l => l.line === lineValue)
                          if (!selectedLine || !selectedLine.bestBook) return <span>Select a line</span>
                          
                          const logoPath = getBookmakerLogo(selectedLine.bestBook.bookmaker)
                          
                          return (
                            <div className="flex items-center gap-3 p-4 rounded-md border border-green-500 bg-green-500/10 w-full">
                              {logoPath && (
                                <div className="w-8 h-5 relative flex items-center justify-center flex-shrink-0">
                                  <Image
                                    src={logoPath}
                                    alt={selectedLine.bestBook.bookmaker}
                                    width={32}
                                    height={20}
                                    className="object-contain rounded"
                                    onError={(e) => {
                                      console.error('Failed to load bookmaker logo:', logoPath)
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 text-left">
                                <div className="text-sm font-semibold">
                                  {selectedProp.ou} {selectedLine.line}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {selectedLine.bestOdds > 0 ? `+${selectedLine.bestOdds}` : selectedLine.bestOdds}
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )
                        })()}
                      </SelectTrigger>
                      <SelectContent className="border-gray-700 bg-[#171717]">
                        {availableLines.map((lineData) => (
                          <div key={lineData.line}>
                            {lineData.books.map((book: any, idx: number) => {
                              const logoPath = getBookmakerLogo(book.bookmaker)
                              return (
                                <SelectItem 
                                  key={`${lineData.line}-${book.bookmaker}`}
                                  value={lineData.line.toString()}
                                  className="focus:bg-green-500/10 focus:text-green-500"
                                >
                                  <div className="flex items-center gap-3 py-1">
                                    {logoPath && (
                                      <div className="w-8 h-5 relative flex items-center justify-center flex-shrink-0">
                                        <Image
                                          src={logoPath}
                                          alt={book.bookmaker}
                                          width={32}
                                          height={20}
                                          className="object-contain rounded"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <span className="text-sm">
                                        {selectedProp.ou} {lineData.line}
                                      </span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        ({book.price_american > 0 ? `+${book.price_american}` : book.price_american})
                                      </span>
                                    </div>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm text-muted-foreground">No lines available</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Filters - Clean, modern design */}
        <Card className="border border-gray-700 bg-[#171717] shadow-sm transition-all duration-200 hover:border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto">
              {/* Left: Main Filter Groups */}
              <div className="flex items-center gap-2 flex-nowrap flex-shrink-0">
                {/* Time Range Filter Group */}
                <div className="flex items-center gap-1 p-1.5 rounded-md bg-muted/10 border border-gray-700/50">
                  <span className="text-xs font-semibold text-muted-foreground mr-0.5">Period:</span>
                  <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2.5 text-xs font-medium transition-all ${
                    timeFilter === 'all' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2.5 text-xs font-medium transition-all ${
                    timeFilter === '20242025' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('20242025')}
                >
                  24/25
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2.5 text-xs font-medium transition-all ${
                    timeFilter === '20252026' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('20252026')}
                >
                  25/26
                </Button>
                <div className="w-px h-5 bg-border mx-0.5" />
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    timeFilter === 'L50' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('L50')}
                >
                  L50
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    timeFilter === 'L30' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('L30')}
                >
                  L30
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    timeFilter === 'L20' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('L20')}
                >
                  L20
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    timeFilter === 'L10' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('L10')}
                >
                  L10
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    timeFilter === 'L5' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setTimeFilter('L5')}
                >
                  L5
                </Button>
              </div>
              
              {/* Venue Filter Buttons */}
              <div className="flex items-center gap-1 p-1.5 rounded-md bg-muted/10 border border-gray-700/50">
                <span className="text-xs font-semibold text-muted-foreground mr-0.5">Venue:</span>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2.5 text-xs font-medium transition-all ${
                    venueFilter === 'all' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setVenueFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2.5 text-xs font-medium transition-all ${
                    venueFilter === 'Home' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setVenueFilter('Home')}
                >
                  Home
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2.5 text-xs font-medium transition-all ${
                    venueFilter === 'Away' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setVenueFilter('Away')}
                >
                  Away
                </Button>
              </div>
              
              {/* Days Rest Filter */}
              <div className="flex items-center gap-1 p-1.5 rounded-md bg-muted/10 border border-gray-700/50">
                <span className="text-xs font-semibold text-muted-foreground mr-0.5">Rest:</span>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    daysRestFilter === 'all' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setDaysRestFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    daysRestFilter === '0' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setDaysRestFilter('0')}
                >
                  0D
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    daysRestFilter === '1' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setDaysRestFilter('1')}
                >
                  1D
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    daysRestFilter === '2' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setDaysRestFilter('2')}
                >
                  2D
                </Button>
                <Button 
                  variant="ghost"
                  size="sm" 
                  className={`h-7 px-2 text-xs font-medium transition-all ${
                    daysRestFilter === '3' ? 'bg-green-500/10 border border-green-500/30 text-green-500' : ''
                  }`}
                  onClick={() => setDaysRestFilter('3')}
                >
                  3D+
                </Button>
              </div>
              
                {/* Game Time Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Time:</span>
                  <Select value={gameTimeFilter} onValueChange={setGameTimeFilter}>
                    <SelectTrigger className="h-7 w-[100px] text-xs border-gray-700 bg-background/50">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Times</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Day of Week Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Day:</span>
                  <Select value={dayOfWeekFilter} onValueChange={setDayOfWeekFilter}>
                    <SelectTrigger className="h-7 w-[100px] text-xs border-gray-700 bg-background/50">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Days</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: Reset Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="gap-1.5 h-7 px-3 border-gray-700 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 transition-all flex-shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="text-xs">Reset</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      
        {/* Main Content Grid - Responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-3">
          {/* Left Column - Charts */}
          <div className="min-w-0 space-y-3">
          {/* Dynamic Dashboard based on Prop Type */}
          {(selectedProp.propName === 'Goals' || selectedProp.propName.toLowerCase().includes('goal')) && (
            <GoalsDashboard 
              gamelogs={filteredGamelogs} 
              selectedProp={selectedProp}
              lineValue={lineValue}
            />
          )}
          
          {(selectedProp.propName === 'Shots on Goal' || 
            selectedProp.propName === 'Shots' || 
            selectedProp.propName.toLowerCase().includes('shot') ||
            selectedProp.propName.toLowerCase() === 'sog') && (
            <ShotsDashboard 
              gamelogs={filteredGamelogs} 
              selectedProp={selectedProp}
              lineValue={lineValue}
            />
          )}
          
          {(selectedProp.propName === 'Assists' || 
            selectedProp.propName.toLowerCase().includes('assist') ||
            selectedProp.propName.toLowerCase() === 'ast') && (
            <AssistsDashboard 
              gamelogs={filteredGamelogs} 
              selectedProp={selectedProp}
              lineValue={lineValue}
            />
          )}
          
          {(selectedProp.propName === 'Points' || 
            selectedProp.propName.toLowerCase().includes('point') ||
            selectedProp.propName.toLowerCase() === 'pts') && (
            <PointsDashboard 
              gamelogs={filteredGamelogs} 
              selectedProp={selectedProp}
              lineValue={lineValue}
            />
          )}
          
          {/* Fallback for other prop types */}
          {!(selectedProp.propName === 'Goals' || selectedProp.propName.toLowerCase().includes('goal')) &&
           !(selectedProp.propName === 'Shots on Goal' || selectedProp.propName === 'Shots' || selectedProp.propName.toLowerCase().includes('shot') || selectedProp.propName.toLowerCase() === 'sog') &&
           !(selectedProp.propName === 'Assists' || selectedProp.propName.toLowerCase().includes('assist') || selectedProp.propName.toLowerCase() === 'ast') &&
           !(selectedProp.propName === 'Points' || selectedProp.propName.toLowerCase().includes('point') || selectedProp.propName.toLowerCase() === 'pts') && (
            <Card className="border border-gray-700 bg-[#171717]">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Dashboard for {selectedProp.propName} coming soon</p>
              </CardContent>
            </Card>
          )}
        </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-3">
            <PlayerVsOpponentHistory playerId={playerId} />
            <IceRinkVisualization playerId={playerId} gamelogs={filteredGamelogs} timeFilter={timeFilter} />
          </div>
        </div>
      </div>
    </div>
  )
}
