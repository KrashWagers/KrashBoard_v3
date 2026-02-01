import { NextResponse } from 'next/server'
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
    process.env.NHL_GCP_PROJECT_ID || '',
    'NHL_GCP_KEY_FILE'
  )
)

const DAILY_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=3600'

async function fetchFilterOptions(): Promise<FilterOptions> {
  // Extract sportsbooks dynamically from columns that have non-null odds
  const sportsbooksQuery = `
    SELECT DISTINCT bookmaker
    FROM (
      SELECT 'BetMGM' as bookmaker FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\` WHERE \`BetMGM Odds\` IS NOT NULL
      UNION DISTINCT
      SELECT 'BetRivers' as bookmaker FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\` WHERE \`BetRivers Odds\` IS NOT NULL
      UNION DISTINCT
      SELECT 'DraftKings' as bookmaker FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\` WHERE \`DraftKings Odds\` IS NOT NULL
      UNION DISTINCT
      SELECT 'Fanatics' as bookmaker FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\` WHERE \`Fanatics Odds\` IS NOT NULL
      UNION DISTINCT
      SELECT 'FanDuel' as bookmaker FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\` WHERE \`FanDuel Odds\` IS NOT NULL
      UNION DISTINCT
      SELECT 'Pinnacle' as bookmaker FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\` WHERE \`Pinnacle Odds\` IS NOT NULL
    )
    ORDER BY bookmaker
  `

  const mainQuery = `
    SELECT 
      ARRAY_AGG(DISTINCT Player IGNORE NULLS) as players,
      ARRAY_AGG(DISTINCT Prop IGNORE NULLS) as props,
      ARRAY_AGG(DISTINCT Matchup IGNORE NULLS) as games
    FROM \`nhl25-473523.betting_odds.Player_Props_w_HR_v3\`
  `

  const [mainRows] = await bigquery.query({ query: mainQuery })
  const [sportsbooksRows] = await bigquery.query({ query: sportsbooksQuery })
  
  const r = mainRows[0] as any
  const sportsbooks = (sportsbooksRows as any[]).map(row => row.bookmaker).filter(Boolean)

  return {
    players: (r.players || []).sort(),
    props: (r.props || []).sort(),
    games: (r.games || []).sort(),
    sportsbooks: sportsbooks.sort(),
  }
}

export async function GET() {
  try {
    let data = serverCache.get<FilterOptions>(CACHE_KEYS.NHL_FILTER_OPTIONS)
    if (!data) {
      data = await fetchFilterOptions()
      serverCache.set(CACHE_KEYS.NHL_FILTER_OPTIONS, data, CACHE_TTL.NHL_FILTER_OPTIONS)
    }
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': DAILY_CACHE_CONTROL,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch NHL filter options', error)
    return NextResponse.json({ error: 'Failed to fetch filter options' }, { status: 500 })
  }
}


