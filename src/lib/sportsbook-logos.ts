/**
 * Fixed list of all books for The Market table.
 * Default display order is DEFAULT_MARKET_BOOK_ORDER; user can reorder and filter.
 */
export const ALL_MARKET_BOOKS: string[] = [
  "ballybet",
  "bet365",
  "betmgm",
  "betonline",
  "betrsportsbook",
  "betrivers",
  "betway",
  "bodog",
  "bookmakereu",
  "bovada",
  "caesars",
  "circa",
  "draftkings",
  "fanatics",
  "fanduel",
  "fliff",
  "hardrockbet",
  "mybookie",
  "northstarbets",
  "parlayplay",
  "pinnacle",
  "pointsbet",
  "prizepicks",
  "sleeper",
  "thescorebet",
  "underdog",
]

/** Preferred column order for The Market: these first, then the rest of ALL_MARKET_BOOKS. */
export const DEFAULT_MARKET_BOOK_ORDER: string[] = [
  "pinnacle",
  "circa",
  "fanduel",
  "draftkings",
  "betmgm",
  "caesars",
  "fanatics",
  "thescorebet",
  "bet365",
]

/**
 * Map bookmaker_id (API value) → logo path under public/Images/Sportsbook_Logos_Round
 * Used for NBA Market, +EV, and any other odds screens.
 */
export const SPORTSBOOK_LOGO: Record<string, string> = {
  ballybet: "/Images/Sportsbook_Logos_Round/BallyBet.png",
  bet365: "/Images/Sportsbook_Logos_Round/Bet365.png",
  betmgm: "/Images/Sportsbook_Logos_Round/BetMGM.png",
  betonline: "/Images/Sportsbook_Logos_Round/BetOnline.png",
  betrsportsbook: "/Images/Sportsbook_Logos_Round/Betr.png",
  betrivers: "/Images/Sportsbook_Logos_Round/BetRivers.png",
  betway: "/Images/Sportsbook_Logos_Round/Betway.png",
  bodog: "/Images/Sportsbook_Logos_Round/Bodog.png",
  bookmakereu: "/Images/Sportsbook_Logos_Round/Bookmaker.png",
  bovada: "/Images/Sportsbook_Logos_Round/Bovada.png",
  caesars: "/Images/Sportsbook_Logos_Round/Caesers.png",
  circa: "/Images/Sportsbook_Logos_Round/Circa.png",
  draftkings: "/Images/Sportsbook_Logos_Round/DraftKings.png",
  fanatics: "/Images/Sportsbook_Logos_Round/Fanatics.png",
  fanduel: "/Images/Sportsbook_Logos_Round/FanDuel.png",
  fliff: "/Images/Sportsbook_Logos_Round/Fliff.png",
  hardrockbet: "/Images/Sportsbook_Logos_Round/Hardrock.png",
  mybookie: "/Images/Sportsbook_Logos_Round/MyBookie.png",
  northstarbets: "/Images/Sportsbook_Logos_Round/NorthStar.png",
  parlayplay: "/Images/Sportsbook_Logos_Round/ParlayPlay.png",
  pinnacle: "/Images/Sportsbook_Logos_Round/Pinnacle.png",
  pinnacle_offshore: "/Images/Sportsbook_Logos_Round/Pinnacle.png",
  pointsbet: "/Images/Sportsbook_Logos_Round/PointsBet.png",
  prizepicks: "/Images/Sportsbook_Logos_Round/PrizePicks.png",
  sleeper: "/Images/Sportsbook_Logos_Round/Sleeper.png",
  thescorebet: "/Images/Sportsbook_Logos_Round/theScore.png",
  underdog: "/Images/Sportsbook_Logos_Round/UnderDog.png",
}

/** Display label for books that differ from id (e.g. bookmakereu → "Bookmaker") */
export const SPORTSBOOK_LABEL: Record<string, string> = {
  bookmakereu: "Bookmaker",
  betrsportsbook: "Betr",
  hardrockbet: "Hard Rock",
  northstarbets: "North Star",
  parlayplay: "Parlay Play",
  prizepicks: "Prize Picks",
  thescorebet: "theScore",
  underdog: "Underdog",
}

export function getSportsbookLogoUrl(bookmakerId: string): string | null {
  const key = bookmakerId.toLowerCase().replace(/-/g, "")
  return SPORTSBOOK_LOGO[key] ?? SPORTSBOOK_LOGO[bookmakerId] ?? null
}

export function getSportsbookLabel(bookmakerId: string): string {
  return (
    SPORTSBOOK_LABEL[bookmakerId] ??
    bookmakerId.charAt(0).toUpperCase() + bookmakerId.slice(1).replace(/_/g, " ")
  )
}
