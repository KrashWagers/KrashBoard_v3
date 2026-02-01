"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { SelectedProp } from './shared/types'

interface MarketTabProps {
  allProps?: any[]
  selectedProp: SelectedProp
  onPropChange?: (propName: string) => void
}

const getBookmakerLogo = (bookmaker: string): string => {
  const bookmakerMap: { [key: string]: string } = {
    'Fanatics': '/Images/Sportsbook_Logos/Fanatics.jpeg',
    'BetRivers': '/Images/Sportsbook_Logos/betriverslogo.png',
    'DraftKings': '/Images/Sportsbook_Logos/DraftKingsLogo.png',
    'FanDuel': '/Images/Sportsbook_Logos/fanDuel.jpg',
    'Pinnacle': '/Images/Sportsbook_Logos/pinnacle_sports_logo.jpg',
    'BetMGM': '/Images/Sportsbook_Logos/betmgm.png'
  }
  return bookmakerMap[bookmaker] || ''
}

// Normalize prop names for matching
const normalizeProps = (propName: string) => {
  const mappings: { [key: string]: string } = {
    'Shots on Goal': 'SOG',
    'Shots': 'SOG',
    'Assists': 'Ast',
    'Points': 'Pts'
  }
  return mappings[propName] || propName
}

export function MarketTab({ allProps = [], selectedProp, onPropChange }: MarketTabProps) {
  // Get unique prop names from allProps
  const availableProps = useMemo(() => {
    const props = new Set<string>()
    allProps.forEach(prop => {
      if (prop.prop_name) {
        props.add(prop.prop_name)
      }
    })
    return Array.from(props)
  }, [allProps])

  // Get unique O/U values for current prop
  const ouOptions = useMemo(() => {
    const ouSet = new Set<string>()
    allProps.forEach(prop => {
      if (prop.prop_name === selectedProp.propName && prop.O_U) {
        ouSet.add(prop.O_U)
      }
    })
    return Array.from(ouSet)
  }, [allProps, selectedProp.propName])

  const [selectedOU, setSelectedOU] = useState<string>(selectedProp.ou || 'Over')

  // Get all unique bookmakers
  const bookmakers = useMemo(() => {
    const books = new Set<string>()
    allProps.forEach(prop => {
      if (prop.bookmaker) {
        books.add(prop.bookmaker)
      }
    })
    return Array.from(books).sort()
  }, [allProps])

  // Process odds data: group by line, then by bookmaker
  const oddsData = useMemo(() => {
    if (!allProps.length) return []

    // Filter props by selected prop name and O/U
    const filteredProps = allProps.filter(p => 
      p.prop_name === selectedProp.propName && 
      p.O_U === selectedOU
    )

    // Group by line value
    const lineMap = new Map<number, Map<string, any>>()
    
    filteredProps.forEach(prop => {
      const line = prop.line
      if (!lineMap.has(line)) {
        lineMap.set(line, new Map())
      }
      
      const bookMap = lineMap.get(line)!
      const bookmaker = prop.bookmaker || 'Unknown'
      bookMap.set(bookmaker, prop)
    })

    // Convert to array format: [{ line: 0.5, books: { 'FanDuel': {...}, 'DraftKings': {...} } }]
    const result = Array.from(lineMap.entries())
      .map(([line, bookMap]) => ({
        line,
        books: Object.fromEntries(bookMap)
      }))
      .sort((a, b) => a.line - b.line)

    return result
  }, [allProps, selectedProp.propName, selectedOU])

  // Calculate best odds per line
  const bestOddsPerLine = useMemo(() => {
    const bestOdds = new Map<number, { odds: number; book: string }>()
    
    oddsData.forEach(({ line, books }) => {
      let bestOddsValue = -Infinity
      let bestBook = ''
      
      Object.entries(books).forEach(([book, prop]: [string, any]) => {
        const odds = prop.price_american || -Infinity
        if (odds > bestOddsValue) {
          bestOddsValue = odds
          bestBook = book
        }
      })
      
      if (bestOddsValue !== -Infinity) {
        bestOdds.set(line, { odds: bestOddsValue, book: bestBook })
      }
    })
    
    return bestOdds
  }, [oddsData])

  // Format American odds
  const formatOdds = (odds: number | null | undefined): string => {
    if (odds === null || odds === undefined) return '-'
    if (odds > 0) return `+${odds}`
    return String(odds)
  }

  // Calculate implied win percentage
  const calculateImpliedWinPct = (odds: number | null | undefined): number | null => {
    if (odds === null || odds === undefined) return null
    if (odds > 0) {
      return (100 / (odds + 100)) * 100
    } else {
      return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100
    }
  }

  if (!allProps.length) {
    return (
      <Card variant="secondary">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No odds data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {/* Prop Selector Tabs */}
      <Card variant="secondary">
        <CardHeader className="p-3 pb-2 border-b border-border/30 dark:border-border/20">
          <div className="flex items-center gap-3">
            {/* Prop Type Tabs */}
            <div className="flex-1 border-b border-border">
              <div className="flex items-center overflow-x-auto scrollbar-hide">
                {availableProps.map((propName) => {
                  const isActive = normalizeProps(selectedProp.propName) === normalizeProps(propName)
                  
                  return (
                    <button
                      key={propName}
                      onClick={() => onPropChange?.(propName)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        isActive 
                          ? 'border-[#16A34A] dark:border-green-500 text-[#16A34A] dark:text-green-500' 
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border cursor-pointer'
                      }`}
                    >
                      {propName}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* O/U Selector */}
            {ouOptions.length > 0 && (
              <div className="flex items-center gap-2">
                {ouOptions.map(ou => (
                  <button
                    key={ou}
                    onClick={() => setSelectedOU(ou)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      selectedOU === ou
                        ? 'bg-[#16A34A] text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {ou}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Odds Table */}
      <Card variant="secondary">
        <CardHeader className="p-4 pb-3 border-b border-border/30 dark:border-border/20">
          <CardTitle 
            className="text-sm font-medium"
            style={{ color: 'hsl(var(--chart-title))' }}
          >
            {selectedProp.propName} {selectedOU} - Odds Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-card border-b border-border/50">
                <tr>
                  <th className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left sticky left-0 bg-card border-r border-border/50">
                    Line
                  </th>
                  {bookmakers.map(book => (
                    <th key={book} className="h-10 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="relative w-8 h-8">
                          <Image
                            src={getBookmakerLogo(book)}
                            alt={book}
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-[10px]">{book}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {oddsData.length === 0 ? (
                  <tr>
                    <td colSpan={bookmakers.length + 1} className="h-20 px-4 text-center text-sm text-muted-foreground">
                      No odds available for {selectedProp.propName} {selectedOU}
                    </td>
                  </tr>
                ) : (
                  oddsData.map(({ line, books }) => {
                    const bestOdds = bestOddsPerLine.get(line)
                    
                    return (
                      <tr key={line} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                        <td className="h-12 px-4 text-sm font-semibold text-foreground sticky left-0 bg-card border-r border-border/50">
                          {line}
                        </td>
                        {bookmakers.map(book => {
                          const prop = books[book]
                          const odds = prop?.price_american
                          const isBest = bestOdds && bestOdds.book === book && bestOdds.odds === odds
                          const impliedWinPct = calculateImpliedWinPct(odds)
                          
                          return (
                            <td 
                              key={book} 
                              className={`h-12 px-3 text-center ${
                                isBest 
                                  ? 'bg-green-500/10 font-bold' 
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {odds !== undefined && odds !== null ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={`text-sm ${isBest ? 'text-green-500' : 'text-foreground'}`}>
                                    {formatOdds(odds)}
                                  </span>
                                  {impliedWinPct !== null && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {impliedWinPct.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/50">-</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

