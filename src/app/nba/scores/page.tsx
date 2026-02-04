import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NbaScoresPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">NBA Scores</h1>
        <p className="text-sm text-muted-foreground">
          Live scoreboard and slate overview for NBA games.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scores Board</CardTitle>
          <CardDescription>Placeholders for live game data and filters.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder layout — scoreboard and matchup detail cards will land here.
        </CardContent>
      </Card>
    </div>
  )
}
