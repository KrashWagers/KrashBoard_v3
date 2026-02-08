"use client"

import * as React from "react"
import { useMemo, useState, useRef } from "react"
import Image from "next/image"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useNbaProps } from "@/hooks/use-nba-props"
import { DataTableViewport } from "@/components/ui/data-table-viewport"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Filter, RefreshCw, ExternalLink } from "lucide-react"
import type { FlatSelection } from "@/lib/nba/types"
import { getSportsbookLogoUrl, getSportsbookLabel } from "@/lib/sportsbook-logos"

function formatGame(s: FlatSelection): string {
  const away = s.away_team ?? "?"
  const home = s.home_team ?? "?"
  const t = s.start_time_utc
    ? new Date(s.start_time_utc).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : ""
  return `${away} @ ${home}${t ? ` · ${t}` : ""}`
}

function formatMarketSide(s: FlatSelection): string {
  const stat = s.stat_id ?? "?"
  const line = s.line != null ? String(s.line) : ""
  const side = s.side_id ?? ""
  return `${stat} ${line} ${side}`.trim()
}

const ROW_HEIGHT = 40

const EV_GRID_COLUMNS =
  "minmax(140px, 1fr) minmax(100px, 0.9fr) minmax(120px, 1fr) minmax(72px, 0.5fr) minmax(56px, 0.4fr) minmax(52px, 0.4fr) minmax(72px, 0.55fr) minmax(56px, 0.4fr) minmax(56px, 0.4fr) minmax(56px, 0.4fr) minmax(64px, 0.5fr)"

export function NbaEvClient() {
  const { data, isLoading, error, refetch, isFetching } = useNbaProps()
  const [playerSearch, setPlayerSearch] = useState("")
  const [statFilter, setStatFilter] = useState("")
  const [showAltLines, setShowAltLines] = useState(true)
  const [showAllWithoutFairProb, setShowAllWithoutFairProb] = useState(false)
  const [minEv, setMinEv] = useState<number | "">("")
  const [minEdge, setMinEdge] = useState<number | "">("")
  const parentRef = useRef<HTMLDivElement>(null)

  const flatSelections = useMemo(() => {
    if (!data?.data?.flatSelections) return []
    return data.data.flatSelections
  }, [data])

  const filteredSelections = useMemo(() => {
    let list = flatSelections
    if (!showAllWithoutFairProb) {
      list = list.filter((s) => s.ev_per_dollar != null)
    }
    if (playerSearch.trim()) {
      const q = playerSearch.trim().toLowerCase()
      list = list.filter((s) =>
        (s.player_name ?? "").toLowerCase().includes(q)
      )
    }
    if (statFilter.trim()) {
      const q = statFilter.trim().toLowerCase()
      list = list.filter((s) =>
        (s.stat_id ?? "").toLowerCase().includes(q)
      )
    }
    if (!showAltLines) list = list.filter((s) => !s.is_alt_line)
    if (minEv !== "" && typeof minEv === "number") {
      const minEvMult = 1 + minEv / 100
      list = list.filter(
        (s) => s.ev_per_dollar != null && s.ev_per_dollar >= minEvMult
      )
    }
    if (minEdge !== "" && typeof minEdge === "number") {
      const minEdgeDec = minEdge / 100
      list = list.filter(
        (s) => s.prob_edge != null && s.prob_edge >= minEdgeDec
      )
    }
    return list
  }, [
    flatSelections,
    showAllWithoutFairProb,
    playerSearch,
    statFilter,
    showAltLines,
    minEv,
    minEdge,
  ])

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: EV_GRID_COLUMNS,
  } as const

  const rowVirtualizer = useVirtualizer({
    count: filteredSelections.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
  })

  if (isLoading && !data) {
    return (
      <div className="w-full space-y-4">
        <div className="flex h-10 items-center gap-2 rounded-md border border-gray-700 bg-[#171717] px-3" />
        <Card>
          <CardContent className="flex h-[400px] items-center justify-center text-muted-foreground">
            Loading props…
          </CardContent>
        </Card>
      </div>
    )
  }
  if (error) {
    return (
      <div className="w-full space-y-4">
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            {error instanceof Error ? error.message : String(error)}
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="w-full min-w-0 space-y-3">
      {/* Compact filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Input
          placeholder="Search players…"
          value={playerSearch}
          onChange={(e) => setPlayerSearch(e.target.value)}
          className="h-8 w-40 border-gray-600 bg-[#0a0a0a] text-sm"
        />
        <Input
          placeholder="Stat"
          value={statFilter}
          onChange={(e) => setStatFilter(e.target.value)}
          className="h-8 w-24 border-gray-600 bg-[#0a0a0a] text-sm"
        />
        <Input
          type="number"
          placeholder="Min EV%"
          value={minEv === "" ? "" : minEv}
          onChange={(e) => {
            const v = e.target.value
            setMinEv(v === "" ? "" : Number(v))
          }}
          className="h-8 w-20 border-gray-600 bg-[#0a0a0a] text-sm"
        />
        <Input
          type="number"
          placeholder="Min Edge%"
          value={minEdge === "" ? "" : minEdge}
          onChange={(e) => {
            const v = e.target.value
            setMinEdge(v === "" ? "" : Number(v))
          }}
          className="h-8 w-20 border-gray-600 bg-[#0a0a0a] text-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-gray-600 text-muted-foreground"
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 rounded-md border-gray-700 bg-[#171717] p-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="ev-alt" className="text-sm">Alt lines</Label>
                <Switch
                  id="ev-alt"
                  checked={showAltLines}
                  onCheckedChange={setShowAltLines}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-all-ev" className="text-sm">Show all (no fair prob)</Label>
                <Switch
                  id="show-all-ev"
                  checked={showAllWithoutFairProb}
                  onCheckedChange={setShowAllWithoutFairProb}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {filteredSelections.length.toLocaleString()} of {flatSelections.length.toLocaleString()} rows
        </span>
      </div>

      {/* Grid-based table — virtualized, scrolls inside DataTableViewport */}
      <DataTableViewport
        maxHeight="min(70vh, 680px)"
        scrollRef={parentRef}
        className="min-w-0"
      >
        <div className="min-w-max">
          {/* Header — same grid as body rows */}
          <div
            className="sticky top-0 z-10 grid border-b border-border bg-card px-2 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground"
              style={gridStyle}
            >
              <div className="truncate">Game</div>
              <div className="truncate">Player</div>
              <div className="truncate">Market · Side</div>
              <div className="truncate">Book</div>
              <div className="truncate text-right">Odds</div>
              <div className="truncate text-right">Fair%</div>
              <div className="truncate text-right">EV%</div>
              <div className="truncate text-right">Edge</div>
              <div className="truncate text-right">¼ Kelly</div>
              <div className="truncate text-right">Updated</div>
              <div className="truncate text-center">Link</div>
            </div>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((vRow) => {
                const s = filteredSelections[vRow.index]
                const evPct =
                  s.ev_per_dollar != null
                    ? ((s.ev_per_dollar - 1) * 100).toFixed(1)
                    : "—"
                const isPositiveEv =
                  s.ev_per_dollar != null && s.ev_per_dollar >= 1
                return (
                  <div
                    key={`${s.selection_key}-${s.bookmaker_id}`}
                    className="absolute left-0 top-0 grid w-full border-b border-gray-700/50 px-2 py-1.5 text-sm hover:bg-[#1f1f1f]"
                    style={{
                      ...gridStyle,
                      height: `${vRow.size}px`,
                      transform: `translateY(${vRow.start}px)`,
                    }}
                  >
                    <div className="truncate text-muted-foreground">
                      {formatGame(s)}
                    </div>
                    <div className="truncate">{s.player_name ?? "—"}</div>
                    <div className="truncate text-muted-foreground">
                      {formatMarketSide(s)}
                    </div>
                    <div className="flex items-center gap-1.5 truncate text-muted-foreground">
                      {(() => {
                        const logo = getSportsbookLogoUrl(s.bookmaker_id)
                        return logo ? (
                          <Image
                            src={logo}
                            alt=""
                            width={18}
                            height={18}
                            className="h-[18px] w-[18px] shrink-0 rounded-full object-contain"
                          />
                        ) : null
                      })()}
                      <span className="truncate">
                        {getSportsbookLabel(s.bookmaker_id)}
                      </span>
                    </div>
                    <div className="truncate text-right font-mono">
                      {s.odds_american ?? "—"}
                    </div>
                    <div className="truncate text-right text-muted-foreground">
                      {s.fair_prob != null
                        ? `${(s.fair_prob * 100).toFixed(1)}%`
                        : "—"}
                    </div>
                    <div
                      className={`truncate text-right font-mono ${
                        isPositiveEv ? "font-medium text-emerald-500" : "text-muted-foreground"
                      }`}
                    >
                      {evPct === "—" ? "—" : `${evPct}%`}
                    </div>
                    <div className="truncate text-right text-muted-foreground">
                      {s.prob_edge != null
                        ? `${(s.prob_edge * 100).toFixed(1)}%`
                        : "—"}
                    </div>
                    <div className="truncate text-right text-muted-foreground">
                      {s.kelly_quarter != null
                        ? `${(s.kelly_quarter * 100).toFixed(1)}%`
                        : "—"}
                    </div>
                    <div className="truncate text-right text-muted-foreground text-xs">
                      {s.last_price_update_utc
                        ? new Date(s.last_price_update_utc).toLocaleTimeString(
                            "en-US",
                            { hour: "numeric", minute: "2-digit" }
                          )
                        : "—"}
                    </div>
                    <div className="flex items-center justify-center">
                      {s.deeplink ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 gap-1 border-emerald-700/50 bg-emerald-950/30 px-1.5 text-xs text-emerald-400 hover:bg-emerald-900/30"
                          asChild
                        >
                          <a
                            href={s.deeplink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Bet
                          </a>
                        </Button>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
      </DataTableViewport>
    </div>
  )
}
