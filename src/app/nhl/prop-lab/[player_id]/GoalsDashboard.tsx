"use client"
import { PropLabTab } from './components/goals/PropLabTab'
import { GamelogsTab } from './components/goals/GamelogsTab'
import { MarketTab } from './components/goals/MarketTab'
import { GoalsDashboardProps } from './components/goals/shared/types'

export function GoalsDashboard(props: GoalsDashboardProps) {
  const activeTab = props.activeTab ?? 'prop-lab'

  return (
    <div className="space-y-2">
      {/* Tab Content */}
      {activeTab === 'prop-lab' && (
        <PropLabTab
          gamelogs={props.gamelogs}
          selectedProp={props.selectedProp}
          lineValue={props.lineValue}
          allGamelogs={props.allGamelogs}
          chartSettings={props.chartSettings || {}}
          filterButtons={props.filterButtons}
          onSettingsOpen={props.onSettingsOpen}
          onOpenGamelogs={props.onOpenGamelogs}
          playerId={props.playerId}
          timeFilter={props.timeFilter}
          teamPayload={props.teamPayload}
          opponentPayload={props.opponentPayload}
          opponentTeam={props.opponentTeam}
        />
      )}
      {activeTab === 'gamelogs' && (
        <GamelogsTab
          gamelogs={props.gamelogs}
          allGamelogs={props.allGamelogs}
        />
      )}
      {activeTab === 'market' && (
        <MarketTab
          allProps={props.allProps}
          selectedProp={props.selectedProp}
        />
      )}
    </div>
  )
}

// Export GamelogsTable for backward compatibility (if still used elsewhere)
export { GamelogsTab as GamelogsTable } from './components/goals/GamelogsTab'
