import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NHLTeamsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          NHL Team Stats
        </h1>
        <p className="text-xl text-muted-foreground">
          Team performance metrics and rankings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            NHL Team Stats is currently under development. This will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Team performance metrics</li>
            <li>• Goals for and against statistics</li>
            <li>• Power play and penalty kill efficiency</li>
            <li>• Team rankings and comparisons</li>
            <li>• Season and historical data</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
