import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NflMarketPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">NFL Market</h1>
        <p className="text-sm text-muted-foreground">
          Market movement, pricing context, and odds tracking.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Placeholders for odds movement and alerts.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder layout — market dashboards and alerts will land here.
        </CardContent>
      </Card>
    </div>
  )
}
