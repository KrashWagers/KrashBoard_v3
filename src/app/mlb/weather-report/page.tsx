import * as React from "react"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

export default function MlbWeatherReportPage() {
  return (
    <MlbPageShell
      title="MLB Weather Report"
      description="Ballpark weather, wind impact, and delay risk."
      sections={[
        { title: "Stadium Conditions", description: "Temp, humidity, and precipitation." },
        { title: "Wind Impact", description: "Wind direction and run environment." },
        { title: "Delay Risk", description: "Risk levels and live updates." },
      ]}
    />
  )
}
