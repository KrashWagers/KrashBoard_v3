"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalcCard } from "./CalcCard"
import { ResultCard } from "./ResultCard"
import { 
  impliedProbabilityFromAmerican, 
  impliedProbabilityFromDecimal, 
  impliedProbabilityFromFractional,
  americanToDecimal,
  decimalToAmerican,
  fractionalToDecimal,
  decimalToFractional
} from "@/lib/odds"

const impliedProbSchema = z.object({
  odds: z.number().min(-1000).max(1000),
  format: z.enum(["american", "decimal", "fractional"]),
})

type ImpliedProbFormData = z.infer<typeof impliedProbSchema>

export function ImpliedProbCalc() {
  const form = useForm<ImpliedProbFormData>({
    resolver: zodResolver(impliedProbSchema),
    defaultValues: {
      odds: -110,
      format: "american",
    },
  })

  const { watch } = form
  const watchedValues = watch()

  const calculateResults = React.useMemo(() => {
    const { odds, format } = watchedValues
    
    if (!odds) return null

    try {
      let impliedProb: number
      let decimalOdds: number
      
      if (format === "american") {
        impliedProb = impliedProbabilityFromAmerican(odds)
        decimalOdds = americanToDecimal(odds)
      } else if (format === "decimal") {
        impliedProb = impliedProbabilityFromDecimal(odds)
        decimalOdds = odds
      } else {
        // For fractional, we need to convert the odds to decimal first
        const fractionalStr = odds.toString()
        decimalOdds = fractionalToDecimal(fractionalStr)
        impliedProb = impliedProbabilityFromDecimal(decimalOdds)
      }
      
      const americanOdds = decimalToAmerican(decimalOdds)
      const fractionalOdds = decimalToFractional(decimalOdds)
      const probabilityPercent = (impliedProb * 100).toFixed(2)

      return {
        probability: probabilityPercent,
        decimalOdds: decimalOdds.toFixed(3),
        americanOdds: americanOdds > 0 ? `+${americanOdds}` : americanOdds.toString(),
        fractionalOdds,
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ResultCard
        title="Implied Probability"
        value={`${calculateResults.probability}%`}
        subtitle="Win probability"
      />
      <ResultCard
        title="Decimal Odds"
        value={calculateResults.decimalOdds}
        subtitle="European format"
      />
      <ResultCard
        title="American Odds"
        value={calculateResults.americanOdds}
        subtitle="US format"
      />
      <ResultCard
        title="Fractional Odds"
        value={calculateResults.fractionalOdds}
        subtitle="UK format"
      />
    </div>
  ) : null

  return (
    <CalcCard
      title="Implied Probability Calculator"
      description="Convert odds to implied probability and see all odds formats"
      result={result}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="format">Odds Format</Label>
          <Select
            value={watchedValues.format}
            onValueChange={(value) => form.setValue("format", value as "american" | "decimal" | "fractional")}
          >
            <SelectTrigger className="focus:ring-primary rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="american">American (-110)</SelectItem>
              <SelectItem value="decimal">Decimal (1.91)</SelectItem>
              <SelectItem value="fractional">Fractional (10/11)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="odds">Odds</Label>
          <Input
            id="odds"
            type="number"
            step="0.01"
            placeholder={watchedValues.format === "american" ? "-110" : watchedValues.format === "decimal" ? "1.91" : "10"}
            className="focus:ring-primary rounded-lg"
            {...form.register("odds", { valueAsNumber: true })}
          />
        </div>
      </div>
    </CalcCard>
  )
}
