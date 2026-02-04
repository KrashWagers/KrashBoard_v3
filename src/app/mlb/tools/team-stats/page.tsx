import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbTeamStatsPage() {
  return (
    <MlbPageShell
      title="Team Stats"
      description="Team-level performance, splits, and trend analysis."
      sections={[
        { title: "Offense", description: "Runs, wRC+, and power trends." },
        { title: "Pitching", description: "Staff performance and bullpen usage." },
        { title: "Situational", description: "Home/away, vs L/R, and last 30 days." },
      ]}
    />
  )
}
