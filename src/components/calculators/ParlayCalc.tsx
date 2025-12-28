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
import { calculateParlayOdds } from "@/lib/odds"

const parlaySchema = z.object({
  legs: z.array(z.object({
    odds: z.number().min(-1000).max(1000),
    description: z.string().optional(),
  })).min(2),
  stake: z.number().min(0.01),
})

type ParlayFormData = z.infer<typeof parlaySchema>

export function ParlayCalc() {
  const form = useForm<ParlayFormData>({
    resolver: zodResolver(parlaySchema),
    defaultValues: {
      legs: [
        { odds: -110, description: "Leg 1" },
        { odds: -110, description: "Leg 2" },
      ],
      stake: 100,
    },
  })

  const { watch, control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: "legs",
  })

  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { legs, stake } = watchedValues
    
    if (!legs || legs.length < 2 || !stake) return null

    try {
      const oddsArray = legs.map(leg => leg.odds).filter(odds => odds !== undefined && odds !== null)
      
      if (oddsArray.length < 2) return null
      
      const parlayOdds = calculateParlayOdds(oddsArray)
      const payout = stake * parlayOdds
      const profit = payout - stake
      const roi = (profit / stake) * 100

      return {
        parlayOdds: parlayOdds.toFixed(3),
        americanOdds: parlayOdds > 2 ? 
          Math.round((parlayOdds - 1) * 100) : 
          Math.round(-100 / (parlayOdds - 1)),
        payout: payout.toFixed(2),
        profit: profit.toFixed(2),
        roi: roi.toFixed(2),
        legCount: legs.length,
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ResultCard
          title="Parlay Odds"
          value={calculateResults.parlayOdds}
          subtitle="Decimal format"
        />
        <ResultCard
          title="American Odds"
          value={calculateResults.americanOdds > 0 ? `+${calculateResults.americanOdds}` : calculateResults.americanOdds.toString()}
          subtitle="US format"
        />
        <ResultCard
          title="Total Payout"
          value={`$${calculateResults.payout}`}
          subtitle="If all legs win"
        />
        <ResultCard
          title="Profit"
          value={`$${calculateResults.profit}`}
          subtitle="Net profit"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          title="ROI"
          value={`${calculateResults.roi}%`}
          subtitle="Return on investment"
        />
        <ResultCard
          title="Legs"
          value={calculateResults.legCount.toString()}
          subtitle="Number of selections"
        />
      </div>
    </div>
  ) : null

  return (
    <CalcCard
      title="Parlay Calculator"
      description="Calculate parlay odds and potential payouts for multiple selections"
      result={result}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Parlay Legs</Label>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`legs.${index}.description`}>Description (Optional)</Label>
                  <Input
                    placeholder={`Leg ${index + 1}`}
                    {...form.register(`legs.${index}.description`)}
                    className="focus:ring-primary rounded-lg"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`legs.${index}.odds`}>Odds</Label>
                  <Input
                    type="number"
                    placeholder="-110"
                    {...form.register(`legs.${index}.odds`, { valueAsNumber: true })}
                    className="focus:ring-primary rounded-lg"
                  />
                </div>
                {fields.length > 2 && (
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
            onClick={() => append({ odds: -110, description: `Leg ${fields.length + 1}` })}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Leg
          </Button>
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
