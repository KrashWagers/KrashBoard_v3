"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const NHL_TEAMS = [
  "ANA", "BOS", "BUF", "CAR", "CBJ", "CGY", "CHI", "COL", "DAL", "DET",
  "EDM", "FLA", "LAK", "MIN", "MTL", "NSH", "NJD", "NYI", "NYR", "OTT",
  "PHI", "PIT", "SJS", "SEA", "STL", "TB", "TOR", "UTA", "VAN", "VGK",
  "WPG", "WSH",
]

interface TeamSelectorProps {
  value: string
}

export function TeamSelector({ value }: TeamSelectorProps) {
  const router = useRouter()
  const normalizedValue = useMemo(() => value.trim().toUpperCase(), [value])

  return (
    <Select
      value={normalizedValue}
      onValueChange={(team) => {
        router.push(`/nhl/team/${team}`)
      }}
    >
      <SelectTrigger className="h-8 w-[140px] border border-gray-700 rounded-md bg-[#171717]">
        <SelectValue placeholder="Select team" />
      </SelectTrigger>
      <SelectContent className="border border-gray-700 bg-[#171717]">
        {NHL_TEAMS.map((team) => (
          <SelectItem key={team} value={team}>
            {team}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
