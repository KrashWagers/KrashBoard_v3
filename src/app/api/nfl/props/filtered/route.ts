import { NextRequest, NextResponse } from 'next/server'
import { BigQuery } from '@google-cloud/bigquery'
import { getBigQueryConfig } from '@/lib/bigquery'

const bigquery = new BigQuery(
  getBigQueryConfig(
    process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    'GOOGLE_CLOUD_KEY_FILE'
  )
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      players = [], 
      props = [], 
      games = [], 
      ou = [], 
      altProps = false, 
      sportsbooks = [],
      page = 1,
      sortField = 'commence_time_utc',
      sortDirection = 'DESC'
    } = body

    const limit = 100
    const offset = (page - 1) * limit

    // Build WHERE conditions
    const whereConditions = [
      'kw_player_name IS NOT NULL',
      'prop_name IS NOT NULL',
      'O_U IS NOT NULL',
      'line IS NOT NULL',
      'price_american IS NOT NULL'
    ]

    if (players.length > 0) {
      const playerList = players.map((p: string) => `'${p.replace(/'/g, "''")}'`).join(',')
      whereConditions.push(`kw_player_name IN (${playerList})`)
    }

    if (props.length > 0) {
      const propList = props.map((p: string) => `'${p.replace(/'/g, "''")}'`).join(',')
      whereConditions.push(`prop_name IN (${propList})`)
    }

    if (games.length > 0) {
      const gameConditions = games.map((game: string) => {
        const [awayTeam, homeTeam] = game.split(' @ ')
        return `(away_team = '${awayTeam.replace(/'/g, "''")}' AND home_team = '${homeTeam.replace(/'/g, "''")}')`
      }).join(' OR ')
      whereConditions.push(`(${gameConditions})`)
    }

    if (ou.length > 0) {
      const ouList = ou.map((o: string) => `'${o}'`).join(',')
      whereConditions.push(`O_U IN (${ouList})`)
    }

    if (!altProps) {
      whereConditions.push('is_alternate = 0')
    }

    if (sportsbooks.length > 0) {
      const bookList = sportsbooks.map((b: string) => `'${b.replace(/'/g, "''")}'`).join(',')
      whereConditions.push(`bookmaker IN (${bookList})`)
    }

    const whereClause = whereConditions.join(' AND ')

    // Build ORDER BY clause
    let orderBy = 'commence_time_utc DESC'
    if (sortField === 'bestOdds') {
      orderBy = `price_american ${sortDirection}`
    } else if (sortField === 'impliedWinPct') {
      orderBy = `implied_win_pct ${sortDirection}`
    } else if (sortField === 'streak') {
      orderBy = `streak ${sortDirection}`
    } else if (sortField.startsWith('hit')) {
      const fieldMap: Record<string, string> = {
        'hit2024': 'hit_2024',
        'hit2025': 'hit_2025',
        'hitL20': 'hit_L20',
        'hitL15': 'hit_L15',
        'hitL10': 'hit_L10',
        'hitL5': 'hit_L5'
      }
      orderBy = `${fieldMap[sortField]} ${sortDirection}`
    }

    // Build the query
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
      LIMIT ${limit} OFFSET ${offset}
    `

    const [rows] = await bigquery.query({ query })

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM \`nfl25-469415.odds.Player_Props\`
      WHERE ${whereClause}
    `

    const [countRows] = await bigquery.query({ query: countQuery })
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
    console.error('Error fetching filtered player props:', error)
    return NextResponse.json(
      { error: 'Failed to fetch filtered player props data' },
      { status: 500 }
    )
  }
}
