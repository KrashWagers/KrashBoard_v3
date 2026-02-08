/**
 * Types for MLB Batter vs Pitcher (BvP) API and UI.
 * Matches BigQuery tables: batter_vs_pitcher.bvp_summary_v1, batter_vs_pitcher.bvp_payload_v1
 */

/** One row in the summary table (boxscore-style totals + rate stats) */
export type BvpSummaryRow = {
  matchup_gameID: string
  batter: number
  batter_name: string
  pitcher: number
  pitcher_name: string
  batter_team: string
  pitcher_team: string
  team_logo: string
  opponent_logo: string
  batter_headshot?: string | null
  pitcher_headshot?: string | null
  pitcher_position_group: string
  expected_starter_id: number | null
  is_vs_expected_starter: boolean
  is_vs_relief_pitcher: boolean
  pa: number
  ab: number
  h: number
  singles: number
  doubles: number
  triples: number
  hr: number
  bb: number
  hbp: number
  so: number
  roe: number
  gidp: number
  sf: number
  tb: number
  avg: number | null
  obp: number | null
  slg: number | null
  ops: number | null
}

/** GET /api/mlb/bvp/matchup response */
export type BvpMatchupResponse = {
  matchup_gameID: string
  matchup_game_date: string
  rows: BvpSummaryRow[]
}

/** One plate appearance in pa_details */
export type BvpPaDetail = {
  pa_game_date: string
  pa_game_pk: number
  inning: number
  inning_topbot: string
  outs_when_up: number
  at_bat_number: number
  pa_pitch_count: number
  pa_balls: number
  pa_strikes: number
  pa_swings: number
  pa_whiffs: number
  pa_contacts: number
  pa_fouls: number
  pa_balls_in_play: number
  pa_bip_flag: number
  pa_hits: number
  pa_hrs: number
  pa_end_events: string
  pa_end_description: string
  home_team: string
  away_team: string
  game_year: number
  game_type: string
}

/** GET /api/mlb/bvp/details response */
export type BvpDetailsResponse = {
  matchup_gameID: string
  batter: number
  pitcher: number
  summary: BvpSummaryRow
  pa_details: BvpPaDetail[]
}

/** GET /api/mlb/bvp/matchups response (list of matchup_gameIDs for selector) */
export type BvpMatchupsListResponse = {
  matchups: { matchup_gameID: string; matchup_game_date: string }[]
}

/** GET /api/mlb/bvp/pa-payload response — bulk PA data for current filters, 24h cached */
export type BvpPaPayloadItem = {
  matchup_gameID: string
  batter: number
  pitcher: number
  pa_details: BvpPaDetail[]
}

export type BvpPaPayloadResponse = {
  payloads: BvpPaPayloadItem[]
}
