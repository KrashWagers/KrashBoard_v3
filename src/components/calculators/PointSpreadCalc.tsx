"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { calculatePointSpread } from "@/lib/odds"

const pointSpreadSchema = z.object({
  homeScore: z.number().min(0),
  awayScore: z.number().min(0),
  homeSpread: z.number(),
  homeOdds: z.number().min(-1000).max(1000),
  awayOdds: z.number().min(-1000).max(1000),
  stake: z.number().min(0.01),
})

type PointSpreadFormData = z.infer<typeof pointSpreadSchema>

export function PointSpreadCalc() {
  const form = useForm<PointSpreadFormData>({
    resolver: zodResolver(pointSpreadSchema),
    defaultValues: {
      homeScore: 24,
      awayScore: 21,
      homeSpread: -3,
      homeOdds: -110,
      awayOdds: -110,
      stake: 100,
    },
  })

  const { watch } = form
  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { homeScore, awayScore, homeSpread, homeOdds, awayOdds, stake } = watchedValues
    
    if (!homeScore || !awayScore || !homeSpread || !homeOdds || !awayOdds || !stake) return null

    try {
      const result = calculatePointSpread(
        homeScore, 
        awayScore, 
        homeSpread, 
        homeOdds, 
        awayOdds, 
        stake
      )
      
      return {
        homeAdjustedScore: result.homeAdjustedScore.toFixed(1),
        awayAdjustedScore: result.awayAdjustedScore.toFixed(1),
        homeCovered: result.homeCovered,
        awayCovered: result.awayCovered,
        homePayout: result.homePayout.toFixed(2),
        awayPayout: result.awayPayout.toFixed(2),
        homeProfit: result.homeProfit.toFixed(2),
        awayProfit: result.awayProfit.toFixed(2),
        push: result.push,
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          title="Home Team (Adjusted)"
          value={calculateResults.homeAdjustedScore}
          subtitle={`${watchedValues.homeScore} + ${watchedValues.homeSpread}`}
          className={calculateResults.homeCovered ? "bg-green-500/10 border-green-500/20" : ""}
        />
        <ResultCard
          title="Away Team (Adjusted)"
          value={calculateResults.awayAdjustedScore}
          subtitle={`${watchedValues.awayScore} (no adjustment)`}
          className={calculateResults.awayCovered ? "bg-green-500/10 border-green-500/20" : ""}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          title="Home Bet Result"
          value={calculateResults.push ? "PUSH" : calculateResults.homeCovered ? "WIN" : "LOSS"}
          subtitle={`Payout: $${calculateResults.homePayout}`}
          className={
            calculateResults.push ? "bg-yellow-500/10 border-yellow-500/20" :
            calculateResults.homeCovered ? "bg-green-500/10 border-green-500/20" : 
            "bg-red-500/10 border-red-500/20"
          }
        />
        <ResultCard
          title="Away Bet Result"
          value={calculateResults.push ? "PUSH" : calculateResults.awayCovered ? "WIN" : "LOSS"}
          subtitle={`Payout: $${calculateResults.awayPayout}`}
          className={
            calculateResults.push ? "bg-yellow-500/10 border-yellow-500/20" :
            calculateResults.awayCovered ? "bg-green-500/10 border-green-500/20" : 
            "bg-red-500/10 border-red-500/20"
          }
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ResultCard
          title="Home Profit/Loss"
          value={`$${calculateResults.homeProfit}`}
          subtitle="Net result for home bet"
        />
        <ResultCard
          title="Away Profit/Loss"
          value={`$${calculateResults.awayProfit}`}
          subtitle="Net result for away bet"
        />
      </div>
    </div>
  ) : null

  return (
    <CalcCard
      title="Point Spread Calculator"
      description="Calculate point spread betting results and payouts"
      result={result}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold">Game Scores</h4>
          <div className="space-y-2">
            <Label htmlFor="homeScore">Home Team Score</Label>
            <Input
              id="homeScore"
              type="number"
              placeholder="24"
              className="focus:ring-primary rounded-lg"
              {...form.register("homeScore", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awayScore">Away Team Score</Label>
            <Input
              id="awayScore"
              type="number"
              placeholder="21"
              className="focus:ring-primary rounded-lg"
              {...form.register("awayScore", { valueAsNumber: true })}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold">Betting Lines</h4>
          <div className="space-y-2">
            <Label htmlFor="homeSpread">Home Spread</Label>
            <Input
              id="homeSpread"
              type="number"
              placeholder="-3"
              className="focus:ring-primary rounded-lg"
              {...form.register("homeSpread", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="homeOdds">Home Odds</Label>
            <Input
              id="homeOdds"
              type="number"
              placeholder="-110"
              className="focus:ring-primary rounded-lg"
              {...form.register("homeOdds", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awayOdds">Away Odds</Label>
            <Input
              id="awayOdds"
              type="number"
              placeholder="-110"
              className="focus:ring-primary rounded-lg"
              {...form.register("awayOdds", { valueAsNumber: true })}
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
      </div>
    </CalcCard>
  )
}
