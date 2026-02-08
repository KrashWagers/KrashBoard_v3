import { NextRequest, NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { CACHE_TTL_24H_SECONDS, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import type { BvpMatchupResponse, BvpSummaryRow } from "@/lib/mlb/bvp-types"

export const runtime = "nodejs"

const BVP_CACHE_TTL = CACHE_TTL_24H_SECONDS
const TABLE = "`mlb26-485401.batter_vs_pitcher.bvp_summary_v1`"

/** Map team abbr to logo filename (same as PitchMatrix: public/Images/MLB_Logos/{ABBR}.png) */
const TEAM_ABBR_TO_LOGO: Record<string, string> = {
  KC: "KCR", SD: "SDP", SF: "SFG", TB: "TBR", WSH: "WSN", WAS: "WSN", WA: "WSN",
}
function toLogoPath(teamAbbr: string | null | undefined): string {
  if (!teamAbbr) return ""
  const u = teamAbbr.toUpperCase().trim()
  const logoAbbr = TEAM_ABBR_TO_LOGO[u] ?? u
  return `/Images/MLB_Logos/${logoAbbr}.png`
}

type SortKey = "ops" | "avg" | "hr" | "so" | "pa" | "h"
const SORT_COL: Record<SortKey, string> = {
  ops: "ops",
  avg: "avg",
  hr: "hr",
  so: "so",
  pa: "pa",
  h: "h",
}

/** Hash filter params for cache key */
function hashFilters(params: {
  matchup_gameID?: string
  starterOnly?: string
  relieversOnly?: string
  minPA?: string
  search?: string
  sort?: string
  sortDir?: string
  limit?: string
  offset?: string
}): string {
  const parts = [
    params.matchup_gameID ?? "",
    params.starterOnly ?? "",
    params.relieversOnly ?? "",
    params.minPA ?? "",
    (params.search ?? "").trim().toLowerCase(),
    params.sort ?? "h",
    params.sortDir ?? "desc",
    params.limit ?? "500",
    params.offset ?? "0",
  ]
  return parts.join("|")
}

/** Raw row from BQ (is_vs_* may come as 0/1) */
type BqSummaryRow = BvpSummaryRow & {
  matchup_game_date?: { value?: string } | string
  matchup_gameID?: string
  is_vs_expected_starter?: number | boolean
  is_vs_relief_pitcher?: number | boolean
}

function normalizeRow(
  row: BqSummaryRow,
  matchupGameId: string,
  _matchupGameDate: string
): BvpSummaryRow {
  const batterTeam = (row.batter_team ?? "").trim()
  const pitcherTeam = (row.pitcher_team ?? "").trim()
  return {
    matchup_gameID: matchupGameId,
    batter: Number(row.batter),
    batter_name: String(row.batter_name ?? ""),
    pitcher: Number(row.pitcher),
    pitcher_name: String(row.pitcher_name ?? ""),
    batter_team: batterTeam,
    pitcher_team: pitcherTeam,
    team_logo: toLogoPath(batterTeam),
    opponent_logo: toLogoPath(pitcherTeam),
    pitcher_position_group: String(row.pitcher_position_group ?? ""),
    expected_starter_id: row.expected_starter_id != null ? Number(row.expected_starter_id) : null,
    is_vs_expected_starter: Boolean(Number(row.is_vs_expected_starter ?? 0)),
    is_vs_relief_pitcher: Boolean(Number(row.is_vs_relief_pitcher ?? 0)),
    pa: Number(row.pa ?? 0),
    ab: Number(row.ab ?? 0),
    h: Number(row.h ?? 0),
    singles: Number(row.singles ?? 0),
    doubles: Number(row.doubles ?? 0),
    triples: Number(row.triples ?? 0),
    hr: Number(row.hr ?? 0),
    bb: Number(row.bb ?? 0),
    hbp: Number(row.hbp ?? 0),
    so: Number(row.so ?? 0),
    roe: Number(row.roe ?? 0),
    gidp: Number(row.gidp ?? 0),
    sf: Number(row.sf ?? 0),
    tb: Number(row.tb ?? 0),
    avg: row.avg != null ? Number(row.avg) : null,
    obp: row.obp != null ? Number(row.obp) : null,
    slg: row.slg != null ? Number(row.slg) : null,
    ops: row.ops != null ? Number(row.ops) : null,
  }
}

function normalizeDate(value: BqSummaryRow["matchup_game_date"]): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value && "value" in value && value.value) return String(value.value)
  return String(value)
}

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
    const sort = (searchParams.get("sort")?.toLowerCase() || "h") as SortKey
    const sortDir = (searchParams.get("sortDir")?.toLowerCase() || "desc") === "asc" ? "asc" : "desc"
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "500", 10) || 500))
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10) || 0)

    if (!allMatchups && !/^[\d]{8}_[A-Z0-9]+@[A-Z0-9]+$/i.test(matchupGameID)) {
      return NextResponse.json(
        { error: "Invalid matchup_gameID. Use format YYYYMMDD_AWAY@HOME or omit for all matchups." },
        { status: 400 }
      )
    }

    const sortCol = SORT_COL[sort] ?? "h"

    const cacheKey = `bvp:matchup:${matchupGameID || "all"}:filters:${hashFilters({
      matchup_gameID: matchupGameID || undefined,
      starterOnly: starterOnly ?? undefined,
      relieversOnly: relieversOnly ?? undefined,
      minPA: minPA ?? undefined,
      search: search ?? undefined,
      sort,
      sortDir,
      limit: String(limit),
      offset: String(offset),
    })}`

    const cached = getFromCache<BvpMatchupResponse>(cacheKey)
    if (cached) {
      logger.info("BvP matchup cache hit", { matchup_gameID: matchupGameID })
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
        },
      })
    }

    const conditions: string[] = allMatchups ? [] : ["matchup_gameID = @matchup_gameID"]
    const params: Record<string, unknown> = {
      limit,
      offset,
    }
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

    const orderBy =
      sortCol === "so"
        ? (sortDir === "asc" ? "so ASC NULLS LAST" : "so DESC NULLS LAST")
        : (sortDir === "asc" ? `${sortCol} ASC NULLS LAST` : `${sortCol} DESC NULLS LAST`)

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""
    const query = `
      SELECT
        matchup_game_date,
        matchup_gameID,
        batter_team,
        pitcher_team,
        batter,
        batter_name,
        pitcher,
        pitcher_name,
        pitcher_position_group,
        expected_starter_id,
        is_vs_expected_starter,
        is_vs_relief_pitcher,
        pa, ab, h, singles, doubles, triples, hr, bb, hbp, so, roe, gidp, sf, tb,
        avg, obp, slg, ops
      FROM ${TABLE}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT @limit OFFSET @offset
    `

    const rows = await queryMlbBigQuery<BqSummaryRow>(query, params as Record<string, any>)
    const matchupGameDate = allMatchups ? "" : (rows[0] ? normalizeDate(rows[0].matchup_game_date) : "")

    const response: BvpMatchupResponse = {
      matchup_gameID: matchupGameID,
      matchup_game_date: matchupGameDate,
      rows: rows.map((r) =>
        normalizeRow(r, (r.matchup_gameID as string) ?? matchupGameID, normalizeDate(r.matchup_game_date))
      ),
    }

    setCache(cacheKey, response, BVP_CACHE_TTL)
    logger.info("BvP matchup query complete", { matchup_gameID: matchupGameID, rowCount: response.rows.length })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
      },
    })
  } catch (error) {
    logger.error("BvP matchup API failed", error)
    return NextResponse.json(
      { error: "Failed to load BvP matchup summary." },
      { status: 500 }
    )
  }
}
