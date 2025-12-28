import { BigQuery } from '@google-cloud/bigquery'

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

// Initialize BigQuery client
const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.BIGQUERY_PROJECT_ID || 'nfl25-469415',
    'GOOGLE_APPLICATION_CREDENTIALS'
  )
)

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

// Generic query function
export async function queryBigQuery<T = any>(
  query: string,
  options?: { maxResults?: number; timeoutMs?: number }
): Promise<T[]> {
  try {
    const [rows] = await bigquery.query({
      query,
      ...options,
    })
    return rows as T[]
  } catch (error) {
    console.error('BigQuery error:', error)
    throw new Error(`BigQuery query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// NFL-specific query functions
export async function getNFLMatchups(season: number = 2024, week?: number) {
  const table = season === 2024 ? TABLES.MATCHUPS_2024 : TABLES.MATCHUPS_2025
  const weekFilter = week ? `AND week = ${week}` : ''
  
  const query = `
    SELECT *
    FROM \`${table}\`
    WHERE 1=1 ${weekFilter}
    ORDER BY week, game_date
  `
  
  return queryBigQuery(query)
}

export async function getNFLPlayers(filters?: {
  position?: string
  team?: string
  search?: string
}) {
  let whereClause = 'WHERE 1=1'
  const params: any[] = []
  
  if (filters?.position) {
    whereClause += ` AND position = @position`
    params.push({ name: 'position', value: filters.position })
  }
  
  if (filters?.team) {
    whereClause += ` AND team = @team`
    params.push({ name: 'team', value: filters.team })
  }
  
  if (filters?.search) {
    whereClause += ` AND (player_name LIKE @search OR team LIKE @search)`
    params.push({ name: 'search', value: `%${filters.search}%` })
  }
  
  const query = `
    SELECT *
    FROM \`${TABLES.PLAYER_LIST}\`
    ${whereClause}
    ORDER BY player_name
  `
  
  return queryBigQuery(query, { maxResults: 1000 })
}

export async function getPlayerGamelogs(
  playerId: string,
  season: number = 2024,
  week?: number
) {
  const weekFilter = week ? `AND week = ${week}` : ''
  
  const query = `
    SELECT *
    FROM \`${TABLES.PLAYER_GAMELOGS}\`
    WHERE player_id = '${playerId}'
    AND season = ${season}
    ${weekFilter}
    ORDER BY week DESC
  `
  
  return queryBigQuery(query)
}

export async function getPlayerProps(
  filters?: {
    playerId?: string
    gameId?: string
    propType?: string
    isActive?: boolean
  }
) {
  let whereClause = 'WHERE 1=1'
  
  if (filters?.playerId) {
    whereClause += ` AND player_id = '${filters.playerId}'`
  }
  
  if (filters?.gameId) {
    whereClause += ` AND game_id = '${filters.gameId}'`
  }
  
  if (filters?.propType) {
    whereClause += ` AND prop_type = '${filters.propType}'`
  }
  
  if (filters?.isActive !== undefined) {
    whereClause += ` AND is_active = ${filters.isActive}`
  }
  
  const query = `
    SELECT *
    FROM \`${TABLES.PLAYER_PROPS}\`
    ${whereClause}
    ORDER BY last_updated DESC
  `
  
  return queryBigQuery(query)
}

export async function getTeamStats(
  team: string,
  season: number = 2024,
  week?: number
) {
  const weekFilter = week ? `AND week = ${week}` : ''
  
  const query = `
    SELECT *
    FROM \`${TABLES.TEAM_GAMELOGS}\`
    WHERE team = '${team}'
    AND season = ${season}
    ${weekFilter}
    ORDER BY week DESC
  `
  
  return queryBigQuery(query)
}

export async function getDepthCharts(team?: string) {
  const teamFilter = team ? `WHERE team = '${team}'` : ''
  
  const query = `
    SELECT *
    FROM \`${TABLES.DEPTH_CHARTS}\`
    ${teamFilter}
    ORDER BY team, position, depth
  `
  
  return queryBigQuery(query)
}

// Utility function to test BigQuery connection
export async function testBigQueryConnection(): Promise<boolean> {
  try {
    const query = 'SELECT 1 as test'
    await queryBigQuery(query)
    return true
  } catch (error) {
    console.error('BigQuery connection test failed:', error)
    return false
  }
}
