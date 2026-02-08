import { NextRequest, NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { CACHE_TTL_24H_SECONDS, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import type { BvpPaDetail, BvpPaPayloadItem, BvpPaPayloadResponse } from "@/lib/mlb/bvp-types"

export const runtime = "nodejs"

const BVP_CACHE_TTL = CACHE_TTL_24H_SECONDS
const TABLE = "`mlb26-485401.batter_vs_pitcher.bvp_payload_v1`"

/** Same filters as matchup API for cache key */
function hashFilters(params: {
  matchup_gameID?: string
  starterOnly?: string
  relieversOnly?: string
  minPA?: string
  search?: string
  limit?: string
}): string {
  const parts = [
    params.matchup_gameID ?? "",
    params.starterOnly ?? "",
    params.relieversOnly ?? "",
    params.minPA ?? "",
    (params.search ?? "").trim().toLowerCase(),
    params.limit ?? "500",
  ]
  return parts.join("|")
}

/** Raw BQ row: pa_details is REPEATED RECORD */
type BqPayloadRow = {
  matchup_gameID?: string
  batter?: number
  pitcher?: number
  pa_details?: RawPaDetail[] | unknown
}

type RawPaDetail = {
  pa_game_date?: { value?: string } | string
  pa_game_pk?: number
  inning?: number
  inning_topbot?: string
  outs_when_up?: number
  at_bat_number?: number
  pa_pitch_count?: number
  pa_balls?: number
  pa_strikes?: number
  pa_swings?: number
  pa_whiffs?: number
  pa_contacts?: number
  pa_fouls?: number
  pa_balls_in_play?: number
  pa_bip_flag?: number
  pa_hits?: number
  pa_hrs?: number
  pa_end_events?: string
  pa_end_description?: string
  home_team?: string
  away_team?: string
  game_year?: number
  game_type?: string
}

function normalizeDate(value: { value?: string } | string | undefined): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value && "value" in value && value.value) return String(value.value)
  return String(value)
}

function normalizePaDetail(raw: RawPaDetail): BvpPaDetail {
  return {
    pa_game_date: normalizeDate(raw.pa_game_date),
    pa_game_pk: Number(raw.pa_game_pk ?? 0),
    inning: Number(raw.inning ?? 0),
    inning_topbot: String(raw.inning_topbot ?? ""),
    outs_when_up: Number(raw.outs_when_up ?? 0),
    at_bat_number: Number(raw.at_bat_number ?? 0),
    pa_pitch_count: Number(raw.pa_pitch_count ?? 0),
    pa_balls: Number(raw.pa_balls ?? 0),
    pa_strikes: Number(raw.pa_strikes ?? 0),
    pa_swings: Number(raw.pa_swings ?? 0),
    pa_whiffs: Number(raw.pa_whiffs ?? 0),
    pa_contacts: Number(raw.pa_contacts ?? 0),
    pa_fouls: Number(raw.pa_fouls ?? 0),
    pa_balls_in_play: Number(raw.pa_balls_in_play ?? 0),
    pa_bip_flag: Number(raw.pa_bip_flag ?? 0),
    pa_hits: Number(raw.pa_hits ?? 0),
    pa_hrs: Number(raw.pa_hrs ?? 0),
    pa_end_events: String(raw.pa_end_events ?? ""),
    pa_end_description: String(raw.pa_end_description ?? ""),
    home_team: String(raw.home_team ?? ""),
    away_team: String(raw.away_team ?? ""),
    game_year: Number(raw.game_year ?? 0),
    game_type: String(raw.game_type ?? ""),
  }
}

function parsePaDetails(pa_details: unknown): BvpPaDetail[] {
  if (!Array.isArray(pa_details)) return []
  return pa_details.map((raw) => normalizePaDetail(raw as RawPaDetail))
}

/** GET /api/mlb/bvp/pa-payload — bulk PA data, same filters as summary, 24h cache */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchupParam = searchParams.get("matchup_gameID")?.trim()
    const allMatchups = !matchupParam || matchupParam === "" || matchupParam.toLowerCase() === "all"
    const matchupGameID = allMatchups ? "" : matchupParam!
    const starterOnly = searchParams.get("starterOnly")
    const relieversOnly = searchParams.get("relieversOnly")
    const minPA = searchParams.get("minPA")
    const search = searchParams.get("search")?.trim()
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "500", 10) || 500))

    if (!allMatchups && !/^[\d]{8}_[A-Z0-9]+@[A-Z0-9]+$/i.test(matchupGameID)) {
      return NextResponse.json(
        { error: "Invalid matchup_gameID. Use format YYYYMMDD_AWAY@HOME or omit for all." },
        { status: 400 }
      )
    }

    const cacheKey = `bvp:pa-payload:${matchupGameID || "all"}:${hashFilters({
      matchup_gameID: matchupGameID || undefined,
      starterOnly: starterOnly ?? undefined,
      relieversOnly: relieversOnly ?? undefined,
      minPA: minPA ?? undefined,
      search: search ?? undefined,
      limit: String(limit),
    })}`

    const cached = getFromCache<BvpPaPayloadResponse>(cacheKey)
    if (cached) {
      logger.info("BvP pa-payload cache hit", { matchup_gameID: matchupGameID })
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
        },
      })
    }

    const conditions: string[] = allMatchups ? [] : ["matchup_gameID = @matchup_gameID"]
    const params: Record<string, unknown> = { limit }
    if (!allMatchups) {
      params.matchup_gameID = matchupGameID
    }
    if (starterOnly === "true") {
      conditions.push("is_vs_expected_starter = 1")
    }
    if (relieversOnly === "true") {
      conditions.push("(pitcher_position_group = 'RP' OR is_vs_relief_pitcher = 1)")
    }
    if (minPA != null && minPA !== "") {
      const n = parseInt(minPA, 10)
      if (!isNaN(n) && n >= 0) {
        conditions.push("pa >= @minPA")
        params.minPA = n
      }
    }
    if (search && search.length > 0 && search.length <= 100) {
      conditions.push("(LOWER(CAST(batter_name AS STRING)) LIKE @search OR LOWER(CAST(pitcher_name AS STRING)) LIKE @search)")
      params.search = `%${search.toLowerCase()}%`
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    const query = `
      SELECT matchup_gameID, batter, pitcher, pa_details
      FROM ${TABLE}
      ${whereClause}
      ORDER BY pa DESC NULLS LAST
      LIMIT @limit
    `

    const rows = await queryMlbBigQuery<BqPayloadRow>(query, params as Record<string, any>)

    const payloads: BvpPaPayloadItem[] = rows.map((r) => ({
      matchup_gameID: String(r.matchup_gameID ?? ""),
      batter: Number(r.batter ?? 0),
      pitcher: Number(r.pitcher ?? 0),
      pa_details: parsePaDetails(r.pa_details),
    }))

    const response: BvpPaPayloadResponse = { payloads }

    setCache(cacheKey, response, BVP_CACHE_TTL)
    logger.info("BvP pa-payload query complete", {
      matchup_gameID: matchupGameID,
      rowCount: payloads.length,
      totalPa: payloads.reduce((s, p) => s + p.pa_details.length, 0),
    })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
      },
    })
  } catch (error) {
    logger.error("BvP pa-payload API failed", error)
    return NextResponse.json(
      { error: "Failed to load BvP plate appearance payload." },
      { status: 500 }
    )
  }
}

