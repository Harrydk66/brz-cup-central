/**
 * Modelos de domínio da BRZ.CUP.
 * Espelham o schema do backend e servem de contrato para a camada de serviços.
 */

export type TournamentKind = "daily" | "cup" | "league";
export type TournamentMode = "solo" | "duo" | "squad";
export type TournamentStatus =
  | "scheduled"
  | "open"
  | "last_slots"
  | "full"
  | "closed"
  | "finished"
  | "cancelled";
export type PaymentStatus = "pending" | "confirmed" | "expired" | "failed" | "refunded";
export type SlotStatus = "reserved" | "guaranteed" | "cancelled";
export type RankingKind = "kills" | "booyahs";
export type RankingPeriod = "week" | "month" | "season" | "all_time";

export interface Tournament {
  id: string;
  name: string;
  kind: TournamentKind;
  mode: TournamentMode;
  tournament_date: string;
  start_time: string;
  max_players: number;
  entry_fee: number;
  kill_prize: number;
  champion_prize: number;
  runner_up_reward: string | null;
  status: TournamentStatus;
  room_id: string | null;
  room_password: string | null;
  room_released: boolean;
  whatsapp_group_url: string | null;
}

export interface TournamentWithSlots extends Tournament {
  taken_slots: number;
  available_slots: number;
  /** Status efetivo, já considerando lotação. */
  effective_status: TournamentStatus;
}

export interface Profile {
  id: string;
  brz_id: string;
  nick: string;
  free_fire_id: string | null;
  whatsapp: string | null;
  email: string | null;
  utm_source: string | null;
}

export interface PlayerStats {
  player_id: string;
  matches: number;
  kills: number;
  booyahs: number;
  top2: number;
  mvps: number;
  earnings: number;
  season_matches: number;
  season_kills: number;
  season_booyahs: number;
  season_top2: number;
  season_mvps: number;
  season_earnings: number;
}

export interface Registration {
  id: string;
  tournament_id: string;
  player_id: string;
  nick: string;
  free_fire_id: string;
  whatsapp: string;
  slot_number: number | null;
  slot_status: SlotStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface RegistrationWithTournament extends Registration {
  tournament: Tournament;
}

export interface PixCharge {
  payment_id: string;
  amount: number;
  status: PaymentStatus;
  qr_code_image: string | null;
  copy_paste: string | null;
  expires_at: string | null;
}

export interface RankingRow {
  player_id: string;
  brz_id: string;
  nick: string;
  kills: number;
  booyahs: number;
  matches: number;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface RankingPrizes {
  weekly_mvp: number;
  weekly_booyah_king: number;
  monthly_mvp: number;
  monthly_booyah_king: number;
}

export type AcquisitionSource =
  | "instagram_brz"
  | "instagram_68k"
  | "tiktok"
  | "meta_ads"
  | "influencer"
  | "referral"
  | "organic";
