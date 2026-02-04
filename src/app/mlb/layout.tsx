import * as React from "react"
import { MlbModeClient } from "./MlbModeClient"

export default function MlbLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mlb-scope min-h-screen py-8">
      <MlbModeClient />
      <div className="mlb-shell mx-auto w-full max-w-[1600px] space-y-8 px-4 md:px-6">
        {children}
      </div>
    </div>
  )
}
