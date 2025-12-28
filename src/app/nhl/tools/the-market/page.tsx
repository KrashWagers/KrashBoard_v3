import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TheMarketPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          The Market
        </h1>
        <p className="text-xl text-muted-foreground">
          Market analysis and betting opportunities
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            The Market is currently under development. This will include:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Market analysis and trends</li>
            <li>• Betting opportunities</li>
            <li>• Line movement tracking</li>
            <li>• Value betting identification</li>
            <li>• Market efficiency analysis</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
