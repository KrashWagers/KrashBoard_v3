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

async function fetchPlayerGamelogsFromBigQuery(playerId: string) {
  logger.debug(`Fetching NHL gamelogs for player ${playerId} from BigQuery`)
  
  // Use the comprehensive view with all stats
  const query = `
    SELECT * FROM \`nhl25-473523.gold.player_gamelogs_all_vw\`
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
    const { id: playerId } = await params
    const cacheKey = `nhl_player_gamelogs_${playerId}`
    
    // Check cache first
    let gamelogs = serverCache.get(cacheKey)
    
    if (!gamelogs) {
      // Fetch from BigQuery if not in cache
      gamelogs = await fetchPlayerGamelogsFromBigQuery(playerId)
      serverCache.set(cacheKey, gamelogs, PLAYER_GAMELOGS_TTL)
    }

    return NextResponse.json({
      data: gamelogs,
      playerId,
      cache: {
        status: serverCache.has(cacheKey) ? 'hit' : 'miss',
        timestamp: Date.now(),
        ttl: PLAYER_GAMELOGS_TTL,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch NHL player gamelogs', error)
    return NextResponse.json(
      { error: 'Failed to fetch NHL player gamelogs data' },
      { status: 500 }
    )
  }
}