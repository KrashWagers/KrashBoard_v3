import type {
  NbaPlayerPropsRawRow,
  PropGroup,
  PropSide,
  BookPrice,
  FlatSelection,
} from "./types"

/** Normalize BigQuery DATE/TIMESTAMP (may be string or { value: string }) */
function normStr(
  v: string | { value?: string } | null | undefined
): string | null {
  if (v == null) return null
  if (typeof v === "string") return v
  if (
    typeof v === "object" &&
    v !== null &&
    "value" in v &&
    typeof (v as { value?: string }).value === "string"
  ) {
    return (v as { value: string }).value
  }
  return null
}

function normNum(v: number | null | undefined): number | null {
  if (v == null || Number.isNaN(v)) return null
  return v
}

function normBool(v: boolean | null | undefined): boolean {
  return Boolean(v)
}

export function transformNbaPlayerProps(
  rows: NbaPlayerPropsRawRow[]
): { propGroups: Record<string, PropGroup>; flatSelections: FlatSelection[] } {
  const propGroups: Record<string, PropGroup> = {}
  const flatSelections: FlatSelection[] = []

  for (const row of rows) {
    const propKey = row.prop_key ?? ""
    const selectionKey = row.selection_key ?? ""
    const bookmakerId = row.bookmaker_id ?? ""
    const sideId = row.side_id ?? ""

    if (!propKey || !bookmakerId) continue

    const bookPrice: BookPrice = {
      bookmaker_id: bookmakerId,
      odds_american: row.odds_american ?? null,
      odds_decimal: normNum(row.odds_decimal),
      implied_prob: normNum(row.implied_prob),
      ev_per_dollar: normNum(row.ev_per_dollar),
      prob_edge: normNum(row.prob_edge),
      kelly_quarter: normNum(row.kelly_quarter),
      last_price_update_utc: normStr(row.last_price_update_utc),
      deeplink: row.deeplink ?? null,
      openFairOdds_raw: row.openFairOdds_raw ?? null,
      openBookOdds_raw: row.openBookOdds_raw ?? null,
    }

    if (!propGroups[propKey]) {
      const eventDate = normStr(row.event_date)
      const startTimeUtc = normStr(row.start_time_utc)
      const lastUpdate = normStr(row.last_price_update_utc)
      propGroups[propKey] = {
        prop_key: propKey,
        event_id: row.event_id ?? null,
        event_date: eventDate,
        start_time_utc: startTimeUtc,
        home_team: row.home_team ?? null,
        away_team: row.away_team ?? null,
        player_id: row.player_id ?? null,
        player_name: row.player_name ?? null,
        player_team_id: row.player_team_id ?? null,
        stat_id: row.stat_id ?? null,
        period_id: row.period_id ?? null,
        bet_type_id: row.bet_type_id ?? null,
        line: normNum(row.line),
        line_type: row.line_type ?? null,
        is_alt_line: normBool(row.is_alt_line),
        alt_line_index: normNum(row.alt_line_index),
        sharp_book: row.sharp_book ?? null,
        fair_prob: normNum(row.fair_prob),
        last_updated_max_utc: lastUpdate,
        has_pinnacle: false,
        has_circa: false,
        missing_side: false,
        sides: {},
      }
    }

    const group = propGroups[propKey]
    if (!group.sides[sideId]) {
      group.sides[sideId] = {
        books: {},
        best_price_book: null,
        best_ev_book: null,
        best_edge_book: null,
      }
    }
    group.sides[sideId].books[bookmakerId] = bookPrice

    const lastUpdate = normStr(row.last_price_update_utc)
    if (
      lastUpdate &&
      (!group.last_updated_max_utc || lastUpdate > group.last_updated_max_utc)
    ) {
      group.last_updated_max_utc = lastUpdate
    }
    if (bookmakerId === "pinnacle" || bookmakerId === "pinnacle_offshore") {
      group.has_pinnacle = true
    }
    if (bookmakerId === "circa" || bookmakerId === "circa_sports") {
      group.has_circa = true
    }

    flatSelections.push({
      selection_key: selectionKey,
      prop_key: propKey,
      bookmaker_id: bookmakerId,
      event_id: row.event_id ?? null,
      event_date: normStr(row.event_date),
      start_time_utc: normStr(row.start_time_utc),
      home_team: row.home_team ?? null,
      away_team: row.away_team ?? null,
      player_id: row.player_id ?? null,
      player_name: row.player_name ?? null,
      player_team_id: row.player_team_id ?? null,
      stat_id: row.stat_id ?? null,
      period_id: row.period_id ?? null,
      bet_type_id: row.bet_type_id ?? null,
      side_id: sideId,
      line: normNum(row.line),
      is_alt_line: normBool(row.is_alt_line),
      odds_american: row.odds_american ?? null,
      odds_decimal: normNum(row.odds_decimal),
      implied_prob: normNum(row.implied_prob),
      fair_prob: normNum(row.fair_prob),
      ev_per_dollar: normNum(row.ev_per_dollar),
      prob_edge: normNum(row.prob_edge),
      kelly_quarter: normNum(row.kelly_quarter),
      last_price_update_utc: lastUpdate,
      deeplink: row.deeplink ?? null,
    })
  }

  for (const group of Object.values(propGroups)) {
    const sideIds = Object.keys(group.sides)
    group.missing_side = sideIds.length < 2

    for (const sideId of sideIds) {
      const side = group.sides[sideId]
      const books = Object.values(side.books)

      let bestPriceBook: string | null = null
      let bestPriceDec = -Infinity
      let bestEvBook: string | null = null
      let bestEv = -Infinity
      let bestEdgeBook: string | null = null
      let bestEdge = -Infinity

      for (const b of books) {
        if (b.odds_decimal != null && b.odds_decimal > bestPriceDec) {
          bestPriceDec = b.odds_decimal
          bestPriceBook = b.bookmaker_id
        }
        if (b.ev_per_dollar != null && b.ev_per_dollar > bestEv) {
          bestEv = b.ev_per_dollar
          bestEvBook = b.bookmaker_id
        }
        if (b.prob_edge != null && b.prob_edge > bestEdge) {
          bestEdge = b.prob_edge
          bestEdgeBook = b.bookmaker_id
        }
      }
      side.best_price_book = bestPriceBook
      side.best_ev_book = bestEvBook
      side.best_edge_book = bestEdgeBook
    }
  }

  return { propGroups, flatSelections }
}
