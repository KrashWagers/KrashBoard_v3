"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MlbCard, MlbCardContent } from "@/components/mlb/mlb-card"

const navItems = [
  { label: "Home", href: "/mlb" },
  { label: "Scores", href: "/mlb/scores" },
  { label: "Lineups", href: "/mlb/lineups" },
  { label: "Weather", href: "/mlb/weather-report" },
  { label: "Prop Lab", href: "/mlb/prop-lab" },
  { label: "Market", href: "/mlb/market" },
  { label: "Tools", href: "/mlb/tools/player-vs-opp" },
  { label: "Pitch Matrix", href: "/mlb/tools/pitch-matrix" },
  { label: "Team", href: "/mlb/team/gamelogs" },
  { label: "Player", href: "/mlb/player/gamelogs" },
]

export function MlbNavbar() {
  const pathname = usePathname()

  return (
    <MlbCard>
      <MlbCardContent className="px-3 py-2">
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mlb-nav-link",
                  isActive
                    ? "mlb-nav-link-active"
                    : "mlb-nav-link-inactive"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </MlbCardContent>
    </MlbCard>
  )
}
