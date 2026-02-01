import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LineupPlayerRow } from "@/lib/lineups"
import { PlayerTile } from "@/components/lineups/PlayerTile"

type ForwardLine = { lineNum: 1 | 2 | 3 | 4; LW?: LineupPlayerRow; C?: LineupPlayerRow; RW?: LineupPlayerRow }
type DefensePair = { pairNum: 1 | 2 | 3; LD?: LineupPlayerRow; RD?: LineupPlayerRow }

type LineGridProps =
  | { title: string; variant: "forwards"; lines: ForwardLine[] }
  | { title: string; variant: "defense"; lines: DefensePair[] }

const getBadgeText = (player?: LineupPlayerRow) => {
  if (!player) return null
  return player.pos_code || player.slot || null
}

export function LineGrid(props: LineGridProps) {
  if (props.variant === "forwards") {
    return (
      <Card className="rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">{props.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {props.lines.map((line) => (
            <div key={line.lineNum} className="grid gap-3 sm:grid-cols-[70px_1fr]">
              <div className="text-xs font-semibold text-muted-foreground">Line {line.lineNum}</div>
              <div className="grid grid-cols-3 gap-2">
                <PlayerTile player={line.LW} badgeText={getBadgeText(line.LW)} />
                <PlayerTile player={line.C} badgeText={getBadgeText(line.C)} />
                <PlayerTile player={line.RW} badgeText={getBadgeText(line.RW)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{props.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.lines.map((pair) => (
          <div key={pair.pairNum} className="grid gap-3 sm:grid-cols-[70px_1fr]">
            <div className="text-xs font-semibold text-muted-foreground">Pair {pair.pairNum}</div>
            <div className="grid grid-cols-2 gap-2">
              <PlayerTile player={pair.LD} badgeText={getBadgeText(pair.LD)} />
              <PlayerTile player={pair.RD} badgeText={getBadgeText(pair.RD)} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
