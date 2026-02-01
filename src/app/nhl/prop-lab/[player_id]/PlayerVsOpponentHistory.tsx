"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PlayerVsOpponentHistoryProps {
  playerId: string
  nextOpponent?: string
  data?: any[]
}

export function PlayerVsOpponentHistory({ playerId, nextOpponent, data: initialData }: PlayerVsOpponentHistoryProps) {
  const [data, setData] = useState<any[]>(initialData || [])
  const [loading, setLoading] = useState(initialData === undefined)

  useEffect(() => {
    if (initialData !== undefined) {
      setData(initialData)
      setLoading(false)
      return
    }

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
  }, [playerId, initialData])

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm text-muted-foreground/80 font-medium">Player vs Opponent History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm text-muted-foreground/80 font-medium">Player vs Opponent History</CardTitle>
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
    <Card variant="secondary">
      <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20">
        <CardTitle className="text-sm font-medium text-[#1E293B] dark:text-white">Player vs Opponent History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Opponent</TableHead>
                <TableHead className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GP</TableHead>
                <TableHead className="h-10 px-4 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">G</TableHead>
                <TableHead className="h-10 px-4 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">A</TableHead>
                <TableHead className="h-10 px-4 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">P</TableHead>
                <TableHead className="h-10 px-4 text-xs text-center font-semibold text-muted-foreground uppercase tracking-wider">SOG</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((opponent, index) => {
                const gp = opponent.gp_vs_opp || 1
                return (
                  <TableRow key={`${opponent.opponent_abbr}-${index}`} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                    <TableCell className="h-12 px-4 text-sm font-semibold text-foreground">{opponent.opponent_abbr || '-'}</TableCell>
                    <TableCell className="h-12 px-4 text-sm text-muted-foreground">{gp}</TableCell>
                    <TableCell className="h-12 px-4 text-sm text-center text-foreground font-medium">{((opponent.goals_vs_opp || 0) / gp).toFixed(2)}</TableCell>
                    <TableCell className="h-12 px-4 text-sm text-center text-muted-foreground">{((opponent.assists_vs_opp || 0) / gp).toFixed(2)}</TableCell>
                    <TableCell className="h-12 px-4 text-sm text-center text-muted-foreground">{((opponent.points_vs_opp || 0) / gp).toFixed(2)}</TableCell>
                    <TableCell className="h-12 px-4 text-sm text-center text-muted-foreground">{((opponent.shots_on_goal_vs_opp || 0) / gp).toFixed(2)}</TableCell>
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

