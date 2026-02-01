import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getCached, getInflight, setCached, setInflight } from '@/lib/nhl-api-cache'

const SCORE_TTL_SECONDS = 10
const SCORE_STALE_SECONDS = 30

type ScoreResponse = Record<string, unknown>

function getTodayEasternDate(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

async function fetchScore(date: string): Promise<ScoreResponse> {
  const upstream = `https://api-web.nhle.com/v1/score/${date}`
  const response = await fetch(upstream, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Upstream score fetch failed: ${response.status}`)
  }
  return response.json()
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || getTodayEasternDate()
  const cacheKey = `nhl:score:${date}`

  try {
    const cached = getCached<ScoreResponse>(cacheKey)
    if (cached && !cached.isStale) {
      return NextResponse.json(
        {
          ...cached.data,
          meta: {
            date,
            fetchedAtUtc: new Date(cached.fetchedAt).toISOString(),
            cacheTtlSeconds: cached.ttlSeconds,
          },
        },
        {
          headers: {
            'Cache-Control': `public, max-age=0, s-maxage=${SCORE_TTL_SECONDS}, stale-while-revalidate=${SCORE_STALE_SECONDS}`,
          },
        }
      )
    }

    if (cached && cached.isStale && !getInflight(cacheKey)) {
      const refreshPromise = fetchScore(date)
        .then((data) => {
          setCached(cacheKey, data, SCORE_TTL_SECONDS)
        })
        .catch((error) => {
          logger.warn('Failed to refresh NHL score cache', error)
        })
      setInflight(cacheKey, refreshPromise)
    }

    if (cached) {
      return NextResponse.json(
        {
          ...cached.data,
          meta: {
            date,
            fetchedAtUtc: new Date(cached.fetchedAt).toISOString(),
            cacheTtlSeconds: cached.ttlSeconds,
          },
        },
        {
          headers: {
            'Cache-Control': `public, max-age=0, s-maxage=${SCORE_TTL_SECONDS}, stale-while-revalidate=${SCORE_STALE_SECONDS}`,
          },
        }
      )
    }

    const data = await fetchScore(date)
    const entry = setCached(cacheKey, data, SCORE_TTL_SECONDS)
    return NextResponse.json(
      {
        ...data,
        meta: {
          date,
          fetchedAtUtc: new Date(entry.fetchedAt).toISOString(),
          cacheTtlSeconds: entry.ttlSeconds,
        },
      },
      {
        headers: {
          'Cache-Control': `public, max-age=0, s-maxage=${SCORE_TTL_SECONDS}, stale-while-revalidate=${SCORE_STALE_SECONDS}`,
        },
      }
    )
  } catch (error) {
    logger.error('Failed to fetch NHL score', error)
    return NextResponse.json({ error: 'Failed to fetch NHL score' }, { status: 500 })
  }
}
