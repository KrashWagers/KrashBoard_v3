import { NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { CACHE_TTL_24H_SECONDS, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import type { BvpMatchupsListResponse } from "@/lib/mlb/bvp-types"

export const runtime = "nodejs"

const BVP_CACHE_TTL = CACHE_TTL_24H_SECONDS
const TABLE = "`mlb26-485401.batter_vs_pitcher.bvp_summary_v1`"

type BqMatchupRow = {
  matchup_gameID?: string
  matchup_game_date?: { value?: string } | string
}

function normalizeDate(value: BqMatchupRow["matchup_game_date"]): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value && "value" in value && value.value) return String(value.value)
  return String(value)
}

/** GET /api/mlb/bvp/matchups — list recent matchup_gameIDs for the page selector */
export async function GET() {
  try {
    const cacheKey = "bvp:matchups:list"
    const cached = getFromCache<BvpMatchupsListResponse>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
        },
      })
    }

    const query = `
      SELECT DISTINCT matchup_gameID, matchup_game_date
      FROM ${TABLE}
      WHERE matchup_gameID IS NOT NULL
      ORDER BY matchup_game_date DESC
      LIMIT 100
    `

    const rows = await queryMlbBigQuery<BqMatchupRow>(query)
    const matchups = rows.map((r) => ({
      matchup_gameID: String(r.matchup_gameID ?? ""),
      matchup_game_date: normalizeDate(r.matchup_game_date),
    })).filter((m) => m.matchup_gameID)

    const response: BvpMatchupsListResponse = { matchups }
    setCache(cacheKey, response, BVP_CACHE_TTL)
    logger.info("BvP matchups list query complete", { count: matchups.length })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
      },
    })
  } catch (error) {
    logger.error("BvP matchups list API failed", error)
    return NextResponse.json(
      { error: "Failed to load BvP matchups list." },
      { status: 500 }
    )
  }
}
