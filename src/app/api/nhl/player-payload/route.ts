import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { getBigQueryConfig } from '@/lib/bigquery'
import { CACHE_KEYS, CACHE_TTL, getCached, setCached } from '@/lib/cache'
import { logger } from '@/lib/logger'

const nhlBigQuery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

const DAILY_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=3600'

type PayloadRow = {
  player_id: number | string
  data_version: string
  payload_json: unknown
}

type NormalizedPayload = {
  player_id: number
  player_name: string
  bio: {
    first_name: string
    last_name: string
    position: string
    hand: string
    headshot_url: string
    sweater_number: string
    birth_date: string
    birth_country: string
    shoots_catches: string
  }
  upcoming: {
    player_team: string
    opponent: string
    venue: 'Home' | 'Away' | null
    matchup: string
    game_date: string
    game_time_local: string
    days_rest: number | null
  }
  gamelogs: unknown[]
  props: Array<{
    prop_uid: string
    event_id: string
    prop: string
    side: 'Over' | 'Under' | string
    line: number
    is_alt: number
    books: Record<string, { odds: number; iw: number }>
    best: { odds: number; iw: number; book: string }
    hit_rates: Record<string, { hr: number; n: number } | undefined>
    distribution: { avg: number; min: number; max: number; streak_current: number }
    market: { last_update_utc: string; fetch_ts_utc: string }
  }>
}

const buildBooksFromFlat = (prop: Record<string, unknown>) => {
  const bookFields = [
    { key: 'fanduel', odds: 'fanduel_odds', iw: 'fanduel_iw' },
    { key: 'draftkings', odds: 'dk_odds', iw: 'dk_iw' },
    { key: 'pinnacle', odds: 'pinnacle_odds', iw: 'pinnacle_iw' },
    { key: 'betmgm', odds: 'betmgm_odds', iw: 'betmgm_iw' },
    { key: 'betrivers', odds: 'betrivers_odds', iw: 'betrivers_iw' },
    { key: 'caesars', odds: 'caesars_odds', iw: 'caesars_iw' },
    { key: 'fanatics', odds: 'fanatics_odds', iw: 'fanatics_iw' },
  ]

  return bookFields.reduce<Record<string, { odds: number; iw: number }>>((acc, book) => {
    const odds = prop[book.odds]
    if (odds == null) return acc
    acc[book.key] = {
      odds: Number(odds),
      iw: prop[book.iw] != null ? Number(prop[book.iw]) : 0,
    }
    return acc
  }, {})
}

const normalizeProps = (rawProps: unknown[]) => {
  return rawProps.map((prop) => {
    const raw = prop as Record<string, unknown>
    const books = raw.books && typeof raw.books === 'object' ? (raw.books as Record<string, { odds: number; iw: number }>) : buildBooksFromFlat(raw)
    const bestFromRaw = raw.best && typeof raw.best === 'object' ? (raw.best as { odds: number; iw: number; book: string }) : null

    return {
      prop_uid: String(raw.prop_uid ?? raw.Prop_UID ?? raw.unique_id ?? ''),
      event_id: String(raw.event_id ?? raw.Event_ID ?? ''),
      prop: String(raw.prop ?? raw.Prop ?? raw.prop_name ?? ''),
      side: String(raw.side ?? raw.Side ?? raw.O_U ?? ''),
      line: Number(raw.line ?? raw.Line ?? 0),
      is_alt: Number(raw.is_alt ?? raw.is_alternate ?? 0),
      books,
      best: bestFromRaw ?? {
        odds: Number(raw.best_odds ?? raw.best_odds_american ?? 0),
        iw: Number(raw.best_iw ?? raw.best_implied_win ?? 0),
        book: String(raw.best_book ?? raw.best_bookmaker ?? 'Best'),
      },
      hit_rates: raw.hit_rates && typeof raw.hit_rates === 'object'
        ? (raw.hit_rates as Record<string, { hr: number; n: number } | undefined>)
        : {
            season_2425: raw.HR_2425 != null && raw.N_2425 != null ? { hr: Number(raw.HR_2425), n: Number(raw.N_2425) } : undefined,
            season_2526: raw.HR_2526 != null && raw.N_2526 != null ? { hr: Number(raw.HR_2526), n: Number(raw.N_2526) } : undefined,
            L50: raw.HR_L50 != null && raw.N_L50 != null ? { hr: Number(raw.HR_L50), n: Number(raw.N_L50) } : undefined,
            L30: raw.HR_L30 != null && raw.N_L30 != null ? { hr: Number(raw.HR_L30), n: Number(raw.N_L30) } : undefined,
            L20: raw.HR_L20 != null && raw.N_L20 != null ? { hr: Number(raw.HR_L20), n: Number(raw.N_L20) } : undefined,
            L10: raw.HR_L10 != null && raw.N_L10 != null ? { hr: Number(raw.HR_L10), n: Number(raw.N_L10) } : undefined,
            L5: raw.HR_L5 != null && raw.N_L5 != null ? { hr: Number(raw.HR_L5), n: Number(raw.N_L5) } : undefined,
          },
      distribution: raw.distribution && typeof raw.distribution === 'object'
        ? (raw.distribution as { avg: number; min: number; max: number; streak_current: number })
        : {
            avg: Number(raw.Avg_Stat ?? raw.avg_stat ?? 0),
            min: Number(raw.Min_Stat ?? raw.min_stat ?? 0),
            max: Number(raw.Max_Stat ?? raw.max_stat ?? 0),
            streak_current: Number(raw.Streak_Current ?? raw.streak ?? 0),
          },
      market: raw.market && typeof raw.market === 'object'
        ? (raw.market as { last_update_utc: string; fetch_ts_utc: string })
        : {
            last_update_utc: String(raw.market_last_update_utc ?? ''),
            fetch_ts_utc: String(raw.fetch_ts_utc ?? ''),
          },
    }
  })
}

const normalizePayload = (rawPayload: unknown): NormalizedPayload => {
  const raw = (rawPayload ?? {}) as Record<string, unknown>
  const rawProps = Array.isArray(raw.props) ? raw.props : []

  const bio = (raw.bio as NormalizedPayload['bio'] | undefined) ?? {
    first_name: String(raw.first_name ?? ''),
    last_name: String(raw.last_name ?? ''),
    position: String(raw.position ?? raw.primary_position ?? ''),
    hand: String(raw.hand ?? ''),
    headshot_url: String(raw.headshot_url ?? (rawProps[0] as any)?.player_headshot ?? ''),
    sweater_number: String(raw.sweater_number ?? raw.sweater_num ?? ''),
    birth_date: String(raw.birth_date ?? ''),
    birth_country: String(raw.birth_country ?? ''),
    shoots_catches: String(raw.shoots_catches ?? ''),
  }

  const upcoming = (raw.upcoming as NormalizedPayload['upcoming'] | undefined) ?? {
    player_team: String(raw.player_team ?? raw.player_team_abbrev ?? ''),
    opponent: String(raw.opponent ?? raw.next_opponent ?? raw.opp ?? ''),
    venue: (raw.venue ?? raw.next_venue ?? null) as NormalizedPayload['upcoming']['venue'],
    matchup: String(raw.matchup ?? ''),
    game_date: String(raw.game_date ?? ''),
    game_time_local: String(raw.game_time_local ?? ''),
    days_rest: raw.days_rest != null ? Number(raw.days_rest) : null,
  }

  return {
    player_id: Number(raw.player_id ?? 0),
    player_name: String(raw.player_name ?? ''),
    bio,
    upcoming,
    gamelogs: Array.isArray(raw.gamelogs) ? raw.gamelogs : [],
    props: normalizeProps(rawProps),
  }
}

function resolvePayloadJson(payloadJson: unknown) {
  if (!payloadJson) return null
  if (typeof payloadJson === 'string') {
    try {
      return JSON.parse(payloadJson)
    } catch (error) {
      logger.warn('Failed to parse payload JSON string', error)
      return null
    }
  }
  if (typeof payloadJson === 'object' && payloadJson !== null && 'value' in payloadJson) {
    const value = (payloadJson as { value?: unknown }).value
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch (error) {
        logger.warn('Failed to parse payload JSON value', error)
        return null
      }
    }
    return value ?? null
  }
  return payloadJson
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playerIdParam = searchParams.get('player_id')
    const dvParam = searchParams.get('dv')
    const refreshParam = searchParams.get('refresh')
    const forceRefresh = refreshParam === '1' || refreshParam === 'true'

    if (!playerIdParam) {
      return NextResponse.json(
        { error: 'player_id is required' },
        { status: 400 }
      )
    }

    const playerId = parseInt(playerIdParam, 10)
    if (Number.isNaN(playerId)) {
      return NextResponse.json(
        { error: 'player_id must be a number' },
        { status: 400 }
      )
    }

    const dataVersion = dvParam || new Date().toISOString().slice(0, 10)
    const schemaVersion = 'v2'
    const cacheKey = `${CACHE_KEYS.NHL_PLAYER_PAYLOAD}_${schemaVersion}_${playerId}_${dataVersion}`

    const cached = forceRefresh ? null : await getCached<{ player_id: number | string; data_version: string; payload: unknown }>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': DAILY_CACHE_CONTROL,
          'X-Cache': 'HIT',
        },
      })
    }

    const query = `
      SELECT player_id, data_version, payload_json
      FROM \`nhl25-473523.webapp.player_payload\`
      WHERE player_id = @player_id
      ORDER BY CASE WHEN data_version = DATE(@dv) THEN 0 ELSE 1 END, data_version DESC
      LIMIT 1
    `

    const [rows] = await nhlBigQuery.query({
      query,
      params: {
        player_id: playerId,
        dv: dataVersion,
      },
    })

    const row = rows[0] as PayloadRow | undefined
    if (!row) {
      return NextResponse.json(
        { error: 'Payload not found', player_id: playerId, data_version: dataVersion },
        { status: 404 }
      )
    }

    const payload = resolvePayloadJson(row.payload_json)
    if (!payload) {
      return NextResponse.json(
        { error: 'Payload is empty or invalid', player_id: playerId, data_version: row.data_version },
        { status: 500 }
      )
    }

    const normalizedPayload = normalizePayload(payload)
    const responseBody = {
      player_id: row.player_id,
      data_version: row.data_version,
      payload: normalizedPayload,
    }

    await setCached(cacheKey, responseBody, CACHE_TTL.NHL_PLAYER_PAYLOAD)

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': DAILY_CACHE_CONTROL,
        'X-Cache': forceRefresh ? 'BYPASS' : 'MISS',
      },
    })
  } catch (error) {
    logger.error('Failed to fetch NHL player payload', error)
    return NextResponse.json(
      { error: 'Failed to fetch player payload' },
      { status: 500 }
    )
  }
}
