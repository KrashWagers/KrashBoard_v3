import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

interface TeamGamelogRow {
  season_id: string | null
  game_id: string | null
  game_date: string | null
  team: string | null
  opponent: string | null
  venue: string | null
  GF: number | null
  GA: number | null
  SOGF: number | null
  SOGA: number | null
  PP_Att: number | null
  PK_Att: number | null
  PP_Pct: number | null
  PK_Pct: number | null
  PPG: number | null
  PKGA: number | null
  PIMF: number | null
  PIMA: number | null
  HitsF: number | null
  HitsA: number | null
  BlocksF: number | null
  BlocksA: number | null
  GiveawaysF: number | null
  GiveawaysA: number | null
  TakeawaysF: number | null
  TakeawaysA: number | null
  FO_PctF: number | null
  FO_PctA: number | null
  OT_Occurred: number | null
  SO_Occurred: number | null
  start_time_utc: string | null
  fetched_ts_utc: string | null
  shots_missed_for: number | null
  shots_blocked_for: number | null
  corsi_for: number | null
  fenwick_for: number | null
  ev5v5_shots_on_goal_for: number | null
  ev5v5_shots_missed_for: number | null
  ev5v5_shots_blocked_for: number | null
  ev5v5_corsi_for: number | null
  ev5v5_fenwick_for: number | null
  ev5v5_blocks_for: number | null
  ev5v5_goals_for: number | null
  ev5v5_assists_for: number | null
  ev5v5_assists1_for: number | null
  ev5v5_assists2_for: number | null
  ev5v5_points_for: number | null
  ev5v5_faceoffs_won_for: number | null
  ev5v5_faceoffs_lost_for: number | null
  ev5v5_hits_for: number | null
  ev5v5_hits_against_for: number | null
  ev5v5_giveaways_for: number | null
  ev5v5_takeaways_for: number | null
  ev5v5_penalties_committed_for: number | null
  ev5v5_penalties_drawn_for: number | null
  p1_shots_for: number | null
  p2_shots_for: number | null
  p3_shots_for: number | null
  ot_shots_for: number | null
  p1_corsi_for: number | null
  p2_corsi_for: number | null
  p3_corsi_for: number | null
  ot_corsi_for: number | null
  p1_goals_for: number | null
  p2_goals_for: number | null
  p3_goals_for: number | null
  ot_goals_for: number | null
  p1_assists_for: number | null
  p2_assists_for: number | null
  p3_assists_for: number | null
  ot_assists_for: number | null
  p1_points_for: number | null
  p2_points_for: number | null
  p3_points_for: number | null
  ot_points_for: number | null
  goals_hd_for: number | null
  goals_md_for: number | null
  goals_ld_for: number | null
  sog_hd_for: number | null
  sog_md_for: number | null
  sog_ld_for: number | null
  shots_missed_hd_for: number | null
  shots_missed_md_for: number | null
  shots_missed_ld_for: number | null
  shots_blocked_hd_for: number | null
  shots_blocked_md_for: number | null
  shots_blocked_ld_for: number | null
  sat_hd_for: number | null
  sat_md_for: number | null
  sat_ld_for: number | null
  sog_l_for: number | null
  sog_r_for: number | null
  sog_c_for: number | null
  sog_d_for: number | null
  goals_l_for: number | null
  goals_r_for: number | null
  goals_c_for: number | null
  goals_d_for: number | null
  points_l_for: number | null
  points_r_for: number | null
  points_c_for: number | null
  points_d_for: number | null
  sog_l_against: number | null
  sog_r_against: number | null
  sog_c_against: number | null
  sog_d_against: number | null
  goals_l_against: number | null
  goals_r_against: number | null
  goals_c_against: number | null
  goals_d_against: number | null
  points_l_against: number | null
  points_r_against: number | null
  points_c_against: number | null
  points_d_against: number | null
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

const DAILY_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=3600'

async function fetchTeamGamelogsFromBigQuery(): Promise<TeamGamelogRow[]> {
  const query = `
    SELECT
      season_id,
      game_id,
      game_date,
      team,
      opponent,
      venue,
      GF,
      GA,
      SOGF,
      SOGA,
      PP_Att,
      PK_Att,
      PP_Pct,
      PK_Pct,
      PPG,
      PKGA,
      PIMF,
      PIMA,
      HitsF,
      HitsA,
      BlocksF,
      BlocksA,
      GiveawaysF,
      GiveawaysA,
      TakeawaysF,
      TakeawaysA,
      FO_PctF,
      FO_PctA,
      OT_Occurred,
      SO_Occurred,
      start_time_utc,
      fetched_ts_utc,
      shots_missed_for,
      shots_blocked_for,
      corsi_for,
      fenwick_for,
      ev5v5_shots_on_goal_for,
      ev5v5_shots_missed_for,
      ev5v5_shots_blocked_for,
      ev5v5_corsi_for,
      ev5v5_fenwick_for,
      ev5v5_blocks_for,
      ev5v5_goals_for,
      ev5v5_assists_for,
      ev5v5_assists1_for,
      ev5v5_assists2_for,
      ev5v5_points_for,
      ev5v5_faceoffs_won_for,
      ev5v5_faceoffs_lost_for,
      ev5v5_hits_for,
      ev5v5_hits_against_for,
      ev5v5_giveaways_for,
      ev5v5_takeaways_for,
      ev5v5_penalties_committed_for,
      ev5v5_penalties_drawn_for,
      p1_shots_for,
      p2_shots_for,
      p3_shots_for,
      ot_shots_for,
      p1_corsi_for,
      p2_corsi_for,
      p3_corsi_for,
      ot_corsi_for,
      p1_goals_for,
      p2_goals_for,
      p3_goals_for,
      ot_goals_for,
      p1_assists_for,
      p2_assists_for,
      p3_assists_for,
      ot_assists_for,
      p1_points_for,
      p2_points_for,
      p3_points_for,
      ot_points_for,
      goals_hd_for,
      goals_md_for,
      goals_ld_for,
      sog_hd_for,
      sog_md_for,
      sog_ld_for,
      shots_missed_hd_for,
      shots_missed_md_for,
      shots_missed_ld_for,
      shots_blocked_hd_for,
      shots_blocked_md_for,
      shots_blocked_ld_for,
      sat_hd_for,
      sat_md_for,
      sat_ld_for,
      sog_l_for,
      sog_r_for,
      sog_c_for,
      sog_d_for,
      goals_l_for,
      goals_r_for,
      goals_c_for,
      goals_d_for,
      points_l_for,
      points_r_for,
      points_c_for,
      points_d_for,
      sog_l_against,
      sog_r_against,
      sog_c_against,
      sog_d_against,
      goals_l_against,
      goals_r_against,
      goals_c_against,
      goals_d_against,
      points_l_against,
      points_r_against,
      points_c_against,
      points_d_against
    FROM \`nhl25-473523.gold.team_gamelogs_all\`
    ORDER BY game_date DESC, team
  `
  
  logger.debug('[Team Gamelogs API] Fetching data from BigQuery')
    const [rows] = await bigquery.query({ query })
    logger.debug(`[Team Gamelogs API] Fetched ${rows.length} rows`)
    
    // Convert BigQuery DATE objects to strings
    interface RawRow {
      game_date?: { value?: string } | string | null
      [key: string]: unknown
    }
    
    const formattedRows = rows.map((row: RawRow) => ({
      ...row,
      game_date: typeof row.game_date === 'object' && row.game_date !== null && 'value' in row.game_date
        ? row.game_date.value || null
        : row.game_date
    })) as TeamGamelogRow[]
    
    return formattedRows
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const offset = (page - 1) * limit
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    // Filter parameters
    const teams = searchParams.get('teams')?.split(',').filter(Boolean) || []
    const opponents = searchParams.get('opponents')?.split(',').filter(Boolean) || []
    const seasonId = searchParams.get('season_id')
    const venue = searchParams.get('venue') // 'Home', 'Away', or null for all
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Check cache first (unless force refresh)
    let allData = forceRefresh ? null : serverCache.get<TeamGamelogRow[]>(CACHE_KEYS.NHL_TEAM_GAMELOGS)

    if (!allData) {
      logger.debug('[Team Gamelogs API] Cache miss, fetching from BigQuery')
      allData = await fetchTeamGamelogsFromBigQuery()
      serverCache.set(CACHE_KEYS.NHL_TEAM_GAMELOGS, allData, CACHE_TTL.NHL_TEAM_GAMELOGS)
      logger.debug(`[Team Gamelogs API] Cached ${allData.length} rows`)
    } else {
      logger.debug(`[Team Gamelogs API] Cache hit, returning ${allData.length} rows`)
    }

    // Apply filters
    let filtered = allData

    if (teams.length > 0) {
      filtered = filtered.filter(row => row.team && teams.includes(row.team))
    }

    if (opponents.length > 0) {
      filtered = filtered.filter(row => row.opponent && opponents.includes(row.opponent))
    }

    if (seasonId) {
      filtered = filtered.filter(row => row.season_id === seasonId)
    }

    if (venue) {
      if (venue === 'Home') {
        filtered = filtered.filter(row => row.venue === 'Home')
      } else if (venue === 'Away') {
        filtered = filtered.filter(row => row.venue === 'Away')
      }
    }

    if (startDate) {
      filtered = filtered.filter(row => row.game_date && row.game_date >= startDate)
    }

    if (endDate) {
      filtered = filtered.filter(row => row.game_date && row.game_date <= endDate)
    }

    // Paginate
    const paginated = filtered.slice(offset, offset + limit)
    const total = filtered.length

    return NextResponse.json(
      {
        data: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        cacheInfo: {
          cached: true,
          cacheTimestamp: serverCache.getInfo(CACHE_KEYS.NHL_TEAM_GAMELOGS)?.timestamp,
          cacheExpiresAt: serverCache.getInfo(CACHE_KEYS.NHL_TEAM_GAMELOGS)?.expiresAt,
        },
      },
      {
        headers: {
          'Cache-Control': DAILY_CACHE_CONTROL,
        },
      }
    )
  } catch (error) {
    logger.error('Failed to fetch team gamelogs', error)
    return NextResponse.json(
      { error: 'Failed to fetch team gamelogs data' },
      { status: 500 }
    )
  }
}

