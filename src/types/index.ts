// Base types
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// User types
export interface User extends BaseEntity {
  email: string
  name?: string
  avatar?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultSport: 'nfl' | 'mlb' | 'nba' | 'nhl'
  timezone: string
  currency: 'USD' | 'EUR' | 'GBP'
}

// Sport types
export type Sport = 'nfl' | 'mlb' | 'nba' | 'nhl'

export interface SportConfig {
  id: Sport
  name: string
  season: number
  currentWeek?: number
  isActive: boolean
}

// Team types
export interface Team {
  id: string
  name: string
  abbreviation: string
  city: string
  logo: string
  colors: {
    primary: string
    secondary: string
  }
  conference: string
  division: string
}

// Player types
export interface Player {
  id: string
  name: string
  position: string
  team: Team
  jerseyNumber: number
  height: string
  weight: number
  age: number
  experience: number
  college: string
  headshot: string
  status: 'active' | 'injured' | 'suspended' | 'inactive'
}

// Game types
export interface Game {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: Date
  time: string
  status: 'scheduled' | 'live' | 'final' | 'postponed' | 'cancelled'
  week: number
  season: number
  venue: string
  weather?: WeatherData
  odds?: GameOdds
}

export interface WeatherData {
  temperature: number
  condition: string
  windSpeed: number
  windDirection: string
  humidity: number
  precipitation: number
}

export interface GameOdds {
  spread: number
  total: number
  homeMoneyline: number
  awayMoneyline: number
}

// Player Props types
export interface PlayerProp {
  id: string
  player: Player
  game: Game
  propType: PropType
  line: number
  overOdds: number
  underOdds: number
  lastUpdated: Date
  isActive: boolean
}

export type PropType = 
  | 'passing_yards'
  | 'passing_touchdowns'
  | 'rushing_yards'
  | 'rushing_touchdowns'
  | 'receiving_yards'
  | 'receiving_touchdowns'
  | 'receptions'
  | 'interceptions'
  | 'completions'
  | 'attempts'
  | 'fumbles'
  | 'sacks'
  | 'tackles'
  | 'assists'

// Stats types
export interface PlayerStats {
  player: Player
  game: Game
  stats: {
    passing?: PassingStats
    rushing?: RushingStats
    receiving?: ReceivingStats
    defense?: DefenseStats
  }
}

export interface PassingStats {
  completions: number
  attempts: number
  yards: number
  touchdowns: number
  interceptions: number
  rating: number
  completionPercentage: number
}

export interface RushingStats {
  attempts: number
  yards: number
  touchdowns: number
  average: number
  long: number
  fumbles: number
}

export interface ReceivingStats {
  receptions: number
  targets: number
  yards: number
  touchdowns: number
  average: number
  long: number
  catchPercentage: number
}

export interface DefenseStats {
  tackles: number
  assists: number
  sacks: number
  interceptions: number
  passesDefended: number
  fumblesForced: number
  fumblesRecovered: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter types
export interface FilterOptions {
  search?: string
  team?: string
  position?: string
  week?: number
  season?: number
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error?: string
  data?: any
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Navigation types
export interface NavItem {
  title: string
  href: string
  icon?: string
  children?: NavItem[]
  badge?: string
}

export interface BreadcrumbItem {
  title: string
  href?: string
}
