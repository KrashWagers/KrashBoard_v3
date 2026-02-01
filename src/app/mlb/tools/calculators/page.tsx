import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MlbPageShell } from "@/components/mlb/mlb-page-shell"

const cardBase = "rounded-md border border-gray-700 bg-[#171717] shadow-none transition-none"

export default function MlbCalculatorsPage() {
  return (
    <MlbPageShell
      title="MLB Calculators"
      description="Quick access to the global betting calculator suite."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "Vig Calculator", href: "/tools/calculators/vig" },
          { title: "No Vig Calculator", href: "/tools/calculators/no-vig" },
          { title: "Expected Value", href: "/tools/calculators/expected-value" },
          { title: "Implied Probability", href: "/tools/calculators/implied-probability" },
          { title: "Odds Converter", href: "/tools/calculators/odds-converter" },
          { title: "Parlay Calculator", href: "/tools/calculators/parlay" },
        ].map((calc) => (
          <Card key={calc.title} className={cardBase}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{calc.title}</CardTitle>
              <CardDescription className="text-sm">
                Placeholder access for MLB workflow.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link
                href={calc.href}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Open Calculator
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </MlbPageShell>
  )
}
