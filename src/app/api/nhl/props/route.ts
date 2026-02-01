import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { CACHE_KEYS, CACHE_TTL, getCached, setCached, invalidateCached } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

interface RawNHLRow {
  Prop_UID: string | null
  Event_ID: string | null
  ['Start Date']: string | null
  ['Start Time']: string | null
  Home: string | null
  Away: string | null
  Player: string | null
  player_headshot: string | null
  Side: string | null
  Line: number | null
  Prop: string | null
  ['is Alt']: number | null
  // Sportsbook columns
  ['BetMGM Odds']: number | null
  ['BetMGM IW%']: number | null
  ['BetRivers Odds']: number | null
  ['BetRivers IW%']: number | null
  ['DraftKings Odds']: number | null
  ['DraftKings IW%']: number | null
  ['Fanatics Odds']: number | null
  ['Fanatics IW%']: number | null
  ['FanDuel Odds']: number | null
  ['FanDuel IW%']: number | null
  ['Pinnacle Odds']: number | null
  ['Pinnacle IW%']: number | null
  // Best odds (pre-calculated)
  ['Best Odds Book']: string | null
  ['Best Odds']: number | null
  ['Best IW%']: number | null
  fetch_ts_utc: string | null
  market_last_update_utc: string | null
  // Hit rates
  HR_2425: number | null
  N_2425: number | null
  HR_2526: number | null
  N_2526: number | null
  HR_L50: number | null
  N_L50: number | null
  HR_L30: number | null
  N_L30: number | null
  HR_L20: number | null
  N_L20: number | null
  HR_L15: number | null
  N_L15: number | null
  HR_L10: number | null
  N_L10: number | null
  HR_L5: number | null
  N_L5: number | null
  Streak_Current: number | null
  Avg_Stat: number | null
  Max_Stat: number | null
  Min_Stat: number | null
  // New fields from v3
  player_team: string | null
  sweater_number: string | null
  birth_country: string | null
  birth_date: string | null
  shoots_catches: string | null
  primary_position: string | null
  primary_number: string | null
  first_name: string | null
  last_name: string | null
  HomeAbbr: string | null
  AwayAbbr: string | null
  Matchup: string | null
  Start_Time_est: string | null
  Opp: string | null
}

interface GroupedProp {
  unique_id: string
  event_id: string
  commence_time_utc: string | null
  home_team: string | null
  away_team: string | null
  kw_player_name: string | null
  kw_player_id: string | null
  O_U: string | null
  line: number | null
  prop_name: string | null
  is_alternate: number
  bookmaker: string | null
  price_american: number | null
  implied_win_pct: number | null
  espn_headshot: string | null
  // normalize to NFL naming so existing table code can be reused if needed
  hit_2025: number | null // maps from HR_2425
  hit_2024: number | null // maps from HR_2526
  hit_L50: number | null
  hit_L30: number | null
  hit_L10: number | null
  hit_L5: number | null
  gp_2024: number | null // maps from N_2425
  gp_2025: number | null // maps from N_2526
  n_L50: number | null
  n_L30: number | null
  n_L10: number | null
  n_L5: number | null
  streak: number | null
  all_books: { bookmaker: string | null; price_american: number | null; implied_win_pct: number | null; fetch_ts_utc: string | null }[]
  // New optional fields from v3
  matchup?: string | null
  start_time_est?: string | null
  home_abbr?: string | null
  away_abbr?: string | null
  player_team?: string | null
  opp?: string | null
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

const ODDS_CACHE_CONTROL = 'public, max-age=0, s-maxage=600, stale-while-revalidate=300'

async function fetchAllRaw(): Promise<RawNHLRow[]> {
  const query = `
    SELECT
      Prop_UID,
      Event_ID,
      \`Start Date\`,
      \`Start Time\`,
      Home,
      Away,
      Player,
      player_headshot,
      Side,
      Line,
      Prop,
      \`is Alt\`,
      \`BetMGM Odds\`,
      \`BetMGM IW%\`,
      \`BetRivers Odds\`,
      \`BetRivers IW%\`,
      \`DraftKings Odds\`,
      \`DraftKings IW%\`,
      \`Fanatics Odds\`,
      \`Fanatics IW%\`,
      \`FanDuel Odds\`,
      \`FanDuel IW%\`,
      \`Pinnacle Odds\`,
      \`Pinnacle IW%\`,
      \`Best Odds Book\`,
      \`Best Odds\`,
      \`Best IW%\`,
      fetch_ts_utc,
      market_last_update_utc,
      HR_2425,
      N_2425,
      HR_2526,
      N_2526,
      HR_L50,
      N_L50,
      HR_L30,
      N_L30,
      HR_L20,
      N_L20,
      HR_L15,
      N_L15,
      HR_L10,
      N_L10,
      HR_L5,
      N_L5,
      Streak_Current,
      Avg_Stat,
      Max_Stat,
      Min_Stat,
      player_team,
      sweater_number,
      birth_country,
      birth_date,
      shoots_catches,
      primary_position,
      primary_number,
      first_name,
      last_name,
      HomeAbbr,
      AwayAbbr,
      Matchup,
      Start_Time_est,
      Opp
    FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\`
    WHERE Player IS NOT NULL AND Prop IS NOT NULL AND Side IS NOT NULL AND Line IS NOT NULL
  `
  const [rows] = await bigquery.query({ query })
  return rows as RawNHLRow[]
}

function toESTIso(dateStr: string | null | undefined | { value?: string }, timeStr: string | null | undefined | { value?: string }): string | null {
  if (!dateStr || !timeStr) return null
  
  try {
    // Handle BigQuery date/time objects - they might be objects with value property
    let dateValue: string
    let timeValue: string
    
    // If it's an object, try to extract the value
    if (typeof dateStr === 'object' && dateStr !== null && 'value' in dateStr && dateStr.value) {
      dateValue = dateStr.value
    } else {
      dateValue = String(dateStr)
    }
    
    if (typeof timeStr === 'object' && timeStr !== null && 'value' in timeStr && timeStr.value) {
      timeValue = timeStr.value
    } else {
      timeValue = String(timeStr)
    }
    
    // Convert to strings if needed
    const dateStrFinal = String(dateValue)
    const timeStrFinal = String(timeValue)
    
    if (!dateStrFinal || !timeStrFinal || dateStrFinal === 'null' || timeStrFinal === 'null') {
      return null
    }
    
    const utc = new Date(`${dateStrFinal}T${timeStrFinal}Z`)
    // Check if the date is valid
    if (isNaN(utc.getTime())) {
      logger.warn('Invalid date/time', { dateStr: dateStrFinal, timeStr: timeStrFinal })
      return null
    }
    // EST (without DST handling requirement specified). Use America/New_York for display later on client.
    return utc.toISOString()
  } catch (error) {
    logger.warn('Error parsing date/time', error)
    return null
  }
}

// Helper function to extract player ID from headshot URL
function extractPlayerIdFromHeadshot(headshotUrl: string | null): string | null {
  if (!headshotUrl) return null
  const match = headshotUrl.match(/\/(\d+)\.png$/)
  return match ? match[1] : null
}

// Build all_books array from sportsbook columns (only include non-null odds)
function buildAllBooks(row: RawNHLRow): { bookmaker: string | null; price_american: number | null; implied_win_pct: number | null; fetch_ts_utc: string | null }[] {
  const sportsbooks = ['BetMGM', 'BetRivers', 'DraftKings', 'Fanatics', 'FanDuel', 'Pinnacle']
  const all_books: { bookmaker: string | null; price_american: number | null; implied_win_pct: number | null; fetch_ts_utc: string | null }[] = []

  for (const book of sportsbooks) {
    const oddsKey = `${book} Odds` as keyof RawNHLRow
    const iwKey = `${book} IW%` as keyof RawNHLRow
    
    const odds = row[oddsKey] as number | null
    if (odds != null) {
      const implied = row[iwKey] as number | null
      all_books.push({
        bookmaker: book,
        price_american: odds,
        implied_win_pct: implied != null ? implied / 100 : null, // Convert from percentage to decimal
        fetch_ts_utc: row.fetch_ts_utc || null
      })
    }
  }

  return all_books
}

// Transform raw row to GroupedProp format (v3 table is already grouped)
function transformRow(row: RawNHLRow): GroupedProp {
  const unique = `${row.Event_ID || ''}__${row.Player || ''}__${row.Side || ''}__${row.Line ?? ''}__${row.Prop || ''}`
  
  // Use Start_Time_est if available, otherwise fall back to combining Start Date + Start Time
  let commence_time_utc: string | null = null
  if (row.Start_Time_est) {
    // Start_Time_est is already formatted as "6:30 PM" in EST, but we need ISO format
    // For now, use the original date/time combination approach
    commence_time_utc = toESTIso(row['Start Date'] as any, row['Start Time'] as any)
  } else {
    commence_time_utc = toESTIso(row['Start Date'] as any, row['Start Time'] as any)
  }

  // Use Best Odds, Best Odds Book, Best IW% from v3 table
  const bestIW = row['Best IW%'] != null ? row['Best IW%'] / 100 : null

  return {
    unique_id: unique,
    event_id: row.Event_ID || '',
    commence_time_utc: commence_time_utc,
    home_team: row.Home || null,
    away_team: row.Away || null,
    kw_player_name: row.Player || null,
    kw_player_id: extractPlayerIdFromHeadshot(row.player_headshot),
    O_U: row.Side || null,
    line: row.Line ?? null,
    prop_name: row.Prop || null,
    is_alternate: row['is Alt'] ?? 0,
    bookmaker: row['Best Odds Book'] || null,
    price_american: row['Best Odds'] ?? null,
    implied_win_pct: bestIW,
    espn_headshot: row.player_headshot || null,
    hit_2025: row.HR_2425 ?? null,
    hit_2024: row.HR_2526 ?? null,
    hit_L50: row.HR_L50 ?? null,
    hit_L30: row.HR_L30 ?? null,
    hit_L10: row.HR_L10 ?? null,
    hit_L5: row.HR_L5 ?? null,
    gp_2024: row.N_2425 ?? null,
    gp_2025: row.N_2526 ?? null,
    n_L50: row.N_L50 ?? null,
    n_L30: row.N_L30 ?? null,
    n_L10: row.N_L10 ?? null,
    n_L5: row.N_L5 ?? null,
    streak: row.Streak_Current ?? null,
    all_books: buildAllBooks(row),
    // New fields from v3
    matchup: row.Matchup || null,
    start_time_est: row.Start_Time_est || null,
    home_abbr: row.HomeAbbr || null,
    away_abbr: row.AwayAbbr || null,
    player_team: row.player_team || null,
    opp: row.Opp || null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')
    const offset = (page - 1) * limit
    const refresh = searchParams.get('refresh') === 'true'

    let grouped = refresh ? null : await getCached<GroupedProp[]>(CACHE_KEYS.NHL_PLAYER_PROPS)
    
    if (refresh) {
      logger.info('Cache refresh requested - invalidating NHL props cache')
      await invalidateCached(CACHE_KEYS.NHL_PLAYER_PROPS)
    }

    if (!grouped) {
      const rows = await fetchAllRaw()
      // Debug: log first few rows to see data structure (development only)
      if (rows.length > 0 && process.env.NODE_ENV === 'development') {
        logger.debug('Sample NHL v3 data', rows[0])
        // Check if Opp field exists in raw data
        if (rows[0]) {
          logger.debug('Opp field in raw data:', (rows[0] as any).Opp)
          logger.debug('All fields in raw data:', Object.keys(rows[0]))
        }
      }
      // Transform rows directly (v3 table is already grouped)
      grouped = rows.map(transformRow)
      // Debug: Check if Opp field is in transformed data
      if (grouped.length > 0 && process.env.NODE_ENV === 'development') {
        logger.debug('Opp field in transformed data:', grouped[0].opp)
        const propsWithOpp = grouped.filter(p => p.opp)
        logger.debug(`Props with Opp field: ${propsWithOpp.length} out of ${grouped.length}`)
      }
      await setCached(CACHE_KEYS.NHL_PLAYER_PROPS, grouped, CACHE_TTL.NHL_PLAYER_PROPS)
    }

    const paginated = grouped.slice(offset, offset + limit)

    return NextResponse.json(
      {
        data: paginated,
        pagination: {
          page,
          limit,
          total: grouped.length,
          totalPages: Math.ceil(grouped.length / limit),
          hasNext: page < Math.ceil(grouped.length / limit),
          hasPrev: page > 1,
        },
      },
      {
        headers: {
          'Cache-Control': ODDS_CACHE_CONTROL,
        },
      }
    )
  } catch (error) {
    logger.error('Failed to fetch NHL props', error)
    return NextResponse.json({ error: 'Failed to fetch NHL props' }, { status: 500 })
  }
}


