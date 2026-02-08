"use client"

import * as React from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Search, Users, Trophy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useActiveSportId } from "@/hooks/use-active-sport"

type SportId = "nfl" | "nhl" | "nba" | "mlb"

type PlayerResult = {
  type: "player"
  id: string
  name: string
  teamAbbr?: string | null
  headshotUrl?: string | null
}

type TeamResult = {
  type: "team"
  abbr: string
  name: string
  logoUrl: string
}

type SearchResult = PlayerResult | TeamResult

const sportsByPath: { id: SportId; root: string; label: string }[] = [
  { id: "nfl", root: "/nfl", label: "NFL" },
  { id: "nhl", root: "/nhl", label: "NHL" },
  { id: "nba", root: "/nba", label: "NBA" },
  { id: "mlb", root: "/mlb", label: "MLB" },
]

const nhlTeams: TeamResult[] = [
  { type: "team", abbr: "ANA", name: "Anaheim Ducks", logoUrl: "/Images/NHL_Logos/ANA.png" },
  { type: "team", abbr: "BOS", name: "Boston Bruins", logoUrl: "/Images/NHL_Logos/BOS.png" },
  { type: "team", abbr: "BUF", name: "Buffalo Sabres", logoUrl: "/Images/NHL_Logos/BUF.png" },
  { type: "team", abbr: "CAR", name: "Carolina Hurricanes", logoUrl: "/Images/NHL_Logos/CAR.png" },
  { type: "team", abbr: "CBJ", name: "Columbus Blue Jackets", logoUrl: "/Images/NHL_Logos/CBJ.png" },
  { type: "team", abbr: "CGY", name: "Calgary Flames", logoUrl: "/Images/NHL_Logos/CGY.png" },
  { type: "team", abbr: "CHI", name: "Chicago Blackhawks", logoUrl: "/Images/NHL_Logos/CHI.png" },
  { type: "team", abbr: "COL", name: "Colorado Avalanche", logoUrl: "/Images/NHL_Logos/COL.png" },
  { type: "team", abbr: "DAL", name: "Dallas Stars", logoUrl: "/Images/NHL_Logos/DAL.png" },
  { type: "team", abbr: "DET", name: "Detroit Red Wings", logoUrl: "/Images/NHL_Logos/DET.png" },
  { type: "team", abbr: "EDM", name: "Edmonton Oilers", logoUrl: "/Images/NHL_Logos/EDM.png" },
  { type: "team", abbr: "FLA", name: "Florida Panthers", logoUrl: "/Images/NHL_Logos/FLA.png" },
  { type: "team", abbr: "LAK", name: "Los Angeles Kings", logoUrl: "/Images/NHL_Logos/LAK.png" },
  { type: "team", abbr: "MIN", name: "Minnesota Wild", logoUrl: "/Images/NHL_Logos/MIN.png" },
  { type: "team", abbr: "MTL", name: "Montreal Canadiens", logoUrl: "/Images/NHL_Logos/MTL.png" },
  { type: "team", abbr: "NJD", name: "New Jersey Devils", logoUrl: "/Images/NHL_Logos/NJD.png" },
  { type: "team", abbr: "NSH", name: "Nashville Predators", logoUrl: "/Images/NHL_Logos/NSH.png" },
  { type: "team", abbr: "NYI", name: "New York Islanders", logoUrl: "/Images/NHL_Logos/NYI.png" },
  { type: "team", abbr: "NYR", name: "New York Rangers", logoUrl: "/Images/NHL_Logos/NYR.png" },
  { type: "team", abbr: "OTT", name: "Ottawa Senators", logoUrl: "/Images/NHL_Logos/OTT.png" },
  { type: "team", abbr: "PHI", name: "Philadelphia Flyers", logoUrl: "/Images/NHL_Logos/PHI.png" },
  { type: "team", abbr: "PIT", name: "Pittsburgh Penguins", logoUrl: "/Images/NHL_Logos/PIT.png" },
  { type: "team", abbr: "SEA", name: "Seattle Kraken", logoUrl: "/Images/NHL_Logos/SEA.png" },
  { type: "team", abbr: "SJS", name: "San Jose Sharks", logoUrl: "/Images/NHL_Logos/SJS.png" },
  { type: "team", abbr: "STL", name: "St. Louis Blues", logoUrl: "/Images/NHL_Logos/STL.png" },
  { type: "team", abbr: "TB", name: "Tampa Bay Lightning", logoUrl: "/Images/NHL_Logos/TB.png" },
  { type: "team", abbr: "TOR", name: "Toronto Maple Leafs", logoUrl: "/Images/NHL_Logos/TOR.png" },
  { type: "team", abbr: "UTA", name: "Utah Hockey Club", logoUrl: "/Images/NHL_Logos/UTA.png" },
  { type: "team", abbr: "VAN", name: "Vancouver Canucks", logoUrl: "/Images/NHL_Logos/VAN.png" },
  { type: "team", abbr: "VGK", name: "Vegas Golden Knights", logoUrl: "/Images/NHL_Logos/VGK.png" },
  { type: "team", abbr: "WPG", name: "Winnipeg Jets", logoUrl: "/Images/NHL_Logos/WPG.png" },
  { type: "team", abbr: "WSH", name: "Washington Capitals", logoUrl: "/Images/NHL_Logos/WSH.png" },
]

const createDefaultProp = (playerId: string, playerName: string) => ({
  propName: "Goals",
  line: 0.5,
  ou: "Over",
  playerId,
  playerName,
})

const createDefaultNFLProp = (playerId: string, playerName: string) => ({
  propName: "Passing Yards",
  line: 0.5,
  ou: "Over",
  playerId,
  playerName,
})

export function GlobalSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const { activeSportId } = useActiveSportId(pathname)
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"all" | "players" | "teams">("all")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)

  const activeSport = React.useMemo(() => {
    return (
      sportsByPath.find((sport) => sport.id === (activeSportId ?? "nfl")) ??
      sportsByPath[0]
    )
  }, [activeSportId])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setActiveTab("all")
    }
  }, [open])

  React.useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        if (activeSport.id === "nhl") {
          const [playersResponse] = await Promise.all([
            fetch(`/api/nhl/players?search=${encodeURIComponent(trimmed)}`),
          ])
          if (!playersResponse.ok) {
            throw new Error(`NHL players search failed: ${playersResponse.status}`)
          }
          const playersJson = await playersResponse.json()
          if (playersJson?.success === false) {
            throw new Error(playersJson?.message || "NHL players search failed")
          }
          const playerResults: PlayerResult[] = (playersJson.data || []).map(
            (player: {
              player_id?: number | string
              player_name?: string
              player_team_abbrev?: string
              headshot_url?: string
            }) => ({
              type: "player",
              id: String(player.player_id ?? ""),
              name: player.player_name ?? "Unknown Player",
              teamAbbr: player.player_team_abbrev,
              headshotUrl: player.headshot_url ?? null,
            })
          )

          const teamResults = nhlTeams.filter((team) => {
            const term = trimmed.toLowerCase()
            return (
              team.name.toLowerCase().includes(term) ||
              team.abbr.toLowerCase().includes(term)
            )
          })

          setResults([...playerResults, ...teamResults])
        } else if (activeSport.id === "nfl") {
          const playersResponse = await fetch(`/api/nfl/players?search=${encodeURIComponent(trimmed)}`)
          if (!playersResponse.ok) {
            throw new Error(`NFL players search failed: ${playersResponse.status}`)
          }
          const playersJson = await playersResponse.json()
          if (playersJson?.success === false) {
            throw new Error(playersJson?.message || "NFL players search failed")
          }
          const playerResults: PlayerResult[] = (playersJson.data || []).map(
            (player: {
              player_id?: number | string
              player_name?: string
              team?: string
            }) => ({
              type: "player",
              id: String(player.player_id ?? ""),
              name: player.player_name ?? "Unknown Player",
              teamAbbr: player.team,
              headshotUrl: null,
            })
          )
          setResults(playerResults)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error("[global-search] failed to fetch results", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeout)
  }, [query, activeSport.id])

  const filteredResults = React.useMemo(() => {
    if (activeTab === "players") {
      return results.filter((result) => result.type === "player")
    }
    if (activeTab === "teams") {
      return results.filter((result) => result.type === "team")
    }
    return results
  }, [activeTab, results])

  const handlePlayerSelect = (player: PlayerResult) => {
    if (activeSport.id === "nhl") {
      sessionStorage.setItem("selectedNHLProp", JSON.stringify(createDefaultProp(player.id, player.name)))
      router.push(`/nhl/prop-lab/${player.id}`)
    } else if (activeSport.id === "nfl") {
      sessionStorage.setItem("selectedProp", JSON.stringify(createDefaultNFLProp(player.id, player.name)))
      router.push(`/nfl/prop-lab/${player.id}`)
    }
    setOpen(false)
  }

  const handleTeamSelect = (team: TeamResult) => {
    if (activeSport.id === "nhl") {
      router.push(`/nhl/tools/team-gamelogs?team=${team.abbr}`)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-[220px] justify-between bg-card border-border text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4" />
            Search KrashBoard
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <Card className="w-full max-w-xl border-0 bg-transparent shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${activeSport.label} players or teams`}
                className="h-9 border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              {[
                { id: "all", label: "All", icon: Search },
                { id: "players", label: "Players", icon: Users },
                { id: "teams", label: "Teams", icon: Trophy },
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <Button
                    key={tab.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab(tab.id as "all" | "players" | "teams")}
                    className={`h-8 gap-2 border-border ${isActive ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>

            <div className="mt-4 max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {loading && (
                <div className="rounded-lg border border-border bg-muted/80 px-3 py-2 text-sm text-muted-foreground">
                  Searching {activeSport.label}…
                </div>
              )}
              {!loading && query.trim().length < 2 && (
                <div className="rounded-lg border border-border bg-muted/80 px-3 py-2 text-sm text-muted-foreground">
                  Start typing to search {activeSport.label} players or teams.
                </div>
              )}
              {!loading && query.trim().length >= 2 && filteredResults.length === 0 && (
                <div className="rounded-lg border border-border bg-muted/80 px-3 py-2 text-sm text-muted-foreground">
                  No results for “{query}”.
                </div>
              )}

              {filteredResults.map((result) => {
                if (result.type === "player") {
                  return (
                    <button
                      key={`player-${result.id}`}
                      onClick={() => handlePlayerSelect(result)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/80 px-3 py-2 text-left transition hover:bg-muted hover:border-border"
                    >
                      <div className="h-9 w-9 overflow-hidden rounded-full border border-border bg-background">
                        {result.headshotUrl ? (
                          <Image
                            src={result.headshotUrl}
                            alt={result.name}
                            width={36}
                            height={36}
                            className="h-9 w-9 object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center text-xs text-muted-foreground">
                            {activeSport.label}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{result.name}</div>
                        {result.teamAbbr && (
                          <div className="text-xs text-muted-foreground">{result.teamAbbr}</div>
                        )}
                      </div>
                      <span className="rounded-button border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        Player
                      </span>
                    </button>
                  )
                }

                return (
                  <button
                    key={`team-${result.abbr}`}
                    onClick={() => handleTeamSelect(result)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-muted/80 px-3 py-2 text-left transition hover:bg-muted hover:border-border"
                  >
                    <Image
                      src={result.logoUrl}
                      alt={result.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{result.name}</div>
                      <div className="text-xs text-muted-foreground">{result.abbr}</div>
                    </div>
                    <span className="rounded-button border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      Team
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
