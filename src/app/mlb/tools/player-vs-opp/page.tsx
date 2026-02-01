import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPlayerVsOppPage() {
  return (
    <MlbPageShell
      title="Player vs Opponent"
      description="Matchup history and opponent splits for MLB players."
      sections={[
        { title: "Opponent Splits", description: "Split performance by opponent." },
        { title: "Matchup Context", description: "Pitcher/batter interactions." },
        { title: "Recent History", description: "Last 10-20 games vs opponent." },
      ]}
    />
  )
}
