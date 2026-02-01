import { notFound } from "next/navigation"
import { queryNhlBigQuery } from "@/lib/bq"
import type { TeamPayload, TeamPayloadRow } from "@/types/nhlTeamPayload"

const TEAM_PAYLOAD_TABLE = "nhl25-473523.webapp.team_payload"

const NHL_TEAMS = new Set([
  "ANA", "BOS", "BUF", "CAR", "CBJ", "CGY", "CHI", "COL", "DAL", "DET",
  "EDM", "FLA", "LAK", "MIN", "MTL", "NSH", "NJD", "NYI", "NYR", "OTT",
  "PHI", "PIT", "SJS", "SEA", "STL", "TB", "TOR", "UTA", "VAN", "VGK",
  "WPG", "WSH",
])

type RawTeamPayloadRow = {
  team?: string
  data_version?: string | { value?: string }
  created_ts_utc?: string | { value?: string }
  payload_json?: unknown
}

export function normalizeTeamAbbr(input?: string | null): string | null {
  if (!input) return null
  const normalized = input.trim().toUpperCase()
  if (!normalized) return null
  if (!NHL_TEAMS.has(normalized)) return null
  return normalized
}

const extractDateValue = (value?: string | { value?: string } | null): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  return value.value ?? ""
}

const extractTimestampValue = (value?: string | { value?: string } | null): string => {
  if (!value) return ""
  if (typeof value === "string") return value
  return value.value ?? ""
}

const parsePayloadJson = (payloadJson: unknown): TeamPayload | null => {
  if (!payloadJson) return null

  let parsed: unknown = payloadJson
  if (typeof payloadJson === "string") {
    try {
      parsed = JSON.parse(payloadJson)
    } catch {
      return null
    }
  }

  if (!parsed || typeof parsed !== "object") return null
  const payload = parsed as Partial<TeamPayload>
  if (!payload.team || !Array.isArray(payload.gamelogs) || !Array.isArray(payload.rankings)) {
    return null
  }
  return payload as TeamPayload
}

const buildTeamPayloadRow = (row: RawTeamPayloadRow): TeamPayloadRow | null => {
  const payload = parsePayloadJson(row.payload_json)
  if (!payload) return null
  const team = row.team ? String(row.team).trim().toUpperCase() : payload.team
  return {
    team,
    data_version: extractDateValue(row.data_version),
    created_ts_utc: extractTimestampValue(row.created_ts_utc),
    payload,
  }
}

export async function getLatestTeamPayload(team: string): Promise<TeamPayloadRow | null> {
  const normalizedTeam = normalizeTeamAbbr(team)
  if (!normalizedTeam) return null

  const query = `
    SELECT team, data_version, created_ts_utc, payload_json
    FROM \`${TEAM_PAYLOAD_TABLE}\`
    WHERE team = @team
    ORDER BY data_version DESC, created_ts_utc DESC
    LIMIT 1
  `

  const rows = await queryNhlBigQuery<RawTeamPayloadRow>(query, { team: normalizedTeam })
  if (!rows.length) return null
  return buildTeamPayloadRow(rows[0])
}

export async function getLatestTeamPayloads(): Promise<TeamPayloadRow[]> {
  const query = `
    WITH latest AS (
      SELECT MAX(data_version) AS dv
      FROM \`${TEAM_PAYLOAD_TABLE}\`
    )
    SELECT team, data_version, created_ts_utc, payload_json
    FROM \`${TEAM_PAYLOAD_TABLE}\`
    WHERE data_version = (SELECT dv FROM latest)
  `

  const rows = await queryNhlBigQuery<RawTeamPayloadRow>(query)
  return rows
    .map((row) => buildTeamPayloadRow(row))
    .filter((row): row is TeamPayloadRow => Boolean(row))
}

export async function getTeamPayloadOrNotFound(team: string): Promise<TeamPayloadRow> {
  const payload = await getLatestTeamPayload(team)
  if (!payload) notFound()
  return payload
}
