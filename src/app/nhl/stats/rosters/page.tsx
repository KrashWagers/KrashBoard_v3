import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NHLRostersPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          NHL Rosters
        </h1>
        <p className="text-xl text-muted-foreground">
          Current team rosters and player information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            NHL Rosters is currently under development. This will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Current team rosters</li>
            <li>• Player positions and roles</li>
            <li>• Injury reports and status</li>
            <li>• Roster changes and transactions</li>
            <li>• Player contract information</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
