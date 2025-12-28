"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { calculateKellyCriterion } from "@/lib/odds"

const kellySchema = z.object({
  probability: z.number().min(0).max(100),
  odds: z.number().min(-1000).max(1000),
  bankroll: z.number().min(0.01),
})

type KellyFormData = z.infer<typeof kellySchema>

export function KellyCalc() {
  const form = useForm<KellyFormData>({
    resolver: zodResolver(kellySchema),
    defaultValues: {
      probability: 55,
      odds: -110,
      bankroll: 1000,
    },
  })

  const { watch } = form
  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { probability, odds, bankroll } = watchedValues
    
    if (!probability || !odds || !bankroll) return null

    try {
      const probDecimal = probability / 100
      const kelly = calculateKellyCriterion(probDecimal, odds, bankroll)
      
      return {
        betAmount: kelly.betAmount.toFixed(2),
        percentage: kelly.percentage.toFixed(2),
        probability: probability.toFixed(1),
        bankroll: bankroll.toFixed(2),
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard
          title="Optimal Bet Amount"
          value={`$${calculateResults.betAmount}`}
          subtitle="Kelly recommended stake"
        />
        <ResultCard
          title="Bankroll Percentage"
          value={`${calculateResults.percentage}%`}
          subtitle="Percentage of bankroll"
        />
        <ResultCard
          title="Win Probability"
          value={`${calculateResults.probability}%`}
          subtitle="Your estimated probability"
        />
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Kelly Criterion Analysis</h4>
        <div className="text-sm space-y-1">
          <p><strong>Bankroll:</strong> ${calculateResults.bankroll}</p>
          <p><strong>Recommended Bet:</strong> ${calculateResults.betAmount} ({calculateResults.percentage}% of bankroll)</p>
          <p className="text-muted-foreground">
            The Kelly Criterion maximizes long-term growth while minimizing risk of ruin.
          </p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <CalcCard
      title="Kelly Criterion Calculator"
      description="Calculate optimal bet sizing using the Kelly Criterion for bankroll management"
      result={result}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="probability">Win Probability (%)</Label>
          <Input
            id="probability"
            type="number"
            placeholder="55"
            className="focus:ring-primary rounded-lg"
            {...form.register("probability", { valueAsNumber: true })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="odds">Odds</Label>
          <Input
            id="odds"
            type="number"
            placeholder="-110"
            className="focus:ring-primary rounded-lg"
            {...form.register("odds", { valueAsNumber: true })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bankroll">Bankroll ($)</Label>
          <Input
            id="bankroll"
            type="number"
            step="0.01"
            placeholder="1000"
            className="focus:ring-primary rounded-lg"
            {...form.register("bankroll", { valueAsNumber: true })}
          />
        </div>
      </div>
    </CalcCard>
  )
}
