import { z } from 'zod'

/**
 * Validation schemas for API inputs
 * Prevents SQL injection and ensures type safety
 */

// Filtered props request schema
export const filteredPropsRequestSchema = z.object({
  players: z.array(z.string()).default([]),
  props: z.array(z.string()).default([]),
  games: z.array(z.string()).default([]),
  ou: z.array(z.string()).default([]),
  altProps: z.boolean().default(false),
  sportsbooks: z.array(z.string()).default([]),
  page: z.number().int().positive().default(1),
  sortField: z.enum([
    'commence_time_utc',
    'bestOdds',
    'impliedWinPct',
    'streak',
    'hit2024',
    'hit2025',
    'hitL20',
    'hitL15',
    'hitL10',
    'hitL5'
  ]).default('commence_time_utc'),
  sortDirection: z.enum(['asc', 'desc', 'ASC', 'DESC']).transform(val => val.toUpperCase() as 'ASC' | 'DESC').default('DESC'),
})

export type FilteredPropsRequest = z.infer<typeof filteredPropsRequestSchema>

// Player ID parameter schema
export const playerIdSchema = z.string().min(1).max(100)

// Season parameter schema
export const seasonSchema = z.number().int().min(2000).max(2100)

// Week parameter schema
export const weekSchema = z.number().int().min(1).max(25).optional()

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(1000).default(100),
})

// NFL players filter schema
export const nflPlayersFilterSchema = z.object({
  position: z.string().max(10).optional(),
  team: z.string().max(10).optional(),
  search: z.string().max(100).optional(),
})

// NHL players filter schema
export const nhlPlayersFilterSchema = z.object({
  team: z.string().max(10).optional(),
  search: z.string().max(100).optional(),
})

// Matchups filter schema
export const matchupsFilterSchema = z.object({
  season: seasonSchema.default(2024),
  week: weekSchema,
})

