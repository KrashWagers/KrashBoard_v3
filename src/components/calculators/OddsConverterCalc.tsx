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
  americanToDecimal,
  decimalToAmerican,
  fractionalToDecimal,
  decimalToFractional,
  impliedProbabilityFromDecimal
} from "@/lib/odds"

const oddsConverterSchema = z.object({
  odds: z.number().min(-1000).max(1000),
  format: z.enum(["american", "decimal", "fractional"]),
})

type OddsConverterFormData = z.infer<typeof oddsConverterSchema>

export function OddsConverterCalc() {
  const form = useForm<OddsConverterFormData>({
    resolver: zodResolver(oddsConverterSchema),
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
      let decimalOdds: number
      
      if (format === "american") {
        decimalOdds = americanToDecimal(odds)
      } else if (format === "decimal") {
        decimalOdds = odds
      } else {
        // For fractional, we need to convert the odds to decimal first
        const fractionalStr = odds.toString()
        decimalOdds = fractionalToDecimal(fractionalStr)
      }
      
      const americanOdds = decimalToAmerican(decimalOdds)
      const fractionalOdds = decimalToFractional(decimalOdds)
      const impliedProb = impliedProbabilityFromDecimal(decimalOdds)
      const probabilityPercent = (impliedProb * 100).toFixed(2)

      return {
        decimalOdds: decimalOdds.toFixed(3),
        americanOdds: americanOdds > 0 ? `+${americanOdds}` : americanOdds.toString(),
        fractionalOdds,
        probability: probabilityPercent,
      }
    } catch (error) {
      return null
    }
  }, [watchedValues])

  const result = calculateResults ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <ResultCard
        title="Implied Probability"
        value={`${calculateResults.probability}%`}
        subtitle="Win probability"
      />
    </div>
  ) : null

  return (
    <CalcCard
      title="Odds Converter"
      description="Convert between American, Decimal, and Fractional odds formats"
      result={result}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="format">From Format</Label>
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
