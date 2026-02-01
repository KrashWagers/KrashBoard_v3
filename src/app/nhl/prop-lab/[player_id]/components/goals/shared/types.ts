export interface PlayerGamelog {
  [key: string]: unknown
  game_date?: string | Date
  goals?: number
  shots_on_goal?: number
  corsi?: number
  sog_HD?: number
  sat_HD?: number
  toi_seconds?: number
  assists?: number
  assists1?: number
  assists2?: number
  points?: number
  team_goals?: number
  team_assists?: number
  team_points?: number
  away_abbrev?: string
  home_abbrev?: string
  player_team_abbrev?: string
  venue?: string
  season_id?: string
  days_rest?: number
  game_time_bucket?: string
  day_of_week?: string
  ev_5v5_mmss?: string | number
  pp_mmss?: string | number
  pk_mmss?: string | number
  ev_4v4_mmss?: string | number
  ev_3v3_mmss?: string | number
  pp_goals?: number
  pp_assists1?: number
  pp_assists2?: number
  '5v5_goals'?: number
  '5v5_assists'?: number
  '5v5_points'?: number
  goals_MD?: number
  goals_LD?: number
  sat_MD?: number
  sat_LD?: number
  goals_HD?: number
  shifts?: number
  pp_points?: number
  pp_assists?: number
  team_pp_goals?: number
  team_pp_points?: number
  ev5_stat?: number
  ev5_assists?: number
  ev5_points?: number
  ev5_goals?: number
  ev5_shots_on_goal?: number
  shots_missed?: number
  shots_blocked_by_defense?: number
  pp_corsi?: number
  pp_shots_on_goal?: number
  '5v5_shots_on_goal'?: number
}

// Chart data type - transformed data with additional computed fields
export interface ChartData extends PlayerGamelog {
  opponent?: string
  opponentAndDate?: string
  shot_attempts?: number
  shooting_pct_game?: number
  hd_remaining_attempts?: number
  goals_by_danger_total?: number
  goals_total?: number
  toi_total?: number
  formattedDate?: string
  averageLine?: number
  rollingAvg?: number
  movingAvg?: number
  trendValue?: number
  shots_on_goal_avg?: number
  shots_on_goal_avg_5?: number
  shots_on_goal_avg_20?: number
  sog_HD_avg?: number
  sat_HD_avg_5?: number
  sat_HD_avg_20?: number
  toi_avg_5?: number
  toi_avg_20?: number
  team_goals_avg_5?: number
  team_goals_avg_20?: number
  goal_share_rolling_avg?: number
  goal_share_season_avg?: number
  shooting_pct_rolling_avg?: number
  shooting_pct_season_avg?: number
  pk_goals?: number
  assists_total?: number
  assists_strength_total?: number
  assists_team_total?: number
  assists_points_total?: number
  assists_goals_total?: number
  points_total?: number
  points_team_total?: number
  points_team_goals_total?: number
  points_share_pct?: number
  pp_points_share_pct?: number
  ev_points?: number
  pp_sat?: number
  missed_and_blocked?: number
  sog_total?: number
  pp_toi_minutes?: number
}

export interface SelectedProp {
  propName: string
  line: number
  ou: string
  playerId: string
  playerName: string
}

export interface AvailableLine {
  line: number
  books: Array<{
    bookmaker: string
    price_american: number
    implied_win_pct?: number
  }>
  bestOdds: number | null
  bestBook: {
    bookmaker: string
    price_american: number
  } | null
}

export interface ChartSettings {
  showAverageLine?: boolean
  showRollingAverage?: boolean
  rollingAverageWindow?: number
  showMovingAverage?: boolean
  movingAverageWindow?: number
  showTrendLine?: boolean
}

export interface HitRateStats {
  hitRate: number
  hits: number
  total: number
  avgValue: number
  impliedWinPct?: number
  hrVsIw?: number
  bestOdds?: number
}

export interface FilterButtons {
  period: React.ReactElement
  venue: React.ReactElement
  actions: React.ReactElement
}

export type PropLabTabKey = 'prop-lab' | 'gamelogs' | 'market'

export interface GoalsDashboardProps {
  gamelogs: PlayerGamelog[]
  selectedProp: SelectedProp
  lineValue: number
  allGamelogs?: PlayerGamelog[]
  chartSettings?: ChartSettings
  hitRateStats?: HitRateStats
  availableLines?: AvailableLine[]
  filterButtons?: FilterButtons
  onSettingsOpen?: () => void
  onOpenGamelogs?: () => void
  allProps?: any[] // For Market tab
  playerId?: string // For PlayerVsOpponentHistory and IceRinkVisualization
  timeFilter?: string // For IceRinkVisualization
  activeTab?: PropLabTabKey
  teamPayload?: import("@/types/nhlTeamPayload").TeamPayloadRow | null
  opponentPayload?: import("@/types/nhlTeamPayload").TeamPayloadRow | null
  opponentTeam?: string | null
}

export interface CustomXAxisTickProps {
  x?: number
  y?: number
  payload?: {
    value?: string
  }
  dataLength?: number
}

export interface MainChartTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: ChartData
  }>
  label?: string
}

export interface Insights {
  totalGames: number
  totalGoals: number
  gamesWithGoals: number
  gamesOverLine: number
  avgGoals: string
  hitRate: string
  goalsPerGame: string
  maxGoals: number
  minGoals: number
  currentStreak: number
  longestStreak: number
  gamesWithMultipleGoals: number
  gamesWithZeroGoals: number
}

export interface HDShotsInsights {
  average: number
  seasonAvg: number
  diff: number
  hdShotPct: number
  hdShootingPct: number
}

export interface ShotsOnGoalInsights {
  avgShots: number
  avgCorsi: number
  seasonAvgShots: number
  seasonAvgCorsi: number
  diffShots: number
  diffCorsi: number
}

export interface TOIInsights {
  average: number
  seasonAvg: number
  diff: number
}

