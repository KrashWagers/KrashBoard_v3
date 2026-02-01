"use client"

import { PropLabTab } from "./components/pp-points/PropLabTab"
import { ChartSettings, FilterButtons, PlayerGamelog, SelectedProp } from "./components/goals/shared/types"

interface PPPointsDashboardProps {
  gamelogs: PlayerGamelog[]
  selectedProp: SelectedProp
  lineValue: number
  allGamelogs?: PlayerGamelog[]
  chartSettings?: ChartSettings
  filterButtons?: FilterButtons
  onSettingsOpen?: () => void
  onOpenGamelogs?: () => void
}

export function PPPointsDashboard({
  gamelogs,
  selectedProp,
  lineValue,
  allGamelogs,
  chartSettings,
  filterButtons,
  onSettingsOpen,
  onOpenGamelogs,
}: PPPointsDashboardProps) {
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
