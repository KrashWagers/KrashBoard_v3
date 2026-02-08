import * as React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import mlbTeamColors from "@/data/mlb-team-colors.json"
import type { DefaultLineupSlot } from "@/app/api/mlb/default-lineups/route"

const cardClass = "rounded-md border border-gray-700 bg-[#171717] shadow-none"

type TeamSide = {
  teamAbv: string
  teamLogo: string | null
  expectedStarterName: string | null
  headshotUrl: string | null
}

export type MlbLineupsGame = {
  gameId: string
  gameDate: string | null
  gameDateLabel: string | null
  gameTimeEst: string | null
  homeTeam: TeamSide | null
  awayTeam: TeamSide | null
}

const HITTER_SLOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

type TeamColorEntry = {
  teamAbv: string
  primary: string
  secondary: string
  logoBg?: "primary" | "secondary"
  logoBgColor?: string
}

const teamColorMap = new Map(
  (mlbTeamColors as TeamColorEntry[]).map((entry) => [entry.teamAbv, entry])
)

function getTeamLogoColor(teamAbv: string): string {
  const entry = teamColorMap.get(teamAbv)
  if (!entry) return "#1f2937"
  if (entry.logoBgColor) return entry.logoBgColor
  return entry.logoBg === "primary" ? entry.primary : entry.secondary
}

function StarterHeadshot({ name, url }: { name: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[10px] font-semibold text-white/70">
        SP
      </div>
    )
  }

  return (
    <Image
      src={url}
      alt={name}
      width={32}
      height={32}
      className="h-8 w-8 rounded-full object-cover"
    />
  )
}

function LineupSlotCard({
  slot,
  player,
}: {
  slot: number
  player: DefaultLineupSlot | undefined
}) {
  const name = player?.playerName?.trim() ?? ""
  const pos = player?.positionGroup?.trim() ?? ""
  const label = pos ? `${name} · ${pos}` : name || "—"

  return (
    <Card className={cardClass}>
      <CardContent className="flex h-9 items-center gap-2 px-3 py-2">
        <span className="text-[11px] font-medium tabular-nums text-white/50">{slot}</span>
        <span className="truncate text-sm text-white/90">{label}</span>
      </CardContent>
    </Card>
  )
}

function TeamBlock({
  label,
  team,
  lineupSlots,
}: {
  label: string
  team: TeamSide | null
  lineupSlots: DefaultLineupSlot[] | undefined
}) {
  const teamName = team?.teamAbv ?? "TBD"
  const starterName = team?.expectedStarterName ?? "TBD"
  const slotsByNumber = (() => {
    if (!lineupSlots?.length) return null
    const map = new Map<number, DefaultLineupSlot>()
    for (const s of lineupSlots) {
      map.set(s.slot, s)
    }
    return map
  })()

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15"
          style={{ backgroundColor: getTeamLogoColor(teamName) }}
        >
          {team?.teamLogo ? (
            <Image
              src={team.teamLogo}
              alt={teamName}
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          ) : (
            <span className="text-xs font-semibold text-white/70">{teamName}</span>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-white/90">{teamName}</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">{label}</div>
        </div>
      </div>

      <Card className={cardClass}>
        <CardContent className="flex items-center gap-2 p-3">
          <StarterHeadshot name={starterName} url={team?.headshotUrl ?? null} />
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">Projected SP</div>
            <div className="text-sm font-medium text-white/85">{starterName}</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">Lineup</div>
        <div className="grid grid-cols-1 gap-1.5">
          {HITTER_SLOTS.map((slot) => (
            <LineupSlotCard
              key={`${teamName}-${slot}`}
              slot={slot}
              player={slotsByNumber?.get(slot)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function LineupsMatchupCard({
  game,
  defaultLineupsByTeam = {},
}: {
  game: MlbLineupsGame
  defaultLineupsByTeam?: Record<string, DefaultLineupSlot[]>
}) {
  const awayLabel = game.awayTeam?.teamAbv ?? "Away"
  const homeLabel = game.homeTeam?.teamAbv ?? "Home"
  const awayAbbr = game.awayTeam?.teamAbv?.toUpperCase() ?? ""
  const homeAbbr = game.homeTeam?.teamAbv?.toUpperCase() ?? ""

  return (
    <Card className={`h-full ${cardClass}`}>
      <CardHeader className="space-y-1.5 p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white/90">
            {awayLabel} @ {homeLabel}
          </div>
          <div className="text-xs text-white/60">{game.gameTimeEst ?? "TBD"}</div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4 pt-0 text-white/80">
        <div className="grid gap-4 md:grid-cols-2">
          <TeamBlock
            label="Away"
            team={game.awayTeam}
            lineupSlots={defaultLineupsByTeam[awayAbbr]}
          />
          <TeamBlock
            label="Home"
            team={game.homeTeam}
            lineupSlots={defaultLineupsByTeam[homeAbbr]}
          />
        </div>

        <Card className={cardClass}>
          <CardContent className="flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-white/55">
            <span>Weather</span>
            <span className="text-white/45">—</span>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
