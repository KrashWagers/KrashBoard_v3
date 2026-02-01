import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbBarrelBoysPage() {
  return (
    <MlbPageShell
      title="Barrel Boys"
      description="Hard-hit and barrel-rate analytics for MLB hitters."
      sections={[
        { title: "Barrel Rates", description: "Barrel % trends and league ranks." },
        { title: "Hard-Hit Trends", description: "Recent power metrics and trends." },
        { title: "Target List", description: "Top hitters by power profile." },
      ]}
    />
  )
}
