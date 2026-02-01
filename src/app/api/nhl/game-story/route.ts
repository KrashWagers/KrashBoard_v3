import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getCached, getInflight, setCached, setInflight } from '@/lib/nhl-api-cache'

const LIVE_TTL_SECONDS = 10
const FINAL_TTL_SECONDS = 60 * 60
const FINAL_LONG_TTL_SECONDS = 60 * 60 * 24 * 30

type GameStoryResponse = {
  gameState?: string
  startTimeUTC?: string
  gameDate?: string
} & Record<string, unknown>

function getFinalTtlSeconds(gameDate?: string, startTimeUTC?: string): number {
  const dateSource = startTimeUTC || gameDate
  if (!dateSource) return FINAL_TTL_SECONDS
  const startTime = new Date(dateSource)
  if (Number.isNaN(startTime.getTime())) return FINAL_TTL_SECONDS
  const hoursSince = (Date.now() - startTime.getTime()) / 1000 / 60 / 60
  return hoursSince >= 24 ? FINAL_LONG_TTL_SECONDS : FINAL_TTL_SECONDS
}

function getTtlSeconds(gameState?: string, gameDate?: string, startTimeUTC?: string): number {
  const normalized = (gameState || '').toUpperCase()
  if (normalized === 'FINAL' || normalized === 'OFF') {
    return getFinalTtlSeconds(gameDate, startTimeUTC)
  }
  if (normalized === 'LIVE' || normalized === 'CRIT') {
    return LIVE_TTL_SECONDS
  }
  return LIVE_TTL_SECONDS
}

async function fetchGameStory(gameId: string): Promise<GameStoryResponse> {
  const upstream = `https://api-web.nhle.com/v1/wsc/game-story/${gameId}`
  const response = await fetch(upstream, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Upstream game-story fetch failed: ${response.status}`)
  }
  return response.json()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get('gameId')
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 })
  }

  const cacheKey = `nhl:game-story:${gameId}`

  try {
    const cached = getCached<GameStoryResponse>(cacheKey)
    if (cached && !cached.isStale) {
      return NextResponse.json(
        {
          ...cached.data,
          meta: {
            gameId,
            fetchedAtUtc: new Date(cached.fetchedAt).toISOString(),
            cacheTtlSeconds: cached.ttlSeconds,
          },
        },
        {
          headers: {
            'Cache-Control': `public, max-age=0, s-maxage=${cached.ttlSeconds}, stale-while-revalidate=${LIVE_TTL_SECONDS}`,
          },
        }
      )
    }

    if (cached && cached.isStale && !getInflight(cacheKey)) {
      const refreshPromise = fetchGameStory(gameId)
        .then((data) => {
          const ttlSeconds = getTtlSeconds(data.gameState, data.gameDate, data.startTimeUTC)
          setCached(cacheKey, data, ttlSeconds)
        })
        .catch((error) => {
          logger.warn('Failed to refresh NHL game-story cache', error)
        })
      setInflight(cacheKey, refreshPromise)
    }

    if (cached) {
      return NextResponse.json(
        {
          ...cached.data,
          meta: {
            gameId,
            fetchedAtUtc: new Date(cached.fetchedAt).toISOString(),
            cacheTtlSeconds: cached.ttlSeconds,
          },
        },
        {
          headers: {
            'Cache-Control': `public, max-age=0, s-maxage=${cached.ttlSeconds}, stale-while-revalidate=${LIVE_TTL_SECONDS}`,
          },
        }
      )
    }

    const data = await fetchGameStory(gameId)
    const ttlSeconds = getTtlSeconds(data.gameState, data.gameDate, data.startTimeUTC)
    const entry = setCached(cacheKey, data, ttlSeconds)

    return NextResponse.json(
      {
        ...data,
        meta: {
          gameId,
          fetchedAtUtc: new Date(entry.fetchedAt).toISOString(),
          cacheTtlSeconds: entry.ttlSeconds,
        },
      },
      {
        headers: {
          'Cache-Control': `public, max-age=0, s-maxage=${entry.ttlSeconds}, stale-while-revalidate=${LIVE_TTL_SECONDS}`,
        },
      }
    )
  } catch (error) {
    logger.error('Failed to fetch NHL game-story', error)
    return NextResponse.json({ error: 'Failed to fetch NHL game-story' }, { status: 500 })
  }
}
