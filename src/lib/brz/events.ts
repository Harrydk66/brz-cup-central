/**
 * Contrato de eventos da operação BRZ (WhatsApp / automações externas).
 * A plataforma apenas EMITE os eventos; o bot e as automações vivem no backend.
 */

export type BrzEvent =
  | "registration.created"
  | "payment.pending"
  | "payment.confirmed"
  | "player.confirmed"
  | "tournament.full"
  | "room.released"
  | "result.processed"
  | "ranking.updated"
  | "achievement.unlocked";

const API_URL = import.meta.env["VITE_BRZ_API_URL"] as string | undefined;

export async function emitBrzEvent(event: BrzEvent, payload: Record<string, unknown>) {
  if (!API_URL) {
    if (import.meta.env.DEV) console.info(`[brz-event:${event}]`, payload);
    return;
  }
  try {
    await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload }),
    });
  } catch {
    // Automação externa é best-effort: nunca bloqueia o fluxo do jogador.
  }
}
