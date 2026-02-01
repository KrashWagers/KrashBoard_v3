## Payload Architecture Upgrade

This document defines daily payload tables and example build SQL for the NHL stack in this repo.
Current implementation uses `nhl25-473523.webapp.player_payload` with `payload_json` stored as STRING.

### 1) `webapp.player_payload` (current)

**Schema**
```sql
CREATE TABLE IF NOT EXISTS `nhl25-473523.webapp.player_payload` (
  player_id INT64 NOT NULL,
  data_version DATE NOT NULL,
  created_ts_utc TIMESTAMP NOT NULL,
  payload_json STRING NOT NULL
);
```

**Daily build (example)**
```sql
DECLARE dv DATE DEFAULT CURRENT_DATE();

CREATE OR REPLACE TABLE `nhl25-473523.webapp.player_payload` AS
WITH players AS (
  SELECT DISTINCT player_id, player_name
  FROM `nhl25-473523.gold.player_gamelogs_all_vw`
  WHERE player_id IS NOT NULL
),
gamelogs AS (
  SELECT
    player_id,
    ARRAY_AGG(STRUCT(
      game_id,
      game_date,
      season_id,
      away_abbrev,
      home_abbrev,
      venue,
      days_rest,
      game_time_bucket,
      day_of_week,
      goals,
      assists,
      points,
      shots_on_goal,
      corsi,
      shots_missed,
      shots_blocked_by_defense,
      shifts,
      team_goals,
      team_assists,
      team_points,
      pp_goals,
      `5v5_goals`,
      pp_assists,
      pp_points,
      `5v5_points`,
      pp_shots_on_goal,
      `5v5_shots_on_goal`,
      sog_HD,
      sat_HD,
      sat_MD,
      sat_LD,
      goals_HD,
      goals_MD,
      goals_LD,
      toi_seconds,
      ev_5v5_mmss,
      pp_mmss,
      pk_mmss,
      ev_4v4_mmss,
      ev_3v3_mmss,
      player_team_abbrev,
      player_name,
      `Headshot URL`
    ) ORDER BY game_date DESC) AS gamelogs
  FROM `nhl25-473523.gold.player_gamelogs_all_vw`
  GROUP BY player_id
),
props AS (
  SELECT
    p.player_id,
    ARRAY_AGG(STRUCT(
      Event_ID AS event_id,
      Player AS kw_player_name,
      Side AS O_U,
      Line AS line,
      Prop AS prop_name,
      Home AS home_team,
      Away AS away_team,
      HomeAbbr AS home_abbr,
      AwayAbbr AS away_abbr,
      Matchup AS matchup,
      Start_Time_est AS start_time_est,
      Opp AS opp,
      `Best Odds Book` AS bookmaker,
      `Best Odds` AS price_american,
      `Best IW%` / 100 AS implied_win_pct,
      fetch_ts_utc,
      HR_2425 AS hit_2025,
      HR_2526 AS hit_2024,
      HR_L30 AS hit_L30,
      HR_L10 AS hit_L10,
      HR_L5 AS hit_L5,
      N_2425 AS gp_2024,
      N_2526 AS gp_2025,
      N_L30 AS n_L30,
      N_L10 AS n_L10,
      N_L5 AS n_L5,
      Streak_Current AS streak,
      player_headshot AS espn_headshot
    )) AS props
  FROM players p
  LEFT JOIN `nhl25-473523.betting_odds.Player_Props_w_HR_v3` r
    ON r.Player = p.player_name
  GROUP BY p.player_id
),
player_vs_opp AS (
  SELECT
    player_id,
    ARRAY_AGG(STRUCT(
      opponent_abbr,
      gp_vs_opp,
      goals_vs_opp,
      assists_vs_opp,
      points_vs_opp,
      shots_on_goal_vs_opp
    ) ORDER BY opponent_abbr) AS player_vs_opp
  FROM `nhl25-473523.marts.Player_vs_Opp`
  GROUP BY player_id
),
play_by_play AS (
  SELECT
    p.player_id,
    ARRAY_AGG(STRUCT(
      Game_ID,
      Game_Date,
      Player_Name,
      Player_Team,
      Opponent,
      Event_Type,
      Shot_Type,
      Is_Goal,
      Is_SOG,
      Is_Missed,
      Is_Blocked,
      Std_X AS x,
      Std_Y AS y,
      Sec_In_Game
    ) ORDER BY Game_Date DESC, Sec_In_Game) AS play_by_play
  FROM players p
  JOIN `nhl25-473523.silver.v_shots_standardized` s
    ON s.Player_Name = p.player_name
  GROUP BY p.player_id
)
SELECT
  p.player_id,
  dv AS data_version,
  TO_JSON_STRING(STRUCT(
    g.gamelogs AS gamelogs,
    r.props AS props,
    v.player_vs_opp AS player_vs_opp,
    b.play_by_play AS play_by_play,
    ARRAY(SELECT DISTINCT prop_name FROM UNNEST(r.props)) AS available_props
  )) AS payload_json
FROM players p
LEFT JOIN gamelogs g ON g.player_id = p.player_id
LEFT JOIN props r ON r.player_id = p.player_id
LEFT JOIN player_vs_opp v ON v.player_id = p.player_id
LEFT JOIN play_by_play b ON b.player_id = p.player_id;
```

### 2) `serving_team_page_payload` (recommended)

**Schema**
```sql
CREATE TABLE IF NOT EXISTS `nhl25-473523.webapp.serving_team_page_payload` (
  team_id STRING NOT NULL,
  data_version DATE NOT NULL,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
);
```

**Daily build (example)**
```sql
DECLARE dv DATE DEFAULT CURRENT_DATE();

CREATE OR REPLACE TABLE `nhl25-473523.webapp.serving_team_page_payload` AS
WITH teams AS (
  SELECT DISTINCT team AS team_id
  FROM `nhl25-473523.gold.team_gamelogs_all`
  WHERE team IS NOT NULL
),
team_gamelogs AS (
  SELECT
    team AS team_id,
    ARRAY_AGG(STRUCT(
      game_id,
      game_date,
      opponent,
      venue,
      GF,
      GA,
      SOGF,
      SOGA,
      PP_Att,
      PK_Att,
      PP_Pct,
      PK_Pct,
      corsi_for,
      fenwick_for,
      ev5v5_shots_on_goal_for
    ) ORDER BY game_date DESC) AS gamelogs
  FROM `nhl25-473523.gold.team_gamelogs_all`
  GROUP BY team
)
SELECT
  t.team_id,
  dv AS data_version,
  TO_JSON(STRUCT(
    g.gamelogs AS gamelogs
  )) AS payload_json
FROM teams t
LEFT JOIN team_gamelogs g ON g.team_id = t.team_id;
```

### 3) `serving_game_page_payload` (recommended)

**Schema**
```sql
CREATE TABLE IF NOT EXISTS `nhl25-473523.webapp.serving_game_page_payload` (
  game_id STRING NOT NULL,
  data_version DATE NOT NULL,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP()
);
```

**Daily build (example)**
```sql
DECLARE dv DATE DEFAULT CURRENT_DATE();

CREATE OR REPLACE TABLE `nhl25-473523.webapp.serving_game_page_payload` AS
WITH games AS (
  SELECT DISTINCT game_id
  FROM `nhl25-473523.gold.team_gamelogs_all`
  WHERE game_id IS NOT NULL
),
team_rows AS (
  SELECT
    game_id,
    ARRAY_AGG(STRUCT(
      team,
      opponent,
      venue,
      GF,
      GA,
      SOGF,
      SOGA,
      PP_Att,
      PK_Att,
      PP_Pct,
      PK_Pct
    )) AS teams
  FROM `nhl25-473523.gold.team_gamelogs_all`
  GROUP BY game_id
),
events AS (
  SELECT
    Game_ID AS game_id,
    ARRAY_AGG(STRUCT(
      Game_Date,
      Player_Name,
      Player_Team,
      Opponent,
      Event_Type,
      Shot_Type,
      Is_Goal,
      Is_SOG,
      Is_Missed,
      Is_Blocked,
      Std_X AS x,
      Std_Y AS y,
      Sec_In_Game
    ) ORDER BY Sec_In_Game) AS play_by_play
  FROM `nhl25-473523.silver.v_shots_standardized`
  GROUP BY Game_ID
)
SELECT
  g.game_id,
  dv AS data_version,
  TO_JSON(STRUCT(
    t.teams AS teams,
    e.play_by_play AS play_by_play
  )) AS payload_json
FROM games g
LEFT JOIN team_rows t ON t.game_id = g.game_id
LEFT JOIN events e ON e.game_id = g.game_id;
```
