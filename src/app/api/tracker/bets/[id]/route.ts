import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { trackerBetUpdateSchema, type TrackerBetUpdateInput } from "@/lib/tracker/validators"
import { calculateImpliedWinPct, calculatePotentialPayout } from "@/lib/tracker/calculations"

const resolveUnitSize = async (supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) => {
  const { data } = await supabase
    .from("user_preferences")
    .select("unit_size")
    .eq("user_id", userId)
    .single()
  return data?.unit_size != null ? Number(data.unit_size) : null
}

const normalizeUpdate = (
  input: TrackerBetUpdateInput,
  unitSize: number | null
) => {
  const resolvedUnitSize = unitSize && unitSize > 0 ? unitSize : null
  const next: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (input.created_at) next.created_at = input.created_at
  if (input.event_date) next.event_date = input.event_date
  if (input.is_parlay != null) next.is_parlay = Boolean(input.is_parlay)
  if (input.parlay_legs != null) next.parlay_legs = Number(input.parlay_legs)
  if (input.is_boost != null) next.is_boost = Boolean(input.is_boost)
  if (input.profit_boost_pct != null) next.profit_boost_pct = Number(input.profit_boost_pct)
  if (input.is_bonus_bet != null) next.is_bonus_bet = Boolean(input.is_bonus_bet)
  if (input.bonus_bet_value != null) next.bonus_bet_value = Number(input.bonus_bet_value)
  if (input.is_no_sweat != null) next.is_no_sweat = Boolean(input.is_no_sweat)
  if (input.no_sweat_value != null) next.no_sweat_value = Number(input.no_sweat_value)
  if (input.sport != null) next.sport = input.sport.trim()
  if (input.sportsbook != null) next.sportsbook = input.sportsbook.trim()
  if (input.event != null) next.event = input.event.trim()
  if (input.market != null) next.market = input.market.trim()
  if (input.line != null) next.line = input.line.trim()
  if (input.bet_name != null) next.bet_name = input.bet_name.trim()
  if (input.result) next.result = input.result

  const odds = input.odds != null ? Number(input.odds) : null
  const stake = input.dollar_stake != null ? Number(input.dollar_stake) : null
  const units = input.unit_stake != null ? Number(input.unit_stake) : null

  if (odds != null) {
    next.odds = odds
    next.implied_win_pct = input.implied_win_pct != null ? Number(input.implied_win_pct) : calculateImpliedWinPct(odds)
  }

  if (stake != null || units != null) {
    const dollarStake = stake ?? (resolvedUnitSize && units != null ? units * resolvedUnitSize : 0)
    const unitStake = units ?? (resolvedUnitSize ? dollarStake / resolvedUnitSize : 0)
    next.dollar_stake = Number(dollarStake.toFixed(2))
    next.unit_stake = Number(unitStake.toFixed(2))
    if (odds != null) {
      next.potential_payout = calculatePotentialPayout(odds, dollarStake)
    }
  }

  if (input.potential_payout != null) {
    next.potential_payout = Number(input.potential_payout)
  }

  if (input.payout != null) {
    next.payout = Number(input.payout)
  }

  return next
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payload = await request.json()
  const parsed = trackerBetUpdateSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const unitSize = await resolveUnitSize(supabase, user.id)
  const updates = normalizeUpdate(parsed.data, unitSize)

  const { data: bet, error } = await supabase
    .from("user_bets")
    .update(updates)
    .eq("id", resolvedParams.id)
    .eq("user_id", user.id)
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bet })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    if (!resolvedParams.id || resolvedParams.id === "undefined") {
      return NextResponse.json({ error: "Missing bet id" }, { status: 400 })
    }
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: deletedRows, error } = await supabase
      .from("user_bets")
      .delete()
      .eq("id", resolvedParams.id)
      .eq("user_id", user.id)
      .select("id")

    if (error) {
      console.error("Tracker bet delete failed", { error, betId: resolvedParams.id, userId: user.id })
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }

    if (!deletedRows || deletedRows.length === 0) {
      console.warn("Tracker bet delete: no matching row", { betId: resolvedParams.id, userId: user.id })
      return NextResponse.json({ error: "Bet not found or not owned by user" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, deleted: deletedRows[0] })
  } catch (error) {
    console.error("Tracker bet DELETE failed", error)
    return NextResponse.json({ error: "Failed to delete bet" }, { status: 500 })
  }
}
