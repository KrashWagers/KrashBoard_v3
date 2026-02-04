import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NbaLineupsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">NBA Lineups</h1>
        <p className="text-sm text-muted-foreground">
          Rotations, injury news, and projected starters.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lineup Tracker</CardTitle>
          <CardDescription>Placeholders for lineup feeds and notes.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder layout — lineup tables and alerts will land here.
        </CardContent>
      </Card>
    </div>
  )
}
