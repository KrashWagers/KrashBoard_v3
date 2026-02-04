'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GameStatusBadge } from '@/components/nhl/scores/GameStatusBadge'
import { TeamRow } from '@/components/nhl/scores/TeamRow'
import type { GameSummary, GameWeekDay } from '@/components/nhl/scores/types'

type ScoreApiResponse = {
  gameWeek?: Array<GameWeekDay & { games?: GameSummary[] }>
  games?: GameSummary[]
  meta?: {
    date?: string
  }
}

type NHLProp = {
  unique_id: string
  kw_player_id: string | null
  kw_player_name: string | null
  O_U: string | null
  line: number | null
  prop_name: string | null
  hit_L10: number | null
  n_L10: number | null
  price_american?: number | null
  espn_headshot?: string | null
  commence_time_utc: string | null
  start_time_est?: string | null
  home_abbr?: string | null
  away_abbr?: string | null
  matchup?: string | null
  player_team?: string | null
}

const cardClass =
  'rounded-md border border-gray-700 bg-[#171717] shadow-none transition-none hover:shadow-none hover:translate-y-0'

const toolCards = [
  {
    title: 'Goalie Report',
    description: 'Starting goalie performance and matchup insights',
    href: '/nhl/tools/goalie-report',
    highlights: ['Matchups', 'Save % trends', 'Shot volume'],
  },
  {
    title: 'The Market',
    description: 'Market movement and betting opportunities',
    href: '/nhl/tools/the-market',
    highlights: ['Line shopping', 'Value gaps', 'Market trends'],
  },
  {
    title: 'High Danger Shooters',
    description: 'Shot quality leaders and hot streaks',
    href: '/nhl/tools/high-danger-shooters',
    highlights: ['HD chances', 'Recent form', 'Shot locations'],
  },
  {
    title: 'Team Gamelogs',
    description: 'Game-by-game team performance splits',
    href: '/nhl/tools/team-gamelogs',
    highlights: ['Scoring trends', 'Home/away', 'Opponent splits'],
  },
  {
    title: 'Team Rankings',
    description: 'Offense/defense rankings and ratings',
    href: '/nhl/tools/team-rankings',
    highlights: ['Power rankings', 'Special teams', 'Recent form'],
  },
]

function getTodayEasternDate(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

function getEasternDateFromIso(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatStartTime(startTimeUTC?: string, timeZone?: string): string {
  if (!startTimeUTC) return 'TBD'
  const date = new Date(startTimeUTC)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatPeriodLabel(game: GameSummary): string {
  const periodNumber = game.periodDescriptor?.number
  const periodType = game.periodDescriptor?.periodType
  if (periodType === 'SO') return 'SO'
  if (periodType === 'OT') return 'OT'
  if (periodNumber) return `P${periodNumber}`
  return 'LIVE'
}

function extractIdFromLink(link?: string): string | null {
  if (!link) return null
  const match = link.match(/(\d{8,})/)
  return match ? match[1] : null
}

function getGameId(game: GameSummary): string | null {
  const candidate = game.id ?? game.gameId ?? game.gamePk
  if (candidate != null) return String(candidate)
  return (
    extractIdFromLink(game.gameCenterLink) ||
    extractIdFromLink(game.gamecenterLink) ||
    extractIdFromLink(game.gameLink)
  )
}

function formatPct(value: number | null) {
  if (value == null) return '-'
  return `${Math.round(value * 100)}%`
}

function formatMatchup(prop: NHLProp): string {
  if (prop.matchup) return prop.matchup
  if (prop.away_abbr && prop.home_abbr) return `${prop.away_abbr} @ ${prop.home_abbr}`
  return 'Matchup TBD'
}

function getNHLTeamLogo(abbrev?: string | null): string {
  if (!abbrev) return '/Images/League_Logos/NHL-Logo.png'
  const teamMap: Record<string, string> = {
    ANA: '/Images/NHL_Logos/ANA.png',
    ARI: '/Images/NHL_Logos/ARI.png',
    BOS: '/Images/NHL_Logos/BOS.png',
    BUF: '/Images/NHL_Logos/BUF.png',
    CAR: '/Images/NHL_Logos/CAR.png',
    CBJ: '/Images/NHL_Logos/CBJ.png',
    CGY: '/Images/NHL_Logos/CGY.png',
    CHI: '/Images/NHL_Logos/CHI.png',
    COL: '/Images/NHL_Logos/COL.png',
    DAL: '/Images/NHL_Logos/DAL.png',
    DET: '/Images/NHL_Logos/DET.png',
    EDM: '/Images/NHL_Logos/EDM.png',
    FLA: '/Images/NHL_Logos/FLA.png',
    LAK: '/Images/NHL_Logos/LAK.png',
    MIN: '/Images/NHL_Logos/MIN.png',
    MTL: '/Images/NHL_Logos/MTL.png',
    NSH: '/Images/NHL_Logos/NSH.png',
    NJD: '/Images/NHL_Logos/NJD.png',
    NYI: '/Images/NHL_Logos/NYI.png',
    NYR: '/Images/NHL_Logos/NYR.png',
    OTT: '/Images/NHL_Logos/OTT.png',
    PHI: '/Images/NHL_Logos/PHI.png',
    PIT: '/Images/NHL_Logos/PIT.png',
    SJS: '/Images/NHL_Logos/SJS.png',
    SEA: '/Images/NHL_Logos/SEA.png',
    STL: '/Images/NHL_Logos/STL.png',
    TB: '/Images/NHL_Logos/TB.png',
    TOR: '/Images/NHL_Logos/TOR.png',
    UTA: '/Images/NHL_Logos/UTA.png',
    VAN: '/Images/NHL_Logos/VAN.png',
    VGK: '/Images/NHL_Logos/VGK.png',
    WPG: '/Images/NHL_Logos/WPG.png',
    WSH: '/Images/NHL_Logos/WSH.png',
  }
  return teamMap[abbrev] || '/Images/League_Logos/NHL-Logo.png'
}

export default function NHLHomeClient() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(getTodayEasternDate())
  const [scoreData, setScoreData] = useState<ScoreApiResponse | null>(null)
  const [scoreLoading, setScoreLoading] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)

  const [propsData, setPropsData] = useState<NHLProp[]>([])
  const [propsLoading, setPropsLoading] = useState(false)
  const [propsError, setPropsError] = useState<string | null>(null)

  const loadScores = useCallback(async (date: string) => {
    setScoreLoading(true)
    setScoreError(null)
    try {
      const response = await fetch(`/api/nhl/score?date=${date}`)
      if (!response.ok) {
        throw new Error('Failed to load scores')
      }
      const json = (await response.json()) as ScoreApiResponse
      setScoreData(json)
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : 'Failed to load scores')
    } finally {
      setScoreLoading(false)
    }
  }, [])

  const loadProps = useCallback(async () => {
    setPropsLoading(true)
    setPropsError(null)
    try {
      const response = await fetch('/api/nhl/props?page=1&limit=10000')
      if (!response.ok) {
        throw new Error('Failed to load props')
      }
      const json = (await response.json()) as { data?: NHLProp[] }
      setPropsData(json.data ?? [])
    } catch (err) {
      setPropsError(err instanceof Error ? err.message : 'Failed to load props')
    } finally {
      setPropsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScores(selectedDate)
  }, [selectedDate, loadScores])

  useEffect(() => {
    loadProps()
  }, [loadProps])

  const weekDays = scoreData?.gameWeek || []
  const gamesForDate =
    scoreData?.games ||
    scoreData?.gameWeek?.find((day) => day.date === selectedDate)?.games ||
    []

  const activeDayIndex = useMemo(() => {
    if (!weekDays.length) return -1
    const idx = weekDays.findIndex((day) => day.date === selectedDate)
    return idx
  }, [weekDays, selectedDate])

  const handlePrevDay = () => {
    if (activeDayIndex <= 0) return
    setSelectedDate(weekDays[activeDayIndex - 1]?.date || selectedDate)
  }

  const handleNextDay = () => {
    if (activeDayIndex === -1 || activeDayIndex >= weekDays.length - 1) return
    setSelectedDate(weekDays[activeDayIndex + 1]?.date || selectedDate)
  }

  const todayEastern = getTodayEasternDate()
  const topProps = useMemo(() => {
    const filtered = propsData.filter((prop) => {
      const propDate = getEasternDateFromIso(prop.commence_time_utc)
      return propDate === todayEastern
    })
    return filtered
      .filter((prop) => prop.hit_L10 != null)
      .filter((prop) => prop.price_american != null && prop.price_american >= -150)
      .sort((a, b) => {
        const hitDiff = (b.hit_L10 ?? 0) - (a.hit_L10 ?? 0)
        if (hitDiff !== 0) return hitDiff
        return (b.n_L10 ?? 0) - (a.n_L10 ?? 0)
      })
      .slice(0, 10)
  }, [propsData, todayEastern])

  const handlePropClick = (prop: NHLProp) => {
    if (!prop.kw_player_id) return
    const propInfo = {
      propName: prop.prop_name,
      line: prop.line,
      ou: prop.O_U,
      playerId: prop.kw_player_id,
      playerName: prop.kw_player_name,
      periodFilter: 'L10',
    }
    sessionStorage.setItem('selectedNHLProp', JSON.stringify(propInfo))
    router.push(`/nhl/prop-lab/${prop.kw_player_id}`)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:w-[80%]">
      <Card className={`${cardClass} w-full`}>
        <CardContent className="flex items-center gap-2 p-2 sm:p-3">
          <Button
            variant="outline"
            className="h-8 w-8 border-gray-700 bg-[#171717] p-0"
            onClick={handlePrevDay}
            disabled={activeDayIndex <= 0}
            aria-label="Previous day"
          >
            {'<'}
          </Button>

          <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
            {scoreLoading && gamesForDate.length === 0 ? (
              <Card className={`${cardClass} min-w-[180px]`}>
                <CardContent className="py-6 text-center text-xs text-muted-foreground">
                  Loading games...
                </CardContent>
              </Card>
            ) : null}

            {gamesForDate.map((game) => {
              const gameId = getGameId(game)
              const isLive = ['LIVE', 'CRIT'].includes((game.gameState || '').toUpperCase())
              const tile = (
                <Card className={`${cardClass} min-w-[180px]`}>
                  <CardContent className="space-y-1.5 p-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <GameStatusBadge gameState={game.gameState} />
                      <span>
                        {isLive
                          ? `${formatPeriodLabel(game)} ${game.clock?.timeRemaining || ''}`
                          : formatStartTime(game.startTimeUTC)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <TeamRow team={game.awayTeam} />
                      <TeamRow team={game.homeTeam} isHome />
                    </div>
                  </CardContent>
                </Card>
              )

              if (!gameId) return <div key={game.id}>{tile}</div>

              return (
                <Link key={game.id} href={`/nhl/gamecenter/${gameId}`} className="block">
                  {tile}
                </Link>
              )
            })}

            {!scoreLoading && gamesForDate.length === 0 && !scoreError ? (
              <Card className={`${cardClass} min-w-[180px]`}>
                <CardContent className="py-6 text-center text-xs text-muted-foreground">
                  No games scheduled for this date.
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Button
            variant="outline"
            className="h-8 w-8 border-gray-700 bg-[#171717] p-0"
            onClick={handleNextDay}
            disabled={activeDayIndex === -1 || activeDayIndex >= weekDays.length - 1}
            aria-label="Next day"
          >
            {'>'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className={cardClass}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Prop Lab</CardTitle>
                <CardDescription>Top L10 hit-rate props for today’s slate.</CardDescription>
              </div>
              <Button asChild variant="outline" className="border-gray-700 bg-[#171717]">
                <Link href="/nhl/tools/prop-lab">Open Prop Lab</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {propsError ? (
              <div className="text-sm text-muted-foreground">{propsError}</div>
            ) : null}
            {propsLoading && topProps.length === 0 ? (
              <div className="text-sm text-muted-foreground">Loading props...</div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {topProps.map((prop) => (
                <Card key={prop.unique_id} className={`${cardClass} overflow-hidden`}>
                  <CardContent className="space-y-3 p-0">
                    <button
                      type="button"
                      onClick={() => handlePropClick(prop)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-800 bg-[#111111] px-3 py-2">
                        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {prop.prop_name || 'Prop'}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rounded-md border border-gray-700 bg-black/30 px-2 py-0.5 text-xs text-foreground">
                            {prop.O_U || 'Side'} {prop.line ?? '-'}
                          </div>
                          <div className="rounded-md border border-gray-700 bg-black/30 px-2 py-0.5 text-xs text-foreground">
                            {prop.price_american ?? '—'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0">
                            {prop.espn_headshot ? (
                              <img
                                src={prop.espn_headshot}
                                alt={prop.kw_player_name || 'Player'}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-muted" />
                            )}
                            {prop.player_team ? (
                              <img
                                src={getNHLTeamLogo(prop.player_team)}
                                alt={prop.player_team}
                                className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full border border-gray-700 bg-[#171717] object-contain"
                              />
                            ) : null}
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-foreground">
                              {prop.kw_player_name || 'Player'}
                            </div>
                            <div className="text-xs text-muted-foreground">{formatMatchup(prop)}</div>
                          </div>
                        </div>

                        <div className="rounded-md border border-gray-700 bg-[#101010] px-3 py-2 text-right">
                          <div className="text-xl font-semibold text-green-400">
                            {formatPct(prop.hit_L10)}
                          </div>
                          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Hit Rate
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                        <div className="rounded-md border border-gray-800 bg-black/20 px-2 py-1.5 text-[11px] text-muted-foreground">
                          L10 focus · Today
                        </div>
                        <div className="rounded-md border border-gray-800 bg-black/20 px-2 py-1.5 text-[11px] text-muted-foreground text-right">
                          Click to open
                        </div>
                      </div>
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!propsLoading && topProps.length === 0 && !propsError ? (
              <div className="text-sm text-muted-foreground">
                No props available for today yet.
              </div>
            ) : null}
          </CardContent>
        </Card>

        {toolCards.map((tool) => (
          <Card key={tool.title} className={cardClass}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm text-muted-foreground">
                {tool.highlights.map((item) => (
                  <div key={item}>• {item}</div>
                ))}
              </div>
              <Button asChild variant="outline" className="w-full border-gray-700 bg-[#171717]">
                <Link href={tool.href}>Open Tool</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
