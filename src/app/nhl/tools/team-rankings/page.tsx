"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeamRankingsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-3rem-3rem)] gap-6">
      <Card className="border-2 shadow-lg flex-1 flex flex-col min-h-0">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-2xl font-bold">Team Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">Coming Soon</h2>
            <p className="text-sm text-muted-foreground">
              Team rankings and aggregated statistics will be available here in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






