"use client"

import { usePathname } from "next/navigation"

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/nfl": "NFL",
  "/nfl/scores": "NFL Scores",
  "/nfl/lineups": "NFL Lineups",
  "/nfl/market": "NFL Market",
  "/nhl": "NHL",
  "/nba": "NBA",
  "/nba/scores": "NBA Scores",
  "/nba/lineups": "NBA Lineups",
  "/nba/prop-lab": "NBA Prop Lab",
  "/nba/market": "NBA Market",
  "/mlb": "MLB",
  "/mlb/scores": "MLB Scores",
  "/mlb/lineups": "MLB Lineups",
  "/mlb/weather-report": "MLB Weather Report",
  "/mlb/prop-lab": "MLB Prop Lab",
  "/mlb/market": "MLB Market",
  "/mlb/tools/player-vs-opp": "Batter vs Pitcher",
  "/mlb/tools/batter-vs-opp": "Batter vs Opponent",
  "/mlb/tools/batter-stats": "Batter Stats",
  "/mlb/tools/pitcher-stats": "Pitcher Stats",
  "/mlb/tools/team-stats": "Team Stats",
  "/mlb/tools/pitcher-report": "Pitcher Report",
  "/mlb/tools/calculators": "MLB Calculators",
  "/mlb/team/gamelogs": "Team Gamelogs",
  "/mlb/team/rankings": "Team Rankings",
  "/mlb/player/gamelogs": "Player Gamelogs",
  "/mlb/player/rankings": "Player Rankings",
  "/mlb/player/percentiles": "Player Percentiles",
  "/nfl/tools/prop-lab": "Prop Lab",
  "/nhl/tools/prop-lab": "Prop Lab",
  "/nhl/tools/player-vs-opp": "Player vs Opponent",
  "/nhl/tools/high-danger-shooters": "High Danger Shooters",
  "/settings": "Settings",
  "/tracker": "Tracker",
}

export function PageTitle() {
  const pathname = usePathname()
  
  // Find the matching title, checking for exact matches first, then partial matches
  let title = pageTitles[pathname]
  
  if (!title) {
    // Check for partial matches (e.g., /nhl/prop-lab/[player_id])
    for (const [path, pageTitle] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path) && path !== "/") {
        title = pageTitle
        break
      }
    }
  }
  
  // Fallback to a formatted version of the pathname
  if (!title) {
    const segments = pathname.split("/").filter(Boolean)
    title = segments.length > 0 
      ? segments[segments.length - 1].split("-").map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ")
      : "KrashBoard"
  }
  
  return (
    <h1 className="text-lg font-semibold text-foreground">
      {title}
    </h1>
  )
}
