"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import type { TeamPayloadRow, TeamRankingSplit } from "@/types/nhlTeamPayload"

interface TeamStatsCardProps {
  teamPayload?: TeamPayloadRow | null
  opponentPayload?: TeamPayloadRow | null
  opponentTeam?: string | null
  timeFilter?: string
}

const metricConfig = [
  { label: "Goals Against", valueKeys: ["opp_g_pg", "opp_g_per_game", "opp_g"], rankKeys: ["opp_g_rank"] },
  { label: "Shots Against", valueKeys: ["opp_sog_pg", "opp_sog_per_game", "opp_sog"], rankKeys: ["opp_sog_rank"] },
  { label: "PK Attempts", valueKeys: ["opp_pp_att_pg", "opp_pp_att"], rankKeys: ["opp_pp_att_rank"] },
  { label: "PK G Against", valueKeys: ["opp_pp_g_pg", "opp_pp_g"], rankKeys: ["opp_pp_g_rank"] },
  { label: "Penalty Kill %", valueKeys: ["opp_pp_pct", "opp_pk_pct", "pk_pct"], rankKeys: ["opp_pp_pct_rank", "opp_pk_pct_rank", "pk_pct_rank"], pct: true },
  { label: "5v5 GA", valueKeys: ["opp_ev5v5_g_pg", "opp_ev5v5_g"], rankKeys: ["opp_ev5v5_g_rank"] },
  { label: "5v5 SA", valueKeys: ["opp_ev5v5_sog_pg", "opp_ev5v5_sog"], rankKeys: ["opp_ev5v5_sog_rank"] },
  { label: "High Danger GA", valueKeys: ["opp_g_hd_pg", "opp_g_hd"], rankKeys: ["opp_g_hd_rank"] },
]

const positionConfig = [
  { label: "Goals vs C", valueKeys: ["opp_g_c_pg", "opp_g_c"], rankKeys: ["opp_g_c_rank"] },
  { label: "Goals vs L", valueKeys: ["opp_g_l_pg", "opp_g_l"], rankKeys: ["opp_g_l_rank"] },
  { label: "Goals vs R", valueKeys: ["opp_g_r_pg", "opp_g_r"], rankKeys: ["opp_g_r_rank"] },
  { label: "Goals vs D", valueKeys: ["opp_g_d_pg", "opp_g_d"], rankKeys: ["opp_g_d_rank"] },
]

const splitColumns = [
  { key: "2025-26", label: "25/26" },
  { key: "L50", label: "L50" },
  { key: "L30", label: "L30" },
  { key: "L15", label: "L15" },
  { key: "HOME", label: "Home" },
  { key: "AWAY", label: "Away" },
]

const avgWeights: Record<string, number> = {
  "2025-26": 10,
  "L50": 10,
  "L30": 8,
  "L15": 8,
}

const formatValue = (value: unknown, isPct = false) => {
  if (value == null || Number.isNaN(Number(value))) return "—"
  let num = Number(value)
  if (isPct) {
    if (num > 0 && num <= 1) num = num * 100
    return `${num.toFixed(1)}%`
  }
  return num.toFixed(2)
}

const formatRank = (value: unknown) => {
  if (value == null || Number.isNaN(Number(value))) return null
  return Number(value)
}

const formatRankValue = (value: number | null, decimals: number) => {
  if (value == null || Number.isNaN(Number(value))) return null
  return Number(value).toFixed(decimals)
}

const rankTone = (rank: number | null) => {
  if (!rank) return "bg-muted/20 text-muted-foreground border-border"
  if (rank <= 11) return "bg-green-500/10 text-green-400 border-green-500/30"
  if (rank <= 22) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
  return "bg-red-500/10 text-red-400 border-red-500/30"
}

const getSplitLabel = (splitKey: string) => {
  const match = splitColumns.find((col) => col.key === splitKey)
  return match?.label ?? splitKey
}

const getNHLTeamLogo = (abbrev: string): string => {
  const teamMap: { [key: string]: string } = {
    "ANA": "/Images/NHL_Logos/ANA.png",
    "BOS": "/Images/NHL_Logos/BOS.png",
    "BUF": "/Images/NHL_Logos/BUF.png",
    "CAR": "/Images/NHL_Logos/CAR.png",
    "CBJ": "/Images/NHL_Logos/CBJ.png",
    "CGY": "/Images/NHL_Logos/CGY.png",
    "CHI": "/Images/NHL_Logos/CHI.png",
    "COL": "/Images/NHL_Logos/COL.png",
    "DAL": "/Images/NHL_Logos/DAL.png",
    "DET": "/Images/NHL_Logos/DET.png",
    "EDM": "/Images/NHL_Logos/EDM.png",
    "FLA": "/Images/NHL_Logos/FLA.png",
    "LAK": "/Images/NHL_Logos/LAK.png",
    "MIN": "/Images/NHL_Logos/MIN.png",
    "MTL": "/Images/NHL_Logos/MTL.png",
    "NSH": "/Images/NHL_Logos/NSH.png",
    "NJD": "/Images/NHL_Logos/NJD.png",
    "NYI": "/Images/NHL_Logos/NYI.png",
    "NYR": "/Images/NHL_Logos/NYR.png",
    "OTT": "/Images/NHL_Logos/OTT.png",
    "PHI": "/Images/NHL_Logos/PHI.png",
    "PIT": "/Images/NHL_Logos/PIT.png",
    "SJS": "/Images/NHL_Logos/SJS.png",
    "SEA": "/Images/NHL_Logos/SEA.png",
    "STL": "/Images/NHL_Logos/STL.png",
    "TB": "/Images/NHL_Logos/TB.png",
    "TOR": "/Images/NHL_Logos/TOR.png",
    "UTA": "/Images/NHL_Logos/UTA.png",
    "VAN": "/Images/NHL_Logos/VAN.png",
    "VGK": "/Images/NHL_Logos/VGK.png",
    "WPG": "/Images/NHL_Logos/WPG.png",
    "WSH": "/Images/NHL_Logos/WSH.png",
  }
  return teamMap[abbrev] || "/Images/League_Logos/NHL-Logo.png"
}

const getMetricNumbers = (
  split: TeamRankingSplit | undefined,
  metric: { valueKeys: string[]; rankKeys: string[] }
) => {
  if (!split) return { rank: null as number | null, value: null as number | null }
  const rankKey = metric.rankKeys.find((key) => split[key] != null)
  const derivedValueKey = rankKey ? rankKey.replace(/_rank$/i, "_pg") : null
  const valueKey =
    derivedValueKey && split[derivedValueKey] != null
      ? derivedValueKey
      : metric.valueKeys.find((key) => split[key] != null)
  const rawRank = rankKey ? Number(split[rankKey]) : null
  const rawValue = valueKey ? Number(split[valueKey]) : null
  return {
    rank: rawRank != null && !Number.isNaN(rawRank) ? rawRank : null,
    value: rawValue != null && !Number.isNaN(rawValue) ? rawValue : null,
  }
}

const getWeightedAverage = (
  splitMap: Map<string, TeamRankingSplit>,
  metric: { valueKeys: string[]; rankKeys: string[] },
  type: "rank" | "value"
) => {
  let weightedSum = 0
  let totalWeight = 0
  Object.entries(avgWeights).forEach(([splitKey, weight]) => {
    const split = splitMap.get(splitKey)
    const { rank, value } = getMetricNumbers(split, metric)
    const val = type === "rank" ? rank : value
    if (val == null) return
    weightedSum += val * weight
    totalWeight += weight
  })
  if (!totalWeight) return null
  return weightedSum / totalWeight
}

export function TeamStatsCard({
  opponentPayload,
  opponentTeam,
}: TeamStatsCardProps) {
  const activePayload = opponentPayload?.payload
  const splitMap = useMemo(() => {
    const map = new Map<string, TeamRankingSplit>()
    ;(activePayload?.rankings ?? []).forEach((split) => {
      map.set(split.split, split)
    })
    return map
  }, [activePayload?.rankings])

  const availableColumns = useMemo(() => {
    return splitColumns.filter((col) => splitMap.has(col.key))
  }, [splitMap])

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return
    const firstSplit = activePayload?.rankings?.[0]
    if (!firstSplit) return
    console.log("Opponent stats payload keys:", {
      split: firstSplit.split,
      keys: Object.keys(firstSplit),
    })
  }, [activePayload?.rankings])

  if (!activePayload) {
    return (
      <Card className="rounded-md border border-gray-700 bg-[#171717] shadow-none hover:shadow-none transition-none">
        <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20">
          <CardTitle className="text-sm font-medium" style={{ color: "hsl(var(--chart-title))" }}>
            Opponent Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-xs text-muted-foreground">
          Opponent payload not available yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-md border border-gray-700 bg-[#171717] shadow-none hover:shadow-none transition-none w-full lg:w-1/3">
      <CardHeader className="p-2 border-b border-border/30 dark:border-border/20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center overflow-hidden">
            <Image
              src={getNHLTeamLogo(opponentTeam ?? "")}
              alt={opponentTeam ?? "Opponent"}
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-xs font-medium" style={{ color: "hsl(var(--chart-title))" }}>
            Opponent Stats {opponentTeam ? `(${opponentTeam})` : ""}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {availableColumns.length ? (
          <div className="space-y-2">
            <div className="rounded-md border border-gray-700 bg-[#141414] p-2">
              <div className="grid grid-cols-[110px_repeat(7,36px)] gap-0.5 text-[9px] text-muted-foreground mb-2">
                <div className="uppercase tracking-wide">Metric</div>
                {availableColumns.map((column) => (
                  <div key={column.key} className="text-center uppercase tracking-wide">
                    {column.label}
                  </div>
                ))}
                <div className="text-center uppercase tracking-wide">Avg</div>
              </div>
              <div className="divide-y divide-border/70">
                {metricConfig.map((metric) => (
                  <div key={metric.label} className="grid grid-cols-[110px_repeat(7,36px)] gap-0.5 items-center py-1">
                    <div className="text-[10px] text-muted-foreground">{metric.label}</div>
                    {availableColumns.map((column) => {
                      const split = splitMap.get(column.key)
                      const { rank, value } = getMetricNumbers(split, metric)
                      const formattedRank = formatRank(rank)
                      return (
                        <div key={`${metric.label}-${column.key}`} className="flex justify-center">
                          {formattedRank ? (
                            <span
                              className={`text-[10px] font-semibold rounded border w-10 h-8 inline-flex flex-col items-center justify-center leading-tight ${rankTone(rank)}`}
                            >
                              <span>#{formattedRank}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {formatValue(value, metric.pct)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground w-10 h-8 inline-flex items-center justify-center">—</span>
                          )}
                        </div>
                      )
                    })}
                    {(() => {
                      const avgRank = getWeightedAverage(splitMap, metric, "rank")
                      const avgValue = getWeightedAverage(splitMap, metric, "value")
                      const formattedAvgRank = formatRankValue(avgRank, 1)
                      return (
                        <div className="flex justify-center">
                          {formattedAvgRank ? (
                            <span
                              className={`text-[10px] font-semibold rounded border w-10 h-8 inline-flex flex-col items-center justify-center leading-tight ${rankTone(avgRank)}`}
                            >
                              <span>#{formattedAvgRank}</span>
                              <span className="text-[9px] text-current">
                                {avgValue != null ? Number(avgValue).toFixed(2) : "—"}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground w-10 h-8 inline-flex items-center justify-center">—</span>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-gray-700 bg-[#141414] p-2">
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground mb-2">
                Goals Allowed vs Position
              </div>
              <div className="grid grid-cols-[110px_repeat(7,36px)] gap-0.5 text-[9px] text-muted-foreground mb-2">
                <div className="uppercase tracking-wide">Metric</div>
                {availableColumns.map((column) => (
                  <div key={column.key} className="text-center uppercase tracking-wide">
                    {getSplitLabel(column.key)}
                  </div>
                ))}
                <div className="text-center uppercase tracking-wide">Avg</div>
              </div>
              <div className="divide-y divide-border/70">
                {positionConfig.map((metric) => (
                  <div key={metric.label} className="grid grid-cols-[110px_repeat(7,36px)] gap-0.5 items-center py-1">
                    <div className="text-[10px] text-muted-foreground">{metric.label}</div>
                    {availableColumns.map((column) => {
                      const split = splitMap.get(column.key)
                      const { rank, value } = getMetricNumbers(split, metric)
                      const formattedRank = formatRank(rank)
                      return (
                        <div key={`${metric.label}-${column.key}`} className="flex justify-center">
                          {formattedRank ? (
                            <span
                              className={`text-[10px] font-semibold rounded border w-10 h-8 inline-flex flex-col items-center justify-center leading-tight ${rankTone(rank)}`}
                            >
                              <span>#{formattedRank}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {formatValue(value, false)}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground w-10 h-8 inline-flex items-center justify-center">—</span>
                          )}
                        </div>
                      )
                    })}
                    {(() => {
                      const avgRank = getWeightedAverage(splitMap, metric, "rank")
                      const avgValue = getWeightedAverage(splitMap, metric, "value")
                      const formattedAvgRank = formatRankValue(avgRank, 1)
                      return (
                        <div className="flex justify-center">
                          {formattedAvgRank ? (
                            <span
                              className={`text-[10px] font-semibold rounded border w-10 h-8 inline-flex flex-col items-center justify-center leading-tight ${rankTone(avgRank)}`}
                            >
                              <span>#{formattedAvgRank}</span>
                              <span className="text-[9px] text-current">
                                {avgValue != null ? Number(avgValue).toFixed(2) : "—"}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground w-10 h-8 inline-flex items-center justify-center">—</span>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">No ranking splits available.</div>
        )}
      </CardContent>
    </Card>
  )
}
