import { NextResponse } from "next/server"
import { queryMlbBigQuery } from "@/lib/bigquery"
import { CACHE_TTL_24H_SECONDS, getFromCache, setCache } from "@/lib/cache"
import { logger } from "@/lib/logger"

export const runtime = "nodejs"

const TABLE_NAME = "mlb26-485401.gold.Default_Lineups"

/** Raw slot from BigQuery REPEATED RECORD (field names may be snake_case in response) */
type LineupSlotRow = {
  slot?: number | null
  playerId?: number | null
  playerName?: string | null
  player_id?: number | null
  player_name?: string | null
  assignment_type?: string | null
  primary_slot?: number | null
  primary_slot_starts?: number | null
  total_starts_100?: number | null
  depth_rank?: number | null
  position_group?: string | null
}

type DefaultLineupsRow = {
  team?: string | null
  depth_fetch_ts_utc?: string | null
  lineup?: LineupSlotRow[] | null
}

/** API response shape */
export type DefaultLineupSlot = {
  slot: number
  playerId: number | null
  playerName: string | null
  assignmentType: string | null
  primarySlot: number | null
  primarySlotStarts: number | null
  totalStarts100: number | null
  depthRank: number | null
  positionGroup: string | null
}

export type DefaultLineupTeam = {
  team: string
  depthFetchTsUtc: string | null
  lineup: DefaultLineupSlot[]
}

const CACHE_KEY = "mlb:default-lineups"

function normalizeSlot(raw: LineupSlotRow): DefaultLineupSlot {
  return {
    slot: typeof raw.slot === "number" ? raw.slot : 0,
    playerId: typeof raw.playerId === "number" ? raw.playerId : (typeof raw.player_id === "number" ? raw.player_id : null),
    playerName: typeof raw.playerName === "string" ? raw.playerName : (typeof raw.player_name === "string" ? raw.player_name : null),
    assignmentType: typeof raw.assignment_type === "string" ? raw.assignment_type : null,
    primarySlot: typeof raw.primary_slot === "number" ? raw.primary_slot : null,
    primarySlotStarts: typeof raw.primary_slot_starts === "number" ? raw.primary_slot_starts : null,
    totalStarts100: typeof raw.total_starts_100 === "number" ? raw.total_starts_100 : null,
    depthRank: typeof raw.depth_rank === "number" ? raw.depth_rank : null,
    positionGroup: typeof raw.position_group === "string" ? raw.position_group : null,
  }
}

function normalizeTeam(row: DefaultLineupsRow): DefaultLineupTeam {
  const team = typeof row.team === "string" ? row.team : "TBD"
  const rawLineup = Array.isArray(row.lineup) ? row.lineup : []
  const lineup = rawLineup
    .map((s) => normalizeSlot(s))
    .sort((a, b) => a.slot - b.slot)
  return {
    team,
    depthFetchTsUtc: typeof row.depth_fetch_ts_utc === "string" ? row.depth_fetch_ts_utc : null,
    lineup,
  }
}

export async function GET() {
  try {
    const cached = getFromCache<{ updatedAt: string; teams: DefaultLineupTeam[] }>(CACHE_KEY)
    if (cached) {
      logger.info("MLB default lineups cache hit")
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_TTL_24H_SECONDS}, stale-while-revalidate=300`,
        },
      })
    }

    logger.info("MLB default lineups cache miss, querying BigQuery", { table: TABLE_NAME })
    const query = `
      SELECT team, depth_fetch_ts_utc, lineup
      FROM \`${TABLE_NAME}\`
      ORDER BY team
    `
    const rows = await queryMlbBigQuery<DefaultLineupsRow>(query)
    logger.info("MLB default lineups query complete", { rowCount: rows.length })

    const teams = rows.map(normalizeTeam)
    const payload = {
      updatedAt: new Date().toISOString(),
      teams,
    }
    setCache(CACHE_KEY, payload, CACHE_TTL_24H_SECONDS)

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${CACHE_TTL_24H_SECONDS}, stale-while-revalidate=300`,
      },
    })
  } catch (error) {
    logger.error("MLB default lineups API failed", error)
    return NextResponse.json(
      { error: "Failed to load MLB default lineups." },
      { status: 500 }
    )
  }
}
