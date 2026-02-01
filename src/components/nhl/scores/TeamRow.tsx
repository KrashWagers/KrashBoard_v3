import Image from 'next/image'
import { TeamSummary } from './types'

type TeamRowProps = {
  team?: TeamSummary
  isHome?: boolean
}

function getRecord(team?: TeamSummary): string | null {
  if (!team?.record) return null
  if (team.record.summary) return team.record.summary
  if (team.record.recordSummary) return team.record.recordSummary
  const wins = team.record.wins ?? 0
  const losses = team.record.losses ?? 0
  const ot = team.record.ot
  return ot != null ? `${wins}-${losses}-${ot}` : `${wins}-${losses}`
}

function getLogoUrl(team?: TeamSummary): string | null {
  if (team?.logo) return team.logo
  if (!team?.abbrev) return null
  return `https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_dark.svg`
}

export function TeamRow({ team, isHome }: TeamRowProps) {
  const record = getRecord(team)
  const logoUrl = getLogoUrl(team)

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 shrink-0">
          {logoUrl ? (
            <Image src={logoUrl} alt={team?.abbrev || 'Team'} width={32} height={32} />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{team?.abbrev || (isHome ? 'HOME' : 'AWAY')}</span>
            {record ? <span className="text-xs text-muted-foreground">{record}</span> : null}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-right">
        {typeof team?.sog === 'number' ? (
          <div className="text-xs text-muted-foreground">SOG {team.sog}</div>
        ) : null}
        {typeof team?.score === 'number' ? (
          <div className="text-lg font-semibold">{team.score}</div>
        ) : (
          <div className="text-lg font-semibold text-muted-foreground">-</div>
        )}
      </div>
    </div>
  )
}
