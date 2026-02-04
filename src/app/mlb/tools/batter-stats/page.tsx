import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbBatterStatsPage() {
  return (
    <MlbPageShell
      title="Batter Stats"
      description="Advanced hitting metrics, form trends, and matchup splits."
      sections={[
        { title: "Plate Skills", description: "Contact rate, walk rate, and K%." },
        { title: "Power Profile", description: "ISO, barrel rate, and hard-hit." },
        { title: "Recent Form", description: "Last 7/14/30 game trends." },
      ]}
    />
  )
}
