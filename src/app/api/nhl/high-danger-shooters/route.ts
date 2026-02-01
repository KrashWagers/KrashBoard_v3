import { NextRequest, NextResponse } from 'next/server'
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

interface HighDangerShooterRow {
  season_id: string | null
  game_id: string | null
  game_date: string | null
  player_id: number | null
  player_name: string | null
  Pos: string | null
  Headshot_URL: string | null
  player_team_abbrev: string | null
  opp: string | null
  venue: string | null
  shots_on_goal: number | null
  corsi: number | null
  sog_HD: number | null
  sat_HD: number | null
  goals: number | null
  goals_HD: number | null
  next_opponent: string | null
  next_venue: string | null
}

async function fetchHighDangerShootersFromBigQuery() {
  logger.debug('Fetching High Danger Shooters data from BigQuery')
  
  const query = `
    SELECT
      season_id,
      game_id,
      game_date,
      player_id,
      player_name,
      Pos,
      Headshot_URL,
      player_team_abbrev,
      opp,
      venue,
      shots_on_goal,
      corsi,
      sog_HD,
      sat_HD,
      goals,
      goals_HD,
      next_opponent,
      next_venue
    FROM \`nhl25-473523.gold.hd_shooters_20252026\`
    WHERE game_date IS NOT NULL
      AND player_name IS NOT NULL
    ORDER BY game_date DESC, player_name
  `
  
  const [rows] = await nhlBigQuery.query({ query })
  logger.debug(`Fetched ${rows.length} High Danger Shooters gamelog entries`)
  
  // Convert BigQuery DATE objects to strings and handle Headshot URL field name
  interface RawRow {
    game_date?: { value?: string } | string | null
    'Headshot URL'?: string | null
    Headshot_URL?: string | null
    [key: string]: unknown
  }
  
  const formattedRows = rows.map((row: RawRow) => {
    const formatted: any = { ...row }
    
    // Handle game_date conversion
    if (typeof row.game_date === 'object' && row.game_date !== null && 'value' in row.game_date) {
      formatted.game_date = row.game_date.value || null
    }
    
    // Handle Headshot URL field name (could be either format)
    if (row['Headshot URL']) {
      formatted.Headshot_URL = row['Headshot URL']
    }
    
    return formatted
  }) as HighDangerShooterRow[]
  
  return formattedRows
}

export async function GET(request: NextRequest) {
  try {
    const data = await fetchHighDangerShootersFromBigQuery()
    return NextResponse.json(
      { data },
      {
        headers: {
          'Cache-Control': DAILY_CACHE_CONTROL,
        },
      }
    )
  } catch (error) {
    logger.error('Error fetching High Danger Shooters data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch High Danger Shooters data' },
      { status: 500 }
    )
  }
}



