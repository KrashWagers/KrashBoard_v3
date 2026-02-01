"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { ChevronDown, ArrowDown, ArrowUp, Beaker, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import html2canvas from "html2canvas"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface PlayerVsOppGamelog {
  game_id: string | null
  game_date: string | null
  home_abbrev: string | null
  away_abbrev: string | null
  venue: string | null
  goals: number | null
  assists: number | null
  points: number | null
  shots_on_goal: number | null
  corsi: number | null
  pp_goals: number | null
  pp_assists: number | null
  pp_points: number | null
  first_goal_scorer: number | null
  last_goal_scorer: number | null
}

interface PlayerOption {
  name: string
  headshot_url: string | null
  team_abbr: string | null
}

interface PlayerVsOppRow {
  game_id: string | null
  game_date: string | null
  team_abbr: string | null
  opponent_abbr: string | null
  player_id: number | null
  full_name: string | null
  headshot_url: string | null
  position_code: string | null
  position_name: string | null
  jersey_number: string | null
  shoots_catches: string | null
  gp_vs_opp: number | null
  goals_vs_opp: number | null
  assists_vs_opp: number | null
  points_vs_opp: number | null
  shots_on_goal_vs_opp: number | null
  corsi_vs_opp: number | null
  first_goal_scorer_vs_opp: number | null
  last_goal_scorer_vs_opp: number | null
  pp_goals_vs_opp: number | null
  pp_assists_vs_opp: number | null
  pp_points_vs_opp: number | null
  goals_per_game_vs_opp: number | null
  assists_per_game_vs_opp: number | null
  points_per_game_vs_opp: number | null
  shots_on_goal_per_game_vs_opp: number | null
  corsi_per_game_vs_opp: number | null
  pp_goals_per_game_vs_opp: number | null
  pp_assists_per_game_vs_opp: number | null
  pp_points_per_game_vs_opp: number | null
  games_goals_ge1: number | null
  games_goals_ge2: number | null
  games_goals_ge3: number | null
  games_shots_ge1: number | null
  games_shots_ge2: number | null
  games_shots_ge3: number | null
  games_shots_ge4: number | null
  games_shots_ge5: number | null
  games_shots_ge6: number | null
  games_shots_ge7: number | null
  games_assists_ge1: number | null
  games_assists_ge2: number | null
  games_assists_ge3: number | null
  games_points_ge1: number | null
  games_points_ge2: number | null
  games_points_ge3: number | null
  games_points_ge4: number | null
  gamelogs?: PlayerVsOppGamelog[]
}

type SortField = 'full_name' | 'team_abbr' | 'opponent_abbr' | 'position_code' | 
  'gp_vs_opp' | 'goals_vs_opp' | 'assists_vs_opp' | 'points_vs_opp' | 
  'shots_on_goal_vs_opp' | 'corsi_vs_opp' | 'goals_per_game_vs_opp' | 
  'assists_per_game_vs_opp' | 'points_per_game_vs_opp' | 'shots_on_goal_per_game_vs_opp' |
  'corsi_per_game_vs_opp' | 'pp_goals_vs_opp' | 'pp_assists_vs_opp' | 
  'pp_points_vs_opp' | 'pp_goals_per_game_vs_opp' | 'pp_assists_per_game_vs_opp' |
  'pp_points_per_game_vs_opp' | 'games_goals_ge1' | 'games_goals_ge2' | 
  'games_goals_ge3' | 'games_shots_ge1' | 'games_shots_ge2' | 'games_shots_ge3' |
  'games_shots_ge4' | 'games_shots_ge5' | 'games_shots_ge6' | 'games_shots_ge7' |
  'games_assists_ge1' | 'games_assists_ge2' | 'games_assists_ge3' | 'games_points_ge1' | 
  'games_points_ge2' | 'games_points_ge3' | 'games_points_ge4'
type SortDirection = 'asc' | 'desc'
type ViewType = 'overall' | 'goals' | 'assists' | 'points' | 'shots'

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
    'PHI': '/Images/NHL_Logos/PHI.png', 'PIT': '/Images/NHL_Logos/PIT.png', 'SJS': '/Images/NHL_Logos/SJS.png',
    'SEA': '/Images/NHL_Logos/SEA.png', 'STL': '/Images/NHL_Logos/STL.png', 'TB': '/Images/NHL_Logos/TB.png',
    'TBL': '/Images/NHL_Logos/TB.png', 'TOR': '/Images/NHL_Logos/TOR.png', 'VAN': '/Images/NHL_Logos/VAN.png',
    'VGK': '/Images/NHL_Logos/VGK.png', 'WPG': '/Images/NHL_Logos/WPG.png', 'WSH': '/Images/NHL_Logos/WSH.png',
    'UTA': '/Images/NHL_Logos/UTA.png'
  }
  return teamMap[abbrev] || '/Images/League_Logos/NHL-Logo.png'
}


export default function PlayerVsOppPage() {
  const [allData, setAllData] = useState<PlayerVsOppRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [players, setPlayers] = useState<string[]>([])
  const [teams, setTeams] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])
  const [minGP, setMinGP] = useState<number>(0)
  const [playerSearch, setPlayerSearch] = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  const [positionSearch, setPositionSearch] = useState('')
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false)
  const [showTeamDropdown, setShowTeamDropdown] = useState(false)
  const [showPositionDropdown, setShowPositionDropdown] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Sort state
  const [sortField, setSortField] = useState<SortField>('full_name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // View toggle state
  const [activeView, setActiveView] = useState<ViewType>('overall')
  const [selectedRow, setSelectedRow] = useState<PlayerVsOppRow | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Auto-sort by main stat when view changes
  useEffect(() => {
    const defaultSortFields: Record<ViewType, SortField> = {
      overall: 'goals_vs_opp',
      goals: 'goals_vs_opp',
      assists: 'assists_vs_opp',
      points: 'points_vs_opp',
      shots: 'shots_on_goal_vs_opp',
    }
    setSortField(defaultSortFields[activeView])
    setSortDirection('asc')
  }, [activeView])

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/nhl/player-vs-opp?limit=10000')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load data')
        if (!('data' in json)) throw new Error('Invalid response format')
        
        setAllData(json.data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load Player vs Opp data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Get unique filter options
  const playerOptions = useMemo<PlayerOption[]>(() => {
    const map = new Map<string, PlayerOption>()
    allData.forEach((row) => {
      if (!row.full_name) return
      if (!map.has(row.full_name)) {
        map.set(row.full_name, {
          name: row.full_name,
          headshot_url: row.headshot_url ?? null,
          team_abbr: row.team_abbr ?? null,
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [allData])

  const filterOptions = useMemo(() => {
    const uniqueTeams = Array.from(new Set(allData.map(r => r.team_abbr).filter(Boolean))) as string[]
    const uniquePositions = Array.from(new Set(allData.map(r => r.position_code).filter(Boolean))) as string[]
    
    return {
      players: playerOptions.map((p) => p.name),
      teams: uniqueTeams.sort(),
      positions: uniquePositions.sort(),
    }
  }, [allData, playerOptions])

  // Filtered players for dropdown based on search
  const filteredPlayers = useMemo(() => {
    const query = playerSearch.trim().toLowerCase()
    const list = query
      ? playerOptions.filter((p) => p.name.toLowerCase().includes(query))
      : playerOptions
    return list.slice(0, 50)
  }, [playerSearch, playerOptions])

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase()
    const list = query
      ? filterOptions.teams.filter((team) => team.toLowerCase().includes(query))
      : filterOptions.teams
    return list
  }, [teamSearch, filterOptions.teams])

  const filteredPositions = useMemo(() => {
    const query = positionSearch.trim().toLowerCase()
    const list = query
      ? filterOptions.positions.filter((pos) => pos.toLowerCase().includes(query))
      : filterOptions.positions
    return list
  }, [positionSearch, filterOptions.positions])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = allData.filter(r => {
      if (players.length && (!r.full_name || !players.includes(r.full_name))) return false
      if (teams.length && (!r.team_abbr || !teams.includes(r.team_abbr))) return false
      if (positions.length && (!r.position_code || !positions.includes(r.position_code))) return false
      if (minGP > 0 && (!r.gp_vs_opp || r.gp_vs_opp < minGP)) return false
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return dir * aVal.localeCompare(bVal)
      }
      return dir * ((bVal ?? 0) - (aVal ?? 0))
    })

    return filtered
  }, [allData, players, teams, positions, minGP, sortField, sortDirection])

  const clearAll = () => {
    setPlayers([])
    setTeams([])
    setPositions([])
    setMinGP(0)
    setPlayerSearch('')
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" onClick={() => handleSort(field)} className="h-auto p-0 font-bold justify-start hover:text-primary hover:bg-transparent">
      {children}
      {sortField === field && (sortDirection === 'asc' ? <ArrowDown className="ml-1 h-3 w-3 text-primary"/> : <ArrowUp className="ml-1 h-3 w-3 text-primary"/>)}
    </Button>
  )

  const formatNumber = (val: number | null) => val == null ? '-' : val.toFixed(val % 1 === 0 ? 0 : 2)
  const formatPerGame = (val: number | null) => val == null ? '-' : val.toFixed(2)
  const formatPercent = (val: number | null) => val == null ? '-' : `${(val * 100).toFixed(1)}%`
  const getVenueLabel = (log: PlayerVsOppGamelog, teamAbbr: string | null) => {
    if (!teamAbbr) return '-'
    const normalizedTeam = teamAbbr.toUpperCase()
    const home = log.home_abbrev?.toUpperCase()
    const away = log.away_abbrev?.toUpperCase()
    if (away && away === normalizedTeam) return '@'
    if (home && home === normalizedTeam) return 'vs'
    const venue = log.venue?.toLowerCase()
    if (venue === 'away') return '@'
    if (venue === 'home') return 'vs'
    return '-'
  }

  const getOpponentAbbr = (log: PlayerVsOppGamelog, teamAbbr: string | null) => {
    if (!teamAbbr) return log.away_abbrev || log.home_abbrev || null
    const normalizedTeam = teamAbbr.toUpperCase()
    const home = log.home_abbrev?.toUpperCase()
    const away = log.away_abbrev?.toUpperCase()
    if (away && away === normalizedTeam) return log.home_abbrev
    if (home && home === normalizedTeam) return log.away_abbrev
    return log.away_abbrev || log.home_abbrev || null
  }

  const getFantasyScore = (log: PlayerVsOppGamelog) => {
    const goals = log.goals ?? 0
    const assists = log.assists ?? 0
    const shots = log.shots_on_goal ?? 0
    return goals * 2 + assists * 1 + shots * 0.25
  }

  const bestGame = useMemo(() => {
    if (!selectedRow?.gamelogs?.length) return null
    return [...selectedRow.gamelogs].sort((a, b) => getFantasyScore(b) - getFantasyScore(a))[0]
  }, [selectedRow])
  
  // Format games with threshold as fraction and percentage
  const formatGamesWithPercent = (games: number | null, totalGames: number | null) => {
    if (games == null || totalGames == null || totalGames === 0) return '-'
    const pct = (games / totalGames) * 100
    const pctColor = getPercentColor(pct)
    return (
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium">{games}/{totalGames}</span>
        <span className={`text-xs ${pctColor}`}>{pct.toFixed(0)}%</span>
      </div>
    )
  }

  // Get color for percentage values
  const getPercentColor = (pct: number): string => {
    if (pct >= 80) return 'text-green-500 font-bold'
    if (pct >= 60) return 'text-green-400'
    if (pct >= 40) return 'text-yellow-400'
    return 'text-muted-foreground'
  }

  // Conditional formatting helper - color code based on value
  const getValueColor = (value: number | null, type: 'goals' | 'assists' | 'points' | 'shots' | 'perGame' | 'pp'): string => {
    if (value == null) return ''
    
    switch (type) {
      case 'goals':
        if (value >= 7) return 'text-green-500 font-bold'
        if (value >= 5) return 'text-green-400'
        if (value >= 3) return 'text-yellow-400'
        return ''
      case 'assists':
        if (value >= 8) return 'text-green-500 font-bold'
        if (value >= 6) return 'text-green-400'
        if (value >= 4) return 'text-yellow-400'
        return ''
      case 'points':
        if (value >= 15) return 'text-green-500 font-bold'
        if (value >= 12) return 'text-green-400'
        if (value >= 8) return 'text-yellow-400'
        return ''
      case 'shots':
        if (value >= 30) return 'text-green-500 font-bold'
        if (value >= 25) return 'text-green-400'
        if (value >= 20) return 'text-yellow-400'
        return ''
      case 'perGame':
        if (value >= 1.0) return 'text-green-500 font-bold'
        if (value >= 0.7) return 'text-green-400'
        if (value >= 0.5) return 'text-yellow-400'
        return ''
      case 'pp':
        if (value >= 5) return 'text-green-500 font-bold'
        if (value >= 3) return 'text-green-400'
        if (value >= 1) return 'text-yellow-400'
        return ''
      default:
        return ''
    }
  }

  // Export function - clones the entire table container to preserve all styling, images, and theming
  const handleExport = async () => {
    if (isExporting || filteredData.length === 0) return
    
    setIsExporting(true)
    
    try {
      // Find the Card container that holds the table
      const originalCard = document.getElementById('player-vs-opp-card')
      if (!originalCard) {
        throw new Error('Table container not found')
      }
      
      // Clone the entire Card structure (deep clone to preserve all nested elements and styles)
      const clonedCard = originalCard.cloneNode(true) as HTMLElement
      
      // Remove the ID to avoid conflicts
      clonedCard.removeAttribute('id')
      
      // Find and limit table rows to 30
      const clonedTable = clonedCard.querySelector('table')
      if (clonedTable) {
        const tbody = clonedTable.querySelector('tbody')
        if (tbody) {
          const rows = Array.from(tbody.querySelectorAll('tr'))
          if (rows.length > 30) {
            rows.slice(30).forEach(row => row.remove())
          }
        }
      }
      
      // Remove interactive elements (buttons, links) but keep their parent structure
      clonedCard.querySelectorAll('button, a').forEach(el => {
        const parent = el.parentElement
        if (parent && parent.tagName === 'TD') {
          // Clear the cell but keep the TD structure
          parent.innerHTML = ''
          parent.style.padding = '8px'
        } else {
          el.remove()
        }
      })
      
      // Unwrap ScrollArea - extract the actual content
      const scrollAreaViewport = clonedCard.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollAreaViewport) {
        // Get the direct children (the table)
        const tableElement = scrollAreaViewport.querySelector('table')
        if (tableElement) {
          // Find the ScrollArea parent and replace it with just the table
          const scrollArea = scrollAreaViewport.closest('[data-radix-scroll-area-root]') || scrollAreaViewport.parentElement
          if (scrollArea) {
            // Create a new div to hold the table
            const tableWrapper = document.createElement('div')
            tableWrapper.style.width = '100%'
            tableWrapper.style.overflow = 'visible'
            tableWrapper.appendChild(tableElement.cloneNode(true))
            scrollArea.replaceWith(tableWrapper)
          }
        }
      }
      
      // Ensure the CardContent doesn't have height restrictions
      const cardContent = clonedCard.querySelector('[class*="CardContent"]') as HTMLElement | null
      if (cardContent) {
        cardContent.style.setProperty('height', 'auto')
        cardContent.style.setProperty('min-height', 'auto')
        cardContent.style.setProperty('max-height', 'none')
        cardContent.style.setProperty('overflow', 'visible')
      }
      
      // Ensure the Card doesn't have height restrictions
      clonedCard.style.setProperty('height', 'auto')
      clonedCard.style.setProperty('min-height', 'auto')
      clonedCard.style.setProperty('max-height', 'none')
      clonedCard.style.setProperty('flex', 'none')
      
      // Build title based on view
      const viewTitles: Record<ViewType, string> = {
        overall: 'Player vs Opponent',
        goals: 'Goals vs Opponent',
        assists: 'Assists vs Opponent',
        points: 'Points vs Opponent',
        shots: 'Shots vs Opponent',
      }
      const title = viewTitles[activeView]
      
      // Build subtitle
      const sortFieldLabels: Record<string, string> = {
        'goals_vs_opp': 'Goals',
        'assists_vs_opp': 'Assists',
        'points_vs_opp': 'Points',
        'shots_on_goal_vs_opp': 'Shots',
        'full_name': 'Player Name',
      }
      const sortLabel = sortFieldLabels[sortField] || 'Goals'
      let subtitle = `${activeView === 'overall' ? 'Player' : activeView.charAt(0).toUpperCase() + activeView.slice(1)} vs their next opponent - data since 2022-23 season - ranked by ${sortLabel}`
      if (minGP > 0) {
        subtitle += ` - min ${minGP} GP`
      }
      
      // Format today's date
      const today = new Date()
      const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      
      // Create export container (portrait orientation)
      const exportContainer = document.createElement('div')
      exportContainer.id = 'export-container'
      exportContainer.style.position = 'fixed'
      exportContainer.style.left = '-9999px'
      exportContainer.style.top = '0'
      exportContainer.style.width = '1200px'
      const rootStyles = window.getComputedStyle(document.documentElement)
      exportContainer.style.backgroundColor = rootStyles.getPropertyValue('--background') || '#0a0a0a'
      exportContainer.style.color = rootStyles.getPropertyValue('--foreground') || '#ffffff'
      exportContainer.style.padding = '40px'
      exportContainer.style.fontFamily = 'inherit'
      
      // Create header
      const header = document.createElement('header')
      header.style.marginBottom = '30px'
      header.style.textAlign = 'center'
      header.style.color = rootStyles.getPropertyValue('--foreground') || '#ffffff'
      header.innerHTML = `
        <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">${title}</h1>
        <p style="font-size: 14px; color: hsl(var(--muted-foreground)); margin: 5px 0;">${subtitle}</p>
        <p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin: 5px 0;">${dateStr}</p>
      `
      
      // Create footer
      const footer = document.createElement('footer')
      footer.style.marginTop = '30px'
      footer.style.textAlign = 'center'
      footer.style.paddingTop = '20px'
      footer.style.borderTop = '1px solid hsl(var(--border))'
      footer.style.color = 'hsl(var(--muted-foreground))'
      footer.innerHTML = `
        <p style="font-size: 11px; margin: 0;">Created by KrashWagers - Property of the OnlyParlays Discord</p>
      `
      
      // Assemble container
      exportContainer.appendChild(header)
      exportContainer.appendChild(clonedCard)
      exportContainer.appendChild(footer)
      
      // Add to DOM (off-screen) so styles are computed
      document.body.appendChild(exportContainer)
      
      // Wait longer for images to fully load
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Capture with html2canvas - use the container's computed background
      const computedBg = window.getComputedStyle(exportContainer).backgroundColor
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: computedBg || '#0a0a0a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        windowWidth: 1200,
        windowHeight: exportContainer.scrollHeight,
      })
      
      // Convert to PNG and download
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${activeView}-vs-opponent-${today.toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()
      
      // Clean up
      document.body.removeChild(exportContainer)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) return <div className="p-6">Loading Player vs Opp data...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  return (
    <div
      className="flex flex-col h-[calc(100vh-3rem-3rem)] gap-1 max-w-[1400px] mx-auto p-3 md:p-4 lg:p-5 w-full"
      style={{ fontSize: '0.9rem' }}
    >
      {/* View Tabs at Top */}
      <div className="border-b border-border">
        <div className="flex items-center overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveView('overall')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'overall'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setActiveView('goals')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'goals'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveView('assists')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'assists'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
            }`}
          >
            Assists
          </button>
          <button
            onClick={() => setActiveView('points')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'points'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setActiveView('shots')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeView === 'shots'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
            }`}
          >
            Shots
          </button>
        </div>
      </div>

      <div
        className="flex-shrink-0 relative z-30 overflow-visible bg-transparent border-2"
        style={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          borderBottomLeftRadius: '6px',
          borderBottomRightRadius: '6px',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <Card
          className="border-0 !rounded-none !shadow-none hover:shadow-none dark:shadow-none !bg-transparent backdrop-blur-0 overflow-visible outline-none ring-0"
          style={{ border: 'none', borderRadius: 0 }}
        >
          <CardContent className="p-3 overflow-visible">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end flex-1">
              <div className="space-y-2 min-w-[260px] relative">
                <Label className="text-sm font-semibold text-foreground">Players</Label>
                <div className="relative">
                  <Input 
                    placeholder="Search players..." 
                    value={playerSearch} 
                    onChange={(e) => {
                      setPlayerSearch(e.target.value)
                      setShowPlayerDropdown(true)
                    }}
                    onFocus={() => {
                      setShowPlayerDropdown(true)
                    }}
                    onBlur={() => {
                      // Delay to allow click on dropdown item
                      setTimeout(() => setShowPlayerDropdown(false), 200)
                    }}
                    className="w-full pl-9 pr-20"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {players.length > 0 ? `${players.length} selected` : 'All'}
                  </div>
                  {showPlayerDropdown && filteredPlayers.length > 0 && (
                    <div className="absolute z-[60] w-full mt-2 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Players</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const next = Array.from(new Set([...players, ...filteredPlayers.map((p) => p.name)]))
                              setPlayers(next)
                            }}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setPlayers([])}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      {filteredPlayers.map((option) => {
                        const isSelected = players.includes(option.name)
                        return (
                          <div
                            key={option.name}
                            className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-3"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setPlayers(isSelected ? players.filter(x => x !== option.name) : [...players, option.name])
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => null}
                              className="h-4 w-4"
                            />
                            <div className="relative h-6 w-6 flex-shrink-0">
                              {option.headshot_url ? (
                                <Image
                                  src={option.headshot_url}
                                  alt={option.name}
                                  width={24}
                                  height={24}
                                  className="h-6 w-6 rounded-full object-cover"
                                  unoptimized
                                />
                              ) : option.team_abbr ? (
                                <Image
                                  src={getNHLTeamLogo(option.team_abbr)}
                                  alt={option.team_abbr}
                                  width={24}
                                  height={24}
                                  className="h-6 w-6 rounded-full"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                                  {option.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className={`text-sm ${isSelected ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                              {option.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 min-w-[220px] relative">
                <Label className="text-sm font-semibold text-foreground">Teams</Label>
                <div className="relative">
                  <Input
                    placeholder="Search teams..."
                    value={teamSearch}
                    onChange={(e) => {
                      setTeamSearch(e.target.value)
                      setShowTeamDropdown(true)
                    }}
                    onFocus={() => setShowTeamDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowTeamDropdown(false), 200)
                    }}
                    className="w-full pl-9 pr-20"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {teams.length > 0 ? `${teams.length} selected` : 'All'}
                  </div>
                  {showTeamDropdown && filteredTeams.length > 0 && (
                    <div className="absolute z-[60] w-full mt-2 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Teams</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setTeams(filteredTeams)}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setTeams([])}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      {filteredTeams.map((team) => {
                        const isSelected = teams.includes(team)
                        return (
                          <div
                            key={team}
                            className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-3"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setTeams(isSelected ? teams.filter((t) => t !== team) : [...teams, team])
                            }}
                          >
                            <input type="checkbox" checked={isSelected} onChange={() => null} className="h-4 w-4" />
                            <div className="relative h-6 w-6 flex-shrink-0">
                              <Image
                                src={getNHLTeamLogo(team)}
                                alt={team}
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded-full"
                              />
                            </div>
                            <span className={`text-sm ${isSelected ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                              {team}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 min-w-[220px] relative">
                <Label className="text-sm font-semibold text-foreground">Positions</Label>
                <div className="relative">
                  <Input
                    placeholder="Search positions..."
                    value={positionSearch}
                    onChange={(e) => {
                      setPositionSearch(e.target.value)
                      setShowPositionDropdown(true)
                    }}
                    onFocus={() => setShowPositionDropdown(true)}
                    onBlur={() => {
                      setTimeout(() => setShowPositionDropdown(false), 200)
                    }}
                    className="w-full pl-9 pr-20"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {positions.length > 0 ? `${positions.length} selected` : 'All'}
                  </div>
                  {showPositionDropdown && filteredPositions.length > 0 && (
                    <div className="absolute z-[60] w-full mt-2 bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Positions</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setPositions(filteredPositions)}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setPositions([])}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      {filteredPositions.map((pos) => {
                        const isSelected = positions.includes(pos)
                        return (
                          <div
                            key={pos}
                            className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-3"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setPositions(isSelected ? positions.filter((p) => p !== pos) : [...positions, pos])
                            }}
                          >
                            <input type="checkbox" checked={isSelected} onChange={() => null} className="h-4 w-4" />
                            <span className={`text-sm ${isSelected ? 'text-foreground font-semibold' : 'text-foreground'}`}>
                              {pos}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 min-w-[140px]">
                <Label className="text-sm font-semibold text-foreground">Min GP</Label>
                <Input 
                  type="number" 
                  min="0" 
                  value={minGP || ''} 
                  onChange={(e) => setMinGP(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="border-2 font-medium hover:bg-destructive/10 hover:border-destructive/50"
              >
                Clear
              </Button>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>

      <div
        className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden bg-transparent border-2"
        style={{
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px',
          borderColor: 'hsl(var(--border))',
        }}
      >
        <Card
          id="player-vs-opp-card"
          className="border-0 flex-1 flex flex-col min-h-0 !rounded-none !shadow-none hover:shadow-none dark:shadow-none !bg-transparent backdrop-blur-0 outline-none ring-0"
          style={{ border: 'none', borderRadius: 0 }}
        >
        <CardContent className="p-0 flex-1 min-h-0">
          <ScrollArea className="h-full w-full [&>[data-radix-scroll-area-viewport]]:scroll-snap-y [&>[data-radix-scroll-area-viewport]]:scroll-snap-mandatory">
            <table id="player-vs-opp-table" className="w-full">
              <thead className="sticky top-0 z-20 bg-muted border-b-2 border-border">
                <tr>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16"></th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="full_name">Player</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="team_abbr">Team</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="opponent_abbr">Opponent</SortButton>
                  </th>
                  <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <SortButton field="position_code">Pos</SortButton>
                  </th>
                  {/* Overall View Columns */}
                  {activeView === 'overall' && (
                    <>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="gp_vs_opp">GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="goals_vs_opp">Goals</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="assists_vs_opp">Assists</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="points_vs_opp">Points</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="shots_on_goal_vs_opp">SOG</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="corsi_vs_opp">Att</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_goals_vs_opp">PP G</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_assists_vs_opp">PP A</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_points_vs_opp">PP P</SortButton>
                      </th>
                    </>
                  )}
                  {/* Goals View Columns */}
                  {activeView === 'goals' && (
                    <>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="gp_vs_opp">GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="goals_vs_opp">Goals</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="goals_per_game_vs_opp">G/GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_goals_vs_opp">PP G</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_goals_per_game_vs_opp">PP G/GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_goals_ge1">1+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_goals_ge2">2+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_goals_ge3">3+</SortButton>
                      </th>
                    </>
                  )}
                  {/* Assists View Columns */}
                  {activeView === 'assists' && (
                    <>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="gp_vs_opp">GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="assists_vs_opp">Assists</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="assists_per_game_vs_opp">A/GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_assists_vs_opp">PP A</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_assists_per_game_vs_opp">PP A/GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_assists_ge1">1+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_assists_ge2">2+</SortButton>
                      </th>
                    </>
                  )}
                  {/* Points View Columns */}
                  {activeView === 'points' && (
                    <>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="gp_vs_opp">GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="points_vs_opp">Points</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="points_per_game_vs_opp">P/GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_points_vs_opp">PP P</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="pp_points_per_game_vs_opp">PP P/GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_points_ge1">1+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_points_ge2">2+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_points_ge3">3+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_points_ge4">4+</SortButton>
                      </th>
                    </>
                  )}
                  {/* Shots View Columns */}
                  {activeView === 'shots' && (
                    <>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="gp_vs_opp">GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="shots_on_goal_vs_opp">SOG</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="shots_on_goal_per_game_vs_opp">SOG/GP</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_shots_ge1">1+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_shots_ge2">2+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_shots_ge3">3+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_shots_ge4">4+</SortButton>
                      </th>
                      <th className="text-left p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        <SortButton field="games_shots_ge5">5+</SortButton>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => {
                  return (
                    <tr 
                      key={`${row.player_id ?? 'player'}-${row.opponent_abbr ?? 'opp'}-${idx}`}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-150 group scroll-snap-align-start cursor-pointer"
                      onClick={() => {
                        setSelectedRow(row)
                        setIsDialogOpen(true)
                      }}
                    >
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {row.player_id && (
                            <Link href={`/nhl/prop-lab/${row.player_id}`} onClick={(event) => event.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <Beaker className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-shrink-0 w-10 h-10">
                            {row.headshot_url ? (
                              <Image
                                src={row.headshot_url}
                                alt={row.full_name || ''}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                                unoptimized
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = `<div class="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">${row.full_name?.charAt(0) || '?'}</div>`
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                {row.full_name?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {row.full_name ? (() => {
                              const nameParts = row.full_name.split(' ')
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
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {row.team_abbr && (
                            <Image
                              src={getNHLTeamLogo(row.team_abbr)}
                              alt={row.team_abbr}
                              width={24}
                              height={24}
                              className="rounded"
                            />
                          )}
                          <span className="text-sm font-medium text-foreground">{row.team_abbr}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {row.opponent_abbr && (
                            <Image
                              src={getNHLTeamLogo(row.opponent_abbr)}
                              alt={row.opponent_abbr}
                              width={24}
                              height={24}
                              className="rounded"
                            />
                          )}
                          <span className="text-sm font-medium text-foreground">{row.opponent_abbr}</span>
                        </div>
                      </td>
                      <td className="p-2 text-sm font-medium text-foreground">
                        {row.position_code ? (() => {
                          const mapping: Record<string, string> = {
                            'L': 'LW',
                            'C': 'C',
                            'R': 'RW',
                            'D': 'D'
                          }
                          return mapping[row.position_code] || row.position_code
                        })() : '-'}
                      </td>
                      {/* Overall View Cells */}
                      {activeView === 'overall' && (
                        <>
                          <td className="p-2 text-sm font-semibold text-foreground">{formatNumber(row.gp_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.goals_vs_opp, 'goals')}`}>{formatNumber(row.goals_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.assists_vs_opp, 'assists')}`}>{formatNumber(row.assists_vs_opp)}</td>
                          <td className={`p-2 text-sm font-semibold ${getValueColor(row.points_vs_opp, 'points')}`}>{formatNumber(row.points_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.shots_on_goal_vs_opp, 'shots')}`}>{formatNumber(row.shots_on_goal_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatNumber(row.corsi_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_goals_vs_opp, 'pp')}`}>{formatNumber(row.pp_goals_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_assists_vs_opp, 'pp')}`}>{formatNumber(row.pp_assists_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_points_vs_opp, 'pp')}`}>{formatNumber(row.pp_points_vs_opp)}</td>
                        </>
                      )}
                      {/* Goals View Cells */}
                      {activeView === 'goals' && (
                        <>
                          <td className="p-2 text-sm font-semibold text-foreground">{formatNumber(row.gp_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.goals_vs_opp, 'goals')}`}>{formatNumber(row.goals_vs_opp)}</td>
                          <td className={`p-2 text-sm font-semibold ${getValueColor(row.goals_per_game_vs_opp, 'perGame')}`}>{formatPerGame(row.goals_per_game_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_goals_vs_opp, 'pp')}`}>{formatNumber(row.pp_goals_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_goals_per_game_vs_opp, 'perGame')}`}>{formatPerGame(row.pp_goals_per_game_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_goals_ge1, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_goals_ge2, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_goals_ge3, row.gp_vs_opp)}</td>
                        </>
                      )}
                      {/* Assists View Cells */}
                      {activeView === 'assists' && (
                        <>
                          <td className="p-2 text-sm font-semibold text-foreground">{formatNumber(row.gp_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.assists_vs_opp, 'assists')}`}>{formatNumber(row.assists_vs_opp)}</td>
                          <td className={`p-2 text-sm font-semibold ${getValueColor(row.assists_per_game_vs_opp, 'perGame')}`}>{formatPerGame(row.assists_per_game_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_assists_vs_opp, 'pp')}`}>{formatNumber(row.pp_assists_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_assists_per_game_vs_opp, 'perGame')}`}>{formatPerGame(row.pp_assists_per_game_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_assists_ge1, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_assists_ge2, row.gp_vs_opp)}</td>
                        </>
                      )}
                      {/* Points View Cells */}
                      {activeView === 'points' && (
                        <>
                          <td className="p-2 text-sm font-semibold text-foreground">{formatNumber(row.gp_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.points_vs_opp, 'points')}`}>{formatNumber(row.points_vs_opp)}</td>
                          <td className={`p-2 text-sm font-semibold ${getValueColor(row.points_per_game_vs_opp, 'perGame')}`}>{formatPerGame(row.points_per_game_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_points_vs_opp, 'pp')}`}>{formatNumber(row.pp_points_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.pp_points_per_game_vs_opp, 'perGame')}`}>{formatPerGame(row.pp_points_per_game_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_points_ge1, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_points_ge2, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_points_ge3, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_points_ge4, row.gp_vs_opp)}</td>
                        </>
                      )}
                      {/* Shots View Cells */}
                      {activeView === 'shots' && (
                        <>
                          <td className="p-2 text-sm font-semibold text-foreground">{formatNumber(row.gp_vs_opp)}</td>
                          <td className={`p-2 text-sm font-medium ${getValueColor(row.shots_on_goal_vs_opp, 'shots')}`}>{formatNumber(row.shots_on_goal_vs_opp)}</td>
                          <td className={`p-2 text-sm font-semibold ${getValueColor(row.shots_on_goal_per_game_vs_opp, 'perGame')}`}>{formatPerGame(row.shots_on_goal_per_game_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_shots_ge1, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_shots_ge2, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_shots_ge3, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_shots_ge4, row.gp_vs_opp)}</td>
                          <td className="p-2 text-sm font-medium text-foreground">{formatGamesWithPercent(row.games_shots_ge5, row.gp_vs_opp)}</td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ScrollArea>
          <div className="p-4 border-t border-border text-xs text-muted-foreground italic text-center">
            * Data includes regular season games only, since the 2022-23 season
          </div>
        </CardContent>
        </Card>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedRow(null)
        }}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/60 backdrop-blur-md" />
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-[1200px] translate-x-[-50%] translate-y-[-50%] focus:outline-none"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]/70 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_45%)]" />

              <div className="relative grid grid-cols-[1fr_2fr] gap-6 p-6">
                <div className="space-y-5">
                  <div className="relative w-full rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="relative">
                        <div className="h-36 w-36 overflow-hidden rounded-3xl border border-white/15 bg-black/40 shadow-lg">
                          {selectedRow?.headshot_url ? (
                            <Image
                              src={selectedRow.headshot_url}
                              alt={selectedRow.full_name || 'Player'}
                              width={144}
                              height={144}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                              {selectedRow?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        {selectedRow?.team_abbr && (
                          <div className="absolute -bottom-4 -right-4 rounded-full border border-white/20 bg-black/70 p-2 shadow-xl">
                            <Image
                              src={getNHLTeamLogo(selectedRow.team_abbr)}
                              alt={selectedRow.team_abbr}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-2xl font-semibold text-foreground">{selectedRow?.full_name || '-'}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedRow?.position_code || '-'} · #{selectedRow?.jersey_number || '-'} · {selectedRow?.shoots_catches || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Matchup</div>
                    <div className="flex items-center gap-3 text-lg font-semibold text-foreground">
                      {selectedRow?.team_abbr && (
                        <Image
                          src={getNHLTeamLogo(selectedRow.team_abbr)}
                          alt={selectedRow.team_abbr}
                          width={28}
                          height={28}
                          className="rounded"
                        />
                      )}
                      <span>{selectedRow?.team_abbr || '-'}</span>
                      <span className="text-muted-foreground">vs</span>
                      {selectedRow?.opponent_abbr && (
                        <Image
                          src={getNHLTeamLogo(selectedRow.opponent_abbr)}
                          alt={selectedRow.opponent_abbr}
                          width={28}
                          height={28}
                          className="rounded"
                        />
                      )}
                      <span>{selectedRow?.opponent_abbr || '-'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(selectedRow?.gp_vs_opp ?? null)} GP vs opponent
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Summary</div>
                      <div className="text-xs text-muted-foreground">Totals vs Opponent</div>
                    </div>
                    <div className="mt-3 grid grid-cols-6 gap-3 text-center">
                      <div>
                        <div className="text-xs text-muted-foreground">GP</div>
                        <div className="text-lg font-semibold text-foreground">{formatNumber(selectedRow?.gp_vs_opp ?? null)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">G</div>
                        <div className="text-lg font-semibold text-foreground">{formatNumber(selectedRow?.goals_vs_opp ?? null)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">A</div>
                        <div className="text-lg font-semibold text-foreground">{formatNumber(selectedRow?.assists_vs_opp ?? null)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">P</div>
                        <div className="text-lg font-semibold text-foreground">{formatNumber(selectedRow?.points_vs_opp ?? null)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">SOG</div>
                        <div className="text-lg font-semibold text-foreground">{formatNumber(selectedRow?.shots_on_goal_vs_opp ?? null)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">SOG/GP</div>
                        <div className="text-lg font-semibold text-foreground">{formatPerGame(selectedRow?.shots_on_goal_per_game_vs_opp ?? null)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Best Game</div>
                      </div>
                    {bestGame ? (
                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-muted-foreground">{bestGame.game_date || '-'}</div>
                          <div className="flex items-center gap-2 text-sm text-foreground">
                            <span className="text-muted-foreground">{getVenueLabel(bestGame, selectedRow?.team_abbr || null)}</span>
                            {getOpponentAbbr(bestGame, selectedRow?.team_abbr || null) && (
                              <Image
                                src={getNHLTeamLogo(getOpponentAbbr(bestGame, selectedRow?.team_abbr || null))}
                                alt={getOpponentAbbr(bestGame, selectedRow?.team_abbr || null) || ''}
                                width={18}
                                height={18}
                                className="rounded"
                              />
                            )}
                            <span className="font-semibold">
                              {getOpponentAbbr(bestGame, selectedRow?.team_abbr || null) || '-'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-foreground">
                          <span>G {formatNumber(bestGame.goals)}</span>
                          <span>A {formatNumber(bestGame.assists)}</span>
                          <span>SOG {formatNumber(bestGame.shots_on_goal)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-sm text-muted-foreground">No gamelogs available.</div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">Game Logs</div>
                      <div className="text-xs text-muted-foreground">Last 10 vs opponent</div>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto rounded-lg border border-white/5">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10 bg-[#121212]/95 text-muted-foreground uppercase tracking-wide">
                          <tr className="border-b border-white/10">
                            <th className="text-left px-3 py-2">Date</th>
                            <th className="text-left px-3 py-2">Team</th>
                            <th className="text-left px-3 py-2">Opponent</th>
                            <th className="text-right px-3 py-2">G</th>
                            <th className="text-right px-3 py-2">A</th>
                            <th className="text-right px-3 py-2">P</th>
                            <th className="text-right px-3 py-2">SOG</th>
                            <th className="text-right px-3 py-2">Att</th>
                            <th className="text-right px-3 py-2">PP G</th>
                            <th className="text-right px-3 py-2">PP A</th>
                            <th className="text-right px-3 py-2">PP P</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedRow?.gamelogs ?? [])
                            .map((log, logIndex) => {
                              const teamAbbr = selectedRow?.team_abbr || null
                              const opponentAbbr = getOpponentAbbr(log, teamAbbr)
                              const venueLabel = getVenueLabel(log, teamAbbr)

                              return (
                                <tr
                                  key={`${log.game_id ?? 'game'}-${logIndex}`}
                                  className="border-b border-white/10 odd:bg-white/5"
                                >
                                  <td className="px-3 py-2 text-muted-foreground">{log.game_date || '-'}</td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      {teamAbbr && (
                                        <Image
                                          src={getNHLTeamLogo(teamAbbr)}
                                          alt={teamAbbr}
                                          width={16}
                                          height={16}
                                          className="rounded"
                                        />
                                      )}
                                      <span className="font-medium text-foreground">{teamAbbr || '-'}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2 text-foreground">
                                      <span className="text-muted-foreground">{venueLabel}</span>
                                      {opponentAbbr && (
                                        <Image
                                          src={getNHLTeamLogo(opponentAbbr)}
                                          alt={opponentAbbr}
                                          width={16}
                                          height={16}
                                          className="rounded"
                                        />
                                      )}
                                      <span className="font-medium">{opponentAbbr || '-'}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.goals)}</td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.assists)}</td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.points)}</td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.shots_on_goal)}</td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.corsi)}</td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.pp_goals)}</td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.pp_assists)}</td>
                                  <td className="px-3 py-2 text-right">{formatNumber(log.pp_points)}</td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  )
}

