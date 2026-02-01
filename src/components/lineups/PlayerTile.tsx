import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LineupPlayerRow } from "@/lib/lineups"

type PlayerTileProps = {
  player?: LineupPlayerRow | null
  badgeText?: string | null
  compact?: boolean
}

export function PlayerTile({ player, badgeText, compact = false }: PlayerTileProps) {
  const name = player?.player_name || null
  const hasPlayer = Boolean(name)

  return (
    <Card
      className={cn(
        "rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30",
        "flex items-center justify-between gap-2 px-2.5",
        compact ? "h-12" : "h-14"
      )}
    >
      <div className="flex min-w-0 flex-col">
        <span className={cn("truncate text-sm font-semibold", hasPlayer ? "text-foreground" : "text-muted-foreground")}>
          {name || "—"}
        </span>
        {!hasPlayer && <span className="text-[11px] text-muted-foreground">Empty slot</span>}
      </div>
      {hasPlayer && badgeText && (
        <span className="rounded-md border border-gray-600 bg-muted/30 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {badgeText}
        </span>
      )}
    </Card>
  )
}
