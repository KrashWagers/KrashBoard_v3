export const TRACKER_RESULTS = [
  "Win",
  "Loss",
  "Push",
  "Pending",
  "Void",
  "Cancelled",
] as const

export type TrackerResult = (typeof TRACKER_RESULTS)[number]

export type TrackerBet = {
  id: string
  user_id: string
  created_at: string
  event_date: string
  is_parlay: boolean
  parlay_legs: number
  is_boost: boolean
  profit_boost_pct: number
  is_bonus_bet: boolean
  bonus_bet_value: number
  is_no_sweat: boolean
  no_sweat_value: number
  sport: string
  sportsbook: string
  event: string
  market: string
  line?: string
  bet_name: string
  odds: number
  implied_win_pct: number
  dollar_stake: number
  unit_stake: number
  potential_payout: number
  result: TrackerResult
  payout: number
  updated_at: string
}

export type TrackerBetInput = {
  created_at?: string
  event_date?: string
  is_parlay?: boolean
  parlay_legs?: number
  is_boost?: boolean
  profit_boost_pct?: number
  is_bonus_bet?: boolean
  bonus_bet_value?: number
  is_no_sweat?: boolean
  no_sweat_value?: number
  sport: string
  sportsbook: string
  event: string
  market: string
  line?: string
  bet_name: string
  odds: number
  implied_win_pct?: number
  dollar_stake?: number
  unit_stake?: number
  potential_payout?: number
  result: TrackerResult
  payout?: number
}

export type TrackerImportPayload = {
  rows: TrackerBetInput[]
}
