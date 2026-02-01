import { NextResponse } from "next/server"
import { getLatestTeamPayload, getLatestTeamPayloads, normalizeTeamAbbr } from "@/lib/nhl/teamPayload"

export const revalidate = 60 * 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const teamParam = searchParams.get("team")

  try {
    if (teamParam) {
      const normalizedTeam = normalizeTeamAbbr(teamParam)
      if (!normalizedTeam) {
        return NextResponse.json({ error: "Invalid team parameter" }, { status: 400 })
      }

      const payload = await getLatestTeamPayload(normalizedTeam)
      if (!payload) {
        return NextResponse.json({ error: "Team payload not found" }, { status: 404 })
      }
      return NextResponse.json(payload)
    }

    const payloads = await getLatestTeamPayloads()
    return NextResponse.json(payloads)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
