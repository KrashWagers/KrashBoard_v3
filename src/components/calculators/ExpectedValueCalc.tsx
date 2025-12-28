"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { calculateExpectedValue } from "@/lib/odds"

const expectedValueSchema = z.object({
  probability: z.number().min(0).max(100),
  odds: z.number().min(-1000).max(1000),
  stake: z.number().min(0.01),
})

type ExpectedValueFormData = z.infer<typeof expectedValueSchema>

export function ExpectedValueCalc() {
  const form = useForm<ExpectedValueFormData>({
    resolver: zodResolver(expectedValueSchema),
    defaultValues: {
      probability: 55,
      odds: -110,
      stake: 100,
    },
  })

  const { watch } = form
  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { probability, odds, stake } = watchedValues
    
    if (!probability || !odds || !stake) return null

    try {
      const probDecimal = probability / 100
      const { expectedValue, roi } = calculateExpectedValue(probDecimal, odds, stake)
      
      const winAmount = stake * (odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1) - stake
      const lossAmount = stake
      
      return {
        expectedValue: expectedValue.toFixed(2),
        roi: roi.toFixed(2),
        winAmount: winAmount.toFixed(2),
        lossAmount: lossAmount.toFixed(2),
        probability: probability.toFixed(1),
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ResultCard
        title="Expected Value"
        value={`$${calculateResults.expectedValue}`}
        subtitle={parseFloat(calculateResults.expectedValue) >= 0 ? "Positive EV" : "Negative EV"}
      />
      <ResultCard
        title="ROI"
        value={`${calculateResults.roi}%`}
        subtitle="Return on investment"
      />
      <ResultCard
        title="Win Amount"
        value={`$${calculateResults.winAmount}`}
        subtitle="If bet wins"
      />
      <ResultCard
        title="Loss Amount"
        value={`$${calculateResults.lossAmount}`}
        subtitle="If bet loses"
      />
    </div>
  ) : null

  return (
    <CalcCard
      title="Expected Value Calculator"
      description="Calculate the expected value and ROI for your bets based on win probability"
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
          <Label htmlFor="stake">Stake ($)</Label>
          <Input
            id="stake"
            type="number"
            step="0.01"
            placeholder="100"
            className="focus:ring-primary rounded-lg"
            {...form.register("stake", { valueAsNumber: true })}
          />
        </div>
      </div>
    </CalcCard>
  )
}
