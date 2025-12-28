import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  Cloud, 
  Shield, 
  Target, 
  TrendingUp,
  BarChart3,
  Users,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const nflTools = [
  {
    title: "Prop Lab",
    description: "Advanced player prop analysis and betting tools",
    href: "/nfl/tools/prop-lab",
    icon: Calculator,
    color: "bg-blue-500",
    features: ["Player Props", "Line Shopping", "Value Analysis"]
  },
  {
    title: "Prop Matrix",
    description: "Hit rates and performance analysis for all props",
    href: "/nfl/tools/prop-matrix",
    icon: Target,
    color: "bg-green-500",
    features: ["Hit Rates", "Performance", "Trends"]
  },
  {
    title: "Weather Reports",
    description: "Weather impact analysis for games and props",
    href: "/nfl/tools/weather",
    icon: Cloud,
    color: "bg-sky-500",
    features: ["Game Weather", "Impact Analysis", "Forecasts"]
  },
  {
    title: "Defense vs Position",
    description: "DVP analysis for matchup advantages",
    href: "/nfl/tools/dvp",
    icon: Shield,
    color: "bg-purple-500",
    features: ["Matchup Data", "Advantages", "Trends"]
  },
  {
    title: "End Zone Analysis",
    description: "Red zone and touchdown probability analysis",
    href: "/nfl/tools/endzone",
    icon: Target,
    color: "bg-red-500",
    features: ["Red Zone Stats", "TD Probability", "Analysis"]
  },
  {
    title: "Touchdown Report",
    description: "Comprehensive TD analysis and predictions",
    href: "/nfl/tools/touchdown-report",
    icon: TrendingUp,
    color: "bg-orange-500",
    features: ["TD Predictions", "Analysis", "Trends"]
  },
  {
    title: "Reverse Correlation",
    description: "Correlation analysis between different props",
    href: "/nfl/tools/reverse-correlation",
    icon: BarChart3,
    color: "bg-indigo-500",
    features: ["Correlations", "Patterns", "Insights"]
  },
  {
    title: "Parlay Builder",
    description: "Build and analyze parlay combinations",
    href: "/nfl/tools/parlay-builder",
    icon: Calculator,
    color: "bg-pink-500",
    features: ["Parlay Builder", "Odds Calculator", "Analysis"]
  }
]

const nflStats = [
  {
    title: "Player Stats",
    description: "Comprehensive player statistics and analysis",
    href: "/nfl/stats/players",
    icon: Users,
    color: "bg-emerald-500"
  },
  {
    title: "Team Stats",
    description: "Team performance metrics and rankings",
    href: "/nfl/stats/teams",
    icon: BarChart3,
    color: "bg-cyan-500"
  },
  {
    title: "Standings",
    description: "Division standings and playoff picture",
    href: "/nfl/stats/standings",
    icon: TrendingUp,
    color: "bg-amber-500"
  },
  {
    title: "Depth Charts",
    description: "Current team depth charts and rosters",
    href: "/nfl/stats/depth-charts",
    icon: Users,
    color: "bg-violet-500"
  },
  {
    title: "Lineups",
    description: "Starting lineups and inactive reports",
    href: "/nfl/stats/lineups",
    icon: Users,
    color: "bg-rose-500"
  }
]

export default function NFLPage() {
  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            NFL Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced analytics and betting tools for the National Football League
          </p>
        </div>

        {/* Tools Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tools</h2>
            <Button variant="outline" asChild>
              <Link href="/nfl/tools">
                View All Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nflTools.map((tool) => (
              <Card key={tool.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    {tool.features.map((feature) => (
                      <div key={feature} className="text-sm text-muted-foreground">
                        • {feature}
                      </div>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={tool.href}>
                      Open Tool
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Statistics</h2>
            <Button variant="outline" asChild>
              <Link href="/nfl/stats">
                View All Stats
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {nflStats.map((stat) => (
              <Card key={stat.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{stat.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {stat.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={stat.href}>
                      View Stats
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
  )
}
