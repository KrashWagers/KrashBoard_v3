import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPlayerGamelogsPage() {
  return (
    <MlbPageShell
      title="Player Gamelogs"
      description="Player game logs with split and trend analysis."
      sections={[
        { title: "Player Log Table", description: "Game-by-game performance data." },
        { title: "Split Filters", description: "Pitcher/batter and venue filters." },
        { title: "Recent Trends", description: "Rolling averages and streaks." },
      ]}
    />
  )
}
