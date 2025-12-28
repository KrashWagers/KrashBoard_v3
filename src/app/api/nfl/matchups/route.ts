import { NextRequest, NextResponse } from 'next/server'
import { getNFLMatchups } from '@/lib/bigquery'
import { logger } from '@/lib/logger'
import { matchupsFilterSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Validate and parse query parameters
    const validated = matchupsFilterSchema.parse({
      season: searchParams.get('season') ? parseInt(searchParams.get('season')!) : 2024,
      week: searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined,
    })

    const matchups = await getNFLMatchups(validated.season, validated.week)

    return NextResponse.json({
      success: true,
      data: matchups,
      count: matchups.length
    })
  } catch (error) {
    logger.error('Failed to fetch NFL matchups', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch matchups',
        message: 'An error occurred while fetching matchups'
      },
      { status: 500 }
    )
  }
}
