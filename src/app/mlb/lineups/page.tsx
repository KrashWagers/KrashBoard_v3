import * as React from "react"
import { MlbCard, MlbCardContent } from "@/components/mlb/mlb-card"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"
import {
  LineupsMatchupCard,
  type MlbLineupsGame,
} from "@/components/mlb/lineups/LineupsMatchupCard"

type MlbLineupsResponse = {
  updatedAt: string
  games: MlbLineupsGame[]
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

export default async function MlbLineupsPage() {
  const { updatedAt, games } = await getLineupsData()
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
          <MlbCard>
            <MlbCardContent className="px-4 py-6 text-sm text-white/70">
              No upcoming MLB games available yet.
            </MlbCardContent>
          </MlbCard>
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
                  <LineupsMatchupCard key={game.gameId} game={game} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </MlbPageShell>
  )
}
