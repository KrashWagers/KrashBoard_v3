/**
 * Shared table column sizing for spreadsheet-style data tables.
 * Use with <table table-layout: fixed>, <colgroup>, and overflow-x-auto on the container.
 * Ensures stable widths and horizontal scroll instead of squishing.
 */

export type TableColAlign = "left" | "center" | "right"

export type TableColSpec = {
  widthPx: number
  align?: TableColAlign
}

/** Default column spec for MLB Batter vs Pitcher summary table. Reuse for other BvP or similar tables. */
export const BVP_TABLE_COLUMNS: TableColSpec[] = [
  { widthPx: 28, align: "left" },   // expand chevron
  { widthPx: 260, align: "left" },  // Batter (truncate + tooltip)
  { widthPx: 240, align: "left" },  // Pitcher (truncate + tooltip)
  { widthPx: 64, align: "center" }, // Type (SP/RP)
  { widthPx: 56, align: "right" },  // PA
  { widthPx: 56, align: "right" }, // AB
  { widthPx: 56, align: "right" }, // H
  { widthPx: 56, align: "right" }, // HR
  { widthPx: 56, align: "right" }, // BB
  { widthPx: 56, align: "right" }, // SO
  { widthPx: 72, align: "right" },  // AVG
  { widthPx: 72, align: "right" },  // OBP
  { widthPx: 72, align: "right" },  // SLG
  { widthPx: 72, align: "right" },  // OPS
]

export const BVP_TABLE_COL_COUNT = BVP_TABLE_COLUMNS.length

/** Total minimum width of the BvP table (for min-width on table or scroll container). */
export const BVP_TABLE_MIN_WIDTH_PX = BVP_TABLE_COLUMNS.reduce((s, c) => s + c.widthPx, 0)

/** Tailwind alignment classes from spec (for th/td). */
export function tableColAlignClass(spec: TableColSpec): string {
  switch (spec.align) {
    case "center":
      return "text-center"
    case "right":
      return "text-right"
    default:
      return "text-left"
  }
}
