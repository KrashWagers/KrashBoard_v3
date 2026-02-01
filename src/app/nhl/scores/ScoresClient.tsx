'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GameCard } from '@/components/nhl/scores/GameCard'
import { TimezoneSelect } from '@/components/nhl/scores/TimezoneSelect'
import { WeekStrip } from '@/components/nhl/scores/WeekStrip'
import { GameSummary, GameWeekDay } from '@/components/nhl/scores/types'

type ScoreApiResponse = {
  gameWeek?: Array<GameWeekDay & { games?: GameSummary[] }>
  games?: GameSummary[]
  meta?: {
    date?: string
  }
}

const cardClass =
  'rounded-md border border-gray-700 bg-[#171717] shadow-none transition-none hover:shadow-none hover:translate-y-0'

function getTodayEasternDate(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

export default function ScoresClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedDate = useMemo(() => {
    return searchParams.get('date') || getTodayEasternDate()
  }, [searchParams])

  const [timeZone, setTimeZone] = useState('America/New_York')
  const [data, setData] = useState<ScoreApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasLoggedSample = useRef(false)

  const loadScores = useCallback(async (date: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/nhl/score?date=${date}`)
      if (!response.ok) {
        throw new Error('Failed to load scores')
      }
      const json = (await response.json()) as ScoreApiResponse
      if (process.env.NODE_ENV === 'development' && !hasLoggedSample.current) {
        const sampleGame =
          json.games?.[0] || json.gameWeek?.[0]?.games?.[0]
        if (sampleGame) {
          console.log('NHL score sample id fields', {
            id: sampleGame.id,
            gameId: sampleGame.gameId,
            gamePk: sampleGame.gamePk,
            gameCenterLink: sampleGame.gameCenterLink,
            gamecenterLink: sampleGame.gamecenterLink,
            gameLink: sampleGame.gameLink,
            keys: Object.keys(sampleGame),
          })
        } else {
          console.log('NHL score sample missing games array', json)
        }
        hasLoggedSample.current = true
      }
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scores')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScores(selectedDate)
  }, [selectedDate, loadScores])

  const weekDays = data?.gameWeek || []
  const gamesForDate =
    data?.games ||
    data?.gameWeek?.find((day) => day.date === selectedDate)?.games ||
    []

  const handleSelectDate = (date: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', date)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scores</h1>
          <p className="text-sm text-muted-foreground">NHL games and live updates</p>
        </div>
        <TimezoneSelect value={timeZone} onChange={setTimeZone} />
      </div>

      <Card className={cardClass}>
        <CardContent className="space-y-4 pt-6">
          <WeekStrip days={weekDays} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        </CardContent>
      </Card>

      {error ? (
        <Card className={cardClass}>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="text-sm text-muted-foreground">{error}</div>
            <Button onClick={() => loadScores(selectedDate)}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading && gamesForDate.length === 0 ? (
          <Card className={cardClass}>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Loading scores...
            </CardContent>
          </Card>
        ) : null}
        {gamesForDate.map((game) => (
          <GameCard key={game.id} game={game} timeZone={timeZone} />
        ))}
        {!loading && gamesForDate.length === 0 && !error ? (
          <Card className={cardClass}>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No games scheduled for this date.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
