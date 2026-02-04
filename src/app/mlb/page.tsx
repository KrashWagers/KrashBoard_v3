import * as React from "react"

type MlbHomeTile = {
  title: string
  description: string
  meta: string
}

const corePages: MlbHomeTile[] = [
  { title: "Scores", description: "Live scoreboard and daily slate overview.", meta: "Daily" },
  { title: "Lineups", description: "Projected and confirmed lineups with notes.", meta: "Pre-game" },
  { title: "Prop Lab", description: "Player prop research and hit-rate tracking.", meta: "Props" },
  { title: "Market", description: "Odds movement and price context.", meta: "Markets" },
]

const toolPages: MlbHomeTile[] = [
  { title: "Weather Report", description: "Ballpark conditions and delay risk.", meta: "Risk" },
  { title: "Batter vs Pitcher", description: "Head-to-head matchup history.", meta: "Splits" },
  { title: "Batter vs Opp", description: "Opponent-based hitter splits.", meta: "Matchups" },
  { title: "Pitcher Report", description: "Pitch mix, form, and matchup context.", meta: "Pitching" },
  { title: "Batter Stats", description: "Hitting metrics and form trends.", meta: "Stats" },
  { title: "Pitcher Stats", description: "Pitching metrics and workload.", meta: "Stats" },
  { title: "Team Stats", description: "Team-level trends and splits.", meta: "Stats" },
]

function MlbHomeSection({
  title,
  description,
  items,
}: {
  title: string
  description: string
  items: MlbHomeTile[]
}) {
  return (
    <section className="space-y-2">
      <div className="space-y-1">
        <h2 className="mlb-section-title text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="mlb-glass-tile group relative overflow-hidden rounded-[4px] px-3 py-2 transition-all duration-200 hover:-translate-y-[2px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white/95">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-white/65">{item.description}</p>
              </div>
              <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/55">
                {item.meta}
              </span>
            </div>
            <div className="mt-2 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
            <p className="mt-2 text-[11px] text-white/55">
              Placeholder layout — data and controls will land here.
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function MlbHomePage() {
  return (
    <div className="space-y-10">
      <div className="mlb-glass-hero relative overflow-hidden rounded-[4px] px-4 py-3">
        <h1 className="text-2xl font-semibold tracking-tight text-white/95">MLB Home</h1>
        <p className="mt-1 text-sm text-white/65">
          MLB analytics workspace with mobile-first, professional layout placeholders.
        </p>
      </div>

      <MlbHomeSection
        title="Core Pages"
        description="Primary MLB workflows for daily research."
        items={corePages}
      />
      <MlbHomeSection
        title="Tools"
        description="Specialized MLB analysis tools."
        items={toolPages}
      />
    </div>
  )
}
