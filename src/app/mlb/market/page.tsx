import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbMarketPage() {
  return (
    <MlbPageShell
      title="MLB Market"
      description="Market movement, price changes, and opportunity tracking."
      sections={[
        { title: "Market Movement", description: "Line movement by matchup and prop." },
        { title: "Consensus Odds", description: "Aggregated pricing across books." },
        { title: "Alerts", description: "Triggered movement and value flags." },
      ]}
    />
  )
}
