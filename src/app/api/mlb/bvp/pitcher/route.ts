import { NextRequest, NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { getCacheTTLSeconds, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

const PITCHER_QUERY_BY_DATE = `
  SELECT *
  FROM \`mlb26-485401.vs_pitch_type.payload_bvp_pitcher_v1\`
  WHERE pitcher = @pitcherId
    AND game_date = @game_date
  LIMIT 1;
`

const PITCHER_QUERY_LATEST = `
  SELECT *
  FROM \`mlb26-485401.vs_pitch_type.payload_bvp_pitcher_v1\`
  WHERE pitcher = @pitcherId
  ORDER BY game_date DESC
  LIMIT 1;
`

const isValidId = (value: string) => /^\d+$/.test(value)
const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pitcherId = searchParams.get("pitcherId")?.trim() ?? ""
    const dateParam = searchParams.get("date")?.trim()

    if (!isValidId(pitcherId)) {
      return NextResponse.json(
        { error: "Invalid pitcherId parameter. Use an integer id." },
        { status: 400 }
      )
    }

    if (dateParam && !isValidDate(dateParam)) {
      return NextResponse.json(
        { error: "Invalid date parameter. Use YYYY-MM-DD." },
        { status: 400 }
      )
    }

    const dateKey = dateParam ?? "latest"
    const cacheKey = `mlb:bvp:pitcher:${pitcherId}:${dateKey}`
    const cached = getFromCache<unknown>(cacheKey)
    const ttlSeconds = getCacheTTLSeconds()

    if (cached) {
      logger.info("MLB BVP pitcher cache hit", { pitcherId, date: dateKey })
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=300`,
        },
      })
    }

    logger.info("MLB BVP pitcher cache miss", { pitcherId, date: dateKey })
    const startTime = Date.now()
    const rows = await queryMlbBigQuery<Record<string, unknown>>(
      dateParam ? PITCHER_QUERY_BY_DATE : PITCHER_QUERY_LATEST,
      dateParam
        ? { pitcherId: Number(pitcherId), game_date: dateParam }
        : { pitcherId: Number(pitcherId) }
    )
    const durationMs = Date.now() - startTime
    logger.info("MLB BVP pitcher query complete", {
      pitcherId,
      date: dateKey,
      durationMs,
    })

    const row = rows[0]
    if (!row) {
      return NextResponse.json(
        { error: "No pitcher payload found for that id/date." },
        { status: 404 }
      )
    }

    setCache(cacheKey, row, ttlSeconds)
    return NextResponse.json(row, {
      headers: {
        "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=300`,
      },
    })
  } catch (error) {
    logger.error("MLB BVP pitcher API failed", error)
    return NextResponse.json(
      { error: "Failed to load MLB pitcher payload." },
      { status: 500 }
    )
  }
}

