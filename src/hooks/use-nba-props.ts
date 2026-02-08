"use client"

import { useQuery } from "@tanstack/react-query"
import type { NbaPropsApiResponse } from "@/lib/nba/types"

const QUERY_KEY = ["nba", "props"] as const

export function useNbaProps() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<NbaPropsApiResponse> => {
      const r = await fetch("/api/nba/props")
      if (!r.ok) throw new Error(r.statusText)
      return r.json()
    },
    staleTime: 5 * 60 * 1000, // 5 min — second page load is instant
  })
}
