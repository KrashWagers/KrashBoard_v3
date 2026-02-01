import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbPropLabPage() {
  return (
    <MlbPageShell
      title="MLB Prop Lab"
      description="Player prop research workspace for MLB."
      sections={[
        { title: "Prop Research", description: "Line selection and trend checks." },
        { title: "Hit Rates", description: "Recent performance and split metrics." },
        { title: "Line Shopping", description: "Best price and book coverage." },
      ]}
    />
  )
}
