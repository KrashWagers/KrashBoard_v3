"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { Plus, X, Calculator } from "lucide-react"
import { calculateRoundRobin } from "@/lib/odds"

const roundRobinSchema = z.object({
  selections: z.array(z.object({
    odds: z.number().min(-1000).max(1000),
    description: z.string().optional(),
  })).min(3),
  stake: z.number().min(0.01),
  way: z.number().min(2).max(10),
})

type RoundRobinFormData = z.infer<typeof roundRobinSchema>

export function RoundRobinCalc() {
  const form = useForm<RoundRobinFormData>({
    resolver: zodResolver(roundRobinSchema),
    defaultValues: {
      selections: [
        { odds: -110, description: "Selection 1" },
        { odds: -110, description: "Selection 2" },
        { odds: -110, description: "Selection 3" },
      ],
      stake: 100,
      way: 2,
    },
  })

  const { watch, control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "selections",
  })

  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { selections, stake, way } = watchedValues
    
    if (!selections || selections.length < 3 || !stake || !way) return null

    try {
      const oddsArray = selections.map(sel => sel.odds).filter(odds => odds !== undefined && odds !== null)
      
      if (oddsArray.length < 3) return null
      
      const result = calculateRoundRobin(oddsArray, stake, way)
      
      return {
        totalCombinations: result.totalCombinations,
        combinationsPerBet: result.combinationsPerBet,
        stakePerBet: result.stakePerBet.toFixed(2),
        totalStake: result.totalStake.toFixed(2),
        minPayout: result.minPayout.toFixed(2),
        maxPayout: result.maxPayout.toFixed(2),
        averagePayout: result.averagePayout.toFixed(2),
        way: way,
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResultCard
          title="Total Combinations"
          value={calculateResults.totalCombinations.toString()}
          subtitle={`${calculateResults.way}-way round robin`}
        />
        <ResultCard
          title="Stake Per Bet"
          value={`$${calculateResults.stakePerBet}`}
          subtitle="Amount per combination"
        />
        <ResultCard
          title="Total Stake"
          value={`$${calculateResults.totalStake}`}
          subtitle="Total amount wagered"
        />
        <ResultCard
          title="Way"
          value={calculateResults.way.toString()}
          subtitle="Combinations per bet"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ResultCard
          title="Min Payout"
          value={`$${calculateResults.minPayout}`}
          subtitle="If only 1 combination wins"
        />
        <ResultCard
          title="Max Payout"
          value={`$${calculateResults.maxPayout}`}
          subtitle="If all combinations win"
        />
        <ResultCard
          title="Average Payout"
          value={`$${calculateResults.averagePayout}`}
          subtitle="Expected payout"
        />
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Round Robin Analysis</h4>
        <div className="text-sm space-y-1">
          <p><strong>Selections:</strong> {watchedValues.selections?.length || 0}</p>
          <p><strong>Way:</strong> {calculateResults.way}</p>
          <p><strong>Total Bets:</strong> {calculateResults.totalCombinations}</p>
          <p className="text-muted-foreground">
            A round robin creates multiple smaller parlays from your selections, reducing risk while maintaining upside potential.
          </p>
        </div>
      </div>
    </div>
  ) : null

  return (
    <CalcCard
      title="Round Robin Calculator"
      description="Calculate round robin betting combinations and potential payouts"
      result={result}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Selections</Label>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`selections.${index}.description`}>Description (Optional)</Label>
                  <Input
                    placeholder={`Selection ${index + 1}`}
                    {...form.register(`selections.${index}.description`)}
                    className="focus:ring-primary rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`selections.${index}.odds`}>Odds</Label>
                  <Input
                    type="number"
                    placeholder="-110"
                    {...form.register(`selections.${index}.odds`, { valueAsNumber: true })}
                    className="focus:ring-primary rounded-lg"
                  />
                </div>
                {fields.length > 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-10 w-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ odds: -110, description: `Selection ${fields.length + 1}` })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Selection
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="stake">Total Stake ($)</Label>
            <Input
              id="stake"
              type="number"
              step="0.01"
              placeholder="100"
              className="focus:ring-primary rounded-lg"
              {...form.register("stake", { valueAsNumber: true })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="way">Way (2-10)</Label>
            <Input
              id="way"
              type="number"
              min="2"
              max="10"
              placeholder="2"
              className="focus:ring-primary rounded-lg"
              {...form.register("way", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
    </CalcCard>
  )
}
