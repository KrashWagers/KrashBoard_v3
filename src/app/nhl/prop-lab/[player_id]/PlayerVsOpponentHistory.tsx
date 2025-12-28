"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PlayerVsOpponentHistoryProps {
  playerId: string
  nextOpponent?: string
}

export function PlayerVsOpponentHistory({ playerId, nextOpponent }: PlayerVsOpponentHistoryProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/nhl/players/${playerId}/vs-opponent`)
        if (response.ok) {
          const result = await response.json()
          setData(result.data || [])
        }
      } catch (error) {
        console.error('Error fetching player vs opponent data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [playerId])

  if (loading) {
    return (
      <Card className="border border-gray-700 bg-[#171717]">
        <CardHeader>
          <CardTitle className="text-sm">Player vs Opponent History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card className="border border-gray-700 bg-[#171717]">
        <CardHeader>
          <CardTitle className="text-sm">Player vs Opponent History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  // Get unique opponents from the data
  const uniqueOpponents = [...new Set(data.map(d => d.opponent_abbr))]

  return (
    <Card className="border border-gray-700 bg-[#171717]">
      <CardHeader>
        <CardTitle className="text-sm">Player vs Opponent History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Opponent</TableHead>
                <TableHead className="text-xs">GP</TableHead>
                <TableHead className="text-xs">G</TableHead>
                <TableHead className="text-xs">A</TableHead>
                <TableHead className="text-xs">P</TableHead>
                <TableHead className="text-xs">SOG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((opponent, index) => {
                const gp = opponent.gp_vs_opp || 1
                return (
                  <TableRow key={`${opponent.opponent_abbr}-${index}`}>
                    <TableCell className="text-xs font-medium">{opponent.opponent_abbr || '-'}</TableCell>
                    <TableCell className="text-xs">{gp}</TableCell>
                    <TableCell className="text-xs">{((opponent.goals_vs_opp || 0) / gp).toFixed(2)}</TableCell>
                    <TableCell className="text-xs">{((opponent.assists_vs_opp || 0) / gp).toFixed(2)}</TableCell>
                    <TableCell className="text-xs">{((opponent.points_vs_opp || 0) / gp).toFixed(2)}</TableCell>
                    <TableCell className="text-xs">{((opponent.shots_on_goal_vs_opp || 0) / gp).toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>
  )
}

