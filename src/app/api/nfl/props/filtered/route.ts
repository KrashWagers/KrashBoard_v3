import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { getBigQueryConfig } from '@/lib/bigquery'
import { filteredPropsRequestSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    'GOOGLE_CLOUD_KEY_FILE'
  )
)

// Safe ORDER BY field mapping - prevents SQL injection
const ORDER_BY_FIELD_MAP: Record<string, string> = {
  'commence_time_utc': 'commence_time_utc',
  'bestOdds': 'price_american',
  'impliedWinPct': 'implied_win_pct',
  'streak': 'streak',
  'hit2024': 'hit_2024',
  'hit2025': 'hit_2025',
  'hitL20': 'hit_L20',
  'hitL15': 'hit_L15',
  'hitL10': 'hit_L10',
  'hitL5': 'hit_L5',
} as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input with Zod schema
    const validated = filteredPropsRequestSchema.parse(body)
    const { 
      players, 
      props, 
      games, 
      ou, 
      altProps, 
      sportsbooks,
      page,
      sortField,
      sortDirection
    } = validated

    const limit = 100
    const offset = (page - 1) * limit

    // Build WHERE conditions with parameterized queries
    const whereConditions: string[] = [
      'kw_player_name IS NOT NULL',
      'prop_name IS NOT NULL',
      'O_U IS NOT NULL',
      'line IS NOT NULL',
      'price_american IS NOT NULL'
    ]

    // Build parameters object for BigQuery
    const params: Record<string, any> = {}
    let paramIndex = 0

    // Handle players filter - use array parameter (BigQuery supports ARRAY<string>)
    if (players.length > 0 && players.length <= 100) {
      // Validate each player name (alphanumeric, spaces, hyphens, apostrophes only)
      const validPlayers = players.filter(p => {
        const sanitized = p.trim()
        return /^[a-zA-Z0-9\s\-'.]+$/.test(sanitized) && sanitized.length > 0 && sanitized.length <= 100
      })
      if (validPlayers.length > 0) {
        // BigQuery array parameter - pass as array
        params[`players_array`] = validPlayers
        whereConditions.push(`kw_player_name IN UNNEST(@players_array)`)
      }
    }

    // Handle props filter
    if (props.length > 0 && props.length <= 100) {
      const validProps = props.filter(p => {
        const sanitized = p.trim()
        return /^[a-zA-Z0-9\s\-'.]+$/.test(sanitized) && sanitized.length > 0 && sanitized.length <= 100
      })
      if (validProps.length > 0) {
        params[`props_array`] = validProps
        whereConditions.push(`prop_name IN UNNEST(@props_array)`)
      }
    }

    // Handle games filter - validate format and use parameters
    if (games.length > 0 && games.length <= 50) {
      const gameConditions: string[] = []
      games.forEach((game, idx) => {
        const parts = game.split(' @ ')
        if (parts.length === 2) {
          const awayTeam = parts[0].trim()
          const homeTeam = parts[1].trim()
          // Validate team abbreviations (3 uppercase letters)
          if (/^[A-Z]{2,4}$/.test(awayTeam) && /^[A-Z]{2,4}$/.test(homeTeam)) {
            params[`away_${paramIndex}`] = awayTeam
            params[`home_${paramIndex}`] = homeTeam
            gameConditions.push(`(away_team = @away_${paramIndex} AND home_team = @home_${paramIndex})`)
            paramIndex++
          }
        }
      })
      if (gameConditions.length > 0) {
        whereConditions.push(`(${gameConditions.join(' OR ')})`)
      }
    }

    // Handle OU filter - validate only 'Over' or 'Under'
    if (ou.length > 0 && ou.length <= 10) {
      const validOU = ou.filter(o => o === 'Over' || o === 'Under')
      if (validOU.length > 0) {
        params[`ou_array`] = validOU
        whereConditions.push(`O_U IN UNNEST(@ou_array)`)
      }
    }

    // Handle altProps filter
    if (!altProps) {
      whereConditions.push('is_alternate = 0')
    }

    // Handle sportsbooks filter - validate bookmaker names
    if (sportsbooks.length > 0 && sportsbooks.length <= 50) {
      const validBooks = sportsbooks.filter(b => {
        const sanitized = b.trim()
        return /^[a-zA-Z0-9\s\-]+$/.test(sanitized) && sanitized.length > 0 && sanitized.length <= 50
      })
      if (validBooks.length > 0) {
        params[`books_array`] = validBooks
        whereConditions.push(`bookmaker IN UNNEST(@books_array)`)
      }
    }

    const whereClause = whereConditions.join(' AND ')

    // Build ORDER BY clause - use whitelist to prevent SQL injection
    const orderByField = ORDER_BY_FIELD_MAP[sortField] || 'commence_time_utc'
    const safeSortDirection = sortDirection === 'ASC' ? 'ASC' : 'DESC'
    const orderBy = `${orderByField} ${safeSortDirection}`

    // Build the query with parameterized values
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
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT @limit OFFSET @offset
    `

    // Add limit and offset to params
    params.limit = limit
    params.offset = offset

    const [rows] = await bigquery.query({ 
      query,
      params 
    })

    // Get total count for pagination - reuse same params but without limit/offset
    const countParams = { ...params }
    delete countParams.limit
    delete countParams.offset

    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`nfl25-469415.odds.Player_Props\`
      WHERE ${whereClause}
    `

    const [countRows] = await bigquery.query({ 
      query: countQuery,
      params: countParams 
    })
    const total = countRows[0]?.total || 0

    return NextResponse.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    // Log error without exposing details to client
    logger.error('Failed to fetch filtered player props', error)

    // Return generic error to client
    return NextResponse.json(
      { 
        error: 'Failed to fetch filtered player props data',
        success: false 
      },
      { status: 500 }
    )
  }
}
