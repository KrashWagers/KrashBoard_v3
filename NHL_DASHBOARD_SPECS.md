# NHL Prop Lab Dashboard Specifications

## BigQuery Tables

### Player Gamelogs (Primary Data Source)
**Table:** `nhl25-473523.gold.player_gamelogs_all_vw`

**Key Fields:**
- season_id, game_id, game_date
- home_team_id, away_team_id, player_id, player_name
- venue, player_team_abbrev
- shots_on_goal, goals, assists, points
- corsi, fenwick, shifts, toi_seconds
- pp_* (power play stats)
- 5v5_* (5v5 stats)
- P1_*, P2_*, P3_*, OT_* (period stats)
- goals_HD, goals_MD, goals_LD
- sog_HD, sog_MD, sog_LD
- sat_HD, sat_MD, sat_LD (shot attempts by danger)
- team_* (team stats for context)

### Player Props (Odds & Hit Rates)
**Table:** `nhl25-473523.betting_odds.Player_Props_w_HR`

**Key Fields:**
- Prop_UID, Event_ID, Player
- Side, Line, Prop
- Odds, Implied %, Bookmaker
- HR_L5, HR_L10, HR_L30 (hit rates)
- N_L5, N_L10, N_L30 (sample sizes)
- Avg_Stat, Max_Stat, Min_Stat
- Streak_Current

---

## Prop-Specific Dashboard Layouts

### Goals
1. **Main Bar Chart:** goals
2. **Secondary Bar Chart:** shots_on_goal (toggle to rolling average line chart)
3. **Third Bar Chart:** sog_HD (toggle to rolling average line chart)
4. **Shift Bar Chart:** shifts
5. **Stacked Bar Chart:** pp_goals / 5v5_goals
6. **Stacked Bar Chart:** sat_HD / sat_MD / sat_LD

### Shots on Goal
1. **Main Bar Chart:** shots_on_goal
2. **Secondary Bar Chart:** corsi (toggle to rolling average line chart)
3. **Shift Bar Chart:** shifts
4. **Stacked Bar Chart:** pp_shots_on_goal / 5v5_shots_on_goal
5. **Stacked Bar Chart:** sat_HD / sat_MD / sat_LD

### Assists
1. **Main Bar Chart:** assists
2. **Secondary Bar Chart:** team_goals (toggle to rolling average line chart)
3. **Shift Bar Chart:** shifts
4. **Stacked Bar Chart:** assists / points
5. **Stacked Bar Chart:** assists / team_assists

### Points
1. **Main Bar Chart:** points
2. **Secondary Bar Chart:** team_goals (toggle to rolling average line chart)
3. **Third Bar Chart:** 5v5_points (toggle to rolling average line chart)
4. **Shift Bar Chart:** shifts
5. **Stacked Bar Chart:** 5v5_points / pp_points
6. **Stacked Bar Chart:** points / team_points

---

## Design Guidelines

### Layout
- Clean, modern design similar to NFLelo
- Compact spacing, not excessive padding
- Professional typography hierarchy
- Clear card-based layout

### Colors & Theme
- Use existing Tailwind dark theme
- Card backgrounds: bg-[#171717] with border-gray-700
- Balanced padding and spacing
- Clean, readable fonts

### Performance
- Cache gamelogs for 24 hours
- Cache props data for 30 minutes
- Efficient data transformations
- Optimized chart rendering
