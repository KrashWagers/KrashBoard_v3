import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NHLPlayersPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          NHL Player Stats
        </h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive player statistics and analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            NHL Player Stats is currently under development. This will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Player performance statistics</li>
            <li>• Goals, assists, and points tracking</li>
            <li>• Advanced metrics and analytics</li>
            <li>• Player comparisons and rankings</li>
            <li>• Historical performance data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
