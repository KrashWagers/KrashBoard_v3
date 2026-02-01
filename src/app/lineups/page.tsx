import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamGrid } from "@/components/lineups/TeamGrid"
import { getLineupTeams } from "@/lib/lineups"

export default async function LineupsHomePage() {
  const teams = await getLineupTeams()

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">NHL Lineups</h1>
          <p className="text-sm text-muted-foreground">Daily projected lines, pairs, and power-play units.</p>
        </div>

        {teams.length > 0 ? (
          <TeamGrid teams={teams} />
        ) : (
          <Card className="rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">No lineups available</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Lineup data has not been published yet. Check back soon.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
