import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbTeamRankingsPage() {
  return (
    <MlbPageShell
      title="Team Rankings"
      description="League-wide team ranking boards and filters."
      sections={[
        { title: "Team Rankings", description: "Sortable rankings by metric." },
        { title: "League Percentiles", description: "Percentile positioning by stat." },
        { title: "Custom Filters", description: "Split and date range controls." },
      ]}
    />
  )
}
