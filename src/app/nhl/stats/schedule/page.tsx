import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NHLSchedulePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          NHL Schedule
        </h1>
        <p className="text-xl text-muted-foreground">
          Upcoming games and matchups
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            NHL Schedule is currently under development. This will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Upcoming games and matchups</li>
            <li>• Game times and venues</li>
            <li>• Team schedules and road trips</li>
            <li>• Back-to-back game analysis</li>
            <li>• Rest day advantages</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
