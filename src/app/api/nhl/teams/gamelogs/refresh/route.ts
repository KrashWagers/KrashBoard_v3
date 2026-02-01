import { NextResponse } from 'next/server'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { logger } from '@/lib/logger'
import { BigQuery } from '@google-cloud/bigquery'
import { getBigQueryConfig } from '@/lib/bigquery'

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

async function fetchTeamGamelogsFromBigQuery() {
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
  
  logger.info('[Team Gamelogs Refresh] Fetching fresh data from BigQuery')
  const [rows] = await bigquery.query({ query })
  logger.info(`[Team Gamelogs Refresh] Fetched ${rows.length} rows`)
  
  return rows
}

export async function GET() {
  try {
    // Verify this is a cron request (Vercel adds this header)
    const authHeader = process.env.CRON_SECRET
    if (authHeader) {
      // If CRON_SECRET is set, we could verify it here
      // For now, we'll trust Vercel's cron system
    }

    logger.info('[Team Gamelogs Refresh] Starting cache refresh')
    
    // Invalidate existing cache
    serverCache.invalidate(CACHE_KEYS.NHL_TEAM_GAMELOGS)
    logger.info('[Team Gamelogs Refresh] Cache invalidated')

    // Fetch fresh data
    const freshData = await fetchTeamGamelogsFromBigQuery()

    // Cache for 24 hours
    serverCache.set(CACHE_KEYS.NHL_TEAM_GAMELOGS, freshData, CACHE_TTL.NHL_TEAM_GAMELOGS)
    logger.info(`[Team Gamelogs Refresh] Cached ${freshData.length} rows for 24 hours`)

    return NextResponse.json({
      success: true,
      message: 'Cache refreshed successfully',
      rowsCached: freshData.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.error('[Team Gamelogs Refresh] Failed to refresh cache', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

