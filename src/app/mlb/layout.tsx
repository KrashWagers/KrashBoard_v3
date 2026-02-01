import * as React from "react"
import { MlbNavbar } from "@/components/mlb/mlb-navbar"

export default function MlbLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <MlbNavbar />
        {children}
      </div>
    </div>
  )
}
