import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
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
  Side: string | null
  Line: number | null
  Prop: string | null
  ['is Alt']: number | null
  Odds: number | null
  ['Implied %']: number | null
  Bookmaker: string | null
  fetch_ts_utc: string | null
  market_last_update_utc: string | null
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
  player_headshot: string | null
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
  hit_L30: number | null
  hit_L10: number | null
  hit_L5: number | null
  gp_2024: number | null // maps from N_2425
  gp_2025: number | null // maps from N_2526
  n_L30: number | null
  n_L10: number | null
  n_L5: number | null
  streak: number | null
  all_books: { bookmaker: string | null; price_american: number | null; implied_win_pct: number | null; fetch_ts_utc: string | null }[]
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

async function fetchAllRaw(): Promise<RawNHLRow[]> {
  const query = `
    SELECT *
    FROM \`nhl25-473523.betting_odds.Player_Props_w_HR\`
    WHERE Player IS NOT NULL AND Prop IS NOT NULL AND Side IS NOT NULL AND Line IS NOT NULL AND Odds IS NOT NULL
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

function groupAndSelectBest(rows: RawNHLRow[]): GroupedProp[] {
  const map = new Map<string, GroupedProp>()

  // Debug: log first few rows to see data structure (development only)
  if (rows.length > 0 && process.env.NODE_ENV === 'development') {
    logger.debug('Sample NHL data', rows[0])
  }

  for (const r of rows) {
    const unique = `${r.Event_ID || ''}__${r.Player || ''}__${r.Side || ''}__${r.Line ?? ''}__${r.Prop || ''}`
    const implied = r['Implied %'] != null ? (r['Implied %'] as number) / 100 : null

    const existing = map.get(unique)

    if (!existing) {
      map.set(unique, {
        unique_id: unique,
        event_id: r.Event_ID || '',
        commence_time_utc: toESTIso(r['Start Date'] as any, r['Start Time'] as any),
        home_team: r.Home || null,
        away_team: r.Away || null,
        kw_player_name: r.Player || null,
        kw_player_id: extractPlayerIdFromHeadshot(r.player_headshot),
        O_U: r.Side || null,
        line: r.Line ?? null,
        prop_name: r.Prop || null,
        is_alternate: r['is Alt'] ?? 0,
        bookmaker: r.Bookmaker || null,
        price_american: r.Odds ?? null,
        implied_win_pct: implied,
        espn_headshot: r.player_headshot || null,
        hit_2025: r.HR_2425 ?? null,
        hit_2024: r.HR_2526 ?? null,
        hit_L30: r.HR_L30 ?? null,
        hit_L10: r.HR_L10 ?? null,
        hit_L5: r.HR_L5 ?? null,
        gp_2024: r.N_2425 ?? null,
        gp_2025: r.N_2526 ?? null,
        n_L30: r.N_L30 ?? null,
        n_L10: r.N_L10 ?? null,
        n_L5: r.N_L5 ?? null,
        streak: r.Streak_Current ?? null,
        all_books: [{ bookmaker: r.Bookmaker || null, price_american: r.Odds ?? null, implied_win_pct: implied, fetch_ts_utc: r.fetch_ts_utc || null }],
      })
      continue
    }

    // Best odds selection: choose highest American odds value
    const current = r.Odds ?? null
    if (current != null && (existing.price_american == null || current > existing.price_american)) {
      existing.price_american = current
      existing.bookmaker = r.Bookmaker || null
      existing.implied_win_pct = implied
    }
    existing.all_books.push({ bookmaker: r.Bookmaker || null, price_american: r.Odds ?? null, implied_win_pct: implied, fetch_ts_utc: r.fetch_ts_utc || null })
  }

  return Array.from(map.values())
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')
    const offset = (page - 1) * limit

    let grouped = serverCache.get<GroupedProp[]>(CACHE_KEYS.NHL_PLAYER_PROPS)

    if (!grouped) {
      const rows = await fetchAllRaw()
      grouped = groupAndSelectBest(rows)
      serverCache.set(CACHE_KEYS.NHL_PLAYER_PROPS, grouped, CACHE_TTL.NHL_PLAYER_PROPS)
    }

    const paginated = grouped.slice(offset, offset + limit)

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: grouped.length,
        totalPages: Math.ceil(grouped.length / limit),
        hasNext: page < Math.ceil(grouped.length / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch NHL props', error)
    return NextResponse.json({ error: 'Failed to fetch NHL props' }, { status: 500 })
  }
}


