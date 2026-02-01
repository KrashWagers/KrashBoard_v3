import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

interface PlayerVsOppGamelog {
  game_id: string | null
  game_date: string | null
  home_abbrev: string | null
  away_abbrev: string | null
  venue: string | null
  goals: number | null
  assists: number | null
  points: number | null
  shots_on_goal: number | null
  corsi: number | null
  pp_goals: number | null
  pp_assists: number | null
  pp_points: number | null
  first_goal_scorer: number | null
  last_goal_scorer: number | null
}

interface PlayerVsOppRow {
  game_id: string | null
  game_date: string | null
  team_abbr: string | null
  opponent_abbr: string | null
  player_id: number | null
  full_name: string | null
  headshot_url: string | null
  position_code: string | null
  position_name: string | null
  jersey_number: string | null
  shoots_catches: string | null
  gp_vs_opp: number | null
  goals_vs_opp: number | null
  assists_vs_opp: number | null
  points_vs_opp: number | null
  shots_on_goal_vs_opp: number | null
  corsi_vs_opp: number | null
  first_goal_scorer_vs_opp: number | null
  last_goal_scorer_vs_opp: number | null
  pp_goals_vs_opp: number | null
  pp_assists_vs_opp: number | null
  pp_points_vs_opp: number | null
  goals_per_game_vs_opp: number | null
  assists_per_game_vs_opp: number | null
  points_per_game_vs_opp: number | null
  shots_on_goal_per_game_vs_opp: number | null
  corsi_per_game_vs_opp: number | null
  pp_goals_per_game_vs_opp: number | null
  pp_assists_per_game_vs_opp: number | null
  pp_points_per_game_vs_opp: number | null
  games_goals_ge1: number | null
  games_goals_ge2: number | null
  games_goals_ge3: number | null
  games_shots_ge1: number | null
  games_shots_ge2: number | null
  games_shots_ge3: number | null
  games_shots_ge4: number | null
  games_shots_ge5: number | null
  games_shots_ge6: number | null
  games_shots_ge7: number | null
  games_assists_ge1: number | null
  games_assists_ge2: number | null
  games_assists_ge3: number | null
  games_points_ge1: number | null
  games_points_ge2: number | null
  games_points_ge3: number | null
  games_points_ge4: number | null
  gamelogs: PlayerVsOppGamelog[]
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

const DAILY_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=3600'

async function fetchPlayerVsOppData(): Promise<PlayerVsOppRow[]> {
  const query = `
    SELECT
      payload_json
    FROM \`nhl25-473523.webapp.player_vs_opp_payload\`
    WHERE payload_json IS NOT NULL
    QUALIFY ROW_NUMBER() OVER (
      PARTITION BY JSON_VALUE(payload_json, '$.player_id')
      ORDER BY JSON_VALUE(payload_json, '$.game_date') DESC, JSON_VALUE(payload_json, '$.game_id') DESC
    ) = 1
    ORDER BY JSON_VALUE(payload_json, '$.full_name'), JSON_VALUE(payload_json, '$.opponent_abbr')
  `
  
  logger.debug('[Player vs Opp API] Fetching data from BigQuery')
  const [rows] = await bigquery.query({ query })
  logger.debug(`[Player vs Opp API] Fetched ${rows.length} rows`)
  
  // Log sample data for reference (development only)
  if (rows.length > 0 && process.env.NODE_ENV === 'development') {
    logger.debug('[Player vs Opp API] Sample row', rows[0])
  }
  
  const asNumber = (value: unknown): number | null => {
    if (value === null || value === undefined || value === '') return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }

  const asString = (value: unknown): string | null => {
    if (value === null || value === undefined || value === '') return null
    return String(value)
  }

  const pickNumber = (...values: unknown[]): number | null => {
    for (const value of values) {
      const parsed = asNumber(value)
      if (parsed !== null) return parsed
    }
    return null
  }

  const pickString = (...values: unknown[]): string | null => {
    for (const value of values) {
      const parsed = asString(value)
      if (parsed !== null) return parsed
    }
    return null
  }

  const parsed = rows.flatMap((row) => {
    const payloadString = row?.payload_json
    if (!payloadString || typeof payloadString !== 'string') return []
    try {
      const payload = JSON.parse(payloadString)
      const summary = payload?.summary || {}
      const totals = summary?.totals || {}
      const perGame = summary?.per_game || summary?.per_game_fields || {}
      const threshold = summary?.threshold || summary?.thresholds || {}

      const rawGamelogs = Array.isArray(payload?.gamelogs_vs_opp)
        ? payload.gamelogs_vs_opp
        : Array.isArray(payload?.gamelogs)
          ? payload.gamelogs
          : []

      const gamelogs: PlayerVsOppGamelog[] = rawGamelogs
        .map((log: any) => ({
          game_id: pickString(log?.game_id),
          game_date: pickString(log?.game_date),
          home_abbrev: pickString(log?.home_abbrev, log?.home_abbr),
          away_abbrev: pickString(log?.away_abbrev, log?.away_abbr),
          venue: pickString(log?.venue),
          goals: pickNumber(log?.goals),
          assists: pickNumber(log?.assists),
          points: pickNumber(log?.points),
          shots_on_goal: pickNumber(log?.shots_on_goal, log?.sog),
          corsi: pickNumber(log?.corsi),
          pp_goals: pickNumber(log?.pp_goals),
          pp_assists: pickNumber(log?.pp_assists),
          pp_points: pickNumber(log?.pp_points),
          first_goal_scorer: pickNumber(log?.first_goal_scorer),
          last_goal_scorer: pickNumber(log?.last_goal_scorer),
        }))
        .sort((a, b) => {
          const dateCompare = (b.game_date || '').localeCompare(a.game_date || '')
          if (dateCompare !== 0) return dateCompare
          return (b.game_id || '').localeCompare(a.game_id || '')
        })

      const mapped: PlayerVsOppRow = {
        game_id: pickString(payload?.game_id),
        game_date: pickString(payload?.game_date),
        team_abbr: pickString(payload?.team_abbr),
        opponent_abbr: pickString(payload?.opponent_abbr),
        player_id: pickNumber(payload?.player_id),
        full_name: pickString(payload?.full_name),
        headshot_url: pickString(payload?.headshot_url),
        position_code: pickString(payload?.position_code),
        position_name: pickString(payload?.position_name),
        jersey_number: pickString(payload?.jersey_number),
        shoots_catches: pickString(payload?.shoots_catches),
        gp_vs_opp: pickNumber(summary?.gp_vs_opp, payload?.gp_vs_opp),
        goals_vs_opp: pickNumber(
          totals?.goals_vs_opp,
          totals?.goals,
          summary?.goals_vs_opp,
          summary?.goals,
          payload?.goals_vs_opp,
          payload?.goals
        ),
        assists_vs_opp: pickNumber(
          totals?.assists_vs_opp,
          totals?.assists,
          summary?.assists_vs_opp,
          summary?.assists,
          payload?.assists_vs_opp,
          payload?.assists
        ),
        points_vs_opp: pickNumber(
          totals?.points_vs_opp,
          totals?.points,
          summary?.points_vs_opp,
          summary?.points,
          payload?.points_vs_opp,
          payload?.points
        ),
        shots_on_goal_vs_opp: pickNumber(
          totals?.shots_on_goal_vs_opp,
          totals?.shots_on_goal,
          summary?.shots_on_goal_vs_opp,
          summary?.shots_on_goal,
          payload?.shots_on_goal_vs_opp,
          payload?.shots_on_goal
        ),
        corsi_vs_opp: pickNumber(
          totals?.corsi_vs_opp,
          totals?.corsi,
          summary?.corsi_vs_opp,
          summary?.corsi,
          payload?.corsi_vs_opp,
          payload?.corsi
        ),
        first_goal_scorer_vs_opp: pickNumber(
          totals?.first_goal_scorer_vs_opp,
          totals?.first_goal_scorer,
          summary?.first_goal_scorer_vs_opp,
          summary?.first_goal_scorer,
          payload?.first_goal_scorer_vs_opp,
          payload?.first_goal_scorer
        ),
        last_goal_scorer_vs_opp: pickNumber(
          totals?.last_goal_scorer_vs_opp,
          totals?.last_goal_scorer,
          summary?.last_goal_scorer_vs_opp,
          summary?.last_goal_scorer,
          payload?.last_goal_scorer_vs_opp,
          payload?.last_goal_scorer
        ),
        pp_goals_vs_opp: pickNumber(
          totals?.pp_goals_vs_opp,
          totals?.pp_goals,
          summary?.pp_goals_vs_opp,
          summary?.pp_goals,
          payload?.pp_goals_vs_opp,
          payload?.pp_goals
        ),
        pp_assists_vs_opp: pickNumber(
          totals?.pp_assists_vs_opp,
          totals?.pp_assists,
          summary?.pp_assists_vs_opp,
          summary?.pp_assists,
          payload?.pp_assists_vs_opp,
          payload?.pp_assists
        ),
        pp_points_vs_opp: pickNumber(
          totals?.pp_points_vs_opp,
          totals?.pp_points,
          summary?.pp_points_vs_opp,
          summary?.pp_points,
          payload?.pp_points_vs_opp,
          payload?.pp_points
        ),
        goals_per_game_vs_opp: pickNumber(
          perGame?.goals_per_game_vs_opp,
          perGame?.goals_per_game,
          summary?.goals_per_game_vs_opp,
          summary?.goals_per_game,
          payload?.goals_per_game_vs_opp
        ),
        assists_per_game_vs_opp: pickNumber(
          perGame?.assists_per_game_vs_opp,
          perGame?.assists_per_game,
          summary?.assists_per_game_vs_opp,
          summary?.assists_per_game,
          payload?.assists_per_game_vs_opp
        ),
        points_per_game_vs_opp: pickNumber(
          perGame?.points_per_game_vs_opp,
          perGame?.points_per_game,
          summary?.points_per_game_vs_opp,
          summary?.points_per_game,
          payload?.points_per_game_vs_opp
        ),
        shots_on_goal_per_game_vs_opp: pickNumber(
          perGame?.shots_on_goal_per_game_vs_opp,
          perGame?.shots_on_goal_per_game,
          summary?.shots_on_goal_per_game_vs_opp,
          summary?.shots_on_goal_per_game,
          payload?.shots_on_goal_per_game_vs_opp
        ),
        corsi_per_game_vs_opp: pickNumber(
          perGame?.corsi_per_game_vs_opp,
          perGame?.corsi_per_game,
          summary?.corsi_per_game_vs_opp,
          summary?.corsi_per_game,
          payload?.corsi_per_game_vs_opp
        ),
        pp_goals_per_game_vs_opp: pickNumber(
          perGame?.pp_goals_per_game_vs_opp,
          perGame?.pp_goals_per_game,
          summary?.pp_goals_per_game_vs_opp,
          summary?.pp_goals_per_game,
          payload?.pp_goals_per_game_vs_opp
        ),
        pp_assists_per_game_vs_opp: pickNumber(
          perGame?.pp_assists_per_game_vs_opp,
          perGame?.pp_assists_per_game,
          summary?.pp_assists_per_game_vs_opp,
          summary?.pp_assists_per_game,
          payload?.pp_assists_per_game_vs_opp
        ),
        pp_points_per_game_vs_opp: pickNumber(
          perGame?.pp_points_per_game_vs_opp,
          perGame?.pp_points_per_game,
          summary?.pp_points_per_game_vs_opp,
          summary?.pp_points_per_game,
          payload?.pp_points_per_game_vs_opp
        ),
        games_goals_ge1: pickNumber(
          threshold?.games_goals_ge1,
          summary?.games_goals_ge1,
          payload?.games_goals_ge1
        ),
        games_goals_ge2: pickNumber(
          threshold?.games_goals_ge2,
          summary?.games_goals_ge2,
          payload?.games_goals_ge2
        ),
        games_goals_ge3: pickNumber(
          threshold?.games_goals_ge3,
          summary?.games_goals_ge3,
          payload?.games_goals_ge3
        ),
        games_shots_ge1: pickNumber(
          threshold?.games_shots_ge1,
          summary?.games_shots_ge1,
          payload?.games_shots_ge1
        ),
        games_shots_ge2: pickNumber(
          threshold?.games_shots_ge2,
          summary?.games_shots_ge2,
          payload?.games_shots_ge2
        ),
        games_shots_ge3: pickNumber(
          threshold?.games_shots_ge3,
          summary?.games_shots_ge3,
          payload?.games_shots_ge3
        ),
        games_shots_ge4: pickNumber(
          threshold?.games_shots_ge4,
          summary?.games_shots_ge4,
          payload?.games_shots_ge4
        ),
        games_shots_ge5: pickNumber(
          threshold?.games_shots_ge5,
          summary?.games_shots_ge5,
          payload?.games_shots_ge5
        ),
        games_shots_ge6: pickNumber(
          threshold?.games_shots_ge6,
          summary?.games_shots_ge6,
          payload?.games_shots_ge6
        ),
        games_shots_ge7: pickNumber(
          threshold?.games_shots_ge7,
          summary?.games_shots_ge7,
          payload?.games_shots_ge7
        ),
        games_assists_ge1: pickNumber(
          threshold?.games_assists_ge1,
          summary?.games_assists_ge1,
          payload?.games_assists_ge1
        ),
        games_assists_ge2: pickNumber(
          threshold?.games_assists_ge2,
          summary?.games_assists_ge2,
          payload?.games_assists_ge2
        ),
        games_assists_ge3: pickNumber(
          threshold?.games_assists_ge3,
          summary?.games_assists_ge3,
          payload?.games_assists_ge3
        ),
        games_points_ge1: pickNumber(
          threshold?.games_points_ge1,
          summary?.games_points_ge1,
          payload?.games_points_ge1
        ),
        games_points_ge2: pickNumber(
          threshold?.games_points_ge2,
          summary?.games_points_ge2,
          payload?.games_points_ge2
        ),
        games_points_ge3: pickNumber(
          threshold?.games_points_ge3,
          summary?.games_points_ge3,
          payload?.games_points_ge3
        ),
        games_points_ge4: pickNumber(
          threshold?.games_points_ge4,
          summary?.games_points_ge4,
          payload?.games_points_ge4
        ),
        gamelogs,
      }

      return [mapped]
    } catch (error) {
      logger.warn('[Player vs Opp API] Failed to parse payload_json', error)
      return []
    }
  })

  return parsed
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const offset = (page - 1) * limit
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check cache first (unless force refresh)
    let allData = forceRefresh ? null : serverCache.get<PlayerVsOppRow[]>(CACHE_KEYS.NHL_PLAYER_VS_OPP)

    if (!allData) {
      logger.debug('[Player vs Opp API] Cache miss, fetching from BigQuery')
      allData = await fetchPlayerVsOppData()
      serverCache.set(CACHE_KEYS.NHL_PLAYER_VS_OPP, allData, CACHE_TTL.NHL_PLAYER_VS_OPP)
      logger.debug(`[Player vs Opp API] Cached ${allData.length} rows`)
    } else {
      logger.debug(`[Player vs Opp API] Cache hit, returning ${allData.length} rows`)
    }

    const paginated = allData.slice(offset, offset + limit)

    return NextResponse.json(
      {
        data: paginated,
        pagination: {
          page,
          limit,
          total: allData.length,
          totalPages: Math.ceil(allData.length / limit),
          hasNext: page < Math.ceil(allData.length / limit),
          hasPrev: page > 1,
        },
      },
      {
        headers: {
          'Cache-Control': DAILY_CACHE_CONTROL,
        },
      }
    )
  } catch (error) {
    logger.error('[Player vs Opp API] Failed to fetch data', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch Player vs Opp data',
        success: false
      },
      { status: 500 }
    )
  }
}

