"use client"

import * as React from "react"
import { useMemo, useState, useRef, useCallback } from "react"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useNbaProps } from "@/hooks/use-nba-props"
import { DataTableViewport } from "@/components/ui/data-table-viewport"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Filter, RefreshCw, GripVertical, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Plus, Minus, Anchor, SplitSquareVertical, Eraser } from "lucide-react"
import type { PropGroup } from "@/lib/nba/types"
import {
  getSportsbookLogoUrl,
  getSportsbookLabel,
  ALL_MARKET_BOOKS,
  DEFAULT_MARKET_BOOK_ORDER,
} from "@/lib/sportsbook-logos"

function formatGame(g: PropGroup): string {
  const away = g.away_team ?? "?"
  const home = g.home_team ?? "?"
  const t = g.start_time_utc
    ? new Date(g.start_time_utc).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : ""
  return `${away} @ ${home}${t ? ` · ${t}` : ""}`
}

/** Known stat_id overrides for display (e.g. threepointersmade → Threes Made). Keys are normalized: lowercased, no spaces/underscores. */
const PROP_LABEL_OVERRIDES: Record<string, string> = {
  threepointersmade: "Threes Made",
  "3pointersmade": "Threes Made",
}

/** Capitalize stat/prop name; for combos like "points+assists" → "Points + Assists" (space and capitalize after "+"). */
function formatPropLabel(statId: string): string {
  if (!statId) return "—"
  const key = statId.toLowerCase().replace(/[\s_-]/g, "")
  if (PROP_LABEL_OVERRIDES[key]) return PROP_LABEL_OVERRIDES[key]
  return statId
    .split("+")
    .map((part) =>
      part
        .split(/[\s_-]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    )
    .join(" + ")
}

function formatMarket(g: PropGroup): string {
  const stat = formatPropLabel(g.stat_id ?? "")
  const line = g.line != null ? String(g.line) : ""
  return [stat, line].filter(Boolean).join(" ") || "—"
}

/** Market name only (no line), for the Market column */
function formatMarketName(g: PropGroup): string {
  return formatPropLabel(g.stat_id ?? "") || "—"
}

const ROW_HEIGHT = 56
const ROWS_PER_PAGE = 50
const BOOK_LOGO_SIZE = 48

function SortableBookHeader({
  id,
  isReorderMode,
  children,
}: {
  id: string
  isReorderMode: boolean
  children: React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isReorderMode })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-center py-0.5 ${isDragging ? "opacity-50 z-20" : ""}`}
    >
      {isReorderMode ? (
        <div
          className="flex cursor-grab active:cursor-grabbing touch-none items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          {...listeners}
          {...attributes}
        >
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-full">{children}</div>
      )}
    </div>
  )
}

/** Resolve over/under side keys (e.g. over, o vs under, u) */
function getOverUnderSides(sides: Record<string, { books: Record<string, { odds_american: string | null; odds_decimal: number | null }> }>): { overKey: string | null; underKey: string | null } {
  const keys = Object.keys(sides)
  let overKey: string | null = null
  let underKey: string | null = null
  for (const k of keys) {
    const lower = k.toLowerCase()
    if (lower === "over" || lower === "o") overKey = k
    if (lower === "under" || lower === "u") underKey = k
  }
  if (!overKey && keys.length > 0) overKey = keys[0]
  if (!underKey && keys.length > 1) underKey = keys[1]
  return { overKey, underKey }
}

/** Per row: which book has the best (highest) decimal odds for over and for under */
function getBestOverUnderBooks(g: PropGroup): { bestOverBook: string | null; bestUnderBook: string | null } {
  const { overKey, underKey } = getOverUnderSides(g.sides)
  let bestOverBook: string | null = null
  let bestUnderBook: string | null = null
  let bestOverDec = -1
  let bestUnderDec = -1
  if (overKey && g.sides[overKey]) {
    for (const [bookId, b] of Object.entries(g.sides[overKey].books)) {
      const d = b.odds_decimal ?? -1
      if (d > bestOverDec) {
        bestOverDec = d
        bestOverBook = bookId
      }
    }
  }
  if (underKey && g.sides[underKey]) {
    for (const [bookId, b] of Object.entries(g.sides[underKey].books)) {
      const d = b.odds_decimal ?? -1
      if (d > bestUnderDec) {
        bestUnderDec = d
        bestUnderBook = bookId
      }
    }
  }
  return { bestOverBook, bestUnderBook }
}

export function NbaMarketClient() {
  const { data, isLoading, error, refetch, isFetching } = useNbaProps()
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all")
  const [selectedStat, setSelectedStat] = useState<string>("all")
  const [pinnacleCircaOnly, setPinnacleCircaOnly] = useState(false)
  const [anchorBookId, setAnchorBookId] = useState<string>("all")
  const [sideSplit, setSideSplit] = useState(false)
  const [sideFilter, setSideFilter] = useState<"both" | "over" | "under">("both")
  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(new Set())
  const [bookOrder, setBookOrder] = useState<string[]>(() => {
    const preferred = DEFAULT_MARKET_BOOK_ORDER.filter((id) => ALL_MARKET_BOOKS.includes(id))
    const rest = ALL_MARKET_BOOKS.filter((id) => !DEFAULT_MARKET_BOOK_ORDER.includes(id))
    return [...preferred, ...rest]
  })
  const [visibleBookIds, setVisibleBookIds] = useState<Set<string>>(
    () => new Set(ALL_MARKET_BOOKS)
  )
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  type SortCol = "player" | "market" | "side" | "line"
  const [sortBy, setSortBy] = useState<SortCol | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setBookOrder((prev) => {
      const visible = prev.filter((id) => visibleBookIds.has(id))
      const oldIndex = visible.indexOf(active.id as string)
      const newIndex = visible.indexOf(over.id as string)
      if (oldIndex === -1 || newIndex === -1) return prev
      const reordered = arrayMove(visible, oldIndex, newIndex)
      const hidden = prev.filter((id) => !visibleBookIds.has(id))
      return [...reordered, ...hidden]
    })
  }, [visibleBookIds])

  const groups = useMemo(() => {
    if (!data?.data?.propGroups) return []
    return Object.values(data.data.propGroups)
  }, [data])

  const playerOptions = useMemo(() => {
    const set = new Set<string>()
    for (const g of groups) {
      const n = g.player_name?.trim()
      if (n) set.add(n)
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((name) => ({ value: name, label: name }))
  }, [groups])

  const statOptions = useMemo(() => {
    const set = new Set<string>()
    for (const g of groups) {
      const s = g.stat_id?.trim()
      if (s) set.add(s)
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))
      .map((stat) => ({ value: stat, label: formatPropLabel(stat) }))
  }, [groups])

  const pointsStatId = useMemo(
    () => statOptions.find((o) => o.value.toLowerCase() === "points")?.value ?? null,
    [statOptions]
  )
  const hasAppliedPointsDefault = useRef(false)
  React.useEffect(() => {
    if (hasAppliedPointsDefault.current || !pointsStatId) return
    hasAppliedPointsDefault.current = true
    setSelectedStat(pointsStatId)
  }, [pointsStatId])

  const visibleOrderedBooks = useMemo(
    () => bookOrder.filter((id) => visibleBookIds.has(id)),
    [bookOrder, visibleBookIds]
  )

  const hasOddsFromBook = useCallback((g: PropGroup, bookId: string) => {
    for (const side of Object.values(g.sides)) {
      if (side.books[bookId] != null) return true
    }
    return false
  }, [])

  const filteredGroups = useMemo(() => {
    let list = groups
    if (selectedPlayer && selectedPlayer !== "all") {
      const playerNorm = selectedPlayer.trim()
      list = list.filter((g) => (g.player_name ?? "").trim() === playerNorm)
    }
    if (selectedStat && selectedStat !== "all") {
      const statNorm = selectedStat.trim()
      list = list.filter((g) => (g.stat_id ?? "").trim() === statNorm)
    }
    if (pinnacleCircaOnly) list = list.filter((g) => g.has_pinnacle || g.has_circa)
    if (anchorBookId && anchorBookId !== "all") {
      list = list.filter((g) => hasOddsFromBook(g, anchorBookId))
    }
    return list
  }, [groups, selectedPlayer, selectedStat, pinnacleCircaOnly, anchorBookId, hasOddsFromBook])

  const rowExpandKey = useCallback(
    (g: PropGroup) => `${g.event_id ?? ""}|${g.player_name ?? ""}|${g.stat_id ?? ""}`,
    []
  )

  // One row per (event, player, stat). Primary line = most common "main" line across books; all other lines (including other books' main lines, e.g. Hard Rock 23.5) go in the accordion.
  const { displayGroups, hasAltKeys } = useMemo(() => {
    const bucketKey = (g: PropGroup) =>
      `${g.event_id ?? ""}|${(g.player_name ?? "").trim()}|${(g.stat_id ?? "").trim()}`
    const buckets = new Map<string, PropGroup[]>()
    for (const g of filteredGroups) {
      const k = bucketKey(g)
      if (!buckets.has(k)) buckets.set(k, [])
      buckets.get(k)!.push(g)
    }
    const out: PropGroup[] = []
    const altKeys = new Set<string>()
    const PREFERRED_BOOK_IDS = new Set(["fanduel", "draftkings"])
    const countBooksForLine = (bucket: PropGroup[], line: number) => {
      const ids = new Set<string>()
      for (const g of bucket) {
        if (g.line !== line) continue
        for (const side of Object.values(g.sides)) {
          for (const id of Object.keys(side.books)) ids.add(id.toLowerCase())
        }
      }
      return ids.size
    }
    const hasPreferredBooks = (bucket: PropGroup[], line: number) => {
      for (const g of bucket) {
        if (g.line !== line) continue
        for (const side of Object.values(g.sides)) {
          for (const id of Object.keys(side.books)) {
            if (PREFERRED_BOOK_IDS.has(id.toLowerCase())) return true
          }
        }
      }
      return false
    }

    for (const [, bucket] of buckets) {
      const mainLineGroups = bucket.filter((g) => !g.is_alt_line)
      const candidateLines =
        mainLineGroups.length > 0
          ? [...new Set(mainLineGroups.map((g) => g.line).filter((l): l is number => l != null))]
          : [...new Set(bucket.map((g) => g.line).filter((l): l is number => l != null))]
      const primaryLine =
        candidateLines.length > 0
          ? candidateLines.reduce((best, line) => {
              const bestBooks = countBooksForLine(bucket, best)
              const bestFDK = hasPreferredBooks(bucket, best)
              const lineBooks = countBooksForLine(bucket, line)
              const lineFDK = hasPreferredBooks(bucket, line)
              if (lineBooks > bestBooks) return line
              if (lineBooks < bestBooks) return best
              if (lineFDK && !bestFDK) return line
              if (!lineFDK && bestFDK) return best
              return line < best ? line : best
            })
          : Math.min(...bucket.map((g) => g.line ?? Infinity), Infinity) || 0
      const mainGroup =
        bucket.find((g) => g.line === primaryLine && !g.is_alt_line) ??
        bucket.find((g) => g.line === primaryLine)
      if (!mainGroup) continue
      const alts = bucket.filter((g) => g !== mainGroup).sort((a, b) => (a.line ?? 0) - (b.line ?? 0))
      if (alts.length > 0) altKeys.add(rowExpandKey(mainGroup))
      out.push(mainGroup)
      if (expandedRowKeys.has(rowExpandKey(mainGroup))) out.push(...alts)
    }
    return { displayGroups: out, hasAltKeys: altKeys }
  }, [filteredGroups, expandedRowKeys, rowExpandKey])

  const hasAltLines = useCallback(
    (g: PropGroup) => hasAltKeys.has(rowExpandKey(g)),
    [hasAltKeys, rowExpandKey]
  )

  const toggleRowExpanded = useCallback((key: string) => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const toggleBookVisible = useCallback((id: string) => {
    setVisibleBookIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  type TableRow = { g: PropGroup; side: "over" | "under" | null }
  const tableRows = useMemo((): TableRow[] => {
    if (!sideSplit) return displayGroups.map((g) => ({ g, side: null }))
    const rows = displayGroups.flatMap((g) => [
      { g, side: "over" as const },
      { g, side: "under" as const },
    ])
    if (sideFilter === "over") return rows.filter((r) => r.side === "over")
    if (sideFilter === "under") return rows.filter((r) => r.side === "under")
    return rows
  }, [displayGroups, sideSplit, sideFilter])

  const sortedTableRows = useMemo(() => {
    if (!sortBy) return tableRows
    const cmp = (a: TableRow, b: TableRow) => {
      let va: string | number
      let vb: string | number
      switch (sortBy) {
        case "player":
          va = (a.g.player_name ?? "").trim().toLowerCase()
          vb = (b.g.player_name ?? "").trim().toLowerCase()
          break
        case "market":
          va = (a.g.stat_id ?? "").trim().toLowerCase()
          vb = (b.g.stat_id ?? "").trim().toLowerCase()
          break
        case "side":
          va = a.side ?? ""
          vb = b.side ?? ""
          break
        case "line":
          va = a.g.line ?? -Infinity
          vb = b.g.line ?? -Infinity
          break
        default:
          return 0
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1
      if (va > vb) return sortDir === "asc" ? 1 : -1
      return 0
    }
    return [...tableRows].sort(cmp)
  }, [tableRows, sortBy, sortDir])

  const columnWidths = useMemo(() => {
    const w: string[] = [
      "minmax(180px, max-content)", // Player
      "minmax(100px, 0.8fr)",       // Market
    ]
    if (sideSplit) w.push("minmax(56px, 0.4fr)") // Side
    w.push("minmax(48px, 0.35fr)")  // Line
    visibleOrderedBooks.forEach(() => w.push("minmax(56px, 0.45fr)"))
    return w.join(" ")
  }, [visibleOrderedBooks, sideSplit])

  const gridStyle = { display: "grid", gridTemplateColumns: columnWidths } as const

  const totalPages = Math.max(1, Math.ceil(sortedTableRows.length / ROWS_PER_PAGE))
  const pageStart = (currentPage - 1) * ROWS_PER_PAGE
  const paginatedRows = useMemo(
    () => sortedTableRows.slice(pageStart, pageStart + ROWS_PER_PAGE),
    [sortedTableRows, pageStart]
  )

  const handleSortClick = useCallback((col: SortCol) => {
    setSortBy(col)
    setSortDir((prev) => (sortBy === col ? (prev === "asc" ? "desc" : "asc") : "asc"))
  }, [sortBy])

  React.useEffect(() => {
    setCurrentPage((p) => (p > totalPages ? totalPages : p))
  }, [totalPages])

  // Reset to page 1 and collapse accordions when filters change so we don't show stale data or wrong expanded state
  React.useEffect(() => {
    setCurrentPage(1)
    setExpandedRowKeys(new Set())
  }, [selectedPlayer, selectedStat, anchorBookId, sideFilter, sideSplit])

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
    <TooltipProvider>
      <div className="w-full min-w-0 max-w-full flex flex-col gap-4 h-[calc(100vh-5rem)]">
        {/* Filter bar */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Combobox
            options={playerOptions}
            value={selectedPlayer}
            onValueChange={setSelectedPlayer}
            placeholder="Search players…"
            allLabel="All players"
            allValue="all"
            className="w-52"
            contentMinWidth="280px"
            active={selectedPlayer !== "all"}
          />
          <Combobox
            options={statOptions}
            value={selectedStat}
            onValueChange={setSelectedStat}
            placeholder="Search props…"
            allLabel="All props"
            allValue="all"
            className="w-44"
            contentMinWidth="260px"
            active={selectedStat !== "all"}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={sideSplit ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 shrink-0 ${sideSplit ? "bg-emerald-700 hover:bg-emerald-600" : "border-gray-600 text-muted-foreground"}`}
                onClick={() => setSideSplit((v) => !v)}
                aria-label={sideSplit ? "Side split: Over/Under as separate rows" : "Side split"}
              >
                <SplitSquareVertical className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {sideSplit ? "Side split: Over/Under as separate rows (click to combine)" : "Side split: show Over and Under as separate rows"}
            </TooltipContent>
          </Tooltip>
          {sideSplit && (
            <div className="flex rounded-md border border-gray-600 p-0.5" role="group" aria-label="Show sides">
              <Button
                variant={sideFilter === "both" ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 px-2 text-xs ${sideFilter === "both" ? "bg-[#2a2a2a]" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSideFilter("both")}
              >
                Both
              </Button>
              <Button
                variant={sideFilter === "over" ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 px-2 text-xs ${sideFilter === "over" ? "bg-[#2a2a2a]" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSideFilter("over")}
              >
                Overs
              </Button>
              <Button
                variant={sideFilter === "under" ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 px-2 text-xs ${sideFilter === "under" ? "bg-[#2a2a2a]" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setSideFilter("under")}
              >
                Unders
              </Button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 shrink-0 border-gray-600 text-muted-foreground ${anchorBookId !== "all" ? "ring-1 ring-emerald-500/60 border-emerald-700/50" : ""}`}
                  aria-label={anchorBookId === "all" ? "Anchor book: show all" : `Anchor: ${getSportsbookLabel(anchorBookId)}`}
                >
                  <Anchor className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[540px] rounded-md border-gray-700 bg-[#171717] p-4">
                <p className="text-sm text-muted-foreground mb-3">Only show props with odds from</p>
                <div className="grid grid-cols-8 gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setAnchorBookId("all")}
                        className={`flex aspect-square items-center justify-center rounded-md border transition-colors ${
                          anchorBookId === "all"
                            ? "border-emerald-600/60 bg-emerald-950/30"
                            : "border-gray-700 bg-[#0a0a0a] hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <span className="text-xs font-medium">All</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">All books</TooltipContent>
                  </Tooltip>
                  {ALL_MARKET_BOOKS.map((id) => {
                    const logo = getSportsbookLogoUrl(id)
                    const label = getSportsbookLabel(id)
                    const selected = anchorBookId === id
                    return (
                      <Tooltip key={id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setAnchorBookId(id)}
                            className={`flex aspect-square items-center justify-center rounded-md border p-1 transition-colors ${
                              selected
                                ? "border-emerald-600/60 bg-emerald-950/30"
                                : "border-gray-700 bg-[#0a0a0a] hover:bg-[#1a1a1a]"
                            }`}
                          >
                            {logo ? (
                              <Image
                                src={logo}
                                alt=""
                                width={40}
                                height={40}
                                className="h-full w-full max-h-10 max-w-10 rounded-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-medium truncate px-0.5">{label}</span>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{label}</TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isReorderMode ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 shrink-0 ${isReorderMode ? "bg-emerald-700 hover:bg-emerald-600" : "border-gray-600 text-muted-foreground"}`}
                  onClick={() => setIsReorderMode((v) => !v)}
                  aria-label="Column reorder"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isReorderMode ? "Drag column headers to reorder; click Done when finished" : "Column reorder"}
              </TooltipContent>
            </Tooltip>
            {isReorderMode && (
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-emerald-700 hover:bg-emerald-600"
                onClick={() => setIsReorderMode(false)}
              >
                <Check className="h-3.5 w-3.5" />
                Done
              </Button>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 border-gray-600 text-muted-foreground"
                  aria-label="Filters"
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[380px] rounded-md border-gray-700 bg-[#171717] p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pin-circa" className="text-sm">Pinnacle/Circa only</Label>
                    <Switch id="pin-circa" checked={pinnacleCircaOnly} onCheckedChange={setPinnacleCircaOnly} />
                  </div>
                  <div>
                    <Label className="text-sm">Books to show</Label>
                    <div className="mt-2 grid grid-cols-5 gap-2 max-h-56 overflow-y-auto">
                      {ALL_MARKET_BOOKS.map((id) => {
                        const logo = getSportsbookLogoUrl(id)
                        const label = getSportsbookLabel(id)
                        const checked = visibleBookIds.has(id)
                        return (
                          <label
                            key={id}
                            className={`flex flex-col items-center gap-1 rounded-md border p-2 cursor-pointer transition-colors ${
                              checked
                                ? "border-emerald-600/60 bg-emerald-950/30"
                                : "border-gray-700 bg-[#0a0a0a] hover:bg-[#1a1a1a]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleBookVisible(id)}
                              className="sr-only"
                            />
                            {logo ? (
                              <Image
                                src={logo}
                                alt=""
                                width={32}
                                height={32}
                                className="h-8 w-8 rounded-full object-contain"
                              />
                            ) : (
                              <span className="text-xs font-medium">{label}</span>
                            )}
                            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                              {label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 border-gray-600 text-muted-foreground"
                  onClick={() => {
                    setSelectedPlayer("all")
                    setSelectedStat(pointsStatId ?? "all")
                    setAnchorBookId("all")
                    setPinnacleCircaOnly(false)
                    setSideFilter("both")
                    setSortBy(null)
                    setCurrentPage(1)
                  }}
                  aria-label="Clear all filters"
                >
                  <Eraser className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Clear all filters</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 border-gray-600 text-muted-foreground"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  aria-label="Refresh"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Refresh data</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Scroll region fills remaining height; table body scrolls inside it */}
        <div className="rounded-lg border border-border bg-card flex flex-col overflow-hidden min-w-0 flex-1 min-h-0">
          <DataTableViewport
            maxHeight="100%"
            className="h-full min-h-0 border-0 rounded-none bg-transparent shadow-none"
          >
            <div className="min-w-max">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div
                  className="sticky top-0 z-10 grid items-center border-b border-border bg-card px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  style={gridStyle}
                >
                  <button
                    type="button"
                    onClick={() => handleSortClick("player")}
                    className="flex items-center gap-0.5 truncate text-left hover:text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"
                  >
                    Player
                    {sortBy === "player" && (sortDir === "asc" ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />)}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSortClick("market")}
                    className="flex items-center gap-0.5 truncate text-left hover:text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"
                  >
                    Market
                    {sortBy === "market" && (sortDir === "asc" ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />)}
                  </button>
                  {sideSplit && (
                    <button
                      type="button"
                      onClick={() => handleSortClick("side")}
                      className="flex items-center justify-center gap-0.5 truncate hover:text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"
                    >
                      Side
                      {sortBy === "side" && (sortDir === "asc" ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />)}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSortClick("line")}
                    className="flex items-center justify-center gap-0.5 truncate hover:text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"
                  >
                    Line
                    {sortBy === "line" && (sortDir === "asc" ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />)}
                  </button>
                  <SortableContext items={visibleOrderedBooks} strategy={horizontalListSortingStrategy}>
                    {visibleOrderedBooks.map((id) => {
                      const logo = getSportsbookLogoUrl(id)
                      const label = getSportsbookLabel(id)
                      return (
                        <SortableBookHeader key={id} id={id} isReorderMode={isReorderMode}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                                {logo ? (
                                  <Image
                                    src={logo}
                                    alt=""
                                    width={BOOK_LOGO_SIZE}
                                    height={BOOK_LOGO_SIZE}
                                    className="h-12 w-12 shrink-0 rounded-full object-contain"
                                  />
                                ) : (
                                  <span className="text-[10px] font-medium truncate max-w-full px-1">
                                    {label}
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="font-normal normal-case">
                              {label}
                            </TooltipContent>
                          </Tooltip>
                        </SortableBookHeader>
                      )
                    })}
                  </SortableContext>
                </div>
              </DndContext>
              {paginatedRows.map((row, rowIndex) => {
                const { g, side } = row
                const rowKey = side ? `${g.prop_key}-${side}` : g.prop_key
                const expandKey = rowExpandKey(g)
                const isMainLine = !g.is_alt_line
                const hasAlts = isMainLine && hasAltLines(g)
                const isExpanded = expandedRowKeys.has(expandKey)
                const isAltRow = g.is_alt_line
                const { overKey, underKey } = getOverUnderSides(g.sides)
                const { bestOverBook, bestUnderBook } = getBestOverUnderBooks(g)
                const lineStr = g.line != null ? String(g.line) : "—"
                const linkClass = "underline decoration-muted-foreground/50 underline-offset-1 hover:decoration-emerald-500 hover:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 rounded"

                return (
                  <div
                    key={rowKey}
                    className={`grid w-full border-b px-2 text-sm hover:bg-[#1f1f1f] ${
                      isAltRow
                        ? "border-l-2 border-emerald-900/50 bg-[#151515] border-gray-700/30"
                        : "border-gray-700/50"
                    }`}
                    style={{
                      ...gridStyle,
                      height: ROW_HEIGHT,
                      alignItems: "center",
                    }}
                  >
                    <div className="flex items-center gap-1 min-w-0 py-1">
                      {(hasAlts && (!sideSplit || side === "over")) ? (
                        <button
                          type="button"
                          onClick={() => toggleRowExpanded(expandKey)}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-emerald-500 hover:bg-emerald-950/40 hover:text-emerald-400"
                          aria-label={isExpanded ? "Collapse alternate lines" : "Expand alternate lines"}
                        >
                          {isExpanded ? (
                            <Minus className="h-3.5 w-3.5" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="w-6 shrink-0" aria-hidden />
                      )}
                      <div className="flex-1 flex flex-col justify-center gap-0.5 min-w-0">
                        <span className="text-sm font-medium whitespace-nowrap">{g.player_name ?? "—"}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatGame(g)}</span>
                      </div>
                    </div>
                    <div className="truncate text-muted-foreground">{formatMarketName(g)}</div>
                    {sideSplit && (
                      <div className="flex items-center justify-center text-xs font-medium text-muted-foreground">
                        {side === "over" ? "Over" : "Under"}
                      </div>
                    )}
                    <div className="flex items-center justify-center font-mono text-muted-foreground">
                      {g.line != null ? String(g.line) : "—"}
                    </div>
                    {sideSplit
                      ? visibleOrderedBooks.map((bid) => {
                          const sideKey = side === "over" ? overKey : underKey
                          const book = sideKey ? g.sides[sideKey]?.books[bid] : undefined
                          const american = book?.odds_american ?? null
                          const deeplink = book?.deeplink ?? null
                          const isBest = (side === "over" ? bestOverBook === bid : bestUnderBook === bid)
                          return (
                            <div
                              key={bid}
                              className="flex h-full items-center justify-center py-1.5 text-center font-mono text-base"
                              style={{ minHeight: ROW_HEIGHT }}
                            >
                              {american != null ? (
                                deeplink ? (
                                  <a
                                    href={deeplink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`shrink-0 ${linkClass} ${isBest ? "font-semibold text-emerald-400" : "text-muted-foreground"}`}
                                  >
                                    {american}
                                  </a>
                                ) : (
                                  <span className={`shrink-0 ${isBest ? "font-semibold text-emerald-400" : "text-muted-foreground"}`}>
                                    {american}
                                  </span>
                                )
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          )
                        })
                      : visibleOrderedBooks.map((bid) => {
                          const overBook = overKey ? g.sides[overKey]?.books[bid] : undefined
                          const underBook = underKey ? g.sides[underKey]?.books[bid] : undefined
                          const overAmerican = overBook?.odds_american ?? null
                          const underAmerican = underBook?.odds_american ?? null
                          const overDeeplink = overBook?.deeplink ?? null
                          const underDeeplink = underBook?.deeplink ?? null
                          const hasAny = overAmerican || underAmerican
                          const isBestOver = bestOverBook === bid
                          const isBestUnder = bestUnderBook === bid
                          return (
                            <div
                              key={bid}
                              className="flex h-full flex-col items-center justify-center gap-0.5 py-1.5 text-center font-mono text-xs leading-snug"
                              style={{ minHeight: ROW_HEIGHT }}
                            >
                              {hasAny ? (
                                <>
                                  {overAmerican != null ? (
                                    overDeeplink ? (
                                      <a
                                        href={overDeeplink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`shrink-0 ${linkClass} ${isBestOver ? "font-semibold text-emerald-400" : "text-muted-foreground"}`}
                                      >
                                        {overAmerican}
                                      </a>
                                    ) : (
                                      <span className={`shrink-0 ${isBestOver ? "font-semibold text-emerald-400" : "text-muted-foreground"}`}>
                                        {overAmerican}
                                      </span>
                                    )
                                  ) : (
                                    <span className="shrink-0 text-muted-foreground">—</span>
                                  )}
                                  <span className="shrink-0 text-muted-foreground/90">{lineStr}</span>
                                  {underAmerican != null ? (
                                    underDeeplink ? (
                                      <a
                                        href={underDeeplink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`shrink-0 ${linkClass} ${isBestUnder ? "font-semibold text-emerald-400" : "text-muted-foreground"}`}
                                      >
                                        {underAmerican}
                                      </a>
                                    ) : (
                                      <span className={`shrink-0 ${isBestUnder ? "font-semibold text-emerald-400" : "text-muted-foreground"}`}>
                                        {underAmerican}
                                      </span>
                                    )
                                  ) : (
                                    <span className="shrink-0 text-muted-foreground">—</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          )
                        })}
                  </div>
                )
              })}
            </div>
          </DataTableViewport>
          {/* Pagination footer */}
          <footer className="flex flex-shrink-0 items-center justify-between border-t border-border bg-card px-3 py-2">
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                {displayGroups.length === 0
                  ? "0 props"
                  : `${pageStart + 1}-${Math.min(pageStart + ROWS_PER_PAGE, sortedTableRows.length)} of ${sortedTableRows.length.toLocaleString()} rows`}
              </span>
              <span className="text-xs text-muted-foreground">
                {displayGroups.length.toLocaleString()} of {groups.length.toLocaleString()} props
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-600"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[6rem] text-center text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-gray-600"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  )
}
