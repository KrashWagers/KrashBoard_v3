"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, ArrowDown, ArrowUp, Settings } from "lucide-react"
import Image from "next/image"

// Helper function for NHL team logos
const getNHLTeamLogo = (abbrev: string | null): string => {
  if (!abbrev) return '/Images/League_Logos/NHL-Logo.png'
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
    'TBL': '/Images/NHL_Logos/TB.png', 'TOR': '/Images/NHL_Logos/TOR.png', 'VAN': '/Images/NHL_Logos/VAN.png',
    'VGK': '/Images/NHL_Logos/VGK.png', 'WPG': '/Images/NHL_Logos/WPG.png', 'WSH': '/Images/NHL_Logos/WSH.png',
    'UTA': '/Images/NHL_Logos/UTA.png'
  }
  return teamMap[abbrev] || '/Images/League_Logos/NHL-Logo.png'
}

interface TeamGamelogRow {
  season_id: string | null
  game_id: string | null
  game_date: string | null
  team: string | null
  opponent: string | null
  venue: string | null
  GF: number | null
  GA: number | null
  streak?: string // Added for streak calculation (e.g., "W3", "L5")
  SOGF: number | null
  SOGA: number | null
  PP_Att: number | null
  PK_Att: number | null
  PP_Pct: number | null
  PK_Pct: number | null
  PPG: number | null
  PKGA: number | null
  PIMF: number | null
  PIMA: number | null
  HitsF: number | null
  HitsA: number | null
  BlocksF: number | null
  BlocksA: number | null
  GiveawaysF: number | null
  GiveawaysA: number | null
  TakeawaysF: number | null
  TakeawaysA: number | null
  FO_PctF: number | null
  FO_PctA: number | null
  OT_Occurred: number | null
  SO_Occurred: number | null
  start_time_utc: string | null
  fetched_ts_utc: string | null
  shots_missed_for: number | null
  shots_blocked_for: number | null
  corsi_for: number | null
  fenwick_for: number | null
  ev5v5_shots_on_goal_for: number | null
  ev5v5_shots_missed_for: number | null
  ev5v5_shots_blocked_for: number | null
  ev5v5_corsi_for: number | null
  ev5v5_fenwick_for: number | null
  ev5v5_blocks_for: number | null
  ev5v5_goals_for: number | null
  ev5v5_assists_for: number | null
  ev5v5_assists1_for: number | null
  ev5v5_assists2_for: number | null
  ev5v5_points_for: number | null
  ev5v5_faceoffs_won_for: number | null
  ev5v5_faceoffs_lost_for: number | null
  ev5v5_hits_for: number | null
  ev5v5_hits_against_for: number | null
  ev5v5_giveaways_for: number | null
  ev5v5_takeaways_for: number | null
  ev5v5_penalties_committed_for: number | null
  ev5v5_penalties_drawn_for: number | null
  p1_shots_for: number | null
  p2_shots_for: number | null
  p3_shots_for: number | null
  ot_shots_for: number | null
  p1_corsi_for: number | null
  p2_corsi_for: number | null
  p3_corsi_for: number | null
  ot_corsi_for: number | null
  p1_goals_for: number | null
  p2_goals_for: number | null
  p3_goals_for: number | null
  ot_goals_for: number | null
  p1_assists_for: number | null
  p2_assists_for: number | null
  p3_assists_for: number | null
  ot_assists_for: number | null
  p1_points_for: number | null
  p2_points_for: number | null
  p3_points_for: number | null
  ot_points_for: number | null
  goals_hd_for: number | null
  goals_md_for: number | null
  goals_ld_for: number | null
  sog_hd_for: number | null
  sog_md_for: number | null
  sog_ld_for: number | null
  shots_missed_hd_for: number | null
  shots_missed_md_for: number | null
  shots_missed_ld_for: number | null
  shots_blocked_hd_for: number | null
  shots_blocked_md_for: number | null
  shots_blocked_ld_for: number | null
  sat_hd_for: number | null
  sat_md_for: number | null
  sat_ld_for: number | null
  sog_l_for: number | null
  sog_r_for: number | null
  sog_c_for: number | null
  sog_d_for: number | null
  goals_l_for: number | null
  goals_r_for: number | null
  goals_c_for: number | null
  goals_d_for: number | null
  points_l_for: number | null
  points_r_for: number | null
  points_c_for: number | null
  points_d_for: number | null
  sog_l_against: number | null
  sog_r_against: number | null
  sog_c_against: number | null
  sog_d_against: number | null
  goals_l_against: number | null
  goals_r_against: number | null
  goals_c_against: number | null
  goals_d_against: number | null
  points_l_against: number | null
  points_r_against: number | null
  points_c_against: number | null
  points_d_against: number | null
}

type SortField = keyof TeamGamelogRow | 'streak'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'basic' | 'advanced'

// Helper to check if a game is a win
const isWin = (row: TeamGamelogRow): boolean => {
  const gf = row.GF ?? 0
  const ga = row.GA ?? 0
  return gf > ga
}

// Column label mapping
const getColumnLabel = (field: string): string => {
  const labels: Record<string, string> = {
    'game_date': 'Date',
    'team': 'Team',
    'opponent': 'Opponent',
    'venue': 'Venue',
    'GF': 'GF',
    'GA': 'GA',
    'SOGF': 'SOG F',
    'SOGA': 'SOG A',
    'PP_Att': 'PP OPP',
    'PK_Att': 'PK OPP',
    'PP_Pct': 'PP%',
    'PK_Pct': 'PK%',
    'PPG': 'PPG',
    'PKGA': 'PPG A',
    'PIMF': 'PIM F',
    'PIMA': 'PIM A',
    'HitsF': 'Hits F',
    'HitsA': 'Hits A',
    'BlocksF': 'Blocks F',
    'BlocksA': 'Blocks A',
    'GiveawaysF': 'GvA F',
    'GiveawaysA': 'GvA A',
    'TakeawaysF': 'TkA F',
    'TakeawaysA': 'TkA A',
    'FO_PctF': 'FO% F',
    'FO_PctA': 'FO% A',
    'OT_Occurred': 'OT',
    'SO_Occurred': 'SO',
    'corsi_for': 'CF',
    'fenwick_for': 'CA', // Note: Actual CA not available, using FF as placeholder
    'ev5v5_shots_on_goal_for': 'EV5v5 SOG',
    'ev5v5_goals_for': 'EV5v5 G',
    'ev5v5_assists_for': 'EV5v5 A',
    'ev5v5_points_for': 'EV5v5 P',
    'ev5v5_corsi_for': 'EV5v5 CF',
    'ev5v5_fenwick_for': 'EV5v5 CA', // Note: Actual CA not available, using FF as placeholder
    'p1_goals_for': 'P1 G',
    'p2_goals_for': 'P2 G',
    'p3_goals_for': 'P3 G',
    'ot_goals_for': 'OT G',
    'p1_shots_for': 'P1 SOG',
    'p2_shots_for': 'P2 SOG',
    'p3_shots_for': 'P3 SOG',
    'ot_shots_for': 'OT SOG',
    'p1_corsi_for': 'P1 CF',
    'p2_corsi_for': 'P2 CF',
    'p3_corsi_for': 'P3 CF',
    'ot_corsi_for': 'OT CF',
    'goals_hd_for': 'HD G',
    'goals_md_for': 'MD G',
    'goals_ld_for': 'LD G',
    'sog_hd_for': 'HD SOG',
    'sog_md_for': 'MD SOG',
    'sog_ld_for': 'LD SOG',
    'goals_l_for': 'LW G',
    'goals_r_for': 'RW G',
    'goals_c_for': 'C G',
    'goals_d_for': 'D G',
  'points_l_for': 'LW P',
  'points_r_for': 'RW P',
  'points_c_for': 'C P',
  'points_d_for': 'D P',
  'shots_missed_for': 'Miss',
  'shots_blocked_for': 'Blk',
  'ev5v5_shots_missed_for': 'EV5v5 Miss',
  'ev5v5_shots_blocked_for': 'EV5v5 Blk',
  'ev5v5_blocks_for': 'EV5v5 Blk',
  'ev5v5_assists1_for': 'EV5v5 A1',
  'ev5v5_assists2_for': 'EV5v5 A2',
  'ev5v5_faceoffs_won_for': 'EV5v5 FO W',
  'ev5v5_faceoffs_lost_for': 'EV5v5 FO L',
  'ev5v5_hits_for': 'EV5v5 Hits',
  'ev5v5_hits_against_for': 'EV5v5 Hits A',
  'ev5v5_giveaways_for': 'EV5v5 GvA',
  'ev5v5_takeaways_for': 'EV5v5 TkA',
  'ev5v5_penalties_committed_for': 'EV5v5 PIM',
  'ev5v5_penalties_drawn_for': 'EV5v5 PIM D',
  'p1_assists_for': 'P1 A',
  'p2_assists_for': 'P2 A',
  'p3_assists_for': 'P3 A',
  'ot_assists_for': 'OT A',
  'p1_points_for': 'P1 P',
  'p2_points_for': 'P2 P',
  'p3_points_for': 'P3 P',
  'ot_points_for': 'OT P',
  'shots_missed_hd_for': 'HD Miss',
  'shots_missed_md_for': 'MD Miss',
  'shots_missed_ld_for': 'LD Miss',
  'shots_blocked_hd_for': 'HD Blk',
  'shots_blocked_md_for': 'MD Blk',
  'shots_blocked_ld_for': 'LD Blk',
  'sat_hd_for': 'HD Att',
  'sat_md_for': 'MD Att',
  'sat_ld_for': 'LD Att',
  'sog_l_for': 'LW SOG',
  'sog_r_for': 'RW SOG',
  'sog_c_for': 'C SOG',
  'sog_d_for': 'D SOG',
  'sog_l_against': 'LW SOG A',
  'sog_r_against': 'RW SOG A',
  'sog_c_against': 'C SOG A',
  'sog_d_against': 'D SOG A',
  'goals_l_against': 'LW G A',
  'goals_r_against': 'RW G A',
  'goals_c_against': 'C G A',
  'goals_d_against': 'D G A',
  'points_l_against': 'LW P A',
  'points_r_against': 'RW P A',
  'points_c_against': 'C P A',
  'points_d_against': 'D P A',
  'game_id': 'Game ID',
  'season_id': 'Season',
  'start_time_utc': 'Start Time',
  'streak': 'Streak',
  }
  return labels[field] || field
}

// Basic stats columns (streak is added separately in the table, not here)
const BASIC_COLUMNS: (keyof TeamGamelogRow)[] = [
  'game_date',
  'team',
  'venue',
  'opponent',
  'GF',
  'GA',
  'SOGF',
  'SOGA',
  'PPG',
  'PKGA',
  'PP_Att',
  'PK_Att',
  'PP_Pct',
  'PK_Pct',
]

// Advanced stats columns (default selection)
const DEFAULT_ADVANCED_COLUMNS: (keyof TeamGamelogRow)[] = [
  'game_date',
  'team',
  'venue',
  'opponent',
  'corsi_for', // CF
  'fenwick_for', // CA (using fenwick_for as placeholder - actual CA not in data)
  'ev5v5_goals_for', // 5v5 GF
  'ev5v5_shots_on_goal_for', // 5v5 SOG
  'ev5v5_corsi_for', // 5v5 CF
  'ev5v5_fenwick_for', // 5v5 CA (using fenwick_for as placeholder)
  'goals_hd_for', // HD G
  'goals_md_for', // MD G
  'goals_ld_for', // LD G
  'sog_hd_for', // HD SOG
  'sog_md_for', // MD SOG
  'sog_ld_for', // LD SOG
]

// Preset column groups
const PRESET_COLUMN_GROUPS: Record<string, (keyof TeamGamelogRow)[]> = {
  'vs_position': [
    'game_date',
    'team',
    'venue',
    'opponent',
    'sog_l_against',
    'sog_r_against',
    'sog_c_against',
    'sog_d_against',
    'goals_l_against',
    'goals_r_against',
    'goals_c_against',
    'goals_d_against',
  ],
}

// All available columns for custom selector
const ALL_COLUMNS: (keyof TeamGamelogRow)[] = [
  ...BASIC_COLUMNS,
  'corsi_for',
  'fenwick_for',
  'ev5v5_goals_for',
  'ev5v5_assists_for',
  'ev5v5_points_for',
  'ev5v5_shots_on_goal_for',
  'ev5v5_corsi_for',
  'ev5v5_fenwick_for',
  'p1_goals_for',
  'p2_goals_for',
  'p3_goals_for',
  'ot_goals_for',
  'p1_shots_for',
  'p2_shots_for',
  'p3_shots_for',
  'ot_shots_for',
  'p1_corsi_for',
  'p2_corsi_for',
  'p3_corsi_for',
  'ot_corsi_for',
  'goals_hd_for',
  'goals_md_for',
  'goals_ld_for',
  'sog_hd_for',
  'sog_md_for',
  'sog_ld_for',
  'goals_l_for',
  'goals_r_for',
  'goals_c_for',
  'goals_d_for',
  'points_l_for',
  'points_r_for',
  'points_c_for',
  'points_d_for',
  'FO_PctF',
  'HitsF',
  'BlocksF',
  'GiveawaysF',
  'TakeawaysF',
  'season_id',
  'game_id',
  'PIMF',
  'PIMA',
  'HitsA',
  'BlocksA',
  'GiveawaysA',
  'TakeawaysA',
  'FO_PctA',
  'OT_Occurred',
  'SO_Occurred',
  'shots_missed_for',
  'shots_blocked_for',
  'ev5v5_shots_missed_for',
  'ev5v5_shots_blocked_for',
  'ev5v5_blocks_for',
  'ev5v5_assists1_for',
  'ev5v5_assists2_for',
  'ev5v5_faceoffs_won_for',
  'ev5v5_faceoffs_lost_for',
  'ev5v5_hits_for',
  'ev5v5_hits_against_for',
  'ev5v5_giveaways_for',
  'ev5v5_takeaways_for',
  'ev5v5_penalties_committed_for',
  'ev5v5_penalties_drawn_for',
  'p1_assists_for',
  'p2_assists_for',
  'p3_assists_for',
  'ot_assists_for',
  'p1_points_for',
  'p2_points_for',
  'p3_points_for',
  'ot_points_for',
  'shots_missed_hd_for',
  'shots_missed_md_for',
  'shots_missed_ld_for',
  'shots_blocked_hd_for',
  'shots_blocked_md_for',
  'shots_blocked_ld_for',
  'sat_hd_for',
  'sat_md_for',
  'sat_ld_for',
  'sog_l_for',
  'sog_r_for',
  'sog_c_for',
  'sog_d_for',
  'sog_l_against',
  'sog_r_against',
  'sog_c_against',
  'sog_d_against',
  'goals_l_against',
  'goals_r_against',
  'goals_c_against',
  'goals_d_against',
  'points_l_against',
  'points_r_against',
  'points_c_against',
  'points_d_against',
]

export default function TeamGamelogsPage() {
  const [allData, setAllData] = useState<TeamGamelogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [teams, setTeams] = useState<string[]>([])
  const [opponents, setOpponents] = useState<string[]>([])
  const [seasonId, setSeasonId] = useState<string>('')
  const [venue, setVenue] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [teamSearch, setTeamSearch] = useState('')
  const [opponentSearch, setOpponentSearch] = useState('')

  // Sort state
  const [sortField, setSortField] = useState<SortField>('game_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // View mode state
  const [activeView, setActiveView] = useState<ViewMode>('basic')
  const [advancedColumns, setAdvancedColumns] = useState<(keyof TeamGamelogRow)[]>(DEFAULT_ADVANCED_COLUMNS)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // Auto-sort by date when view changes
  useEffect(() => {
    setSortField('game_date')
    setSortDirection('desc')
  }, [activeView])

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (teams.length > 0) params.set('teams', teams.join(','))
        if (opponents.length > 0) params.set('opponents', opponents.join(','))
        if (seasonId) params.set('season_id', seasonId)
        if (venue) params.set('venue', venue)
        if (startDate) params.set('start_date', startDate)
        if (endDate) params.set('end_date', endDate)
        params.set('limit', '10000')

        const res = await fetch(`/api/nhl/teams/gamelogs?${params.toString()}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load data')
        if (!('data' in json)) throw new Error('Invalid response format')
        
        setAllData(json.data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load Team Gamelogs data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [teams, opponents, seasonId, venue, startDate, endDate])

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const uniqueTeams = Array.from(new Set(allData.map(r => r.team).filter(Boolean))) as string[]
    const uniqueOpponents = Array.from(new Set(allData.map(r => r.opponent).filter(Boolean))) as string[]
    const uniqueSeasons = Array.from(new Set(allData.map(r => r.season_id).filter(Boolean))) as string[]
    
    return {
      teams: uniqueTeams.sort(),
      opponents: uniqueOpponents.sort(),
      seasons: uniqueSeasons.sort(),
    }
  }, [allData])

  // Calculate streaks for all data (before filtering)
  const dataWithStreaks = useMemo(() => {
    // Group by team and sort by date
    const teamGroups = new Map<string, TeamGamelogRow[]>()
    allData.forEach(row => {
      if (row.team && row.game_date) {
        if (!teamGroups.has(row.team)) {
          teamGroups.set(row.team, [])
        }
        teamGroups.get(row.team)!.push({ ...row })
      }
    })

    // Calculate streak for each team
    teamGroups.forEach((games, team) => {
      // Sort by date ascending (oldest first)
      games.sort((a, b) => {
        const dateA = a.game_date || ''
        const dateB = b.game_date || ''
        return dateA.localeCompare(dateB)
      })

      // Calculate running streak
      let currentStreakType: 'W' | 'L' | null = null
      let currentStreakCount = 0

      games.forEach((game) => {
        const win = isWin(game)
        const streakType = win ? 'W' : 'L'

        if (currentStreakType === null) {
          // First game
          currentStreakType = streakType
          currentStreakCount = 1
        } else if (currentStreakType === streakType) {
          // Continue streak
          currentStreakCount++
        } else {
          // Break streak, start new one
          currentStreakType = streakType
          currentStreakCount = 1
        }

        // Store streak at this point in time
        game.streak = `${currentStreakType}${currentStreakCount}`
      })
    })

    // Flatten back to array
    const result: TeamGamelogRow[] = []
    teamGroups.forEach(games => {
      result.push(...games)
    })
    
    // Add games without team/date (shouldn't happen, but handle gracefully)
    allData.forEach(row => {
      if (!row.team || !row.game_date) {
        result.push({ ...row, streak: '-' })
      }
    })

    return result
  }, [allData])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...dataWithStreaks]

    // Apply team/opponent filters first
    if (teams.length > 0) {
      filtered = filtered.filter(row => row.team && teams.includes(row.team))
    }
    if (opponents.length > 0) {
      filtered = filtered.filter(row => row.opponent && opponents.includes(row.opponent))
    }

    // Apply L50/L30/L20/L10 filters (last N games per team)
    const checkLastNGames = () => {
      if (!startDate || !endDate) return null
      const start = new Date(startDate)
      const end = new Date(endDate)
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff >= 48 && daysDiff <= 51) return 50
      if (daysDiff >= 28 && daysDiff <= 31) return 30
      if (daysDiff >= 18 && daysDiff <= 21) return 20
      if (daysDiff >= 8 && daysDiff <= 11) return 10
      return null
    }

    const lastNGames = checkLastNGames()
    if (lastNGames && !seasonId) {
      const teamGroups = new Map<string, TeamGamelogRow[]>()
      filtered.forEach(row => {
        if (row.team) {
          if (!teamGroups.has(row.team)) {
            teamGroups.set(row.team, [])
          }
          teamGroups.get(row.team)!.push(row)
        }
      })
      
      filtered = []
      teamGroups.forEach((games, team) => {
        const sorted = games.sort((a, b) => {
          const dateA = a.game_date || ''
          const dateB = b.game_date || ''
          return dateB.localeCompare(dateA)
        })
        filtered.push(...sorted.slice(0, lastNGames))
      })
    }

    // Sort
    filtered.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      let aVal: any
      let bVal: any
      
      if (sortField === 'streak') {
        aVal = a.streak || ''
        bVal = b.streak || ''
        // Parse streak for proper sorting (W3 > W2 > L1 > L2)
        const parseStreak = (s: string) => {
          if (!s || s === '-') return { type: '', num: 0 }
          const match = s.match(/^([WL])(\d+)$/)
          if (!match) return { type: '', num: 0 }
          return { type: match[1], num: parseInt(match[2]) }
        }
        const aParsed = parseStreak(aVal)
        const bParsed = parseStreak(bVal)
        if (aParsed.type !== bParsed.type) {
          return dir * (aParsed.type === 'W' ? 1 : -1) * (bParsed.type === 'W' ? -1 : 1)
        }
        return dir * (aParsed.num - bParsed.num)
      } else {
        aVal = a[sortField as keyof TeamGamelogRow]
        bVal = b[sortField as keyof TeamGamelogRow]
      }
      
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return dir * aVal.localeCompare(bVal)
      }
      return dir * ((bVal ?? 0) - (aVal ?? 0))
    })

    return filtered
  }, [dataWithStreaks, sortField, sortDirection, teams, opponents, startDate, endDate, seasonId, venue])

  const clearAll = () => {
    setTeams([])
    setOpponents([])
    setSeasonId('')
    setVenue('')
    setStartDate('')
    setEndDate('')
  }

  // Filter button handlers
  const handleFilterButton = (filterType: string) => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    switch (filterType) {
      case '24-25':
        setStartDate('')
        setEndDate('2025-08-07')
        setSeasonId('')
        setVenue('')
        break
      case '25-26':
        setStartDate('2025-08-08')
        setEndDate(todayStr)
        setSeasonId('')
        setVenue('')
        break
      case 'L50':
      case 'L30':
      case 'L20':
      case 'L10':
        const days = parseInt(filterType.replace('L', ''))
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - days)
        setStartDate(startDate.toISOString().split('T')[0])
        setEndDate(todayStr)
        setSeasonId('')
        setVenue('')
        break
      case 'Home':
        setVenue('Home')
        setSeasonId('')
        break
      case 'Away':
        setVenue('Away')
        setSeasonId('')
        break
    }
  }

  // Get all NHL teams for logo row (alphabetical, UTA between TOR and VAN)
  const allNHLTeams = [
    'ANA', 'BOS', 'BUF', 'CAR', 'CBJ', 'CGY', 'CHI', 'COL', 'DAL',
    'DET', 'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NSH', 'NJD', 'NYI', 'NYR',
    'OTT', 'PHI', 'PIT', 'SJS', 'SEA', 'STL', 'TB', 'TOR', 'UTA', 'VAN', 'VGK',
    'WPG', 'WSH'
  ]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => {
    const isLeftAligned = field === 'team' || field === 'opponent' || field === 'game_date'
    return (
      <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className={`h-auto p-0 font-bold ${isLeftAligned ? 'justify-start' : 'justify-center'} hover:text-green-400 hover:bg-transparent text-white/80`}>
        {children}
        {sortField === field && (sortDirection === 'asc' ? <ArrowDown className="ml-1 h-3 w-3 text-green-400"/> : <ArrowUp className="ml-1 h-3 w-3 text-green-400"/>)}
      </Button>
    )
  }

  const formatNumber = (val: number | null) => val == null ? '-' : val.toFixed(val % 1 === 0 ? 0 : 2)
  const formatPercent = (val: number | null) => val == null ? '-' : `${(val * 100).toFixed(1)}%`
  const formatDate = (date: string | null | { value?: string }) => {
    // Handle BigQuery DATE object format
    if (date && typeof date === 'object' && date !== null && 'value' in date) {
      date = date.value || null
    }
    
    if (!date || typeof date !== 'string') return '-'
    
    try {
      // Handle BigQuery DATE format (YYYY-MM-DD)
      if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = date.split('-')
        return `${month}/${day}/${year}`
      }
      // Fallback to Date object parsing
      const d = new Date(date)
      if (isNaN(d.getTime())) {
        return date // Return original if invalid
      }
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const year = d.getFullYear()
      return `${month}/${day}/${year}`
    } catch {
      return date || '-'
    }
  }

  const formatVenue = (venue: string | null) => {
    if (!venue) return '-'
    if (venue.toLowerCase() === 'home') return 'vs'
    if (venue.toLowerCase() === 'away') return '@'
    return venue
  }

  const getResult = (row: TeamGamelogRow): string => {
    const gf = row.GF ?? 0
    const ga = row.GA ?? 0
    if (row.SO_Occurred === 1) {
      return gf > ga ? 'W (SO)' : 'L (SO)'
    }
    if (row.OT_Occurred === 1) {
      return gf > ga ? 'W (OT)' : 'L (OT)'
    }
    return gf > ga ? 'W' : 'L'
  }

  const getResultClass = (row: TeamGamelogRow): string => {
    const result = getResult(row)
    if (result.startsWith('W')) return 'text-green-500 font-bold'
    return 'text-red-500'
  }

  // Get columns to display based on view mode
  const getDisplayColumns = (): (keyof TeamGamelogRow)[] => {
    if (activeView === 'basic') return BASIC_COLUMNS
    if (activeView === 'advanced') {
      if (activePreset && PRESET_COLUMN_GROUPS[activePreset]) {
        return PRESET_COLUMN_GROUPS[activePreset]
      }
      return advancedColumns
    }
    return BASIC_COLUMNS
  }

  // Load columns from localStorage
  useEffect(() => {
    if (activeView === 'advanced') {
      const saved = localStorage.getItem('team-gamelogs-advanced-columns')
      if (saved) {
        try {
          setAdvancedColumns(JSON.parse(saved))
        } catch {
          // Use default advanced columns
        }
      }
    }
  }, [activeView])

  // Save columns to localStorage
  const handleColumnChange = (field: keyof TeamGamelogRow, checked: boolean) => {
    const newColumns = checked
      ? [...advancedColumns, field]
      : advancedColumns.filter(col => col !== field)
    setAdvancedColumns(newColumns)
    localStorage.setItem('team-gamelogs-advanced-columns', JSON.stringify(newColumns))
    setActivePreset(null) // Clear preset when manually changing columns
  }

  // Handle preset button clicks
  const handlePresetClick = (presetKey: string) => {
    if (activePreset === presetKey) {
      setActivePreset(null) // Toggle off if already active
    } else {
      setActivePreset(presetKey)
    }
  }

  // Get column group for double row headers
  const getColumnGroup = (col: keyof TeamGamelogRow): string | null => {
    if (col.startsWith('ev5v5_')) return 'EV 5v5'
    if (col.startsWith('p1_') || col.startsWith('p2_') || col.startsWith('p3_') || col.startsWith('ot_')) {
      if (col.includes('_goals_') || col.includes('_shots_') || col.includes('_corsi_') || col.includes('_assists_') || col.includes('_points_')) {
        return 'Period'
      }
    }
    if (col.includes('_hd_') || col.includes('_md_') || col.includes('_ld_')) return 'Shot Location'
    if ((col.includes('_l_') || col.includes('_r_') || col.includes('_c_') || col.includes('_d_')) && 
        (col.includes('_for') || col.includes('_against'))) return 'Position'
    return null
  }

  // Build column groups for header
  const buildColumnGroups = (): Array<{ label: string; startIdx: number; endIdx: number; cols: (keyof TeamGamelogRow)[] }> => {
    const groups: Array<{ label: string; startIdx: number; endIdx: number; cols: (keyof TeamGamelogRow)[] }> = []
    type GroupState = { label: string; cols: (keyof TeamGamelogRow)[] }
    let currentGroup: GroupState | null = null
    
    displayColumns.forEach((col, idx) => {
      const groupLabel = getColumnGroup(col)
      
      if (groupLabel) {
        if (!currentGroup || currentGroup.label !== groupLabel) {
          const prevGroup = currentGroup
          if (prevGroup !== null && prevGroup.cols.length >= 5) {
            groups.push({
              label: prevGroup.label,
              startIdx: idx - prevGroup.cols.length,
              endIdx: idx - 1,
              cols: [...prevGroup.cols]
            })
          }
          currentGroup = { label: groupLabel, cols: [col] }
        } else {
          if (currentGroup !== null) {
            currentGroup.cols.push(col)
          }
        }
      } else {
        const prevGroup = currentGroup
        if (prevGroup !== null && prevGroup.cols.length >= 5) {
          groups.push({
            label: prevGroup.label,
            startIdx: idx - prevGroup.cols.length,
            endIdx: idx - 1,
            cols: [...prevGroup.cols]
          })
        }
        currentGroup = null
      }
    })
    
    if (currentGroup) {
      const finalGroup: GroupState = currentGroup
      if (finalGroup.cols.length >= 5) {
        groups.push({
          label: finalGroup.label,
          startIdx: displayColumns.length - finalGroup.cols.length,
          endIdx: displayColumns.length - 1,
          cols: [...finalGroup.cols]
        })
      }
    }
    
    return groups
  }

  if (loading) return <div className="p-6">Loading Team Gamelogs data...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  const displayColumns = getDisplayColumns()

  return (
    <div className="flex flex-col h-[calc(100vh-3rem-3rem)] gap-6 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* View Tabs at Top */}
      <div className="border-b border-border">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveView('basic')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'basic'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
            }`}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveView('advanced')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'advanced'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* Team Logo Quick Filters */}
      <Card className="border-2 shadow-2xl flex-shrink-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {allNHLTeams.map(team => (
              <button
                key={team}
                onClick={() => {
                  if (teams.includes(team)) {
                    setTeams(teams.filter(t => t !== team))
                  } else {
                    setTeams([...teams, team])
                  }
                }}
                className={`p-1 rounded transition-all ${
                  teams.includes(team)
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <Image
                  src={getNHLTeamLogo(team)}
                  alt={team}
                  width={32}
                  height={32}
                  className="rounded object-contain"
                  style={{ maxWidth: '32px', maxHeight: '32px' }}
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-2xl flex-shrink-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70 backdrop-blur-xl border-white/10">
        <CardContent className="p-4">
          {/* Main Filter Row - All Horizontal */}
          <div className="flex flex-wrap items-end gap-3">
            {/* Teams Dropdown */}
            <div className="min-w-[180px]">
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Teams</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between h-9">
                    {teams.length === 0 ? 'All Teams' : `${teams.length} selected`}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="p-2">
                    <Input placeholder="Search teams" value={teamSearch} onChange={e=>setTeamSearch(e.target.value)} className="mb-2 h-8"/>
                    <div className="max-h-60 overflow-y-auto">
                      {filterOptions.teams.filter(t=>t.toLowerCase().includes(teamSearch.toLowerCase())).map(t=> (
                        <DropdownMenuCheckboxItem key={t} checked={teams.includes(t)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setTeams(c?[...teams,t]: teams.filter(x=>x!==t))}>
                          {t}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Opponents Dropdown */}
            <div className="min-w-[180px]">
              <Label className="text-xs font-semibold text-foreground mb-1.5 block">Opponents</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-between h-9">
                    {opponents.length === 0 ? 'All Opponents' : `${opponents.length} selected`}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <div className="p-2">
                    <Input placeholder="Search opponents" value={opponentSearch} onChange={e=>setOpponentSearch(e.target.value)} className="mb-2 h-8"/>
                    <div className="max-h-60 overflow-y-auto">
                      {filterOptions.opponents.filter(o=>o.toLowerCase().includes(opponentSearch.toLowerCase())).map(o=> (
                        <DropdownMenuCheckboxItem key={o} checked={opponents.includes(o)} onSelect={e=>e.preventDefault()} onCheckedChange={(c)=> setOpponents(c?[...opponents,o]: opponents.filter(x=>x!==o))}>
                          {o}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Period Filter Buttons */}
            <div className="flex items-end gap-1">
              <div className="flex items-center gap-1 p-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-md shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2.5 text-xs font-medium transition-all ${
                    seasonId === '' && startDate === '' && endDate === '' && venue === '' 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => {
                    setSeasonId('')
                    setStartDate('')
                    setEndDate('')
                    setVenue('')
                  }}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2.5 text-xs font-medium transition-all ${
                    startDate === '' && endDate === '2025-08-07' 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('24-25')}
                >
                  24-25
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2.5 text-xs font-medium transition-all ${
                    startDate === '2025-08-08' && endDate && new Date(endDate) >= new Date('2025-08-08') 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('25-26')}
                >
                  25-26
                </Button>
                <div className="w-px h-6 bg-white/10 mx-0.5" />
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2 text-xs font-medium transition-all ${
                    startDate && endDate && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) >= 48 && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) <= 51 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('L50')}
                >
                  L50
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2 text-xs font-medium transition-all ${
                    startDate && endDate && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) >= 28 && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) <= 31 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('L30')}
                >
                  L30
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2 text-xs font-medium transition-all ${
                    startDate && endDate && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) >= 18 && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) <= 21 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('L20')}
                >
                  L20
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2 text-xs font-medium transition-all ${
                    startDate && endDate && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) >= 8 && Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) <= 11 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('L10')}
                >
                  L10
                </Button>
              </div>
            </div>

            {/* Venue Filter Buttons */}
            <div className="flex items-end gap-1">
              <div className="flex items-center gap-1 p-1 rounded-md bg-black/40 border border-white/10 backdrop-blur-md shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2.5 text-xs font-medium transition-all ${
                    venue === '' 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => setVenue('')}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2.5 text-xs font-medium transition-all ${
                    venue === 'Home' 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('Home')}
                >
                  Home
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 px-2.5 text-xs font-medium transition-all ${
                    venue === 'Away' 
                      ? 'bg-green-500/30 border border-green-500 text-green-400 shadow-lg shadow-green-500/20' 
                      : 'hover:bg-white/5 text-muted-foreground'
                  }`}
                  onClick={() => handleFilterButton('Away')}
                >
                  Away
                </Button>
              </div>
            </div>

            {/* Column Selector (Advanced only) */}
            {activeView === 'advanced' && (
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                      <DropdownMenuContent className="min-w-[16rem] w-auto max-w-[min(32.5rem,calc(100%-1rem))] max-h-96 overflow-y-auto">
                        <div className="p-2 space-y-4">
                          {/* Basic Stats */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Basic Stats</Label>
                            {BASIC_COLUMNS.map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>

                          {/* Corsi/Fenwick */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Corsi / Fenwick</Label>
                            {['corsi_for', 'fenwick_for'].map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col as keyof TeamGamelogRow)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col as keyof TeamGamelogRow, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>

                          {/* EV 5v5 */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">EV 5v5</Label>
                            {ALL_COLUMNS.filter(col => col.startsWith('ev5v5_')).map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>

                          {/* Period Stats */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Period Stats</Label>
                            {ALL_COLUMNS.filter(col => col.startsWith('p1_') || col.startsWith('p2_') || col.startsWith('p3_') || col.startsWith('ot_')).map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>

                          {/* Shot Location */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Shot Location</Label>
                            {ALL_COLUMNS.filter(col => col.includes('_hd_') || col.includes('_md_') || col.includes('_ld_')).map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>

                          {/* Position Stats (For) */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Position Stats (For)</Label>
                            {ALL_COLUMNS.filter(col => (col.includes('_l_') || col.includes('_r_') || col.includes('_c_') || col.includes('_d_')) && col.includes('_for') && !col.includes('_against')).map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>

                          {/* Position Stats (Against) */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Position Stats (Against)</Label>
                            {ALL_COLUMNS.filter(col => col.includes('_against')).map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>

                          {/* Other Stats */}
                          <div>
                            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Other Stats</Label>
                            {ALL_COLUMNS.filter(col => 
                              !BASIC_COLUMNS.includes(col) &&
                              !col.startsWith('ev5v5_') &&
                              !col.startsWith('p1_') && !col.startsWith('p2_') && !col.startsWith('p3_') && !col.startsWith('ot_') &&
                              !col.includes('_hd_') && !col.includes('_md_') && !col.includes('_ld_') &&
                              !((col.includes('_l_') || col.includes('_r_') || col.includes('_c_') || col.includes('_d_')) && (col.includes('_for') || col.includes('_against'))) &&
                              col !== 'corsi_for' && col !== 'fenwick_for'
                            ).map(col => (
                              <DropdownMenuCheckboxItem
                                key={col}
                                checked={advancedColumns.includes(col)}
                                onSelect={(e) => e.preventDefault()}
                                onCheckedChange={(c) => handleColumnChange(col, c)}
                              >
                                {getColumnLabel(col)}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
            )}

            {/* Clear Button */}
            <div className="ml-auto flex items-end flex-shrink-0">
              <Button variant="outline" size="sm" onClick={clearAll} className="h-9 border-2 font-medium hover:bg-destructive/10 hover:border-destructive/50">
                Clear
              </Button>
            </div>
          </div>

          {/* Presets Row (Advanced only) */}
          {activeView === 'advanced' && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <Label className="text-xs font-semibold text-white/80 whitespace-nowrap">Presets:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-9 px-4 text-xs font-semibold transition-all border-2 ${
                    activePreset === 'vs_position'
                      ? 'bg-blue-500/30 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/30'
                      : 'border-blue-500/40 text-blue-400/70 hover:bg-blue-500/15 hover:border-blue-500/60 hover:shadow-md'
                  }`}
                  onClick={() => handlePresetClick('vs_position')}
                >
                  vs Position
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {filteredData.length > 0 && (
        <Card className="border-2 shadow-2xl flex-shrink-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70 backdrop-blur-xl border-white/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              {/* Team Logo (when only one selected) */}
              {teams.length === 1 && (
                <div className="flex-shrink-0">
                  <Image
                    src={getNHLTeamLogo(teams[0])}
                    alt={teams[0]}
                    width={40}
                    height={40}
                    className="rounded object-contain"
                    style={{ maxWidth: '40px', maxHeight: '40px' }}
                  />
                </div>
              )}

              {/* Stats Row - Compact Horizontal */}
              <div className="flex-1 flex items-center gap-4 flex-wrap">
                {/* Win/Loss Record */}
                <div className="bg-black/40 border border-white/10 rounded px-3 py-1.5 backdrop-blur-sm">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">Record</div>
                  <div className="text-sm font-bold text-white/90">
                    {(() => {
                      const wins = filteredData.filter(r => {
                        const gf = r.GF ?? 0
                        const ga = r.GA ?? 0
                        return gf > ga
                      }).length
                      const otLosses = filteredData.filter(r => {
                        const gf = r.GF ?? 0
                        const ga = r.GA ?? 0
                        return gf < ga && (r.OT_Occurred === 1 || r.SO_Occurred === 1)
                      }).length
                      const regLosses = filteredData.length - wins - otLosses
                      return `${wins}-${regLosses}-${otLosses}`
                    })()}
                  </div>
                </div>

                {/* Goals For Average */}
                <div className="bg-black/40 border border-white/10 rounded px-3 py-1.5 backdrop-blur-sm">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">GF/GP</div>
                  <div className="text-sm font-bold text-green-400">
                    {(() => {
                      const total = filteredData.reduce((sum, r) => sum + (r.GF ?? 0), 0)
                      return (total / filteredData.length).toFixed(2)
                    })()}
                  </div>
                </div>

                {/* Goals Against Average */}
                <div className="bg-black/40 border border-white/10 rounded px-3 py-1.5 backdrop-blur-sm">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">GA/GP</div>
                  <div className="text-sm font-bold text-red-400">
                    {(() => {
                      const total = filteredData.reduce((sum, r) => sum + (r.GA ?? 0), 0)
                      return (total / filteredData.length).toFixed(2)
                    })()}
                  </div>
                </div>

                {/* Power Play % */}
                <div className="bg-black/40 border border-white/10 rounded px-3 py-1.5 backdrop-blur-sm">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">PP%</div>
                  <div className="text-sm font-bold text-white/90">
                    {(() => {
                      const totalPPG = filteredData.reduce((sum, r) => sum + (r.PPG ?? 0), 0)
                      const totalPPOpp = filteredData.reduce((sum, r) => sum + (r.PP_Att ?? 0), 0)
                      if (totalPPOpp === 0) return '0.0%'
                      return `${((totalPPG / totalPPOpp) * 100).toFixed(1)}%`
                    })()}
                  </div>
                </div>

                {/* Penalty Kill % */}
                <div className="bg-black/40 border border-white/10 rounded px-3 py-1.5 backdrop-blur-sm">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">PK%</div>
                  <div className="text-sm font-bold text-white/90">
                    {(() => {
                      const totalPKGA = filteredData.reduce((sum, r) => sum + (r.PKGA ?? 0), 0)
                      const totalPKOpp = filteredData.reduce((sum, r) => sum + (r.PK_Att ?? 0), 0)
                      if (totalPKOpp === 0) return '0.0%'
                      return `${(((totalPKOpp - totalPKGA) / totalPKOpp) * 100).toFixed(1)}%`
                    })()}
                  </div>
                </div>

                {/* Shots For Average */}
                <div className="bg-black/40 border border-white/10 rounded px-3 py-1.5 backdrop-blur-sm">
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">SOG F/GP</div>
                  <div className="text-sm font-bold text-white/90">
                    {(() => {
                      const total = filteredData.reduce((sum, r) => sum + (r.SOGF ?? 0), 0)
                      return (total / filteredData.length).toFixed(1)
                    })()}
                  </div>
                </div>
              </div>

              {/* Insights Section - Compact */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const insights: string[] = []
                  const wins = filteredData.filter(r => {
                    const gf = r.GF ?? 0
                    const ga = r.GA ?? 0
                    return gf > ga
                  }).length
                  const winPct = wins / filteredData.length
                  
                  if (winPct >= 0.6) {
                    insights.push('🔥 Hot streak')
                  } else if (winPct <= 0.4) {
                    insights.push('❄️ Cold streak')
                  }

                  const homeGames = filteredData.filter(r => r.venue === 'Home').length
                  const homeWins = filteredData.filter(r => {
                    if (r.venue !== 'Home') return false
                    const gf = r.GF ?? 0
                    const ga = r.GA ?? 0
                    return gf > ga
                  }).length
                  const homeWinPct = homeGames > 0 ? homeWins / homeGames : 0
                  const awayGames = filteredData.filter(r => r.venue === 'Away').length
                  const awayWins = filteredData.filter(r => {
                    if (r.venue !== 'Away') return false
                    const gf = r.GF ?? 0
                    const ga = r.GA ?? 0
                    return gf > ga
                  }).length
                  const awayWinPct = awayGames > 0 ? awayWins / awayGames : 0

                  if (homeWinPct >= 0.65 && homeGames >= 3) {
                    insights.push('🏠 Strong at home')
                  }
                  if (awayWinPct >= 0.65 && awayGames >= 3) {
                    insights.push('✈️ Strong on road')
                  }

                  const avgGF = filteredData.reduce((sum, r) => sum + (r.GF ?? 0), 0) / filteredData.length
                  const avgGA = filteredData.reduce((sum, r) => sum + (r.GA ?? 0), 0) / filteredData.length
                  
                  if (avgGF >= 3.5) {
                    insights.push('⚡ High scoring offense')
                  }
                  if (avgGA <= 2.0) {
                    insights.push('🛡️ Stingy defense')
                  }

                  const totalPPG = filteredData.reduce((sum, r) => sum + (r.PPG ?? 0), 0)
                  const totalPPOpp = filteredData.reduce((sum, r) => sum + (r.PP_Att ?? 0), 0)
                  const ppPct = totalPPOpp > 0 ? (totalPPG / totalPPOpp) * 100 : 0
                  if (ppPct >= 25 && totalPPOpp >= 10) {
                    insights.push('💪 Elite power play')
                  }

                  const totalPKOpp = filteredData.reduce((sum, r) => sum + (r.PK_Att ?? 0), 0)
                  const totalPKGA = filteredData.reduce((sum, r) => sum + (r.PKGA ?? 0), 0)
                  const pkPct = totalPKOpp > 0 ? ((totalPKOpp - totalPKGA) / totalPKOpp) * 100 : 0
                  if (pkPct >= 85 && totalPKOpp >= 10) {
                    insights.push('🔒 Elite penalty kill')
                  }

                  return insights.length > 0 ? insights : []
                })().map((insight, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 rounded text-[10px] font-medium text-green-400"
                  >
                    {insight}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 shadow-2xl flex-1 flex flex-col min-h-0 bg-gradient-to-br from-black/90 via-black/80 to-black/70 backdrop-blur-xl border-white/10">
        <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
          <div className="h-full w-full overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="sticky top-0 z-20 bg-gradient-to-b from-black/95 via-black/90 to-black/85 border-b-2 border-white/20 backdrop-blur-xl shadow-2xl">
                {(() => {
                  const groups = buildColumnGroups()
                  const hasGroups = groups.length > 0
                  
                  if (hasGroups) {
                    const groupRow: Array<{ colspan: number; label: string | null }> = []
                    let processedIdx = 0
                    let groupIdx = 0
                    
                    while (processedIdx < displayColumns.length) {
                      const currentGroup = groupIdx < groups.length ? groups[groupIdx] : null
                      
                      if (currentGroup && processedIdx === currentGroup.startIdx) {
                        groupRow.push({ colspan: currentGroup.cols.length, label: currentGroup.label })
                        processedIdx = currentGroup.endIdx + 1
                        groupIdx++
                      } else {
                        // Find next group start or end of columns
                        const nextGroupStart = groups.find(g => g.startIdx > processedIdx)?.startIdx ?? displayColumns.length
                        const colsUntilNextGroup = nextGroupStart - processedIdx
                        
                        // Add individual columns that aren't in groups
                        for (let i = 0; i < colsUntilNextGroup; i++) {
                          const col = displayColumns[processedIdx + i]
                          const group = getColumnGroup(col)
                          if (!group || !groups.some(g => g.cols.includes(col))) {
                            groupRow.push({ colspan: 1, label: null })
                          }
                        }
                        processedIdx = nextGroupStart
                      }
                    }
                    
                    // Add Result column
                    groupRow.push({ colspan: 1, label: null })
                    
                    return (
                      <>
                        <tr>
                          {groupRow.map((item, idx) => (
                            <th
                              key={idx}
                              colSpan={item.colspan}
                              className="text-center p-2 text-xs font-bold text-white/90 border-b-2 border-white/30 bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-sm"
                            >
                              {item.label}
                            </th>
                          ))}
                        </tr>
                        <tr className="border-b border-white/20">
                          {displayColumns.map((col, idx) => {
                            const isOpponent = col === 'opponent'
                            return (
                              <React.Fragment key={col}>
                                <th className={`${col === 'team' || col === 'opponent' || col === 'game_date' ? 'text-left' : 'text-center'} p-2 text-xs font-bold text-white/80 uppercase tracking-wider ${col !== 'team' && col !== 'opponent' && col !== 'venue' && col !== 'game_date' ? 'border-r border-white/20 w-16' : ''} ${col === 'game_date' ? 'w-24' : ''} ${col === 'team' ? 'w-28' : ''} ${col === 'opponent' ? 'w-32' : ''} ${col === 'team' || col === 'opponent' ? 'pr-0.5' : ''} ${col === 'venue' ? 'w-8 pl-0.5 pr-0.5' : ''}`}>
                                  {col === 'venue' ? (
                                    <span className="text-transparent">V</span>
                                  ) : (
                                    <SortButton field={col}>{getColumnLabel(col)}</SortButton>
                                  )}
                                </th>
                                {isOpponent && (
                                  <>
                                    <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-20">
                                      <SortButton field="GF">Result</SortButton>
                                    </th>
                                    {activeView === 'basic' && (
                                      <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-16">
                                        <SortButton field="streak">Streak</SortButton>
                                      </th>
                                    )}
                                  </>
                                )}
                              </React.Fragment>
                            )
                          })}
                          {!displayColumns.includes('opponent') && (
                            <>
                              <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-20">
                                <SortButton field="GF">Result</SortButton>
                              </th>
                              {activeView === 'basic' && (
                                <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-16">
                                  <SortButton field="streak">Streak</SortButton>
                                </th>
                              )}
                            </>
                          )}
                        </tr>
                      </>
                    )
                  }
                  
                  return (
                    <tr>
                      {displayColumns.map((col, idx) => {
                        const isOpponent = col === 'opponent'
                        return (
                          <React.Fragment key={col}>
                            <th className={`${col === 'team' || col === 'opponent' || col === 'game_date' ? 'text-left' : 'text-center'} p-2 text-xs font-bold text-white/80 uppercase tracking-wider ${col !== 'team' && col !== 'opponent' && col !== 'venue' && col !== 'game_date' ? 'border-r border-white/20 w-16' : ''} ${col === 'game_date' ? 'w-24' : ''} ${col === 'team' ? 'w-28' : ''} ${col === 'opponent' ? 'w-32' : ''} ${col === 'team' || col === 'opponent' ? 'pr-0.5' : ''} ${col === 'venue' ? 'w-8 pl-0.5 pr-0.5' : ''}`}>
                              {col === 'venue' ? (
                                <span className="text-transparent">V</span>
                              ) : (
                                <SortButton field={col}>{getColumnLabel(col)}</SortButton>
                              )}
                            </th>
                            {isOpponent && (
                              <>
                                <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-20">
                                  <SortButton field="GF">Result</SortButton>
                                </th>
                                {activeView === 'basic' && (
                                  <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-16">
                                    <SortButton field="streak">Streak</SortButton>
                                  </th>
                                )}
                              </>
                            )}
                          </React.Fragment>
                        )
                      })}
                      {!displayColumns.includes('opponent') && (
                        <>
                          <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-20">
                            <SortButton field="GF">Result</SortButton>
                          </th>
                          {activeView === 'basic' && (
                            <th className="text-center p-2 text-xs font-bold text-white/80 uppercase tracking-wider border-r border-white/20 w-16">
                              <SortButton field="streak">Streak</SortButton>
                            </th>
                          )}
                        </>
                      )}
                    </tr>
                  )
                })()}
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr 
                    key={`${row.game_id}-${row.team}-${idx}`}
                    className="border-b border-white/5 hover:bg-gradient-to-r hover:from-white/5 hover:to-white/2 hover:shadow-lg transition-all duration-300"
                  >
                    {displayColumns.map((col, colIdx) => {
                      const value = row[col]
                      const shouldInsertResult = col === 'opponent' && displayColumns.indexOf('opponent') === colIdx
                      
                      return (
                        <React.Fragment key={col}>
                          {col === 'game_date' ? (
                            <td className="p-2 text-xs text-white/60 w-24">
                              {formatDate(value as string | null)}
                            </td>
                          ) : col === 'team' ? (
                            <td className="p-2 pr-0.5 w-28">
                              <div className="flex items-center gap-1.5">
                                <Image
                                  src={getNHLTeamLogo(value as string | null)}
                                  alt={value as string || ''}
                                  width={20}
                                  height={20}
                                  className="rounded object-contain flex-shrink-0"
                                  style={{ maxWidth: '20px', maxHeight: '20px' }}
                                />
                                <span className="text-sm font-medium text-white/90 truncate">{value as string || '-'}</span>
                              </div>
                            </td>
                          ) : col === 'opponent' ? (
                            <td className="p-2 pr-0.5 w-32">
                              <div className="flex items-center gap-1.5">
                                <Image
                                  src={getNHLTeamLogo(value as string | null)}
                                  alt={value as string || ''}
                                  width={20}
                                  height={20}
                                  className="rounded object-contain flex-shrink-0"
                                  style={{ maxWidth: '20px', maxHeight: '20px' }}
                                />
                                <span className="text-sm font-medium text-white/90 truncate">{value as string || '-'}</span>
                              </div>
                            </td>
                          ) : col === 'venue' ? (
                            <td className="p-2 pl-0.5 pr-0.5 text-sm font-medium text-white/80 text-center">
                              {formatVenue(value as string | null)}
                            </td>
                          ) : col === 'PP_Pct' || col === 'PK_Pct' || col === 'FO_PctF' || col === 'FO_PctA' ? (
                            <td className="p-2 text-sm font-medium text-white/80 text-center border-r border-white/20 w-16">
                              {formatPercent(value as number | null)}
                            </td>
                          ) : (
                            <td className="p-2 text-sm font-medium text-white/80 text-center border-r border-white/20 w-16">
                              {formatNumber(value as number | null)}
                            </td>
                          )}
                          {shouldInsertResult && (
                            <>
                              <td className={`p-2 text-sm font-semibold text-center border-r border-white/20 w-20 ${getResultClass(row)}`}>
                                {getResult(row)}
                              </td>
                              {activeView === 'basic' && (
                                <td className="p-2 text-sm font-medium text-white/80 text-center border-r border-white/20 w-16">
                                  {row.streak || '-'}
                                </td>
                              )}
                            </>
                          )}
                        </React.Fragment>
                      )
                    })}
                    {!displayColumns.includes('opponent') && (
                      <>
                        <td className={`p-2 text-sm font-semibold text-center border-r border-white/20 w-20 ${getResultClass(row)}`}>
                          {getResult(row)}
                        </td>
                        {activeView === 'basic' && (
                          <td className="p-2 text-sm font-medium text-white/80 text-center border-r border-white/20 w-16">
                            {row.streak || '-'}
                          </td>
                        )}
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/10 text-xs text-white/50 italic text-center bg-black/40">
            * Regular season only, data since 2024-25
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
