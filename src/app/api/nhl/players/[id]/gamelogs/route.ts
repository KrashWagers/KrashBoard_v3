import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

const nhlBigQuery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

const PLAYER_GAMELOGS_TTL = 24 * 60 // 24 hours in minutes
const DAILY_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=3600'

async function fetchPlayerGamelogsFromBigQuery(playerId: string) {
  logger.debug(`Fetching NHL gamelogs for player ${playerId} from BigQuery`)
  
  // Use the comprehensive view with explicit columns
  const query = `
    SELECT
      player_id,
      player_name,
      \`Headshot URL\`,
      player_team_abbrev,
      game_id,
      game_date,
      season_id,
      away_abbrev,
      home_abbrev,
      venue,
      days_rest,
      game_time_bucket,
      day_of_week,
      goals,
      assists,
      points,
      shots_on_goal,
      corsi,
      shots_missed,
      shots_blocked_by_defense,
      shifts,
      team_goals,
      team_assists,
      team_points,
      pp_goals,
      \`5v5_goals\`,
      pp_assists,
      pp_points,
      \`5v5_points\`,
      pp_shots_on_goal,
      \`5v5_shots_on_goal\`,
      sog_HD,
      sat_HD,
      sat_MD,
      sat_LD,
      goals_HD,
      goals_MD,
      goals_LD,
      toi_seconds,
      ev_5v5_mmss,
      pp_mmss,
      pk_mmss,
      ev_4v4_mmss,
      ev_3v3_mmss
    FROM \`nhl25-473523.gold.player_gamelogs_all_vw\`
    WHERE player_id = CAST(@playerId AS INT64)
    ORDER BY game_date DESC
  `
  
  const options = {
    query,
    params: { playerId: parseInt(playerId) }
  }
  
  const [rows] = await nhlBigQuery.query(options)
  logger.debug(`Fetched ${rows.length} NHL gamelog entries for player ${playerId}`)
  return rows
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '0', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const { id: playerId } = await params
    const cacheKey = `nhl_player_gamelogs_${playerId}`
    
    // Check cache first
    let gamelogs = serverCache.get(cacheKey)
    
    if (!gamelogs) {
      // Fetch from BigQuery if not in cache
      gamelogs = await fetchPlayerGamelogsFromBigQuery(playerId)
      serverCache.set(cacheKey, gamelogs, PLAYER_GAMELOGS_TTL)
    }

    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : gamelogs.length
    const safeOffset = Number.isFinite(offset) && offset > 0 ? offset : 0
    const paginated = gamelogs.slice(safeOffset, safeOffset + safeLimit)

    return NextResponse.json(
      {
        data: paginated,
        playerId,
        pagination: {
          limit: safeLimit,
          offset: safeOffset,
          total: gamelogs.length,
        },
        cache: {
          status: serverCache.has(cacheKey) ? 'hit' : 'miss',
          timestamp: Date.now(),
          ttl: PLAYER_GAMELOGS_TTL,
        },
      },
      {
        headers: {
          'Cache-Control': DAILY_CACHE_CONTROL,
        },
      }
    )
  } catch (error) {
    logger.error('Failed to fetch NHL player gamelogs', error)
    return NextResponse.json(
      { error: 'Failed to fetch NHL player gamelogs data' },
      { status: 500 }
    )
  }
}