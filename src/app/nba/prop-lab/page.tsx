import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NbaPropLabPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">NBA Prop Lab</h1>
        <p className="text-sm text-muted-foreground">
          Player prop research and hit-rate tracking for NBA.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prop Research</CardTitle>
          <CardDescription>Placeholders for prop filters and dashboards.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder layout — prop dashboards and filters will land here.
        </CardContent>
      </Card>
    </div>
  )
}
