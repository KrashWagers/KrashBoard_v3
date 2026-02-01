"use client"

import { PropLabTab } from "./components/points/PropLabTab"
import { ChartSettings, FilterButtons, PlayerGamelog, SelectedProp } from "./components/goals/shared/types"

interface PointsDashboardProps {
  gamelogs: PlayerGamelog[]
  selectedProp: SelectedProp
  lineValue: number
  allGamelogs?: PlayerGamelog[]
  chartSettings?: ChartSettings
  filterButtons?: FilterButtons
  onSettingsOpen?: () => void
  onOpenGamelogs?: () => void
}

export function PointsDashboard({
  gamelogs,
  selectedProp,
  lineValue,
  allGamelogs,
  chartSettings,
  filterButtons,
  onSettingsOpen,
  onOpenGamelogs,
}: PointsDashboardProps) {
  return (
    <PropLabTab
      gamelogs={gamelogs}
      selectedProp={selectedProp}
      lineValue={lineValue}
      allGamelogs={allGamelogs}
      chartSettings={chartSettings || {}}
      filterButtons={filterButtons}
      onSettingsOpen={onSettingsOpen}
      onOpenGamelogs={onOpenGamelogs}
    />
  )
}

