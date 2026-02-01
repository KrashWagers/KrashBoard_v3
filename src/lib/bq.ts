import { BigQuery } from "@google-cloud/bigquery"
import { getBigQueryConfig } from "./bigquery"
import { logger } from "./logger"

let nhlBigqueryInstance: BigQuery | null = null

export function getNhlBigQueryClient(): BigQuery {
  if (!nhlBigqueryInstance) {
    nhlBigqueryInstance = new BigQuery(
      getBigQueryConfig(
        process.env.NHL_GCP_PROJECT_ID || "nhl25-473523",
        "NHL_GCP_KEY_FILE"
      )
    )
  }
  return nhlBigqueryInstance
}

export async function queryNhlBigQuery<T = unknown>(
  query: string,
  params?: Record<string, any>,
  options?: { maxResults?: number; timeoutMs?: number }
): Promise<T[]> {
  try {
    const bigquery = getNhlBigQueryClient()
    const [rows] = await bigquery.query({
      query,
      params,
      ...options,
    })
    return rows as T[]
  } catch (error) {
    logger.error("NHL BigQuery query failed", error)
    throw new Error(
      `NHL BigQuery query failed: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}
