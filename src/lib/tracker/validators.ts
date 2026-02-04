import { z } from "zod"
import { TRACKER_RESULTS } from "@/types/tracker"

export const trackerResultSchema = z.enum(TRACKER_RESULTS)

const trimString = z.string().transform((val) => val.trim())
const optionalString = z.string().transform((val) => val.trim()).optional()

const trackerBetInputSchemaInner = z.object({
  created_at: z.string().datetime().optional(),
  event_date: z.string().optional(),
  is_parlay: z.boolean().optional(),
  parlay_legs: z.number().int().min(0).optional(),
  is_boost: z.boolean().optional(),
  profit_boost_pct: z.number().min(0).optional(),
  is_bonus_bet: z.boolean().optional(),
  bonus_bet_value: z.number().min(0).optional(),
  is_no_sweat: z.boolean().optional(),
  no_sweat_value: z.number().min(0).optional(),
  sport: optionalString,
  sportsbook: optionalString,
  event: optionalString,
  market: optionalString,
  line: optionalString,
  bet_name: optionalString,
  odds: z.number().finite().optional(),
  implied_win_pct: z.number().finite().optional(),
  dollar_stake: z.number().finite().optional(),
  unit_stake: z.number().finite().optional(),
  potential_payout: z.number().finite().optional(),
  result: trackerResultSchema,
  payout: z.number().finite().optional(),
})

export const trackerBetInputSchema = trackerBetInputSchemaInner
export type TrackerBetInputInferred = z.infer<typeof trackerBetInputSchema>

export const trackerBetUpdateSchema = trackerBetInputSchema.partial()

export type TrackerBetUpdateInput = z.infer<typeof trackerBetUpdateSchema>

export const trackerImportSchema = z.object({
  rows: z.array(trackerBetInputSchema).min(1, "Import requires at least one row"),
})

export type TrackerImportRow = z.infer<typeof trackerBetInputSchema>
