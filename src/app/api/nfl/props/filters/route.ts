import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'
import { logger } from '@/lib/logger'

interface FilterOptions {
  players: string[]
  props: string[]
  games: string[]
  sportsbooks: string[]
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    'GOOGLE_CLOUD_KEY_FILE'
  )
)

// Fetch filter options from BigQuery
async function fetchFilterOptionsFromBigQuery() {
  const query = `
    SELECT 
      ARRAY_AGG(DISTINCT kw_player_name IGNORE NULLS) as players,
      ARRAY_AGG(DISTINCT prop_name IGNORE NULLS) as props,
      ARRAY_AGG(DISTINCT CONCAT(away_team, ' @ ', home_team) IGNORE NULLS) as games,
      ARRAY_AGG(DISTINCT bookmaker IGNORE NULLS) as sportsbooks
    FROM \`nfl25-469415.odds.Player_Props\`
    WHERE kw_player_name IS NOT NULL
      AND prop_name IS NOT NULL
      AND away_team IS NOT NULL
      AND home_team IS NOT NULL
      AND bookmaker IS NOT NULL
  `

  const [rows] = await bigquery.query({ query })
  const result = rows[0]

  return {
    players: result.players.sort(),
    props: result.props.sort(),
    games: result.games.sort(),
    sportsbooks: result.sportsbooks.sort(),
  } as FilterOptions
}

export async function GET() {
  try {
    // Check if filter options are in cache
    let filterOptions = serverCache.get<FilterOptions>(CACHE_KEYS.FILTER_OPTIONS)
    
    if (!filterOptions) {
      logger.debug('Filter options cache miss - fetching from BigQuery')
      // First user after cache expiry fetches from BigQuery
      filterOptions = await fetchFilterOptionsFromBigQuery()
      
      // Store in cache for 24 hours
      serverCache.set(CACHE_KEYS.FILTER_OPTIONS, filterOptions, CACHE_TTL.FILTER_OPTIONS)
      logger.debug('Cached filter options for 24 hours')
    } else {
      logger.debug('Filter options cache hit - using cached data')
    }

    return NextResponse.json({
      players: filterOptions.players,
      props: filterOptions.props,
      games: filterOptions.games,
      sportsbooks: filterOptions.sportsbooks,
      cacheInfo: {
        cached: true,
        cacheTimestamp: serverCache.getInfo(CACHE_KEYS.FILTER_OPTIONS)?.timestamp,
        cacheExpiresAt: serverCache.getInfo(CACHE_KEYS.FILTER_OPTIONS)?.expiresAt
      }
    })
  } catch (error) {
    logger.error('Failed to fetch filter options', error)
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    )
  }
}