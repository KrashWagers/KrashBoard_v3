import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Calculator, 
  Cloud, 
  Shield, 
  Target, 
  TrendingUp,
  Users,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const sports = [
  {
    id: "nfl",
    name: "NFL",
    description: "Football analytics and prop betting tools",
    icon: BarChart3,
    href: "/nfl",
    color: "bg-green-500",
    tools: [
      { name: "Prop Lab", href: "/nfl/tools/prop-lab", icon: Calculator },
      { name: "Weather", href: "/nfl/tools/weather", icon: Cloud },
      { name: "DVP", href: "/nfl/tools/dvp", icon: Shield },
      { name: "End Zone", href: "/nfl/tools/endzone", icon: Target },
    ]
  },
  {
    id: "mlb",
    name: "MLB",
    description: "Baseball analytics and betting insights",
    icon: Target,
    href: "/mlb",
    color: "bg-blue-500",
    tools: [
      { name: "Prop Lab", href: "/mlb/tools/prop-lab", icon: Calculator },
      { name: "Weather", href: "/mlb/tools/weather", icon: Cloud },
      { name: "Matchups", href: "/mlb/tools/matchups", icon: BarChart3 },
    ]
  },
  {
    id: "nba",
    name: "NBA",
    description: "Basketball analytics and player props",
    icon: TrendingUp,
    href: "/nba",
    color: "bg-orange-500",
    tools: [
      { name: "Prop Lab", href: "/nba/tools/prop-lab", icon: Calculator },
      { name: "Player Stats", href: "/nba/stats/players", icon: Users },
      { name: "Team Stats", href: "/nba/stats/teams", icon: BarChart3 },
    ]
  },
  {
    id: "nhl",
    name: "NHL",
    description: "Hockey analytics and betting tools",
    icon: Shield,
    href: "/nhl",
    color: "bg-red-500",
    tools: [
      { name: "Prop Lab", href: "/nhl/tools/prop-lab", icon: Calculator },
      { name: "Player Stats", href: "/nhl/stats/players", icon: Users },
      { name: "Team Stats", href: "/nhl/stats/teams", icon: BarChart3 },
    ]
  }
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 p-8 bg-muted rounded-lg">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">KrashBoard V3</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The most advanced sports analytics and betting dashboard. 
          Get real-time data, insights, and tools to make smarter decisions.
        </p>
      </div>

      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sports.map((sport) => (
          <Card key={sport.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${sport.color} rounded-lg flex items-center justify-center`}>
                  <sport.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{sport.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {sport.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {sport.tools.slice(0, 3).map((tool) => (
                  <div key={tool.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <tool.icon className="h-3 w-3" />
                    <span>{tool.name}</span>
                  </div>
                ))}
                {sport.tools.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{sport.tools.length - 3} more tools
                  </div>
                )}
              </div>
              <Button asChild className="w-full">
                <Link href={sport.href}>
                  Explore {sport.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Why Choose KrashBoard?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Real-Time Data</CardTitle>
              <CardDescription>
                Get the latest stats, odds, and insights updated in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Advanced Tools</CardTitle>
              <CardDescription>
                Powerful calculators and analysis tools for smarter betting
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Data Accuracy</CardTitle>
              <CardDescription>
                100% accurate data from trusted sources with industry-leading reliability
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
