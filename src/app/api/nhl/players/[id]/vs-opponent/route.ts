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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const query = `
      SELECT 
        opponent_abbr,
        gp_vs_opp,
        goals_vs_opp,
        assists_vs_opp,
        points_vs_opp,
        shots_on_goal_vs_opp
      FROM \`nhl25-473523.marts.Player_vs_Opp\`
      WHERE player_id = @player_id
      ORDER BY opponent_abbr
    `

    const options = {
      query,
      params: {
        player_id: parseInt(id)
      }
    }

    const [rows] = await nhlBigQuery.query(options)

    return NextResponse.json({ data: rows, count: rows.length })
  } catch (error) {
    logger.error('Failed to fetch player vs opponent data', error)
    return NextResponse.json(
      { error: 'Failed to fetch player vs opponent data' },
      { status: 500 }
    )
  }
}

