export type GameWeekDay = {
  date: string
  dayAbbrev?: string
  numberOfGames?: number
}

export type TeamSummary = {
  id?: number
  abbrev?: string
  logo?: string
  score?: number
  sog?: number
  record?: {
    wins?: number
    losses?: number
    ot?: number
    recordSummary?: string
    summary?: string
  }
}

export type GameSummary = {
  id: number
  gameId?: number
  gamePk?: number
  gameCenterLink?: string
  gamecenterLink?: string
  gameLink?: string
  gameState?: string
  startTimeUTC?: string
  venue?: {
    default?: string
    city?: string
  }
  periodDescriptor?: {
    number?: number
    periodType?: string
  }
  clock?: {
    timeRemaining?: string
    running?: boolean
  }
  awayTeam?: TeamSummary
  homeTeam?: TeamSummary
  tvBroadcasts?: Array<{
    market?: string
    network?: string
    link?: string
    streamLink?: string
  }>
  goals?: Array<{
    scorer?: { name?: { default?: string } | string }
    assists?: Array<{ name?: { default?: string } | string }>
    description?: string
  }>
}
