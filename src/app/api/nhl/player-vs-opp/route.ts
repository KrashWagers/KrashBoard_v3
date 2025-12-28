import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

interface PlayerVsOppRow {
  game_id: string | null
  game_date: string | null
  team_abbr: string | null
  opponent_abbr: string | null
  player_id: number | null
  full_name: string | null
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
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

async function fetchPlayerVsOppData(): Promise<PlayerVsOppRow[]> {
  const query = `
    SELECT *
    FROM \`nhl25-473523.marts.Player_vs_Opp\`
    WHERE full_name IS NOT NULL
    ORDER BY full_name, opponent_abbr
  `
  
  logger.debug('[Player vs Opp API] Fetching data from BigQuery')
  const [rows] = await bigquery.query({ query })
  logger.debug(`[Player vs Opp API] Fetched ${rows.length} rows`)
  
  // Log sample data for reference (development only)
  if (rows.length > 0 && process.env.NODE_ENV === 'development') {
    logger.debug('[Player vs Opp API] Sample row', rows[0])
  }
  
  return rows as PlayerVsOppRow[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const offset = (page - 1) * limit

    // Check cache first
    let allData = serverCache.get<PlayerVsOppRow[]>(CACHE_KEYS.NHL_PLAYER_VS_OPP)

    if (!allData) {
      logger.debug('[Player vs Opp API] Cache miss, fetching from BigQuery')
      allData = await fetchPlayerVsOppData()
      serverCache.set(CACHE_KEYS.NHL_PLAYER_VS_OPP, allData, CACHE_TTL.NHL_PLAYER_VS_OPP)
      logger.debug(`[Player vs Opp API] Cached ${allData.length} rows`)
    } else {
      logger.debug(`[Player vs Opp API] Cache hit, returning ${allData.length} rows`)
    }

    const paginated = allData.slice(offset, offset + limit)

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: allData.length,
        totalPages: Math.ceil(allData.length / limit),
        hasNext: page < Math.ceil(allData.length / limit),
        hasPrev: page > 1,
      },
    })
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

