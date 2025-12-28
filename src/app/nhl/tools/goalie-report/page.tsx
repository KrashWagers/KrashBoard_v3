import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GoalieReportPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Goalie Report
        </h1>
        <p className="text-xl text-muted-foreground">
          Goalie performance analysis and matchup insights
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Goalie Report is currently under development. This will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Goalie performance statistics</li>
            <li>• Matchup analysis</li>
            <li>• Recent form trends</li>
            <li>• Save percentage analysis</li>
            <li>• Goals against average trends</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
