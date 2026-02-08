import { NextRequest, NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { CACHE_TTL_24H_SECONDS, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"
import type { BvpDetailsResponse, BvpPaDetail, BvpSummaryRow } from "@/lib/mlb/bvp-types"

export const runtime = "nodejs"

const BVP_CACHE_TTL = CACHE_TTL_24H_SECONDS
const TABLE = "`mlb26-485401.batter_vs_pitcher.bvp_payload_v1`"

const TEAM_ABBR_TO_LOGO: Record<string, string> = {
  KC: "KCR", SD: "SDP", SF: "SFG", TB: "TBR", WSH: "WSN", WAS: "WSN", WA: "WSN",
}
function toLogoPath(teamAbbr: string | null | undefined): string {
  if (!teamAbbr) return ""
  const u = String(teamAbbr).toUpperCase().trim()
  const logoAbbr = TEAM_ABBR_TO_LOGO[u] ?? u
  return `/Images/MLB_Logos/${logoAbbr}.png`
}

/** Raw BQ row: pa_details is REPEATED RECORD, dates may be object with .value */
type BqPayloadRow = {
  matchup_game_date?: { value?: string } | string
  matchup_gameID?: string
  batter_team?: string
  pitcher_team?: string
  batter?: number
  batter_name?: string
  pitcher?: number
  pitcher_name?: string
  pitcher_position_group?: string
  expected_starter_id?: number | null
  is_vs_expected_starter?: number
  is_vs_relief_pitcher?: number
  pa?: number
  ab?: number
  h?: number
  singles?: number
  doubles?: number
  triples?: number
  hr?: number
  bb?: number
  hbp?: number
  so?: number
  roe?: number
  gidp?: number
  sf?: number
  tb?: number
  avg?: number | null
  obp?: number | null
  slg?: number | null
  ops?: number | null
  pa_details?: RawPaDetail[]
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

function toSummaryRow(row: BqPayloadRow, matchupGameId: string, _matchupGameDate: string): BvpSummaryRow {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matchupGameID = searchParams.get("matchup_gameID")?.trim()
    const batterParam = searchParams.get("batter")?.trim()
    const pitcherParam = searchParams.get("pitcher")?.trim()

    if (!matchupGameID || !/^[\d]{8}_[A-Z0-9]+@[A-Z0-9]+$/i.test(matchupGameID)) {
      return NextResponse.json(
        { error: "Invalid or missing matchup_gameID. Use format YYYYMMDD_AWAY@HOME." },
        { status: 400 }
      )
    }
    const batter = batterParam ? parseInt(batterParam, 10) : NaN
    const pitcher = pitcherParam ? parseInt(pitcherParam, 10) : NaN
    if (!Number.isInteger(batter) || !Number.isInteger(pitcher)) {
      return NextResponse.json(
        { error: "Invalid or missing batter or pitcher. Use integer IDs." },
        { status: 400 }
      )
    }

    const cacheKey = `bvp:details:${matchupGameID}:${batter}:${pitcher}`
    const cached = getFromCache<BvpDetailsResponse>(cacheKey)
    if (cached) {
      logger.info("BvP details cache hit", { matchup_gameID: matchupGameID, batter, pitcher })
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
        },
      })
    }

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
        avg, obp, slg, ops,
        pa_details
      FROM ${TABLE}
      WHERE matchup_gameID = @matchup_gameID
        AND batter = @batter
        AND pitcher = @pitcher
      LIMIT 1
    `

    const rows = await queryMlbBigQuery<BqPayloadRow>(query, {
      matchup_gameID: matchupGameID,
      batter,
      pitcher,
    })

    const row = rows[0]
    if (!row) {
      return NextResponse.json(
        { error: "No BvP payload found for that matchup/batter/pitcher." },
        { status: 404 }
      )
    }

    const matchupGameDate = normalizeDate(row.matchup_game_date)
    const summary = toSummaryRow(row, matchupGameID, matchupGameDate)
    const pa_details: BvpPaDetail[] = Array.isArray(row.pa_details)
      ? row.pa_details.map(normalizePaDetail)
      : []

    const response: BvpDetailsResponse = {
      matchup_gameID,
      batter,
      pitcher,
      summary,
      pa_details,
    }

    setCache(cacheKey, response, BVP_CACHE_TTL)
    logger.info("BvP details query complete", { matchup_gameID: matchupGameID, batter, pitcher, paCount: pa_details.length })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, s-maxage=${BVP_CACHE_TTL}, stale-while-revalidate=300`,
      },
    })
  } catch (error) {
    logger.error("BvP details API failed", error)
    return NextResponse.json(
      { error: "Failed to load BvP details." },
      { status: 500 }
    )
  }
}
