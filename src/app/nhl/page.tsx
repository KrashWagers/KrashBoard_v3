import { Suspense } from 'react'
import NHLHomeClient from './NHLHomeClient'

export default function NHLPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading NHL home...</div>}>
      <NHLHomeClient />
    </Suspense>
  )
}
