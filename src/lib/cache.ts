// Server-side cache implementation
interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class ServerCache {
  private cache = new Map<string, CacheItem<any>>()
  private refreshIntervals = new Map<string, NodeJS.Timeout>()

  // Set cache item with TTL
  set<T>(key: string, data: T, ttlMinutes: number): void {
    const now = Date.now()
    const expiresAt = now + (ttlMinutes * 60 * 1000)
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })

    // Clear existing refresh interval
    if (this.refreshIntervals.has(key)) {
      clearInterval(this.refreshIntervals.get(key)!)
    }

    // Set up refresh interval
    const interval = setInterval(() => {
      this.invalidate(key)
    }, ttlMinutes * 60 * 1000)

    this.refreshIntervals.set(key, interval)
  }

  // Get cache item
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.invalidate(key)
      return null
    }

    return item.data
  }

  // Check if cache exists and is valid
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    return Date.now() <= item.expiresAt
  }

  // Invalidate cache
  invalidate(key: string): void {
    this.cache.delete(key)
    if (this.refreshIntervals.has(key)) {
      clearInterval(this.refreshIntervals.get(key)!)
      this.refreshIntervals.delete(key)
    }
  }

  // Get cache info
  getInfo(key: string): { timestamp: number; expiresAt: number; isValid: boolean } | null {
    const item = this.cache.get(key)
    if (!item) return null

    return {
      timestamp: item.timestamp,
      expiresAt: item.expiresAt,
      isValid: Date.now() <= item.expiresAt
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.refreshIntervals.forEach(interval => clearInterval(interval))
    this.refreshIntervals.clear()
  }
}

// Global cache instance
export const serverCache = new ServerCache()

// Cache keys
export const CACHE_KEYS = {
  PLAYER_PROPS: 'player_props',
  FILTER_OPTIONS: 'filter_options',
  NHL_PLAYER_PROPS: 'nhl_player_props',
  NHL_FILTER_OPTIONS: 'nhl_filter_options',
  NHL_PLAYER_VS_OPP: 'nhl_player_vs_opp',
  NHL_TEAM_GAMELOGS: 'nhl_team_gamelogs',
  NHL_PLAYER_PAYLOAD: 'nhl_player_payload',
  // Add other cache keys as needed
} as const

// Cache TTL in minutes
export const CACHE_TTL = {
  PLAYER_PROPS: 30, // 30 minutes
  FILTER_OPTIONS: 24 * 60, // 24 hours
  NHL_PLAYER_PROPS: 10, // 10 minutes for odds data
  NHL_FILTER_OPTIONS: 24 * 60,
  NHL_PLAYER_VS_OPP: 30, // 30 minutes
  NHL_TEAM_GAMELOGS: 24 * 60,
  NHL_PLAYER_PAYLOAD: 24 * 60,
  // Add other TTL values as needed
} as const

type TimedCacheItem<T> = {
  data: T
  expiresAt: number
}

const timedCache = new Map<string, TimedCacheItem<unknown>>()

/** 24 hours in seconds — for data that updates once per day (e.g. MLB BVP payloads) */
export const CACHE_TTL_24H_SECONDS = 24 * 60 * 60

export function getCacheTTLSeconds(now: Date = new Date()): number {
  const etNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  )
  const nextReset = new Date(etNow)
  nextReset.setHours(4, 0, 0, 0)

  if (etNow >= nextReset) {
    nextReset.setDate(nextReset.getDate() + 1)
  }

  const diffMs = nextReset.getTime() - etNow.getTime()
  const diffSeconds = Math.max(1, Math.floor(diffMs / 1000))
  return Math.min(diffSeconds, 86400)
}

export function getFromCache<T>(key: string): T | null {
  const item = timedCache.get(key)
  if (!item) return null
  if (Date.now() >= item.expiresAt) {
    timedCache.delete(key)
    return null
  }
  return item.data as T
}

export function setCache<T>(key: string, value: T, ttlSeconds: number): void {
  const expiresAt = Date.now() + ttlSeconds * 1000
  timedCache.set(key, { data: value, expiresAt })
}

// Shared cache helper (in-memory by default; swap for Redis in prod if desired)
export async function getCached<T>(key: string): Promise<T | null> {
  return serverCache.get<T>(key)
}

export async function setCached<T>(key: string, data: T, ttlMinutes: number): Promise<void> {
  serverCache.set(key, data, ttlMinutes)
}

export async function invalidateCached(key: string): Promise<void> {
  serverCache.invalidate(key)
}
