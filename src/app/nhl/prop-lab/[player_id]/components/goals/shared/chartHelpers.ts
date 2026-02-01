import { ChartData } from './types'

// Calculate smart Y-axis tick interval based on max value
export const getYAxisTicks = (maxValue: number, dataKey: string): number[] => {
  // Determine appropriate interval based on data type
  let interval = 1
  if (dataKey === 'shots_on_goal' || dataKey === 'sat_HD') {
    interval = 2 // Every 2 for shots
  } else if (dataKey === 'shifts') {
    interval = 5 // Every 5 for shifts
  } else if (dataKey === 'toi_seconds' || dataKey === 'toi_total') {
    interval = 60 // Every 60 seconds (1 minute) for TOI
  } else if (dataKey === 'goals' || dataKey === 'goals_by_danger_total' || dataKey === 'goals_total') {
    interval = 1 // Every 1 for goals
  }
  
  // Round max value up to next nice number
  const roundedMax = Math.ceil(maxValue / interval) * interval
  const ticks: number[] = []
  
  // Generate ticks
  for (let i = 0; i <= roundedMax; i += interval) {
    ticks.push(i)
  }
  
  // If max is close to a .5 value, include it
  if (maxValue % 1 >= 0.3 && maxValue % 1 < 0.7 && !ticks.includes(Math.ceil(maxValue))) {
    const halfTick = Math.floor(maxValue) + 0.5
    if (halfTick > ticks[ticks.length - 1]) {
      ticks.push(halfTick)
    }
  }
  
  return ticks
}

// Calculate dynamic Y-axis domain with smart padding
export const getYAxisDomain = (dataKey: string, data: ChartData[]): [number, number] => {
  let maxValue = 0
  
  if (dataKey === 'sat_HD') {
    maxValue = Math.max(...data.map(d => (d.sat_HD ?? 0)))
  } else if (dataKey === 'corsi') {
    maxValue = Math.max(...data.map(d => (d.corsi ?? 0)))
  } else if (dataKey === 'team_goals') {
    maxValue = Math.max(...data.map(d => (d.team_goals ?? 0)))
  } else if (dataKey === 'goals_by_danger_total') {
    maxValue = Math.max(...data.map(d => {
      const hd = d.goals_HD ?? 0
      const mdVal: unknown = d['goals_MD']
      const ldVal: unknown = d['goals_LD']
      const md: number = (typeof mdVal === 'number' ? mdVal : 0) as number
      const ld: number = (typeof ldVal === 'number' ? ldVal : 0) as number
      return (hd as number) + (md as number) + (ld as number)
    }))
  } else if (dataKey === 'goals_total') {
    maxValue = Math.max(...data.map(d => (d['5v5_goals'] ?? 0) + (d.pp_goals ?? 0)))
  } else if (dataKey === 'toi_total') {
    maxValue = Math.max(...data.map(d => (d.toi_total ?? 0)))
  } else {
    maxValue = Math.max(...data.map(d => {
      const val = d[dataKey as keyof ChartData]
      return typeof val === 'number' ? val : 0
    }))
  }
  
  // Add at least 1 to max value to ensure labels aren't cut off
  const paddedMax = maxValue + 1
  
  // Get smart ticks based on padded max
  const ticks = getYAxisTicks(paddedMax, dataKey)
  const domainMax = ticks.length > 0 ? ticks[ticks.length - 1] : Math.ceil(paddedMax)
  
  // Ensure domain max is at least maxValue + 1
  return [0, Math.max(domainMax, maxValue + 1)]
}

// Calculate dynamic radius based on number of bars
export const getBarRadius = (dataLength: number): [number, number, number, number] => {
  if (dataLength > 40) return [2, 2, 0, 0]
  if (dataLength > 30) return [3, 3, 0, 0]
  return [4, 4, 0, 0]
}

// Calculate dynamic font size for bar labels based on number of bars
export const getBarLabelFontSize = (dataLength: number): string => {
  if (dataLength >= 50) return '10px' // Right size for 50+ bars
  if (dataLength >= 30) return '12px' // Scale up for 30ish bars
  if (dataLength >= 20) return '14px' // Scale up more for 20ish bars
  if (dataLength >= 10) return '16px' // Scale up more for 10ish bars
  return '18px' // Much larger for < 10 bars
}

// Determine color for goals - Simple green/red based on hit/miss
export const getGoalBarColor = (goals: number | undefined, selectedProp: { ou: string }, lineValue: number) => {
  const goalsValue = goals ?? 0
  const isOver = selectedProp?.ou === 'Over'
  const line = lineValue
  
  // Hit = Green (use darker green #16A34A for emphasis), Miss = Red
  if (isOver) {
    return goalsValue > line ? '#16A34A' : '#ef4444'
  } else {
    return goalsValue < line ? '#16A34A' : '#ef4444'
  }
}

