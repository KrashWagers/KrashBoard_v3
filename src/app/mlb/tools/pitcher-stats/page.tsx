import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPitcherStatsPage() {
  return (
    <MlbPageShell
      title="Pitcher Stats"
      description="Pitching effectiveness, pitch mix, and workload insights."
      sections={[
        { title: "Run Prevention", description: "ERA, FIP, and xFIP tracking." },
        { title: "Pitch Mix", description: "Usage, velocity, and movement." },
        { title: "Workload", description: "Pitch counts and recent usage." },
      ]}
    />
  )
}
