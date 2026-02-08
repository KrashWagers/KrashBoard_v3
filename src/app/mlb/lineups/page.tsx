import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"
import {
  LineupsMatchupCard,
  type MlbLineupsGame,
} from "@/components/mlb/lineups/LineupsMatchupCard"
import type { DefaultLineupSlot } from "@/app/api/mlb/default-lineups/route"

type MlbLineupsResponse = {
  updatedAt: string
  games: MlbLineupsGame[]
}

type DefaultLineupsResponse = {
  updatedAt: string
  teams: { team: string; lineup: DefaultLineupSlot[] }[]
}

async function getLineupsData(): Promise<MlbLineupsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const response = await fetch(new URL("/api/mlb/lineups", baseUrl), {
    next: { revalidate: 1800 },
  })

  if (!response.ok) {
    return { updatedAt: new Date().toISOString(), games: [] }
  }

  return response.json()
}

async function getDefaultLineupsByTeam(): Promise<Record<string, DefaultLineupSlot[]>> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const response = await fetch(new URL("/api/mlb/default-lineups", baseUrl), {
    next: { revalidate: 86400 },
  })

  if (!response.ok) {
    return {}
  }

  const data: DefaultLineupsResponse = await response.json()
  const byTeam: Record<string, DefaultLineupSlot[]> = {}
  for (const t of data.teams ?? []) {
    const abbr = t.team?.trim().toUpperCase()
    if (abbr && Array.isArray(t.lineup)) {
      byTeam[abbr] = t.lineup
    }
  }
  return byTeam
}

export default async function MlbLineupsPage() {
  const [{ updatedAt, games }, defaultLineupsByTeam] = await Promise.all([
    getLineupsData(),
    getDefaultLineupsByTeam(),
  ])
  const grouped = games.reduce<Record<string, MlbLineupsGame[]>>((acc, game) => {
    const label = game.gameDateLabel ?? game.gameDate ?? "TBD"
    if (!acc[label]) acc[label] = []
    acc[label].push(game)
    return acc
  }, {})

  const groupLabels = Object.keys(grouped)

  return (
    <MlbPageShell
      title="MLB Lineups"
      description="Upcoming matchups with projected starters and lineup placeholders."
    >
      <div className="space-y-8">
        {groupLabels.length === 0 ? (
          <Card className="rounded-md border border-gray-700 bg-[#171717] shadow-none">
            <CardContent className="px-4 py-6 text-sm text-white/70">
              No upcoming MLB games available yet.
            </CardContent>
          </Card>
        ) : (
          groupLabels.map((label) => (
            <section key={label} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="mlb-section-title text-lg font-semibold tracking-tight text-white/90">
                  {label}
                </h2>
                <span className="text-xs text-white/55">
                  {grouped[label].length} games · Updated{" "}
                  {new Date(updatedAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {grouped[label].map((game) => (
                  <LineupsMatchupCard
                    key={game.gameId}
                    game={game}
                    defaultLineupsByTeam={defaultLineupsByTeam}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </MlbPageShell>
  )
}
