import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ResultCardProps {
  title: string
  value: string | number
  subtitle?: string
  className?: string
}

export function ResultCard({ title, value, subtitle, className = "" }: ResultCardProps) {
  return (
    <Card className={`bg-primary/10 border-primary/20 rounded-lg ${className}`}>
      <CardContent className="p-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
