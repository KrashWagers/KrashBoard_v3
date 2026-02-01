import { NextRequest, NextResponse } from "next/server"
import { queryNhlBigQuery } from "@/lib/bigquery"
import { logger } from "@/lib/logger"
import { nhlPlayersFilterSchema } from "@/lib/validations"

type NhlPlayerRow = {
  player_id: number | string | null
  player_name: string | null
  player_team_abbrev: string | null
  headshot_url: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const validated = nhlPlayersFilterSchema.parse({
      team: searchParams.get("team") || undefined,
      search: searchParams.get("search") || undefined,
    })

    const whereConditions: string[] = []
    const params: Record<string, string> = {}

    if (validated.team) {
      whereConditions.push("LOWER(player_team_abbrev) = LOWER(@team)")
      params.team = validated.team.trim()
    }

    if (validated.search) {
      whereConditions.push("LOWER(player_name) LIKE LOWER(@search)")
      params.search = `%${validated.search.trim()}%`
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    const query = `
      SELECT
        player_id,
        player_name,
        player_team_abbrev,
        headshot_url
      FROM (
        SELECT
          player_id,
          player_name,
          player_team_abbrev,
          \`Headshot URL\` AS headshot_url,
          game_date,
          ROW_NUMBER() OVER (
            PARTITION BY player_id
            ORDER BY game_date DESC
          ) AS rn
        FROM \`nhl25-473523.gold.player_gamelogs_all_vw\`
        ${whereClause}
      )
      WHERE rn = 1
      ORDER BY player_name
      LIMIT 250
    `

    const players = await queryNhlBigQuery<NhlPlayerRow>(query, params)

    if (process.env.NODE_ENV !== "production") {
      logger.debug("NHL player search", {
        search: validated.search ?? null,
        team: validated.team ?? null,
        count: players.length,
        sample: players.slice(0, 5).map((player) => ({
          player_id: player.player_id,
          player_name: player.player_name,
          team: player.player_team_abbrev,
        })),
      })
    }

    return NextResponse.json({
      success: true,
      data: players,
      count: players.length,
    })
  } catch (error) {
    logger.error("Failed to fetch NHL players", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch players",
        message: "An error occurred while fetching players",
      },
      { status: 500 }
    )
  }
}
