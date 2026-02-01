import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPlayerPercentilesPage() {
  return (
    <MlbPageShell
      title="Player Percentiles"
      description="Percentile charts and distribution context for MLB players."
      sections={[
        { title: "Percentile Charts", description: "Stat percentile visualizations." },
        { title: "League Distribution", description: "Compare against league ranges." },
        { title: "Role Benchmarks", description: "Position-specific context." },
      ]}
    />
  )
}
