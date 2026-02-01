import { Suspense } from 'react'
import ScoresClient from './ScoresClient'

export default function ScoresPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading scores...</div>}>
        <ScoresClient />
      </Suspense>
    </div>
  )
}
