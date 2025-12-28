import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  Target, 
  TrendingUp,
  BarChart3,
  Users,
  ArrowRight,
  Zap,
  Activity
} from "lucide-react"
import Link from "next/link"

const nhlTools = [
  {
    title: "Prop Lab",
    description: "Advanced NHL player prop analysis and betting tools",
    href: "/nhl/tools/prop-lab",
    icon: Calculator,
    color: "bg-blue-500",
    features: ["Player Props", "Line Shopping", "Value Analysis"]
  },
  {
    title: "Goalie Report",
    description: "Goalie performance analysis and matchup insights",
    href: "/nhl/tools/goalie-report",
    icon: Target,
    color: "bg-green-500",
    features: ["Goalie Stats", "Matchups", "Trends"]
  },
  {
    title: "The Market",
    description: "Market analysis and betting opportunities",
    href: "/nhl/tools/the-market",
    icon: TrendingUp,
    color: "bg-purple-500",
    features: ["Market Analysis", "Opportunities", "Trends"]
  }
]

const nhlStats = [
  {
    title: "Player Stats",
    description: "Comprehensive player statistics and analysis",
    href: "/nhl/stats/players",
    icon: Users,
    color: "bg-emerald-500"
  },
  {
    title: "Team Stats",
    description: "Team performance metrics and rankings",
    href: "/nhl/stats/teams",
    icon: BarChart3,
    color: "bg-cyan-500"
  },
  {
    title: "Standings",
    description: "Division standings and playoff picture",
    href: "/nhl/stats/standings",
    icon: TrendingUp,
    color: "bg-amber-500"
  },
  {
    title: "Rosters",
    description: "Current team rosters and player information",
    href: "/nhl/stats/rosters",
    icon: Users,
    color: "bg-violet-500"
  },
  {
    title: "Schedule",
    description: "Upcoming games and matchups",
    href: "/nhl/stats/schedule",
    icon: Activity,
    color: "bg-rose-500"
  }
]

export default function NHLPage() {
  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            NHL Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Advanced analytics and betting tools for the National Hockey League
          </p>
        </div>

        {/* Tools Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Tools</h2>
            <Button variant="outline" asChild>
              <Link href="/nhl/tools">
                View All Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nhlTools.map((tool) => (
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
              <Link href="/nhl/stats">
                View All Stats
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {nhlStats.map((stat) => (
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
