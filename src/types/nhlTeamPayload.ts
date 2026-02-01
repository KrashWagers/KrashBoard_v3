export type TeamPayloadRow = {
  team: string;
  data_version: string; // YYYY-MM-DD
  created_ts_utc: string; // ISO
  payload: TeamPayload; // parsed payload_json
};

export type TeamPayload = {
  team: string;
  gamelogs: TeamGameLog[];
  rankings: TeamRankingSplit[];
};

export type TeamGameLog = {
  season_id: string | null;
  game_id: string | null;
  game_date: string; // YYYY-MM-DD
  opponent: string | null;
  venue: string | null; // "HOME" | "AWAY"
  start_time_utc: string | null;
  fetched_ts_utc: string | null; // ISO

  g: number | null;
  sog: number | null;
  pp_att: number | null;
  pp_g: number | null;
  pp_pct: number | null;
  pim: number | null;
  hits: number | null;
  blocks: number | null;
  giveaways: number | null;
  takeaways: number | null;
  fo_pct: number | null;
  ot_occurred: number | null;
  so_occurred: number | null;

  opp_g: number | null;
  opp_sog: number | null;
  opp_pp_att: number | null;
  opp_pp_g: number | null;
  opp_pp_pct: number | null;
  opp_pk_att: number | null;
  opp_pk_ga: number | null;
  opp_pk_pct: number | null;
  opp_pim: number | null;
  opp_hits: number | null;
  opp_blocks: number | null;
  opp_giveaways: number | null;
  opp_takeaways: number | null;
  opp_fo_pct: number | null;

  shots_missed: number | null;
  shots_blocked: number | null;
  corsi: number | null;
  fenwick: number | null;

  ev5v5_sog: number | null;
  ev5v5_shots_missed: number | null;
  ev5v5_shots_blocked: number | null;
  ev5v5_corsi: number | null;
  ev5v5_fenwick: number | null;
  ev5v5_blocks: number | null;
  ev5v5_g: number | null;
  ev5v5_a: number | null;
  ev5v5_a1: number | null;
  ev5v5_a2: number | null;
  ev5v5_pts: number | null;
  ev5v5_fo_w: number | null;
  ev5v5_fo_l: number | null;
  ev5v5_hits: number | null;
  ev5v5_giveaways: number | null;
  ev5v5_takeaways: number | null;
  ev5v5_pens_committed: number | null;
  ev5v5_pens_drawn: number | null;

  p1_shots: number | null;
  p2_shots: number | null;
  p3_shots: number | null;
  ot_shots: number | null;

  p1_corsi: number | null;
  p2_corsi: number | null;
  p3_corsi: number | null;
  ot_corsi: number | null;

  p1_g: number | null;
  p2_g: number | null;
  p3_g: number | null;
  ot_g: number | null;

  p1_a: number | null;
  p2_a: number | null;
  p3_a: number | null;
  ot_a: number | null;

  p1_pts: number | null;
  p2_pts: number | null;
  p3_pts: number | null;
  ot_pts: number | null;

  g_hd: number | null;
  g_md: number | null;
  g_ld: number | null;

  sog_hd: number | null;
  sog_md: number | null;
  sog_ld: number | null;

  shots_missed_hd: number | null;
  shots_missed_md: number | null;
  shots_missed_ld: number | null;

  shots_blocked_hd: number | null;
  shots_blocked_md: number | null;
  shots_blocked_ld: number | null;

  sat_hd: number | null;
  sat_md: number | null;
  sat_ld: number | null;

  sog_l: number | null;
  sog_r: number | null;
  sog_c: number | null;
  sog_d: number | null;

  g_l: number | null;
  g_r: number | null;
  g_c: number | null;
  g_d: number | null;

  pts_l: number | null;
  pts_r: number | null;
  pts_c: number | null;
  pts_d: number | null;

  opp_shots_missed: number | null;
  opp_shots_blocked: number | null;
  opp_corsi: number | null;
  opp_fenwick: number | null;

  opp_ev5v5_sog: number | null;
  opp_ev5v5_shots_missed: number | null;
  opp_ev5v5_shots_blocked: number | null;
  opp_ev5v5_corsi: number | null;
  opp_ev5v5_fenwick: number | null;
  opp_ev5v5_blocks: number | null;
  opp_ev5v5_g: number | null;
  opp_ev5v5_a: number | null;
  opp_ev5v5_a1: number | null;
  opp_ev5v5_a2: number | null;
  opp_ev5v5_pts: number | null;
  opp_ev5v5_fo_w: number | null;
  opp_ev5v5_fo_l: number | null;
  opp_ev5v5_hits: number | null;
  opp_ev5v5_giveaways: number | null;
  opp_ev5v5_takeaways: number | null;
  opp_ev5v5_pens_committed: number | null;
  opp_ev5v5_pens_drawn: number | null;

  opp_p1_shots: number | null;
  opp_p2_shots: number | null;
  opp_p3_shots: number | null;
  opp_ot_shots: number | null;

  opp_p1_corsi: number | null;
  opp_p2_corsi: number | null;
  opp_p3_corsi: number | null;
  opp_ot_corsi: number | null;

  opp_p1_g: number | null;
  opp_p2_g: number | null;
  opp_p3_g: number | null;
  opp_ot_g: number | null;

  opp_p1_a: number | null;
  opp_p2_a: number | null;
  opp_p3_a: number | null;
  opp_ot_a: number | null;

  opp_p1_pts: number | null;
  opp_p2_pts: number | null;
  opp_p3_pts: number | null;
  opp_ot_pts: number | null;

  opp_g_hd: number | null;
  opp_g_md: number | null;
  opp_g_ld: number | null;

  opp_sog_hd: number | null;
  opp_sog_md: number | null;
  opp_sog_ld: number | null;

  opp_shots_missed_hd: number | null;
  opp_shots_missed_md: number | null;
  opp_shots_missed_ld: number | null;

  opp_shots_blocked_hd: number | null;
  opp_shots_blocked_md: number | null;
  opp_shots_blocked_ld: number | null;

  opp_sat_hd: number | null;
  opp_sat_md: number | null;
  opp_sat_ld: number | null;

  opp_sog_l: number | null;
  opp_sog_r: number | null;
  opp_sog_c: number | null;
  opp_sog_d: number | null;

  opp_g_l: number | null;
  opp_g_r: number | null;
  opp_g_c: number | null;
  opp_g_d: number | null;

  opp_pts_l: number | null;
  opp_pts_r: number | null;
  opp_pts_c: number | null;
  opp_pts_d: number | null;
};

export type TeamRankingSplit = {
  split: "L10" | "L15" | "L30" | "L50" | "HOME" | "AWAY" | "2025-26" | string;
  games: number | null;

  pp_pct: number | null;
  fo_pct: number | null;
  opp_pp_pct: number | null;
  opp_pk_pct: number | null;
  opp_fo_pct: number | null;
  g_pg: number | null;
  sog_pg: number | null;
  opp_g_pg: number | null;
  opp_sog_pg: number | null;
  g_rank: number | null;
  sog_rank: number | null;
  opp_g_rank: number | null;
  opp_sog_rank: number | null;

  [key: string]: any;
};
