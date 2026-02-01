import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPitcherReportPage() {
  return (
    <MlbPageShell
      title="Pitcher Report"
      description="Pitcher form, pitch mix, and matchup context."
      sections={[
        { title: "Pitch Arsenal", description: "Pitch usage and velocity trends." },
        { title: "Recent Form", description: "Last starts and workload notes." },
        { title: "Matchup Notes", description: "Opponent splits and park factors." },
      ]}
    />
  )
}
