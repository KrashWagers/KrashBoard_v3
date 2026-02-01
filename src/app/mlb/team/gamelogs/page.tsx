import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbTeamGamelogsPage() {
  return (
    <MlbPageShell
      title="Team Gamelogs"
      description="Team-level game log tracking and splits."
      sections={[
        { title: "Game Log Table", description: "Results, scores, and context." },
        { title: "Split Filters", description: "Home/away and opponent filters." },
        { title: "Trend Cards", description: "Recent form and scoring trends." },
      ]}
    />
  )
}
