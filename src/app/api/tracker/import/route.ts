import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { trackerImportSchema, type TrackerImportRow } from "@/lib/tracker/validators"
import { calculateImpliedWinPct, calculatePotentialPayout } from "@/lib/tracker/calculations"

const resolveUnitSize = async (supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) => {
  const { data } = await supabase
    .from("user_preferences")
    .select("unit_size")
    .eq("user_id", userId)
    .single()
  return data?.unit_size != null ? Number(data.unit_size) : null
}

const normalizeRow = (row: TrackerImportRow, unitSize: number | null) => {
  const odds = Number(row.odds)
  const resolvedUnitSize = unitSize && unitSize > 0 ? unitSize : null
  const stake = row.dollar_stake != null ? Number(row.dollar_stake) : null
  const units = row.unit_stake != null ? Number(row.unit_stake) : null

  const dollarStake = stake ?? (resolvedUnitSize && units != null ? units * resolvedUnitSize : 0)
  const unitStake = units ?? (resolvedUnitSize ? dollarStake / resolvedUnitSize : 0)
  const impliedWin = row.implied_win_pct != null ? Number(row.implied_win_pct) : calculateImpliedWinPct(odds)
  const potential = row.potential_payout != null
    ? Number(row.potential_payout)
    : calculatePotentialPayout(odds, dollarStake)

  const eventDate = row.event_date ? new Date(row.event_date) : null
  const resolvedEventDate = eventDate && !Number.isNaN(eventDate.getTime())
    ? eventDate.toISOString().slice(0, 10)
    : new Date(row.created_at ?? new Date().toISOString()).toISOString().slice(0, 10)

  const isParlay = Boolean(row.is_parlay)
  const isBoost = Boolean(row.is_boost)
  const isBonusBet = Boolean(row.is_bonus_bet)
  const isNoSweat = Boolean(row.is_no_sweat)
  const parlayLegs = isParlay ? Number(row.parlay_legs ?? 0) : 0
  const profitBoostPct = isBoost ? Number(row.profit_boost_pct ?? 0) : 0
  const bonusBetValue = isBonusBet ? Number(row.bonus_bet_value ?? dollarStake) : 0
  const noSweatValue = isNoSweat ? Number(row.no_sweat_value ?? dollarStake) : 0

  return {
    created_at: row.created_at ?? new Date().toISOString(),
    event_date: resolvedEventDate,
    is_parlay: isParlay,
    parlay_legs: parlayLegs,
    is_boost: isBoost,
    profit_boost_pct: Number(profitBoostPct.toFixed(2)),
    is_bonus_bet: isBonusBet,
    bonus_bet_value: Number(bonusBetValue.toFixed(2)),
    is_no_sweat: isNoSweat,
    no_sweat_value: Number(noSweatValue.toFixed(2)),
    sport: (row.sport ?? "").trim(),
    sportsbook: (row.sportsbook ?? "").trim(),
    event: (row.event ?? "").trim(),
    market: (row.market ?? "").trim(),
    line: row.line?.trim() ?? "",
    bet_name: (row.bet_name ?? "").trim(),
    odds,
    implied_win_pct: Number(impliedWin.toFixed(2)),
    dollar_stake: Number(dollarStake.toFixed(2)),
    unit_stake: Number(unitStake.toFixed(2)),
    potential_payout: Number(potential.toFixed(2)),
    result: row.result,
    payout: row.payout != null ? Number(row.payout) : 0,
    updated_at: new Date().toISOString(),
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await request.json()
  const parsed = trackerImportSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const unitSize = await resolveUnitSize(supabase, user.id)
  const rows = parsed.data.rows.map((row) => normalizeRow(row, unitSize))

  const { data: inserted, error } = await supabase
    .from("user_bets")
    .insert(rows.map((row) => ({ ...row, user_id: user.id })))
    .select("*")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bets: inserted })
}
