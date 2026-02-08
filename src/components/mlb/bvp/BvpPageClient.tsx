"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { DataTableViewport } from "@/components/ui/data-table-viewport"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronDown, ChevronRight, ChevronUp, Loader2 } from "lucide-react"
import mlbTeamColors from "@/data/mlb-team-colors.json"
import type {
  BvpMatchupResponse,
  BvpSummaryRow,
  BvpPaDetail,
  BvpMatchupsListResponse,
  BvpPaPayloadResponse,
} from "@/lib/mlb/bvp-types"
import {
  BVP_TABLE_COLUMNS,
  BVP_TABLE_COL_COUNT,
  BVP_TABLE_MIN_WIDTH_PX,
  tableColAlignClass,
} from "@/lib/table-columns"

type TeamColorEntry = {
  teamAbv: string
  primary: string
  secondary: string
  logoBg?: "primary" | "secondary"
  logoBgColor?: string
}
const teamColorMap = new Map(
  (mlbTeamColors as TeamColorEntry[]).map((e) => [e.teamAbv, e])
)
const ABBR_TO_COLOR_KEY: Record<string, string> = {
  KCR: "KC", SDP: "SD", SFG: "SF", TBR: "TB", WSN: "WSH",
}
function getTeamLogoColor(teamAbv: string): string {
  const key = ABBR_TO_COLOR_KEY[teamAbv] ?? teamAbv
  const entry = teamColorMap.get(key)
  if (!entry) return "#1f2937"
  if (entry.logoBgColor) return entry.logoBgColor
  return entry.logoBg === "primary" ? entry.primary : entry.secondary
}

/** Small team logo box (left of name); kept compact per request */
function TeamLogoBox({ teamAbv, logoPath }: { teamAbv: string; logoPath: string }) {
  return (
    <div
      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border border-white/15"
      style={{ backgroundColor: getTeamLogoColor(teamAbv) }}
    >
      {logoPath ? (
        <Image
          src={logoPath}
          alt={teamAbv}
          width={14}
          height={14}
          className="h-[14px] w-[14px] object-contain"
        />
      ) : (
        <span className="text-[8px] font-semibold text-white/80">{teamAbv.slice(0, 2)}</span>
      )}
    </div>
  )
}

type SortCol = "batter" | "pitcher" | "pa" | "ab" | "h" | "hr" | "bb" | "so" | "avg" | "obp" | "slg" | "ops"
const SORT_COLS: { key: SortCol; apiKey: string; label: string }[] = [
  { key: "pa", apiKey: "pa", label: "PA" },
  { key: "ab", apiKey: "ab", label: "AB" },
  { key: "h", apiKey: "h", label: "H" },
  { key: "hr", apiKey: "hr", label: "HR" },
  { key: "bb", apiKey: "bb", label: "BB" },
  { key: "so", apiKey: "so", label: "SO" },
  { key: "avg", apiKey: "avg", label: "AVG" },
  { key: "obp", apiKey: "obp", label: "OBP" },
  { key: "slg", apiKey: "slg", label: "SLG" },
  { key: "ops", apiKey: "ops", label: "OPS" },
]

function formatRate(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—"
  return n.toFixed(3)
}

function buildDetailsKey(matchupGameID: string, batter: number, pitcher: number): string {
  return `${matchupGameID}-${batter}-${pitcher}`
}

/** Convert API snake_case to Title Case with spaces */
function formatPaLabel(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "—"
  return raw
    .trim()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/** Result type for PA table coloring */
const PA_RESULT_HIT_KEYS = ["single", "double", "triple"]
const PA_RESULT_HR_KEYS = ["home_run", "homerun", "home run"]

function formatPaResult(raw: string | null | undefined): { label: string; className: string } {
  const label = formatPaLabel(raw)
  if (!label || label === "—") return { label: "—", className: "text-muted-foreground" }
  const lower = (raw ?? "").toLowerCase().replace(/\s+/g, "_")
  if (PA_RESULT_HR_KEYS.some((k) => lower.includes(k))) return { label, className: "font-medium text-amber-400" }
  if (PA_RESULT_HIT_KEYS.some((k) => lower === k)) return { label, className: "font-medium text-emerald-400" }
  return { label, className: "text-foreground" }
}

/** Sentinel value for "All matchups"; Radix Select forbids value="" */
const ALL_MATCHUPS_VALUE = "__all__"

const ROWS_PER_PAGE = 100

export function BvpPageClient() {
  const [matchups, setMatchups] = React.useState<BvpMatchupsListResponse["matchups"]>([])
  const [matchupGameID, setMatchupGameID] = React.useState<string>(ALL_MATCHUPS_VALUE)
  const [summary, setSummary] = React.useState<BvpMatchupResponse | null>(null)
  const [loadingMatchups, setLoadingMatchups] = React.useState(true)
  const [loadingSummary, setLoadingSummary] = React.useState(false)
  /** PA details keyed by buildDetailsKey(matchup_gameID, batter, pitcher); loaded once with summary, 24h cached server-side */
  const [paPayloadMap, setPaPayloadMap] = React.useState<Record<string, BvpPaDetail[]>>({})
  const [loadingPaPayload, setLoadingPaPayload] = React.useState(false)
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null)

  // Filters: default all matchups, sort by H, starters only on
  const [starterOnly, setStarterOnly] = React.useState(true)
  const [relieversOnly, setRelieversOnly] = React.useState(false)
  const [minPA, setMinPA] = React.useState<string>("")
  const [search, setSearch] = React.useState("")
  const [sortBy, setSortBy] = React.useState<SortCol>("h")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = React.useState(1)

  // Fetch matchups list on mount (for dropdown only)
  React.useEffect(() => {
    let cancelled = false
    setLoadingMatchups(true)
    fetch("/api/mlb/bvp/matchups")
      .then((r) => r.json())
      .then((data: BvpMatchupsListResponse) => {
        if (!cancelled && data.matchups?.length) setMatchups(data.matchups)
      })
      .finally(() => setLoadingMatchups(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Build query params shared by summary and pa-payload (same filters)
  const summaryParams = React.useMemo(() => {
    const apiSortKey = SORT_COLS.find((c) => c.key === sortBy)?.apiKey ?? "h"
    const params = new URLSearchParams({ limit: "500", sort: apiSortKey, sortDir })
    if (matchupGameID && matchupGameID !== ALL_MATCHUPS_VALUE) params.set("matchup_gameID", matchupGameID)
    if (starterOnly) params.set("starterOnly", "true")
    if (relieversOnly) params.set("relieversOnly", "true")
    if (minPA.trim()) params.set("minPA", minPA.trim())
    if (search.trim()) params.set("search", search.trim())
    return params
  }, [matchupGameID, starterOnly, relieversOnly, minPA, search, sortBy, sortDir])

  // Fetch summary when matchup or filters change
  React.useEffect(() => {
    let cancelled = false
    setLoadingSummary(true)
    fetch(`/api/mlb/bvp/matchup?${summaryParams}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then((data: BvpMatchupResponse) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {
        if (!cancelled) setSummary(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingSummary(false)
      })
    return () => {
      cancelled = true
    }
  }, [summaryParams.toString()])

  // Fetch bulk PA payload with same filters; server caches 24h. One load per page/filter change.
  const summaryParamString = summaryParams.toString()
  React.useEffect(() => {
    let cancelled = false
    setLoadingPaPayload(true)
    const paParams = new URLSearchParams(summaryParamString)
    paParams.set("limit", "500")
    fetch(`/api/mlb/bvp/pa-payload?${paParams}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then((data: BvpPaPayloadResponse) => {
        if (cancelled) return
        const map: Record<string, BvpPaDetail[]> = {}
        for (const p of data.payloads ?? []) {
          const key = buildDetailsKey(p.matchup_gameID, p.batter, p.pitcher)
          map[key] = p.pa_details ?? []
        }
        setPaPayloadMap(map)
      })
      .catch(() => {
        if (!cancelled) setPaPayloadMap({})
      })
      .finally(() => {
        if (!cancelled) setLoadingPaPayload(false)
      })
    return () => {
      cancelled = true
    }
  }, [summaryParamString])

  const toggleExpand = React.useCallback((row: BvpSummaryRow) => {
    const key = buildDetailsKey(row.matchup_gameID, row.batter, row.pitcher)
    setExpandedKey((prev) => (prev === key ? null : key))
  }, [])

  const rows = summary?.rows ?? []
  const totalRows = rows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE))
  const pageStart = (currentPage - 1) * ROWS_PER_PAGE
  const paginatedRows = React.useMemo(
    () => rows.slice(pageStart, pageStart + ROWS_PER_PAGE),
    [rows, pageStart]
  )

  React.useEffect(() => {
    setCurrentPage(1)
    setExpandedKey(null)
  }, [matchupGameID, starterOnly, relieversOnly, minPA, search, sortBy, sortDir])

  const handleSortClick = React.useCallback((col: SortCol) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortBy(col); setSortDir("desc") }
  }, [sortBy])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-gray-700 bg-[#171717] shadow-none">
        <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden pt-4">
          {/* Filters: Player search first, then matchup, sort, min PA, then checkboxes */}
          <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Player search</label>
              <Input
                placeholder="Batter or pitcher name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 rounded-md border border-gray-700 bg-[#171717]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Matchup</label>
              <Select
                value={matchupGameID}
                onValueChange={setMatchupGameID}
                disabled={loadingMatchups}
              >
                <SelectTrigger className="w-[220px] rounded-md border border-gray-700 bg-[#171717]">
                  <SelectValue placeholder={loadingMatchups ? "Loading…" : "All matchups"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_MATCHUPS_VALUE}>All matchups</SelectItem>
                  {matchups.map((m) => (
                    <SelectItem key={m.matchup_gameID} value={m.matchup_gameID}>
                      {m.matchup_gameID}
                      {m.matchup_game_date ? ` (${m.matchup_game_date})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">Min PA</label>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={minPA}
                onChange={(e) => setMinPA(e.target.value)}
                className="w-20 rounded-md border border-gray-700 bg-[#171717]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={starterOnly}
                  onChange={(e) => setStarterOnly(e.target.checked)}
                  className="rounded border-border"
                />
                Starter only
              </label>
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={relieversOnly}
                  onChange={(e) => setRelieversOnly(e.target.checked)}
                  className="rounded border-border"
                />
                Relievers only
              </label>
            </div>
          </div>

          {/* Table + footer in one bordered card (same pattern as NBA Market) */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
            <DataTableViewport
              maxHeight="100%"
              className="h-full min-h-0 flex-1 border-0 rounded-none bg-transparent shadow-none"
            >
              {/* Table must be direct child of scroll container so sticky thead works (no wrapper with overflow) */}
              <table
                className="table-fixed border-collapse text-sm w-full"
                style={{ minWidth: BVP_TABLE_MIN_WIDTH_PX }}
              >
                  <colgroup>
                    {BVP_TABLE_COLUMNS.map((col, i) => (
                      <col key={i} style={{ width: col.widthPx }} />
                    ))}
                  </colgroup>
                  <thead className="sticky top-0 z-10 border-b border-border bg-[#171717] text-muted-foreground">
                    <tr>
                      <th className="px-2 py-2 font-medium" style={{ width: BVP_TABLE_COLUMNS[0].widthPx }} />
                      <th className={tableColAlignClass(BVP_TABLE_COLUMNS[1]) + " px-2 py-2 font-medium whitespace-nowrap"}>Batter</th>
                      <th className={tableColAlignClass(BVP_TABLE_COLUMNS[2]) + " px-2 py-2 font-medium whitespace-nowrap"}>Pitcher</th>
                      <th className={tableColAlignClass(BVP_TABLE_COLUMNS[3]) + " px-2 py-2 font-medium whitespace-nowrap"}>Type</th>
                      {SORT_COLS.map(({ key, label }, idx) => (
                        <th key={key} className={tableColAlignClass(BVP_TABLE_COLUMNS[4 + idx]) + " px-2 py-2 font-medium whitespace-nowrap"}>
                          <button
                            type="button"
                            onClick={() => handleSortClick(key)}
                            className="inline-flex items-center justify-end gap-0.5 hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded w-full"
                          >
                            {label}
                            {sortBy === key &&
                              (sortDir === "asc" ? (
                                <ChevronUp className="h-3 w-3 shrink-0" />
                              ) : (
                                <ChevronDown className="h-3 w-3 shrink-0" />
                              ))}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSummary && rows.length === 0 ? (
                      <tr>
                        <td colSpan={BVP_TABLE_COL_COUNT} className="px-2 py-8 text-center text-muted-foreground">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading summary…
                          </span>
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td colSpan={BVP_TABLE_COL_COUNT} className="px-2 py-8 text-center text-muted-foreground">
                          {matchupGameID !== ALL_MATCHUPS_VALUE
                            ? "No rows for this matchup with current filters."
                            : "No rows. Try adjusting filters (e.g. turn off Starter only)."}
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((row) => {
                        const key = buildDetailsKey(row.matchup_gameID, row.batter, row.pitcher)
                        const isExpanded = expandedKey === key
                        const paDetails = paPayloadMap[key]
                        const loadingDetail = loadingPaPayload
                        return (
                          <React.Fragment key={key}>
                            <tr
                              className={`border-b border-border hover:bg-muted/30 ${isExpanded ? "bg-muted/20" : ""}`}
                              onClick={() => toggleExpand(row)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault()
                                  toggleExpand(row)
                                }
                              }}
                            >
                              <td className="px-2 py-1.5 whitespace-nowrap">
                                <span className="inline-flex cursor-pointer text-muted-foreground">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 whitespace-nowrap overflow-hidden text-ellipsis" title={row.batter_name}>
                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                  <TeamLogoBox teamAbv={row.batter_team} logoPath={row.team_logo} />
                                  <span className="truncate font-medium">{row.batter_name}</span>
                                </span>
                              </td>
                              <td className="px-2 py-1.5 whitespace-nowrap overflow-hidden text-ellipsis" title={row.pitcher_name}>
                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                  <TeamLogoBox teamAbv={row.pitcher_team} logoPath={row.opponent_logo} />
                                  <span className="truncate">{row.pitcher_name}</span>
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-center whitespace-nowrap">
                                <span className="inline-flex flex-wrap justify-center gap-0.5">
                                  {row.is_vs_expected_starter ? (
                                    <Badge variant="secondary" className="text-[10px] px-1">SP</Badge>
                                  ) : null}
                                  {row.is_vs_relief_pitcher || row.pitcher_position_group === "RP" ? (
                                    <Badge variant="outline" className="text-[10px] px-1">RP</Badge>
                                  ) : null}
                                </span>
                              </td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{row.pa}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{row.ab}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{row.h}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{row.hr}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{row.bb}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{row.so}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatRate(row.avg)}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatRate(row.obp)}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatRate(row.slg)}</td>
                              <td className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{formatRate(row.ops)}</td>
                            </tr>
                            {isExpanded && (
                              <PaDetailsCell
                                loading={loadingDetail}
                                details={paDetails}
                                matchupGameDate={summary?.matchup_game_date}
                              />
                            )}
                          </React.Fragment>
                        )
                      })
                    )}
                  </tbody>
                </table>
            </DataTableViewport>
            {/* Pagination footer — always visible, part of the table card (like NBA Market) */}
            <footer className="flex flex-shrink-0 items-center justify-between border-t border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <span>
                {pageStart + 1}–{Math.min(pageStart + ROWS_PER_PAGE, totalRows)} of {totalRows.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded border border-border bg-transparent px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="px-2 text-xs">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded border border-border bg-transparent px-2 py-1 text-xs hover:bg-muted/50 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PaDetailsCell({
  loading,
  details,
}: {
  loading?: boolean
  details?: BvpPaDetail[]
  matchupGameDate?: string
}) {
  if (loading) {
    return (
      <tr>
        <td colSpan={BVP_TABLE_COL_COUNT} className="border-b border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading plate appearances…
          </span>
        </td>
      </tr>
    )
  }
  if (!details || details.length === 0) {
    return (
      <tr>
        <td colSpan={BVP_TABLE_COL_COUNT} className="border-b border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
          No plate appearance details in payload for this matchup. Data is loaded from{" "}
          <code className="text-xs">bvp_payload_v1.pa_details</code>; if the table has no rows or
          empty <code className="text-xs">pa_details</code> for this batter/pitcher, none will show.
        </td>
      </tr>
    )
  }
  return (
    <tr>
      <td colSpan={BVP_TABLE_COL_COUNT} className="border-b border-border bg-muted/10 p-0 align-top">
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-[#171717] text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 whitespace-nowrap">Date</th>
                <th className="px-3 py-2 whitespace-nowrap">Inning</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Outs</th>
                <th className="px-3 py-2 whitespace-nowrap">Result</th>
                <th className="px-3 py-2 whitespace-nowrap text-muted-foreground font-normal normal-case">Description</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Count</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Pitch count</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Balls</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Strikes</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Swings</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Whiffs</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Contacts</th>
                <th className="px-3 py-2 whitespace-nowrap text-center">Fouls</th>
              </tr>
            </thead>
            <tbody>
              {details.map((pa, i) => {
                const result = formatPaResult(pa.pa_end_events || pa.pa_end_description)
                const descRaw = pa.pa_end_description && pa.pa_end_events !== pa.pa_end_description ? pa.pa_end_description : null
                const num = (n: number | null | undefined) => (n != null ? String(n) : "—")
                return (
                  <tr
                    key={`${pa.pa_game_pk}-${pa.at_bat_number}-${i}`}
                    className="border-b border-border/50 hover:bg-muted/20"
                  >
                    <td className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">{pa.pa_game_date || "—"}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">{pa.inning_topbot} {pa.inning}</td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap text-muted-foreground tabular-nums">
                      {pa.outs_when_up} out{pa.outs_when_up !== 1 ? "s" : ""}
                    </td>
                    <td className={`px-3 py-1.5 whitespace-nowrap ${result.className}`}>{result.label}</td>
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">
                      {formatPaLabel(descRaw) || "—"}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {pa.pa_pitch_count != null && pa.pa_pitch_count > 0
                        ? `${pa.pa_balls}-${pa.pa_strikes}`
                        : "—"}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {num(pa.pa_pitch_count)}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {num(pa.pa_balls)}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {num(pa.pa_strikes)}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {num(pa.pa_swings)}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {num(pa.pa_whiffs)}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {num(pa.pa_contacts)}
                    </td>
                    <td className="px-3 py-1.5 text-center whitespace-nowrap tabular-nums text-muted-foreground">
                      {num(pa.pa_fouls)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}
