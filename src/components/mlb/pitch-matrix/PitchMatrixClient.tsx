"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import mlbTeamColors from "@/data/mlb-team-colors.json"

type MlbLineupsTeam = {
  teamAbv: string
  teamLogo: string | null
  expectedStarterName: string | null
  headshotUrl: string | null
}

type MlbLineupsGame = {
  gameId: string
  gameDate: string | null
  gameDateLabel: string | null
  gameTimeEst: string | null
  homeTeam: MlbLineupsTeam | null
  awayTeam: MlbLineupsTeam | null
}

type MlbLineupsResponse = {
  updatedAt: string
  games: MlbLineupsGame[]
}

type BvpPitch = {
  pitch_type: string | null
  usage_pct: number | string | null
  comb_avg_pctile: number | string | null
  comb_hr_pctile: number | string | null
  comb_barrel_pctile: number | string | null
  comb_hh_pctile: number | string | null
}

type BvpPitcher = {
  pitcher: number | string | null
  pitcher_name: string | null
  pitcher_mlbHeadshot?: string | null
  pitcher_espnHeadshot?: string | null
  expected_starter: number | string | null
  starter_position: string | null
  p_throws: string | null
  pitches: BvpPitch[] | null
}

type BvpStand = {
  stand: string | null
  pitchers: BvpPitcher[] | null
}

type BvpBatter = {
  batter: number | string | null
  batter_name: string | null
  batter_mlbHeadshot?: string | null
  batter_espnHeadshot?: string | null
  stands: BvpStand[] | null
}

type BvpTeamPayload = {
  game_date: string | { value?: string } | null
  gameID: string | null
  batter_team: string | null
  pitcher_team: string | null
  team_logo: string | null
  opponent_logo: string | null
  batters: BvpBatter[] | null
}

type BatterRow = {
  batterId: string
  batterName: string
  batterHeadshot: string | null
  stand: string
  pitchScores: Record<string, number | null>
  overallScore: number | null
}

/** One row for Batter tab: batter vs pitcher matchup with OVR and per-pitch data */
type BatterVsPitcherRow = {
  batterId: string
  batterName: string
  batterHeadshot: string | null
  batterTeam: string | null
  pitcherId: string
  pitcherName: string
  pitcherHeadshot: string | null
  pitcherTeam: string | null
  stand: string
  overallScore: number | null
  starterPosition: string | null
  expectedStarter: number | null
  /** Pitch types this pitcher throws (usage order). */
  pitchOrder: string[]
  /** Pitcher's usage per pitch type (0–1). */
  pitchUsage: Record<string, number | null>
  /** Batter vs this pitch rating (percentile). */
  pitchRatings: Record<string, number | null>
}

type PitcherFilter = "all" | "starters" | "relievers"

const TAB_ITEMS = ["Matchups", "Batter", "Pitcher", "H2H"] as const

/** All 30 MLB team abbreviations matching public/Images/MLB_Logos/{ABBR}.png */
const MLB_TEAM_ABBREVS = [
  "ARI", "ATL", "BAL", "BOS", "CHC", "CHW", "CIN", "CLE", "COL", "DET",
  "HOU", "KCR", "LAA", "LAD", "MIA", "MIL", "MIN", "NYM", "NYY", "OAK",
  "PHI", "PIT", "SDP", "SEA", "SFG", "STL", "TBR", "TEX", "TOR", "WSN",
] as const

/** Map API/lineup team abbr to logo-filename abbr for scroll id and logo path */
const TEAM_ABBR_TO_LOGO: Record<string, string> = {
  KC: "KCR", SD: "SDP", SF: "SFG", TB: "TBR", WSH: "WSN", WAS: "WSN", WA: "WSN",
}
const toLogoAbbr = (teamAbv: string | null | undefined): string | null => {
  if (!teamAbv) return null
  const u = teamAbv.toUpperCase()
  return TEAM_ABBR_TO_LOGO[u] ?? u
}

/** Map logo-filename abbr to mlb-team-colors key (for getTeamLogoColor) */
const LOGO_ABBR_TO_COLOR_KEY: Record<string, string> = {
  KCR: "KC", SDP: "SD", SFG: "SF", TBR: "TB", WSN: "WSH",
}
const toColorKey = (logoAbbr: string): string =>
  LOGO_ABBR_TO_COLOR_KEY[logoAbbr] ?? logoAbbr

type PitchLabelEntry = {
  raw: string
  label: string
  name: string
}

const PITCH_LABELS: PitchLabelEntry[] = [
  { raw: "FF", label: "4SM", name: "4-Seam Fastball" },
  { raw: "SI", label: "SI", name: "Sinker" },
  { raw: "FC", label: "CT", name: "Cutter" },
  { raw: "FS", label: "SPL", name: "Splitter" },
  { raw: "FA", label: "FB", name: "Fastball (Generic)" },
  { raw: "SL", label: "SL", name: "Slider" },
  { raw: "CU", label: "CU", name: "Curveball" },
  { raw: "KC", label: "KC", name: "Knuckle-Curve" },
  { raw: "CS", label: "SC", name: "Slow Curve" },
  { raw: "CH", label: "CH", name: "Changeup" },
  { raw: "FO", label: "FK", name: "Forkball" },
  { raw: "SC", label: "SCW", name: "Screwball" },
  { raw: "SV", label: "SLV", name: "Slurve" },
  { raw: "ST", label: "SW", name: "Sweeper" },
  { raw: "KN", label: "KN", name: "Knuckleball" },
  { raw: "EP", label: "EP", name: "Eephus" },
  { raw: "PO", label: "PO", name: "Pitch Out" },
  { raw: "UN", label: "UN", name: "Unknown" },
  { raw: "UNK", label: "UNK", name: "Unknown" },
]

const pitchLabelMap = new Map(PITCH_LABELS.map((entry) => [entry.raw, entry]))

const getPitchLabel = (pitchType: string | null) => {
  if (!pitchType) return "-"
  return pitchLabelMap.get(pitchType)?.label ?? pitchType
}

const getPitchFullName = (pitchType: string | null) => {
  if (!pitchType) return ""
  return pitchLabelMap.get(pitchType)?.name ?? ""
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === "number" && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeUsage = (value: number | null): number | null => {
  if (value == null) return null
  if (value > 1) return value / 100
  return value
}

const formatPercent = (value: number | null) => {
  if (value == null) return "-"
  return `${value.toFixed(0)}%`
}

/** Google Sheets–style: cell background from default (low) to brand blue (high). Returns inline style. */
const getCellBackgroundStyle = (
  value: number | null,
  scale: "percent" | "usage"
): React.CSSProperties => {
  if (value == null) return {}
  const intensity = scale === "usage" ? value : Math.max(0, Math.min(100, value)) / 100
  const opacity = intensity * 0.32
  return { backgroundColor: `hsl(var(--primary) / ${opacity})` }
}

const getPitchValueClass = (value: number | null) =>
  `text-sm tabular-nums text-foreground`
const getOvrValueClass = (value: number | null) =>
  `font-bold tabular-nums text-foreground`
const getUsageValueClass = (value: number | null) =>
  `text-sm tabular-nums text-foreground`

type TeamColorEntry = {
  teamAbv: string
  primary: string
  secondary: string
  logoBg?: "primary" | "secondary"
  logoBgColor?: string
}

const teamColorMap = new Map(
  (mlbTeamColors as TeamColorEntry[]).map((entry) => [entry.teamAbv, entry])
)

const getTeamLogoColor = (teamAbv: string): string => {
  const entry = teamColorMap.get(teamAbv)
  if (!entry) return "hsl(var(--muted))"
  if (entry.logoBgColor) return entry.logoBgColor
  return entry.logoBg === "primary" ? entry.primary : entry.secondary
}

type WeightMode = "avg" | "hr"

const WEIGHTS_BY_MODE: Record<WeightMode, [number, number, number, number]> = {
  avg: [5, 4, 3, 3],
  hr: [2, 5, 4, 4],
}

const computePitchScore = (
  pitch: BvpPitch,
  mode: WeightMode
): number | null => {
  const avg = toNumber(pitch.comb_avg_pctile)
  const hr = toNumber(pitch.comb_hr_pctile)
  const barrel = toNumber(pitch.comb_barrel_pctile)
  const hh = toNumber(pitch.comb_hh_pctile)
  if (avg == null || hr == null || barrel == null || hh == null) return null
  const [wAvg, wHr, wBarrel, wHh] = WEIGHTS_BY_MODE[mode]
  const total = wAvg + wHr + wBarrel + wHh
  return (avg * wAvg + hr * wHr + barrel * wBarrel + hh * wHh) / total
}

const computeOverallFromPitches = (slots: PitchSlot[], mode: WeightMode) => {
  let totalWeighted = 0
  let totalUsage = 0

  slots.forEach((slot) => {
    if (!slot) return
    const score = computePitchScore(slot, mode)
    if (score == null) return
    const usage = normalizeUsage(toNumber(slot.usage_pct)) ?? 0
    totalWeighted += score * usage
    totalUsage += usage
  })

  return totalUsage > 0 ? totalWeighted / totalUsage : null
}

const getHeadshotUrl = (primary?: string | null, fallback?: string | null) =>
  primary || fallback || null

const useLineupsData = () => {
  const [data, setData] = React.useState<MlbLineupsResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/mlb/lineups")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to load lineups")
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lineups")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { data, loading, error }
}

const useTeamPayloads = (games: MlbLineupsGame[]) => {
  const [payloads, setPayloads] = React.useState<Record<string, BvpTeamPayload>>({})
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!games.length) return
    const load = async () => {
      setLoading(true)
      const requests: Array<Promise<[string, BvpTeamPayload | null]>> = []
      const seen = new Set<string>()

      games.forEach((game) => {
        const date = game.gameDate ?? null
        if (!date) return
        const teams = [game.awayTeam?.teamAbv, game.homeTeam?.teamAbv].filter(Boolean) as string[]
        teams.forEach((team) => {
          const cacheKey = `${team}-${date}`
          if (seen.has(cacheKey)) return
          seen.add(cacheKey)
          requests.push(
            fetch(`/api/mlb/bvp/team?team=${team}&date=${date}`)
              .then(async (res) => {
                if (!res.ok) return [cacheKey, null] as [string, BvpTeamPayload | null]
                const json = (await res.json()) as BvpTeamPayload
                return [cacheKey, json] as [string, BvpTeamPayload | null]
              })
              .catch(() => [cacheKey, null] as [string, BvpTeamPayload | null])
          )
        })
      })

      const entries = await Promise.all(requests)
      setPayloads((prev) => {
        const next = { ...prev }
        entries.forEach(([key, value]) => {
          if (value) next[key] = value
        })
        return next
      })
      setLoading(false)
    }

    load()
  }, [games])

  return { payloads, loading }
}

const buildExpectedStartersByStand = (payload: BvpTeamPayload) => {
  const standMap = new Map<string, Map<string, { pitcher: BvpPitcher; count: number }>>()

  payload.batters?.forEach((batter) => {
    batter.stands?.forEach((stand) => {
      const standKey = (stand.stand ?? "").toUpperCase()
      if (!standKey) return
      stand.pitchers?.forEach((pitcher) => {
        const expected = toNumber(pitcher.expected_starter)
        if (expected !== 1) return
        const pitcherKey = String(pitcher.pitcher ?? pitcher.pitcher_name ?? "")
        if (!pitcherKey) return
        if (!standMap.has(standKey)) standMap.set(standKey, new Map())
        const standPitchers = standMap.get(standKey)!
        const current = standPitchers.get(pitcherKey)
        standPitchers.set(pitcherKey, {
          pitcher,
          count: (current?.count ?? 0) + 1,
        })
      })
    })
  })

  const results = new Map<string, BvpPitcher>()
  standMap.forEach((pitchers, stand) => {
    const sorted = Array.from(pitchers.values()).sort((a, b) => b.count - a.count)
    if (sorted[0]?.pitcher) results.set(stand, sorted[0].pitcher)
  })

  return results
}

const USAGE_MIN_PCT = 0.05
const PITCH_SLOT_COUNT = 5

/** Qualified pitches (usage >= 5%), sorted by usage desc. */
const getPitchColumns = (pitcher: BvpPitcher | undefined) => {
  const pitches = pitcher?.pitches ?? []
  return [...pitches]
    .filter((pitch) => pitch.pitch_type)
    .filter((pitch) => (normalizeUsage(toNumber(pitch.usage_pct)) ?? 0) >= USAGE_MIN_PCT)
    .sort((a, b) => {
      const aUsage = normalizeUsage(toNumber(a.usage_pct)) ?? 0
      const bUsage = normalizeUsage(toNumber(b.usage_pct)) ?? 0
      return bUsage - aUsage
    })
}

/** Always 5 slots: qualified pitches (usage >= 5%) in order, then null. */
type PitchSlot = BvpPitch | null
const getPitchColumnSlots = (pitcher: BvpPitcher | undefined): PitchSlot[] => {
  const qualified = getPitchColumns(pitcher)
  const slots: PitchSlot[] = qualified.slice(0, PITCH_SLOT_COUNT)
  while (slots.length < PITCH_SLOT_COUNT) slots.push(null)
  return slots
}

const buildBatterRows = (
  payload: BvpTeamPayload,
  standKey: string,
  expectedPitcher: BvpPitcher | undefined,
  pitchSlots: PitchSlot[],
  mode: WeightMode
) => {
  const rows: BatterRow[] = []
  const pitcherId = expectedPitcher?.pitcher ?? expectedPitcher?.pitcher_name ?? null

  payload.batters?.forEach((batter) => {
    const stand = batter.stands?.find(
      (entry) => (entry.stand ?? "").toUpperCase() === standKey
    )
    if (!stand) return
    const pitcher = stand.pitchers?.find((entry) => {
      if (!pitcherId) return toNumber(entry.expected_starter) === 1
      return (
        String(entry.pitcher ?? entry.pitcher_name ?? "") ===
        String(pitcherId ?? "")
      )
    })
    if (!pitcher) return

    const pitchScores: Record<string, number | null> = {}
    let totalWeighted = 0
    let totalUsage = 0

    pitchSlots.forEach((slot) => {
      if (!slot?.pitch_type) return
      const match = pitcher.pitches?.find(
        (pitch) => pitch.pitch_type === slot.pitch_type
      )
      const score = match ? computePitchScore(match, mode) : null
      pitchScores[slot.pitch_type] = score
      if (score != null) {
        const usage = normalizeUsage(toNumber(match?.usage_pct)) ?? 0
        totalWeighted += score * usage
        totalUsage += usage
      }
    })

    const overallScore =
      totalUsage > 0 ? totalWeighted / totalUsage : null

    rows.push({
      batterId: String(batter.batter ?? batter.batter_name ?? "unknown"),
      batterName: batter.batter_name ?? "Unknown",
      batterHeadshot: getHeadshotUrl(
        batter.batter_mlbHeadshot,
        batter.batter_espnHeadshot
      ),
      stand: standKey,
      pitchScores,
      overallScore,
    })
  })

  return rows
}

/** Compute OVR for a single batter vs pitcher (one stand), using qualified pitches only. */
const computeBatterVsPitcherOvr = (
  batter: BvpBatter,
  stand: BvpStand,
  pitcher: BvpPitcher,
  mode: WeightMode
): number | null => {
  const slots = getPitchColumnSlots(pitcher)
  let totalWeighted = 0
  let totalUsage = 0
  slots.forEach((slot) => {
    if (!slot?.pitch_type) return
    const match = pitcher.pitches?.find(
      (p) => p.pitch_type === slot.pitch_type
    )
    const score = match ? computePitchScore(match, mode) : null
    if (score != null) {
      const usage = normalizeUsage(toNumber(match?.usage_pct)) ?? 0
      totalWeighted += score * usage
      totalUsage += usage
    }
  })
  return totalUsage > 0 ? totalWeighted / totalUsage : null
}

const matchesPitcherFilter = (
  pitcher: BvpPitcher,
  filter: PitcherFilter
): boolean => {
  const pos = (pitcher.starter_position ?? "").toUpperCase()
  const expected = toNumber(pitcher.expected_starter) === 1
  if (filter === "all") return true
  if (filter === "starters") return expected
  if (filter === "relievers") return pos === "RP"
  return true
}

/** Build flat list of all batter vs pitcher matchups from payloads, sorted by OVR desc */
const buildBatterVsPitcherList = (
  payloads: Record<string, BvpTeamPayload>,
  weightMode: WeightMode,
  pitcherFilter: PitcherFilter
): BatterVsPitcherRow[] => {
  const rows: BatterVsPitcherRow[] = []
  Object.values(payloads).forEach((payload) => {
    const batterTeam = payload.batter_team ?? null
    const pitcherTeam = payload.pitcher_team ?? null
    payload.batters?.forEach((batter) => {
      batter.stands?.forEach((stand) => {
        const standKey = (stand.stand ?? "").toUpperCase()
        if (!standKey) return
        stand.pitchers?.forEach((pitcher) => {
          if (!matchesPitcherFilter(pitcher, pitcherFilter)) return
          const slots = getPitchColumnSlots(pitcher)
          const pitchOrder: string[] = []
          const pitchUsage: Record<string, number | null> = {}
          const pitchRatings: Record<string, number | null> = {}
          slots.forEach((slot) => {
            const pt = slot?.pitch_type ?? ""
            pitchOrder.push(pt)
            if (pt) {
              pitchUsage[pt] = normalizeUsage(toNumber(slot!.usage_pct))
              pitchRatings[pt] = computePitchScore(slot!, weightMode)
            }
          })
          const ovr = computeBatterVsPitcherOvr(batter, stand, pitcher, weightMode)
          rows.push({
            batterId: String(batter.batter ?? batter.batter_name ?? "unknown"),
            batterName: batter.batter_name ?? "Unknown",
            batterHeadshot: getHeadshotUrl(
              batter.batter_mlbHeadshot,
              batter.batter_espnHeadshot
            ),
            batterTeam,
            pitcherId: String(pitcher.pitcher ?? pitcher.pitcher_name ?? ""),
            pitcherName: pitcher.pitcher_name ?? "Unknown",
            pitcherHeadshot: getHeadshotUrl(
              pitcher.pitcher_mlbHeadshot,
              pitcher.pitcher_espnHeadshot
            ),
            pitcherTeam,
            stand: standKey,
            overallScore: ovr,
            starterPosition: pitcher.starter_position ?? null,
            expectedStarter: toNumber(pitcher.expected_starter),
            pitchOrder,
            pitchUsage,
            pitchRatings,
          })
        })
      })
    })
  })
  rows.sort((a, b) => {
    const aVal = a.overallScore ?? -Infinity
    const bVal = b.overallScore ?? -Infinity
    return bVal - aVal
  })
  return rows
}

const SortIcon = ({ active, direction }: { active: boolean; direction: "asc" | "desc" }) => {
  if (!active) return <span className="ml-1 text-[10px] text-muted-foreground">⇅</span>
  return (
    <span className="ml-1 text-[10px] text-muted-foreground">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  )
}

const BATTER_ROW_MAX_VISIBLE = 9
const BATTER_ROW_HEIGHT_PX = 36

const PitchMatrixTable = ({
  pitchSlots,
  rows,
  batterLabel,
  standLabel,
  batterLogo,
  batterTeamAbv,
  weightMode,
}: {
  pitchSlots: PitchSlot[]
  rows: BatterRow[]
  batterLabel: string
  standLabel: string
  batterLogo: string | null
  batterTeamAbv: string | null
  weightMode: WeightMode
}) => {
  const [sortKey, setSortKey] = React.useState<string>("overall")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")

  React.useEffect(() => {
    setSortKey("overall")
    setSortDir("desc")
  }, [pitchSlots.length, rows.length])

  const sortedRows = React.useMemo(() => {
    const next = [...rows]
    next.sort((a, b) => {
      if (sortKey === "batter") {
        return sortDir === "asc"
          ? a.batterName.localeCompare(b.batterName)
          : b.batterName.localeCompare(a.batterName)
      }
      if (sortKey === "overall") {
        const aVal = a.overallScore ?? -Infinity
        const bVal = b.overallScore ?? -Infinity
        return sortDir === "desc" ? bVal - aVal : aVal - bVal
      }
      const aScore = a.pitchScores[sortKey] ?? -Infinity
      const bScore = b.pitchScores[sortKey] ?? -Infinity
      return sortDir === "desc" ? bScore - aScore : aScore - bScore
    })
    return next
  }, [rows, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir(key === "batter" ? "asc" : "desc")
    }
  }

  const overallPitcherScore = computeOverallFromPitches(pitchSlots, weightMode)

  const colgroup = (
    <colgroup>
      <col style={{ width: "190px" }} />
      <col style={{ width: "70px" }} />
      {pitchSlots.map((slot, i) => (
        <col key={slot?.pitch_type ? `col-${slot.pitch_type}` : `col-empty-${i}`} />
      ))}
      <col style={{ width: "70px" }} />
    </colgroup>
  )

  return (
    <div className="flex flex-col min-h-0 w-full max-w-full min-w-0 rounded-md overflow-hidden card-glass">
      {/* Sticky: pitcher rows + batter header (no scroll) */}
      <div className="flex-shrink-0 overflow-x-auto">
        <table className="w-full min-w-0 border-collapse table-fixed">
          {colgroup}
          <thead>
            <tr className="text-left text-xs uppercase tracking-tighter text-foreground bg-muted/80 border-b border-border">
              <th className="px-3 py-2.5 bg-muted/80 font-semibold">{standLabel}</th>
              <th className="px-3 py-2.5 bg-muted/80"></th>
              {pitchSlots.map((slot, i) => {
                if (!slot) {
                  return <th key={`empty-${i}`} className="px-3 py-2.5 text-center bg-muted/80 font-semibold" />
                }
                const fullName = getPitchFullName(slot.pitch_type)
                return (
                  <th key={slot.pitch_type ?? i} className="px-3 py-2.5 text-center bg-muted/80 font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">{getPitchLabel(slot.pitch_type)}</span>
                      </TooltipTrigger>
                      <TooltipContent>{fullName || getPitchLabel(slot.pitch_type)}</TooltipContent>
                    </Tooltip>
                  </th>
                )
              })}
              <th className="px-3 py-2.5 text-center bg-muted/80 font-semibold border-l border-border/70">OVR</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/50 text-xs h-9">
              <td className="px-3 py-1.5 text-muted-foreground font-medium">Usage</td>
              <td className="px-3 py-1.5 text-muted-foreground"></td>
              {pitchSlots.map((slot, i) => {
                const usage = slot ? normalizeUsage(toNumber(slot.usage_pct)) : null
                return (
                  <td
                    key={slot?.pitch_type ? slot.pitch_type : `u-${i}`}
                    className={cn("px-3 py-1.5 text-center", getUsageValueClass(usage))}
                    style={getCellBackgroundStyle(usage, "usage")}
                  >
                    {usage == null ? "-" : `${(usage * 100).toFixed(0)}%`}
                  </td>
                )
              })}
              <td
                className={cn(
                  "px-3 py-1.5 text-center border-l border-border/50 text-base font-bold",
                  getOvrValueClass(overallPitcherScore)
                )}
                style={getCellBackgroundStyle(overallPitcherScore, "percent")}
                rowSpan={2}
              >
                {overallPitcherScore == null ? "-" : formatPercent(overallPitcherScore)}
              </td>
            </tr>
            <tr className="border-b border-border/50 text-xs h-9">
              <td className="px-3 py-1.5 text-muted-foreground font-medium">Pitch Rating</td>
              <td className="px-3 py-1.5 text-muted-foreground"></td>
              {pitchSlots.map((slot, i) => {
                const score = slot ? computePitchScore(slot, weightMode) : null
                return (
                  <td
                    key={slot?.pitch_type ? slot.pitch_type : `r-${i}`}
                    className={cn("px-3 py-1.5 text-center", getPitchValueClass(score))}
                    style={getCellBackgroundStyle(score, "percent")}
                  >
                    {score == null ? "-" : formatPercent(score)}
                  </td>
                )
              })}
            </tr>
            <tr className="border-b border-border/50 text-xs uppercase tracking-tighter text-foreground bg-muted/60 h-9">
              <th className="px-3 py-1.5 text-left bg-muted/60 font-semibold">
                <button
                  className="flex items-center text-left"
                  onClick={() => handleSort("batter")}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-border"
                      style={{
                        backgroundColor: batterTeamAbv
                          ? getTeamLogoColor(batterTeamAbv)
                          : "hsl(var(--muted))",
                      }}
                    >
                      {batterLogo ? (
                        <Image
                          src={batterLogo}
                          alt={batterTeamAbv ?? "Team"}
                          width={18}
                          height={18}
                          className="h-4 w-4 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {batterTeamAbv ?? "-"}
                        </span>
                      )}
                    </span>
                    {batterLabel}
                  </span>
                  <SortIcon active={sortKey === "batter"} direction={sortDir} />
                </button>
              </th>
              <th className="px-3 py-1.5 text-left bg-muted/60 font-semibold text-foreground">Stance</th>
              {pitchSlots.map((slot, i) => {
                if (!slot?.pitch_type) {
                  return <th key={`empty-h-${i}`} className="px-3 py-1.5 text-center bg-muted/60 font-semibold text-foreground" />
                }
                const pitchType = slot.pitch_type
                const fullName = getPitchFullName(slot.pitch_type)
                return (
                  <th key={pitchType} className="px-3 py-1.5 text-center bg-muted/60 font-semibold text-foreground">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="flex items-center justify-center w-full font-semibold text-foreground hover:text-primary"
                          onClick={() => handleSort(pitchType)}
                        >
                          {getPitchLabel(slot.pitch_type)}
                          <SortIcon active={sortKey === pitchType} direction={sortDir} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{fullName || getPitchLabel(slot.pitch_type)}</TooltipContent>
                    </Tooltip>
                  </th>
                )
              })}
              <th className="px-3 py-1.5 text-center bg-muted/60 border-l border-border/70 font-semibold text-foreground">
                <button
                  className="flex items-center justify-center w-full hover:text-primary"
                  onClick={() => handleSort("overall")}
                >
                  OVR
                  <SortIcon active={sortKey === "overall"} direction={sortDir} />
                </button>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Scroll: only batter data rows (max ~9 rows visible) */}
      <div
        className="flex-1 min-h-0 overflow-auto overflow-x-auto"
        style={{ maxHeight: BATTER_ROW_MAX_VISIBLE * BATTER_ROW_HEIGHT_PX }}
      >
        <table className="w-full min-w-0 border-collapse table-fixed">
          {colgroup}
          <tbody>
            {sortedRows.map((row) => (
              <tr
                key={row.batterId}
                className="border-b border-border/50 text-sm table-row-hover h-9 align-middle"
              >
                <td className="px-3 py-1.5 align-middle">
                  <div className="flex items-center gap-2 min-w-0">
                    {row.batterHeadshot ? (
                      <Image
                        src={row.batterHeadshot}
                        alt={row.batterName}
                        width={24}
                        height={24}
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-6 w-6 shrink-0 rounded-full bg-muted/40" />
                    )}
                    <span className="font-medium text-xs text-foreground whitespace-nowrap truncate min-w-0">
                      {row.batterName}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-1.5 text-xs text-muted-foreground align-middle">{row.stand}</td>
                {pitchSlots.map((slot, i) => {
                  const pitchType = slot?.pitch_type ?? ""
                  const score = pitchType ? row.pitchScores[pitchType] : null
                  return (
                    <td
                      key={slot?.pitch_type ? pitchType : `cell-${i}`}
                      className={cn("px-3 py-1.5 text-center align-middle", getPitchValueClass(score))}
                      style={getCellBackgroundStyle(score, "percent")}
                    >
                      {score == null ? "-" : formatPercent(score)}
                    </td>
                  )
                })}
                <td
                  className={cn(
                    "px-3 py-1.5 text-center border-l border-border/50 align-middle",
                    getOvrValueClass(row.overallScore)
                  )}
                  style={getCellBackgroundStyle(row.overallScore, "percent")}
                >
                  {row.overallScore == null ? "-" : formatPercent(row.overallScore)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const BatterPitchTable = ({
  pitchSlots,
  rows,
}: {
  pitchSlots: PitchSlot[]
  rows: BatterRow[]
}) => {
  const [sortKey, setSortKey] = React.useState<string>("overall")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")

  const sortedRows = React.useMemo(() => {
    const next = [...rows]
    next.sort((a, b) => {
      if (sortKey === "batter") {
        return sortDir === "asc"
          ? a.batterName.localeCompare(b.batterName)
          : b.batterName.localeCompare(a.batterName)
      }
      if (sortKey === "overall") {
        const aVal = a.overallScore ?? -Infinity
        const bVal = b.overallScore ?? -Infinity
        return sortDir === "desc" ? bVal - aVal : aVal - bVal
      }
      const aScore = a.pitchScores[sortKey] ?? -Infinity
      const bScore = b.pitchScores[sortKey] ?? -Infinity
      return sortDir === "desc" ? bScore - aScore : aScore - bScore
    })
    return next
  }, [rows, sortKey, sortDir])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir(key === "batter" ? "asc" : "desc")
    }
  }

  return (
    <div className="w-full overflow-x-auto rounded-md overflow-hidden card-glass">
      <table className="w-full min-w-[760px] border-collapse">
        <thead className="table-header-sticky">
          <tr className="text-left text-xs uppercase tracking-tighter text-foreground bg-muted/80 border-b border-border">
            <th className="px-3 py-2.5 bg-muted/80 font-semibold">
              <button
                className="flex items-center text-left hover:text-primary"
                onClick={() => handleSort("batter")}
              >
                Batter
                <SortIcon active={sortKey === "batter"} direction={sortDir} />
              </button>
            </th>
            <th className="px-3 py-2.5 bg-muted/80 font-semibold">Stance</th>
            {pitchSlots.map((slot, i) => {
              if (!slot) {
                return <th key={`empty-${i}`} className="px-3 py-2.5 text-center bg-muted/80 font-semibold" />
              }
              const pitchType = slot.pitch_type ?? "-"
              const usageValue = normalizeUsage(toNumber(slot.usage_pct))
              const fullName = getPitchFullName(slot.pitch_type)
              return (
                <th key={pitchType} className="px-3 py-2.5 text-center bg-muted/80 font-semibold">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="flex flex-col items-center w-full hover:text-primary"
                        onClick={() => handleSort(pitchType)}
                      >
                        <span>{getPitchLabel(slot.pitch_type)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {usageValue != null ? `${(usageValue * 100).toFixed(0)}%` : "-"}
                        </span>
                        <SortIcon active={sortKey === pitchType} direction={sortDir} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{fullName || getPitchLabel(slot.pitch_type)}</TooltipContent>
                  </Tooltip>
                </th>
              )
            })}
            <th className="px-3 py-2.5 text-center bg-muted/80 border-l border-border/70 font-semibold">
              <button
                className="flex items-center justify-center w-full hover:text-primary"
                onClick={() => handleSort("overall")}
              >
                OVR
                <SortIcon active={sortKey === "overall"} direction={sortDir} />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={row.batterId}
              className="border-b border-border/50 text-sm table-row-hover h-9 align-middle"
            >
              <td className="px-3 py-1.5 align-middle">
                <div className="flex items-center gap-2 min-w-0">
                  {row.batterHeadshot ? (
                    <Image
                      src={row.batterHeadshot}
                      alt={row.batterName}
                      width={24}
                      height={24}
                      className="h-6 w-6 shrink-0 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-6 w-6 shrink-0 rounded-full bg-muted/40" />
                  )}
                  <span className="font-medium text-xs text-foreground whitespace-nowrap truncate min-w-0">
                    {row.batterName}
                  </span>
                </div>
              </td>
              <td className="px-3 py-1.5 text-xs text-muted-foreground align-middle">{row.stand}</td>
              {pitchSlots.map((slot, i) => {
                const pitchType = slot?.pitch_type ?? ""
                const score = pitchType ? row.pitchScores[pitchType] : null
                return (
                  <td
                    key={slot?.pitch_type ? pitchType : `cell-${i}`}
                    className={cn("px-3 py-1.5 text-center align-middle", getPitchValueClass(score))}
                    style={getCellBackgroundStyle(score, "percent")}
                  >
                    {score == null ? "-" : formatPercent(score)}
                  </td>
                )
              })}
              <td
                className={cn("px-3 py-1.5 text-center border-l border-border/50 align-middle", getOvrValueClass(row.overallScore))}
                style={getCellBackgroundStyle(row.overallScore, "percent")}
              >
                {row.overallScore == null ? "-" : formatPercent(row.overallScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TeamMatchupCard = ({
  payload,
  label,
  weightMode,
}: {
  payload: BvpTeamPayload | null
  label: string
  weightMode: WeightMode
}) => {
  if (!payload) {
    return (
      <Card className="rounded-md border border-border bg-card surface-glass card-hover-glow">
        <CardContent className="p-4 text-sm text-muted-foreground">
          Loading {label} matchup...
        </CardContent>
      </Card>
    )
  }

  const expectedByStand = buildExpectedStartersByStand(payload)
  const primaryPitcher =
    expectedByStand.get("L") ?? expectedByStand.get("R") ?? null
  const pitcherHand = primaryPitcher?.p_throws?.toUpperCase()
  const pitcherHandLabel =
    pitcherHand === "R" ? "RHP" : pitcherHand === "L" ? "LHP" : null
  const stands = ["L", "R"]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-md border border-border"
            style={{
              backgroundColor: payload.pitcher_team
                ? getTeamLogoColor(payload.pitcher_team)
                : "hsl(var(--muted))",
            }}
          >
            {payload.opponent_logo ? (
              <Image
                src={payload.opponent_logo}
                alt={payload.pitcher_team ?? "Pitcher team"}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {payload.pitcher_team ?? "-"}
              </span>
            )}
          </span>
          {getHeadshotUrl(primaryPitcher?.pitcher_mlbHeadshot, primaryPitcher?.pitcher_espnHeadshot) ? (
            <Image
              src={getHeadshotUrl(
                primaryPitcher?.pitcher_mlbHeadshot,
                primaryPitcher?.pitcher_espnHeadshot
              ) as string}
              alt={primaryPitcher?.pitcher_name ?? "Pitcher"}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted/40" />
          )}
          <div>
            <CardTitle className="text-xl">
              {primaryPitcher?.pitcher_name ?? "Expected Starter"}
              {pitcherHandLabel ? ` (${pitcherHandLabel})` : ""}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {payload.batter_team ?? label} vs {payload.pitcher_team ?? "Opponent"}
            </div>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={300}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_1fr]">
        {stands.map((stand, index) => {
          const expected = expectedByStand.get(stand)
          if (!expected) return null
          const pitchSlots = getPitchColumnSlots(expected)
          const batterRows = buildBatterRows(payload, stand, expected, pitchSlots, weightMode)
          return (
            <React.Fragment key={stand}>
              <div className="space-y-2 min-w-0">
                <PitchMatrixTable
                  pitchSlots={pitchSlots}
                  rows={batterRows}
                  batterLabel={`${payload.batter_team ?? label}\u00A0${stand}HB`}
                  standLabel={`VS\u00A0${stand}HB`}
                  batterLogo={payload.team_logo ?? null}
                  batterTeamAbv={payload.batter_team ?? null}
                  weightMode={weightMode}
                />
              </div>
              {index === 0 ? (
                <div className="hidden xl:flex items-stretch px-2">
                  <div className="w-[10px] border-l-2 border-r-2 border-border" />
                </div>
              ) : null}
            </React.Fragment>
          )
        })}
      </div>
      </TooltipProvider>
    </div>
  )
}

const TEAM_SCROLL_ID_PREFIX = "team-"

const TeamLogoStrip = ({ teamsInGames }: { teamsInGames: Set<string> }) => {
  const scrollToTeam = (abbr: string) => {
    const el = document.getElementById(`${TEAM_SCROLL_ID_PREFIX}${abbr}`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const reducedMotion = useReducedMotion()
  const hoverScale = reducedMotion ? 1 : 1.12

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-md border border-border bg-card p-2">
      {MLB_TEAM_ABBREVS.map((abbr) => {
        const inSlate = teamsInGames.has(abbr)
        const bgColor = getTeamLogoColor(toColorKey(abbr))
        return (
          <motion.button
            key={abbr}
            type="button"
            onClick={() => scrollToTeam(abbr)}
            title={abbr}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:shadow-[0_0_10px_hsl(var(--primary)/0.4)]",
              inSlate ? "opacity-100 hover:opacity-90" : "opacity-50 hover:opacity-70"
            )}
            style={{ backgroundColor: bgColor }}
            whileHover={{
              scale: hoverScale,
              rotate: reducedMotion ? 0 : [0, 2, -2, 0],
              transition: { duration: reducedMotion ? 0 : 0.25 },
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Image
              src={`/Images/MLB_Logos/${abbr}.png`}
              alt={abbr}
              width={24}
              height={24}
              className="h-5 w-5 object-contain pointer-events-none"
            />
          </motion.button>
        )
      })}
    </div>
  )
}

const LineupsTab = ({
  weightMode,
  games,
  payloads,
  loading,
  error,
  payloadLoading,
}: {
  weightMode: WeightMode
  games: MlbLineupsGame[]
  payloads: Record<string, BvpTeamPayload>
  loading: boolean
  error: string | null
  payloadLoading: boolean
}) => {
  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading matchups...</div>
  }
  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {games.map((game) => {
        const gameDate = game.gameDate ?? ""
        const awayKey = game.awayTeam?.teamAbv ? `${game.awayTeam.teamAbv}-${gameDate}` : ""
        const homeKey = game.homeTeam?.teamAbv ? `${game.homeTeam.teamAbv}-${gameDate}` : ""
        const awayPayload = awayKey ? payloads[awayKey] ?? null : null
        const homePayload = homeKey ? payloads[homeKey] ?? null : null
        const label = `${game.awayTeam?.teamAbv ?? "TBD"} @ ${game.homeTeam?.teamAbv ?? "TBD"}`

        return (
          <div key={game.gameId} className="space-y-3">
            <Card className="rounded-md border border-border bg-card surface-glass card-hover-glow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border"
                      style={{
                        backgroundColor: game.awayTeam?.teamAbv
                          ? getTeamLogoColor(game.awayTeam.teamAbv)
                          : "hsl(var(--muted))",
                      }}
                    >
                      {game.awayTeam?.teamLogo ? (
                        <Image
                          src={game.awayTeam.teamLogo}
                          alt={game.awayTeam.teamAbv}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {game.awayTeam?.teamAbv ?? "-"}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {label}
                    </span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border"
                      style={{
                        backgroundColor: game.homeTeam?.teamAbv
                          ? getTeamLogoColor(game.homeTeam.teamAbv)
                          : "hsl(var(--muted))",
                      }}
                    >
                      {game.homeTeam?.teamLogo ? (
                        <Image
                          src={game.homeTeam.teamLogo}
                          alt={game.homeTeam.teamAbv}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {game.homeTeam?.teamAbv ?? "-"}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {game.gameDateLabel ?? game.gameDate ?? "TBD"}
                    {game.gameTimeEst ? ` · ${game.gameTimeEst}` : ""}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <div className="w-2/3 min-w-0">
                <Card className="rounded-md border border-border bg-card surface-glass card-hover-glow">
                  <CardContent className="p-4 space-y-6">
                    <div
                      id={
                        toLogoAbbr(game.awayTeam?.teamAbv) != null
                          ? `${TEAM_SCROLL_ID_PREFIX}${toLogoAbbr(game.awayTeam?.teamAbv)}`
                          : undefined
                      }
                      className="scroll-mt-24"
                    >
                      <TeamMatchupCard
                        payload={awayPayload}
                        label={game.awayTeam?.teamAbv ?? "Away"}
                        weightMode={weightMode}
                      />
                    </div>
                    <div className="border-t-2 border-b border-border" />
                    <div
                      id={
                        toLogoAbbr(game.homeTeam?.teamAbv) != null
                          ? `${TEAM_SCROLL_ID_PREFIX}${toLogoAbbr(game.homeTeam?.teamAbv)}`
                          : undefined
                      }
                      className="scroll-mt-24"
                    >
                      <TeamMatchupCard
                        payload={homePayload}
                        label={game.homeTeam?.teamAbv ?? "Home"}
                        weightMode={weightMode}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="w-1/3 min-w-0">
                <Card className="rounded-md border border-border bg-card surface-glass h-full min-h-[200px]">
                  <CardContent className="p-4 h-full" />
                </Card>
              </div>
            </div>
          </div>
        )
      })}

      {payloadLoading && (
        <div className="text-xs text-muted-foreground">
          Loading matchup payloads...
        </div>
      )}
      <Card className="rounded-md border border-border bg-card surface-glass card-hover-glow">
        <CardContent className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Pitch Legend
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {PITCH_LABELS.map((entry) => (
              <div
                key={entry.raw}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground/80"
              >
                <span className="font-semibold">{entry.raw}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold">{entry.label}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const PITCHER_FILTER_OPTIONS: { value: PitcherFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "starters", label: "Starters" },
  { value: "relievers", label: "Relievers" },
]

const H2H_PITCH_SLOTS = 5
/** Cap rendered rows so the Batter tab doesn't freeze with 1000s of DOM nodes */
const MAX_BATTER_TAB_ROWS = 500

const BatterTab = ({
  games,
  payloads,
  loading,
  error,
  payloadLoading,
  weightMode,
  pitcherFilter,
  setPitcherFilter,
  rows,
}: {
  games: MlbLineupsGame[]
  payloads: Record<string, BvpTeamPayload>
  loading: boolean
  error: string | null
  payloadLoading: boolean
  weightMode: WeightMode
  pitcherFilter: PitcherFilter
  setPitcherFilter: (f: PitcherFilter) => void
  rows: BatterVsPitcherRow[]
}) => {
  const [detailRow, setDetailRow] = React.useState<BatterVsPitcherRow | null>(null)

  const visibleRows = rows.slice(0, MAX_BATTER_TAB_ROWS)
  const isCapped = rows.length > MAX_BATTER_TAB_ROWS

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading matchups...</div>
  }
  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-md border border-border bg-card surface-glass card-hover-glow">
        <CardContent className="p-4 flex flex-col min-h-0">
          <div className="flex-shrink-0 text-xs font-semibold uppercase text-muted-foreground mb-3">
            All batters vs pitchers · sorted by OVR (desc) · click row for full pitches
            {isCapped && (
              <span className="block mt-1 font-normal normal-case text-muted-foreground">
                Showing top {MAX_BATTER_TAB_ROWS} of {rows.length} · use Starters/Relievers to narrow
              </span>
            )}
          </div>
          <TooltipProvider delayDuration={300}>
          <div className="flex-1 min-h-0 overflow-auto rounded-md overflow-hidden card-glass">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="table-header-sticky">
                <tr className="text-left text-xs uppercase tracking-tighter text-foreground bg-muted/80 border-b border-border">
                  <th className="px-2 py-2.5 bg-muted/80">#</th>
                  <th className="px-2 py-2.5 bg-muted/80 font-semibold">Batter</th>
                  <th className="px-2 py-2.5 bg-muted/80 font-semibold">Stance</th>
                  {Array.from({ length: H2H_PITCH_SLOTS }, (_, i) => (
                    <th key={`b-${i}`} className="px-1.5 py-2.5 text-center bg-muted/80 font-semibold">
                      Pitch {i + 1}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 text-center bg-muted/80">vs</th>
                  <th className="px-2 py-2.5 bg-muted/80 font-semibold">Pitcher</th>
                  {Array.from({ length: H2H_PITCH_SLOTS }, (_, i) => (
                    <th key={`p-${i}`} className="px-1.5 py-2.5 text-center bg-muted/80 font-semibold">
                      Pitch {i + 1}
                    </th>
                  ))}
                  <th className="px-2 py-2.5 text-center bg-muted/80 border-l border-border/70 font-semibold">OVR</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => {
                  const pitchSlotsRow = row.pitchOrder.slice(0, H2H_PITCH_SLOTS)
                  return (
                    <tr
                      key={`${row.batterId}-${row.pitcherId}-${row.stand}`}
                      className="border-b border-border/50 cursor-pointer table-row-hover h-9 align-middle"
                      onClick={() => setDetailRow(row)}
                    >
                      <td className="px-2 py-1.5 text-xs text-muted-foreground tabular-nums align-middle">{idx + 1}</td>
                      <td className="px-2 py-1.5 align-middle">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border overflow-hidden"
                            style={{
                              backgroundColor: row.batterTeam
                                ? getTeamLogoColor(toColorKey(toLogoAbbr(row.batterTeam) ?? ""))
                                : "hsl(var(--muted))",
                            }}
                            title={row.batterTeam ?? undefined}
                          >
                            {row.batterTeam && toLogoAbbr(row.batterTeam) ? (
                              <Image
                                src={`/Images/MLB_Logos/${toLogoAbbr(row.batterTeam)}.png`}
                                alt={row.batterTeam}
                                width={18}
                                height={18}
                                className="h-4 w-4 object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {row.batterTeam ?? "-"}
                              </span>
                            )}
                          </span>
                          {row.batterHeadshot ? (
                            <Image
                              src={row.batterHeadshot}
                              alt={row.batterName}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full object-cover shrink-0"
                              unoptimized
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted/40 shrink-0" />
                          )}
                          <span className="font-medium text-xs text-foreground whitespace-nowrap truncate min-w-0 max-w-[100px]">
                            {row.batterName}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-muted-foreground align-middle">{row.stand}\u00A0HB</td>
                      {Array.from({ length: H2H_PITCH_SLOTS }, (_, i) => {
                        const pt = pitchSlotsRow[i] ?? ""
                        const rating = pt ? row.pitchRatings[pt] : null
                        const fullName = pt ? getPitchFullName(pt) : ""
                        const label = pt ? getPitchLabel(pt) : ""
                        return (
                          <td
                            key={i}
                            className="px-1.5 py-2 text-center align-middle"
                            style={getCellBackgroundStyle(rating, "percent")}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    "text-xs font-medium cursor-default",
                                    getPitchValueClass(rating)
                                  )}
                                >
                                  {rating != null ? `${rating.toFixed(0)}%` : "-"}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {fullName ? `${fullName}: ${rating != null ? `${rating.toFixed(0)}%` : "—"}` : label ? `${label}: —` : "—"}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        )
                      })}
                      <td className="px-2 py-2 text-center text-muted-foreground align-middle">vs</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border overflow-hidden"
                            style={{
                              backgroundColor: row.pitcherTeam
                                ? getTeamLogoColor(toColorKey(toLogoAbbr(row.pitcherTeam) ?? ""))
                                : "hsl(var(--muted))",
                            }}
                            title={row.pitcherTeam ?? undefined}
                          >
                            {row.pitcherTeam && toLogoAbbr(row.pitcherTeam) ? (
                              <Image
                                src={`/Images/MLB_Logos/${toLogoAbbr(row.pitcherTeam)}.png`}
                                alt={row.pitcherTeam}
                                width={20}
                                height={20}
                                className="h-5 w-5 object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {row.pitcherTeam ?? "-"}
                              </span>
                            )}
                          </span>
                          {row.pitcherHeadshot ? (
                            <Image
                              src={row.pitcherHeadshot}
                              alt={row.pitcherName}
                              width={24}
                              height={24}
                              className="h-6 w-6 rounded-full object-cover shrink-0"
                              unoptimized
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-muted/40 shrink-0" />
                          )}
                          <span className="font-medium text-xs text-foreground whitespace-nowrap truncate min-w-0 max-w-[100px]">
                            {row.pitcherName}
                          </span>
                        </div>
                      </td>
                      {Array.from({ length: H2H_PITCH_SLOTS }, (_, i) => {
                        const pt = pitchSlotsRow[i] ?? ""
                        const usage = pt ? row.pitchUsage[pt] : null
                        const rating = pt ? row.pitchRatings[pt] : null
                        const usageStr = usage != null ? `${(usage * 100).toFixed(0)}%` : "-"
                        const ratingStr = rating != null ? `${rating.toFixed(0)}%` : "-"
                        const label = pt ? getPitchLabel(pt) : ""
                        const fullName = pt ? getPitchFullName(pt) : ""
                        return (
                          <td
                            key={i}
                            className="px-1.5 py-2 text-center align-middle"
                            style={getCellBackgroundStyle(rating, "percent")}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    "text-xs cursor-default inline-flex items-baseline gap-1"
                                  )}
                                >
                                  {label ? (
                                    <>
                                      <span className="text-muted-foreground">{label}</span>
                                      <span className={getUsageValueClass(usage)}>{usageStr}</span>
                                      <span className="text-muted-foreground">/</span>
                                      <span className={getPitchValueClass(rating)}>
                                        {ratingStr}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className={getUsageValueClass(usage)}>{usageStr}</span>
                                      <span className="text-muted-foreground">/</span>
                                      <span className={getPitchValueClass(rating)}>
                                        {ratingStr}
                                      </span>
                                    </>
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {fullName ? `${fullName}: Usage ${usageStr} · Rating ${ratingStr}` : label ? `${label}: —` : "—"}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        )
                      })}
                      <td
                        className="px-2 py-1.5 text-center border-l border-border/50 align-middle"
                        style={getCellBackgroundStyle(row.overallScore, "percent")}
                      >
                        <span className={getOvrValueClass(row.overallScore)}>
                          {row.overallScore != null
                            ? `${row.overallScore.toFixed(0)}%`
                            : "-"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </TooltipProvider>
          {rows.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No matchups match the current filter.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailRow} onOpenChange={(open) => !open && setDetailRow(null)}>
        <DialogContent
          className="max-w-lg border border-border p-0 gap-0 overflow-hidden text-card-foreground bg-card surface-glass"
        >
          {detailRow && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>
                  {detailRow.batterName} vs {detailRow.pitcherName}
                </DialogTitle>
              </DialogHeader>

              {/* Reserve space for close button (absolute right-4 top-4) */}
              <div className="pt-12 pr-12 pl-4 pb-4">
              {/* Matchup hero - single row, no individual cards */}
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                {/* Batter: logo + headshot + name */}
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded overflow-hidden border border-border"
                  style={{
                    backgroundColor: detailRow.batterTeam
                      ? getTeamLogoColor(toColorKey(toLogoAbbr(detailRow.batterTeam) ?? ""))
                      : "hsl(var(--muted))",
                  }}
                >
                  {detailRow.batterTeam && toLogoAbbr(detailRow.batterTeam) ? (
                    <Image
                      src={`/Images/MLB_Logos/${toLogoAbbr(detailRow.batterTeam)}.png`}
                      alt={detailRow.batterTeam}
                      width={18}
                      height={18}
                      className="h-4 w-4 object-contain"
                    />
                  ) : (
                    <span className="text-[9px] font-semibold text-muted-foreground">{detailRow.batterTeam ?? "-"}</span>
                  )}
                </span>
                {detailRow.batterHeadshot ? (
                  <Image
                    src={detailRow.batterHeadshot}
                    alt={detailRow.batterName}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted/40 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="font-semibold text-foreground text-sm truncate block">{detailRow.batterName}</span>
                  <span className="text-[11px] text-muted-foreground">{detailRow.stand}HB</span>
                </div>

                <span className="shrink-0 text-muted-foreground font-semibold text-xs px-1">vs</span>

                {/* Pitcher: headshot + name + logo */}
                {detailRow.pitcherHeadshot ? (
                  <Image
                    src={detailRow.pitcherHeadshot}
                    alt={detailRow.pitcherName}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted/40 shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="font-semibold text-foreground text-sm truncate block">{detailRow.pitcherName}</span>
                </div>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded overflow-hidden border border-border"
                  style={{
                    backgroundColor: detailRow.pitcherTeam
                      ? getTeamLogoColor(toColorKey(toLogoAbbr(detailRow.pitcherTeam) ?? ""))
                      : "hsl(var(--muted))",
                  }}
                >
                  {detailRow.pitcherTeam && toLogoAbbr(detailRow.pitcherTeam) ? (
                    <Image
                      src={`/Images/MLB_Logos/${toLogoAbbr(detailRow.pitcherTeam)}.png`}
                      alt={detailRow.pitcherTeam}
                      width={18}
                      height={18}
                      className="h-4 w-4 object-contain"
                    />
                  ) : (
                    <span className="text-[9px] font-semibold text-muted-foreground">{detailRow.pitcherTeam ?? "-"}</span>
                  )}
                </span>
              </div>

              {/* Pitch table */}
              <div className="pt-4 pb-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  All pitches
                </div>
                <div className="rounded-md overflow-hidden card-glass">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border/70 bg-card/95">
                        <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-tighter text-muted-foreground">
                          Pitch
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-tighter text-muted-foreground w-20">
                          Usage
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-tighter text-muted-foreground w-24">
                          Pitch rating
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium uppercase tracking-tighter text-muted-foreground w-24">
                          Batter rating
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRow.pitchOrder.filter((pt) => pt.length > 0).map((pt, idx) => {
                        const usage = detailRow.pitchUsage[pt]
                        const rating = detailRow.pitchRatings[pt]
                        return (
                          <tr
                            key={pt}
                            className={cn(
                              "border-b border-border/50",
                              idx % 2 === 0 ? "bg-muted/15" : "bg-muted/25"
                            )}
                          >
                            <td className="px-3 py-2.5">
                              <span
                                className="inline-flex rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-foreground"
                                title={getPitchFullName(pt)}
                              >
                                {getPitchLabel(pt)}
                              </span>
                            </td>
                            <td
                              className="px-3 py-2.5 text-center"
                              style={getCellBackgroundStyle(usage, "usage")}
                            >
                              <span className={cn("font-medium tabular-nums", getUsageValueClass(usage))}>
                                {usage != null ? `${(usage * 100).toFixed(0)}%` : "—"}
                              </span>
                            </td>
                            <td
                              className="px-3 py-2.5 text-center"
                              style={getCellBackgroundStyle(rating, "percent")}
                            >
                              <span className={cn("font-medium tabular-nums", getPitchValueClass(rating))}>
                                {rating != null ? `${rating.toFixed(0)}%` : "—"}
                              </span>
                            </td>
                            <td
                              className="px-3 py-2.5 text-center"
                              style={getCellBackgroundStyle(rating, "percent")}
                            >
                              <span className={cn("font-medium tabular-nums", getPitchValueClass(rating))}>
                                {rating != null ? `${rating.toFixed(0)}%` : "—"}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* OVR footer */}
              <div className="pb-0 pt-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Matchup OVR
                  </span>
                  <span
                    className={cn(
                      "text-xl font-bold tabular-nums",
                      getOvrValueClass(detailRow.overallScore)
                    )}
                  >
                    {detailRow.overallScore != null
                      ? `${detailRow.overallScore.toFixed(0)}%`
                      : "—"}
                  </span>
                </div>
              </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function PitchMatrixClient() {
  const [activeTab, setActiveTab] = React.useState<(typeof TAB_ITEMS)[number]>(
    "Matchups"
  )
  const [weightMode, setWeightMode] = React.useState<WeightMode>("avg")
  const [pitcherFilter, setPitcherFilter] = React.useState<PitcherFilter>("all")
  const { data, loading, error } = useLineupsData()
  const games = data?.games ?? []
  const { payloads, loading: payloadLoading } = useTeamPayloads(games)

  /** Precomputed so Batter tab is ready when user switches; also used to preload Batter in background */
  const batterListRows = React.useMemo(
    () => buildBatterVsPitcherList(payloads, weightMode, pitcherFilter),
    [payloads, weightMode, pitcherFilter]
  )

  /** Teams in today's games (for Matchups tab team logo strip) */
  const teamsInGames = React.useMemo(() => {
    const set = new Set<string>()
    games.forEach((game) => {
      const away = toLogoAbbr(game.awayTeam?.teamAbv)
      const home = toLogoAbbr(game.homeTeam?.teamAbv)
      if (away) set.add(away)
      if (home) set.add(home)
    })
    return set
  }, [games])

  return (
    <>
      {/* Sticky MLB controls bar: sticks to top of page wrapper (flush under app header) */}
      <div
        className="sticky top-0 z-40 w-full flex-shrink-0 border-b border-border bg-card surface-glass"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition-colors interactive-surface",
                  activeTab === tab
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "Matchups" ? (
            <>
              <TeamLogoStrip teamsInGames={teamsInGames} />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  OVR Mode
                </span>
                <div className="flex items-center rounded-md border border-border bg-muted/50 p-1">
                  <button
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                      weightMode === "avg"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setWeightMode("avg")}
                  >
                    AVG
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                      weightMode === "hr"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setWeightMode("hr")}
                  >
                    HR
                  </button>
                </div>
              </div>
            </>
          ) : null}
          {activeTab === "Batter" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Pitcher
              </span>
              <div className="flex items-center rounded-md border border-border bg-muted/50 p-1">
                {PITCHER_FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPitcherFilter(opt.value)}
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                      pitcherFilter === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {payloadLoading && (
                <span className="text-xs text-muted-foreground">Loading…</span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Scroll region: only this area scrolls; tables/cards do not set height */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="space-y-6 p-4">
          {activeTab === "Matchups" && (
            <LineupsTab
              weightMode={weightMode}
              games={games}
              payloads={payloads}
              loading={loading}
              error={error}
              payloadLoading={payloadLoading}
            />
          )}
          {games.length > 0 && (
            <div
              style={{ display: activeTab === "Batter" ? "block" : "none" }}
              aria-hidden={activeTab !== "Batter"}
              className={activeTab === "Batter" ? "space-y-6" : undefined}
            >
              <BatterTab
                games={games}
                payloads={payloads}
                loading={loading}
                error={error}
                payloadLoading={payloadLoading}
                weightMode={weightMode}
                pitcherFilter={pitcherFilter}
                setPitcherFilter={setPitcherFilter}
                rows={batterListRows}
              />
            </div>
          )}
          {activeTab === "Pitcher" && (
            <Card className="rounded-md border border-border bg-card surface-glass card-hover-glow">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Pitcher tab layout placeholder — will connect to pitcher payloads next.
              </CardContent>
            </Card>
          )}
          {activeTab === "H2H" && (
            <Card className="rounded-md border border-border bg-card surface-glass card-hover-glow">
              <CardContent className="p-4 text-sm text-muted-foreground">
                H2H tab layout placeholder — matchup history view coming next.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

