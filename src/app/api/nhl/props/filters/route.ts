import { NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { serverCache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { getBigQueryConfig } from '@/lib/bigquery'

interface FilterOptions {
  players: string[]
  props: string[]
  games: string[]
  sportsbooks: string[]
}

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

async function fetchFilterOptions(): Promise<FilterOptions> {
  const query = `
    SELECT 
      ARRAY_AGG(DISTINCT Player IGNORE NULLS) as players,
      ARRAY_AGG(DISTINCT Prop IGNORE NULLS) as props,
      ARRAY_AGG(DISTINCT CONCAT(Away, ' @ ', Home) IGNORE NULLS) as games,
      ARRAY_AGG(DISTINCT Bookmaker IGNORE NULLS) as sportsbooks
    FROM \`nhl25-473523.betting_odds.Player_Props_w_HR\`
  `
  const [rows] = await bigquery.query({ query })
  const r = rows[0] as any
  return {
    players: (r.players || []).sort(),
    props: (r.props || []).sort(),
    games: (r.games || []).sort(),
    sportsbooks: (r.sportsbooks || []).sort(),
  }
}

export async function GET() {
  try {
    let data = serverCache.get<FilterOptions>(CACHE_KEYS.NHL_FILTER_OPTIONS)
    if (!data) {
      data = await fetchFilterOptions()
      serverCache.set(CACHE_KEYS.NHL_FILTER_OPTIONS, data, CACHE_TTL.NHL_FILTER_OPTIONS)
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('NHL filter options error', error)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}


