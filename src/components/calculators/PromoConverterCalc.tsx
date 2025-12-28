"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { calculatePromoConverter } from "@/lib/odds"

const promoConverterSchema = z.object({
  originalOdds: z.number().min(-1000).max(1000),
  promoOdds: z.number().min(-1000).max(1000),
  stake: z.number().min(0.01),
  maxBet: z.number().min(0.01).optional(),
})

type PromoConverterFormData = z.infer<typeof promoConverterSchema>

export function PromoConverterCalc() {
  const form = useForm<PromoConverterFormData>({
    resolver: zodResolver(promoConverterSchema),
    defaultValues: {
      originalOdds: -110,
      promoOdds: -200,
      stake: 100,
      maxBet: 50,
    },
  })

  const { watch } = form
  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { originalOdds, promoOdds, stake, maxBet } = watchedValues
    
    if (!originalOdds || !promoOdds || !stake) return null

    try {
      const result = calculatePromoConverter(originalOdds, promoOdds, stake, maxBet)
      
      return {
        hedgeOdds: result.hedgeOdds.toFixed(3),
        hedgeStake: result.hedgeStake.toFixed(2),
        totalStake: result.totalStake.toFixed(2),
        guaranteedProfit: result.guaranteedProfit.toFixed(2),
        profitMargin: result.profitMargin.toFixed(2),
        originalPayout: result.originalPayout.toFixed(2),
        hedgePayout: result.hedgePayout.toFixed(2),
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard
          title="Hedge Odds"
          value={calculateResults.hedgeOdds}
          subtitle="Decimal format"
        />
        <ResultCard
          title="Hedge Stake"
          value={`$${calculateResults.hedgeStake}`}
          subtitle="Bet amount on hedge"
        />
        <ResultCard
          title="Total Stake"
          value={`$${calculateResults.totalStake}`}
          subtitle="Combined bet amount"
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          title="Original Payout"
          value={`$${calculateResults.originalPayout}`}
          subtitle="If original bet wins"
        />
        <ResultCard
          title="Hedge Payout"
          value={`$${calculateResults.hedgePayout}`}
          subtitle="If hedge bet wins"
        />
      </div>
    </div>
  ) : null

  return (
    <CalcCard
      title="Promo Converter Calculator"
      description="Convert promotional odds into guaranteed profit through hedging"
      result={result}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Original Bet</h4>
          <div className="space-y-2">
            <Label htmlFor="originalOdds">Original Odds</Label>
            <Input
              id="originalOdds"
              type="number"
              placeholder="-110"
              className="focus:ring-primary rounded-lg"
              {...form.register("originalOdds", { valueAsNumber: true })}
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
        
        <div className="space-y-4">
          <h4 className="font-semibold">Promo Details</h4>
          <div className="space-y-2">
            <Label htmlFor="promoOdds">Promo Odds</Label>
            <Input
              id="promoOdds"
              type="number"
              placeholder="-200"
              className="focus:ring-primary rounded-lg"
              {...form.register("promoOdds", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxBet">Max Bet ($)</Label>
            <Input
              id="maxBet"
              type="number"
              step="0.01"
              placeholder="50"
              className="focus:ring-primary rounded-lg"
              {...form.register("maxBet", { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
    </CalcCard>
  )
}
