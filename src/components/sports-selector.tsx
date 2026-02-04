"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useActiveSportId } from "@/hooks/use-active-sport"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sports = [
  {
    id: "nfl",
    name: "NFL",
    href: "/nfl",
    logo: "/Images/League_Logos/NFL-Logo.png",
    available: true,
  },
  {
    id: "nhl",
    name: "NHL",
    href: "/nhl",
    logo: "/Images/League_Logos/NHL-Logo.png",
    available: true,
  },
  {
    id: "nba",
    name: "NBA",
    href: "/nba",
    logo: "/Images/League_Logos/NBA-Logo.png",
    available: false,
  },
  {
    id: "mlb",
    name: "MLB",
    href: "/mlb",
    logo: "/Images/League_Logos/MLB-Logo.png",
    available: true,
  },
]

export function SportsSelector() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeSportId, setActiveSportId } = useActiveSportId(pathname)
  
  // Get current sport based on pathname
  const currentSport =
    sports.find((sport) => sport.id === activeSportId) ??
    sports.find(
      (sport) =>
        pathname.startsWith(sport.href) || (sport.href === "/nfl" && pathname === "/")
    ) ??
    sports[0]

  const handleSportSelect = (sport: typeof sports[0]) => {
    if (sport.available) {
      setActiveSportId(sport.id)
      router.push(sport.href)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex w-full items-center gap-2 px-3 py-2 h-9 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Image
            src={currentSport.logo}
            alt={currentSport.name}
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span className="font-medium group-data-[collapsible=icon]:hidden">
            {currentSport.name}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 group-data-[collapsible=icon]:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {sports.map((sport) => (
          <DropdownMenuItem
            key={sport.id}
            onClick={() => handleSportSelect(sport)}
            disabled={!sport.available}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          >
            <Image
              src={sport.logo}
              alt={sport.name}
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="flex-1">{sport.name}</span>
            {!sport.available && (
              <span className="text-xs text-muted-foreground">Coming Soon</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
