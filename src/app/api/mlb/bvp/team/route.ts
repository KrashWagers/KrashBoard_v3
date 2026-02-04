import { NextRequest, NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { CACHE_TTL_24H_SECONDS, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"
/** BVP data updates once per day; cache 24h so all users share one DB hit per team/date */
const BVP_CACHE_TTL_SECONDS = CACHE_TTL_24H_SECONDS

const TEAM_QUERY = `
  SELECT *
  FROM \`mlb26-485401.vs_pitch_type.payload_bvp_team_v1\`
  WHERE batter_team = @team
    AND game_date = @game_date
  LIMIT 1;
`

const isValidTeam = (value: string) => /^[A-Z]{2,3}$/.test(value)
const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamParam = searchParams.get("team")?.trim().toUpperCase() ?? ""
    const dateParam = searchParams.get("date")?.trim() ?? ""

    if (!isValidTeam(teamParam)) {
      return NextResponse.json(
        { error: "Invalid team parameter. Use 2-3 letter team code." },
        { status: 400 }
      )
    }

    if (!isValidDate(dateParam)) {
      return NextResponse.json(
        { error: "Invalid date parameter. Use YYYY-MM-DD." },
        { status: 400 }
      )
    }

    const cacheKey = `mlb:bvp:team:${teamParam}:${dateParam}`
    const cached = getFromCache<unknown>(cacheKey)

    if (cached) {
      logger.info("MLB BVP team cache hit", { team: teamParam, date: dateParam })
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL_SECONDS}, stale-while-revalidate=300`,
        },
      })
    }

    logger.info("MLB BVP team cache miss", { team: teamParam, date: dateParam })
    const startTime = Date.now()
    const rows = await queryMlbBigQuery<Record<string, unknown>>(TEAM_QUERY, {
      team: teamParam,
      game_date: dateParam,
    })
    const durationMs = Date.now() - startTime
    logger.info("MLB BVP team query complete", {
      team: teamParam,
      date: dateParam,
      durationMs,
    })

    const row = rows[0]
    if (!row) {
      return NextResponse.json(
        { error: "No team payload found for that team/date." },
        { status: 404 }
      )
    }

    setCache(cacheKey, row, BVP_CACHE_TTL_SECONDS)
    return NextResponse.json(row, {
      headers: {
        "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL_SECONDS}, stale-while-revalidate=300`,
      },
    })
  } catch (error) {
    logger.error("MLB BVP team API failed", error)
    return NextResponse.json(
      { error: "Failed to load MLB team payload." },
      { status: 500 }
    )
  }
}

