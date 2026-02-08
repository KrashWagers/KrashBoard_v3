"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { MlbModeClient } from "./MlbModeClient"

export default function MlbLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPitchMatrix = pathname?.includes("/pitch-matrix") ?? false
  const isBatterVsPitcher = pathname === "/mlb/batter-vs-pitcher"

  if (isPitchMatrix) {
    return (
      <>
        <MlbModeClient />
        <div className="w-full">{children}</div>
      </>
    )
  }

  if (isBatterVsPitcher) {
    return (
      <div className="mlb-scope flex min-h-0 flex-1 flex-col">
        <MlbModeClient />
        <div className="mlb-shell mx-auto flex min-h-0 flex-1 flex-col px-4 md:px-6 w-full max-w-[1600px]">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="mlb-scope min-h-screen py-8">
      <MlbModeClient />
      <div className="mlb-shell mx-auto w-full max-w-[1600px] space-y-8 px-4 md:px-6">
        {children}
      </div>
    </div>
  )
}
