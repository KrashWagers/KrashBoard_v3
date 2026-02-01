import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbLineupsPage() {
  return (
    <MlbPageShell
      title="MLB Lineups"
      description="Projected and confirmed lineups with late swap readiness."
      sections={[
        { title: "Projected Lineups", description: "Early projections with batting order." },
        { title: "Confirmed Lineups", description: "Official lineup cards when posted." },
        { title: "Injuries & Notes", description: "Scratch alerts and context notes." },
      ]}
    />
  )
}
