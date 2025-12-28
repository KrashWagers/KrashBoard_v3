import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'

interface PlayerProp {
  event_id: string
  commence_time_utc: string
  home_team: string
  away_team: string
  bookmaker: string
  line: number
  line_str: string
  price_american: number
  kw_player_id: string
  kw_player_name: string
  kw_2025_team: string
  position_group: string
  depth_position: string
  espn_headshot: string
  is_alternate: number
  prop_name: string
  O_U: string
  implied_win_pct: number
  team: string
  opponent: string
  venue: string
  hit_2024: number
  hit_2025: number
  hit_L20: number
  hit_L15: number
  hit_L10: number
  hit_L5: number
  streak: number
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    'GOOGLE_CLOUD_KEY_FILE'
  )
)

// Fetch data from BigQuery
async function fetchPlayerPropsFromBigQuery() {
  const query = `
    SELECT 
      event_id,
      commence_time_utc,
      comment_time_utc,
      event_time_local,
      home_team,
      away_team,
      bookmaker,
      market_key,
      selection,
      line,
      line_str,
      price_american,
      participant,
      market_sid,
      outcome_sid,
      market_link,
      outcome_link,
      fetched_at_utc,
      kw_player_id,
      kw_player_id_int,
      kw_player_name,
      kw_player_name_key,
      kw_2025_team,
      position_group,
      depth_position,
      depth_rank,
      espn_headshot,
      injury_designation,
      injury_return_date,
      injury_description,
      is_alternate,
      prop_name,
      ou_side,
      O_U,
      implied_win_pct,
      team,
      opponent,
      venue,
      game_time_str,
      game_date,
      gp_2024,
      gp_2025,
      hit_2024,
      hit_2025,
      hit_L20,
      hit_L15,
      hit_L10,
      hit_L5,
      hit_L3,
      streak,
      avg_L10,
      avg_L5,
      min_L10,
      max_L10
    FROM \`nfl25-469415.odds.Player_Props\`
    WHERE kw_player_name IS NOT NULL
      AND prop_name IS NOT NULL
      AND O_U IS NOT NULL
      AND line IS NOT NULL
      AND price_american IS NOT NULL
    ORDER BY commence_time_utc DESC, kw_player_name, prop_name, O_U, line
    LIMIT 10000
  `

  const [rows] = await bigquery.query(query)

  return rows as PlayerProp[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = (page - 1) * limit

    // Check if data is in cache
    let allData = serverCache.get<PlayerProp[]>(CACHE_KEYS.PLAYER_PROPS)
    
    if (!allData) {
      console.log('Cache miss - fetching from BigQuery...')
      // First user after cache expiry fetches from BigQuery
      allData = await fetchPlayerPropsFromBigQuery()
      
      // Store in cache for 30 minutes
      serverCache.set(CACHE_KEYS.PLAYER_PROPS, allData, CACHE_TTL.PLAYER_PROPS)
      console.log(`Cached ${allData.length} player props for 30 minutes`)
    } else {
      console.log('Cache hit - using cached data')
    }

    // Paginate the cached data
    const paginatedData = allData.slice(offset, offset + limit)
    const total = allData.length

    return NextResponse.json({
      data: paginatedData,
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
        cacheTimestamp: serverCache.getInfo(CACHE_KEYS.PLAYER_PROPS)?.timestamp,
        cacheExpiresAt: serverCache.getInfo(CACHE_KEYS.PLAYER_PROPS)?.expiresAt
      }
    })
  } catch (error) {
    console.error('Error fetching player props:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player props data' },
      { status: 500 }
    )
  }
}