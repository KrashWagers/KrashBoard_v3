import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NHLStandingsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          NHL Standings
        </h1>
        <p className="text-xl text-muted-foreground">
          Division standings and playoff picture
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            NHL Standings is currently under development. This will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Division and conference standings</li>
            <li>• Playoff picture and seeding</li>
            <li>• Points, wins, losses, and overtime records</li>
            <li>• Recent form and trends</li>
            <li>• Playoff probability calculations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
