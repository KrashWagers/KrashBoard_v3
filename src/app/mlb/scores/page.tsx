import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbScoresPage() {
  return (
    <MlbPageShell
      title="MLB Scores"
      description="Daily slate, live scoring, and quick game context."
      sections={[
        { title: "Scoreboard", description: "Live game tiles with inning and status." },
        { title: "Filters", description: "Date, team, and status filtering controls." },
        { title: "Game Insights", description: "Key notes and highlights for each matchup." },
      ]}
    />
  )
}
