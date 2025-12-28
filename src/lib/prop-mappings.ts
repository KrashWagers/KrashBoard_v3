// Prop Name to Gamelogs Field Mappings
// This file maps prop names from the Player_Props API to corresponding fields in Player_Gamelogs_v3

export interface PropMapping {
  propName: string
  gamelogsField: string
  displayName: string
  category: 'passing' | 'receiving' | 'rushing' | 'kicking' | 'defense'
  alternateCharts: string[] // Supporting stats to show in alternate charts
}

export const PROP_MAPPINGS: PropMapping[] = [
  // TOUCHDOWNS
  {
    propName: 'Touchdown',
    gamelogsField: 'td_total',
    displayName: 'Total Touchdowns',
    category: 'rushing',
    alternateCharts: ['carries', 'rushing_yards', 'rz20_carries', 'rz10_carries', 'gl5_carries']
  },
  {
    propName: 'First Touchdown',
    gamelogsField: 'td_total', // Will need special logic for first TD
    displayName: 'First Touchdown',
    category: 'rushing',
    alternateCharts: ['carries', 'rushing_yards', 'rz20_carries', 'rz10_carries']
  },
  {
    propName: 'Last Touchdown',
    gamelogsField: 'td_total', // Will need special logic for last TD
    displayName: 'Last Touchdown',
    category: 'rushing',
    alternateCharts: ['carries', 'rushing_yards', 'rz20_carries', 'rz10_carries']
  },

  // PASSING
  {
    propName: 'Passing Yds',
    gamelogsField: 'passing_yards',
    displayName: 'Passing Yards',
    category: 'passing',
    alternateCharts: ['attempts', 'completions', 'pass_comp_pct', 'pass_ypa', 'passing_first_downs']
  },
  {
    propName: 'Passing Att',
    gamelogsField: 'attempts',
    displayName: 'Passing Attempts',
    category: 'passing',
    alternateCharts: ['completions', 'pass_comp_pct', 'passing_yards', 'pass_ypa', 'passing_first_downs']
  },
  {
    propName: 'Passing Cmp',
    gamelogsField: 'completions',
    displayName: 'Passing Completions',
    category: 'passing',
    alternateCharts: ['attempts', 'pass_comp_pct', 'passing_yards', 'pass_ypa', 'passing_first_downs']
  },
  {
    propName: 'Passing TDs',
    gamelogsField: 'passing_tds',
    displayName: 'Passing Touchdowns',
    category: 'passing',
    alternateCharts: ['attempts', 'completions', 'passing_yards', 'rz20_att', 'rz10_att']
  },
  {
    propName: 'Passing Int',
    gamelogsField: 'interceptions',
    displayName: 'Interceptions',
    category: 'passing',
    alternateCharts: ['attempts', 'completions', 'pass_comp_pct', 'passing_yards']
  },
  {
    propName: 'Passing Yds Q1',
    gamelogsField: 'passing_yards', // Will need quarter-specific logic
    displayName: 'Passing Yards Q1',
    category: 'passing',
    alternateCharts: ['attempts', 'completions', 'pass_comp_pct']
  },
  {
    propName: 'Longest Pass',
    gamelogsField: 'longest_pass',
    displayName: 'Longest Pass',
    category: 'passing',
    alternateCharts: ['attempts', 'completions', 'passing_yards', 'pass_ypa']
  },

  // RECEIVING
  {
    propName: 'Receptions',
    gamelogsField: 'receptions',
    displayName: 'Receptions',
    category: 'receiving',
    alternateCharts: ['targets', 'receiving_yards', 'receiving_tds', 'receiver_catch_rate', 'receiver_yards_per_target']
  },
  {
    propName: 'Receiving Yds',
    gamelogsField: 'receiving_yards',
    displayName: 'Receiving Yards',
    category: 'receiving',
    alternateCharts: ['targets', 'receptions', 'receiving_tds', 'receiver_yards_per_reception', 'receiver_yards_per_target']
  },
  {
    propName: 'Longest Reception',
    gamelogsField: 'longest_rec',
    displayName: 'Longest Reception',
    category: 'receiving',
    alternateCharts: ['targets', 'receptions', 'receiving_yards', 'receiver_yards_per_reception']
  },

  // RUSHING
  {
    propName: 'Rushing Att',
    gamelogsField: 'carries',
    displayName: 'Rushing Attempts',
    category: 'rushing',
    alternateCharts: ['rushing_yards', 'rushing_tds', 'rusher_yards_per_carry', 'rusher_success_rate', 'rusher_first_downs']
  },
  {
    propName: 'Rushing Yds',
    gamelogsField: 'rushing_yards',
    displayName: 'Rushing Yards',
    category: 'rushing',
    alternateCharts: ['carries', 'rushing_tds', 'rusher_yards_per_carry', 'rusher_success_rate', 'rusher_first_downs']
  },
  {
    propName: 'Longest Rush',
    gamelogsField: 'longest_rush',
    displayName: 'Longest Rush',
    category: 'rushing',
    alternateCharts: ['carries', 'rushing_yards', 'rusher_yards_per_carry', 'rusher_explosive20_plus']
  },
  {
    propName: 'Rush + Rec Yds',
    gamelogsField: 'rushing_yards + receiving_yards', // Will need calculation
    displayName: 'Rush + Rec Yards',
    category: 'rushing',
    alternateCharts: ['carries', 'targets', 'rushing_yards', 'receiving_yards']
  },

  // KICKING
  {
    propName: 'PATs',
    gamelogsField: 'kicking_points', // May need special handling
    displayName: 'PATs',
    category: 'kicking',
    alternateCharts: ['field_goals', 'kicking_points']
  },
  {
    propName: 'Kicking Points',
    gamelogsField: 'kicking_points',
    displayName: 'Kicking Points',
    category: 'kicking',
    alternateCharts: ['field_goals', 'pats']
  },
  {
    propName: 'Field Goals',
    gamelogsField: 'field_goals', // May need special handling
    displayName: 'Field Goals',
    category: 'kicking',
    alternateCharts: ['kicking_points', 'pats']
  }
]

// Helper function to get mapping by prop name
export const getPropMapping = (propName: string): PropMapping | undefined => {
  return PROP_MAPPINGS.find(mapping => mapping.propName === propName)
}

// Helper function to get alternate chart fields for a prop
export const getAlternateChartFields = (propName: string): string[] => {
  const mapping = getPropMapping(propName)
  return mapping?.alternateCharts || []
}

// Helper function to get the main stat field for a prop
export const getMainStatField = (propName: string): string | undefined => {
  const mapping = getPropMapping(propName)
  return mapping?.gamelogsField
}
