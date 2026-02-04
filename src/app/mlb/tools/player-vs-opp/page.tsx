import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPlayerVsOppPage() {
  return (
    <MlbPageShell
      title="Batter vs Pitcher"
      description="Matchup history and head-to-head performance for batters and pitchers."
      sections={[
        { title: "Head-to-Head", description: "Direct batter vs pitcher history." },
        { title: "Pitch Mix Context", description: "Pitch-type trends for the matchup." },
        { title: "Recent Samples", description: "Recent appearances against similar arms." },
      ]}
    />
  )
}
