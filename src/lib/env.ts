import { z } from 'zod'

/**
 * Environment variable validation
 * Validates all required environment variables at startup
 */

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // BigQuery Main
  BIGQUERY_PROJECT_ID: z.string().min(1).optional(),
  GOOGLE_APPLICATION_CREDENTIALS: z.string().min(1).optional(),

  // BigQuery NFL
  GOOGLE_CLOUD_PROJECT_ID: z.string().min(1).optional(),
  GOOGLE_CLOUD_KEY_FILE: z.string().min(1).optional(),

  // BigQuery NHL
  NHL_GCP_PROJECT_ID: z.string().min(1).optional(),
  NHL_GCP_KEY_FILE: z.string().min(1).optional(),

  // BigQuery NBA
  NBA_GCP_PROJECT_ID: z.string().min(1).optional(),
  NBA_GCP_KEY_FILE: z.string().min(1).optional(),
  PROPS_CACHE_TTL_SECONDS: z.string().optional(),

  // App Config
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),

  // Optional
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
})

type Env = z.infer<typeof envSchema>

/**
 * Validates environment variables
 * Throws error with clear message if validation fails
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      BIGQUERY_PROJECT_ID: process.env.BIGQUERY_PROJECT_ID,
      GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
      GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE,
      NHL_GCP_PROJECT_ID: process.env.NHL_GCP_PROJECT_ID,
      NHL_GCP_KEY_FILE: process.env.NHL_GCP_KEY_FILE,
      NBA_GCP_PROJECT_ID: process.env.NBA_GCP_PROJECT_ID,
      NBA_GCP_KEY_FILE: process.env.NBA_GCP_KEY_FILE,
      PROPS_CACHE_TTL_SECONDS: process.env.PROPS_CACHE_TTL_SECONDS,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
      SENTRY_DSN: process.env.SENTRY_DSN,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue: z.ZodIssue) => issue.path.join('.')).join(', ')
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}\n` +
        `Please check your .env.local file or Vercel environment variables.`
      )
    }
    throw error
  }
}

// Validate on module load (only in server-side code)
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error) {
    // Only log in development, don't crash in production during build
    if (process.env.NODE_ENV === 'development') {
      console.warn('Environment validation warning:', error instanceof Error ? error.message : error)
    }
  }
}

