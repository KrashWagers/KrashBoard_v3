// Odds calculation utilities

export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1
  } else {
    return (100 / Math.abs(american)) + 1
  }
}

export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100)
  } else {
    return Math.round(-100 / (decimal - 1))
  }
}

export function fractionalToDecimal(fractional: string): number {
  const [numerator, denominator] = fractional.split('/').map(Number)
  return (numerator / denominator) + 1
}

export function decimalToFractional(decimal: number): string {
  const numerator = decimal - 1
  const denominator = 1
  
  // Find GCD to simplify fraction
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(Math.round(numerator * 100), 100)
  
  const simplifiedNum = Math.round(numerator * 100) / divisor
  const simplifiedDen = 100 / divisor
  
  return `${simplifiedNum}/${simplifiedDen}`
}

export function impliedProbabilityFromDecimal(decimal: number): number {
  return 1 / decimal
}

export function impliedProbabilityFromAmerican(american: number): number {
  if (american > 0) {
    return 100 / (american + 100)
  } else {
    return Math.abs(american) / (Math.abs(american) + 100)
  }
}

export function impliedProbabilityFromFractional(fractional: string): number {
  const decimal = fractionalToDecimal(fractional)
  return impliedProbabilityFromDecimal(decimal)
}

export function calculateVig(probabilities: number[]): number {
  const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0)
  return ((totalProbability - 1) / totalProbability) * 100
}

export function calculateNoVigFairOdds(probabilities: number[]): number[] {
  const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0)
  return probabilities.map(prob => prob / totalProbability)
}

export function calculateKellyCriterion(
  probability: number,
  odds: number,
  bankroll: number
): { betAmount: number; percentage: number } {
  const decimalOdds = americanToDecimal(odds)
  const impliedProb = 1 / decimalOdds
  const edge = probability - impliedProb
  const kelly = edge / (decimalOdds - 1)
  
  const betAmount = Math.max(0, kelly * bankroll)
  const percentage = (betAmount / bankroll) * 100
  
  return { betAmount, percentage }
}

export function calculateExpectedValue(
  probability: number,
  odds: number,
  stake: number
): { expectedValue: number; roi: number } {
  const decimalOdds = americanToDecimal(odds)
  const winAmount = stake * (decimalOdds - 1)
  const expectedValue = (probability * winAmount) - ((1 - probability) * stake)
  const roi = (expectedValue / stake) * 100
  
  return { expectedValue, roi }
}

export function calculateROI(profit: number, stake: number): number {
  return (profit / stake) * 100
}

export function calculateArbitrage(
  oddsA: number,
  oddsB: number,
  totalStake: number
): {
  stakeA: number
  stakeB: number
  totalPayout: number
  guaranteedProfit: number
  profitMargin: number
} {
  const decimalA = americanToDecimal(oddsA)
  const decimalB = americanToDecimal(oddsB)
  
  const stakeA = totalStake / (1 + decimalA / decimalB)
  const stakeB = totalStake - stakeA
  
  const payoutA = stakeA * decimalA
  const payoutB = stakeB * decimalB
  const totalPayout = Math.min(payoutA, payoutB)
  
  const guaranteedProfit = totalPayout - totalStake
  const profitMargin = (guaranteedProfit / totalStake) * 100
  
  return {
    stakeA,
    stakeB,
    totalPayout,
    guaranteedProfit,
    profitMargin
  }
}

export function calculateFreeBetValue(odds: number, freeBetAmount: number): number {
  const decimalOdds = americanToDecimal(odds)
  const impliedProb = 1 / decimalOdds
  const freeBetValue = freeBetAmount * impliedProb
  
  return freeBetValue
}

export function calculateParlayOdds(legs: number[]): number {
  return legs.reduce((total, odds) => total * americanToDecimal(odds), 1)
}

export function combinations(n: number, r: number): number {
  if (r > n) return 0
  if (r === 0 || r === n) return 1
  
  let result = 1
  for (let i = 0; i < r; i++) {
    result = result * (n - i) / (i + 1)
  }
  
  return Math.round(result)
}

export function calculatePointSpread(
  homeScore: number,
  awayScore: number,
  homeSpread: number,
  homeOdds: number,
  awayOdds: number,
  stake: number
): {
  homeAdjustedScore: number
  awayAdjustedScore: number
  homeCovered: boolean
  awayCovered: boolean
  homePayout: number
  awayPayout: number
  homeProfit: number
  awayProfit: number
  push: boolean
} {
  const homeAdjustedScore = homeScore + homeSpread
  const awayAdjustedScore = awayScore
  const push = homeAdjustedScore === awayAdjustedScore
  const homeCovered = homeAdjustedScore > awayAdjustedScore
  const awayCovered = awayAdjustedScore > homeAdjustedScore
  
  const homeDecimal = americanToDecimal(homeOdds)
  const awayDecimal = americanToDecimal(awayOdds)
  
  const homePayout = homeCovered ? stake * homeDecimal : 0
  const awayPayout = awayCovered ? stake * awayDecimal : 0
  
  const homeProfit = homePayout - stake
  const awayProfit = awayPayout - stake
  
  return {
    homeAdjustedScore,
    awayAdjustedScore,
    homeCovered,
    awayCovered,
    homePayout,
    awayPayout,
    homeProfit,
    awayProfit,
    push
  }
}

export function calculatePromoConverter(
  originalOdds: number,
  promoOdds: number,
  stake: number,
  maxBet?: number
): {
  hedgeOdds: number
  hedgeStake: number
  totalStake: number
  guaranteedProfit: number
  profitMargin: number
  originalPayout: number
  hedgePayout: number
} {
  const originalDecimal = americanToDecimal(originalOdds)
  const promoDecimal = americanToDecimal(promoOdds)
  
  // Calculate hedge odds needed
  const hedgeOdds = originalDecimal / promoDecimal
  
  // Calculate optimal stake distribution
  const hedgeStake = stake * (hedgeOdds - 1) / (hedgeOdds * promoDecimal - 1)
  const totalStake = stake + hedgeStake
  
  // Apply max bet limit if provided
  const finalHedgeStake = maxBet ? Math.min(hedgeStake, maxBet) : hedgeStake
  const finalTotalStake = stake + finalHedgeStake
  
  const originalPayout = stake * originalDecimal
  const hedgePayout = finalHedgeStake * hedgeOdds
  
  const guaranteedProfit = Math.min(originalPayout, hedgePayout) - finalTotalStake
  const profitMargin = (guaranteedProfit / finalTotalStake) * 100
  
  return {
    hedgeOdds,
    hedgeStake: finalHedgeStake,
    totalStake: finalTotalStake,
    guaranteedProfit,
    profitMargin,
    originalPayout,
    hedgePayout
  }
}

export function calculateRoundRobin(
  oddsArray: number[],
  totalStake: number,
  way: number
): {
  totalCombinations: number
  combinationsPerBet: number
  stakePerBet: number
  totalStake: number
  minPayout: number
  maxPayout: number
  averagePayout: number
} {
  const n = oddsArray.length
  const totalCombinations = combinations(n, way)
  const stakePerBet = totalStake / totalCombinations
  
  // Calculate payouts for different scenarios
  const decimalOdds = oddsArray.map(odds => americanToDecimal(odds))
  
  // Max payout: all combinations win
  const maxPayout = totalCombinations * stakePerBet * decimalOdds.reduce((a, b) => a * b, 1)
  
  // Min payout: only one combination wins (simplified)
  const minPayout = stakePerBet * decimalOdds[0] // Simplified calculation
  
  // Average payout (simplified)
  const averagePayout = (maxPayout + minPayout) / 2
  
  return {
    totalCombinations,
    combinationsPerBet: way,
    stakePerBet,
    totalStake,
    minPayout,
    maxPayout,
    averagePayout
  }
}
