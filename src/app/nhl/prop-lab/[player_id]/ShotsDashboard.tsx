"use client"

import { PropLabTab } from "./components/shots/PropLabTab"
import { ChartSettings, FilterButtons, PlayerGamelog, SelectedProp } from "./components/goals/shared/types"

interface ShotsDashboardProps {
  gamelogs: PlayerGamelog[]
  selectedProp: SelectedProp
  lineValue: number
  allGamelogs?: PlayerGamelog[]
  chartSettings?: ChartSettings
  filterButtons?: FilterButtons
  onSettingsOpen?: () => void
  onOpenGamelogs?: () => void
}

export function ShotsDashboard({
  gamelogs,
  selectedProp,
  lineValue,
  allGamelogs,
  chartSettings,
  filterButtons,
  onSettingsOpen,
  onOpenGamelogs,
}: ShotsDashboardProps) {
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

