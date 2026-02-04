import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { trackerBetInputSchema } from "@/lib/tracker/validators"
import { calculateImpliedWinPct, calculatePotentialPayout } from "@/lib/tracker/calculations"

const resolveUnitSize = async (supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, userId: string) => {
  const { data } = await supabase
    .from("user_preferences")
    .select("unit_size")
    .eq("user_id", userId)
    .single()
  return data?.unit_size != null ? Number(data.unit_size) : null
}

const normalizeBetInput = (input: typeof trackerBetInputSchema._type, unitSize: number | null) => {
  const odds = input.odds != null ? Number(input.odds) : -110
  const stakeFromInput = input.dollar_stake != null ? Number(input.dollar_stake) : null
  const unitFromInput = input.unit_stake != null ? Number(input.unit_stake) : null
  const resolvedUnitSize = unitSize && unitSize > 0 ? unitSize : null

  const dollarStake = stakeFromInput ?? (resolvedUnitSize && unitFromInput != null ? unitFromInput * resolvedUnitSize : 0)
  const unitStake = unitFromInput ?? (resolvedUnitSize ? dollarStake / resolvedUnitSize : 0)
  const impliedWin = input.implied_win_pct != null ? Number(input.implied_win_pct) : calculateImpliedWinPct(odds)
  const potentialPayout = input.potential_payout != null
    ? Number(input.potential_payout)
    : calculatePotentialPayout(odds, dollarStake)
  const payout = input.payout != null ? Number(input.payout) : 0

  const eventDate = input.event_date ? new Date(input.event_date) : null
  const resolvedEventDate = eventDate && !Number.isNaN(eventDate.getTime())
    ? eventDate.toISOString().slice(0, 10)
    : new Date(input.created_at ?? new Date().toISOString()).toISOString().slice(0, 10)

  const isParlay = Boolean(input.is_parlay)
  const isBoost = Boolean(input.is_boost)
  const isBonusBet = Boolean(input.is_bonus_bet)
  const isNoSweat = Boolean(input.is_no_sweat)
  const parlayLegs = isParlay ? Number(input.parlay_legs ?? 0) : 0
  const profitBoostPct = isBoost ? Number(input.profit_boost_pct ?? 0) : 0
  const bonusBetValue = isBonusBet ? Number(input.bonus_bet_value ?? dollarStake) : 0
  const noSweatValue = isNoSweat ? Number(input.no_sweat_value ?? dollarStake) : 0

  return {
    created_at: input.created_at ?? new Date().toISOString(),
    event_date: resolvedEventDate,
    is_parlay: isParlay,
    parlay_legs: parlayLegs,
    is_boost: isBoost,
    profit_boost_pct: Number(profitBoostPct.toFixed(2)),
    is_bonus_bet: isBonusBet,
    bonus_bet_value: Number(bonusBetValue.toFixed(2)),
    is_no_sweat: isNoSweat,
    no_sweat_value: Number(noSweatValue.toFixed(2)),
    sport: input.sport?.trim() || "Other",
    sportsbook: input.sportsbook?.trim() || "Other",
    event: input.event?.trim() || "Unspecified Event",
    market: input.market?.trim() || "Unspecified Market",
    line: input.line?.trim() ?? "",
    bet_name: input.bet_name?.trim() || "Unspecified Bet",
    odds,
    implied_win_pct: impliedWin,
    dollar_stake: Number(dollarStake.toFixed(2)),
    unit_stake: Number(unitStake.toFixed(2)),
    potential_payout: Number(potentialPayout.toFixed(2)),
    result: input.result,
    payout: Number(payout.toFixed(2)),
  }
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: bets, error } = await supabase
    .from("user_bets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ bets })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    const parsed = trackerBetInputSchema.safeParse(payload)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
    }

    const unitSize = await resolveUnitSize(supabase, user.id)
    const normalized = normalizeBetInput(parsed.data, unitSize)

    const { data: bet, error } = await supabase
      .from("user_bets")
      .insert({ ...normalized, user_id: user.id })
      .select("*")
      .single()

    if (error) {
      console.error("Tracker bet insert failed", error)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }

    return NextResponse.json({ bet })
  } catch (error) {
    console.error("Tracker bet POST failed", error)
    return NextResponse.json({ error: "Failed to create bet" }, { status: 500 })
  }
}
