'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GameWeekDay } from './types'
import { cn } from '@/lib/utils'

type WeekStripProps = {
  days: GameWeekDay[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

function formatDateLabel(date: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  const month = parsed.getMonth() + 1
  const day = parsed.getDate()
  return `${month}/${day}`
}

export function WeekStrip({ days, selectedDate, onSelectDate }: WeekStripProps) {
  const stripRef = useRef<HTMLDivElement | null>(null)

  const scrollBy = (amount: number) => {
    stripRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => scrollBy(-240)}
        className="rounded-md border border-gray-700 bg-[#171717] p-2 text-muted-foreground hover:text-foreground"
        aria-label="Previous days"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={stripRef} className="flex flex-1 gap-2 overflow-x-auto pb-2">
      {days.map((day) => {
        const isSelected = day.date === selectedDate
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={cn(
              'min-w-[84px] rounded-md border px-3 py-2 text-left transition-colors',
              'border-gray-700 bg-[#171717]',
              isSelected ? 'border-blue-500/60 bg-blue-500/10 text-blue-200' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className="text-xs uppercase tracking-wide">{day.dayAbbrev || 'Day'}</div>
            <div className="text-sm font-semibold">{formatDateLabel(day.date)}</div>
            <div className="text-xs text-muted-foreground">{day.numberOfGames ?? 0} games</div>
          </button>
        )
      })}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(240)}
        className="rounded-md border border-gray-700 bg-[#171717] p-2 text-muted-foreground hover:text-foreground"
        aria-label="Next days"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
