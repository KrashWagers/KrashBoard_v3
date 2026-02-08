"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ErrorBoundary } from "@/components/error-boundary"

/**
 * Wraps main app content. For MLB Pitch Matrix we use no padding and
 * overflow-hidden so the page’s own flex/scroll layout can sit flush under
 * the header and control scrolling. All other routes get normal padding and
 * overflow-y-auto.
 */
export function MainContentArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPitchMatrix = pathname?.includes("/pitch-matrix") ?? false

  return (
    <div
      className={`flex-1 min-w-0 min-h-0 overflow-x-hidden ${
        isPitchMatrix ? "overflow-hidden p-0" : "overflow-y-auto p-4"
      }`}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  )
}
