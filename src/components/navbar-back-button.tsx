"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function NavbarBackButton() {
  const pathname = usePathname()
  
  // Only show back button on player prop pages
  if (!pathname?.includes('/prop-lab/') || !pathname?.match(/\/prop-lab\/[^/]+$/)) {
    return null
  }
  
  // Extract the league from the pathname
  const leagueMatch = pathname.match(/\/(nfl|nhl|nba|mlb)\//)
  const league = leagueMatch ? leagueMatch[1] : 'nhl'
  
  return (
    <Link href={`/${league}/tools/prop-lab`}>
      <Button variant="ghost" size="sm" className="gap-2 hover:bg-accent">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Props</span>
      </Button>
    </Link>
  )
}

