import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LineupPlayerRow } from "@/lib/lineups"
import { PlayerTile } from "@/components/lineups/PlayerTile"

type PowerPlayUnitProps = {
  title: string
  players: (LineupPlayerRow | null)[]
}

const getBadgeText = (player?: LineupPlayerRow | null) => {
  if (!player) return null
  return player.slot || player.pos_code || null
}

export function PowerPlayUnit({ title, players }: PowerPlayUnitProps) {
  const topRow = players.slice(0, 3)
  const bottomRow = players.slice(3, 5)

  return (
    <Card className="rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {topRow.map((player, index) => (
            <PlayerTile key={`pp-top-${index}`} player={player} badgeText={getBadgeText(player)} compact />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {bottomRow.map((player, index) => (
            <PlayerTile key={`pp-bottom-${index}`} player={player} badgeText={getBadgeText(player)} compact />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
