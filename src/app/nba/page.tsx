import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function NbaHomePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">NBA Home</h1>
        <p className="text-sm text-muted-foreground">
          NBA workspace scaffolding for upcoming features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NBA Dashboard</CardTitle>
          <CardDescription>Placeholders for core NBA modules.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Placeholder layout — NBA data modules will land here.
        </CardContent>
      </Card>
    </div>
  )
}
