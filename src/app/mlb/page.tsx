import * as React from "react"
import { MlbPageShell, MlbSectionBlock, MlbSectionItem } from "@/components/mlb/mlb-page-shell"

const corePages: MlbSectionItem[] = [
  { title: "Scores", description: "Live scoreboard and daily slate overview." },
  { title: "Lineups", description: "Projected and confirmed lineups with notes." },
  { title: "Weather Report", description: "Ballpark conditions and delay risk." },
  { title: "Prop Lab", description: "Player prop research and hit-rate tracking." },
  { title: "Market", description: "Odds movement and price context." },
]

const toolPages: MlbSectionItem[] = [
  { title: "Player vs Opp", description: "Matchup history and split performance." },
  { title: "Barrel Boys", description: "Hard-hit and barrel trend hub." },
  { title: "Pitcher Report", description: "Pitch mix, form, and matchup context." },
  { title: "Calculators", description: "Access the global betting calculators suite." },
]

const teamPages: MlbSectionItem[] = [
  { title: "Team Gamelogs", description: "Game-by-game performance tracking." },
  { title: "Team Rankings", description: "League-wide ranking and splits." },
]

const playerPages: MlbSectionItem[] = [
  { title: "Player Gamelogs", description: "Full log with splits and trends." },
  { title: "Player Rankings", description: "Sortable leaderboards by metric." },
  { title: "Player Percentiles", description: "Percentile charts and distribution." },
]

export default function MlbHomePage() {
  return (
    <MlbPageShell
      title="MLB Home"
      description="MLB analytics workspace with mobile-first, professional layout placeholders."
    >
      <MlbSectionBlock
        title="Core Pages"
        description="Primary MLB workflows for daily research."
        items={corePages}
      />
      <MlbSectionBlock
        title="Tools"
        description="Specialized MLB analysis tools."
        items={toolPages}
      />
      <MlbSectionBlock
        title="Team"
        description="Team-level performance and ranking hubs."
        items={teamPages}
      />
      <MlbSectionBlock
        title="Player"
        description="Player-level research and percentile insights."
        items={playerPages}
      />
    </MlbPageShell>
  )
}
