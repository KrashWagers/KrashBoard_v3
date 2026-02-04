import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { queryMlbBigQuery } from "@/lib/bigquery"

export const runtime = "nodejs"
export const revalidate = 1800

const TABLE_NAME = "mlb26-485401.gold.next_games_expected_starters"

type MlbLineupsRow = {
  teamAbv: string | null
  opponentAbv: string | null
  is_home: boolean | string | number | null
  team_logo: string | null
  opponent_logo: string | null
  game_date: { value?: string } | string | null
  game_date_label: string | null
  gameID: string | null
  game_time_est: string | null
  expected_starter_name: string | null
  mlbHeadshot: string | null
  espnHeadshot: string | null
}

type TeamSide = {
  teamAbv: string
  teamLogo: string | null
  expectedStarterName: string | null
  headshotUrl: string | null
}

type MlbLineupsGame = {
  gameId: string
  gameDate: string | null
  gameDateLabel: string | null
  gameTimeEst: string | null
  homeTeam: TeamSide | null
  awayTeam: TeamSide | null
}

function normalizeDate(value: MlbLineupsRow["game_date"]): string | null {
  if (!value) return null
  if (typeof value === "string") return value
  if (typeof value === "object" && "value" in value && value.value) return value.value
  return String(value)
}

function normalizeIsHome(value: MlbLineupsRow["is_home"]): boolean {
  if (value === true) return true
  if (value === false) return false
  if (typeof value === "number") return value === 1
  if (typeof value === "string") return value.toLowerCase() === "true"
  return false
}

export async function GET() {
  try {
    logger.info("MLB lineups query start", { table: TABLE_NAME })

    const query = `
      SELECT
        teamAbv,
        opponentAbv,
        is_home,
        team_logo,
        opponent_logo,
        game_date,
        game_date_label,
        gameID,
        game_time_est,
        expected_starter_name,
        mlbHeadshot,
        espnHeadshot
      FROM \`${TABLE_NAME}\`
      ORDER BY game_date, game_time_est, gameID
    `

    const rows = await queryMlbBigQuery<MlbLineupsRow>(query)
    logger.info("MLB lineups query complete", { rowCount: rows.length })
    logger.debug("MLB lineups sample row", rows[0] ?? null)
    logger.debug(
      "MLB lineups sample keys",
      rows.slice(0, 3).map((row) => ({
        gameID: row.gameID,
        is_home: row.is_home,
        teamAbv: row.teamAbv,
        opponentAbv: row.opponentAbv,
      }))
    )

    const gamesMap = new Map<string, MlbLineupsGame>()

    rows.forEach((row) => {
      const gameDate = normalizeDate(row.game_date)
      const gameId =
        row.gameID?.toString() ||
        `${gameDate ?? "unknown"}-${row.teamAbv ?? "TBD"}-${row.opponentAbv ?? "TBD"}`

      const game = gamesMap.get(gameId) ?? {
        gameId,
        gameDate,
        gameDateLabel: row.game_date_label ?? null,
        gameTimeEst: row.game_time_est ?? null,
        homeTeam: null,
        awayTeam: null,
      }

      const teamSide: TeamSide = {
        teamAbv: row.teamAbv ?? "TBD",
        teamLogo: row.team_logo ?? row.opponent_logo ?? null,
        expectedStarterName: row.expected_starter_name ?? null,
        headshotUrl: row.mlbHeadshot ?? row.espnHeadshot ?? null,
      }

      if (normalizeIsHome(row.is_home)) {
        game.homeTeam = teamSide
      } else {
        game.awayTeam = teamSide
      }

      gamesMap.set(gameId, game)
    })

    const games = Array.from(gamesMap.values())
      .map((game) => {
        if (!game.homeTeam && game.awayTeam) {
          return { ...game, homeTeam: game.awayTeam, awayTeam: null }
        }
        if (!game.awayTeam && game.homeTeam) {
          return { ...game, awayTeam: game.homeTeam, homeTeam: null }
        }
        return game
      })
      .sort((a, b) => {
        const dateCompare = (a.gameDate ?? "").localeCompare(b.gameDate ?? "")
        if (dateCompare !== 0) return dateCompare
        return (a.gameTimeEst ?? "").localeCompare(b.gameTimeEst ?? "")
      })

    logger.info("MLB lineups grouped", { games: games.length })

    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        games,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=300",
        },
      }
    )
  } catch (error) {
    logger.error("MLB lineups API failed", error)
    return NextResponse.json(
      { error: "Failed to load MLB lineups." },
      { status: 500 }
    )
  }
}
