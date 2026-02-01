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
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Radar,
  Layers,
  Activity,
  Quote,
  BadgeCheck
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { BRAND_TEAL } from "@/lib/brand"

const cardBase =
  "border border-gray-700 rounded-md bg-[#171717] transition-none hover:shadow-none hover:border-gray-700 hover:translate-y-0"

const buttonSecondary =
  "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/20"

const buttonModule =
  "border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20"

const nhlModules = [
  {
    id: "nfl",
    name: "Prop Lab",
    description: "Line research, hit rates, and player prop modeling",
    icon: Activity,
    href: "/nhl/tools/prop-lab",
  },
  {
    id: "players",
    name: "Player Research",
    description: "Game logs, usage trends, and matchup splits",
    icon: Users,
    href: "/nhl/stats/players",
  },
  {
    id: "teams",
    name: "Team Analytics",
    description: "Team form, pace, and opponent breakdowns",
    icon: BarChart3,
    href: "/nhl/stats/teams",
  },
  {
    id: "market",
    name: "The Market",
    description: "Line movement, pricing context, and edges",
    icon: Radar,
    href: "/nhl/tools/the-market",
  }
]

const proofLogos = [
  { id: "draftkings", name: "DraftKings", src: "/Images/Sportsbook_Logos/DraftKingsLogo.png" },
  { id: "fanduel", name: "FanDuel", src: "/Images/Sportsbook_Logos/FanDuelLogo.png" },
  { id: "betmgm", name: "BetMGM", src: "/Images/Sportsbook_Logos/betmgm.png" },
  { id: "bet365", name: "Bet365", src: "/Images/Sportsbook_Logos/bet365.png" },
  { id: "caesars", name: "Caesars", src: "/Images/Sportsbook_Logos/caesars-logo.png" },
  { id: "prizepicks", name: "PrizePicks", src: "/Images/Sportsbook_Logos/Prizepicks.png" }
]

const workflowSteps = [
  {
    title: "Identify the angle",
    description: "Start with upcoming slates, line movement, and matchup context.",
  },
  {
    title: "Validate with data",
    description: "Check hit rates, splits, and recent performance in seconds.",
  },
  {
    title: "Build your card",
    description: "Save research views and finalize action-ready insights.",
  },
]

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    billing: "forever",
    highlights: ["Limited prop views", "Basic game logs", "Community insights"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    billing: "per month",
    highlights: ["Full NHL Prop Lab", "Advanced filters", "Line movement tracking"],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "$49",
    billing: "per month",
    highlights: ["Unlimited research views", "Premium alerts", "Priority support"],
  },
]

const testimonials = [
  {
    id: "t1",
    quote:
      "The Prop Lab workflow finally lets me compare lines, hit rates, and opponents in one clean view.",
    name: "Riley K.",
    title: "NHL Researcher",
  },
  {
    id: "t2",
    quote:
      "I can move from slate to decision in minutes. The filters and splits make the edge obvious.",
    name: "Samantha G.",
    title: "Props Analyst",
  },
  {
    id: "t3",
    quote:
      "It feels like a real analytics platform, not just another betting tool.",
    name: "Troy M.",
    title: "Data-Driven Bettor",
  },
]

const faqs = [
  {
    id: "f1",
    question: "What makes KrashBoard different?",
    answer:
      "We focus on research-first workflows and clear visual hierarchy so you can act faster.",
  },
  {
    id: "f2",
    question: "Is the NHL Prop Lab live?",
    answer:
      "Yes. It updates with live odds, player trends, and matchup context throughout the day.",
  },
  {
    id: "f3",
    question: "Will other leagues be added?",
    answer:
      "Yes. NHL is the current focus while additional leagues are built out.",
  },
]

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-20">
      <section>
        <div className="grid gap-10 lg:grid-cols-[1fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-black/30 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" style={{ color: BRAND_TEAL }} />
              NHL analytics research platform
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Build NHL edges with{" "}
              <span style={{ color: BRAND_TEAL }}>real-time research</span>
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base leading-relaxed">
              KrashBoard V3 organizes live odds, player trends, and matchup context into
              a clean research workflow so you can move from question to decision faster.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                style={{ backgroundColor: BRAND_TEAL, color: "#0b0e13" }}
                className="h-11 px-5 text-sm font-semibold"
              >
                <Link href="/nhl/tools/prop-lab">
                  Open NHL Prop Lab
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className={`h-11 px-5 text-sm font-semibold ${buttonSecondary}`}>
                <Link href="/nhl">
                  Explore NHL Workspace
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: BRAND_TEAL }} />
                Live prop tracking and hit rates
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: BRAND_TEAL }} />
                Opponent, venue, and rest splits
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: BRAND_TEAL }} />
                Research-first analytics layout
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-12 border-t border-gray-800/60">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Trusted data partners
          </p>
          <h2 className="text-2xl font-semibold">Sportsbooks and market sources</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {proofLogos.map((logo) => (
            <Card key={logo.id} className={cardBase}>
              <CardContent className="flex items-center justify-center p-4">
                <Image
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={120}
                  height={48}
                  className="h-10 w-auto object-contain opacity-90"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-12 border-t border-gray-800/60">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">NHL Research Modules</h2>
            <p className="text-sm text-muted-foreground">
              Start with a focused workflow and expand as you build your edge.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/nhl">
              View NHL Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {nhlModules.map((module) => (
            <Card key={module.id} className={cardBase}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black/30">
                    <module.icon className="h-5 w-5" style={{ color: BRAND_TEAL }} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col">
                <Button asChild className={`w-full ${buttonModule}`}>
                  <Link href={module.href}>
                    Open Module
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          More leagues are coming soon — this workspace is focused on NHL right now.
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start pt-12 border-t border-gray-800/60">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">The research workflow</h2>
          <p className="text-sm text-muted-foreground">
            A repeatable process that mirrors how sharp bettors actually research.
          </p>
          <div className="space-y-3">
            {workflowSteps.map((step, index) => (
              <Card key={step.title} className={cardBase}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-black/30 text-sm font-semibold"
                    style={{ color: BRAND_TEAL }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{step.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <Card className={cardBase}>
          <CardContent className="p-6 space-y-3">
            <div className="text-xs text-muted-foreground">Research visualization</div>
            <div className="aspect-[4/3] rounded-md border border-gray-700 bg-black/40 flex items-center justify-center text-xs text-muted-foreground">
              Placeholder workflow screenshot
            </div>
            <p className="text-xs text-muted-foreground">
              Replace this with a real research workflow screenshot when ready.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6 pt-12 border-t border-gray-800/60">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Why KrashBoard</h2>
          <p className="text-sm text-muted-foreground">
            A research platform built for clarity, speed, and repeatable workflows.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className={cardBase}>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black/30">
                <Layers className="h-5 w-5" style={{ color: BRAND_TEAL }} />
              </div>
              <CardTitle className="text-lg">Layered Research</CardTitle>
              <CardDescription>
                Stack performance data, opponent context, and market movement in one view.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className={cardBase}>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black/30">
                <TrendingUp className="h-5 w-5" style={{ color: BRAND_TEAL }} />
              </div>
              <CardTitle className="text-lg">Signal Over Noise</CardTitle>
              <CardDescription>
                Visuals prioritize the metrics that matter, so insights show up fast.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className={cardBase}>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-black/30">
                <Target className="h-5 w-5" style={{ color: BRAND_TEAL }} />
              </div>
              <CardTitle className="text-lg">Decision Ready</CardTitle>
              <CardDescription>
                Research summaries guide you from trend discovery to actionable bets.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="space-y-6 pt-12 border-t border-gray-800/60">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-semibold">Pricing plans</h2>
          <p className="text-sm text-muted-foreground">
            Placeholder pricing until final plans are confirmed.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className={cardBase}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{plan.name}</div>
                  {plan.featured && (
                    <span
                      className="rounded-full px-2 py-1 text-xs font-semibold bg-black/30 border border-gray-700"
                      style={{ color: BRAND_TEAL }}
                    >
                      Most popular
                    </span>
                  )}
                </div>
                <div className="text-3xl font-semibold">
                  {plan.price}
                  <span className="text-sm text-muted-foreground font-normal">
                    {" "} / {plan.billing}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {plan.highlights.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4" style={{ color: BRAND_TEAL }} />
                      {item}
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full ${plan.featured ? "" : buttonSecondary}`}
                  variant={plan.featured ? "default" : "outline"}
                  style={plan.featured ? { backgroundColor: BRAND_TEAL, color: "#0b0e13" } : undefined}
                >
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-12 border-t border-gray-800/60">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-semibold">What early users say</h2>
          <p className="text-sm text-muted-foreground">
            Placeholder testimonials until real quotes are ready.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.id} className={cardBase}>
              <CardContent className="p-6 space-y-4">
                <Quote className="h-5 w-5" style={{ color: BRAND_TEAL }} />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  “{item.quote}”
                </p>
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-12 border-t border-gray-800/60">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
          <p className="text-sm text-muted-foreground">
            Placeholder answers until final messaging is set.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.id} className={cardBase}>
              <CardContent className="p-5 space-y-2">
                <div className="text-sm font-semibold">{faq.question}</div>
                <div className="text-sm text-muted-foreground">{faq.answer}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="pt-12 border-t border-gray-800/60">
        <Card className={cardBase}>
          <CardContent className="p-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Ready to build your NHL edge?</h2>
              <p className="text-sm text-muted-foreground">
                Start researching with live data and a research-first workflow today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                style={{ backgroundColor: BRAND_TEAL, color: "#0b0e13" }}
                className="h-11 px-5 text-sm font-semibold"
              >
                <Link href="/nhl/tools/prop-lab">Launch Prop Lab</Link>
              </Button>
              <Button asChild variant="outline" className={`h-11 px-5 text-sm font-semibold ${buttonSecondary}`}>
                <Link href="/nhl">Explore NHL Workspace</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
