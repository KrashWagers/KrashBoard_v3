import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GameStatusBadge } from './GameStatusBadge'
import { TeamRow } from './TeamRow'
import { GameSummary } from './types'

type GameCardProps = {
  game: GameSummary
  timeZone: string
}

function formatStartTime(startTimeUTC?: string, timeZone?: string): string {
  if (!startTimeUTC) return 'TBD'
  const date = new Date(startTimeUTC)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatPeriodLabel(game: GameSummary): string {
  const periodNumber = game.periodDescriptor?.number
  const periodType = game.periodDescriptor?.periodType
  if (periodType === 'SO') return 'SO'
  if (periodType === 'OT') return 'OT'
  if (periodNumber) return `P${periodNumber}`
  return 'LIVE'
}

function getLastGoalText(game: GameSummary): string | null {
  const lastGoal = game.goals?.[game.goals.length - 1]
  if (!lastGoal) return null
  if (lastGoal.description) return lastGoal.description

  const scorer =
    typeof lastGoal.scorer?.name === 'string'
      ? lastGoal.scorer?.name
      : lastGoal.scorer?.name?.default
  const assists = lastGoal.assists?.map((assist) =>
    typeof assist.name === 'string' ? assist.name : assist.name?.default
  )
  if (!scorer) return null
  if (assists && assists.length > 0) {
    return `${scorer} (${assists.filter(Boolean).join(', ')})`
  }
  return scorer
}

function getStreamLink(game: GameSummary): string | null {
  const broadcast = game.tvBroadcasts?.find((item) => item?.streamLink || item?.link)
  return broadcast?.streamLink || broadcast?.link || null
}

const cardClass =
  'rounded-md border border-gray-700 bg-[#171717] shadow-none transition-none hover:shadow-none hover:translate-y-0'

function extractIdFromLink(link?: string): string | null {
  if (!link) return null
  const match = link.match(/(\d{8,})/)
  return match ? match[1] : null
}

function getGameId(game: GameSummary): string | null {
  const candidate = game.id ?? game.gameId ?? game.gamePk
  if (candidate != null) return String(candidate)
  return (
    extractIdFromLink(game.gameCenterLink) ||
    extractIdFromLink(game.gamecenterLink) ||
    extractIdFromLink(game.gameLink)
  )
}

export function GameCard({ game, timeZone }: GameCardProps) {
  const isLive = ['LIVE', 'CRIT'].includes((game.gameState || '').toUpperCase())
  const isFinal = ['FINAL', 'OFF'].includes((game.gameState || '').toUpperCase())
  const startTimeLabel = formatStartTime(game.startTimeUTC, timeZone)
  const lastGoal = getLastGoalText(game)
  const streamLink = getStreamLink(game)
  const gameId = getGameId(game)

  if (!gameId && process.env.NODE_ENV === 'development') {
    console.warn('Missing NHL game id for GameCard', game)
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-center justify-between">
          <GameStatusBadge gameState={game.gameState} />
          <div className="text-xs text-muted-foreground">
            {isLive ? (
              <span>
                {formatPeriodLabel(game)} {game.clock?.timeRemaining || ''}
              </span>
            ) : (
              <span>{startTimeLabel}</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <TeamRow team={game.awayTeam} />
        <TeamRow team={game.homeTeam} isHome />
        {!isFinal && lastGoal ? (
          <div className="rounded-md border border-gray-700/70 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Goals:</span> {lastGoal}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="gap-2">
        {gameId ? (
          <Button asChild variant="outline" className="flex-1 border-gray-700 bg-[#171717]">
            <Link href={`/nhl/gamecenter/${gameId}`}>Gamecenter</Link>
          </Button>
        ) : (
          <Button variant="outline" className="flex-1 border-gray-700 bg-[#171717]" disabled>
            Gamecenter
          </Button>
        )}
        {streamLink ? (
          <Button asChild variant="secondary" className="flex-1">
            <a href={streamLink} target="_blank" rel="noreferrer">
              Stream
            </a>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
