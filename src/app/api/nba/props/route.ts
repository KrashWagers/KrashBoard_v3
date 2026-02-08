import { NextRequest, NextResponse } from "next/server"
import { queryNbaBigQuery } from "@/lib/bigquery"
import { getFromCache, setCache, CACHE_KEYS } from "@/lib/cache"
import { transformNbaPlayerProps } from "@/lib/nba/transform-props"
import type { NbaPlayerPropsRawRow } from "@/lib/nba/types"
import type { NbaPropsApiResponse } from "@/lib/nba/types"

const TABLE = "`nba25-475715.webapp.nba_player_props_long_v1`"
const QUERY = `
  SELECT *
  FROM ${TABLE}
  WHERE available = TRUE
    AND event_date BETWEEN @start_date AND @end_date
    AND bet_type_id IN ('ou', 'yn')
  ORDER BY event_date, start_time_utc, player_name, stat_id, line, side_id, bookmaker_id
`

function getStartEndDates(): { start_date: string; end_date: string } {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 1)
  const end = new Date(now)
  end.setDate(end.getDate() + 7)
  return {
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  }
}

const TTL_SECONDS = Math.max(
  1,
  parseInt(process.env.PROPS_CACHE_TTL_SECONDS ?? "45", 10) || 45
)
const CACHE_CONTROL = "s-maxage=45, stale-while-revalidate=60"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const refresh = searchParams.get("refresh") === "1"
  const start_date =
    searchParams.get("start_date") ?? getStartEndDates().start_date
  const end_date =
    searchParams.get("end_date") ?? getStartEndDates().end_date

  const cacheKey = `${CACHE_KEYS.NBA_PROPS}:${start_date}:${end_date}`

  if (!refresh) {
    const cached = getFromCache<NbaPropsApiResponse>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": CACHE_CONTROL },
      })
    }
  }

  const generated_at_utc = new Date().toISOString()
  const rows = await queryNbaBigQuery<NbaPlayerPropsRawRow>(QUERY, {
    start_date,
    end_date,
  })

  const { propGroups, flatSelections } = transformNbaPlayerProps(rows)

  const response: NbaPropsApiResponse = {
    meta: {
      generated_at_utc,
      cache_hit: false,
      start_date,
      end_date,
      row_count_raw: rows.length,
      prop_group_count: Object.keys(propGroups).length,
      selection_count: flatSelections.length,
      ttl_seconds: TTL_SECONDS,
    },
    data: { propGroups, flatSelections },
  }

  setCache(cacheKey, response, TTL_SECONDS)

  return NextResponse.json(response, {
    headers: { "Cache-Control": CACHE_CONTROL },
  })
}
