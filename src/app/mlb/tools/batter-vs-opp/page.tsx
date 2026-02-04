import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbBatterVsOppPage() {
  return (
    <MlbPageShell
      title="Batter vs Opponent"
      description="Split hitter performance by opponent, venue, and handedness."
      sections={[
        { title: "Opponent Splits", description: "Team-level matchup splits." },
        { title: "Handedness", description: "Performance vs LHP/RHP." },
        { title: "Venue Context", description: "Home/away and park factor notes." },
      ]}
    />
  )
}
