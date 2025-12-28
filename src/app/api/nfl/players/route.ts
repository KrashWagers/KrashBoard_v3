import { NextRequest, NextResponse } from 'next/server'
import { getNFLPlayers } from '@/lib/bigquery'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const team = searchParams.get('team')
    const search = searchParams.get('search')

    const filters = {
      position: position || undefined,
      team: team || undefined,
      search: search || undefined,
    }

    const players = await getNFLPlayers(filters)

    return NextResponse.json({
      success: true,
      data: players,
      count: players.length
    })
  } catch (error) {
    console.error('Error fetching NFL players:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch players',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
