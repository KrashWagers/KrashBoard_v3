"use client"

import * as React from "react"

export type SportId = "nfl" | "nhl" | "nba" | "mlb"

const SPORT_STORAGE_KEY = "krashboard.activeSport"

const sportIdFromPathname = (pathname: string): SportId | null => {
  if (pathname.startsWith("/nfl")) return "nfl"
  if (pathname.startsWith("/nhl")) return "nhl"
  if (pathname.startsWith("/nba")) return "nba"
  if (pathname.startsWith("/mlb")) return "mlb"
  return null
}

export function useActiveSportId(pathname?: string) {
  const [activeSportId, setActiveSportIdState] = React.useState<SportId | null>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(SPORT_STORAGE_KEY) as SportId | null
    if (stored) {
      setActiveSportIdState(stored)
    }
  }, [])

  React.useEffect(() => {
    if (typeof window === "undefined" || !pathname) return
    const fromPath = sportIdFromPathname(pathname)
    if (fromPath) {
      window.localStorage.setItem(SPORT_STORAGE_KEY, fromPath)
      setActiveSportIdState(fromPath)
    }
  }, [pathname])

  const setActiveSportId = React.useCallback((sportId: SportId) => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(SPORT_STORAGE_KEY, sportId)
    setActiveSportIdState(sportId)
  }, [])

  return { activeSportId, setActiveSportId }
}
