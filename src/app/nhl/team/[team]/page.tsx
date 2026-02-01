import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLatestTeamPayload, normalizeTeamAbbr } from "@/lib/nhl/teamPayload"
import type { TeamGameLog, TeamRankingSplit } from "@/types/nhlTeamPayload"
import { TeamSelector } from "./TeamSelector"

export const revalidate = 60 * 60

interface TeamPageProps {
  params: {
    team: string
  }
}

const formatValue = (value: unknown, isPct = false) => {
  if (value == null || Number.isNaN(Number(value))) return "—"
  const num = Number(value)
  if (isPct) return `${num.toFixed(1)}%`
  return num.toFixed(2)
}

const formatRank = (value: unknown) => {
  if (value == null || Number.isNaN(Number(value))) return "—"
  return `#${Number(value)}`
}

const metricConfig = [
  { label: "Goals For", valueKey: "g_pg", rankKey: "g_rank" },
  { label: "Goals Against", valueKey: "opp_g_pg", rankKey: "opp_g_rank" },
  { label: "SOG For", valueKey: "sog_pg", rankKey: "sog_rank" },
  { label: "SOG Against", valueKey: "opp_sog_pg", rankKey: "opp_sog_rank" },
  { label: "PP%", valueKey: "pp_pct", rankKey: "pp_pct_rank", pct: true },
  { label: "PK%", valueKey: "opp_pk_pct", rankKey: "opp_pk_pct_rank", pct: true },
  { label: "FO%", valueKey: "fo_pct", rankKey: "fo_pct_rank", pct: true },
  { label: "Opp FO%", valueKey: "opp_fo_pct", rankKey: "opp_fo_pct_rank", pct: true },
]

export default async function TeamPage({ params }: TeamPageProps) {
  const team = normalizeTeamAbbr(params.team)
  if (!team) notFound()

  const payloadRow = await getLatestTeamPayload(team)
  if (!payloadRow) notFound()

  const { payload } = payloadRow
  const recentGames = payload.gamelogs
    .slice()
    .sort((a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime())
    .slice(0, 10)

  return (
    <div className="w-full bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 space-y-4">
        <Card className="rounded-md border border-gray-700 bg-[#171717] shadow-none hover:shadow-none transition-none">
          <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
                Team Payload
              </CardTitle>
              <TeamSelector value={team} />
            </div>
          </CardHeader>
          <CardContent className="p-4 text-xs text-muted-foreground">
            Data version: {payloadRow.data_version || "—"} · Last updated: {payloadRow.created_ts_utc || "—"}
          </CardContent>
        </Card>

        <Card className="rounded-md border border-gray-700 bg-[#171717] shadow-none hover:shadow-none transition-none">
          <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20">
            <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Date</TableHead>
                    <TableHead className="w-[80px]">Opp</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>GF</TableHead>
                    <TableHead>GA</TableHead>
                    <TableHead>SOG</TableHead>
                    <TableHead>SA</TableHead>
                    <TableHead>PP G</TableHead>
                    <TableHead>Opp PP G</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentGames.map((game: TeamGameLog, index) => (
                    <TableRow key={`${game.game_id ?? "game"}-${index}`}>
                      <TableCell className="text-xs text-muted-foreground">{game.game_date}</TableCell>
                      <TableCell className="text-xs font-medium">{game.opponent ?? "—"}</TableCell>
                      <TableCell className="text-xs">{game.venue ?? "—"}</TableCell>
                      <TableCell className="text-xs">{game.g ?? "—"}</TableCell>
                      <TableCell className="text-xs">{game.opp_g ?? "—"}</TableCell>
                      <TableCell className="text-xs">{game.sog ?? "—"}</TableCell>
                      <TableCell className="text-xs">{game.opp_sog ?? "—"}</TableCell>
                      <TableCell className="text-xs">{game.pp_g ?? "—"}</TableCell>
                      <TableCell className="text-xs">{game.opp_pp_g ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-md border border-gray-700 bg-[#171717] shadow-none hover:shadow-none transition-none">
          <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20">
            <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
              Split Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Split</TableHead>
                    <TableHead className="w-[70px]">GP</TableHead>
                    {metricConfig.map((metric) => (
                      <TableHead key={metric.label}>{metric.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payload.rankings.map((split: TeamRankingSplit, index: number) => (
                    <TableRow key={`${split.split}-${index}`}>
                      <TableCell className="text-xs font-medium">{split.split}</TableCell>
                      <TableCell className="text-xs">{split.games ?? "—"}</TableCell>
                      {metricConfig.map((metric) => (
                        <TableCell key={`${split.split}-${metric.label}`} className="text-xs">
                          <div className="flex items-center gap-2">
                            <span>{formatValue(split[metric.valueKey], metric.pct)}</span>
                            <span className="text-muted-foreground">{formatRank(split[metric.rankKey])}</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
