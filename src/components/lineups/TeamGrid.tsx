import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { formatUpdatedAgo, getNhlTeamLogo, type LineupTeamSummary } from "@/lib/lineups"

type TeamGridProps = {
  teams: LineupTeamSummary[]
}

export function TeamGrid({ teams }: TeamGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {teams.map((team) => (
        <Link key={team.teamAbbr} href={`/lineups/${team.teamAbbr}`} className="block">
          <Card className="rounded-md border border-gray-700 bg-[#171717]/80 p-3 shadow-md shadow-black/30">
            <div className="flex flex-col items-center gap-2">
              <Image
                src={getNhlTeamLogo(team.teamAbbr)}
                alt={team.teamAbbr}
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
              />
              <span className="text-sm font-semibold text-foreground">{team.teamAbbr}</span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
