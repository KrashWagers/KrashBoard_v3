"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { calculateNoVigFairOdds } from "@/lib/odds"

const noVigSchema = z.object({
  oddsA: z.number().min(-1000).max(1000),
  oddsB: z.number().min(-1000).max(1000),
})

type NoVigFormData = z.infer<typeof noVigSchema>

export function NoVigCalc() {
  const form = useForm<NoVigFormData>({
    resolver: zodResolver(noVigSchema),
    defaultValues: {
      oddsA: -110,
      oddsB: -110,
    },
  })

  const { watch } = form
  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { oddsA, oddsB } = watchedValues
    
    if (!oddsA || !oddsB) return null

    try {
      // Convert to implied probabilities
      const probA = oddsA > 0 ? 100 / (oddsA + 100) : Math.abs(oddsA) / (Math.abs(oddsA) + 100)
      const probB = oddsB > 0 ? 100 / (oddsB + 100) : Math.abs(oddsB) / (Math.abs(oddsB) + 100)
      
      const probabilities = [probA, probB]
      const fairOdds = calculateNoVigFairOdds(probabilities)
      
      const fairOddsA = fairOdds[0] > 0.5 ? 
        Math.round(-100 / (fairOdds[0] - 1)) : 
        Math.round((fairOdds[0] / (1 - fairOdds[0])) * 100)
      
      const fairOddsB = fairOdds[1] > 0.5 ? 
        Math.round(-100 / (fairOdds[1] - 1)) : 
        Math.round((fairOdds[1] / (1 - fairOdds[1])) * 100)

      const fairProbA = (fairOdds[0] * 100).toFixed(1)
      const fairProbB = (fairOdds[1] * 100).toFixed(1)

      return {
        fairOddsA,
        fairOddsB,
        fairProbA,
        fairProbB,
        originalProbA: (probA * 100).toFixed(1),
        originalProbB: (probB * 100).toFixed(1),
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          title="Fair Odds A"
          value={calculateResults.fairOddsA > 0 ? `+${calculateResults.fairOddsA}` : calculateResults.fairOddsA.toString()}
          subtitle={`${calculateResults.fairProbA}% probability`}
        />
        <ResultCard
          title="Fair Odds B"
          value={calculateResults.fairOddsB > 0 ? `+${calculateResults.fairOddsB}` : calculateResults.fairOddsB.toString()}
          subtitle={`${calculateResults.fairProbB}% probability`}
        />
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Original vs Fair Probabilities</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Side A</p>
            <p>Original: {calculateResults.originalProbA}% → Fair: {calculateResults.fairProbA}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Side B</p>
            <p>Original: {calculateResults.originalProbB}% → Fair: {calculateResults.fairProbB}%</p>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <CalcCard
      title="No Vig Calculator"
      description="Calculate fair odds without vig (juice) for any two-way market"
      result={result}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="oddsA">Side A Odds</Label>
          <Input
            id="oddsA"
            type="number"
            placeholder="-110"
            className="focus:ring-primary rounded-lg"
            {...form.register("oddsA", { valueAsNumber: true })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="oddsB">Side B Odds</Label>
          <Input
            id="oddsB"
            type="number"
            placeholder="-110"
            className="focus:ring-primary rounded-lg"
            {...form.register("oddsB", { valueAsNumber: true })}
          />
        </div>
      </div>
    </CalcCard>
  )
}
