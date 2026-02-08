/**
 * Types for NBA player props API and BigQuery table
 * nba25-475715.webapp.nba_player_props_long_v1
 */

/** Raw row from BigQuery (schema matches table) */
export interface NbaPlayerPropsRawRow {
  event_id: string | null
  event_date: string | { value?: string } | null
  start_time_utc: string | { value?: string } | null
  home_team: string | null
  away_team: string | null
  player_id: string | null
  player_name: string | null
  player_team_id: string | null
  stat_id: string | null
  period_id: string | null
  bet_type_id: string | null
  side_id: string | null
  line: number | null
  line_type: string | null
  is_alt_line: boolean | null
  alt_line_index: number | null
  bookmaker_id: string | null
  available: boolean | null
  last_price_update_utc: string | { value?: string } | null
  odds_american: string | null
  odds_decimal: number | null
  implied_prob: number | null
  deeplink: string | null
  openFairOdds_raw: string | null
  openBookOdds_raw: string | null
  prop_key: string | null
  selection_key: string | null
  sharp_book: string | null
  fair_prob: number | null
  ev_per_dollar: number | null
  prob_edge: number | null
  kelly_frac: number | null
  kelly_quarter: number | null
  raw_book_json?: string | null
}

export interface BookPrice {
  bookmaker_id: string
  odds_american: string | null
  odds_decimal: number | null
  implied_prob: number | null
  ev_per_dollar: number | null
  prob_edge: number | null
  kelly_quarter: number | null
  last_price_update_utc: string | null
  deeplink: string | null
  openFairOdds_raw: string | null
  openBookOdds_raw: string | null
}

export interface PropSide {
  books: Record<string, BookPrice>
  best_price_book: string | null
  best_ev_book: string | null
  best_edge_book: string | null
}

export interface PropGroup {
  prop_key: string
  event_id: string | null
  event_date: string | null
  start_time_utc: string | null
  home_team: string | null
  away_team: string | null
  player_id: string | null
  player_name: string | null
  player_team_id: string | null
  stat_id: string | null
  period_id: string | null
  bet_type_id: string | null
  line: number | null
  line_type: string | null
  is_alt_line: boolean
  alt_line_index: number | null
  sharp_book: string | null
  fair_prob: number | null
  last_updated_max_utc: string | null
  has_pinnacle: boolean
  has_circa: boolean
  missing_side: boolean
  sides: Record<string, PropSide>
}

/** One row per (selection_key, bookmaker_id) for +EV screen */
export interface FlatSelection {
  selection_key: string
  prop_key: string
  bookmaker_id: string
  event_id: string | null
  event_date: string | null
  start_time_utc: string | null
  home_team: string | null
  away_team: string | null
  player_id: string | null
  player_name: string | null
  player_team_id: string | null
  stat_id: string | null
  period_id: string | null
  bet_type_id: string | null
  side_id: string | null
  line: number | null
  is_alt_line: boolean
  odds_american: string | null
  odds_decimal: number | null
  implied_prob: number | null
  fair_prob: number | null
  ev_per_dollar: number | null
  prob_edge: number | null
  kelly_quarter: number | null
  last_price_update_utc: string | null
  deeplink: string | null
}

export interface NbaPropsApiMeta {
  generated_at_utc: string
  cache_hit: boolean
  start_date: string
  end_date: string
  row_count_raw: number
  prop_group_count: number
  selection_count: number
  ttl_seconds: number
}

export interface NbaPropsApiResponse {
  meta: NbaPropsApiMeta
  data: {
    propGroups: Record<string, PropGroup>
    flatSelections: FlatSelection[]
  }
}
