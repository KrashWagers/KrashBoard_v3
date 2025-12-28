import { NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { getBigQueryConfig } from '@/lib/bigquery'

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
    
    // First, get player name from gamelogs
    const playerQuery = `
      SELECT player_name
      FROM \`nhl25-473523.gold.player_gamelogs_all_vw\`
      WHERE player_id = @player_id
      LIMIT 1
    `
    
    const [playerRows] = await nhlBigQuery.query({
      query: playerQuery,
      params: { player_id: parseInt(id) }
    })
    
    const playerName = playerRows[0]?.player_name
    console.log('Looking for player:', playerName)
    if (!playerName) {
      return NextResponse.json({ data: [], count: 0 })
    }
    
    // Query standardized shots view - remove player filter temporarily to debug
    const query = `
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
      FROM \`nhl25-473523.silver.v_shots_standardized\`
      WHERE Player_Name LIKE '%' || @player_name || '%'
      ORDER BY Game_Date DESC, Sec_In_Game
    `

    const options = {
      query,
      params: { player_name: playerName }
    }

    const [rows] = await nhlBigQuery.query(options)

    // Convert BigQuery date objects to strings
    const formattedRows = rows.map((row: any) => ({
      ...row,
      Game_Date: row.Game_Date?.value || row.Game_Date
    }))

    return NextResponse.json({ data: formattedRows, count: formattedRows.length })
  } catch (error) {
    console.error('Error fetching play by play data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch play by play data' },
      { status: 500 }
    )
  }
}

