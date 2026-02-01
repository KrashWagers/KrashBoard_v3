import { PlayerGamelog, ChartData, Insights, HDShotsInsights, ShotsOnGoalInsights, TOIInsights } from './types'
import { convertMmssToSeconds } from './utils'

let hasLoggedEv5StatSample = false

// Process raw gamelogs into chart data format
export const processChartData = (gamelogs: PlayerGamelog[]): ChartData[] => {
  return gamelogs.map((game) => {
    // Handle various date formats
    let formattedDate = ''
    try {
      if (game.game_date) {
        let dateStr = ''
        if (typeof game.game_date === 'string') {
          dateStr = game.game_date
        } else if (game.game_date instanceof Date) {
          dateStr = game.game_date.toISOString().split('T')[0]
        } else if (game.game_date !== null && typeof game.game_date === 'object' && 'value' in game.game_date && typeof (game.game_date as { value: unknown }).value === 'string') {
          dateStr = (game.game_date as { value: string }).value
        } else {
          dateStr = new Date(game.game_date as string | Date).toISOString().split('T')[0]
        }
        
        const dateParts = dateStr.split('-')
        if (dateParts.length === 3) {
          formattedDate = `${dateParts[1]}/${dateParts[2]}`
        }
      }
    } catch (e) {
      console.warn('Date parsing error:', game.game_date, e)
    }
    
    const awayAbbr = typeof game.away_abbrev === 'string' ? game.away_abbrev : ''
    const homeAbbr = typeof game.home_abbrev === 'string' ? game.home_abbrev : ''
    const playerTeam = typeof game.player_team_abbrev === 'string' ? game.player_team_abbrev : ''
    const opponent = awayAbbr === playerTeam ? homeAbbr : awayAbbr
    
    const ev5Stat = typeof game.ev5_stat === 'number' ? game.ev5_stat : undefined
    const resolved5v5Assists = (game['5v5_assists'] ?? game.ev5_assists ?? ev5Stat ?? 0)
    const resolved5v5Points = (game['5v5_points'] ?? game.ev5_points ?? ev5Stat ?? 0)
    const resolved4v4Points = ((game as { ev_4v4_points?: number }).ev_4v4_points ?? (game as { ev4_points?: number }).ev4_points ?? (game as { '4v4_points'?: number })['4v4_points'] ?? 0)
    const resolved3v3Points = ((game as { ev_3v3_points?: number }).ev_3v3_points ?? (game as { ev3_points?: number }).ev3_points ?? (game as { '3v3_points'?: number })['3v3_points'] ?? 0)
    const resolvedEvPoints = resolved5v5Points + resolved4v4Points + resolved3v3Points
    const resolved5v5Goals = (game['5v5_goals'] ?? game.ev5_goals ?? 0)
    const resolved5v5ShotsOnGoal = (game['5v5_shots_on_goal'] ?? game.ev5_shots_on_goal ?? 0)

    if (!hasLoggedEv5StatSample && typeof window !== 'undefined') {
      hasLoggedEv5StatSample = true
      console.debug('[processChartData] 5v5 fallback check', {
        ev5_stat: game.ev5_stat,
        '5v5_assists': game['5v5_assists'],
        '5v5_points': game['5v5_points'],
        ev5_assists: game.ev5_assists,
        ev5_points: game.ev5_points,
        ev_4v4_points: (game as { ev_4v4_points?: number }).ev_4v4_points,
        ev4_points: (game as { ev4_points?: number }).ev4_points,
        '4v4_points': (game as { '4v4_points'?: number })['4v4_points'],
        ev_3v3_points: (game as { ev_3v3_points?: number }).ev_3v3_points,
        ev3_points: (game as { ev3_points?: number }).ev3_points,
        '3v3_points': (game as { '3v3_points'?: number })['3v3_points'],
        ev5_goals: game.ev5_goals,
        ev5_shots_on_goal: game.ev5_shots_on_goal,
        resolved5v5Assists,
        resolved5v5Points,
        resolved4v4Points,
        resolved3v3Points,
        resolvedEvPoints,
        resolved5v5Goals,
        resolved5v5ShotsOnGoal,
        game_id: (game as { game_id?: unknown }).game_id,
        player_name: (game as { player_name?: unknown }).player_name,
      })
    }

    return {
      ...game,
      opponent,
      opponentAndDate: `${opponent}\n${formattedDate || ''}`,
      goals: game.goals ?? 0,
      shots_on_goal: game.shots_on_goal ?? 0,
      corsi: game.corsi ?? 0,
      shot_attempts: Math.max(0, (game.corsi ?? 0) - (game.shots_on_goal ?? 0)),
      sog_HD: game.sog_HD ?? 0,
      pp_goals: game.pp_goals ?? 0,
      '5v5_goals': resolved5v5Goals,
      pk_goals: 0, // PK goals not tracked in data
      other_goals: Math.max(0, (game.goals ?? 0) - ((game.pp_goals ?? 0) + (game['5v5_goals'] ?? 0))),
      goals_total: (game.goals ?? 0),
      shooting_pct_game: (() => {
        const goals = game.goals ?? 0
        const shots = game.shots_on_goal ?? 0
        if (shots <= 0) return 0
        return (goals / shots) * 100
      })(),
      sat_HD: game.sat_HD ?? 0,
      sat_MD: game.sat_MD ?? 0,
      sat_LD: game.sat_LD ?? 0,
      sat_total: (game.sat_HD ?? 0) + ((typeof game.sat_MD === 'number' ? game.sat_MD : 0) ?? 0) + ((typeof game.sat_LD === 'number' ? game.sat_LD : 0) ?? 0),
      hd_remaining_attempts: Math.max(0, (game.sat_HD ?? 0) - (game.sog_HD ?? 0)),
      goals_HD: (typeof game.goals_HD === 'number' ? game.goals_HD : 0),
      goals_MD: game.goals_MD ?? 0,
      goals_LD: game.goals_LD ?? 0,
      goals_by_danger_total: (() => {
        const hd = game.goals_HD ?? 0
        const mdVal: unknown = game['goals_MD']
        const ldVal: unknown = game['goals_LD']
        const md: number = (typeof mdVal === 'number' ? mdVal : 0) as number
        const ld: number = (typeof ldVal === 'number' ? ldVal : 0) as number
        return (hd as number) + (md as number) + (ld as number)
      })(),
      formattedDate,
      assists: game.assists ?? 0,
      assists1: game.assists1 ?? 0,
      assists2: game.assists2 ?? 0,
      points: game.points ?? 0,
      team_goals: game.team_goals ?? 0,
      team_assists: game.team_assists ?? 0,
      team_points: game.team_points ?? 0,
      pp_assists1: game.pp_assists1 ?? 0,
      pp_assists2: game.pp_assists2 ?? 0,
      pp_assists: (game.pp_assists1 ?? 0) + (game.pp_assists2 ?? 0),
      '5v5_assists': resolved5v5Assists,
      '5v5_points': resolved5v5Points,
      ev_points: resolvedEvPoints,
      shots_missed: game.shots_missed ?? 0,
      shots_blocked_by_defense: game.shots_blocked_by_defense ?? 0,
      missed_and_blocked: (game.shots_missed ?? 0) + (game.shots_blocked_by_defense ?? 0),
      pp_corsi: game.pp_corsi ?? 0,
      pp_shots_on_goal: game.pp_shots_on_goal ?? 0,
      pp_sat: Math.max(0, (game.pp_corsi ?? 0) - (game.pp_shots_on_goal ?? 0)),
      '5v5_shots_on_goal': resolved5v5ShotsOnGoal,
      sog_total: (game.pp_shots_on_goal ?? 0) + resolved5v5ShotsOnGoal,
      // TOI fields - converted to numbers
      toi_seconds: game.toi_seconds ?? 0,
      ev_5v5_mmss: convertMmssToSeconds(typeof game.ev_5v5_mmss === 'string' ? game.ev_5v5_mmss : undefined),
      pp_mmss: convertMmssToSeconds(typeof game.pp_mmss === 'string' ? game.pp_mmss : undefined),
      pk_mmss: convertMmssToSeconds(typeof game.pk_mmss === 'string' ? game.pk_mmss : undefined),
      ev_4v4_mmss: convertMmssToSeconds(typeof game.ev_4v4_mmss === 'string' ? game.ev_4v4_mmss : undefined),
      ev_3v3_mmss: convertMmssToSeconds(typeof game.ev_3v3_mmss === 'string' ? game.ev_3v3_mmss : undefined),
      toi_total: convertMmssToSeconds(typeof game.ev_5v5_mmss === 'string' ? game.ev_5v5_mmss : undefined) + convertMmssToSeconds(typeof game.pp_mmss === 'string' ? game.pp_mmss : undefined) + convertMmssToSeconds(typeof game.pk_mmss === 'string' ? game.pk_mmss : undefined) + convertMmssToSeconds(typeof game.ev_4v4_mmss === 'string' ? game.ev_4v4_mmss : undefined) + convertMmssToSeconds(typeof game.ev_3v3_mmss === 'string' ? game.ev_3v3_mmss : undefined)
      ,
      assists_total: (game.assists1 ?? 0) + (game.assists2 ?? 0),
      assists_strength_total: ((game.pp_assists1 ?? 0) + (game.pp_assists2 ?? 0)) + resolved5v5Assists,
      assists_team_total: (game.assists ?? 0) + (game.team_assists ?? 0),
      assists_points_total: (game.assists ?? 0) + (game.points ?? 0),
      assists_goals_total: (game.assists ?? 0) + (game.goals ?? 0),
      points_total: resolvedEvPoints + (game.pp_points ?? 0),
      points_team_total: (game.points ?? 0) + (game.team_points ?? 0),
      points_team_goals_total: (game.points ?? 0) + (game.team_goals ?? 0),
      points_share_pct: (game.team_points ?? 0) > 0 ? ((game.points ?? 0) / (game.team_points ?? 0)) * 100 : 0,
      pp_points_share_pct: (game.points ?? 0) > 0 ? ((game.pp_points ?? 0) / (game.points ?? 0)) * 100 : 0,
      pp_toi_minutes: convertMmssToSeconds(typeof game.pp_mmss === 'string' ? game.pp_mmss : undefined) / 60
    } as ChartData
  })
}

// Calculate moving averages for a data array
export const calculateMovingAverages = <T extends ChartData>(
  data: T[],
  dataKey: keyof T,
  window5: number = 5,
  window20: number = 20
): Array<T & { [key: string]: number }> => {
  return data.map((_, i) => {
    // 5-game moving average
    const start5 = Math.max(0, i - window5 + 1)
    const subset5 = data.slice(start5, i + 1)
    const avg5 = subset5.reduce((sum, d) => {
      const val = d[dataKey]
      return sum + (typeof val === 'number' ? val : 0)
    }, 0) / subset5.length
    
    // 20-game moving average
    const start20 = Math.max(0, i - window20 + 1)
    const subset20 = data.slice(start20, i + 1)
    const avg20 = subset20.reduce((sum, d) => {
      const val = d[dataKey]
      return sum + (typeof val === 'number' ? val : 0)
    }, 0) / subset20.length
    
    return { 
      ...data[i],
      [`${String(dataKey)}_avg_5`]: avg5,
      [`${String(dataKey)}_avg_20`]: avg20
    } as T & { [key: string]: number }
  })
}

// Calculate insights for goals chart
export const calculateInsights = (chartData: ChartData[], lineValue: number): Insights => {
  const totalGames = chartData.length
  const totalGoals = chartData.reduce((sum, d) => sum + (d.goals || 0), 0)
  const gamesWithGoals = chartData.filter(d => (d.goals || 0) > 0).length
  const gamesOverLine = chartData.filter(d => (d.goals || 0) >= lineValue).length
  const avgGoals = totalGames > 0 ? totalGoals / totalGames : 0
  const hitRate = totalGames > 0 ? (gamesOverLine / totalGames) * 100 : 0
  const goalsPerGame = avgGoals
  const maxGoals = Math.max(...chartData.map(d => d.goals || 0))
  const minGoals = Math.min(...chartData.map(d => d.goals || 0))
  const streaks = chartData.map(d => (d.goals || 0) >= lineValue ? 1 : 0)
  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0
  streaks.forEach(val => {
    if (val === 1) {
      tempStreak++
      currentStreak = tempStreak
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
      currentStreak = 0
    }
  })
  
  return {
    totalGames,
    totalGoals,
    gamesWithGoals,
    gamesOverLine,
    avgGoals: avgGoals.toFixed(2),
    hitRate: hitRate.toFixed(1),
    goalsPerGame: goalsPerGame.toFixed(2),
    maxGoals,
    minGoals,
    currentStreak,
    longestStreak,
    gamesWithMultipleGoals: chartData.filter(d => (d.goals || 0) >= 2).length,
    gamesWithZeroGoals: chartData.filter(d => (d.goals || 0) === 0).length,
  }
}

// Calculate HD Shots insights
export const calculateHDShotsInsights = (chartData: ChartData[], allGamelogs: PlayerGamelog[]): HDShotsInsights => {
  const totalHDShots = chartData.reduce((sum, d) => sum + (d.sog_HD || 0), 0)
  const totalShots = chartData.reduce((sum, d) => sum + (d.shots_on_goal || 0), 0)
  const totalHDGoals = chartData.reduce((sum, d) => sum + ((d.goals_HD as number | undefined) || 0), 0)
  const avgHDShots = chartData.length > 0 ? totalHDShots / chartData.length : 0
  
  // Calculate full season average from allGamelogs or use filtered average as fallback
  const seasonData = allGamelogs || chartData
  const seasonTotalHDShots = seasonData.reduce((sum: number, d: PlayerGamelog) => sum + (d.sog_HD || 0), 0)
  const seasonAvg = seasonData.length > 0 ? seasonTotalHDShots / seasonData.length : avgHDShots
  const diff = avgHDShots - seasonAvg
  
  // HD Shot Percentage (HD Shots / SOG)
  const hdShotPct = totalShots > 0 ? (totalHDShots / totalShots) * 100 : 0
  
  // HD Shooting % (HD Goals / HD Shots on goal)
  const hdShootingPct = totalHDShots > 0 ? (totalHDGoals / totalHDShots) * 100 : 0
  
  return {
    average: avgHDShots,
    seasonAvg,
    diff,
    hdShotPct,
    hdShootingPct
  }
}

// Calculate Shots on Goal insights
export const calculateShotsOnGoalInsights = (chartData: ChartData[], allGamelogs: PlayerGamelog[]): ShotsOnGoalInsights => {
  const totalShots = chartData.reduce((sum, d) => sum + (d.shots_on_goal || 0), 0)
  const totalCorsi = chartData.reduce((sum, d) => sum + (d.corsi || 0), 0)
  const avgShots = chartData.length > 0 ? totalShots / chartData.length : 0
  const avgCorsi = chartData.length > 0 ? totalCorsi / chartData.length : 0
  
  // Calculate full season averages from allGamelogs or use filtered average as fallback
  const seasonData = allGamelogs || chartData
  const seasonTotalShots = seasonData.reduce((sum: number, d: PlayerGamelog) => sum + (d.shots_on_goal || 0), 0)
  const seasonTotalCorsi = seasonData.reduce((sum: number, d: PlayerGamelog) => sum + (d.corsi || 0), 0)
  const seasonAvgShots = seasonData.length > 0 ? seasonTotalShots / seasonData.length : avgShots
  const seasonAvgCorsi = seasonData.length > 0 ? seasonTotalCorsi / seasonData.length : avgCorsi
  
  const diffShots = avgShots - seasonAvgShots
  const diffCorsi = avgCorsi - seasonAvgCorsi
  
  return {
    avgShots,
    avgCorsi,
    seasonAvgShots,
    seasonAvgCorsi,
    diffShots,
    diffCorsi
  }
}

// Calculate TOI insights
export const calculateTOIInsights = (chartData: ChartData[], allGamelogs: PlayerGamelog[]): TOIInsights => {
  const totalToi = chartData.reduce((sum, d) => sum + (d.toi_seconds || 0), 0)
  const avgToi = chartData.length > 0 ? totalToi / chartData.length : 0
  
  // Calculate full season average from allGamelogs or use filtered average as fallback
  const seasonData = allGamelogs || chartData
  const seasonTotalToi = seasonData.reduce((sum: number, d: PlayerGamelog) => sum + (d.toi_seconds || 0), 0)
  const seasonAvg = seasonData.length > 0 ? seasonTotalToi / seasonData.length : avgToi
  const diff = avgToi - seasonAvg
  
  return {
    average: avgToi,
    seasonAvg,
    diff
  }
}

// Calculate rolling average for a specific window
export const calculateRollingAverage = <T extends ChartData>(
  data: T[],
  dataKey: keyof T,
  window: number
): Array<T & { rollingAvg?: number }> => {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const subset = data.slice(start, i + 1)
    const avg = subset.reduce((sum, d) => {
      const val = d[dataKey]
      return sum + (typeof val === 'number' ? val : 0)
    }, 0) / subset.length
    return { ...data[i], rollingAvg: avg }
  })
}

// Calculate moving average for a specific window
export const calculateMovingAverage = <T extends ChartData>(
  data: T[],
  dataKey: keyof T,
  window: number
): Array<T & { movingAvg?: number }> => {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const subset = data.slice(start, i + 1)
    const avg = subset.reduce((sum, d) => {
      const val = d[dataKey]
      return sum + (typeof val === 'number' ? val : 0)
    }, 0) / subset.length
    return { ...data[i], movingAvg: avg }
  })
}

// Calculate trend line (linear regression)
export const calculateTrendLine = <T extends ChartData>(
  data: T[],
  dataKey: keyof T
): Array<T & { trendValue?: number }> => {
  if (data.length < 2) return data.map(d => ({ ...d }))
  
  // Simple linear regression: y = mx + b
  const n = data.length
  const xValues = data.map((_, i) => i)
  const yValues = data.map(d => {
    const val = d[dataKey]
    return typeof val === 'number' ? val : 0
  })
  
  const sumX = xValues.reduce<number>((a, b) => a + b, 0)
  const sumY = yValues.reduce<number>((a, b) => a + b, 0)
  const sumXY = xValues.reduce<number>((sum, x, i) => sum + x * yValues[i]!, 0)
  const sumXX = xValues.reduce<number>((sum, x) => sum + x * x, 0)
  
  const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const b = (sumY - m * sumX) / n
  
  return data.map((_, i) => ({
    ...data[i],
    trendValue: m * i + b
  }))
}

// Calculate average line value (overall average)
export const calculateAverageLine = <T extends ChartData>(
  data: T[],
  dataKey: keyof T
): number => {
  if (data.length === 0) return 0
  const total = data.reduce((sum, d) => {
    const val = d[dataKey]
    return sum + (typeof val === 'number' ? val : 0)
  }, 0)
  return total / data.length
}

// Calculate goal share data (player goals / team goals as percentage) with rolling cumulative average
export const calculateGoalShareData = (
  chartData: ChartData[],
  window: number = 5
): Array<ChartData & { goal_share_rolling_avg?: number }> => {
  const MIN_TEAM_GOALS = 5 // Minimum team goals required to calculate meaningful percentage
  
  return chartData.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const subset = chartData.slice(start, i + 1)
    
    // Sum all player goals and team goals in the window (cumulative)
    const totalPlayerGoals = subset.reduce((sum, d) => sum + (d.goals ?? 0), 0)
    const totalTeamGoals = subset.reduce((sum, d) => sum + (d.team_goals ?? 0), 0)
    
    // Only calculate if we have enough team goals to avoid extreme early values
    if (totalTeamGoals < MIN_TEAM_GOALS) {
      return { ...chartData[i], goal_share_rolling_avg: undefined }
    }
    
    // Calculate cumulative percentage: (total player goals / total team goals) * 100
    const goalShare = totalTeamGoals === 0 ? 0 : (totalPlayerGoals / totalTeamGoals) * 100
    
    return { ...chartData[i], goal_share_rolling_avg: goalShare }
  })
}

// Calculate shooting percentage data (goals / shots_on_goal as percentage) with rolling cumulative average
export const calculateShootingPercentageData = (
  chartData: ChartData[],
  window: number = 5
): Array<ChartData & { shooting_pct_rolling_avg?: number }> => {
  return chartData.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const subset = chartData.slice(start, i + 1)
    const totalPct = subset.reduce((sum, d) => sum + (d.shooting_pct_game ?? 0), 0)
    const avgPct = subset.length > 0 ? totalPct / subset.length : 0
    return { ...chartData[i], shooting_pct_rolling_avg: avgPct }
  })
}

// Calculate season average for goal share
export const calculateGoalShareSeasonAvg = (
  chartData: ChartData[],
  allGamelogs?: PlayerGamelog[]
): number => {
  const data = allGamelogs || chartData
  if (data.length === 0) return 0
  
  const totalPlayerGoals = data.reduce((sum, d) => sum + ((d.goals as number) ?? 0), 0)
  const totalTeamGoals = data.reduce((sum, d) => sum + ((d.team_goals as number) ?? 0), 0)
  
  if (totalTeamGoals === 0) return 0
  return (totalPlayerGoals / totalTeamGoals) * 100
}

// Calculate season average for shooting percentage
export const calculateShootingPercentageSeasonAvg = (
  chartData: ChartData[],
  allGamelogs?: PlayerGamelog[]
): number => {
  const data = allGamelogs || chartData
  if (data.length === 0) return 0
  
  const totalGoals = data.reduce((sum, d) => sum + ((d.goals as number) ?? 0), 0)
  const totalShots = data.reduce((sum, d) => sum + ((d.shots_on_goal as number) ?? 0), 0)
  
  if (totalShots === 0) return 0
  return (totalGoals / totalShots) * 100
}

