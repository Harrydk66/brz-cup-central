import { supabase } from "@/integrations/supabase/client";
import { withSlots } from "./format";
import type {
  Achievement,
  AcquisitionSource,
  PlayerStats,
  Profile,
  RankingKind,
  RankingPeriod,
  RankingPrizes,
  RankingRow,
  Registration,
  RegistrationWithTournament,
  Tournament,
  TournamentWithSlots,
} from "./types";

/**
 * Camada de serviços da BRZ.
 * Toda leitura/escrita passa por aqui — componentes não falam com o backend direto.
 */

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/* ---------------------------------- TORNEIOS --------------------------------- */

export async function listTournaments(): Promise<TournamentWithSlots[]> {
  const [tournaments, counts] = await Promise.all([
    supabase
      .from("tournaments")
      .select("*")
      .order("tournament_date", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase.rpc("tournament_slot_counts"),
  ]);

  const list = unwrap(tournaments) as unknown as Tournament[];
  const slots = (unwrap(counts) ?? []) as { tournament_id: string; taken: number }[];
  const map = new Map(slots.map((s) => [s.tournament_id, s.taken]));
  return list.map((t) => withSlots(normalizeTournament(t), map.get(t.id) ?? 0));
}

export async function listUpcomingTournaments(): Promise<TournamentWithSlots[]> {
  const all = await listTournaments();
  return all.filter((t) => !["finished", "cancelled", "closed"].includes(t.status));
}

export async function getTournament(id: string): Promise<TournamentWithSlots> {
  const all = await listTournaments();
  const found = all.find((t) => t.id === id);
  if (!found) throw new Error("Campeonato não encontrado");
  return found;
}

function normalizeTournament(t: Tournament): Tournament {
  return {
    ...t,
    entry_fee: Number(t.entry_fee),
    kill_prize: Number(t.kill_prize),
    champion_prize: Number(t.champion_prize),
  };
}

export async function createTournament(input: Partial<Tournament>) {
  return unwrap(
    await supabase
      .from("tournaments")
      .insert(input as never)
      .select()
      .single(),
  );
}

export async function updateTournament(id: string, input: Partial<Tournament>) {
  return unwrap(
    await supabase
      .from("tournaments")
      .update(input as never)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function releaseRoom(id: string, roomId: string, roomPassword: string) {
  return updateTournament(id, {
    room_id: roomId,
    room_password: roomPassword,
    room_released: true,
  });
}

/* ---------------------------------- PERFIL ---------------------------------- */

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Profile | null;
}

export async function getProfileByBrzId(brzId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("brz_id", brzId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Profile | null;
}

export async function updateProfile(userId: string, input: Partial<Profile>) {
  return unwrap(
    await supabase
      .from("profiles")
      .update(input as never)
      .eq("id", userId)
      .select()
      .single(),
  );
}

export async function getPlayerStats(userId: string): Promise<PlayerStats | null> {
  const { data, error } = await supabase
    .from("player_stats")
    .select("*")
    .eq("player_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as PlayerStats | null;
}

export async function listAchievements(): Promise<Achievement[]> {
  return (unwrap(await supabase.from("achievements").select("*")) ?? []) as Achievement[];
}

export async function listPlayerAchievements(userId: string): Promise<string[]> {
  const data = unwrap(
    await supabase.from("player_achievements").select("achievement_id").eq("player_id", userId),
  ) as { achievement_id: string }[] | null;
  return (data ?? []).map((r) => r.achievement_id);
}

/* -------------------------------- INSCRIÇÕES -------------------------------- */

export interface RegistrationInput {
  tournament_id: string;
  player_id: string;
  nick: string;
  free_fire_id: string;
  whatsapp: string;
  utm_source?: string | null;
}

/**
 * Cria a inscrição em estado RESERVADO + pagamento PENDENTE.
 * A vaga só é considerada garantida quando o backend confirma o Pix.
 */
export async function createRegistration(input: RegistrationInput): Promise<Registration> {
  const existing = await supabase
    .from("registrations")
    .select("*")
    .eq("tournament_id", input.tournament_id)
    .eq("player_id", input.player_id)
    .maybeSingle();
  if (existing.data) return existing.data as unknown as Registration;

  return unwrap(
    await supabase
      .from("registrations")
      .insert(input as never)
      .select()
      .single(),
  ) as unknown as Registration;
}

export async function getRegistration(id: string): Promise<RegistrationWithTournament | null> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, tournament:tournaments(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as RegistrationWithTournament | null;
}

export async function listMyRegistrations(
  playerId: string,
): Promise<RegistrationWithTournament[]> {
  const data = unwrap(
    await supabase
      .from("registrations")
      .select("*, tournament:tournaments(*)")
      .eq("player_id", playerId)
      .order("created_at", { ascending: false }),
  );
  return (data ?? []) as unknown as RegistrationWithTournament[];
}

export async function listTournamentRegistrations(tournamentId: string) {
  const data = unwrap(
    await supabase
      .from("registrations")
      .select("*, profile:profiles(brz_id, nick)")
      .eq("tournament_id", tournamentId)
      .order("created_at", { ascending: true }),
  );
  return (data ?? []) as unknown as (Registration & {
    profile: { brz_id: string; nick: string } | null;
  })[];
}

export async function setRegistrationPayment(
  id: string,
  payment_status: Registration["payment_status"],
) {
  return unwrap(
    await supabase
      .from("registrations")
      .update({
        payment_status,
        slot_status: payment_status === "confirmed" ? "guaranteed" : "reserved",
      } as never)
      .eq("id", id)
      .select()
      .single(),
  );
}

export async function joinWaitlist(input: {
  tournament_id: string;
  player_id: string;
  nick: string;
  whatsapp: string;
}) {
  const { count } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .eq("tournament_id", input.tournament_id);
  return unwrap(
    await supabase
      .from("waitlist")
      .insert({ ...input, queue_position: (count ?? 0) + 1 } as never)
      .select()
      .single(),
  );
}

/* --------------------------------- RANKINGS -------------------------------- */

export async function listRanking(
  kind: RankingKind,
  period: RankingPeriod,
): Promise<RankingRow[]> {
  const seasonScoped = period !== "all_time";
  const orderCol = kind === "kills" ? "kills" : "booyahs";
  const prefix = seasonScoped ? "season_" : "";

  const data = unwrap(
    await supabase
      .from("player_stats")
      .select(
        "player_id, kills, booyahs, matches, season_kills, season_booyahs, season_matches, profiles!inner(brz_id, nick)",
      )
      .order(`${prefix}${orderCol}`, { ascending: false })
      .limit(100),
  ) as unknown as (PlayerStats & { profiles: { brz_id: string; nick: string } })[] | null;

  return (data ?? []).map((row) => ({
    player_id: row.player_id,
    brz_id: row.profiles.brz_id,
    nick: row.profiles.nick,
    kills: seasonScoped ? row.season_kills : row.kills,
    booyahs: seasonScoped ? row.season_booyahs : row.booyahs,
    matches: seasonScoped ? row.season_matches : row.matches,
  }));
}

export async function getRankingPrizes(): Promise<RankingPrizes> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "ranking_prizes")
    .maybeSingle();
  const fallback: RankingPrizes = {
    weekly_mvp: 50,
    weekly_booyah_king: 50,
    monthly_mvp: 100,
    monthly_booyah_king: 100,
  };
  return { ...fallback, ...((data?.value as Partial<RankingPrizes>) ?? {}) };
}

export async function getSetting<T>(key: string): Promise<T | null> {
  const { data } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  return (data?.value as T) ?? null;
}

/* -------------------------------- ANALYTICS ------------------------------- */

export function readUtmSource(): AcquisitionSource {
  if (typeof window === "undefined") return "organic";
  const stored = window.localStorage.getItem("brz_source");
  const param = new URLSearchParams(window.location.search).get("utm_source");
  const value = (param ?? stored ?? "organic") as AcquisitionSource;
  if (param) window.localStorage.setItem("brz_source", param);
  return value;
}

export async function trackEvent(event_type: string, player_id?: string) {
  await supabase
    .from("acquisition_events")
    .insert({ event_type, source: readUtmSource(), player_id: player_id ?? null } as never);
}

/* ---------------------------------- ADMIN --------------------------------- */

export async function isAdmin(userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return Boolean(data);
}

export async function adminDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [regsToday, pending, confirmed, tournaments, players] = await Promise.all([
    supabase
      .from("registrations")
      .select("id, payment_status, created_at, tournament_id")
      .gte("created_at", `${today}T00:00:00Z`),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pending"),
    supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "confirmed"),
    listTournaments(),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const todayRows = (regsToday.data ?? []) as { payment_status: string; tournament_id: string }[];
  const activeTournaments = tournaments.filter((t) =>
    ["open", "last_slots", "full", "scheduled"].includes(t.status),
  );
  const revenue = todayRows
    .filter((r) => r.payment_status === "confirmed")
    .reduce((sum, r) => {
      const t = tournaments.find((x) => x.id === r.tournament_id);
      return sum + Number(t?.entry_fee ?? 0);
    }, 0);

  return {
    registrationsToday: todayRows.length,
    revenueToday: revenue,
    pendingPayments: pending.count ?? 0,
    confirmedPayments: confirmed.count ?? 0,
    activeTournaments: activeTournaments.length,
    takenSlots: activeTournaments.reduce((s, t) => s + t.taken_slots, 0),
    totalPlayers: players.count ?? 0,
  };
}
