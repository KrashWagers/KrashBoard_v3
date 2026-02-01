type CacheEntry<T> = {
  data: T
  fetchedAt: number
  expiresAt: number
  ttlSeconds: number
}

type CacheHit<T> = {
  data: T
  fetchedAt: number
  ttlSeconds: number
  isStale: boolean
}

const cache = new Map<string, CacheEntry<unknown>>()
const inflight = new Map<string, Promise<void>>()

export function getCached<T>(key: string): CacheHit<T> | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  const isStale = Date.now() > entry.expiresAt
  return {
    data: entry.data,
    fetchedAt: entry.fetchedAt,
    ttlSeconds: entry.ttlSeconds,
    isStale,
  }
}

export function setCached<T>(key: string, data: T, ttlSeconds: number): CacheEntry<T> {
  const now = Date.now()
  const entry: CacheEntry<T> = {
    data,
    fetchedAt: now,
    expiresAt: now + ttlSeconds * 1000,
    ttlSeconds,
  }
  cache.set(key, entry)
  return entry
}

export function getInflight(key: string): Promise<void> | undefined {
  return inflight.get(key)
}

export function setInflight(key: string, promise: Promise<void>): void {
  inflight.set(key, promise)
  promise.finally(() => inflight.delete(key))
}
