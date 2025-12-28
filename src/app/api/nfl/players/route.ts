import { NextRequest, NextResponse } from 'next/server'
import { getNFLPlayers } from '@/lib/bigquery'
import { logger } from '@/lib/logger'
import { nflPlayersFilterSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const validated = nflPlayersFilterSchema.parse({
      position: searchParams.get('position') || undefined,
      team: searchParams.get('team') || undefined,
      search: searchParams.get('search') || undefined,
    })

    const players = await getNFLPlayers(validated)

    return NextResponse.json({
      success: true,
      data: players,
      count: players.length
    })
  } catch (error) {
    logger.error('Failed to fetch NFL players', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch players',
        message: 'An error occurred while fetching players'
      },
      { status: 500 }
    )
  }
}
