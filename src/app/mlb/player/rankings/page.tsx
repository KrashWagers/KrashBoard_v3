import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPlayerRankingsPage() {
  return (
    <MlbPageShell
      title="Player Rankings"
      description="Sortable leaderboards across MLB player metrics."
      sections={[
        { title: "Rankings Table", description: "Leaderboards by stat and position." },
        { title: "Position Filters", description: "Filter by role and handedness." },
        { title: "Metric Presets", description: "Quick views for common metrics." },
      ]}
    />
  )
}
