import { queryNhlBigQuery } from "@/lib/bigquery"

export type LineupRoleType = "FWD" | "DEF" | "G" | "PP"
export type LineupPosition = "LW" | "C" | "RW" | "LD" | "RD" | "G"

export type LineupPlayerRow = {
  game_id: string | null
  game_date: string | { value?: string } | null
  team_abbr: string | null
  opponent_abbr: string | null
  is_home: boolean | null
  player_name: string | null
  player_key: string | null
  role_type: LineupRoleType | null
  pos_code: LineupPosition | string | null
  line_num: number | null
  pair_num: number | null
  goalie_depth: number | null
  slot: string | null
  pp_unit: number | null
  pp_slot: number | null
  scrape_ts_utc: number | string | null
  last_updated_text: string | null
  source_url: string | null
}

export type TeamLineupVM = {
  meta: {
    gameId: string | null
    gameDate: string | null
    teamAbbr: string
    opponentAbbr: string | null
    isHome: boolean | null
    lastUpdatedText: string | null
    sourceUrl: string | null
    scrapeTsUtc: number | null
  }
  forwards: { lineNum: 1 | 2 | 3 | 4; LW?: LineupPlayerRow; C?: LineupPlayerRow; RW?: LineupPlayerRow }[]
  defense: { pairNum: 1 | 2 | 3; LD?: LineupPlayerRow; RD?: LineupPlayerRow }[]
  goalies: { starter?: LineupPlayerRow; backup?: LineupPlayerRow }
  powerplay: {
    unit1: (LineupPlayerRow | null)[]
    unit2: (LineupPlayerRow | null)[]
  }
}

export type LineupTeamSummary = {
  teamAbbr: string
  scrapeTsUtc: number | null
}

const LINEUPS_VIEW = "nhl25-473523.webapp.lineup_players_today_vw"

const TEAM_LOGO_MAP: Record<string, string> = {
  ANA: "/Images/NHL_Logos/ANA.png",
  BOS: "/Images/NHL_Logos/BOS.png",
  BUF: "/Images/NHL_Logos/BUF.png",
  CAR: "/Images/NHL_Logos/CAR.png",
  CBJ: "/Images/NHL_Logos/CBJ.png",
  CGY: "/Images/NHL_Logos/CGY.png",
  CHI: "/Images/NHL_Logos/CHI.png",
  COL: "/Images/NHL_Logos/COL.png",
  DAL: "/Images/NHL_Logos/DAL.png",
  DET: "/Images/NHL_Logos/DET.png",
  EDM: "/Images/NHL_Logos/EDM.png",
  FLA: "/Images/NHL_Logos/FLA.png",
  LAK: "/Images/NHL_Logos/LAK.png",
  MIN: "/Images/NHL_Logos/MIN.png",
  MTL: "/Images/NHL_Logos/MTL.png",
  NJD: "/Images/NHL_Logos/NJD.png",
  NSH: "/Images/NHL_Logos/NSH.png",
  NYI: "/Images/NHL_Logos/NYI.png",
  NYR: "/Images/NHL_Logos/NYR.png",
  OTT: "/Images/NHL_Logos/OTT.png",
  PHI: "/Images/NHL_Logos/PHI.png",
  PIT: "/Images/NHL_Logos/PIT.png",
  SEA: "/Images/NHL_Logos/SEA.png",
  SJS: "/Images/NHL_Logos/SJS.png",
  STL: "/Images/NHL_Logos/STL.png",
  TB: "/Images/NHL_Logos/TB.png",
  TOR: "/Images/NHL_Logos/TOR.png",
  UTA: "/Images/NHL_Logos/UTA.png",
  VAN: "/Images/NHL_Logos/VAN.png",
  VGK: "/Images/NHL_Logos/VGK.png",
  WPG: "/Images/NHL_Logos/WPG.png",
  WSH: "/Images/NHL_Logos/WSH.png",
}

const TEAM_NAME_MAP: Record<string, string> = {
  ANA: "Anaheim Ducks",
  BOS: "Boston Bruins",
  BUF: "Buffalo Sabres",
  CAR: "Carolina Hurricanes",
  CBJ: "Columbus Blue Jackets",
  CGY: "Calgary Flames",
  CHI: "Chicago Blackhawks",
  COL: "Colorado Avalanche",
  DAL: "Dallas Stars",
  DET: "Detroit Red Wings",
  EDM: "Edmonton Oilers",
  FLA: "Florida Panthers",
  LAK: "Los Angeles Kings",
  MIN: "Minnesota Wild",
  MTL: "Montreal Canadiens",
  NJD: "New Jersey Devils",
  NSH: "Nashville Predators",
  NYI: "New York Islanders",
  NYR: "New York Rangers",
  OTT: "Ottawa Senators",
  PHI: "Philadelphia Flyers",
  PIT: "Pittsburgh Penguins",
  SEA: "Seattle Kraken",
  SJS: "San Jose Sharks",
  STL: "St. Louis Blues",
  TB: "Tampa Bay Lightning",
  TOR: "Toronto Maple Leafs",
  UTA: "Utah Hockey Club",
  VAN: "Vancouver Canucks",
  VGK: "Vegas Golden Knights",
  WPG: "Winnipeg Jets",
  WSH: "Washington Capitals",
}

const TEAM_ABBR_ALIASES: Record<string, string> = {
  SJ: "SJS",
  TBL: "TB",
}

export function getNhlTeamLogo(teamAbbr: string | null | undefined): string {
  if (!teamAbbr) return "/Images/League_Logos/NHL-Logo.png"
  const normalized = normalizeTeamAbbr(teamAbbr)
  if (!normalized) return "/Images/League_Logos/NHL-Logo.png"
  return TEAM_LOGO_MAP[normalized] || "/Images/League_Logos/NHL-Logo.png"
}

export function getNhlTeamName(teamAbbr: string | null | undefined): string | null {
  if (!teamAbbr) return null
  const normalized = normalizeTeamAbbr(teamAbbr)
  if (!normalized) return null
  return TEAM_NAME_MAP[normalized] || normalized
}

export function formatUpdatedAgo(scrapeTsUtc: number | string | null): string | null {
  const timestamp = toTimestampMs(scrapeTsUtc)
  if (!timestamp) return null
  const deltaMs = Date.now() - timestamp
  const minutes = Math.max(0, Math.round(deltaMs / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder > 0 ? `${hours}h ${remainder}m ago` : `${hours}h ago`
}

export async function getLineupTeams(): Promise<LineupTeamSummary[]> {
  const query = `
    SELECT team_abbr, MAX(scrape_ts_utc) AS scrape_ts_utc
    FROM \`${LINEUPS_VIEW}\`
    GROUP BY team_abbr
    ORDER BY team_abbr
  `
  const rows = await queryNhlBigQuery<{ team_abbr: string; scrape_ts_utc: number | string | null }>(query)
  const rowMap = new Map<string, number | null>()
  rows
    .filter((row) => !!row.team_abbr)
    .forEach((row) => {
      const normalized = normalizeTeamAbbr(row.team_abbr)
      if (!normalized) return
      rowMap.set(normalized, toNumberOrNull(row.scrape_ts_utc))
    })

  return getAllNhlTeamAbbrs().map((teamAbbr) => ({
    teamAbbr,
    scrapeTsUtc: rowMap.get(teamAbbr) ?? null,
  }))
}

export async function getTeamLineup(teamAbbr: string): Promise<TeamLineupVM | null> {
  const normalized = normalizeTeamAbbr(teamAbbr)
  if (!normalized) return null
  const todayQuery = `
    SELECT *
    FROM \`${LINEUPS_VIEW}\`
    WHERE team_abbr = @team_abbr
    AND game_date = CURRENT_DATE('America/Toronto')
    ORDER BY role_type, line_num, pair_num, goalie_depth, pp_unit, pp_slot
  `
  const todayRows = await queryNhlBigQuery<LineupPlayerRow>(todayQuery, { team_abbr: normalized })
  if (todayRows.length) {
    return buildTeamLineupVM(todayRows, normalized)
  }

  const latestDateQuery = `
    SELECT MAX(game_date) AS game_date
    FROM \`${LINEUPS_VIEW}\`
    WHERE team_abbr = @team_abbr
  `
  const latestDateRows = await queryNhlBigQuery<{ game_date: string | { value?: string } | null }>(
    latestDateQuery,
    { team_abbr: normalized }
  )
  const latestDate = getDateValue(latestDateRows?.[0]?.game_date)
  if (!latestDate) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[lineups] no rows for team", { teamAbbr, normalized })
    }
    return null
  }

  const latestQuery = `
    SELECT *
    FROM \`${LINEUPS_VIEW}\`
    WHERE team_abbr = @team_abbr
    AND game_date = @game_date
    ORDER BY role_type, line_num, pair_num, goalie_depth, pp_unit, pp_slot
  `
  const latestRows = await queryNhlBigQuery<LineupPlayerRow>(latestQuery, {
    team_abbr: normalized,
    game_date: latestDate,
  })

  if (process.env.NODE_ENV === "development") {
    console.info("[lineups] fallback latest date", {
      teamAbbr,
      normalized,
      latestDate,
      rows: latestRows.length,
    })
  }

  if (!latestRows.length) return null
  return buildTeamLineupVM(latestRows, normalized)
}

export function buildTeamLineupVM(rows: LineupPlayerRow[], teamAbbrOverride?: string): TeamLineupVM {
  const first = rows[0]
  const meta = {
    gameId: first?.game_id ?? null,
    gameDate: getDateValue(first?.game_date),
    teamAbbr: teamAbbrOverride || normalizeTeamAbbr(first?.team_abbr) || "UNK",
    opponentAbbr: normalizeTeamAbbr(first?.opponent_abbr) || first?.opponent_abbr || null,
    isHome: first?.is_home ?? null,
    lastUpdatedText: first?.last_updated_text ?? null,
    sourceUrl: first?.source_url ?? null,
    scrapeTsUtc: toNumberOrNull(first?.scrape_ts_utc),
  }

  const forwards = buildForwardLines(rows)
  const defense = buildDefensePairs(rows)
  const goalies = buildGoalies(rows)
  const powerplay = buildPowerPlay(rows)

  return {
    meta,
    forwards,
    defense,
    goalies,
    powerplay,
  }
}

function buildForwardLines(rows: LineupPlayerRow[]) {
  const lines = new Map<number, { lineNum: 1 | 2 | 3 | 4; LW?: LineupPlayerRow; C?: LineupPlayerRow; RW?: LineupPlayerRow }>()
  for (let i = 1; i <= 4; i += 1) {
    lines.set(i, { lineNum: i as 1 | 2 | 3 | 4 })
  }

  rows
    .filter((row) => normalizeRoleType(row.role_type) === "FWD")
    .forEach((row) => {
      const lineNum = row.line_num ?? null
      if (!lineNum || !lines.has(lineNum)) return
      const position = inferPosition(row)
      const line = lines.get(lineNum)
      if (!line || !position) return
      if (position === "LW" && !line.LW) line.LW = row
      if (position === "C" && !line.C) line.C = row
      if (position === "RW" && !line.RW) line.RW = row
    })

  return Array.from(lines.values())
}

function buildDefensePairs(rows: LineupPlayerRow[]) {
  const pairs = new Map<number, { pairNum: 1 | 2 | 3; LD?: LineupPlayerRow; RD?: LineupPlayerRow }>()
  for (let i = 1; i <= 3; i += 1) {
    pairs.set(i, { pairNum: i as 1 | 2 | 3 })
  }

  rows
    .filter((row) => normalizeRoleType(row.role_type) === "DEF")
    .forEach((row) => {
      const pairNum = row.pair_num ?? null
      if (!pairNum || !pairs.has(pairNum)) return
      const position = inferPosition(row)
      const pair = pairs.get(pairNum)
      if (!pair || !position) return
      if (position === "LD" && !pair.LD) pair.LD = row
      if (position === "RD" && !pair.RD) pair.RD = row
    })

  return Array.from(pairs.values())
}

function buildGoalies(rows: LineupPlayerRow[]) {
  const goalies = rows.filter((row) => normalizeRoleType(row.role_type) === "G")
  const starter = goalies.find((row) => row.goalie_depth === 1) || goalies[0]
  const backup = goalies.find((row) => row.goalie_depth === 2)
  return { starter: starter || undefined, backup: backup || undefined }
}

function buildPowerPlay(rows: LineupPlayerRow[]) {
  const unit1 = Array(5).fill(null) as (LineupPlayerRow | null)[]
  const unit2 = Array(5).fill(null) as (LineupPlayerRow | null)[]

  rows.forEach((row) => {
    if (!row.pp_unit || !row.pp_slot) return
    if (row.pp_unit !== 1 && row.pp_unit !== 2) return
    if (row.pp_slot < 1 || row.pp_slot > 5) return
    const index = row.pp_slot - 1
    if (row.pp_unit === 1 && !unit1[index]) unit1[index] = row
    if (row.pp_unit === 2 && !unit2[index]) unit2[index] = row
  })

  return { unit1, unit2 }
}

function inferPosition(row: LineupPlayerRow): LineupPosition | null {
  const pos = normalizePosition(row.pos_code)
  if (pos) return pos
  const slot = row.slot?.toUpperCase() || ""
  if (slot.startsWith("LW")) return "LW"
  if (slot.startsWith("C")) return "C"
  if (slot.startsWith("RW")) return "RW"
  if (slot.startsWith("LD")) return "LD"
  if (slot.startsWith("RD")) return "RD"
  if (slot.startsWith("G")) return "G"
  return null
}

function normalizePosition(pos?: string | null): LineupPosition | null {
  if (!pos) return null
  const normalized = pos.trim().toUpperCase()
  if (normalized === "LW" || normalized === "C" || normalized === "RW" || normalized === "LD" || normalized === "RD" || normalized === "G") {
    return normalized
  }
  return null
}

function normalizeRoleType(roleType?: string | null): LineupRoleType | null {
  if (!roleType) return null
  const normalized = roleType.trim().toUpperCase()
  if (normalized === "FWD" || normalized === "DEF" || normalized === "G" || normalized === "PP") {
    return normalized as LineupRoleType
  }
  return null
}

function normalizeTeamAbbr(teamAbbr?: string | null): string | null {
  if (!teamAbbr) return null
  const cleaned = teamAbbr.trim().toUpperCase()
  if (!/^[A-Z]{2,4}$/.test(cleaned)) return null
  return TEAM_ABBR_ALIASES[cleaned] || cleaned
}

function getAllNhlTeamAbbrs(): string[] {
  return Object.keys(TEAM_LOGO_MAP).sort()
}

function toNumberOrNull(value: number | string | null | undefined): number | null {
  if (value == null) return null
  const parsed = typeof value === "string" ? Number(value) : value
  return Number.isFinite(parsed) ? parsed : null
}

function toTimestampMs(value: number | string | null | undefined): number | null {
  const numeric = toNumberOrNull(value)
  if (!numeric) return null
  // Heuristic: seconds vs milliseconds based on magnitude
  return numeric > 1e12 ? numeric : numeric * 1000
}

function getDateValue(value: LineupPlayerRow["game_date"]): string | null {
  if (!value) return null
  if (typeof value === "string") return value
  if (typeof value === "object" && value.value) return value.value
  return null
}
