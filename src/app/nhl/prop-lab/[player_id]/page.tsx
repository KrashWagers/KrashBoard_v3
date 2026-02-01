"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import Link from "next/link"
import { GoalsDashboard } from "./GoalsDashboard"
import { ShotsDashboard } from "./ShotsDashboard"
import { AssistsDashboard } from "./AssistsDashboard"
import { PointsDashboard } from "./PointsDashboard"
import { PPPointsDashboard } from "./PPPointsDashboard"
import { GamelogsTab } from "./components/goals/GamelogsTab"
import { MarketTab } from "./components/goals/MarketTab"
import { ArrowLeft, RotateCcw, ChevronDown, ChevronUp, Info, Settings } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TeamPayloadRow } from "@/types/nhlTeamPayload"

interface PlayerGamelog {
  [key: string]: number | string | undefined
  season_id: string
  game_id: string
  game_date: string
  home_abbrev: string
  away_abbrev: string
  player_id: number
  player_name: string
  Pos: string
  Hand: string
  'Headshot URL': string
  player_team_abbrev: string
  opp: string
  venue: string
  shots_on_goal: number
  shots_missed: number
  shots_blocked_by_defense: number
  corsi: number
  fenwick: number
  blocks: number
  goals: number
  assists: number
  assists1: number
  assists2: number
  points: number
  First_Goal_Scorer: number
  Last_Goal_Scorer: number
  pp_shots_on_goal: number
  pp_shots_missed: number
  pp_shots_blocked_by_defense: number
  pp_corsi: number
  pp_fenwick: number
  pp_goals: number
  pp_assists1: number
  pp_assists2: number
  pp_points: number
  '5v5_shots_on_goal': number
  '5v5_shots_missed': number
  '5v5_shots_blocked_by_defense': number
  '5v5_corsi': number
  '5v5_fenwick': number
  '5v5_goals': number
  '5v5_assists': number
  '5v5_points': number
  P1_shots: number
  P2_shots: number
  P3_shots: number
  OT_shots: number
  P1_corsi: number
  P2_corsi: number
  P3_corsi: number
  OT_corsi: number
  P1_goals: number
  P2_goals: number
  P3_goals: number
  OT_goals: number
  P1_assists: number
  P2_assists: number
  P3_assists: number
  OT_assists: number
  P1_points: number
  P2_points: number
  P3_points: number
  OT_points: number
  team_shots_on_goal: number
  team_shots_missed: number
  team_shots_blocked_by_defense: number
  team_goals: number
  team_assists: number
  team_points: number
  team_pp_shots_on_goal: number
  team_pp_shots_missed: number
  team_pp_shots_blocked_by_defense: number
  team_pp_goals: number
  team_pp_assists: number
  team_pp_points: number
  team_5v5_shots_on_goal: number
  team_5v5_shots_missed: number
  team_5v5_shots_blocked_by_defense: number
  team_5v5_corsi: number
  team_5v5_fenwick: number
  team_5v5_goals: number
  team_5v5_assists: number
  team_5v5_points: number
  shifts: number
  toi_seconds: number
  toi: string
  pp_toi_seconds: number
  pk_toi_seconds: number
  ev_5v5_toi_seconds: number
  ev_4v4_toi_seconds: number
  ev_3v3_toi_seconds: number
  pp_mmss: string
  pk_mmss: string
  ev_5v5_mmss: string
  ev_4v4_mmss: string
  ev_3v3_mmss: string
  goals_HD: number
  goals_MD: number
  goals_LD: number
  sog_HD: number
  sog_MD: number
  sog_LD: number
  shots_missed_HD: number
  shots_missed_MD: number
  shots_missed_LD: number
  shots_blocked_HD: number
  shots_blocked_MD: number
  shots_blocked_LD: number
  sat_HD: number
  sat_MD: number
  sat_LD: number
  next_opponent: string
  next_venue: string
  days_rest: number
  game_time_local: string
  game_time_bucket: string
  day_of_week: string
}

interface PlayerPropBook {
  odds: number
  iw: number
}

interface PlayerPropHitRate {
  hr: number
  n: number
}

interface PlayerProp {
  prop_uid: string
  event_id: string
  prop: string
  side: 'Over' | 'Under'
  line: number
  is_alt: number
  books: Record<string, PlayerPropBook>
  best: {
    odds: number
    iw: number
    book: string
  }
  hit_rates: {
    season_2425?: PlayerPropHitRate
    season_2526?: PlayerPropHitRate
    L50?: PlayerPropHitRate
    L30?: PlayerPropHitRate
    L20?: PlayerPropHitRate
    L10?: PlayerPropHitRate
    L5?: PlayerPropHitRate
  }
  distribution: {
    avg: number
    min: number
    max: number
    streak_current: number
  }
  market: {
    last_update_utc: string
    fetch_ts_utc: string
  }
}

interface PlayerBio {
  first_name: string
  last_name: string
  position: string
  hand: string
  headshot_url: string
  sweater_number: string
  birth_date: string
  birth_country: string
  shoots_catches: string
}

interface PlayerUpcoming {
  player_team: string
  opponent: string
  venue: 'Home' | 'Away' | null
  matchup: string
  game_date: string
  game_time_local: string
  days_rest: number | null
}

interface PlayerPayload {
  player_id: number
  player_name: string
  bio: PlayerBio
  upcoming: PlayerUpcoming
  gamelogs: PlayerGamelog[]
  props: PlayerProp[]
}

interface SelectedProp {
  propName: string
  line: number
  ou: string
  playerId: string
  playerName: string
}

const buildBooksFromFlat = (prop: Record<string, unknown>): Record<string, PlayerPropBook> => {
  const bookFields = [
    { key: 'fanduel', odds: 'fanduel_odds', iw: 'fanduel_iw' },
    { key: 'draftkings', odds: 'dk_odds', iw: 'dk_iw' },
    { key: 'pinnacle', odds: 'pinnacle_odds', iw: 'pinnacle_iw' },
    { key: 'betmgm', odds: 'betmgm_odds', iw: 'betmgm_iw' },
    { key: 'betrivers', odds: 'betrivers_odds', iw: 'betrivers_iw' },
    { key: 'caesars', odds: 'caesars_odds', iw: 'caesars_iw' },
    { key: 'fanatics', odds: 'fanatics_odds', iw: 'fanatics_iw' },
  ]

  return bookFields.reduce((acc: Record<string, PlayerPropBook>, book) => {
    const odds = prop[book.odds]
    if (odds == null) return acc
    acc[book.key] = {
      odds: Number(odds),
      iw: prop[book.iw] != null ? Number(prop[book.iw]) : 0,
    }
    return acc
  }, {})
}

const normalizeProp = (raw: Record<string, unknown>): PlayerProp => {
  const booksFromRaw = raw.books && typeof raw.books === 'object' ? (raw.books as Record<string, PlayerPropBook>) : null
  const books = booksFromRaw ?? buildBooksFromFlat(raw)
  const bestFromRaw = raw.best && typeof raw.best === 'object' ? (raw.best as PlayerProp['best']) : null

  return {
    prop_uid: String(raw.prop_uid ?? raw.Prop_UID ?? raw.unique_id ?? raw.PropUID ?? ''),
    event_id: String(raw.event_id ?? raw.Event_ID ?? raw.event_id ?? ''),
    prop: String(raw.prop ?? raw.Prop ?? raw.prop_name ?? raw.Prop_Name ?? ''),
    side: (String(raw.side ?? raw.Side ?? raw.O_U ?? raw.ou ?? '') as PlayerProp['side']) || 'Over',
    line: Number(raw.line ?? raw.Line ?? 0),
    is_alt: Number(raw.is_alt ?? raw.is_alternate ?? 0),
    books,
    best: bestFromRaw ?? {
      odds: Number(raw.best_odds ?? raw.best_odds_american ?? 0),
      iw: Number(raw.best_iw ?? raw.best_implied_win ?? 0),
      book: String(raw.best_book ?? raw.best_bookmaker ?? 'Best'),
    },
    hit_rates: raw.hit_rates && typeof raw.hit_rates === 'object'
      ? (raw.hit_rates as PlayerProp['hit_rates'])
      : {
          season_2425: raw.HR_2425 != null && raw.N_2425 != null ? { hr: Number(raw.HR_2425), n: Number(raw.N_2425) } : undefined,
          season_2526: raw.HR_2526 != null && raw.N_2526 != null ? { hr: Number(raw.HR_2526), n: Number(raw.N_2526) } : undefined,
          L50: raw.HR_L50 != null && raw.N_L50 != null ? { hr: Number(raw.HR_L50), n: Number(raw.N_L50) } : undefined,
          L30: raw.HR_L30 != null && raw.N_L30 != null ? { hr: Number(raw.HR_L30), n: Number(raw.N_L30) } : undefined,
          L20: raw.HR_L20 != null && raw.N_L20 != null ? { hr: Number(raw.HR_L20), n: Number(raw.N_L20) } : undefined,
          L10: raw.HR_L10 != null && raw.N_L10 != null ? { hr: Number(raw.HR_L10), n: Number(raw.N_L10) } : undefined,
          L5: raw.HR_L5 != null && raw.N_L5 != null ? { hr: Number(raw.HR_L5), n: Number(raw.N_L5) } : undefined,
        },
    distribution: raw.distribution && typeof raw.distribution === 'object'
      ? (raw.distribution as PlayerProp['distribution'])
      : {
          avg: Number(raw.Avg_Stat ?? raw.avg_stat ?? 0),
          min: Number(raw.Min_Stat ?? raw.min_stat ?? 0),
          max: Number(raw.Max_Stat ?? raw.max_stat ?? 0),
          streak_current: Number(raw.Streak_Current ?? raw.streak ?? 0),
        },
    market: raw.market && typeof raw.market === 'object'
      ? (raw.market as PlayerProp['market'])
      : {
          last_update_utc: String(raw.market_last_update_utc ?? ''),
          fetch_ts_utc: String(raw.fetch_ts_utc ?? ''),
        },
  }
}

const normalizePayload = (raw: Record<string, unknown>): PlayerPayload => {
  const rawProps = Array.isArray(raw.props) ? raw.props : []
  const normalizedProps = rawProps.map((prop) => normalizeProp(prop as Record<string, unknown>))

  const fallbackHeadshot =
    (raw.bio as PlayerBio | undefined)?.headshot_url ||
    (raw as any).headshot_url ||
    (raw as any).gamelogs?.[0]?.headshot_url ||
    (raw as any).gamelogs?.[0]?.['Headshot URL'] ||
    (rawProps[0] as any)?.player_headshot ||
    ''

  const rawBio = (raw.bio as PlayerBio | undefined) ?? {
    first_name: String((raw as any).first_name ?? ''),
    last_name: String((raw as any).last_name ?? ''),
    position: String((raw as any).position ?? ''),
    hand: String((raw as any).hand ?? ''),
    headshot_url: String(fallbackHeadshot),
    sweater_number: String((raw as any).sweater_number ?? ''),
    birth_date: String((raw as any).birth_date ?? ''),
    birth_country: String((raw as any).birth_country ?? ''),
    shoots_catches: String((raw as any).shoots_catches ?? ''),
  }

  const rawUpcoming = (raw.upcoming as PlayerUpcoming | undefined) ?? {
    player_team: String((raw as any).player_team ?? (raw as any).player_team_abbrev ?? ''),
    opponent: String((raw as any).opponent ?? (raw as any).next_opponent ?? ''),
    venue: ((raw as any).venue ?? (raw as any).next_venue ?? null) as PlayerUpcoming['venue'],
    matchup: String((raw as any).matchup ?? ''),
    game_date: String((raw as any).game_date ?? ''),
    game_time_local: String((raw as any).game_time_local ?? ''),
    days_rest: (raw as any).days_rest ?? null,
  }

  return {
    player_id: Number(raw.player_id ?? 0),
    player_name: String(raw.player_name ?? ''),
    bio: { ...rawBio, headshot_url: rawBio.headshot_url || String(fallbackHeadshot) },
    upcoming: rawUpcoming,
    gamelogs: Array.isArray(raw.gamelogs) ? (raw.gamelogs as PlayerGamelog[]) : [],
    props: normalizedProps,
  }
}

const getNHLTeamLogo = (abbrev: string): string => {
  const teamMap: { [key: string]: string } = {
    'ANA': '/Images/NHL_Logos/ANA.png', 'BOS': '/Images/NHL_Logos/BOS.png',
    'BUF': '/Images/NHL_Logos/BUF.png', 'CAR': '/Images/NHL_Logos/CAR.png', 'CBJ': '/Images/NHL_Logos/CBJ.png',
    'CGY': '/Images/NHL_Logos/CGY.png', 'CHI': '/Images/NHL_Logos/CHI.png', 'COL': '/Images/NHL_Logos/COL.png',
    'DAL': '/Images/NHL_Logos/DAL.png', 'DET': '/Images/NHL_Logos/DET.png', 'EDM': '/Images/NHL_Logos/EDM.png',
    'FLA': '/Images/NHL_Logos/FLA.png', 'LAK': '/Images/NHL_Logos/LAK.png', 'MIN': '/Images/NHL_Logos/MIN.png',
    'MTL': '/Images/NHL_Logos/MTL.png', 'NSH': '/Images/NHL_Logos/NSH.png', 'NJD': '/Images/NHL_Logos/NJD.png',
    'NYI': '/Images/NHL_Logos/NYI.png', 'NYR': '/Images/NHL_Logos/NYR.png', 'OTT': '/Images/NHL_Logos/OTT.png',
    'PHI': '/Images/NHL_Logos/PHI.png', 'PIT': '/Images/NHL_Logos/PIT.png', 'SJS': '/Images/NHL_Logos/SJS.png',
    'SEA': '/Images/NHL_Logos/SEA.png', 'STL': '/Images/NHL_Logos/STL.png', 'TB': '/Images/NHL_Logos/TB.png',
    'TOR': '/Images/NHL_Logos/TOR.png', 'UTA': '/Images/NHL_Logos/UTA.png', 'VAN': '/Images/NHL_Logos/VAN.png',
    'VGK': '/Images/NHL_Logos/VGK.png', 'WPG': '/Images/NHL_Logos/WPG.png', 'WSH': '/Images/NHL_Logos/WSH.png'
  }
  return teamMap[abbrev] || '/Images/League_Logos/NHL-Logo.png'
}

// All 32 NHL team abbreviations (ARI removed, now UTA)
const ALL_NHL_TEAMS = [
  'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL', 'DAL',
  'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NSH', 'NJD', 'NYI', 'NYR',
  'OTT', 'PHI', 'PIT', 'SJS', 'SEA', 'STL', 'TB', 'TOR', 'UTA', 'VAN',
  'VGK', 'WPG', 'WSH'
]

const getBookmakerLogo = (bookmaker: string): string => {
  const normalized = bookmaker.toLowerCase().replace(/\s+/g, '')
  const bookmakerMap: { [key: string]: string } = {
    fanatics: '/Images/Sportsbook_Logos/Fanatics.jpeg',
    betrivers: '/Images/Sportsbook_Logos/betriverslogo.png',
    draftkings: '/Images/Sportsbook_Logos/DraftKingsLogo.png',
    fanduel: '/Images/Sportsbook_Logos/fanDuel.jpg',
    pinnacle: '/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg',
    betmgm: '/Images/Sportsbook_Logos/betmgm.png',
  }
  return bookmakerMap[normalized] || ''
}

export default function NHLPlayerPropDashboard() {
  const params = useParams()
  const playerId = params.player_id as string
  
  const [payload, setPayload] = useState<PlayerPayload | null>(null)
  const [gamelogs, setGamelogs] = useState<PlayerGamelog[]>([])
  const [allProps, setAllProps] = useState<PlayerProp[]>([])
  const [selectedProp, setSelectedProp] = useState<SelectedProp | null>(null)
  const [availableProps, setAvailableProps] = useState<string[]>([])
  const [lineValue, setLineValue] = useState(0.5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamPayload, setTeamPayload] = useState<TeamPayloadRow | null>(null)
  const [opponentPayload, setOpponentPayload] = useState<TeamPayloadRow | null>(null)
  const [activeTab, setActiveTab] = useState<'prop-lab' | 'gamelogs' | 'market'>('prop-lab')
  
  // Separate filter states - time filters are mutually exclusive, venue works independently
  const [timeFilter, setTimeFilter] = useState<string>('20252026')
  const [venueFilter, setVenueFilter] = useState<string>('all')
  const [daysRestFilter, setDaysRestFilter] = useState<string>('all')
  const [gameTimeFilter, setGameTimeFilter] = useState<string>('all')
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState<string>('all')
  const [opponentFilter, setOpponentFilter] = useState<string | null>(null)
  const [teamSelectorOpen, setTeamSelectorOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Chart settings state
  const [chartSettings, setChartSettings] = useState({
    showAverageLine: false,
    showRollingAverage: false,
    rollingAverageWindow: 5,
    showMovingAverage: false,
    movingAverageWindow: 10,
    showTrendLine: false
  })
  
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
      // Set default period filter if provided
      if (prop.periodFilter) {
        setTimeFilter(prop.periodFilter)
      }
    }
  }, [])
  
  // Fetch payload (preferred) or fall back to legacy endpoints
  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
      try {
        setLoading(true)

        const dataVersion = new Date().toISOString().slice(0, 10)
        const refreshParam = forceRefresh ? "&refresh=1" : ""
        const payloadResponse = await fetch(
          `/api/nhl/player-payload?player_id=${playerId}&dv=${dataVersion}${refreshParam}`,
          { cache: "no-store" }
        )

        if (payloadResponse.ok) {
          const payloadJson = await payloadResponse.json()
          const rawPayload = (payloadJson.payload ?? payloadJson) as Record<string, unknown>
          const payload = normalizePayload(rawPayload)
          setPayload(payload)
          setGamelogs(payload.gamelogs || [])
          setAllProps(payload.props || [])

          const uniqueProps = [...new Set((payload.props || []).map((prop) => prop.prop).filter((prop): prop is string => Boolean(prop)))].sort()
          setAvailableProps(uniqueProps)

          if (process.env.NODE_ENV !== 'production') {
            console.log('Player payload response:', {
              player_id: payload?.player_id,
              player_name: payload?.player_name,
              headshot_url: payload?.bio?.headshot_url,
              gamelogs_count: payload?.gamelogs?.length ?? 0,
              props_count: payload?.props?.length ?? 0,
              first_prop: payload?.props?.[0] ?? null,
            })
          }
        } else if (payloadResponse.status === 404) {
          // Fallback to legacy endpoints if payload is missing
          const gamelogsResponse = await fetch(`/api/nhl/players/${playerId}/gamelogs`)
          if (!gamelogsResponse.ok) throw new Error('Failed to fetch gamelogs')
          const gamelogsData = await gamelogsResponse.json()
          setGamelogs(gamelogsData.data)
          setPayload(null)

          const playerName = gamelogsData.data[0]?.player_name
          if (!playerName) {
            throw new Error('Player name not found in gamelogs')
          }

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

          const playerProps = propsArray.filter((prop) =>
            prop.kw_player_name?.trim().toLowerCase() === playerName.trim().toLowerCase()
          )

          const mappedLegacyProps: PlayerProp[] = playerProps.map((prop) => ({
            prop_uid: prop.unique_id,
            event_id: prop.event_id,
            prop: prop.prop_name,
            side: prop.O_U,
            line: prop.line,
            is_alt: prop.is_alternate ?? 0,
            books: (prop.all_books || []).reduce((acc: Record<string, PlayerPropBook>, book: any) => {
              if (!book?.bookmaker || book.price_american == null) return acc
              acc[String(book.bookmaker).toLowerCase()] = {
                odds: book.price_american,
                iw: book.implied_win_pct ?? 0,
              }
              return acc
            }, {}),
            best: {
              odds: prop.price_american,
              iw: prop.implied_win_pct ?? 0,
              book: prop.bookmaker ?? 'Best',
            },
            hit_rates: {
              season_2425: prop.hit_2025 != null && prop.gp_2024 != null ? { hr: prop.hit_2025, n: prop.gp_2024 } : undefined,
              season_2526: prop.hit_2024 != null && prop.gp_2025 != null ? { hr: prop.hit_2024, n: prop.gp_2025 } : undefined,
              L30: prop.hit_L30 != null && prop.n_L30 != null ? { hr: prop.hit_L30, n: prop.n_L30 } : undefined,
              L10: prop.hit_L10 != null && prop.n_L10 != null ? { hr: prop.hit_L10, n: prop.n_L10 } : undefined,
              L5: prop.hit_L5 != null && prop.n_L5 != null ? { hr: prop.hit_L5, n: prop.n_L5 } : undefined,
            },
            distribution: {
              avg: prop.avg_stat ?? 0,
              min: prop.min_stat ?? 0,
              max: prop.max_stat ?? 0,
              streak_current: prop.streak ?? 0,
            },
            market: {
              last_update_utc: prop.market_last_update_utc ?? '',
              fetch_ts_utc: prop.fetch_ts_utc ?? '',
            },
          }))

          const uniqueProps = [...new Set(mappedLegacyProps.map((prop) => prop.prop).filter((prop): prop is string => Boolean(prop)))].sort()
          setAvailableProps(uniqueProps)
          setAllProps(mappedLegacyProps)
        } else {
          const errorText = await payloadResponse.text()
          throw new Error(`Payload fetch failed (${payloadResponse.status}): ${errorText}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }, [playerId])

  useEffect(() => {
    if (playerId) fetchData()
  }, [playerId, fetchData])
  

  const playerTeam = useMemo(() => {
    const team =
      payload?.upcoming?.player_team ||
      (payload?.upcoming as { player_team_abbrev?: string } | undefined)?.player_team_abbrev ||
      gamelogs[0]?.player_team_abbrev ||
      null
    return team ? team.toUpperCase() : null
  }, [payload?.upcoming, gamelogs])
  const nextOpponent = useMemo(() => {
    const upcoming = payload?.upcoming as
      | { opponent?: string; next_opponent?: string; opp?: string }
      | undefined
    return upcoming?.opponent || upcoming?.next_opponent || upcoming?.opp || null
  }, [payload?.upcoming])

  const nextGameVenue = useMemo(() => {
    const upcoming = payload?.upcoming as
      | { venue?: 'Home' | 'Away' | null; next_venue?: 'Home' | 'Away' | null }
      | undefined
    return upcoming?.venue || upcoming?.next_venue || null
  }, [payload?.upcoming])

  const matchupDisplay = useMemo(() => {
    if (payload?.upcoming?.matchup) return payload.upcoming.matchup
    if (!playerTeam || !nextOpponent || !nextGameVenue) return null
    return nextGameVenue === 'Home' ? `${nextOpponent} @ ${playerTeam}` : `${playerTeam} @ ${nextOpponent}`
  }, [payload?.upcoming?.matchup, playerTeam, nextOpponent, nextGameVenue])

  useEffect(() => {
    const normalizedTeam = playerTeam?.trim().toUpperCase()
    const normalizedOpponent = nextOpponent?.trim().toUpperCase() ?? null
    if (!normalizedTeam) return

    let isActive = true
    const fetchTeamPayload = async (team: string) => {
      const response = await fetch(`/api/nhl/team-payload?team=${encodeURIComponent(team)}`)
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Team payload fetch failed")
      }
      return (await response.json()) as TeamPayloadRow
    }

    const loadPayloads = async () => {
      try {
        if (process.env.NODE_ENV !== "production") {
          console.log("Team payload fetch:", {
            playerTeam: normalizedTeam,
            opponentTeam: normalizedOpponent,
          })
        }

        const [teamData, opponentData] = await Promise.all([
          fetchTeamPayload(normalizedTeam),
          normalizedOpponent && normalizedOpponent !== normalizedTeam
            ? fetchTeamPayload(normalizedOpponent)
            : Promise.resolve(null),
        ])

        if (!isActive) return
        setTeamPayload(teamData ?? null)
        setOpponentPayload(opponentData ?? null)
      } catch (err) {
        if (!isActive) return
        setTeamPayload(null)
        setOpponentPayload(null)
      }
    }

    loadPayloads()
    return () => {
      isActive = false
    }
  }, [playerTeam, nextOpponent])

  // Reset all filters to default
  const resetFilters = () => {
    setTimeFilter('20252026') // Default to current season
    setVenueFilter('all')
    setDaysRestFilter('all')
    setGameTimeFilter('all')
    setDayOfWeekFilter('all')
    setOpponentFilter(null)
  }

  // Filter gamelogs based on active filters
  const filteredGamelogs = useMemo(() => {
    let filtered = [...gamelogs]
    
    // FIRST: Apply season filter if needed
    if (timeFilter === '20242025') {
      filtered = filtered.filter(game => game.season_id === '20242025')
    } else if (timeFilter === '20252026') {
      filtered = filtered.filter(game => game.season_id === '20252026')
    }
    
    // Apply opponent filter (when timeFilter is 'vsOpponent')
    if (timeFilter === 'vsOpponent' && opponentFilter) {
      filtered = filtered.filter(game => {
        const opponent = game.away_abbrev === game.player_team_abbrev ? game.home_abbrev : game.away_abbrev
        return opponent === opponentFilter
      })
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
    // Skip if opponent filter is active (already filtered above)
    if (timeFilter.startsWith('L') && timeFilter !== 'vsOpponent') {
      const count = parseInt(timeFilter.replace('L', ''))
      filtered = filtered.slice(0, count)
    }
    
    // Reverse so oldest is first (chart order: oldest on left, newest on right)
    filtered.reverse()
    
    return filtered
  }, [gamelogs, timeFilter, venueFilter, daysRestFilter, gameTimeFilter, dayOfWeekFilter, opponentFilter])
  
  // Calculate stats from filtered data
  const stats = useMemo(() => {
    if (!selectedProp || !filteredGamelogs.length) return null
    
    const line = lineValue
    const isOver = selectedProp.ou === 'Over'
    const field = getPropField(selectedProp.propName)
    
    const results = filteredGamelogs.map(game => {
      const rawValue = game[field]
      const value = typeof rawValue === 'number' ? rawValue : 0
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

  // Calculate season average from all gamelogs (unfiltered)
  const seasonAvg = useMemo(() => {
    if (!selectedProp || !gamelogs.length) return null
    const field = getPropField(selectedProp.propName)
    const total = gamelogs.reduce((sum, game) => {
      const rawValue = game[field]
      const value = typeof rawValue === 'number' ? rawValue : 0
      return sum + value
    }, 0)
    return gamelogs.length > 0 ? total / gamelogs.length : 0
  }, [selectedProp, gamelogs])

  // Graph average is the same as stats.avgValue (filtered average)
  const graphAvg = stats?.avgValue
  
  // Get prop field mapping
  function getPropField(propName: string): string {
    const mappings: { [key: string]: string } = {
      'Goals': 'goals',
      'Assists': 'assists',
      'Ast': 'assists',
      'Points': 'points',
      'Pts': 'points',
      'PP Pts': 'pp_points',
      'Power Play Points': 'pp_points',
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

  const normalizePropNameForMatch = (propName: string): string => {
    const mappings: { [key: string]: string } = {
      'Shots on Goal': 'SOG',
      'Shots': 'SOG',
      'SOG': 'SOG',
      'Assists': 'Ast',
      'Ast': 'Ast',
      'Points': 'Pts',
      'Pts': 'Pts',
      'Goals': 'Goals',
      'PP Points': 'PP Pts',
      'Power Play Points': 'PP Pts',
      'PP Pts': 'PP Pts',
    }
    return mappings[propName] || propName
  }

  const normalizeSideForMatch = (side: string): 'Over' | 'Under' | string => {
    if (side === 'O') return 'Over'
    if (side === 'U') return 'Under'
    return side
  }

  // Get available lines for current prop - MUST be before early returns
  const availableLines = useMemo(() => {
    if (!selectedProp || !allProps.length) return []

    const selectedPropName = normalizePropNameForMatch(selectedProp.propName)
    const selectedSide = normalizeSideForMatch(selectedProp.ou)
    const propLines = allProps.filter((prop) => {
      const propName = normalizePropNameForMatch(prop.prop)
      const propSide = normalizeSideForMatch(prop.side)
      return propName === selectedPropName && propSide === selectedSide
    })

    if (process.env.NODE_ENV !== 'production') {
      const sample = allProps[0]
      console.log('Available lines filter:', {
        selectedPropName: selectedProp.propName,
        selectedPropNameNormalized: selectedPropName,
        selectedOU: selectedProp.ou,
        selectedOUNormalized: selectedSide,
        allPropsCount: allProps.length,
        sampleKeys: sample ? Object.keys(sample) : [],
        sampleProp: sample
          ? {
              prop: sample.prop,
              propNormalized: normalizePropNameForMatch(sample.prop),
              side: sample.side,
              sideNormalized: normalizeSideForMatch(sample.side),
              line: sample.line,
              best: sample.best,
              books: sample.books,
            }
          : null,
        matchingLines: propLines.length,
      })
    }

    const lineMap = new Map<number, { line: number; books: { bookmaker: string; price_american: number; implied_win_pct?: number }[]; bestOdds: number | null; bestBook: { bookmaker: string; price_american: number } | null }>()
    propLines.forEach((prop) => {
      const lineValue = typeof prop.line === 'number' ? prop.line : null
      if (lineValue === null) return

      if (!lineMap.has(lineValue)) {
        lineMap.set(lineValue, {
          line: lineValue,
          books: [],
          bestOdds: null,
          bestBook: null,
        })
      }

      const lineData = lineMap.get(lineValue)
      if (!lineData) return

      const books = prop.books || {}
      Object.entries(books).forEach(([book, bookData]) => {
        lineData.books.push({
          bookmaker: book,
          price_american: bookData.odds,
          implied_win_pct: bookData.iw,
        })
      })

      if (lineData.books.length === 0 && prop.best?.odds != null && prop.best.book) {
        lineData.books.push({
          bookmaker: prop.best.book,
          price_american: prop.best.odds,
          implied_win_pct: prop.best.iw ?? 0,
        })
      }

      if (prop.best?.odds != null && prop.best.book) {
        if (lineData.bestOdds == null || prop.best.odds > lineData.bestOdds) {
          lineData.bestOdds = prop.best.odds
          lineData.bestBook = { bookmaker: prop.best.book, price_american: prop.best.odds }
        }
      }
    })

    lineMap.forEach((lineData) => {
      lineData.books.sort((a, b) => b.price_american - a.price_american)
    })

    return Array.from(lineMap.values()).sort((a, b) => a.line - b.line)
  }, [selectedProp, allProps])

  useEffect(() => {
    if (!availableLines.length) return
    const hasLine = availableLines.some((line) => line.line === lineValue)
    if (!hasLine) {
      setLineValue(availableLines[0].line)
    }
  }, [availableLines, lineValue])
  
  const player = gamelogs[0]
  const headerPlayerName = useMemo(() => {
    return payload?.player_name || selectedProp?.playerName || 'Player'
  }, [payload?.player_name, selectedProp?.playerName])

  const headerHeadshot = useMemo(() => {
    return payload?.bio?.headshot_url || null
  }, [payload?.bio?.headshot_url])

  if (loading) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }
  
  if (!error && gamelogs.length === 0) {
    return (
      <div className="w-full p-4">
        <div className="text-center py-8">
          <div className="text-red-500 text-sm mb-4">No gamelogs available</div>
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

  if (error || !selectedProp) {
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
  const unimplementedProps = ['First Goal Scorer', 'Last Goal Scorer']

  // Normalize prop names for matching
  const normalizeProps = (propName: string) => {
    const mappings: { [key: string]: string } = {
      'Shots on Goal': 'SOG',
      'Shots': 'SOG',
      'Assists': 'Ast',
      'Points': 'Pts',
      'PP Points': 'PP Pts',
      'Power Play Points': 'PP Pts'
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

  const sharedFilterButtons = {
    period: (
      <>
        <Button 
          variant="ghost"
          size="sm" 
          className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
            timeFilter === '20242025' 
              ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
              : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
          }`}
          onClick={() => {
            startTransition(() => {
              setTimeFilter('20242025')
              setOpponentFilter(null)
            })
          }}
        >
          24/25
        </Button>
        <Button 
          variant="ghost"
          size="sm" 
          className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
            timeFilter === '20252026' 
              ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
              : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
          }`}
          onClick={() => {
            startTransition(() => {
              setTimeFilter('20252026')
              setOpponentFilter(null)
            })
          }}
        >
          25/26
        </Button>
        <div className="w-px h-5 bg-border mx-0.5" />
        <Button 
          variant="ghost"
          size="sm" 
          className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
            timeFilter === 'L50' 
              ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
              : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
          }`}
          onClick={() => {
            startTransition(() => {
              setTimeFilter('L50')
              setOpponentFilter(null)
            })
          }}
        >
          L50
        </Button>
        <Button 
          variant="ghost"
          size="sm" 
          className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
            timeFilter === 'L30' 
              ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
              : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
          }`}
          onClick={() => {
            startTransition(() => {
              setTimeFilter('L30')
              setOpponentFilter(null)
            })
          }}
        >
          L30
        </Button>
        <Button 
          variant="ghost"
          size="sm" 
          className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
            timeFilter === 'L20' 
              ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
              : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
          }`}
          onClick={() => {
            startTransition(() => {
              setTimeFilter('L20')
              setOpponentFilter(null)
            })
          }}
        >
          L20
        </Button>
        <Button 
          variant="ghost"
          size="sm" 
          className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
            timeFilter === 'L10' 
              ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
              : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
          }`}
          onClick={() => {
            startTransition(() => {
              setTimeFilter('L10')
              setOpponentFilter(null)
            })
          }}
        >
          L10
        </Button>
        {nextOpponent ? (
          <Button 
            variant="ghost"
            size="sm" 
            className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
              timeFilter === 'vsOpponent' 
                ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
                : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
            }`}
            onClick={() => {
              startTransition(() => {
                setTimeFilter('vsOpponent')
                setOpponentFilter(nextOpponent)
              })
            }}
          >
            vs {nextOpponent}
          </Button>
        ) : (
          <Popover open={teamSelectorOpen} onOpenChange={setTeamSelectorOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost"
                size="sm" 
                className="h-7 px-2.5 text-xs font-medium transition-all rounded-md hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border"
              >
                vs Opp
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-6" align="start">
              <div className="mb-4">
                <h4 className="font-semibold text-lg">Select Opponent</h4>
                <p className="text-sm text-muted-foreground">Click a team logo to filter</p>
              </div>
              <div className="grid grid-cols-8 gap-3 max-h-[500px] overflow-y-auto">
                {ALL_NHL_TEAMS.map((team) => {
                  const smallerLogos = ['BOS', 'BUF', 'CAR', 'CGY', 'EDM', 'FLA', 'PIT', 'SEA', 'TB', 'VAN', 'VGK']
                  const isSmaller = smallerLogos.includes(team)
                  const logoSize = isSmaller ? 40 : 48
                  const isPlayerTeam = playerTeam ? team === playerTeam : false
                  
                  return (
                    <button
                      key={team}
                      onClick={() => {
                        if (!isPlayerTeam) {
                          startTransition(() => {
                            setTimeFilter('vsOpponent')
                            setOpponentFilter(team)
                            setTeamSelectorOpen(false)
                          })
                        }
                      }}
                      className={`flex items-center justify-center p-2 rounded-md transition-colors aspect-square ${
                        isPlayerTeam 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:bg-muted/50 dark:hover:bg-muted/30'
                      }`}
                      title={isPlayerTeam ? `${team} (Player's Team)` : team}
                      disabled={isPlayerTeam}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src={getNHLTeamLogo(team)}
                          alt={team}
                          width={logoSize}
                          height={logoSize}
                          className={`object-contain ${isPlayerTeam ? 'grayscale' : ''}`}
                          style={{ maxWidth: `${logoSize}px`, maxHeight: `${logoSize}px`, width: 'auto', height: 'auto' }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </>
    ),
    venue: (
      <>
        <Button 
          variant="ghost"
          size="sm" 
          className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
            venueFilter === 'all' 
              ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
              : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
          }`}
          onClick={() => {
            startTransition(() => {
              setVenueFilter('all')
            })
          }}
        >
          All
        </Button>
        {nextGameVenue ? (
          <Button 
            variant="ghost"
            size="sm" 
            className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
              venueFilter === nextGameVenue 
                ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
                : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
            }`}
            onClick={() => {
              startTransition(() => {
                setVenueFilter(nextGameVenue)
              })
            }}
          >
            {nextGameVenue === 'Home' ? 'at Home' : 'on Road'}
          </Button>
        ) : (
          <>
            <Button 
              variant="ghost"
              size="sm" 
              className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
                venueFilter === 'Home' 
                  ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
                  : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
              }`}
              onClick={() => {
                startTransition(() => {
                  setVenueFilter('Home')
                })
              }}
            >
              Home
            </Button>
            <Button 
              variant="ghost"
              size="sm" 
              className={`h-7 px-2.5 text-xs font-medium transition-all rounded-md ${
                venueFilter === 'Away' 
                  ? 'bg-[rgba(34,197,94,0.06)] dark:bg-green-500/10 border-l-2 border-l-[#16A34A] dark:border-l-green-500/30 border border-[rgba(34,197,94,0.2)] dark:border-green-500/30 text-[#16A34A] dark:text-green-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(0,255,153,0.2)]' 
                  : 'hover:bg-muted/50 dark:hover:bg-muted/30 border border-transparent hover:border-border'
              }`}
              onClick={() => {
                startTransition(() => {
                  setVenueFilter('Away')
                })
              }}
            >
              Away
            </Button>
          </>
        )}
      </>
    ),
    actions: (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={resetFilters}
        className="h-7 px-2 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500 transition-all"
        title="Reset Filters"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-[1600px] mx-auto p-3 md:p-4 lg:p-5 space-y-3" style={{ fontSize: '0.9rem' }}>
        <div className="border-b border-border">
          <div className="flex items-center overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('prop-lab')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'prop-lab'
                  ? 'border-[#16A34A] dark:border-green-500 text-[#16A34A] dark:text-green-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
              }`}
            >
              Prop Lab
            </button>
            <button
              onClick={() => setActiveTab('gamelogs')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'gamelogs'
                  ? 'border-[#16A34A] dark:border-green-500 text-[#16A34A] dark:text-green-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
              }`}
            >
              Gamelogs
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'market'
                  ? 'border-[#16A34A] dark:border-green-500 text-[#16A34A] dark:text-green-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
              }`}
            >
              Market
            </button>
          </div>
        </div>
        {/* Hero Section - PropsMadness Style */}
        <Card className="shadow-lg transition-all duration-200 hover:border-foreground/20">
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
                          ? 'border-[#16A34A] dark:border-green-500 text-[#16A34A] dark:text-green-500' 
                          : isDisabled
                            ? 'border-transparent text-muted-foreground/50 cursor-not-allowed'
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
                  {headerHeadshot && (
                    <div className="relative">
                      <Image 
                        src={headerHeadshot} 
                        alt={headerPlayerName} 
                        width={100} 
                        height={100} 
                        className="rounded object-cover shadow-lg" 
                      />
                      {playerTeam && (
                        <div className="absolute -bottom-2 -right-2 flex items-center justify-center">
                          <Image 
                            src={getNHLTeamLogo(playerTeam)} 
                            alt={playerTeam} 
                            width={48} 
                            height={48}
                            style={{ backgroundColor: 'transparent' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    {headerPlayerName ? (() => {
                      const nameParts = headerPlayerName.split(' ')
                      const firstName = nameParts[0] || ''
                      const lastName = nameParts.slice(1).join(' ') || ''
                      return (
                        <>
                          <span className="text-sm text-muted-foreground">{firstName}</span>
                          <span className="text-3xl font-bold tracking-tight" style={{ color: 'hsl(var(--chart-title))' }}>
                            {lastName}
                          </span>
                        </>
                      )
                    })() : (
                      <h1 
                        className="text-[18px] font-semibold tracking-tight"
                        style={{ color: 'hsl(var(--chart-title))' }}
                      >
                        {headerPlayerName}
                      </h1>
                    )}
                    {matchupDisplay ? (
                      <div className="mt-1 text-sm font-medium text-muted-foreground">
                        {matchupDisplay}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Center: Key Stats */}
                <div className="flex items-center justify-center gap-8">
                  {/* Season AVG */}
                  {seasonAvg !== null && (
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">SEASON AVG {selectedProp.propName.toUpperCase()}</div>
                      <div className="text-2xl font-normal">
                        {seasonAvg.toFixed(2)}
                      </div>
                    </div>
                  )}
                  
                  {/* Graph AVG */}
                  {graphAvg !== undefined && (
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">GRAPH AVG {selectedProp.propName.toUpperCase()}</div>
                      <div className="text-2xl font-normal">
                        {graphAvg.toFixed(2)}
                      </div>
                    </div>
                  )}
                  
                  {/* Hit Rate */}
                  {stats && (
                    <div className="flex flex-col items-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">HIT RATE</div>
                      <div className="text-2xl text-[#16A34A] dark:text-green-500">
                        <span className="font-normal">{stats.hitRate}%</span> <span className="font-normal">({stats.hits}/{stats.total})</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Odds Card */}
                {(() => {
                  const selectedLine = availableLines.find(l => l.line === lineValue)
                  if (!selectedLine) return null
                  
                  // Find both Over and Under props for the same line
                  const overProp = allProps.find((prop) => 
                    prop.prop === selectedProp.propName && 
                    prop.line === lineValue && 
                    prop.side === 'Over'
                  )
                  const underProp = allProps.find((prop) => 
                    prop.prop === selectedProp.propName && 
                    prop.line === lineValue && 
                    prop.side === 'Under'
                  )
                  
                  const getFallbackBookOdds = (prop: PlayerProp | undefined) => {
                    if (!prop) return null
                    const books = prop.books || {}
                    const firstBook = Object.values(books)[0]
                    return firstBook?.odds ?? null
                  }

                  const overOdds = overProp?.best?.odds ?? getFallbackBookOdds(overProp)
                  const underOdds = underProp?.best?.odds ?? getFallbackBookOdds(underProp)
                  const normalizeBookKey = (name: string) => name.toLowerCase().replace(/\\s+/g, '')
                  const preferredBooks = ['fanduel', 'draftkings', 'betmgm']
                  const resolveBestOdds = (
                    books: { bookmaker: string; price_american: number; implied_win_pct?: number }[],
                    fallback: number | null
                  ) => {
                    if (fallback !== null && fallback !== undefined) return fallback
                    if (!books.length) return null
                    return Math.max(...books.map((book) => book.price_american))
                  }
                  const getBestBook = (
                    books: { bookmaker: string; price_american: number; implied_win_pct?: number }[],
                    bestOdds: number | null
                  ) => {
                    if (!books.length) return null
                    if (bestOdds === null || bestOdds === undefined) return books[0]?.bookmaker ?? null
                    const bestBooks = books.filter((book) => book.price_american === bestOdds)
                    if (bestBooks.length === 0) return books[0]?.bookmaker ?? null
                    const priorityIndex = (book: string) => {
                      const key = normalizeBookKey(book)
                      const idx = preferredBooks.indexOf(key)
                      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
                    }
                    return bestBooks
                      .slice()
                      .sort((a, b) => priorityIndex(a.bookmaker) - priorityIndex(b.bookmaker))[0]
                      ?.bookmaker ?? null
                  }
                  const orderBooksForDisplay = (
                    books: { bookmaker: string; price_american: number; implied_win_pct?: number }[],
                    bestOdds: number | null
                  ) => {
                    if (!books.length) return books
                    const priorityIndex = (book: string) => {
                      const key = normalizeBookKey(book)
                      const idx = preferredBooks.indexOf(key)
                      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
                    }
                    return books.slice().sort((a, b) => {
                      const aIsBest = bestOdds !== null && a.price_american === bestOdds
                      const bIsBest = bestOdds !== null && b.price_american === bestOdds
                      if (aIsBest && !bIsBest) return -1
                      if (!aIsBest && bIsBest) return 1
                      if (aIsBest && bIsBest) {
                        return priorityIndex(a.bookmaker) - priorityIndex(b.bookmaker)
                      }
                      return priorityIndex(a.bookmaker) - priorityIndex(b.bookmaker)
                    })
                  }

                  const currentOdds = resolveBestOdds(selectedLine.books, selectedLine.bestOdds ?? null)
                  const primaryBook = getBestBook(selectedLine.books, currentOdds)
                  
                  // Calculate implied win % from current odds (Over or Under)
                  let impliedPct: number | null = null
                  if (currentOdds) {
                    if (currentOdds > 0) {
                      impliedPct = (100 / (currentOdds + 100)) * 100
                    } else {
                      impliedPct = (Math.abs(currentOdds) / (Math.abs(currentOdds) + 100)) * 100
                    }
                  }
                  
                  const logoPath = primaryBook ? getBookmakerLogo(primaryBook) : null
                  const booksCount = selectedLine.books.length
                  const orderedSelectedBooks = orderBooksForDisplay(selectedLine.books, currentOdds)
                  const displayBooks = orderedSelectedBooks.slice(0, 3)
                  
                  return (
                    availableLines.length > 0 ? (
                      <Select 
                        value={lineValue.toString()} 
                        onValueChange={(val) => setLineValue(parseFloat(val))}
                      >
                        <SelectTrigger className="h-auto p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                          <div className="flex-shrink-0 rounded-md border border-gray-800 bg-[#171717] text-foreground cursor-pointer w-full px-4 py-3">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Line</div>
                                    <div className="text-base font-semibold">
                                      {selectedProp.ou?.toLowerCase().startsWith('o') ? 'o' : 'u'}{lineValue}
                                </div>
                              </div>
                              
                              <div className="flex flex-col">
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Best</div>
                                {currentOdds !== null ? (
                                  <div className="text-lg font-semibold text-[#16A34A] dark:text-green-500">
                                    {currentOdds > 0 ? '+' : ''}{currentOdds}
                                  </div>
                                ) : (
                                  <div className="text-lg font-semibold text-muted-foreground">—</div>
                                )}
                              </div>

                              <div className="flex flex-col">
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">IW%</div>
                                {impliedPct !== null ? (
                                  <div className="text-base font-semibold">
                                    {impliedPct.toFixed(1)}%
                                  </div>
                                ) : (
                                  <div className="text-base font-semibold text-muted-foreground">—</div>
                                )}
                              </div>

                              <div className="ml-auto flex items-center gap-2">
                                <div className="flex items-center -space-x-2">
                                  {displayBooks.map((book, idx) => {
                                    const bookLogoPath = getBookmakerLogo(book.bookmaker)
                                    if (!bookLogoPath) return null
                                    const isPrimary = idx === 0
                                    return (
                                      <div
                                        key={`${book.bookmaker}-${idx}`}
                                        className={
                                          isPrimary
                                            ? 'w-8 h-8 rounded-sm border border-gray-600 bg-transparent flex items-center justify-center overflow-hidden'
                                            : 'w-6 h-6 rounded-sm border border-gray-600 bg-transparent flex items-center justify-center overflow-hidden'
                                        }
                                        style={{ zIndex: displayBooks.length - idx }}
                                      >
                                        <Image
                                          src={bookLogoPath}
                                          alt={book.bookmaker}
                                          width={isPrimary ? 32 : 24}
                                          height={isPrimary ? 32 : 24}
                                          className="object-contain"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                      </div>
                                    )
                                  })}
                                </div>
                                {booksCount > displayBooks.length && (
                                  <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-gray-500/60 bg-gray-200 text-gray-800 dark:bg-gray-700/80 dark:text-white">
                                    +{booksCount - displayBooks.length}
                                  </span>
                                )}
                                {logoPath && booksCount === 0 && (
                                  <div className="w-7 h-7 rounded-md border border-gray-600/60 bg-black/30 flex items-center justify-center">
                                    <Image
                                      src={logoPath}
                                      alt={primaryBook || 'Bookmaker'}
                                      width={20}
                                      height={20}
                                      className="object-contain rounded-sm"
                                    />
                                  </div>
                                )}
                                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            </div>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[420px] border border-gray-800 bg-[#171717] text-foreground">
                          {availableLines.map((lineData) => {
                            const lineBooks = lineData.books
                            const lineBooksCount = lineBooks.length
                            const lineBestOdds = resolveBestOdds(lineBooks, lineData.bestOdds ?? null)
                            const orderedLineBooks = orderBooksForDisplay(lineBooks, lineBestOdds)
                            const lineDisplayBooks = orderedLineBooks.slice(0, 4)

                            return (
                              <SelectItem
                                key={lineData.line}
                                value={lineData.line.toString()}
                                className="rounded-none border-b border-gray-800 last:border-b-0 focus:bg-muted/10 data-[state=checked]:bg-muted/10 data-[state=checked]:text-foreground"
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-4 py-1 w-full">
                                        <div className="flex flex-col">
                                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Line</div>
                                          <div className="text-sm font-semibold">
                                            {selectedProp.ou?.toLowerCase().startsWith('o') ? 'o' : 'u'}{lineData.line}
                                          </div>
                                        </div>
                                        <div className="flex flex-col">
                                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Best</div>
                                          {lineBestOdds !== null ? (
                                            <div className="text-sm font-semibold text-[#16A34A] dark:text-green-500">
                                              {lineBestOdds > 0 ? '+' : ''}{lineBestOdds}
                                            </div>
                                          ) : (
                                            <div className="text-sm font-semibold text-muted-foreground">—</div>
                                          )}
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                          <div className="flex items-center -space-x-2">
                                            {lineDisplayBooks.map((book, idx) => {
                                              const bookLogoPath = getBookmakerLogo(book.bookmaker)
                                              if (!bookLogoPath) return null
                                              const isPrimary = idx === 0
                                              return (
                                                <div
                                                  key={`${lineData.line}-${book.bookmaker}-${idx}`}
                                                  className={
                                                    isPrimary
                                                      ? 'w-8 h-8 rounded-sm border border-gray-600 bg-transparent flex items-center justify-center overflow-hidden'
                                                      : 'w-6 h-6 rounded-sm border border-gray-600 bg-transparent flex items-center justify-center overflow-hidden'
                                                  }
                                                  style={{ zIndex: lineDisplayBooks.length - idx }}
                                                >
                                                  <Image
                                                    src={bookLogoPath}
                                                    alt={book.bookmaker}
                                                    width={isPrimary ? 32 : 24}
                                                    height={isPrimary ? 32 : 24}
                                                    className="object-contain"
                                                    onError={(e) => {
                                                      e.currentTarget.style.display = 'none'
                                                    }}
                                                  />
                                                </div>
                                              )
                                            })}
                                          </div>
                                          {lineBooksCount > lineDisplayBooks.length && (
                                            <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-gray-500/60 bg-[#1f1f1f] text-foreground">
                                              +{lineBooksCount - lineDisplayBooks.length}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#171717] border border-gray-700 p-3">
                                      <div className="grid gap-2">
                                        {lineBooks.map((book, idx) => {
                                          const tooltipLogo = getBookmakerLogo(book.bookmaker)
                                          return (
                                            <div
                                              key={`${lineData.line}-${book.bookmaker}-tooltip-${idx}`}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              {tooltipLogo ? (
                                                <div className="w-5 h-5 rounded-sm border border-gray-600 bg-transparent flex items-center justify-center overflow-hidden">
                                                  <Image
                                                    src={tooltipLogo}
                                                    alt={book.bookmaker}
                                                    width={20}
                                                    height={20}
                                                    className="object-contain"
                                                    onError={(e) => {
                                                      e.currentTarget.style.display = 'none'
                                                    }}
                                                  />
                                                </div>
                                              ) : (
                                                <span className="font-medium text-muted-foreground">{book.bookmaker}</span>
                                              )}
                                              <span className="text-foreground font-semibold">
                                                {book.price_american > 0 ? '+' : ''}{book.price_american}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    ) : null
                  )
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      
        {activeTab !== 'prop-lab' ? (
          <div className="space-y-2">
            {activeTab === 'gamelogs' && (
              <GamelogsTab gamelogs={filteredGamelogs} allGamelogs={gamelogs} />
            )}
            {activeTab === 'market' && (
              <MarketTab
                allProps={allProps}
                selectedProp={selectedProp}
                onPropChange={(propName) => setSelectedProp(prev => prev ? { ...prev, propName } : null)}
              />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {(selectedProp.propName === 'Goals' || selectedProp.propName.toLowerCase().includes('goal')) && (
              <GoalsDashboard 
                gamelogs={filteredGamelogs} 
                selectedProp={selectedProp}
                lineValue={lineValue}
                allGamelogs={gamelogs}
                chartSettings={chartSettings}
                onSettingsOpen={() => setSettingsOpen(true)}
                activeTab={activeTab}
                onOpenGamelogs={() => setActiveTab('gamelogs')}
                hitRateStats={(() => {
                  if (!stats) return undefined
                  const selectedLine = availableLines.find(l => l.line === lineValue)
                  let impliedPct: number | undefined
                  let hrVsIw: number | undefined
                  let bestOdds: number | undefined
                  
                  if (selectedLine && selectedLine.bestOdds) {
                    bestOdds = selectedLine.bestOdds
                    const odds = selectedLine.bestOdds
                    if (odds > 0) {
                      impliedPct = (100 / (odds + 100)) * 100
                    } else {
                      impliedPct = (Math.abs(odds) / (Math.abs(odds) + 100)) * 100
                    }
                    hrVsIw = stats.hitRate - impliedPct
                  }
                  
                  return {
                    hitRate: stats.hitRate,
                    hits: stats.hits,
                    total: stats.total,
                    avgValue: stats.avgValue,
                    impliedWinPct: impliedPct,
                    hrVsIw: hrVsIw,
                    bestOdds: bestOdds
                  }
                })()}
                availableLines={availableLines}
                allProps={allProps}
                playerId={playerId}
                timeFilter={timeFilter}
                filterButtons={sharedFilterButtons}
                teamPayload={teamPayload}
                opponentPayload={opponentPayload}
                opponentTeam={nextOpponent}
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
                allGamelogs={gamelogs}
                chartSettings={chartSettings}
                filterButtons={sharedFilterButtons}
                onSettingsOpen={() => setSettingsOpen(true)}
                onOpenGamelogs={() => setActiveTab('gamelogs')}
              />
            )}
            
            {(selectedProp.propName === 'Assists' || 
              selectedProp.propName.toLowerCase().includes('assist') ||
              selectedProp.propName.toLowerCase() === 'ast') && (
              <AssistsDashboard 
                gamelogs={filteredGamelogs} 
                selectedProp={selectedProp}
                lineValue={lineValue}
                allGamelogs={gamelogs}
                chartSettings={chartSettings}
                filterButtons={sharedFilterButtons}
                onSettingsOpen={() => setSettingsOpen(true)}
                onOpenGamelogs={() => setActiveTab('gamelogs')}
              />
            )}
            
            {(selectedProp.propName === 'Points' || 
              selectedProp.propName.toLowerCase().includes('point') ||
              selectedProp.propName.toLowerCase() === 'pts') && (
              <PointsDashboard 
                gamelogs={filteredGamelogs} 
                selectedProp={selectedProp}
                lineValue={lineValue}
                allGamelogs={gamelogs}
                chartSettings={chartSettings}
                filterButtons={sharedFilterButtons}
                onSettingsOpen={() => setSettingsOpen(true)}
                onOpenGamelogs={() => setActiveTab('gamelogs')}
              />
            )}

            {(selectedProp.propName === 'PP Pts' || 
              selectedProp.propName === 'PP Points' ||
              selectedProp.propName.toLowerCase().includes('power play') ||
              selectedProp.propName.toLowerCase().includes('pp pts')) && (
              <PPPointsDashboard 
                gamelogs={filteredGamelogs} 
                selectedProp={selectedProp}
                lineValue={lineValue}
                allGamelogs={gamelogs}
                chartSettings={chartSettings}
                filterButtons={sharedFilterButtons}
                onSettingsOpen={() => setSettingsOpen(true)}
                onOpenGamelogs={() => setActiveTab('gamelogs')}
              />
            )}
            
            {/* Fallback for other prop types */}
            {!(selectedProp.propName === 'Goals' || selectedProp.propName.toLowerCase().includes('goal')) &&
             !(selectedProp.propName === 'Shots on Goal' || selectedProp.propName === 'Shots' || selectedProp.propName.toLowerCase().includes('shot') || selectedProp.propName.toLowerCase() === 'sog') &&
             !(selectedProp.propName === 'Assists' || selectedProp.propName.toLowerCase().includes('assist') || selectedProp.propName.toLowerCase() === 'ast') &&
             !(selectedProp.propName === 'Points' || selectedProp.propName.toLowerCase().includes('point') || selectedProp.propName.toLowerCase() === 'pts') &&
             !(selectedProp.propName === 'PP Pts' || selectedProp.propName === 'PP Points' || selectedProp.propName.toLowerCase().includes('power play') || selectedProp.propName.toLowerCase().includes('pp pts')) && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Dashboard for {selectedProp.propName} coming soon</p>
                </CardContent>
              </Card>
            )}

            {/* Settings Dialog - Center Popup */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Filters</DialogTitle>
                  <DialogDescription>
                    Configure advanced filters and chart display options
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-6">
                  {/* Advanced Filters */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Advanced Filters</h3>
                    
                    {/* Game Time Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs">Game Time</Label>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button 
                          variant={gameTimeFilter === 'all' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${gameTimeFilter === 'all' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setGameTimeFilter('all')}
                        >
                          All Times
                        </Button>
                        <Button 
                          variant={gameTimeFilter === 'day' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${gameTimeFilter === 'day' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setGameTimeFilter('day')}
                        >
                          Day
                        </Button>
                        <Button 
                          variant={gameTimeFilter === 'afternoon' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${gameTimeFilter === 'afternoon' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setGameTimeFilter('afternoon')}
                        >
                          Afternoon
                        </Button>
                        <Button 
                          variant={gameTimeFilter === 'night' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${gameTimeFilter === 'night' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setGameTimeFilter('night')}
                        >
                          Night
                        </Button>
                      </div>
                    </div>

                    {/* Day of Week Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs">Day of Week</Label>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button 
                          variant={dayOfWeekFilter === 'all' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'all' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('all')}
                        >
                          All Days
                        </Button>
                        <Button 
                          variant={dayOfWeekFilter === 'monday' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'monday' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('monday')}
                        >
                          Mon
                        </Button>
                        <Button 
                          variant={dayOfWeekFilter === 'tuesday' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'tuesday' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('tuesday')}
                        >
                          Tue
                        </Button>
                        <Button 
                          variant={dayOfWeekFilter === 'wednesday' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'wednesday' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('wednesday')}
                        >
                          Wed
                        </Button>
                        <Button 
                          variant={dayOfWeekFilter === 'thursday' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'thursday' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('thursday')}
                        >
                          Thu
                        </Button>
                        <Button 
                          variant={dayOfWeekFilter === 'friday' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'friday' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('friday')}
                        >
                          Fri
                        </Button>
                        <Button 
                          variant={dayOfWeekFilter === 'saturday' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'saturday' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('saturday')}
                        >
                          Sat
                        </Button>
                        <Button 
                          variant={dayOfWeekFilter === 'sunday' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${dayOfWeekFilter === 'sunday' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDayOfWeekFilter('sunday')}
                        >
                          Sun
                        </Button>
                      </div>
                    </div>

                    {/* Days Rest Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs">Days Rest</Label>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Button 
                          variant={daysRestFilter === 'all' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${daysRestFilter === 'all' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDaysRestFilter('all')}
                        >
                          All
                        </Button>
                        <Button 
                          variant={daysRestFilter === '0' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${daysRestFilter === '0' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDaysRestFilter('0')}
                        >
                          0D
                        </Button>
                        <Button 
                          variant={daysRestFilter === '1' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${daysRestFilter === '1' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDaysRestFilter('1')}
                        >
                          1D
                        </Button>
                        <Button 
                          variant={daysRestFilter === '2' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${daysRestFilter === '2' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDaysRestFilter('2')}
                        >
                          2D
                        </Button>
                        <Button 
                          variant={daysRestFilter === '3' ? 'default' : 'outline'}
                          size="sm" 
                          className={`h-7 px-2 text-xs ${daysRestFilter === '3' ? 'bg-green-500/10 border-green-500/30 text-green-500' : ''}`}
                          onClick={() => setDaysRestFilter('3')}
                        >
                          3D+
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Chart Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Chart Display Options</h3>
                    
                    {/* Average Line */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="avg-line" className="text-xs">Show Average Line</Label>
                        <p className="text-xs text-muted-foreground">Display overall average across all games</p>
                      </div>
                      <Switch
                        id="avg-line"
                        checked={chartSettings.showAverageLine}
                        onCheckedChange={(checked) => setChartSettings(prev => ({ ...prev, showAverageLine: checked }))}
                      />
                    </div>

                    {/* Rolling Average */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="rolling-avg" className="text-xs">Show Rolling Average</Label>
                        <p className="text-xs text-muted-foreground">Display rolling average over recent games</p>
                      </div>
                      <Switch
                        id="rolling-avg"
                        checked={chartSettings.showRollingAverage}
                        onCheckedChange={(checked) => setChartSettings(prev => ({ ...prev, showRollingAverage: checked }))}
                      />
                    </div>
                    {chartSettings.showRollingAverage && (
                      <div className="ml-4 space-y-2">
                        <Label className="text-xs">Rolling Window (games)</Label>
                        <Select 
                          value={chartSettings.rollingAverageWindow.toString()} 
                          onValueChange={(val) => setChartSettings(prev => ({ ...prev, rollingAverageWindow: parseInt(val) }))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 games</SelectItem>
                            <SelectItem value="5">5 games</SelectItem>
                            <SelectItem value="7">7 games</SelectItem>
                            <SelectItem value="10">10 games</SelectItem>
                            <SelectItem value="15">15 games</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Moving Average */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="moving-avg" className="text-xs">Show Moving Average</Label>
                        <p className="text-xs text-muted-foreground">Display simple moving average</p>
                      </div>
                      <Switch
                        id="moving-avg"
                        checked={chartSettings.showMovingAverage}
                        onCheckedChange={(checked) => setChartSettings(prev => ({ ...prev, showMovingAverage: checked }))}
                      />
                    </div>
                    {chartSettings.showMovingAverage && (
                      <div className="ml-4 space-y-2">
                        <Label className="text-xs">Moving Average Window (games)</Label>
                        <Select 
                          value={chartSettings.movingAverageWindow.toString()} 
                          onValueChange={(val) => setChartSettings(prev => ({ ...prev, movingAverageWindow: parseInt(val) }))}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 games</SelectItem>
                            <SelectItem value="10">10 games</SelectItem>
                            <SelectItem value="15">15 games</SelectItem>
                            <SelectItem value="20">20 games</SelectItem>
                            <SelectItem value="30">30 games</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Trend Line */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="trend-line" className="text-xs">Show Trend Line</Label>
                        <p className="text-xs text-muted-foreground">Display linear trend line</p>
                      </div>
                      <Switch
                        id="trend-line"
                        checked={chartSettings.showTrendLine}
                        onCheckedChange={(checked) => setChartSettings(prev => ({ ...prev, showTrendLine: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
