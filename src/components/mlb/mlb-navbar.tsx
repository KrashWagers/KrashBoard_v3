"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

const cardBase = "rounded-md border border-gray-700 bg-[#171717] shadow-none transition-none"

const navItems = [
  { label: "Home", href: "/mlb" },
  { label: "Scores", href: "/mlb/scores" },
  { label: "Lineups", href: "/mlb/lineups" },
  { label: "Weather", href: "/mlb/weather-report" },
  { label: "Prop Lab", href: "/mlb/prop-lab" },
  { label: "Market", href: "/mlb/market" },
  { label: "Tools", href: "/mlb/tools/player-vs-opp" },
  { label: "Team", href: "/mlb/team/gamelogs" },
  { label: "Player", href: "/mlb/player/gamelogs" },
]

export function MlbNavbar() {
  const pathname = usePathname()

  return (
    <Card className={cardBase}>
      <CardContent className="p-3">
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-none",
                  isActive
                    ? "border-gray-600 bg-black/40 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}
