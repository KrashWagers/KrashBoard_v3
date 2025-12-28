import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3,
  Users,
  TrendingUp,
  Activity,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

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

export default function NHLStatsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          NHL Statistics
        </h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive statistics and analysis for the National Hockey League
        </p>
      </div>

      {/* Stats Grid */}
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
  )
}
