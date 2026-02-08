"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DEFAULT_MAX_HEIGHT = "min(60vh, 520px)"

/**
 * DataTableViewport — scrollable table/list region with optional sticky header
 *
 * Use this wrapper for large tables (100+ rows) to get a "Google Sheets feel":
 * - Table region has a max height and scrolls independently
 * - The rest of the page continues to scroll normally in the main content pane
 *
 * Usage:
 * 1. Wrap your table (or list) in <DataTableViewport>.
 * 2. For a sticky header: put the header row(s) in a wrapper with
 *    className="sticky top-0 z-10 bg-card border-b border-border"
 *    (or use the optional headerSlot and we apply sticky for you).
 * 3. The body (tbody or list items) will scroll inside the viewport.
 *
 * Small tables can stay unwrapped and flow in the page.
 */
interface DataTableViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max height of the scrollable area. Default: min(60vh, 520px) */
  maxHeight?: string | number
  /**
   * Optional slot for sticky header content.
   * When provided, we render it with sticky top-0 and appropriate bg/border.
   */
  headerSlot?: React.ReactNode
  /**
   * Optional ref forwarded to the inner scroll div (overflow-auto).
   * Use for useVirtualizer getScrollElement: () => scrollRef.current.
   */
  scrollRef?: React.RefObject<HTMLDivElement | null>
  children: React.ReactNode
}

const DataTableViewport = React.forwardRef<HTMLDivElement, DataTableViewportProps>(
  ({ className, maxHeight = DEFAULT_MAX_HEIGHT, headerSlot, scrollRef, children, ...props }, ref) => {
    const style: React.CSSProperties = typeof maxHeight === "number"
      ? { maxHeight: `${maxHeight}px` }
      : { maxHeight }

    return (
      <div
        ref={ref}
        style={style}
        className={cn("flex flex-col min-h-0 rounded-lg border border-border bg-card overflow-hidden", className)}
        {...props}
      >
        {headerSlot != null ? (
          <div className="sticky top-0 z-10 flex-shrink-0 border-b border-border bg-card">
            {headerSlot}
          </div>
        ) : null}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
          {children}
        </div>
      </div>
    )
  }
)
DataTableViewport.displayName = "DataTableViewport"

/**
 * Tailwind-only pattern (no component):
 *
 * For a custom layout, use these classes on the table container:
 *
 *   - Outer: min-h-0 flex-1 flex flex-col (so it can shrink in flex parent)
 *   - Sticky header row: sticky top-0 z-10 bg-card border-b border-border
 *   - Scroll body: min-h-0 flex-1 overflow-auto max-h-[60vh] (or max-h-[520px])
 *
 * Ensure the parent of the scroll body has min-h-0 so overflow works.
 */
export { DataTableViewport, DEFAULT_MAX_HEIGHT }
