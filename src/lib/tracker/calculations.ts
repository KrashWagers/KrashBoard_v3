import { americanToDecimal, impliedProbabilityFromAmerican } from "@/lib/odds"
import { TrackerResult } from "@/types/tracker"

export const calculateImpliedWinPct = (odds: number) => {
  const implied = impliedProbabilityFromAmerican(odds)
  return Number((implied * 100).toFixed(2))
}

export const calculatePotentialPayout = (odds: number, stake: number) => {
  const decimal = americanToDecimal(odds)
  return Number((stake * decimal).toFixed(2))
}

export const calculateNetProfit = (result: TrackerResult, stake: number, payout: number, potential: number) => {
  if (result === "Win") {
    const totalReturn = payout > 0 ? payout : potential
    return Number((totalReturn - stake).toFixed(2))
  }
  if (result === "Loss") {
    return Number((-stake).toFixed(2))
  }
  return 0
}
