"use client"

import * as React from "react"
import Image from "next/image"
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
import { BRAND_TEAL } from "@/lib/brand"
import mlbTeamColors from "@/data/mlb-team-colors.json"

/** Matchups tab cards: 70% transparent, soft teal glow border, and border shadow */
const PITCH_MATRIX_CARD_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(23, 23, 23, 0.3)",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "rgba(73, 193, 251, 0.45)",
  boxShadow: [
    "0 0 12px rgba(73, 193, 251, 0.22)",
    "0 0 24px rgba(73, 193, 251, 0.08)",
    "0 4px 14px rgba(0, 0, 0, 0.25)",
    "0 2px 6px rgba(0, 0, 0, 0.15)",
  ].join(", "),
}

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

const getPercentTone = (value: number | null) => {
  if (value == null) return "text-white/60"
  if (value >= 75) return "text-green-400"
  if (value >= 60) return "text-lime-300"
  if (value >= 45) return "text-yellow-300"
  if (value >= 30) return "text-orange-300"
  return "text-red-400"
}

const getUsageTone = (value: number | null) => {
  if (value == null) return "text-white/60"
  if (value >= 0.4) return "text-green-400"
  if (value >= 0.3) return "text-lime-300"
  if (value >= 0.2) return "text-yellow-300"
  if (value >= 0.1) return "text-orange-300"
  return "text-red-400"
}

const getPitchValueClass = (value: number | null) =>
  `${getPercentTone(value)} opacity-80`
const getOvrValueClass = (value: number | null) =>
  `${getPercentTone(value)} font-semibold`
const getUsageValueClass = (value: number | null) =>
  `${getUsageTone(value)} opacity-80`

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
  if (!entry) return "#1f2937"
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

const computeOverallFromPitches = (pitches: BvpPitch[], mode: WeightMode) => {
  let totalWeighted = 0
  let totalUsage = 0

  pitches.forEach((pitch) => {
    const score = computePitchScore(pitch, mode)
    if (score == null) return
    const usage = normalizeUsage(toNumber(pitch.usage_pct)) ?? 0
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

const getPitchColumns = (pitcher: BvpPitcher | undefined) => {
  const pitches = pitcher?.pitches ?? []
  return [...pitches]
    .filter((pitch) => pitch.pitch_type)
    .sort((a, b) => {
      const aUsage = normalizeUsage(toNumber(a.usage_pct)) ?? 0
      const bUsage = normalizeUsage(toNumber(b.usage_pct)) ?? 0
      return bUsage - aUsage
    })
}

const buildBatterRows = (
  payload: BvpTeamPayload,
  standKey: string,
  expectedPitcher: BvpPitcher | undefined,
  pitchColumns: BvpPitch[],
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

    pitchColumns.forEach((pitchColumn) => {
      const match = pitcher.pitches?.find(
        (pitch) => pitch.pitch_type === pitchColumn.pitch_type
      )
      const score = match ? computePitchScore(match, mode) : null
      pitchScores[pitchColumn.pitch_type ?? "-"] = score
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

/** Compute OVR for a single batter vs pitcher (one stand) */
const computeBatterVsPitcherOvr = (
  batter: BvpBatter,
  stand: BvpStand,
  pitcher: BvpPitcher,
  mode: WeightMode
): number | null => {
  const pitchColumns = getPitchColumns(pitcher)
  let totalWeighted = 0
  let totalUsage = 0
  pitchColumns.forEach((pitchColumn) => {
    const match = pitcher.pitches?.find(
      (p) => p.pitch_type === pitchColumn.pitch_type
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
          const pitchColumns = getPitchColumns(pitcher)
          const pitchOrder: string[] = []
          const pitchUsage: Record<string, number | null> = {}
          const pitchRatings: Record<string, number | null> = {}
          pitchColumns.forEach((pitch) => {
            const pt = pitch.pitch_type ?? ""
            if (!pt) return
            pitchOrder.push(pt)
            pitchUsage[pt] = normalizeUsage(toNumber(pitch.usage_pct))
            pitchRatings[pt] = computePitchScore(pitch, weightMode)
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

const PitchMatrixTable = ({
  pitchColumns,
  rows,
  batterLabel,
  standLabel,
  batterLogo,
  batterTeamAbv,
  weightMode,
}: {
  pitchColumns: BvpPitch[]
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
  }, [pitchColumns.length, rows.length])

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

  const overallPitcherScore = computeOverallFromPitches(pitchColumns, weightMode)

  const totalCols = 2 + pitchColumns.length + 1

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-hidden">
      <table className="w-full min-w-0 border-collapse table-fixed">
        <colgroup>
          <col style={{ width: "190px" }} />
          <col style={{ width: "70px" }} />
          {pitchColumns.map((pitch) => (
            <col key={`col-${pitch.pitch_type ?? "-"}`} />
          ))}
          <col style={{ width: "70px" }} />
        </colgroup>
        <thead className="border-b border-gray-700/70 bg-[#151515]">
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 bg-[#151515]">{standLabel}</th>
            <th className="px-3 py-2 bg-[#151515]"></th>
            {pitchColumns.map((pitch) => {
              const pitchType = pitch.pitch_type ?? "-"
              return (
                <th key={pitchType} className="px-3 py-2 text-center bg-[#151515]">
                  <span title={getPitchFullName(pitch.pitch_type)}>
                    {getPitchLabel(pitch.pitch_type)}
                  </span>
                </th>
              )
            })}
            <th className="px-3 py-2 text-center bg-[#151515]">OVR</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-800/60 text-xs text-white/80">
            <td className="px-3 py-2 font-semibold">Usage</td>
            <td className="px-3 py-2 text-muted-foreground"></td>
            {pitchColumns.map((pitch) => {
              const usage = normalizeUsage(toNumber(pitch.usage_pct))
              return (
                <td
                  key={pitch.pitch_type ?? "-"}
                  className={cn("px-3 py-2 text-center", getUsageValueClass(usage))}
                >
                  {usage == null ? "-" : `${(usage * 100).toFixed(0)}%`}
                </td>
              )
            })}
            <td
              className={cn(
                "px-3 py-2 text-center text-lg",
                getOvrValueClass(overallPitcherScore)
              )}
              rowSpan={2}
            >
              {overallPitcherScore == null ? "-" : formatPercent(overallPitcherScore)}
            </td>
          </tr>
          <tr className="border-b border-gray-800/60 text-xs text-white/90">
            <td className="px-3 py-2 font-semibold">Pitch Rating</td>
            <td className="px-3 py-2 text-muted-foreground"></td>
            {pitchColumns.map((pitch) => {
              const score = computePitchScore(pitch, weightMode)
              return (
                <td
                  key={pitch.pitch_type ?? "-"}
                  className={cn("px-3 py-2 text-center", getPitchValueClass(score))}
                >
                  {score == null ? "-" : formatPercent(score)}
                </td>
              )
            })}
          </tr>
          <tr className="border-b border-gray-800/60 text-xs uppercase tracking-wide text-muted-foreground bg-[#151515]">
            <th className="px-3 py-2 text-left bg-[#151515]">
              <button
                className="flex items-center text-left"
                onClick={() => handleSort("batter")}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-white/15"
                    style={{
                      backgroundColor: batterTeamAbv
                        ? getTeamLogoColor(batterTeamAbv)
                        : "#1f2937",
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
                      <span className="text-[10px] font-semibold text-white/70">
                        {batterTeamAbv ?? "-"}
                      </span>
                    )}
                  </span>
                  {batterLabel}
                </span>
                <SortIcon active={sortKey === "batter"} direction={sortDir} />
              </button>
            </th>
            <th className="px-3 py-2 text-left bg-[#151515]">Stance</th>
            {pitchColumns.map((pitch) => {
              const pitchType = pitch.pitch_type ?? "-"
              return (
                <th key={pitchType} className="px-3 py-2 text-center bg-[#151515]">
                  <button
                    className="flex items-center justify-center w-full"
                    onClick={() => handleSort(pitchType)}
                    title={getPitchFullName(pitch.pitch_type)}
                  >
                    {getPitchLabel(pitch.pitch_type)}
                    <SortIcon active={sortKey === pitchType} direction={sortDir} />
                  </button>
                </th>
              )
            })}
            <th className="px-3 py-2 text-center bg-[#151515]">
              <button
                className="flex items-center justify-center w-full"
                onClick={() => handleSort("overall")}
              >
                OVR
                <SortIcon active={sortKey === "overall"} direction={sortDir} />
              </button>
            </th>
          </tr>
          {sortedRows.map((row) => (
            <tr
              key={row.batterId}
              className="border-b border-gray-800/60 text-sm"
            >
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {row.batterHeadshot ? (
                    <Image
                      src={row.batterHeadshot}
                      alt={row.batterName}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted/40" />
                  )}
                  <span className="font-medium text-white/90 whitespace-normal break-words">
                    {row.batterName}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-sm text-white/70">{row.stand}</td>
              {pitchColumns.map((pitch) => {
                const pitchType = pitch.pitch_type ?? "-"
                const score = row.pitchScores[pitchType]
                return (
                  <td
                    key={pitchType}
                    className={cn("px-3 py-2 text-center", getPitchValueClass(score))}
                  >
                    {score == null ? "-" : formatPercent(score)}
                  </td>
                )
              })}
              <td
                className={cn("px-3 py-2 text-center text-base", getOvrValueClass(row.overallScore))}
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

const BatterPitchTable = ({
  pitchColumns,
  rows,
}: {
  pitchColumns: BvpPitch[]
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
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead className="border-b border-gray-700/70">
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2">
              <button
                className="flex items-center text-left"
                onClick={() => handleSort("batter")}
              >
                Batter
                <SortIcon active={sortKey === "batter"} direction={sortDir} />
              </button>
            </th>
            <th className="px-3 py-2">Stance</th>
            {pitchColumns.map((pitch) => {
              const pitchType = pitch.pitch_type ?? "-"
              const usageValue = normalizeUsage(toNumber(pitch.usage_pct))
              return (
                <th key={pitchType} className="px-3 py-2 text-center">
                  <button
                    className="flex flex-col items-center w-full"
                    onClick={() => handleSort(pitchType)}
                  >
                    <span>{pitchType}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {usageValue != null ? `${(usageValue * 100).toFixed(0)}%` : "-"}
                    </span>
                    <SortIcon active={sortKey === pitchType} direction={sortDir} />
                  </button>
                </th>
              )
            })}
            <th className="px-3 py-2 text-center">
              <button
                className="flex items-center justify-center w-full"
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
              className="border-b border-gray-800/60 text-sm"
            >
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  {row.batterHeadshot ? (
                    <Image
                      src={row.batterHeadshot}
                      alt={row.batterName}
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted/40" />
                  )}
                  <span className="font-medium text-white/90">{row.batterName}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-sm text-white/70">{row.stand}</td>
              {pitchColumns.map((pitch) => {
                const pitchType = pitch.pitch_type ?? "-"
                const score = row.pitchScores[pitchType]
                return (
                  <td key={pitchType} className="px-3 py-2 text-center">
                    {score == null ? "-" : formatPercent(score)}
                  </td>
                )
              })}
              <td className="px-3 py-2 text-center font-semibold text-white/90">
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
      <Card className="border" style={PITCH_MATRIX_CARD_STYLE}>
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
            className="flex h-14 w-14 items-center justify-center rounded-md border border-white/15"
            style={{
              backgroundColor: payload.pitcher_team
                ? getTeamLogoColor(payload.pitcher_team)
                : "#1f2937",
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
              <span className="text-xs font-semibold text-white/70">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_1fr]">
        {stands.map((stand, index) => {
          const expected = expectedByStand.get(stand)
          if (!expected) return null
          const pitchColumns = getPitchColumns(expected)
          const batterRows = buildBatterRows(payload, stand, expected, pitchColumns, weightMode)
          return (
            <React.Fragment key={stand}>
              <div className="space-y-2 min-w-0">
                <PitchMatrixTable
                  pitchColumns={pitchColumns}
                  rows={batterRows}
                  batterLabel={`${payload.batter_team ?? label} ${stand}HB`}
                  standLabel={`vs ${stand}HB`}
                  batterLogo={payload.team_logo ?? null}
                  batterTeamAbv={payload.batter_team ?? null}
                  weightMode={weightMode}
                />
              </div>
              {index === 0 ? (
                <div className="hidden xl:flex items-stretch px-2">
                  <div className="w-[10px] border-l-2 border-r-2 border-gray-700/80" />
                </div>
              ) : null}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

const TEAM_SCROLL_ID_PREFIX = "team-"

const TeamLogoStrip = ({ teamsInGames }: { teamsInGames: Set<string> }) => {
  const scrollToTeam = (abbr: string) => {
    const el = document.getElementById(`${TEAM_SCROLL_ID_PREFIX}${abbr}`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-md border border-gray-700 bg-[#151515] p-2">
      {MLB_TEAM_ABBREVS.map((abbr) => {
        const inSlate = teamsInGames.has(abbr)
        const bgColor = getTeamLogoColor(toColorKey(abbr))
        return (
          <button
            key={abbr}
            type="button"
            onClick={() => scrollToTeam(abbr)}
            title={abbr}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/15 transition-opacity",
              inSlate
                ? "opacity-100 hover:opacity-90"
                : "opacity-50 hover:opacity-70"
            )}
            style={{ backgroundColor: bgColor }}
          >
            <Image
              src={`/Images/MLB_Logos/${abbr}.png`}
              alt={abbr}
              width={24}
              height={24}
              className="h-5 w-5 object-contain"
            />
          </button>
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

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading matchups...</div>
  }
  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <TeamLogoStrip teamsInGames={teamsInGames} />
      {games.map((game) => {
        const gameDate = game.gameDate ?? ""
        const awayKey = game.awayTeam?.teamAbv ? `${game.awayTeam.teamAbv}-${gameDate}` : ""
        const homeKey = game.homeTeam?.teamAbv ? `${game.homeTeam.teamAbv}-${gameDate}` : ""
        const awayPayload = awayKey ? payloads[awayKey] ?? null : null
        const homePayload = homeKey ? payloads[homeKey] ?? null : null
        const label = `${game.awayTeam?.teamAbv ?? "TBD"} @ ${game.homeTeam?.teamAbv ?? "TBD"}`

        return (
          <div key={game.gameId} className="space-y-3">
            <Card className="border" style={PITCH_MATRIX_CARD_STYLE}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15"
                      style={{
                        backgroundColor: game.awayTeam?.teamAbv
                          ? getTeamLogoColor(game.awayTeam.teamAbv)
                          : "#1f2937",
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
                        <span className="text-[10px] font-semibold text-white/70">
                          {game.awayTeam?.teamAbv ?? "-"}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-white/90">
                      {label}
                    </span>
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-white/15"
                      style={{
                        backgroundColor: game.homeTeam?.teamAbv
                          ? getTeamLogoColor(game.homeTeam.teamAbv)
                          : "#1f2937",
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
                        <span className="text-[10px] font-semibold text-white/70">
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

            <Card className="border" style={PITCH_MATRIX_CARD_STYLE}>
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
                <div className="border-t-2 border-b border-gray-800/60" />
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
        )
      })}

      {payloadLoading && (
        <div className="text-xs text-muted-foreground">
          Loading matchup payloads...
        </div>
      )}
      <Card className="border" style={PITCH_MATRIX_CARD_STYLE}>
        <CardContent className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Pitch Legend
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {PITCH_LABELS.map((entry) => (
              <div
                key={entry.raw}
                className="flex items-center justify-between rounded-md border border-gray-700/60 bg-[#151515] px-3 py-2 text-xs text-white/80"
              >
                <span className="font-semibold">{entry.raw}</span>
                <span className="text-white/50">→</span>
                <span className="font-semibold">{entry.label}</span>
                <span className="text-white/50">•</span>
                <span className="text-white/70">{entry.name}</span>
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

const TOP_N_PITCHES = 3
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
      <Card className="border" style={PITCH_MATRIX_CARD_STYLE}>
        <CardContent className="p-4">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">
            All batters vs pitchers · sorted by OVR (desc) · click row for full pitches
            {isCapped && (
              <span className="block mt-1 font-normal normal-case text-muted-foreground">
                Showing top {MAX_BATTER_TAB_ROWS} of {rows.length} · use Starters/Relievers to narrow
              </span>
            )}
          </div>
          <TooltipProvider delayDuration={300}>
          <div className="overflow-x-auto rounded-md border border-gray-700/60">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="border-b border-gray-700/70 bg-[#151515]">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Batter</th>
                  <th className="px-2 py-2">Stance</th>
                  <th className="px-1.5 py-2 text-center">Pitch #1</th>
                  <th className="px-1.5 py-2 text-center">Pitch #2</th>
                  <th className="px-1.5 py-2 text-center">Pitch #3</th>
                  <th className="px-2 py-2 text-center">vs</th>
                  <th className="px-2 py-2">Pitcher</th>
                  <th className="px-1.5 py-2 text-center">Pitch #1</th>
                  <th className="px-1.5 py-2 text-center">Pitch #2</th>
                  <th className="px-1.5 py-2 text-center">Pitch #3</th>
                  <th className="px-2 py-2 text-center">OVR</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => {
                  const top3 = row.pitchOrder.slice(0, TOP_N_PITCHES)
                  return (
                    <tr
                      key={`${row.batterId}-${row.pitcherId}-${row.stand}`}
                      className="border-b border-gray-800/60 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => setDetailRow(row)}
                    >
                      <td className="px-2 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/15 overflow-hidden"
                            style={{
                              backgroundColor: row.batterTeam
                                ? getTeamLogoColor(toColorKey(toLogoAbbr(row.batterTeam) ?? ""))
                                : "#1f2937",
                            }}
                            title={row.batterTeam ?? undefined}
                          >
                            {row.batterTeam && toLogoAbbr(row.batterTeam) ? (
                              <Image
                                src={`/Images/MLB_Logos/${toLogoAbbr(row.batterTeam)}.png`}
                                alt={row.batterTeam}
                                width={20}
                                height={20}
                                className="h-5 w-5 object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-semibold text-white/70">
                                {row.batterTeam ?? "-"}
                              </span>
                            )}
                          </span>
                          {row.batterHeadshot ? (
                            <Image
                              src={row.batterHeadshot}
                              alt={row.batterName}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-full object-cover shrink-0"
                              unoptimized
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-muted/40 shrink-0" />
                          )}
                          <span className="font-medium text-white/90 truncate max-w-[120px]">
                            {row.batterName}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-white/70">{row.stand}HB</td>
                      {[0, 1, 2].map((i) => {
                        const pt = top3[i]
                        const rating = pt != null ? row.pitchRatings[pt] : null
                        const label = pt != null ? getPitchLabel(pt) : ""
                        return (
                          <td key={i} className="px-1.5 py-2 text-center">
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
                                {label ? `${label} rating: ${rating != null ? `${rating.toFixed(0)}%` : "—"}` : "—"}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        )
                      })}
                      <td className="px-2 py-2 text-center text-muted-foreground">vs</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/15 overflow-hidden"
                            style={{
                              backgroundColor: row.pitcherTeam
                                ? getTeamLogoColor(toColorKey(toLogoAbbr(row.pitcherTeam) ?? ""))
                                : "#1f2937",
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
                              <span className="text-[10px] font-semibold text-white/70">
                                {row.pitcherTeam ?? "-"}
                              </span>
                            )}
                          </span>
                          {row.pitcherHeadshot ? (
                            <Image
                              src={row.pitcherHeadshot}
                              alt={row.pitcherName}
                              width={28}
                              height={28}
                              className="h-7 w-7 rounded-full object-cover shrink-0"
                              unoptimized
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full bg-muted/40 shrink-0" />
                          )}
                          <span className="font-medium text-white/90 truncate max-w-[120px]">
                            {row.pitcherName}
                          </span>
                        </div>
                      </td>
                      {[0, 1, 2].map((i) => {
                        const pt = top3[i]
                        const usage = pt != null ? row.pitchUsage[pt] : null
                        const rating = pt != null ? row.pitchRatings[pt] : null
                        const usageStr = usage != null ? `${(usage * 100).toFixed(0)}%` : "-"
                        const ratingStr = rating != null ? `${rating.toFixed(0)}%` : "-"
                        const label = pt != null ? getPitchLabel(pt) : ""
                        return (
                          <td key={i} className="px-1.5 py-2 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className={cn(
                                    "text-xs cursor-default",
                                    "inline-flex items-baseline gap-1"
                                  )}
                                >
                                  {label ? (
                                    <>
                                      <span className="font-medium text-white/80">{label}</span>
                                      <span className={getUsageValueClass(usage)}>{usageStr}</span>
                                      <span className="text-muted-foreground">/</span>
                                      <span className={cn("font-medium", getPitchValueClass(rating))}>
                                        {ratingStr}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className={getUsageValueClass(usage)}>{usageStr}</span>
                                      <span className="text-muted-foreground">/</span>
                                      <span className={cn("font-medium", getPitchValueClass(rating))}>
                                        {ratingStr}
                                      </span>
                                    </>
                                  )}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                {label ? `${label}: Usage ${usageStr} · Rating ${ratingStr}` : "—"}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        )
                      })}
                      <td className="px-2 py-2 text-center">
                        <span className={cn("font-semibold", getOvrValueClass(row.overallScore))}>
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
          className="max-w-lg border-0 p-0 gap-0 overflow-hidden text-card-foreground bg-[#171717] border border-gray-700 shadow-xl"
          style={{
            ...PITCH_MATRIX_CARD_STYLE,
            backgroundColor: "#171717",
          }}
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
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded overflow-hidden"
                  style={{
                    backgroundColor: detailRow.batterTeam
                      ? getTeamLogoColor(toColorKey(toLogoAbbr(detailRow.batterTeam) ?? ""))
                      : "#1f2937",
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
                    <span className="text-[9px] font-semibold text-white/70">{detailRow.batterTeam ?? "-"}</span>
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
                  <span className="font-semibold text-white/95 text-sm truncate block">{detailRow.batterName}</span>
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
                  <span className="font-semibold text-white/95 text-sm truncate block">{detailRow.pitcherName}</span>
                </div>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded overflow-hidden"
                  style={{
                    backgroundColor: detailRow.pitcherTeam
                      ? getTeamLogoColor(toColorKey(toLogoAbbr(detailRow.pitcherTeam) ?? ""))
                      : "#1f2937",
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
                    <span className="text-[9px] font-semibold text-white/70">{detailRow.pitcherTeam ?? "-"}</span>
                  )}
                </span>
              </div>

              {/* Pitch table */}
              <div className="pt-4 pb-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  All pitches
                </div>
                <div className="rounded-lg border border-gray-700/60 overflow-hidden bg-[#0d0d0d]/40">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700/70 bg-[#151515]/90">
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Pitch
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20">
                          Usage
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                          Pitch rating
                        </th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                          Batter rating
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRow.pitchOrder.map((pt, idx) => {
                        const usage = detailRow.pitchUsage[pt]
                        const rating = detailRow.pitchRatings[pt]
                        return (
                          <tr
                            key={pt}
                            className={cn(
                              "border-b border-gray-800/50 transition-colors",
                              idx % 2 === 0 ? "bg-[#151515]/30" : "bg-[#151515]/50"
                            )}
                          >
                            <td className="px-3 py-2.5">
                              <span
                                className="inline-flex rounded-md border border-gray-600/50 bg-white/5 px-2 py-0.5 font-medium text-white/90"
                                title={getPitchFullName(pt)}
                              >
                                {getPitchLabel(pt)}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={cn("font-medium tabular-nums", getUsageValueClass(usage))}>
                                {usage != null ? `${(usage * 100).toFixed(0)}%` : "—"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={cn("font-medium tabular-nums", getPitchValueClass(rating))}>
                                {rating != null ? `${rating.toFixed(0)}%` : "—"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
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
                <div className="flex items-center justify-between rounded-lg border border-gray-700/60 bg-[#151515]/60 px-4 py-3">
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

  return (
    <div className="space-y-6">
      <div className="sticky top-14 z-30">
        <div className="rounded-lg border border-gray-800 bg-[#141414]/90 px-3 py-2 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
            {TAB_ITEMS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition-none",
                  activeTab === tab
                    ? "bg-muted text-white"
                    : "text-muted-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
            {activeTab === "Matchups" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  OVR Mode
                </span>
                <div className="flex items-center rounded-md border border-gray-700/60 bg-[#151515] p-1">
                  <button
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition-none",
                      weightMode === "avg"
                        ? "bg-muted text-white"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setWeightMode("avg")}
                  >
                    AVG
                  </button>
                  <button
                    className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md transition-none",
                      weightMode === "hr"
                        ? "bg-muted text-white"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setWeightMode("hr")}
                  >
                    HR
                  </button>
                </div>
              </div>
            ) : null}
            {activeTab === "Batter" ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Pitcher
                </span>
                <div className="flex items-center rounded-md border border-gray-700/60 bg-[#151515] p-1">
                  {PITCHER_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPitcherFilter(opt.value)}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-md transition-none",
                        pitcherFilter === opt.value
                          ? "bg-muted text-white"
                          : "text-muted-foreground"
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
      </div>

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
      {/* Mount Batter tab as soon as we have games so it loads in background; hide until selected */}
      {games.length > 0 && (
        <div
          style={{ display: activeTab === "Batter" ? "block" : "none" }}
          aria-hidden={activeTab !== "Batter"}
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
        <Card className="border" style={PITCH_MATRIX_CARD_STYLE}>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Pitcher tab layout placeholder — will connect to pitcher payloads next.
          </CardContent>
        </Card>
      )}
      {activeTab === "H2H" && (
        <Card className="border" style={PITCH_MATRIX_CARD_STYLE}>
          <CardContent className="p-4 text-sm text-muted-foreground">
            H2H tab layout placeholder — matchup history view coming next.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

