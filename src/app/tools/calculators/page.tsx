import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  TrendingUp, 
  Target, 
  Percent, 
  BarChart3,
  ArrowRight,
  Zap,
  DollarSign,
  PieChart,
  Activity
} from "lucide-react"
import Link from "next/link"

const calculators = [
  {
    id: "arbitrage",
    title: "Arbitrage Calculator",
    description: "Calculate hedge stakes and guaranteed profit from arbitrage opportunities",
    icon: TrendingUp,
    href: "/tools/calculators/arbitrage",
    color: "bg-green-500",
    features: ["Hedge Stakes", "Guaranteed Profit", "Profit Margin"]
  },
  {
    id: "expected-value",
    title: "Expected Value Calculator",
    description: "Calculate expected value and ROI for your bets",
    icon: BarChart3,
    href: "/tools/calculators/expected-value",
    color: "bg-blue-500",
    features: ["Expected Value", "ROI Calculation", "Win Probability"]
  },
  {
    id: "implied-probability",
    title: "Implied Probability Calculator",
    description: "Convert odds to implied probability percentages",
    icon: Percent,
    href: "/tools/calculators/implied-probability",
    color: "bg-purple-500",
    features: ["Probability Conversion", "All Odds Formats", "Vig Calculation"]
  },
  {
    id: "kelly",
    title: "Kelly Criterion Calculator",
    description: "Calculate optimal bet sizing using Kelly Criterion",
    icon: Target,
    href: "/tools/calculators/kelly",
    color: "bg-orange-500",
    features: ["Optimal Bet Size", "Bankroll Management", "Risk Assessment"]
  },
  {
    id: "no-vig",
    title: "No Vig Calculator",
    description: "Calculate fair odds without vig (juice)",
    icon: Zap,
    href: "/tools/calculators/no-vig",
    color: "bg-yellow-500",
    features: ["Fair Odds", "Vig Removal", "True Probabilities"]
  },
  {
    id: "odds-converter",
    title: "Odds Converter",
    description: "Convert between American, Decimal, and Fractional odds",
    icon: Calculator,
    href: "/tools/calculators/odds-converter",
    color: "bg-cyan-500",
    features: ["All Formats", "Real-time Conversion", "Probability Display"]
  },
  {
    id: "parlay",
    title: "Parlay Calculator",
    description: "Calculate parlay odds and potential payouts",
    icon: Activity,
    href: "/tools/calculators/parlay",
    color: "bg-red-500",
    features: ["Parlay Odds", "Payout Calculation", "Multiple Legs"]
  },
  {
    id: "point-spread",
    title: "Point Spread Calculator",
    description: "Calculate point spread adjustments and hedging",
    icon: Target,
    href: "/tools/calculators/point-spread",
    color: "bg-indigo-500",
    features: ["Spread Adjustments", "Hedge Calculations", "Live Betting"]
  },
  {
    id: "promo-converter",
    title: "Promo Converter",
    description: "Convert promotional odds and bonuses",
    icon: DollarSign,
    href: "/tools/calculators/promo-converter",
    color: "bg-pink-500",
    features: ["Promo Value", "Bonus Conversion", "Free Bet Value"]
  },
  {
    id: "round-robin",
    title: "Round Robin Calculator",
    description: "Calculate round robin bet details and combinations",
    icon: PieChart,
    href: "/tools/calculators/round-robin",
    color: "bg-teal-500",
    features: ["Combination Bets", "Stake Calculation", "Payout Analysis"]
  },
  {
    id: "vig",
    title: "Vig Calculator",
    description: "Calculate vig (hold percentage) from odds",
    icon: BarChart3,
    href: "/tools/calculators/vig",
    color: "bg-amber-500",
    features: ["Vig Calculation", "Hold Percentage", "Margin Analysis"]
  }
]

export default function CalculatorsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Betting <span className="text-primary">Calculators</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Professional-grade betting calculators to help you make smarter decisions. 
          Calculate arbitrage opportunities, expected value, optimal bet sizing, and more.
        </p>
      </div>

      {/* Calculators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calculator) => (
          <Card key={calculator.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${calculator.color} rounded-lg flex items-center justify-center`}>
                  <calculator.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{calculator.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {calculator.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {calculator.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full">
                <Link href={calculator.href}>
                  Open Calculator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>11 Calculators</CardTitle>
            <CardDescription>
              Professional betting tools for every situation
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Real-time Updates</CardTitle>
            <CardDescription>
              Calculations update as you type
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Mobile Optimized</CardTitle>
            <CardDescription>
              Works perfectly on all devices
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
