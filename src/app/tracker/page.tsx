"use client"

import * as React from "react"
import Image from "next/image"
import {
  MlbCard,
  MlbCardContent,
  MlbCardDescription,
  MlbCardHeader,
  MlbCardTitle,
} from "@/components/mlb/mlb-card"
import { MlbModeClient } from "@/app/mlb/MlbModeClient"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser"
import { calculateImpliedWinPct, calculateNetProfit, calculatePotentialPayout } from "@/lib/tracker/calculations"
import { TRACKER_RESULTS, TrackerBet, TrackerBetInput, TrackerResult } from "@/types/tracker"
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react"

type TrackerFormState = Omit<TrackerBetInput, "created_at"> & { created_at?: string }

type SportOption = { id: string; label: string; logo?: string }
type BookOption = { id: string; label: string; logo?: string }

const trackerHeaders = [
  { key: "created_at", label: "Created At" },
  { key: "event_date", label: "Event Date" },
  { key: "sport", label: "Sport" },
  { key: "sportsbook", label: "Sportsbook" },
  { key: "event", label: "Event" },
  { key: "market", label: "Market" },
  { key: "line", label: "Line" },
  { key: "bet_name", label: "Bet Name" },
  { key: "odds", label: "Odds" },
  { key: "implied_win_pct", label: "Implied Win %" },
  { key: "dollar_stake", label: "Dollar Stake" },
  { key: "unit_stake", label: "Unit Stake" },
  { key: "potential_payout", label: "Potential Payout" },
  { key: "result", label: "Result" },
  { key: "payout", label: "Payout" },
  { key: "is_parlay", label: "Parlay" },
  { key: "parlay_legs", label: "Legs" },
  { key: "is_boost", label: "Boost" },
  { key: "profit_boost_pct", label: "Boost %" },
  { key: "is_bonus_bet", label: "Bonus Bet" },
  { key: "bonus_bet_value", label: "Bonus Value" },
  { key: "is_no_sweat", label: "No Sweat" },
  { key: "no_sweat_value", label: "No Sweat Value" },
] as const

const requiredImportKeys = [
  "event_date",
  "sport",
  "sportsbook",
  "event",
  "market",
  "bet_name",
  "odds",
  "result",
] as const

const defaultSports: SportOption[] = [
  { id: "NFL", label: "NFL", logo: "/Images/League_Logos/NFL-Logo.png" },
  { id: "NBA", label: "NBA", logo: "/Images/League_Logos/NBA-Logo.png" },
  { id: "MLB", label: "MLB", logo: "/Images/League_Logos/MLB-Logo.png" },
  { id: "NHL", label: "NHL", logo: "/Images/League_Logos/NHL-Logo.png" },
]

const defaultBooks: BookOption[] = [
  { id: "draftkings", label: "DraftKings", logo: "/Images/Sportsbook_Logos/DraftKingsLogo.png" },
  { id: "fanduel", label: "FanDuel", logo: "/Images/Sportsbook_Logos/FanDuelLogo.png" },
  { id: "betmgm", label: "BetMGM", logo: "/Images/Sportsbook_Logos/betmgm.png" },
  { id: "caesars", label: "Caesars", logo: "/Images/Sportsbook_Logos/caesars-logo.png" },
  { id: "betrivers", label: "BetRivers", logo: "/Images/Sportsbook_Logos/betriverslogo.png" },
  { id: "fanatics", label: "Fanatics", logo: "/Images/Sportsbook_Logos/Fanatics.jpeg" },
  { id: "espn", label: "ESPN Bet", logo: "/Images/Sportsbook_Logos/ESPN-BET-Logo-Secondary.jpg" },
  { id: "hardrock", label: "Hard Rock", logo: "/Images/Sportsbook_Logos/hardrock.jpg" },
  { id: "pinnacle", label: "Pinnacle", logo: "/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg" },
]

const storageKeys = {
  customSports: "tracker.customSports",
  customBooks: "tracker.customBooks",
  lastSport: "tracker.lastSport",
  lastBook: "tracker.lastBook",
}

const defaultFormState = (): TrackerFormState => ({
  created_at: new Date().toISOString().slice(0, 10),
  event_date: new Date().toISOString().slice(0, 10),
  is_parlay: false,
  parlay_legs: 0,
  is_boost: false,
  profit_boost_pct: 0,
  is_bonus_bet: false,
  bonus_bet_value: 0,
  is_no_sweat: false,
  no_sweat_value: 0,
  sport: "",
  sportsbook: "",
  event: "",
  market: "",
  bet_name: "",
  odds: -110,
  implied_win_pct: 0,
  dollar_stake: 0,
  unit_stake: 0,
  potential_payout: 0,
  result: "Pending",
  payout: 0,
})

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })

const formatUnits = (value: number) => `${value.toFixed(2)}u`

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const resolveEventDate = (value?: string | null, fallback?: string | null) => {
  const eventDate = value ? new Date(value) : null
  if (eventDate && !Number.isNaN(eventDate.getTime())) {
    return eventDate.toISOString()
  }
  const fallbackDate = fallback ? new Date(fallback) : null
  if (fallbackDate && !Number.isNaN(fallbackDate.getTime())) {
    return fallbackDate.toISOString()
  }
  return new Date().toISOString()
}

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "")

const parseNumber = (value: string) => {
  const cleaned = value.replace(/[$,%\s]/g, "").trim()
  if (!cleaned) return 0
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? 0 : parsed
}

const parseBoolean = (value: string) => {
  const cleaned = value.trim().toLowerCase()
  return ["yes", "true", "1", "y"].includes(cleaned)
}

const getInitials = (value: string) => {
  const parts = value.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

const normalizeResult = (value: string): TrackerResult => {
  const cleaned = value.trim().toLowerCase()
  const match = TRACKER_RESULTS.find((result) => result.toLowerCase() === cleaned)
  if (match) return match
  if (cleaned.includes("win")) return "Win"
  if (cleaned.includes("loss")) return "Loss"
  if (cleaned.includes("push")) return "Push"
  if (cleaned.includes("void")) return "Void"
  if (cleaned.includes("cancel")) return "Cancelled"
  return "Pending"
}

const parseCsv = (content: string) => {
  const rows: string[][] = []
  let current = ""
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    if (char === '"') {
      const nextChar = content[i + 1]
      if (inQuotes && nextChar === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      row.push(current)
      current = ""
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && content[i + 1] === "\n") {
        i += 1
      }
      row.push(current)
      const normalizedRow = row.map((cell) => cell.trim())
      if (normalizedRow.some((cell) => cell.length > 0)) {
        rows.push(normalizedRow)
      }
      row = []
      current = ""
    } else {
      current += char
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    const normalizedRow = row.map((cell) => cell.trim())
    if (normalizedRow.some((cell) => cell.length > 0)) {
      rows.push(normalizedRow)
    }
  }

  const [headers, ...dataRows] = rows
  return { headers: headers ?? [], rows: dataRows }
}

export default function TrackerPage() {
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), [])
  const [bets, setBets] = React.useState<TrackerBet[]>([])
  const [unitSize, setUnitSize] = React.useState<number | null>(null)
  const [unitInput, setUnitInput] = React.useState("")
  const [savingUnit, setSavingUnit] = React.useState(false)
  const [calendarUnitsMode, setCalendarUnitsMode] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [addOpen, setAddOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [editingBet, setEditingBet] = React.useState<TrackerBet | null>(null)
  const [formState, setFormState] = React.useState<TrackerFormState>(defaultFormState)
  const [otherResultValue, setOtherResultValue] = React.useState<TrackerResult>("Pending")

  const [customSports, setCustomSports] = React.useState<SportOption[]>([])
  const [customBooks, setCustomBooks] = React.useState<BookOption[]>([])
  const [customSportInput, setCustomSportInput] = React.useState("")
  const [customBookName, setCustomBookName] = React.useState("")
  const [customBookLogo, setCustomBookLogo] = React.useState("")
  const [showCustomSportInput, setShowCustomSportInput] = React.useState(false)
  const [showCustomBookInput, setShowCustomBookInput] = React.useState(false)
  const [profileName, setProfileName] = React.useState<string | null>(null)
  const [profileAvatar, setProfileAvatar] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [sportFilter, setSportFilter] = React.useState("all")
  const [resultFilter, setResultFilter] = React.useState("all")
  const [sportsbookFilter, setSportsbookFilter] = React.useState("all")
  const [marketFilter, setMarketFilter] = React.useState("all")
  const [parlayFilter, setParlayFilter] = React.useState("all")
  const [boostFilter, setBoostFilter] = React.useState("all")
  const [bonusFilter, setBonusFilter] = React.useState("all")
  const [noSweatFilter, setNoSweatFilter] = React.useState("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")

  const [importOpen, setImportOpen] = React.useState(false)
  const [importStep, setImportStep] = React.useState(1)
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([])
  const [csvRows, setCsvRows] = React.useState<string[][]>([])
  const [headerMap, setHeaderMap] = React.useState<Record<string, string>>({})
  const [importing, setImporting] = React.useState(false)

  const [calendarMonth, setCalendarMonth] = React.useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const resetFilters = () => {
    setSearchTerm("")
    setSportFilter("all")
    setResultFilter("all")
    setSportsbookFilter("all")
    setMarketFilter("all")
    setParlayFilter("all")
    setBoostFilter("all")
    setBonusFilter("all")
    setNoSweatFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  const loadCustomTiles = React.useCallback(() => {
    if (typeof window === "undefined") return
    const storedSports = window.localStorage.getItem(storageKeys.customSports)
    const storedBooks = window.localStorage.getItem(storageKeys.customBooks)
    if (storedSports) {
      try {
        const parsed = JSON.parse(storedSports)
        if (Array.isArray(parsed)) setCustomSports(parsed)
      } catch {
        setCustomSports([])
      }
    }
    if (storedBooks) {
      try {
        const parsed = JSON.parse(storedBooks)
        if (Array.isArray(parsed)) setCustomBooks(parsed)
      } catch {
        setCustomBooks([])
      }
    }
  }, [])

  const persistCustomSports = (next: SportOption[]) => {
    setCustomSports(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.customSports, JSON.stringify(next))
    }
  }

  const persistCustomBooks = (next: BookOption[]) => {
    setCustomBooks(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.customBooks, JSON.stringify(next))
    }
  }

  const loadUnitSize = React.useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) return
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("unit_size")
      .eq("user_id", user.id)
      .single()
    const nextUnit = preferences?.unit_size != null ? Number(preferences.unit_size) : null
    setUnitSize(nextUnit)
    setUnitInput(nextUnit != null ? String(nextUnit) : "")
  }, [supabase])

  const loadProfile = React.useCallback(async () => {
    const { data } = await supabase.auth.getUser()
    const user = data.user
    if (!user) return
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single()
    setProfileName(profile?.display_name ?? user.email ?? "Profile")
    setProfileAvatar(profile?.avatar_url ?? null)
  }, [supabase])

  const saveUnitSize = React.useCallback(async () => {
    if (savingUnit) return
    setSavingUnit(true)
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) return
      const parsed = Number(unitInput)
      const normalized = Number.isNaN(parsed) || parsed <= 0 ? null : parsed
      setUnitSize(normalized)
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          unit_size: normalized,
          updated_at: new Date().toISOString(),
        })
    } finally {
      setSavingUnit(false)
    }
  }, [savingUnit, supabase, unitInput])

  const loadBets = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/tracker/bets")
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error ?? "Failed to load bets")
      }
      const nextBets = Array.isArray(json.bets)
        ? json.bets.map((bet: Record<string, unknown>, index: number) => {
            const raw = bet
            const id = raw.id ?? raw.ID ?? raw.Id ?? ""
            return {
              ...bet,
              id: id ? String(id) : "",
              _rowIndex: index,
            }
          })
        : []
      setBets(nextBets as TrackerBet[])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadUnitSize()
    loadProfile()
    loadBets()
    loadCustomTiles()
  }, [loadUnitSize, loadProfile, loadBets, loadCustomTiles])

  const applyDerivedFields = React.useCallback(
    (nextState: TrackerFormState, source?: "unit" | "dollar" | "odds") => {
      const resolvedUnitSize = unitSize && unitSize > 0 ? unitSize : null
      let dollarStake = Number(nextState.dollar_stake || 0)
      let unitStake = Number(nextState.unit_stake || 0)

      if (source === "unit" && resolvedUnitSize) {
        dollarStake = unitStake * resolvedUnitSize
      }
      if (source === "dollar" && resolvedUnitSize) {
        unitStake = resolvedUnitSize ? dollarStake / resolvedUnitSize : 0
      }

      const odds = Number(nextState.odds || 0)
      const impliedWin = odds !== 0 ? calculateImpliedWinPct(odds) : 0
      const potentialPayout = odds !== 0 ? calculatePotentialPayout(odds, dollarStake) : 0

      const bonusValue =
        nextState.is_bonus_bet && (!nextState.bonus_bet_value || nextState.bonus_bet_value === 0)
          ? dollarStake
          : nextState.bonus_bet_value
      const noSweatValue =
        nextState.is_no_sweat && (!nextState.no_sweat_value || nextState.no_sweat_value === 0)
          ? dollarStake
          : nextState.no_sweat_value

      return {
        ...nextState,
        dollar_stake: Number(dollarStake.toFixed(2)),
        unit_stake: Number(unitStake.toFixed(2)),
        implied_win_pct: impliedWin,
        potential_payout: Number(potentialPayout.toFixed(2)),
        bonus_bet_value: bonusValue ?? 0,
        no_sweat_value: noSweatValue ?? 0,
      }
    },
    [unitSize]
  )

  const openAddModal = () => {
    setEditingBet(null)
    const baseState = applyDerivedFields(defaultFormState())
    setShowCustomSportInput(false)
    setShowCustomBookInput(false)
    if (typeof window !== "undefined") {
      const lastSport = window.localStorage.getItem(storageKeys.lastSport)
      const lastBook = window.localStorage.getItem(storageKeys.lastBook)
      setFormState({
        ...baseState,
        sport: lastSport ?? baseState.sport,
        sportsbook: lastBook ?? baseState.sportsbook,
      })
    } else {
      setFormState(baseState)
    }
    setOtherResultValue("Pending")
    setAddOpen(true)
  }

  const openEditModal = (bet: TrackerBet) => {
    setEditingBet(bet)
    setShowCustomSportInput(false)
    setShowCustomBookInput(false)
    setFormState(
      applyDerivedFields({
        created_at: new Date(bet.created_at).toISOString().slice(0, 10),
        event_date: new Date(resolveEventDate(bet.event_date, bet.created_at)).toISOString().slice(0, 10),
        is_parlay: bet.is_parlay,
        parlay_legs: bet.parlay_legs,
        is_boost: bet.is_boost,
        profit_boost_pct: bet.profit_boost_pct,
        is_bonus_bet: bet.is_bonus_bet,
        bonus_bet_value: bet.bonus_bet_value,
        is_no_sweat: bet.is_no_sweat,
        no_sweat_value: bet.no_sweat_value,
        sport: bet.sport,
        sportsbook: bet.sportsbook,
        event: bet.event,
        market: bet.market,
        bet_name: bet.bet_name,
        odds: bet.odds,
        implied_win_pct: bet.implied_win_pct,
        dollar_stake: bet.dollar_stake,
        unit_stake: bet.unit_stake,
        potential_payout: bet.potential_payout,
        result: bet.result,
        payout: bet.payout,
      })
    )
    if (bet.result !== "Win" && bet.result !== "Loss") {
      setOtherResultValue(bet.result)
    }
    setAddOpen(true)
  }

  const handleFormChange = (
    key: keyof TrackerFormState,
    value: string | number,
    source?: "unit" | "dollar" | "odds"
  ) => {
    setFormState((prev) => applyDerivedFields({ ...prev, [key]: value }, source))
  }

  const handleToggleField = (key: keyof TrackerFormState, value: boolean) => {
    setFormState((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "is_parlay" && !value) {
        next.parlay_legs = 0
      }
      if (key === "is_boost" && !value) {
        next.profit_boost_pct = 0
      }
      if (key === "is_bonus_bet" && value && (!prev.bonus_bet_value || prev.bonus_bet_value === 0)) {
        next.bonus_bet_value = prev.dollar_stake
      }
      if (key === "is_no_sweat" && value && (!prev.no_sweat_value || prev.no_sweat_value === 0)) {
        next.no_sweat_value = prev.dollar_stake
      }
      return applyDerivedFields(next)
    })
  }

  const handleSelectSport = (sport: string) => {
    handleFormChange("sport", sport)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.lastSport, sport)
    }
  }

  const handleSelectBook = (book: string) => {
    handleFormChange("sportsbook", book)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKeys.lastBook, book)
    }
  }

  const submitBet = async () => {
    setSaving(true)
    setSubmitError(null)
    try {
      const payload: TrackerBetInput = {
        ...formState,
        created_at: undefined,
        event_date: formState.event_date
          ? new Date(formState.event_date).toISOString().slice(0, 10)
          : undefined,
      }
      const response = await fetch(editingBet ? `/api/tracker/bets/${editingBet.id}` : "/api/tracker/bets", {
        method: editingBet ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const raw = await response.text()
      let json: any = null
      try {
        json = raw ? JSON.parse(raw) : null
      } catch {
        json = null
      }
      if (!response.ok) {
        const message = json?.error ?? raw ?? "Save failed"
        throw new Error(message)
      }
      await loadBets()
      setAddOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed"
      setSubmitError(message)
    } finally {
      setSaving(false)
    }
  }

  const deleteBet = async (betId: string) => {
    setDeleteError(null)
    if (!betId || betId === "undefined") {
      setDeleteError("Delete failed: missing bet id.")
      return
    }
    const response = await fetch(`/api/tracker/bets/${betId}`, { method: "DELETE" })
    const raw = await response.text()
    let json: any = null
    try {
      json = raw ? JSON.parse(raw) : null
    } catch {
      json = null
    }
    if (!response.ok) {
      const message = json?.error ?? raw ?? "Delete failed"
      setDeleteError(message)
      return
    }
    await loadBets()
  }

  const handleCsvUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : ""
      const { headers, rows } = parseCsv(text)
      setCsvHeaders(headers)
      setCsvRows(rows)
      const normalizedHeaders = headers.map((header) => normalizeHeader(header))
      const autoMap: Record<string, string> = {}
      trackerHeaders.forEach((header) => {
        const matchIndex = normalizedHeaders.findIndex(
          (csvHeader) => csvHeader === normalizeHeader(header.label) || csvHeader === normalizeHeader(header.key)
        )
        if (matchIndex >= 0) {
          autoMap[header.key] = headers[matchIndex]
        }
      })
      setHeaderMap(autoMap)
      setImportStep(2)
    }
    reader.readAsText(file)
  }

  const mappedRows = React.useMemo(() => {
    if (csvHeaders.length === 0 || csvRows.length === 0) return []
    const headerIndex = new Map(csvHeaders.map((header, index) => [header, index]))
    return csvRows.map((row) => {
      const mapped: Record<string, string> = {}
      trackerHeaders.forEach((header) => {
        const source = headerMap[header.key]
        if (!source) return
        const index = headerIndex.get(source)
        mapped[header.key] = index != null ? row[index] ?? "" : ""
      })
      return mapped
    })
  }, [csvHeaders, csvRows, headerMap])

  const normalizedImportRows = React.useMemo<TrackerBetInput[]>(() => {
    return mappedRows.map((row) => {
      const createdAt = row.created_at ? new Date(row.created_at) : null
      const created_at = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toISOString() : undefined
      const eventAt = row.event_date ? new Date(row.event_date) : null
      const event_date = eventAt && !Number.isNaN(eventAt.getTime()) ? eventAt.toISOString().slice(0, 10) : undefined
      return {
        created_at,
        event_date,
        is_parlay: parseBoolean(row.is_parlay ?? "false"),
        parlay_legs: parseNumber(row.parlay_legs ?? "0"),
        is_boost: parseBoolean(row.is_boost ?? "false"),
        profit_boost_pct: parseNumber(row.profit_boost_pct ?? "0"),
        is_bonus_bet: parseBoolean(row.is_bonus_bet ?? "false"),
        bonus_bet_value: parseNumber(row.bonus_bet_value ?? "0"),
        is_no_sweat: parseBoolean(row.is_no_sweat ?? "false"),
        no_sweat_value: parseNumber(row.no_sweat_value ?? "0"),
        sport: row.sport ?? "",
        sportsbook: row.sportsbook ?? "",
        event: row.event ?? "",
        market: row.market ?? "",
        line: row.line ?? "",
        bet_name: row.bet_name ?? "",
        odds: parseNumber(row.odds ?? "0"),
        implied_win_pct: parseNumber(row.implied_win_pct ?? "0"),
        dollar_stake: parseNumber(row.dollar_stake ?? "0"),
        unit_stake: parseNumber(row.unit_stake ?? "0"),
        potential_payout: parseNumber(row.potential_payout ?? "0"),
        result: normalizeResult(row.result ?? ""),
        payout: parseNumber(row.payout ?? "0"),
      }
    })
  }, [mappedRows])

  const importErrors = React.useMemo(() => {
    return normalizedImportRows.reduce((count, row) => {
      const missing = requiredImportKeys.some((key) => {
        if (key === "event_date") return Boolean(row.event_date || row.created_at)
        if (key === "odds") return Number.isNaN(row.odds) || row.odds === 0
        return String(row[key] ?? "").trim().length === 0
      })
      return missing ? count + 1 : count
    }, 0)
  }, [normalizedImportRows])

  const submitImport = async () => {
    setImporting(true)
    try {
      const validRows = normalizedImportRows.filter((row) => {
        return requiredImportKeys.every((key) => {
          if (key === "event_date") return Boolean(row.event_date || row.created_at)
          if (key === "odds") return row.odds !== 0
          return String(row[key] ?? "").trim().length > 0
        })
      })
    const response = await fetch("/api/tracker/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      })
      const json = await response.json()
      if (!response.ok) {
        throw new Error(json?.error ?? "Import failed")
      }
      await loadBets()
      setImportOpen(false)
      setImportStep(1)
      setCsvHeaders([])
      setCsvRows([])
      setHeaderMap({})
    } finally {
      setImporting(false)
    }
  }

  const sports = React.useMemo(
    () => Array.from(new Set(bets.map((bet) => bet.sport).filter(Boolean))).sort(),
    [bets]
  )
  const sportsbooks = React.useMemo(
    () => Array.from(new Set(bets.map((bet) => bet.sportsbook).filter(Boolean))).sort(),
    [bets]
  )
  const markets = React.useMemo(
    () => Array.from(new Set(bets.map((bet) => bet.market).filter(Boolean))).sort(),
    [bets]
  )

  const filteredBets = React.useMemo(() => {
    return bets.filter((bet) => {
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        [bet.event, bet.market, bet.bet_name, bet.sportsbook, bet.sport]
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      const matchesSport = sportFilter === "all" || bet.sport === sportFilter
      const matchesResult = resultFilter === "all" || bet.result === resultFilter
      const matchesSportsbook = sportsbookFilter === "all" || bet.sportsbook === sportsbookFilter
      const matchesMarket = marketFilter === "all" || bet.market === marketFilter
      const matchesParlay =
        parlayFilter === "all" ||
        (parlayFilter === "yes" && bet.is_parlay) ||
        (parlayFilter === "no" && !bet.is_parlay)
      const matchesBoost =
        boostFilter === "all" ||
        (boostFilter === "yes" && bet.is_boost) ||
        (boostFilter === "no" && !bet.is_boost)
      const matchesBonus =
        bonusFilter === "all" ||
        (bonusFilter === "yes" && bet.is_bonus_bet) ||
        (bonusFilter === "no" && !bet.is_bonus_bet)
      const matchesNoSweat =
        noSweatFilter === "all" ||
        (noSweatFilter === "yes" && bet.is_no_sweat) ||
        (noSweatFilter === "no" && !bet.is_no_sweat)

      const eventDate = new Date(resolveEventDate(bet.event_date, bet.created_at))
      const fromOk = !dateFrom || eventDate >= new Date(`${dateFrom}T00:00:00`)
      const toOk = !dateTo || eventDate <= new Date(`${dateTo}T23:59:59`)

      return (
        matchesSearch &&
        matchesSport &&
        matchesResult &&
        matchesSportsbook &&
        matchesMarket &&
        matchesParlay &&
        matchesBoost &&
        matchesBonus &&
        matchesNoSweat &&
        fromOk &&
        toOk
      )
    })
  }, [
    bets,
    searchTerm,
    sportFilter,
    resultFilter,
    sportsbookFilter,
    marketFilter,
    parlayFilter,
    boostFilter,
    bonusFilter,
    noSweatFilter,
    dateFrom,
    dateTo,
  ])

  const stats = React.useMemo(() => {
    const settled = filteredBets.filter((bet) => !["Pending", "Void", "Cancelled"].includes(bet.result))
    const wins = settled.filter((bet) => bet.result === "Win").length
    const losses = settled.filter((bet) => bet.result === "Loss").length
    const pushes = settled.filter((bet) => bet.result === "Push").length
    const totalStake = settled.reduce((sum, bet) => sum + bet.dollar_stake, 0)
    const totalProfit = settled.reduce(
      (sum, bet) => sum + calculateNetProfit(bet.result, bet.dollar_stake, bet.payout, bet.potential_payout),
      0
    )
    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0
    const roi = totalStake > 0 ? (totalProfit / totalStake) * 100 : 0
    const units = unitSize && unitSize > 0 ? totalProfit / unitSize : 0

    return {
      totalBets: filteredBets.length,
      wins,
      losses,
      pushes,
      winRate,
      totalStake,
      totalProfit,
      roi,
      units,
    }
  }, [filteredBets, unitSize])

  const dailyResults = React.useMemo(() => {
    return filteredBets.reduce<Record<string, number>>((acc, bet) => {
      const key = new Date(resolveEventDate(bet.event_date, bet.created_at)).toISOString().slice(0, 10)
      const net = calculateNetProfit(bet.result, bet.dollar_stake, bet.payout, bet.potential_payout)
      acc[key] = (acc[key] ?? 0) + net
      return acc
    }, {})
  }, [filteredBets])

  const calendarSummary = React.useMemo(() => {
    const month = calendarMonth.getMonth()
    const year = calendarMonth.getFullYear()
    const monthNet = filteredBets.reduce((sum, bet) => {
      const eventDate = new Date(resolveEventDate(bet.event_date, bet.created_at))
      if (eventDate.getMonth() !== month || eventDate.getFullYear() !== year) return sum
      return sum + calculateNetProfit(bet.result, bet.dollar_stake, bet.payout, bet.potential_payout)
    }, 0)
    const monthUnits = unitSize && unitSize > 0 ? monthNet / unitSize : 0
    return { monthNet, monthUnits }
  }, [calendarMonth, filteredBets, unitSize])

  const calendarCells = React.useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    const startDay = start.getDay()
    const cells: Array<{ date: Date | null; net: number }> = []
    for (let i = 0; i < startDay; i += 1) {
      cells.push({ date: null, net: 0 })
    }
    for (let day = 1; day <= end.getDate(); day += 1) {
      const date = new Date(year, month, day)
      const key = date.toISOString().slice(0, 10)
      cells.push({ date, net: dailyResults[key] ?? 0 })
    }
    return cells
  }, [calendarMonth, dailyResults])

  const sportOptions = React.useMemo(() => [...defaultSports, ...customSports], [customSports])
  const bookOptions = React.useMemo(() => [...defaultBooks, ...customBooks], [customBooks])
  const otherResultOptions = React.useMemo(
    () => TRACKER_RESULTS.filter((result) => result !== "Win" && result !== "Loss"),
    []
  )
  const resultIsOther = formState.result !== "Win" && formState.result !== "Loss"

  const unitModeLabel = calendarUnitsMode ? "Units" : "Dollars"
  const unitHelper = unitSize && unitSize > 0 ? `1u = ${formatCurrency(unitSize)}` : "Set your unit size above."

  return (
    <div className="mlb-scope min-h-screen py-8">
      <MlbModeClient />
      <div className="mlb-shell mx-auto w-full max-w-[1600px] space-y-8 px-4 md:px-6">
      <MlbCard variant="muted" className="bg-[#0b1220]/50 backdrop-blur-xl border border-white/10">
        <MlbCardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
              {profileAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileAvatar} alt={profileName ?? "Profile"} className="h-full w-full object-cover" />
              ) : (
                <div className="text-xs text-white/70">{profileName?.slice(0, 1) ?? "P"}</div>
              )}
            </div>
            <div className="text-sm font-semibold tracking-tight text-white/90">
              {profileName ?? "Profile"}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={openAddModal}
                className="bg-[#49C1FB] text-black hover:bg-[#7bd4ff]"
              >
                <Check className="mr-2 h-4 w-4" />
                Add Bet
              </Button>
            </DialogTrigger>
            <DialogContent
              overlayClassName="!bg-black/35 backdrop-blur-sm"
              className="max-h-[78vh] w-full max-w-4xl overflow-y-auto !border-0 !bg-transparent !shadow-none !p-0 ring-1 ring-[#49C1FB]/50"
            >
              <MlbCard
                className="!bg-transparent !border-transparent !shadow-none"
                style={{
                  background: "linear-gradient(135deg, rgba(8, 18, 32, 0.14), rgba(10, 22, 38, 0.08), rgba(8, 18, 32, 0.14))",
                  border: "1px solid rgba(73, 193, 251, 0.6)",
                  boxShadow: "0 0 90px rgba(73, 193, 251, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                }}
              >
                <MlbCardHeader className="p-4 pb-1">
                  <DialogHeader>
                    <DialogTitle>{editingBet ? "Edit Bet" : "Add Bet"}</DialogTitle>
                    <DialogDescription>
                      Track a wager with unit sizing, odds, and outcomes.
                    </DialogDescription>
                  </DialogHeader>
                </MlbCardHeader>
                <MlbCardContent className="space-y-1.5 px-4 pb-4 pt-0">
                  <div className="space-y-1.5">
                  <div className="space-y-1">
                  <Label>Sport</Label>
                  <div className="grid grid-cols-2 gap-1 md:grid-cols-4 xl:grid-cols-6">
                    {sportOptions.map((sport) => {
                      const isActive = formState.sport === sport.label
                      return (
                        <button
                          key={sport.id}
                          type="button"
                          onClick={() => handleSelectSport(sport.label)}
                          className={`rounded-[4px] border px-2 py-1 text-left text-[11px] transition-none ${
                            isActive
                              ? "border-emerald-400/60 bg-emerald-500/10 text-white"
                              : "border-white/10 bg-white/5 text-white/70"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {sport.logo ? (
                              <Image
                                src={sport.logo}
                                alt={sport.label}
                                width={24}
                                height={24}
                                className="h-4 w-4 object-contain"
                              />
                            ) : null}
                            <div className="text-[10px] font-semibold tracking-wide">{sport.label}</div>
                          </div>
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setShowCustomSportInput(true)}
                      className="flex items-center justify-center gap-2 rounded-[4px] border border-dashed border-white/20 bg-white/5 px-2 py-1 text-[10px] text-white/70 transition-none"
                    >
                      <Plus className="h-3 w-3" />
                      Other
                    </button>
                  </div>
                  {showCustomSportInput ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Input
                        value={customSportInput}
                        onChange={(event) => setCustomSportInput(event.target.value)}
                        placeholder="Add custom sport (e.g., Tennis)"
                        className="h-7"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const trimmed = customSportInput.trim()
                          if (!trimmed) return
                          const next = [...customSports, { id: trimmed.toLowerCase(), label: trimmed }]
                          persistCustomSports(next)
                          handleSelectSport(trimmed)
                          setCustomSportInput("")
                          setShowCustomSportInput(false)
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <Label>Sportsbook</Label>
                  <div className="grid grid-cols-2 gap-1 md:grid-cols-4 xl:grid-cols-6">
                    {bookOptions.map((book) => {
                      const isActive = formState.sportsbook === book.label
                      const isExternalLogo = Boolean(book.logo && book.logo.startsWith("http"))
                      return (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => handleSelectBook(book.label)}
                          className={`flex items-center gap-2 rounded-[4px] border px-2 py-1 text-left text-[11px] transition-none ${
                            isActive
                              ? "border-emerald-400/60 bg-emerald-500/10 text-white"
                              : "border-white/10 bg-white/5 text-white/70"
                          }`}
                        >
                          {book.logo ? (
                            isExternalLogo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={book.logo}
                                alt={book.label}
                                className="h-4 w-4 rounded object-contain"
                              />
                            ) : (
                              <Image
                                src={book.logo}
                                alt={book.label}
                                width={24}
                                height={24}
                                className="h-4 w-4 rounded object-contain"
                              />
                            )
                          ) : (
                            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20 text-[8px]">
                              {getInitials(book.label)}
                            </div>
                          )}
                          <span className="text-[10px] font-semibold">{book.label}</span>
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={() => setShowCustomBookInput(true)}
                      className="flex items-center justify-center gap-2 rounded-[4px] border border-dashed border-white/20 bg-white/5 px-2 py-1 text-[10px] text-white/70 transition-none"
                    >
                      <Plus className="h-3 w-3" />
                      Other
                    </button>
                  </div>
                  {showCustomBookInput ? (
                    <div className="grid gap-1.5 md:grid-cols-[1fr_1fr_auto]">
                      <Input
                        value={customBookName}
                        onChange={(event) => setCustomBookName(event.target.value)}
                        placeholder="Custom book name"
                      />
                      <Input
                        value={customBookLogo}
                        onChange={(event) => setCustomBookLogo(event.target.value)}
                        placeholder="Logo URL (optional)"
                        className="h-7"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const trimmed = customBookName.trim()
                          if (!trimmed) return
                          const next = [
                            ...customBooks,
                            { id: trimmed.toLowerCase(), label: trimmed, logo: customBookLogo.trim() || undefined },
                          ]
                          persistCustomBooks(next)
                          handleSelectBook(trimmed)
                          setCustomBookName("")
                          setCustomBookLogo("")
                          setShowCustomBookInput(false)
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Event Date</Label>
                    <Input
                      type="date"
                      value={formState.event_date ?? ""}
                      onChange={(event) => handleFormChange("event_date", event.target.value)}
                      className="h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Event</Label>
                    <Input
                      value={formState.event}
                      onChange={(event) => handleFormChange("event", event.target.value)}
                      placeholder="Los Angeles Dodgers @ Toronto Blue Jays"
                      className="placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Market</Label>
                    <Input
                      value={formState.market}
                      onChange={(event) => handleFormChange("market", event.target.value)}
                      placeholder="Anytime Home Run"
                      className="placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Line</Label>
                    <Input
                      value={formState.line ?? ""}
                      onChange={(event) => handleFormChange("line", event.target.value)}
                      placeholder="0.5"
                      className="placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Bet Name</Label>
                    <Input
                      value={formState.bet_name}
                      onChange={(event) => handleFormChange("bet_name", event.target.value)}
                      placeholder="Shohei Ohtani Over 0.5"
                      className="placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Unit Stake</Label>
                    <Input
                      type="number"
                      value={formState.unit_stake}
                      onChange={(event) => handleFormChange("unit_stake", Number(event.target.value), "unit")}
                      className="h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Dollar Stake</Label>
                    <Input
                      type="number"
                      value={formState.dollar_stake}
                      onChange={(event) => handleFormChange("dollar_stake", Number(event.target.value), "dollar")}
                      className="h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Odds (American)</Label>
                    <Input
                      type="number"
                      value={formState.odds}
                      onChange={(event) => handleFormChange("odds", Number(event.target.value), "odds")}
                      className="h-7"
                    />
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Parlay</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={formState.is_parlay ?? false}
                        onCheckedChange={(value) => handleToggleField("is_parlay", value)}
                      />
                      {formState.is_parlay ? (
                        <Input
                          type="number"
                          className="h-7 w-[110px]"
                          value={formState.parlay_legs}
                          onChange={(event) => handleFormChange("parlay_legs", Number(event.target.value))}
                          placeholder="Legs"
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Profit Boost</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={formState.is_boost ?? false}
                        onCheckedChange={(value) => handleToggleField("is_boost", value)}
                      />
                      {formState.is_boost ? (
                        <Input
                          type="number"
                          className="h-7 w-[110px]"
                          value={formState.profit_boost_pct}
                          onChange={(event) => handleFormChange("profit_boost_pct", Number(event.target.value))}
                          placeholder="%"
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Bonus Bet</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={formState.is_bonus_bet ?? false}
                        onCheckedChange={(value) => handleToggleField("is_bonus_bet", value)}
                      />
                      {formState.is_bonus_bet ? (
                        <Input
                          type="number"
                          className="h-7 w-[120px]"
                          value={formState.bonus_bet_value}
                          onChange={(event) => handleFormChange("bonus_bet_value", Number(event.target.value))}
                          placeholder="Bonus value"
                        />
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>No Sweat</Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={formState.is_no_sweat ?? false}
                        onCheckedChange={(value) => handleToggleField("is_no_sweat", value)}
                      />
                      {formState.is_no_sweat ? (
                        <Input
                          type="number"
                          className="h-7 w-[120px]"
                          value={formState.no_sweat_value}
                          onChange={(event) => handleFormChange("no_sweat_value", Number(event.target.value))}
                          placeholder="No sweat value"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Result</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`border-emerald-500/60 text-emerald-300 ${formState.result === "Win" ? "bg-emerald-500/25" : ""}`}
                      onClick={() => handleFormChange("result", "Win")}
                    >
                      Win
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`border-rose-500/60 text-rose-300 ${formState.result === "Loss" ? "bg-rose-500/25" : ""}`}
                      onClick={() => handleFormChange("result", "Loss")}
                    >
                      Loss
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={resultIsOther ? "default" : "outline"}
                      onClick={() => handleFormChange("result", otherResultValue)}
                    >
                      Other
                    </Button>
                    {resultIsOther ? (
                      <Select
                        value={formState.result}
                        onValueChange={(value) => {
                          const nextValue = value as TrackerResult
                          setOtherResultValue(nextValue)
                          handleFormChange("result", nextValue)
                        }}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {otherResultOptions.map((result) => (
                            <SelectItem key={result} value={result}>
                              {result}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                </div>
                  </div>
                  {submitError ? (
                    <p className="text-xs text-rose-400">{submitError}</p>
                  ) : null}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={submitBet} disabled={saving}>
                      {saving ? "Saving..." : editingBet ? "Save Changes" : "Add Bet"}
                    </Button>
                  </DialogFooter>
                </MlbCardContent>
              </MlbCard>
            </DialogContent>
          </Dialog>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Import Bets</DialogTitle>
                <DialogDescription>
                  Map your spreadsheet headers to tracker fields, preview, and upload.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={importStep === 1 ? "text-white" : ""}>1. Upload</span>
                  <span>→</span>
                  <span className={importStep === 2 ? "text-white" : ""}>2. Map</span>
                  <span>→</span>
                  <span className={importStep === 3 ? "text-white" : ""}>3. Preview</span>
                </div>
                {importStep === 1 ? (
                  <div className="space-y-3">
                    <Label>CSV File</Label>
                    <Input type="file" accept=".csv" onChange={(event) => handleCsvUpload(event.target.files?.[0] ?? null)} />
                    <p className="text-xs text-muted-foreground">
                      Upload any CSV — you will map headers next.
                    </p>
                  </div>
                ) : null}

                {importStep === 2 ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      {trackerHeaders.map((header) => (
                        <div key={header.key} className="space-y-1">
                          <Label>{header.label}</Label>
                          <Select
                            value={headerMap[header.key] ?? "none"}
                            onValueChange={(value) =>
                              setHeaderMap((prev) => ({ ...prev, [header.key]: value === "none" ? "" : value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Not mapped</SelectItem>
                              {csvHeaders.map((csvHeader) => (
                                <SelectItem key={csvHeader} value={csvHeader}>
                                  {csvHeader}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setImportStep(1)}>
                        Back
                      </Button>
                      <Button onClick={() => setImportStep(3)}>Preview</Button>
                    </div>
                  </div>
                ) : null}

                {importStep === 3 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm text-muted-foreground">
                        {normalizedImportRows.length} rows parsed · {importErrors} missing required fields
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Required: {requiredImportKeys.join(", ")}
                      </div>
                    </div>
                    <div className="max-h-[280px] overflow-auto rounded-md border border-gray-700">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {trackerHeaders.slice(0, 7).map((header) => (
                              <TableHead key={header.key}>{header.label}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {normalizedImportRows.slice(0, 5).map((row, index) => (
                            <TableRow key={`${row.bet_name}-${index}`}>
                              <TableCell>{row.created_at ? formatDate(row.created_at) : "—"}</TableCell>
                              <TableCell>{row.event_date ? formatDate(row.event_date) : "—"}</TableCell>
                              <TableCell>{row.sport || "—"}</TableCell>
                              <TableCell>{row.sportsbook || "—"}</TableCell>
                              <TableCell>{row.event || "—"}</TableCell>
                              <TableCell>{row.market || "—"}</TableCell>
                              <TableCell>{row.bet_name || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setImportStep(2)}>
                        Back
                      </Button>
                      <Button onClick={submitImport} disabled={importing || normalizedImportRows.length === 0}>
                        {importing ? "Importing..." : "Import Bets"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-white/80">Unit Size ($)</span>
              <Input
                value={unitInput}
                onChange={(event) => setUnitInput(event.target.value)}
                onBlur={saveUnitSize}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur()
                  }
                }}
                className="h-8 w-[120px]"
                placeholder="100"
              />
              {savingUnit ? <span className="text-[11px] text-muted-foreground">Saving...</span> : null}
            </div>
          </div>
        </MlbCardContent>
      </MlbCard>

      <div className="grid gap-3 lg:grid-cols-[1fr_2fr]">
        <MlbCard variant="muted" className="bg-[#0b1220]/50 backdrop-blur-xl border border-white/10">
          <MlbCardHeader className="flex flex-row items-center justify-between gap-3 p-3 pb-2">
            <div>
              <MlbCardTitle className="text-sm font-semibold tracking-tight">Calendar</MlbCardTitle>
              <MlbCardDescription className="text-xs">
                Daily net results ({unitModeLabel.toLowerCase()} view).
              </MlbCardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{unitModeLabel}</span>
              <Switch checked={calendarUnitsMode} onCheckedChange={setCalendarUnitsMode} />
            </div>
          </MlbCardHeader>
          <MlbCardContent className="space-y-3 px-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
              {calendarCells.map((cell, index) => {
                if (!cell.date) {
                  return <div key={`empty-${index}`} className="h-16 rounded-xl border border-transparent" />
                }
                const value = calendarUnitsMode && unitSize ? cell.net / unitSize : cell.net
                const displayValue = calendarUnitsMode ? formatUnits(value) : formatCurrency(value)
                const valueClass =
                  cell.net > 0 ? "text-emerald-400" : cell.net < 0 ? "text-rose-400" : "text-muted-foreground"
                const bgClass =
                  cell.net > 0
                    ? "bg-emerald-500/15"
                    : cell.net < 0
                      ? "bg-rose-500/15"
                      : "bg-white/5"
                return (
                  <div key={cell.date.toISOString()} className={`h-16 rounded-xl border border-gray-700/60 p-2 ${bgClass}`}>
                    <div className="text-[11px] text-muted-foreground">{cell.date.getDate()}</div>
                    <div className={`mt-2 text-sm font-semibold ${valueClass}`}>
                      {cell.net === 0 ? "—" : displayValue}
                    </div>
                  </div>
                )
              })}
            </div>
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Monthly total</span>
              <span className={calendarSummary.monthNet >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {calendarUnitsMode && unitSize ? formatUnits(calendarSummary.monthUnits) : formatCurrency(calendarSummary.monthNet)}
              </span>
            </div>
          </MlbCardContent>
        </MlbCard>

        <MlbCard variant="muted" className="bg-[#0b1220]/50 backdrop-blur-xl border border-white/10">
          <MlbCardHeader className="p-3 pb-2">
            <MlbCardTitle className="text-sm font-semibold tracking-tight">Dashboard with summary and results</MlbCardTitle>
          </MlbCardHeader>
          <MlbCardContent className="space-y-4 px-3 pb-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <MlbCard variant="muted">
                <MlbCardHeader className="p-3 pb-1">
                  <MlbCardTitle className="text-xs text-muted-foreground">Net Profit</MlbCardTitle>
                </MlbCardHeader>
                <MlbCardContent className="px-3 pb-3 text-lg font-semibold">
                  {formatCurrency(stats.totalProfit)}
                </MlbCardContent>
              </MlbCard>
              <MlbCard variant="muted">
                <MlbCardHeader className="p-3 pb-1">
                  <MlbCardTitle className="text-xs text-muted-foreground">Win Rate</MlbCardTitle>
                </MlbCardHeader>
                <MlbCardContent className="px-3 pb-3 text-lg font-semibold">
                  {stats.winRate.toFixed(1)}%
                </MlbCardContent>
              </MlbCard>
              <MlbCard variant="muted">
                <MlbCardHeader className="p-3 pb-1">
                  <MlbCardTitle className="text-xs text-muted-foreground">ROI</MlbCardTitle>
                </MlbCardHeader>
                <MlbCardContent className="px-3 pb-3 text-lg font-semibold">
                  {stats.roi.toFixed(1)}%
                </MlbCardContent>
              </MlbCard>
              <MlbCard variant="muted">
                <MlbCardHeader className="p-3 pb-1">
                  <MlbCardTitle className="text-xs text-muted-foreground">Total Bets</MlbCardTitle>
                </MlbCardHeader>
                <MlbCardContent className="px-3 pb-3 text-lg font-semibold">
                  {stats.totalBets}
                </MlbCardContent>
              </MlbCard>
            </div>
            <div className="h-[180px] rounded-[4px] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Dashboard chart placeholder
            </div>
          </MlbCardContent>
        </MlbCard>
      </div>

      <MlbCard variant="muted" className="bg-[#0b1220]/50 backdrop-blur-xl border border-white/10">
        <MlbCardHeader className="p-3 pb-2">
          <MlbCardTitle className="text-sm font-semibold tracking-tight">Filters</MlbCardTitle>
          <MlbCardDescription className="text-xs">Search and refine by sport, result, or date.</MlbCardDescription>
        </MlbCardHeader>
        <MlbCardContent className="space-y-3 px-3 pb-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search bets, events, markets..."
                className="pl-8"
              />
            </div>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                {TRACKER_RESULTS.map((result) => (
                  <SelectItem key={result} value={result}>
                    {result}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sportsbookFilter} onValueChange={setSportsbookFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sportsbook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                {sportsbooks.map((book) => (
                  <SelectItem key={book} value={book}>
                    {book}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                {markets.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={parlayFilter} onValueChange={setParlayFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Parlay" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Parlay</SelectItem>
                <SelectItem value="yes">Parlay: Yes</SelectItem>
                <SelectItem value="no">Parlay: No</SelectItem>
              </SelectContent>
            </Select>
            <Select value={boostFilter} onValueChange={setBoostFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Boost" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Boost</SelectItem>
                <SelectItem value="yes">Boost: Yes</SelectItem>
                <SelectItem value="no">Boost: No</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bonusFilter} onValueChange={setBonusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Bonus Bet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Bonus Bet</SelectItem>
                <SelectItem value="yes">Bonus: Yes</SelectItem>
                <SelectItem value="no">Bonus: No</SelectItem>
              </SelectContent>
            </Select>
            <Select value={noSweatFilter} onValueChange={setNoSweatFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="No Sweat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">No Sweat</SelectItem>
                <SelectItem value="yes">No Sweat: Yes</SelectItem>
                <SelectItem value="no">No Sweat: No</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
              <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">{unitHelper}</div>
        </MlbCardContent>
      </MlbCard>

      <MlbCard variant="muted" className="bg-[#0b1220]/50 backdrop-blur-xl border border-white/10">
        <MlbCardHeader className="p-3 pb-2">
          <MlbCardTitle className="text-sm font-semibold tracking-tight">Bet Log</MlbCardTitle>
          <MlbCardDescription className="text-xs">
            Spreadsheet view with edit and delete actions.
          </MlbCardDescription>
        </MlbCardHeader>
        <MlbCardContent className="px-3 pb-3">
          {deleteError ? (
            <p className="mb-2 text-xs text-rose-400">{deleteError}</p>
          ) : null}
          <div className="overflow-hidden">
            <Table className="w-full table-fixed text-[10px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2 text-[10px]">Created</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Event Date</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Sport</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Sportsbook</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Event</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Market</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Line</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Bet Name</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Odds</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Implied %</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">$ Stake</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Unit</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Potential</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Result</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Payout</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Parlay</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Legs</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Boost</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Boost %</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Bonus</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Bonus $</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">No Sweat</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">No Sweat $</TableHead>
                  <TableHead className="px-2 py-2 text-[10px]">Net</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBets.map((bet) => {
                  const net = calculateNetProfit(bet.result, bet.dollar_stake, bet.payout, bet.potential_payout)
                  const netDisplay = formatCurrency(net)
                  return (
                    <TableRow key={bet.id} className="text-[10px]">
                      <TableCell className="px-2 py-2">{formatDate(bet.created_at)}</TableCell>
                      <TableCell className="px-2 py-2">{formatDate(resolveEventDate(bet.event_date, bet.created_at))}</TableCell>
                      <TableCell className="px-2 py-2">{bet.sport}</TableCell>
                      <TableCell className="px-2 py-2">{bet.sportsbook}</TableCell>
                      <TableCell className="px-2 py-2 truncate" title={bet.event}>{bet.event}</TableCell>
                      <TableCell className="px-2 py-2 truncate" title={bet.market}>{bet.market}</TableCell>
                      <TableCell className="px-2 py-2">{bet.line || "—"}</TableCell>
                      <TableCell className="px-2 py-2 truncate" title={bet.bet_name}>{bet.bet_name}</TableCell>
                      <TableCell className="px-2 py-2">{bet.odds}</TableCell>
                      <TableCell className="px-2 py-2">{bet.implied_win_pct.toFixed(1)}%</TableCell>
                      <TableCell className="px-2 py-2">{formatCurrency(bet.dollar_stake)}</TableCell>
                      <TableCell className="px-2 py-2">{bet.unit_stake.toFixed(2)}</TableCell>
                      <TableCell className="px-2 py-2">{formatCurrency(bet.potential_payout)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{bet.result}</Badge>
                      </TableCell>
                      <TableCell className="px-2 py-2">{formatCurrency(bet.payout)}</TableCell>
                      <TableCell className="px-2 py-2">{bet.is_parlay ? "Yes" : "No"}</TableCell>
                      <TableCell className="px-2 py-2">{bet.parlay_legs || "—"}</TableCell>
                      <TableCell className="px-2 py-2">{bet.is_boost ? "Yes" : "No"}</TableCell>
                      <TableCell className="px-2 py-2">{bet.is_boost ? `${bet.profit_boost_pct}%` : "—"}</TableCell>
                      <TableCell className="px-2 py-2">{bet.is_bonus_bet ? "Yes" : "No"}</TableCell>
                      <TableCell className="px-2 py-2">{bet.is_bonus_bet ? formatCurrency(bet.bonus_bet_value) : "—"}</TableCell>
                      <TableCell className="px-2 py-2">{bet.is_no_sweat ? "Yes" : "No"}</TableCell>
                      <TableCell className="px-2 py-2">{bet.is_no_sweat ? formatCurrency(bet.no_sweat_value) : "—"}</TableCell>
                      <TableCell className={`px-2 py-2 ${net >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {netDisplay}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(bet)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBet(bet.id)}
                            disabled={!bet.id}
                          >
                            <Trash2 className="h-4 w-4 text-rose-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredBets.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={24} className="text-center text-sm text-muted-foreground">
                      No bets found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </MlbCardContent>
      </MlbCard>
      </div>
    </div>
  )
}
