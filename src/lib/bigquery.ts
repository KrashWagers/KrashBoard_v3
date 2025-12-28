import { BigQuery } from '@google-cloud/bigquery'
import { logger } from './logger'

/**
 * Helper function to get BigQuery configuration
 * Handles both file paths (local development) and JSON strings (Vercel deployment)
 */
export function getBigQueryConfig(projectId: string, keyEnvVar: string) {
  const keyValue = process.env[keyEnvVar]
  if (!keyValue) {
    throw new Error(`Missing environment variable: ${keyEnvVar}`)
  }

  // Check if it's a JSON string (Vercel) or file path (local)
  if (keyValue.trim().startsWith('{')) {
    // JSON string from Vercel - parse and use credentials object
    try {
      return {
        projectId,
        credentials: JSON.parse(keyValue),
      }
    } catch (error) {
      throw new Error(`Invalid JSON in ${keyEnvVar}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  } else {
    // File path for local development
    return {
      projectId,
      keyFilename: keyValue,
    }
  }
}

// Database table references
export const TABLES = {
  MATCHUPS_2024: 'nfl25-469415.nfl_info.Matchups_2024',
  MATCHUPS_2025: 'nfl25-469415.nfl_info.Matchups_2025',
  PLAYER_LIST: 'nfl25-469415.nfl_info.player_list',
  PLAYER_ID: 'nfl25-469415.nfl_info.player_id',
  DEPTH_CHARTS: 'nfl25-469415.nfl_silver.depth_charts_current',
  PLAYER_GAMELOGS: 'nfl25-469415.v2_nfl_silver.Player_Gamelogs_v3',
  TEAM_GAMELOGS: 'nfl25-469415.v2_nfl_silver.Team_Gamelogs_v3',
  PLAYER_PROPS: 'nfl25-469415.odds.Player_Props',
  TEAM_MARKETS: 'nfl25-469415.odds.team_markets',
} as const

// Lazy initialization of BigQuery client to avoid errors during build time
let bigqueryInstance: BigQuery | null = null

function getBigQueryClient(): BigQuery {
  if (!bigqueryInstance) {
    bigqueryInstance = new BigQuery(
      getBigQueryConfig(
        process.env.BIGQUERY_PROJECT_ID || 'nfl25-469415',
        'GOOGLE_APPLICATION_CREDENTIALS'
      )
    )
  }
  return bigqueryInstance
}

// Generic query function
export async function queryBigQuery<T = unknown>(
  query: string,
  options?: { maxResults?: number; timeoutMs?: number }
): Promise<T[]> {
  try {
    const bigquery = getBigQueryClient()
    const [rows] = await bigquery.query({
      query,
      ...options,
    })
    return rows as T[]
  } catch (error) {
    logger.error('BigQuery query failed', error)
    throw new Error(`BigQuery query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// NFL-specific query functions
export async function getNFLMatchups(season: number = 2024, week?: number) {
  // Validate inputs
  if (season < 2000 || season > 2100) {
    throw new Error('Invalid season parameter')
  }
  
  const table = season === 2024 ? TABLES.MATCHUPS_2024 : TABLES.MATCHUPS_2025
  
  let query = `SELECT * FROM \`${table}\` WHERE 1=1`
  const params: Record<string, any> = {}
  
  if (week !== undefined) {
    if (week < 1 || week > 25) {
      throw new Error('Invalid week parameter')
    }
    query += ' AND week = @week'
    params.week = week
  }
  
  query += ' ORDER BY week, game_date'
  
  // Use parameterized query
  const bigquery = getBigQueryClient()
  const [rows] = await bigquery.query({ query, params })
  return rows as unknown[]
}

export async function getNFLPlayers(filters?: {
  position?: string
  team?: string
  search?: string
}) {
  const whereConditions: string[] = []
  const params: Record<string, any> = {}
  
  if (filters?.position) {
    // Validate position
    if (typeof filters.position !== 'string' || filters.position.length > 10) {
      throw new Error('Invalid position parameter')
    }
    whereConditions.push('position = @position')
    params.position = filters.position
  }
  
  if (filters?.team) {
    // Validate team
    if (typeof filters.team !== 'string' || filters.team.length > 10) {
      throw new Error('Invalid team parameter')
    }
    whereConditions.push('team = @team')
    params.team = filters.team
  }
  
  if (filters?.search) {
    // Validate search - sanitize input
    const searchTerm = filters.search.trim()
    if (searchTerm.length > 100) {
      throw new Error('Search term too long')
    }
    whereConditions.push('(player_name LIKE @search OR team LIKE @search)')
    params.search = `%${searchTerm}%`
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : ''
  
  const query = `
    SELECT *
    FROM \`${TABLES.PLAYER_LIST}\`
    ${whereClause}
    ORDER BY player_name
  `
  
  // Use parameterized query
  const bigquery = getBigQueryClient()
  const [rows] = await bigquery.query({ 
    query, 
    params,
    maxResults: 1000 
  })
  return rows as any[]
}

export async function getPlayerGamelogs(
  playerId: string,
  season: number = 2024,
  week?: number
) {
  // Validate inputs
  if (!playerId || typeof playerId !== 'string' || playerId.length > 100) {
    throw new Error('Invalid playerId parameter')
  }
  if (season < 2000 || season > 2100) {
    throw new Error('Invalid season parameter')
  }
  
  // Build query with parameterized values
  let query = `
    SELECT *
    FROM \`${TABLES.PLAYER_GAMELOGS}\`
    WHERE player_id = @player_id
    AND season = @season
  `
  
  const params: Record<string, any> = {
    player_id: playerId,
    season: season
  }
  
  if (week !== undefined) {
    if (week < 1 || week > 25) {
      throw new Error('Invalid week parameter')
    }
    query += ' AND week = @week'
    params.week = week
  }
  
  query += ' ORDER BY week DESC'
  
  // Use parameterized query
  const bigquery = getBigQueryClient()
  const [rows] = await bigquery.query({ query, params })
  return rows as unknown[]
}

export async function getPlayerProps(
  filters?: {
    playerId?: string
    gameId?: string
    propType?: string
    isActive?: boolean
  }
) {
  const whereConditions: string[] = []
  const params: Record<string, any> = {}
  
  if (filters?.playerId) {
    // Validate playerId
    if (typeof filters.playerId !== 'string' || filters.playerId.length > 100) {
      throw new Error('Invalid playerId parameter')
    }
    whereConditions.push('player_id = @player_id')
    params.player_id = filters.playerId
  }
  
  if (filters?.gameId) {
    // Validate gameId
    if (typeof filters.gameId !== 'string' || filters.gameId.length > 100) {
      throw new Error('Invalid gameId parameter')
    }
    whereConditions.push('game_id = @game_id')
    params.game_id = filters.gameId
  }
  
  if (filters?.propType) {
    // Validate propType
    if (typeof filters.propType !== 'string' || filters.propType.length > 50) {
      throw new Error('Invalid propType parameter')
    }
    whereConditions.push('prop_type = @prop_type')
    params.prop_type = filters.propType
  }
  
  if (filters?.isActive !== undefined) {
    whereConditions.push('is_active = @is_active')
    params.is_active = filters.isActive
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : ''
  
  const query = `
    SELECT *
    FROM \`${TABLES.PLAYER_PROPS}\`
    ${whereClause}
    ORDER BY last_updated DESC
  `
  
  // Use parameterized query
  const bigquery = getBigQueryClient()
  const [rows] = await bigquery.query({ query, params })
  return rows as unknown[]
}

export async function getTeamStats(
  team: string,
  season: number = 2024,
  week?: number
) {
  // Validate inputs
  if (!team || typeof team !== 'string' || team.length > 10) {
    throw new Error('Invalid team parameter')
  }
  if (season < 2000 || season > 2100) {
    throw new Error('Invalid season parameter')
  }
  
  let query = `
    SELECT *
    FROM \`${TABLES.TEAM_GAMELOGS}\`
    WHERE team = @team
    AND season = @season
  `
  
  const params: Record<string, any> = {
    team: team,
    season: season
  }
  
  if (week !== undefined) {
    if (week < 1 || week > 25) {
      throw new Error('Invalid week parameter')
    }
    query += ' AND week = @week'
    params.week = week
  }
  
  query += ' ORDER BY week DESC'
  
  // Use parameterized query
  const bigquery = getBigQueryClient()
  const [rows] = await bigquery.query({ query, params })
  return rows as unknown[]
}

export async function getDepthCharts(team?: string) {
  let query = 'SELECT * FROM `' + TABLES.DEPTH_CHARTS + '`'
  const params: Record<string, any> = {}
  
  if (team) {
    // Validate team
    if (typeof team !== 'string' || team.length > 10) {
      throw new Error('Invalid team parameter')
    }
    query += ' WHERE team = @team'
    params.team = team
  }
  
  query += ' ORDER BY team, position, depth'
  
  // Use parameterized query
  const bigquery = getBigQueryClient()
  const [rows] = await bigquery.query({ query, params })
  return rows as unknown[]
}

// Utility function to test BigQuery connection
export async function testBigQueryConnection(): Promise<boolean> {
  try {
    const query = 'SELECT 1 as test'
    await queryBigQuery(query)
    return true
  } catch (error) {
    logger.error('BigQuery connection test failed', error)
    return false
  }
}
