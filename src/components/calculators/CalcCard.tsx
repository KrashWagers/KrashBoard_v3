import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CalcCardProps {
  title: string
  description: string
  children: React.ReactNode
  result?: React.ReactNode
}

export function CalcCard({ title, description, children, result }: CalcCardProps) {
  return (
    <Card className="rounded-xl border border-border bg-card p-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-primary">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">{children}</div>
        {result && (
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 text-primary">Results</h3>
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
