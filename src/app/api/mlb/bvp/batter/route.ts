import { NextRequest, NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { getCacheTTLSeconds, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

const BATTER_QUERY_BY_DATE = `
  SELECT *
  FROM \`mlb26-485401.vs_pitch_type.payload_bvp_batter_v1\`
  WHERE batter = @batterId
    AND game_date = @game_date
  LIMIT 1;
`

const BATTER_QUERY_LATEST = `
  SELECT *
  FROM \`mlb26-485401.vs_pitch_type.payload_bvp_batter_v1\`
  WHERE batter = @batterId
  ORDER BY game_date DESC
  LIMIT 1;
`

const isValidId = (value: string) => /^\d+$/.test(value)
const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const batterId = searchParams.get("batterId")?.trim() ?? ""
    const dateParam = searchParams.get("date")?.trim()

    if (!isValidId(batterId)) {
      return NextResponse.json(
        { error: "Invalid batterId parameter. Use an integer id." },
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
    const cacheKey = `mlb:bvp:batter:${batterId}:${dateKey}`
    const cached = getFromCache<unknown>(cacheKey)
    const ttlSeconds = getCacheTTLSeconds()

    if (cached) {
      logger.info("MLB BVP batter cache hit", { batterId, date: dateKey })
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=300`,
        },
      })
    }

    logger.info("MLB BVP batter cache miss", { batterId, date: dateKey })
    const startTime = Date.now()
    const rows = await queryMlbBigQuery<Record<string, unknown>>(
      dateParam ? BATTER_QUERY_BY_DATE : BATTER_QUERY_LATEST,
      dateParam
        ? { batterId: Number(batterId), game_date: dateParam }
        : { batterId: Number(batterId) }
    )
    const durationMs = Date.now() - startTime
    logger.info("MLB BVP batter query complete", {
      batterId,
      date: dateKey,
      durationMs,
    })

    const row = rows[0]
    if (!row) {
      return NextResponse.json(
        { error: "No batter payload found for that id/date." },
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
    logger.error("MLB BVP batter API failed", error)
    return NextResponse.json(
      { error: "Failed to load MLB batter payload." },
      { status: 500 }
    )
  }
}

