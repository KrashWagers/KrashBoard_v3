import { NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { getBigQueryConfig } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

const nhlBigQuery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

const DAILY_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=3600'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = `
      WITH player AS (
        SELECT
          player_name,
          MIN(game_date) AS min_game_date
        FROM \`nhl25-473523.gold.player_gamelogs_all_vw\`
        WHERE player_id = @player_id
        GROUP BY player_name
        LIMIT 1
      )
      SELECT 
        Game_ID,
        Season_ID,
        Game_Type,
        Game_Date,
        Home,
        Away,
        Event_Type,
        Type_Code,
        Period,
        Period_Type,
        Time,
        Strength,
        Advantage,
        Empty_Net_Context,
        Situation_Code,
        Player_Name,
        Player_Team,
        Opponent,
        Goalie_Name,
        Shot_Type,
        Miss_Reason,
        Block_Reason,
        Std_X AS x,
        Std_Y AS y,
        Dist_To_Net_Ft,
        Angle_From_Net_Rad,
        Away_SOG,
        Home_SOG,
        Is_Goal,
        Is_SOG,
        Is_Missed,
        Is_Blocked,
        Sec_In_Period,
        Sec_In_Game
      FROM \`nhl25-473523.silver.v_shots_standardized\` shots
      JOIN player ON shots.Player_Name = player.player_name
      WHERE shots.Game_Date >= player.min_game_date
      ORDER BY Game_Date DESC, Sec_In_Game
    `

    const options = {
      query,
      params: { player_id: parseInt(id) }
    }

    const [rows] = await nhlBigQuery.query(options)

    // Convert BigQuery date objects to strings
    interface PlayByPlayRow {
      Game_Date?: { value?: string } | string
      [key: string]: unknown
    }
    const formattedRows = rows.map((row: PlayByPlayRow) => ({
      ...row,
      Game_Date: typeof row.Game_Date === 'object' && row.Game_Date?.value 
        ? row.Game_Date.value 
        : row.Game_Date
    }))

    return NextResponse.json(
      { data: formattedRows, count: formattedRows.length },
      {
        headers: {
          'Cache-Control': DAILY_CACHE_CONTROL,
        },
      }
    )
  } catch (error) {
    logger.error('Failed to fetch play by play data', error)
    return NextResponse.json(
      { error: 'Failed to fetch play by play data' },
      { status: 500 }
    )
  }
}

