import PitchMatrixClient from "@/components/mlb/pitch-matrix/PitchMatrixClient"

export default function PitchMatrixPage() {
  return (
    <div className="h-[calc(100vh-var(--app-header-h))] min-h-0 w-full flex flex-col overflow-hidden">
      <PitchMatrixClient />
    </div>
  )
}
