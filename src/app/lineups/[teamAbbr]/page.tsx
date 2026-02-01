import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineGrid } from "@/components/lineups/LineGrid"
import { PlayerTile } from "@/components/lineups/PlayerTile"
import { PowerPlayUnit } from "@/components/lineups/PowerPlayUnit"
import { formatUpdatedAgo, getNhlTeamLogo, getNhlTeamName, getTeamLineup } from "@/lib/lineups"

type TeamLineupPageProps = {
  params: Promise<{ teamAbbr: string }>
}

export default async function TeamLineupPage({ params }: TeamLineupPageProps) {
  const resolvedParams = await params
  const lineup = await getTeamLineup(resolvedParams.teamAbbr)

  if (!lineup) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <Card className="rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">No lineup data found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>We could not find a lineup for this team today.</p>
              <Link href="/lineups" className="text-sm font-semibold text-primary">
                Back to all teams
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { meta } = lineup
  const teamName = getNhlTeamName(meta.teamAbbr)
  const computedUpdatedAgo = meta.scrapeTsUtc ? formatUpdatedAgo(meta.scrapeTsUtc) : null
  const updatedText = meta.lastUpdatedText || (computedUpdatedAgo ? `Updated ${computedUpdatedAgo}` : null)
  const opponentLabel = meta.opponentAbbr ? `${meta.isHome ? "vs" : "@"} ${meta.opponentAbbr}` : null

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card className="rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={getNhlTeamLogo(meta.teamAbbr)}
                alt={meta.teamAbbr}
                width={56}
                height={56}
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">{teamName || meta.teamAbbr}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {opponentLabel && <span>{opponentLabel}</span>}
                  {meta.isHome !== null && (
                    <span className="rounded-md border border-gray-600 px-2 py-0.5 text-[11px] font-semibold">
                      {meta.isHome ? "Home" : "Away"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {updatedText && <div>{updatedText}</div>}
              {meta.sourceUrl && (
                <a href={meta.sourceUrl} target="_blank" rel="noreferrer" className="text-primary">
                  Source
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <LineGrid title="Forwards" variant="forwards" lines={lineup.forwards} />
        <LineGrid title="Defense" variant="defense" lines={lineup.defense} />

        <Card className="rounded-md border border-gray-700 bg-[#171717]/80 shadow-md shadow-black/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Goalies</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <PlayerTile player={lineup.goalies.starter} badgeText="Starter" />
            <PlayerTile player={lineup.goalies.backup} badgeText="Backup" />
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <PowerPlayUnit title="Power Play Unit 1" players={lineup.powerplay.unit1} />
          <PowerPlayUnit title="Power Play Unit 2" players={lineup.powerplay.unit2} />
        </div>

      </div>
    </div>
  )
}
