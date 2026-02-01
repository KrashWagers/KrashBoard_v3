import { cn } from '@/lib/utils'

type GameStatusBadgeProps = {
  gameState?: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  LIVE: { label: 'LIVE', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  CRIT: { label: 'LIVE', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  FINAL: { label: 'FINAL', className: 'bg-gray-500/20 text-gray-200 border-gray-600' },
  OFF: { label: 'FINAL', className: 'bg-gray-500/20 text-gray-200 border-gray-600' },
  FUT: { label: 'PRE', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
  PRE: { label: 'PRE', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
}

export function GameStatusBadge({ gameState }: GameStatusBadgeProps) {
  const key = (gameState || 'PRE').toUpperCase()
  const status = statusMap[key] || statusMap.PRE

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        status.className
      )}
    >
      {status.label}
    </span>
  )
}
