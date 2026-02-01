'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type TeamInfo = {
  id?: number
  abbrev?: string
  logo?: string
  score?: number
  sog?: number
}

type PlayerStats = Record<string, any>

type TeamPlayers = {
  skaters?: PlayerStats[]
  forwards?: PlayerStats[]
  defensemen?: PlayerStats[]
  goalies?: PlayerStats[]
}

type TeamTotals = Record<string, any>

type GameStoryResponse = {
  season?: number
  gameState?: string
  startTimeUTC?: string
  periodDescriptor?: { number?: number; periodType?: string }
  clock?: { timeRemaining?: string; running?: boolean }
  venue?: { default?: string }
  awayTeam?: TeamInfo
  homeTeam?: TeamInfo
  summary?: {
    scoring?: Array<{
      periodDescriptor?: { number?: number; periodType?: string }
      goals?: Array<{
        eventId?: number
        teamAbbrev?: { default?: string } | string
        name?: { default?: string } | string
        firstName?: { default?: string } | string
        lastName?: { default?: string } | string
        timeInPeriod?: string
        strength?: string
        situationCode?: string
        shotType?: string
        awayScore?: number
        homeScore?: number
        headshot?: string
        assists?: Array<{
          name?: { default?: string } | string
        }>
        isHome?: boolean
      }>
    }>
    teamGameStats?: Array<{
      category?: string
      awayValue?: number | string
      homeValue?: number | string
    }>
    penalties?: Array<{
      periodDescriptor?: { number?: number; periodType?: string }
      penalties?: Array<{
        teamAbbrev?: { default?: string } | string
        timeInPeriod?: string
        description?: string
        committedBy?: { default?: string } | string
      }>
    }>
  }
} & Record<string, unknown>

type BoxscoreApiResponse = {
  gameState?: string
  startTimeUTC?: string
  venue?: { default?: string; city?: string }
  clock?: { timeRemaining?: string; running?: boolean }
  periodDescriptor?: { number?: number; periodType?: string }
  awayTeam?: TeamInfo
  homeTeam?: TeamInfo
  playerByGameStats?: { awayTeam?: TeamPlayers; homeTeam?: TeamPlayers }
  teamStats?: { awayTeam?: TeamTotals; homeTeam?: TeamTotals }
}

type GamecenterClientProps = {
  gameId: string
}

type SortDirection = 'asc' | 'desc'
type SkaterSortField = 'player' | 'toi' | 'goals' | 'assists' | 'points' | 'sog' | 'plusMinus' | 'pim'
type GoalieSortField = 'player' | 'saves' | 'shotsAgainst' | 'savePct'

const cardClass =
  'rounded-md border border-gray-700 bg-[#171717] shadow-none transition-none hover:shadow-none hover:translate-y-0'

function getLogoUrl(team?: TeamInfo): string | null {
  if (team?.logo) return team.logo
  if (!team?.abbrev) return null
  return `https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_dark.svg`
}

function formatStartTime(startTimeUTC?: string): string {
  if (!startTimeUTC) return 'TBD'
  const date = new Date(startTimeUTC)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getDisplayText(value?: { default?: string } | string): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.default
}

function formatPeriodLabel(periodDescriptor?: { number?: number; periodType?: string }): string {
  if (periodDescriptor?.periodType === 'SO') return 'SO'
  if (periodDescriptor?.periodType === 'OT') return 'OT'
  if (periodDescriptor?.number) return `P${periodDescriptor.number}`
  return 'P1'
}

function formatPeriodDisplay(periodDescriptor?: { number?: number; periodType?: string }): string {
  if (periodDescriptor?.periodType === 'OT') return 'OT'
  if (periodDescriptor?.periodType === 'SO') return 'SO'
  if (periodDescriptor?.number) return `${periodDescriptor.number}${getOrdinalSuffix(periodDescriptor.number)} Period`
  return 'Period'
}

function getOrdinalSuffix(value: number): string {
  const mod100 = value % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (value % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

function getTeamTotals(teamTotals?: TeamTotals): TeamTotals {
  return (
    teamTotals?.teamSkaterStats ||
    teamTotals?.teamStats ||
    teamTotals ||
    {}
  )
}

function getLinescorePeriods(data: BoxscoreApiResponse | null): any[] {
  const linescore = (data as any)?.linescore
  if (!linescore) return []
  const candidates = [
    linescore.periods,
    linescore.byPeriod,
    linescore.periodsByGame,
    linescore.periodSummary,
  ]
  const found = candidates.find((item) => Array.isArray(item))
  return Array.isArray(found) ? found : []
}

function formatStatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

function formatPct(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'number') {
    if (value <= 1) return `${(value * 100).toFixed(1)}%`
    return `${value.toFixed(1)}%`
  }
  return String(value)
}

function getPowerPlayDisplay(teamTotals: TeamTotals): string {
  const goals = teamTotals?.powerPlayGoals
  const opportunities = teamTotals?.powerPlayOpportunities
  if (goals == null && opportunities == null) return '-'
  return `${formatStatValue(goals)} / ${formatStatValue(opportunities)}`
}

function getFaceoffDisplay(teamTotals: TeamTotals): string {
  if (teamTotals?.faceOffWinPercentage != null) {
    return `${teamTotals.faceOffWinPercentage}%`
  }
  if (teamTotals?.faceoffWinPercentage != null) {
    return `${teamTotals.faceoffWinPercentage}%`
  }
  return '-'
}

function getStoryStat(story: GameStoryResponse | null, category: string): { away: unknown; home: unknown } {
  const stat = story?.summary?.teamGameStats?.find((item) => item?.category === category)
  return {
    away: stat?.awayValue,
    home: stat?.homeValue,
  }
}

function getPlayerId(player: PlayerStats): number | null {
  return player?.playerId || player?.id || player?.person?.id || null
}

function getPlayerHeadshot(
  player: PlayerStats,
  teamAbbrev: string | undefined,
  season: number | undefined
): string | null {
  if (player?.headshot) return player.headshot
  if (player?.headshotUrl) return player.headshotUrl
  const playerId = getPlayerId(player)
  if (!playerId || !teamAbbrev || !season) return null
  return `https://assets.nhle.com/mugs/nhl/${season}/${teamAbbrev}/${playerId}.png`
}

function getTeamLogoByAbbrev(abbrev?: string): string | null {
  if (!abbrev) return null
  return `https://assets.nhle.com/logos/nhl/svg/${abbrev}_dark.svg`
}

function getSkaters(players?: TeamPlayers): PlayerStats[] {
  if (!players) return []
  if (Array.isArray(players.skaters) && players.skaters.length > 0) return players.skaters
  return [...(players.forwards || []), ...(players.defensemen || [])]
}

function getGoalies(players?: TeamPlayers): PlayerStats[] {
  return players?.goalies || []
}

function getPlayerName(player: PlayerStats): string {
  if (player?.name?.default) return player.name.default
  if (player?.fullName) return player.fullName
  const first = player?.firstName?.default || player?.firstName
  const last = player?.lastName?.default || player?.lastName
  if (first || last) return [first, last].filter(Boolean).join(' ')
  return player?.person?.fullName || 'Unknown'
}

function getSkaterStat(player: PlayerStats, key: string): string | number {
  const stats = player?.stats?.skaterStats || player?.skaterStats || player
  if (key === 'sog') {
    return stats?.sog ?? stats?.shots ?? '-'
  }
  if (key === 'toi') {
    return stats?.toi ?? stats?.timeOnIce ?? '-'
  }
  return stats?.[key] ?? '-'
}

function getGoalieStat(player: PlayerStats, key: string): string | number {
  const stats = player?.stats?.goalieStats || player?.goalieStats || player
  return stats?.[key] ?? '-'
}

function getGoalScorerName(goal: any): string {
  if (typeof goal?.name === 'string') return goal.name
  if (goal?.name?.default) return goal.name.default
  const first = typeof goal?.firstName === 'string' ? goal.firstName : goal?.firstName?.default
  const last = typeof goal?.lastName === 'string' ? goal.lastName : goal?.lastName?.default
  return [first, last].filter(Boolean).join(' ') || 'Scorer'
}

function getAssistNames(assists: any[] | undefined): string {
  if (!assists || assists.length === 0) return 'Unassisted'
  return assists
    .map((assist) => {
      if (typeof assist?.name === 'string') return assist.name
      return assist?.name?.default
    })
    .filter(Boolean)
    .join(', ')
}

function formatShotType(shotType?: string | null): string {
  if (!shotType) return 'Goal'
  return shotType.charAt(0).toUpperCase() + shotType.slice(1).toLowerCase()
}

function parseToiSeconds(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const parts = value.split(':')
  if (parts.length !== 2) return null
  const minutes = Number(parts[0])
  const seconds = Number(parts[1])
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) return null
  return minutes * 60 + seconds
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '' || value === '-') return Number.NEGATIVE_INFINITY
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY
}

function getSkaterSortValue(player: PlayerStats, field: SkaterSortField): string | number {
  if (field === 'player') return getPlayerName(player).toLowerCase()
  if (field === 'toi') return parseToiSeconds(getSkaterStat(player, 'toi')) ?? Number.NEGATIVE_INFINITY
  if (field === 'sog') return toNumber(getSkaterStat(player, 'sog'))
  if (field === 'goals') return toNumber(getSkaterStat(player, 'goals'))
  if (field === 'assists') return toNumber(getSkaterStat(player, 'assists'))
  if (field === 'points') return toNumber(getSkaterStat(player, 'points'))
  if (field === 'plusMinus') return toNumber(getSkaterStat(player, 'plusMinus'))
  if (field === 'pim') return toNumber(getSkaterStat(player, 'pim'))
  return Number.NEGATIVE_INFINITY
}

function getGoalieSortValue(player: PlayerStats, field: GoalieSortField): string | number {
  if (field === 'player') return getPlayerName(player).toLowerCase()
  if (field === 'saves') return toNumber(getGoalieStat(player, 'saves'))
  if (field === 'shotsAgainst') return toNumber(getGoalieStat(player, 'shotsAgainst'))
  if (field === 'savePct') return toNumber(getGoalieStat(player, 'savePct'))
  return Number.NEGATIVE_INFINITY
}

function StatRow({ label, awayValue, homeValue }: { label: string; awayValue: string; homeValue: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
      <div className="text-left font-semibold text-foreground">{awayValue}</div>
      <div className="text-center text-xs uppercase text-muted-foreground">{label}</div>
      <div className="text-right font-semibold text-foreground">{homeValue}</div>
    </div>
  )
}

export default function GamecenterClient({ gameId }: GamecenterClientProps) {
  const [data, setData] = useState<BoxscoreApiResponse | null>(null)
  const [story, setStory] = useState<GameStoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'boxscore'>('summary')
  const hasLoggedStats = useRef(false)
  const hasLoggedSkaters = useRef(false)
  const [skaterSortField, setSkaterSortField] = useState<SkaterSortField>('player')
  const [skaterSortDirection, setSkaterSortDirection] = useState<SortDirection>('asc')
  const [goalieSortField, setGoalieSortField] = useState<GoalieSortField>('player')
  const [goalieSortDirection, setGoalieSortDirection] = useState<SortDirection>('asc')

  const loadBoxscore = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [boxscoreResponse, storyResponse] = await Promise.all([
        fetch(`/api/nhl/boxscore?gameId=${gameId}`),
        fetch(`/api/nhl/game-story?gameId=${gameId}`),
      ])

      if (!boxscoreResponse.ok) {
        const errorBody = await boxscoreResponse.json().catch(() => null)
        const errorMessage =
          typeof errorBody?.error === 'string'
            ? errorBody.error
            : `Failed to load boxscore (${boxscoreResponse.status})`
        throw new Error(errorMessage)
      }

      const boxscoreJson = (await boxscoreResponse.json()) as BoxscoreApiResponse
      setData(boxscoreJson)

      if (storyResponse.ok) {
        const storyJson = (await storyResponse.json()) as GameStoryResponse
        setStory(storyJson)
      } else {
        setStory(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load boxscore')
    } finally {
      setLoading(false)
    }
  }, [gameId])

  useEffect(() => {
    loadBoxscore()
  }, [loadBoxscore])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || hasLoggedStats.current || !story?.summary?.teamGameStats) return
    console.log('NHL game-story stats categories', story.summary.teamGameStats.map((stat) => stat.category))
    hasLoggedStats.current = true
  }, [story])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || hasLoggedSkaters.current) return
    const sampleSkater =
      getSkaters(data?.playerByGameStats?.awayTeam)[0] ||
      getSkaters(data?.playerByGameStats?.homeTeam)[0]
    if (!sampleSkater) return
    const stats = sampleSkater?.stats?.skaterStats || sampleSkater?.skaterStats || sampleSkater
    console.log('NHL boxscore skater keys sample', Object.keys(stats || {}))
    console.log('NHL boxscore skater SOG value', stats?.sog ?? stats?.shots ?? null)
    console.log('NHL boxscore skater TOI value', stats?.toi ?? stats?.timeOnIce ?? null)
    hasLoggedSkaters.current = true
  }, [data])

  const away = data?.awayTeam || story?.awayTeam
  const home = data?.homeTeam || story?.homeTeam
  const awayLogo = getLogoUrl(away)
  const homeLogo = getLogoUrl(home)

  const awayPlayers = data?.playerByGameStats?.awayTeam
  const homePlayers = data?.playerByGameStats?.homeTeam

  const awayTotals = getTeamTotals(data?.teamStats?.awayTeam)
  const homeTotals = getTeamTotals(data?.teamStats?.homeTeam)

  const storyShots = getStoryStat(story, 'sog')
  const storyFaceoff = getStoryStat(story, 'faceoffWinningPctg')
  const storyPowerPlay = getStoryStat(story, 'powerPlay')
  const storyPim = getStoryStat(story, 'pim')
  const storyHits = getStoryStat(story, 'hits')
  const storyBlocks = getStoryStat(story, 'blockedShots')
  const storyGiveaways = getStoryStat(story, 'giveaways')
  const storyTakeaways = getStoryStat(story, 'takeaways')

  const scoreLine = useMemo(() => {
    return `${away?.abbrev || 'AWAY'} @ ${home?.abbrev || 'HOME'}`
  }, [away?.abbrev, home?.abbrev])

  const linescorePeriods = getLinescorePeriods(data)
  const scoringPeriods = story?.summary?.scoring || []

  const handleSkaterSort = (field: SkaterSortField) => {
    if (skaterSortField === field) {
      setSkaterSortDirection(skaterSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSkaterSortField(field)
      setSkaterSortDirection('asc')
    }
  }

  const handleGoalieSort = (field: GoalieSortField) => {
    if (goalieSortField === field) {
      setGoalieSortDirection(goalieSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setGoalieSortField(field)
      setGoalieSortDirection('asc')
    }
  }

  const sortedAwaySkaters = useMemo(() => {
    const list = [...getSkaters(awayPlayers)]
    list.sort((a, b) => {
      const aVal = getSkaterSortValue(a, skaterSortField)
      const bVal = getSkaterSortValue(b, skaterSortField)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return skaterSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return skaterSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
    return list
  }, [awayPlayers, skaterSortField, skaterSortDirection])

  const sortedHomeSkaters = useMemo(() => {
    const list = [...getSkaters(homePlayers)]
    list.sort((a, b) => {
      const aVal = getSkaterSortValue(a, skaterSortField)
      const bVal = getSkaterSortValue(b, skaterSortField)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return skaterSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return skaterSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
    return list
  }, [homePlayers, skaterSortField, skaterSortDirection])

  const sortedAwayGoalies = useMemo(() => {
    const list = [...getGoalies(awayPlayers)]
    list.sort((a, b) => {
      const aVal = getGoalieSortValue(a, goalieSortField)
      const bVal = getGoalieSortValue(b, goalieSortField)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return goalieSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return goalieSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
    return list
  }, [awayPlayers, goalieSortField, goalieSortDirection])

  const sortedHomeGoalies = useMemo(() => {
    const list = [...getGoalies(homePlayers)]
    list.sort((a, b) => {
      const aVal = getGoalieSortValue(a, goalieSortField)
      const bVal = getGoalieSortValue(b, goalieSortField)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return goalieSortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return goalieSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
    return list
  }, [homePlayers, goalieSortField, goalieSortDirection])

  const SkaterSortButton = ({ field, children }: { field: SkaterSortField; children: string }) => (
    <button
      type="button"
      onClick={() => handleSkaterSort(field)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
    >
      {children}
      {skaterSortField === field ? (
        skaterSortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : null}
    </button>
  )

  const GoalieSortButton = ({ field, children }: { field: GoalieSortField; children: string }) => (
    <button
      type="button"
      onClick={() => handleGoalieSort(field)}
      className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
    >
      {children}
      {goalieSortField === field ? (
        goalieSortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
      ) : null}
    </button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{scoreLine}</h1>
          <p className="text-sm text-muted-foreground">
            {story?.gameState || data?.gameState || 'Scheduled'} •{' '}
            {formatStartTime(story?.startTimeUTC || data?.startTimeUTC)} •{' '}
            {story?.venue?.default || data?.venue?.default || 'Venue TBD'}
          </p>
        </div>
        <Button onClick={loadBoxscore} variant="outline" className="border-gray-700 bg-[#171717]">
          Refresh
        </Button>
      </div>

      <Card className={cardClass}>
        <CardContent className="grid gap-4 py-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex items-center gap-4">
            {awayLogo ? <Image src={awayLogo} alt={away?.abbrev || 'Away'} width={60} height={60} /> : null}
            <div>
              <div className="text-lg font-semibold">{away?.abbrev || 'AWAY'}</div>
              <div className="text-xs text-muted-foreground">SOG {away?.sog ?? '-'}</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl font-bold">
              {away?.score ?? '-'} - {home?.score ?? '-'}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatPeriodLabel(data?.periodDescriptor || story?.periodDescriptor)}{' '}
              {(data?.clock || story?.clock)?.timeRemaining || ''}
            </div>
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="text-right">
              <div className="text-lg font-semibold">{home?.abbrev || 'HOME'}</div>
              <div className="text-xs text-muted-foreground">SOG {home?.sog ?? '-'}</div>
            </div>
            {homeLogo ? <Image src={homeLogo} alt={home?.abbrev || 'Home'} width={60} height={60} /> : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(['summary', 'boxscore'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            className={activeTab === tab ? '' : 'border-gray-700 bg-[#171717]'}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'summary' ? 'Summary' : 'Boxscore'}
          </Button>
        ))}
      </div>

      {error ? (
        <Card className={cardClass}>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : null}

      {loading && !data ? (
        <Card className={cardClass}>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading boxscore...
          </CardContent>
        </Card>
      ) : null}

      {activeTab === 'boxscore' && data ? (
        <div className="space-y-6">
          <Card className={cardClass}>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold">Skaters</h2>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  {getTeamLogoByAbbrev(away?.abbrev) ? (
                    <Image
                      src={getTeamLogoByAbbrev(away?.abbrev) as string}
                      alt={away?.abbrev || 'Away'}
                      width={24}
                      height={24}
                    />
                  ) : null}
                  <span>{away?.abbrev || 'Away'}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SkaterSortButton field="player">Player</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="toi">TOI</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="goals">G</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="assists">A</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="points">PTS</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="sog">SOG</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="plusMinus">+/-</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="pim">PIM</SkaterSortButton>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAwaySkaters.map((player, index) => (
                      <TableRow key={`${getPlayerName(player)}-${index}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlayerHeadshot(player, away?.abbrev, story?.season) ? (
                              <Image
                                src={getPlayerHeadshot(player, away?.abbrev, story?.season) as string}
                                alt={getPlayerName(player)}
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                            ) : getTeamLogoByAbbrev(away?.abbrev) ? (
                              <Image
                                src={getTeamLogoByAbbrev(away?.abbrev) as string}
                                alt={away?.abbrev || 'Team'}
                                    width={25}
                                    height={25}
                              />
                            ) : null}
                            <span>{getPlayerName(player)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getSkaterStat(player, 'toi')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'goals')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'assists')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'points')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'sog')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'plusMinus')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'pim')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  {getTeamLogoByAbbrev(home?.abbrev) ? (
                    <Image
                      src={getTeamLogoByAbbrev(home?.abbrev) as string}
                      alt={home?.abbrev || 'Home'}
                      width={24}
                      height={24}
                    />
                  ) : null}
                  <span>{home?.abbrev || 'Home'}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <SkaterSortButton field="player">Player</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="toi">TOI</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="goals">G</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="assists">A</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="points">PTS</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="sog">SOG</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="plusMinus">+/-</SkaterSortButton>
                      </TableHead>
                      <TableHead>
                        <SkaterSortButton field="pim">PIM</SkaterSortButton>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHomeSkaters.map((player, index) => (
                      <TableRow key={`${getPlayerName(player)}-${index}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPlayerHeadshot(player, home?.abbrev, story?.season) ? (
                              <Image
                                src={getPlayerHeadshot(player, home?.abbrev, story?.season) as string}
                                alt={getPlayerName(player)}
                                width={28}
                                height={28}
                                className="rounded-full"
                              />
                            ) : getTeamLogoByAbbrev(home?.abbrev) ? (
                              <Image
                                src={getTeamLogoByAbbrev(home?.abbrev) as string}
                                alt={home?.abbrev || 'Team'}
                                    width={25}
                                    height={25}
                              />
                            ) : null}
                            <span>{getPlayerName(player)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getSkaterStat(player, 'toi')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'goals')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'assists')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'points')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'sog')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'plusMinus')}</TableCell>
                        <TableCell>{getSkaterStat(player, 'pim')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold">Goalies</h2>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  {getTeamLogoByAbbrev(away?.abbrev) ? (
                    <Image
                      src={getTeamLogoByAbbrev(away?.abbrev) as string}
                      alt={away?.abbrev || 'Away'}
                      width={24}
                      height={24}
                    />
                  ) : null}
                  <span>{away?.abbrev || 'Away'}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <GoalieSortButton field="player">Goalie</GoalieSortButton>
                      </TableHead>
                      <TableHead>
                        <GoalieSortButton field="saves">SV</GoalieSortButton>
                      </TableHead>
                      <TableHead>
                        <GoalieSortButton field="shotsAgainst">SA</GoalieSortButton>
                      </TableHead>
                      <TableHead>
                        <GoalieSortButton field="savePct">SV%</GoalieSortButton>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAwayGoalies.map((player, index) => {
                      const saves = Number(getGoalieStat(player, 'saves'))
                      const shotsAgainst = Number(getGoalieStat(player, 'shotsAgainst'))
                      const svPct =
                        Number.isFinite(saves) && Number.isFinite(shotsAgainst) && shotsAgainst > 0
                          ? (saves / shotsAgainst).toFixed(3)
                          : getGoalieStat(player, 'savePct')

                      return (
                        <TableRow key={`${getPlayerName(player)}-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPlayerHeadshot(player, away?.abbrev, story?.season) ? (
                                <Image
                                  src={getPlayerHeadshot(player, away?.abbrev, story?.season) as string}
                                  alt={getPlayerName(player)}
                                  width={28}
                                  height={28}
                                  className="rounded-full"
                                />
                              ) : getTeamLogoByAbbrev(away?.abbrev) ? (
                                <Image
                                  src={getTeamLogoByAbbrev(away?.abbrev) as string}
                                  alt={away?.abbrev || 'Team'}
                                    width={25}
                                    height={25}
                                />
                              ) : null}
                              <span>{getPlayerName(player)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getGoalieStat(player, 'saves')}</TableCell>
                          <TableCell>{getGoalieStat(player, 'shotsAgainst')}</TableCell>
                          <TableCell>{svPct}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  {getTeamLogoByAbbrev(home?.abbrev) ? (
                    <Image
                      src={getTeamLogoByAbbrev(home?.abbrev) as string}
                      alt={home?.abbrev || 'Home'}
                      width={24}
                      height={24}
                    />
                  ) : null}
                  <span>{home?.abbrev || 'Home'}</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <GoalieSortButton field="player">Goalie</GoalieSortButton>
                      </TableHead>
                      <TableHead>
                        <GoalieSortButton field="saves">SV</GoalieSortButton>
                      </TableHead>
                      <TableHead>
                        <GoalieSortButton field="shotsAgainst">SA</GoalieSortButton>
                      </TableHead>
                      <TableHead>
                        <GoalieSortButton field="savePct">SV%</GoalieSortButton>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHomeGoalies.map((player, index) => {
                      const saves = Number(getGoalieStat(player, 'saves'))
                      const shotsAgainst = Number(getGoalieStat(player, 'shotsAgainst'))
                      const svPct =
                        Number.isFinite(saves) && Number.isFinite(shotsAgainst) && shotsAgainst > 0
                          ? (saves / shotsAgainst).toFixed(3)
                          : getGoalieStat(player, 'savePct')

                      return (
                        <TableRow key={`${getPlayerName(player)}-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPlayerHeadshot(player, home?.abbrev, story?.season) ? (
                                <Image
                                  src={getPlayerHeadshot(player, home?.abbrev, story?.season) as string}
                                  alt={getPlayerName(player)}
                                  width={28}
                                  height={28}
                                  className="rounded-full"
                                />
                              ) : getTeamLogoByAbbrev(home?.abbrev) ? (
                                <Image
                                  src={getTeamLogoByAbbrev(home?.abbrev) as string}
                                  alt={home?.abbrev || 'Team'}
                                    width={25}
                                    height={25}
                                />
                              ) : null}
                              <span>{getPlayerName(player)}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getGoalieStat(player, 'saves')}</TableCell>
                          <TableCell>{getGoalieStat(player, 'shotsAgainst')}</TableCell>
                          <TableCell>{svPct}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {activeTab === 'summary' ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card className={cardClass}>
              <CardHeader className="pb-3">
                <h2 className="text-lg font-semibold">Summary</h2>
              </CardHeader>
              <CardContent className="space-y-8">
                {scoringPeriods.length > 0 ? (
                  <div className="space-y-6">
                    <div className="text-base font-semibold">Scoring</div>
                    {scoringPeriods.map((period, periodIndex) => (
                      <div key={`period-${periodIndex}`} className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">
                          {formatPeriodDisplay(period.periodDescriptor)}
                        </div>
                        <div className="space-y-3">
                          {(period.goals || []).map((goal: any) => {
                            const scorerName = getGoalScorerName(goal)
                            const assists = getAssistNames(goal.assists)
                            const scoreLabel = `${goal.awayScore ?? '-'}-${goal.homeScore ?? '-'}`
                            const teamAbbrev =
                              goal?.teamAbbrev?.default ||
                              goal?.teamAbbrev ||
                              (goal?.isHome ? home?.abbrev : away?.abbrev)
                            const teamLogo = getTeamLogoByAbbrev(teamAbbrev)
                            return (
                              <div
                                key={`goal-${goal.eventId || scorerName}`}
                                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-md border border-gray-700/70 bg-black/20 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  {goal.headshot ? (
                                    <Image
                                      src={goal.headshot}
                                      alt={scorerName}
                                      width={36}
                                      height={36}
                                      className="rounded-full"
                                    />
                                  ) : null}
                                  <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                      {teamLogo ? (
                                        <Image
                                          src={teamLogo}
                                          alt={teamAbbrev || 'Team'}
                                          width={30}
                                          height={30}
                                          className="rounded-full"
                                        />
                                      ) : null}
                                      <span>{scorerName}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{assists}</div>
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground tabular-nums text-right min-w-[52px]">
                                  {goal.timeInPeriod || '--:--'}
                                </span>
                                <span className="text-xs text-muted-foreground text-right min-w-[64px]">
                                  {formatShotType(goal.shotType)}
                                </span>
                                <span className="text-sm font-semibold text-foreground tabular-nums text-right min-w-[40px]">
                                  {scoreLabel}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    Summary data not available yet.
                  </div>
                )}

                {story?.summary?.penalties?.length ? (
                  <div className="space-y-4">
                    <div className="text-base font-semibold">Penalties</div>
                    {story.summary.penalties.map((period, periodIndex) => (
                      <div key={`penalties-${periodIndex}`} className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">
                          {formatPeriodDisplay(period.periodDescriptor)}
                        </div>
                        <div className="space-y-2">
                          {(period.penalties || []).map((penalty, penaltyIndex) => (
                            <div
                              key={`penalty-${penaltyIndex}`}
                              className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-gray-700/70 bg-black/20 p-3 text-xs text-muted-foreground"
                            >
                              <span>{getDisplayText(penalty.teamAbbrev) || '--'}</span>
                              <span>{penalty.timeInPeriod || '--:--'}</span>
                              <span className="text-foreground">{getDisplayText(penalty.committedBy) || ''}</span>
                              <span>{penalty.description || 'Penalty'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={cardClass}>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold">Linescore</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    {getTeamLogoByAbbrev(away?.abbrev) ? (
                      <Image
                        src={getTeamLogoByAbbrev(away?.abbrev) as string}
                        alt={away?.abbrev || 'Away'}
                        width={24}
                        height={24}
                      />
                    ) : null}
                    <span>{away?.abbrev || 'Away'}</span>
                  </div>
                  <div className="text-center text-[10px] uppercase text-muted-foreground">Period</div>
                  <div className="flex items-center justify-end gap-2 font-semibold text-foreground">
                    <span>{home?.abbrev || 'Home'}</span>
                    {getTeamLogoByAbbrev(home?.abbrev) ? (
                      <Image
                        src={getTeamLogoByAbbrev(home?.abbrev) as string}
                        alt={home?.abbrev || 'Home'}
                        width={24}
                        height={24}
                      />
                    ) : null}
                  </div>
                </div>
              {scoringPeriods.length > 0 ? (
                <div className="space-y-2">
                  {scoringPeriods.map((period, index) => {
                    const awayGoals = (period.goals || []).filter((goal: any) => goal.isHome === false).length
                    const homeGoals = (period.goals || []).filter((goal: any) => goal.isHome === true).length
                    const label = period?.periodDescriptor?.periodType === 'OT'
                      ? 'OT'
                      : period?.periodDescriptor?.periodType === 'SO'
                      ? 'SO'
                      : `P${period?.periodDescriptor?.number || index + 1}`
                    return (
                      <StatRow
                        key={`period-${index}`}
                        label={label}
                        awayValue={formatStatValue(awayGoals)}
                        homeValue={formatStatValue(homeGoals)}
                      />
                    )
                  })}
                </div>
              ) : linescorePeriods.length > 0 ? (
                <div className="space-y-2">
                  {linescorePeriods.map((period, index) => (
                    <StatRow
                      key={`period-${index}`}
                      label={period?.periodNumber ? `P${period.periodNumber}` : `P${index + 1}`}
                      awayValue={formatStatValue(period?.away?.goals ?? period?.awayGoals)}
                      homeValue={formatStatValue(period?.home?.goals ?? period?.homeGoals)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">Linescore data not available.</div>
              )}
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold">Game Stats</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  {getTeamLogoByAbbrev(away?.abbrev) ? (
                    <Image
                      src={getTeamLogoByAbbrev(away?.abbrev) as string}
                      alt={away?.abbrev || 'Away'}
                      width={24}
                      height={24}
                    />
                  ) : null}
                  <span>{away?.abbrev || 'Away'}</span>
                </div>
                <div className="text-center text-[10px] uppercase text-muted-foreground">Stat</div>
                <div className="flex items-center justify-end gap-2 font-semibold text-foreground">
                  <span>{home?.abbrev || 'Home'}</span>
                  {getTeamLogoByAbbrev(home?.abbrev) ? (
                    <Image
                      src={getTeamLogoByAbbrev(home?.abbrev) as string}
                      alt={home?.abbrev || 'Home'}
                      width={24}
                      height={24}
                    />
                  ) : null}
                </div>
              </div>
              <StatRow
                label="Shots"
                awayValue={formatStatValue(storyShots.away ?? awayTotals?.shots)}
                homeValue={formatStatValue(storyShots.home ?? homeTotals?.shots)}
              />
              <StatRow
                label="Faceoff %"
                awayValue={formatPct(storyFaceoff.away ?? getFaceoffDisplay(awayTotals))}
                homeValue={formatPct(storyFaceoff.home ?? getFaceoffDisplay(homeTotals))}
              />
              <StatRow
                label="Power Play"
                awayValue={formatStatValue(storyPowerPlay.away ?? getPowerPlayDisplay(awayTotals))}
                homeValue={formatStatValue(storyPowerPlay.home ?? getPowerPlayDisplay(homeTotals))}
              />
              <StatRow
                label="PIM"
                awayValue={formatStatValue(storyPim.away ?? awayTotals?.pim)}
                homeValue={formatStatValue(storyPim.home ?? homeTotals?.pim)}
              />
              <StatRow
                label="Hits"
                awayValue={formatStatValue(storyHits.away ?? awayTotals?.hits)}
                homeValue={formatStatValue(storyHits.home ?? homeTotals?.hits)}
              />
              <StatRow
                label="Blocks"
                awayValue={formatStatValue(storyBlocks.away ?? awayTotals?.blocked)}
                homeValue={formatStatValue(storyBlocks.home ?? homeTotals?.blocked)}
              />
              <StatRow
                label="Giveaways"
                awayValue={formatStatValue(storyGiveaways.away ?? awayTotals?.giveaways)}
                homeValue={formatStatValue(storyGiveaways.home ?? homeTotals?.giveaways)}
              />
              <StatRow
                label="Takeaways"
                awayValue={formatStatValue(storyTakeaways.away ?? awayTotals?.takeaways)}
                homeValue={formatStatValue(storyTakeaways.home ?? homeTotals?.takeaways)}
              />
            </CardContent>
          </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
