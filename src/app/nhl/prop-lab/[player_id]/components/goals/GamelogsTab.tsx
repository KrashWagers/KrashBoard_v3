"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, ChevronDown, ChevronUp, Filter } from "lucide-react"
import Image from "next/image"
import { PlayerGamelog } from './shared/types'
import { getNHLTeamLogo, formatToiSeconds } from './shared/utils'
import { processChartData } from './shared/dataProcessors'

interface GamelogsTabProps {
  gamelogs: PlayerGamelog[]
  allGamelogs?: PlayerGamelog[]
}

const ALL_NHL_TEAMS = [
  'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL', 'DAL',
  'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NSH', 'NJD', 'NYI', 'NYR',
  'OTT', 'PHI', 'PIT', 'SJS', 'SEA', 'STL', 'TB', 'TOR', 'UTA', 'VAN',
  'VGK', 'WPG', 'WSH'
]

export function GamelogsTab({ gamelogs, allGamelogs }: GamelogsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Basic filters
  const [opponentFilter, setOpponentFilter] = useState<string>('all')
  const [venueFilter, setVenueFilter] = useState<string>('all')
  
  // Advanced filters
  const [dateRangeStart, setDateRangeStart] = useState<string>('')
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('')
  const [gameTimeFilter, setGameTimeFilter] = useState<string>('all')
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState<string>('all')
  const [daysRestFilter, setDaysRestFilter] = useState<string>('all')

  const parseGameDate = (value: unknown): Date | null => {
    if (typeof value === 'string') {
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value
    }
    return null
  }
  const [toiMin, setToiMin] = useState<string>('')
  const [toiMax, setToiMax] = useState<string>('')
  const [goalsMin, setGoalsMin] = useState<string>('')
  const [goalsMax, setGoalsMax] = useState<string>('')
  const [assistsMin, setAssistsMin] = useState<string>('')
  const [assistsMax, setAssistsMax] = useState<string>('')
  const [pointsMin, setPointsMin] = useState<string>('')
  const [pointsMax, setPointsMax] = useState<string>('')

  // Process and filter gamelogs
  const filteredGamelogs = useMemo(() => {
    let filtered = [...gamelogs]

    // Basic filters
    if (opponentFilter !== 'all') {
      filtered = filtered.filter(game => {
        const awayAbbr = typeof game.away_abbrev === 'string' ? game.away_abbrev : ''
        const homeAbbr = typeof game.home_abbrev === 'string' ? game.home_abbrev : ''
        const playerTeam = typeof game.player_team_abbrev === 'string' ? game.player_team_abbrev : ''
        const opponent = awayAbbr === playerTeam ? homeAbbr : awayAbbr
        return opponent === opponentFilter
      })
    }

    if (venueFilter !== 'all') {
      filtered = filtered.filter(game => {
        const venue = game.venue || ''
        if (venueFilter === 'home') return venue.toLowerCase().includes('home')
        if (venueFilter === 'away') return venue.toLowerCase().includes('away')
        return true
      })
    }

    // Advanced filters
    if (dateRangeStart) {
      filtered = filtered.filter(game => {
        try {
          const gameDate = parseGameDate(game.game_date)
          if (!gameDate) return true
          const startDate = new Date(dateRangeStart)
          return gameDate >= startDate
        } catch {
          return true
        }
      })
    }

    if (dateRangeEnd) {
      filtered = filtered.filter(game => {
        try {
          const gameDate = parseGameDate(game.game_date)
          if (!gameDate) return true
          const endDate = new Date(dateRangeEnd)
          endDate.setHours(23, 59, 59, 999)
          return gameDate <= endDate
        } catch {
          return true
        }
      })
    }

    if (gameTimeFilter !== 'all') {
      filtered = filtered.filter(game => {
        const gameTime = game.game_time_bucket || ''
        return gameTime === gameTimeFilter
      })
    }

    if (dayOfWeekFilter !== 'all') {
      filtered = filtered.filter(game => {
        const dayOfWeek = game.day_of_week || ''
        return dayOfWeek === dayOfWeekFilter
      })
    }

    if (daysRestFilter !== 'all') {
      filtered = filtered.filter(game => {
        const daysRest = game.days_rest ?? -1
        if (daysRestFilter === '0') return daysRest === 0
        if (daysRestFilter === '1') return daysRest === 1
        if (daysRestFilter === '2+') return daysRest >= 2
        return true
      })
    }

    if (toiMin) {
      const minSeconds = parseInt(toiMin) * 60
      filtered = filtered.filter(game => (game.toi_seconds ?? 0) >= minSeconds)
    }

    if (toiMax) {
      const maxSeconds = parseInt(toiMax) * 60
      filtered = filtered.filter(game => (game.toi_seconds ?? 0) <= maxSeconds)
    }

    if (goalsMin) {
      filtered = filtered.filter(game => (game.goals ?? 0) >= parseInt(goalsMin))
    }

    if (goalsMax) {
      filtered = filtered.filter(game => (game.goals ?? 0) <= parseInt(goalsMax))
    }

    if (assistsMin) {
      filtered = filtered.filter(game => (game.assists ?? 0) >= parseInt(assistsMin))
    }

    if (assistsMax) {
      filtered = filtered.filter(game => (game.assists ?? 0) <= parseInt(assistsMax))
    }

    if (pointsMin) {
      filtered = filtered.filter(game => (game.points ?? 0) >= parseInt(pointsMin))
    }

    if (pointsMax) {
      filtered = filtered.filter(game => (game.points ?? 0) <= parseInt(pointsMax))
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(game => {
        const awayAbbr = typeof game.away_abbrev === 'string' ? game.away_abbrev : ''
        const homeAbbr = typeof game.home_abbrev === 'string' ? game.home_abbrev : ''
        const playerTeam = typeof game.player_team_abbrev === 'string' ? game.player_team_abbrev : ''
        const opponent = awayAbbr === playerTeam ? homeAbbr : awayAbbr
        
        return (
          opponent.toLowerCase().includes(query) ||
          String(game.goals ?? 0).includes(query) ||
          String(game.assists ?? 0).includes(query) ||
          String(game.points ?? 0).includes(query) ||
          String(game.shots_on_goal ?? 0).includes(query) ||
          String(game.toi_seconds ?? 0).includes(query)
        )
      })
    }

    return filtered
  }, [
    gamelogs, opponentFilter, venueFilter, dateRangeStart, dateRangeEnd,
    gameTimeFilter, dayOfWeekFilter, daysRestFilter, toiMin, toiMax,
    goalsMin, goalsMax, assistsMin, assistsMax, pointsMin, pointsMax, searchQuery
  ])

  // Process chart data for display
  const chartData = useMemo(() => {
    return filteredGamelogs.map((game) => {
      let formattedDate = ''
      try {
        if (game.game_date) {
          let dateStr = ''
          if (typeof game.game_date === 'string') {
            dateStr = game.game_date
          } else if (game.game_date instanceof Date) {
            dateStr = game.game_date.toISOString().split('T')[0]
          } else if (typeof game.game_date === 'object' && game.game_date !== null && 'value' in game.game_date && typeof (game.game_date as { value: unknown }).value === 'string') {
            dateStr = (game.game_date as { value: string }).value
          } else {
            dateStr = new Date(game.game_date as string | Date).toISOString().split('T')[0]
          }
          
          const dateParts = dateStr.split('-')
          if (dateParts.length === 3) {
            formattedDate = `${dateParts[1]}/${dateParts[2]}`
          }
        }
      } catch (e) {
        console.warn('Date parsing error:', game.game_date, e)
      }
      
      const awayAbbr = typeof game.away_abbrev === 'string' ? game.away_abbrev : ''
      const homeAbbr = typeof game.home_abbrev === 'string' ? game.home_abbrev : ''
      const playerTeam = typeof game.player_team_abbrev === 'string' ? game.player_team_abbrev : ''
      const opponent = awayAbbr === playerTeam ? homeAbbr : awayAbbr
      
      return {
        opponent,
        formattedDate,
        game_date: game.game_date,
        toi_seconds: game.toi_seconds ?? 0,
        shifts: typeof game.shifts === 'number' ? game.shifts : 0,
        goals: game.goals ?? 0,
        assists: game.assists ?? 0,
        points: game.points ?? 0,
        pp_points: (typeof game.pp_points === 'number' ? game.pp_points : 0) || ((game.pp_goals ?? 0) + (typeof game.pp_assists === 'number' ? game.pp_assists : 0)),
        shots_on_goal: game.shots_on_goal ?? 0,
        corsi: game.corsi || 0
      }
    }).sort((a, b) => {
      // Sort by date descending (most recent first)
      let dateA = 0
      let dateB = 0
      
      try {
        if (a.game_date) {
          const dateAObj = typeof a.game_date === 'string' 
            ? new Date(a.game_date) 
            : a.game_date instanceof Date 
              ? a.game_date 
              : new Date(a.game_date as string | Date)
          dateA = dateAObj.getTime()
          if (isNaN(dateA)) dateA = 0
        }
      } catch (e) {
        dateA = 0
      }
      
      try {
        if (b.game_date) {
          const dateBObj = typeof b.game_date === 'string' 
            ? new Date(b.game_date) 
            : b.game_date instanceof Date 
              ? b.game_date 
              : new Date(b.game_date as string | Date)
          dateB = dateBObj.getTime()
          if (isNaN(dateB)) dateB = 0
        }
      } catch (e) {
        dateB = 0
      }
      
      // Sort by date descending (most recent first)
      if (dateA === 0 && dateB === 0) return 0
      if (dateA === 0) return 1
      if (dateB === 0) return -1
      return dateB - dateA
    }).reverse()
  }, [filteredGamelogs])

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (opponentFilter !== 'all') count++
    if (venueFilter !== 'all') count++
    if (dateRangeStart) count++
    if (dateRangeEnd) count++
    if (gameTimeFilter !== 'all') count++
    if (dayOfWeekFilter !== 'all') count++
    if (daysRestFilter !== 'all') count++
    if (toiMin) count++
    if (toiMax) count++
    if (goalsMin) count++
    if (goalsMax) count++
    if (assistsMin) count++
    if (assistsMax) count++
    if (pointsMin) count++
    if (pointsMax) count++
    return count
  }, [opponentFilter, venueFilter, dateRangeStart, dateRangeEnd, gameTimeFilter, dayOfWeekFilter, daysRestFilter, toiMin, toiMax, goalsMin, goalsMax, assistsMin, assistsMax, pointsMin, pointsMax])

  const clearAllFilters = () => {
    setOpponentFilter('all')
    setVenueFilter('all')
    setDateRangeStart('')
    setDateRangeEnd('')
    setGameTimeFilter('all')
    setDayOfWeekFilter('all')
    setDaysRestFilter('all')
    setToiMin('')
    setToiMax('')
    setGoalsMin('')
    setGoalsMax('')
    setAssistsMin('')
    setAssistsMax('')
    setPointsMin('')
    setPointsMax('')
    setSearchQuery('')
  }

  return (
    <Card variant="secondary">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20">
        <div className="flex items-center justify-between mb-4">
          <CardTitle 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--chart-title))' }}
          >
            Gamelogs
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs"
            >
              Clear All ({activeFilterCount})
            </Button>
          )}
        </div>

        {/* Search and Basic Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search gamelogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Opponent</label>
              <Select value={opponentFilter} onValueChange={setOpponentFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Opponents</SelectItem>
                  {ALL_NHL_TEAMS.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Venue</label>
              <Select value={venueFilter} onValueChange={setVenueFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full justify-between h-8 text-xs"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </span>
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="space-y-3 p-3 border border-border rounded-md bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Date From</label>
                  <Input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Date To</label>
                  <Input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Game Time</label>
                  <Select value={gameTimeFilter} onValueChange={setGameTimeFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Afternoon">Afternoon</SelectItem>
                      <SelectItem value="Evening">Evening</SelectItem>
                      <SelectItem value="Night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Day of Week</label>
                  <Select value={dayOfWeekFilter} onValueChange={setDayOfWeekFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Days Rest</label>
                  <Select value={daysRestFilter} onValueChange={setDaysRestFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="0">0 Days</SelectItem>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="2+">2+ Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">TOI Min (minutes)</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={toiMin}
                    onChange={(e) => setToiMin(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">TOI Max (minutes)</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={toiMax}
                    onChange={(e) => setToiMax(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Goals Min</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={goalsMin}
                    onChange={(e) => setGoalsMin(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Goals Max</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={goalsMax}
                    onChange={(e) => setGoalsMax(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Assists Min</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={assistsMin}
                    onChange={(e) => setAssistsMin(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Assists Max</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={assistsMax}
                    onChange={(e) => setAssistsMax(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Points Min</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={pointsMin}
                    onChange={(e) => setPointsMin(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Points Max</label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={pointsMax}
                    onChange={(e) => setPointsMax(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-20 bg-card border-b border-border/50">
              <tr>
                <th className="h-8 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Date</th>
                <th className="h-8 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left">Opp</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">TOI</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">Shifts</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">Goals</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">Ast</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">Pts</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">PP Pts</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">SOG</th>
                <th className="h-8 px-3 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">SAT</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((game, index) => (
                <tr key={index} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                  <td className="h-8 px-3 text-xs font-medium text-foreground">{game.formattedDate || ''}</td>
                  <td className="h-8 px-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image
                          src={getNHLTeamLogo(game.opponent || '')}
                          alt={game.opponent || ''}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                      <span className="font-semibold text-foreground text-xs">{game.opponent || ''}</span>
                    </div>
                  </td>
                  <td className="h-8 px-3 text-xs text-center text-muted-foreground">{formatToiSeconds(game.toi_seconds)}</td>
                  <td className="h-8 px-3 text-xs text-center text-muted-foreground">{game.shifts}</td>
                  <td className="h-8 px-3 text-xs text-center font-bold text-foreground">{game.goals}</td>
                  <td className="h-8 px-3 text-xs text-center text-muted-foreground">{game.assists || 0}</td>
                  <td className="h-8 px-3 text-xs text-center text-muted-foreground">{game.points || 0}</td>
                  <td className="h-8 px-3 text-xs text-center text-muted-foreground">{game.pp_points || 0}</td>
                  <td className="h-8 px-3 text-xs text-center text-muted-foreground">{game.shots_on_goal}</td>
                  <td className="h-8 px-3 text-xs text-center text-muted-foreground">{game.corsi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

