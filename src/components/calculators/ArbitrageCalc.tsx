"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { calculateArbitrage } from "@/lib/odds"

const arbitrageSchema = z.object({
  oddsA: z.number().min(-1000).max(1000),
  oddsB: z.number().min(-1000).max(1000),
  totalStake: z.number().min(0.01),
})

type ArbitrageFormData = z.infer<typeof arbitrageSchema>

export function ArbitrageCalc() {
  const form = useForm<ArbitrageFormData>({
    resolver: zodResolver(arbitrageSchema),
    defaultValues: {
      oddsA: -110,
      oddsB: -110,
      totalStake: 1000,
    },
  })

  const { watch } = form
  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { oddsA, oddsB, totalStake } = watchedValues
    
    if (!oddsA || !oddsB || !totalStake) return null

    try {
      const arbitrage = calculateArbitrage(oddsA, oddsB, totalStake)
      
      return {
        stakeA: arbitrage.stakeA.toFixed(2),
        stakeB: arbitrage.stakeB.toFixed(2),
        totalPayout: arbitrage.totalPayout.toFixed(2),
        guaranteedProfit: arbitrage.guaranteedProfit.toFixed(2),
        profitMargin: arbitrage.profitMargin.toFixed(2),
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard
          title="Stake on Side A"
          value={`$${calculateResults.stakeA}`}
          subtitle="Bet amount for first side"
        />
        <ResultCard
          title="Stake on Side B"
          value={`$${calculateResults.stakeB}`}
          subtitle="Bet amount for second side"
        />
        <ResultCard
          title="Total Payout"
          value={`$${calculateResults.totalPayout}`}
          subtitle="Guaranteed payout"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          title="Guaranteed Profit"
          value={`$${calculateResults.guaranteedProfit}`}
          subtitle="Risk-free profit"
          className="bg-green-500/10 border-green-500/20"
        />
        <ResultCard
          title="Profit Margin"
          value={`${calculateResults.profitMargin}%`}
          subtitle="Return on investment"
          className="bg-green-500/10 border-green-500/20"
        />
      </div>
    </div>
  ) : null

  return (
    <CalcCard
      title="Arbitrage Calculator"
      description="Calculate hedge stakes and guaranteed profit from arbitrage opportunities"
      result={result}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        
        <div className="space-y-2">
          <Label htmlFor="totalStake">Total Stake ($)</Label>
          <Input
            id="totalStake"
            type="number"
            step="0.01"
            placeholder="1000"
            className="focus:ring-primary rounded-lg"
            {...form.register("totalStake", { valueAsNumber: true })}
          />
        </div>
      </div>
    </CalcCard>
  )
}
