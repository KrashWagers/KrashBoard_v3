import { NextRequest, NextResponse } from 'next/server'
import { getNFLMatchups } from '@/lib/bigquery'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const season = parseInt(searchParams.get('season') || '2024')
    const week = searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined

    const matchups = await getNFLMatchups(season, week)

    return NextResponse.json({
      success: true,
      data: matchups,
      count: matchups.length
    })
  } catch (error) {
    console.error('Error fetching NFL matchups:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matchups',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
