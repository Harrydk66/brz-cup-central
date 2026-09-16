import type { TournamentStatus, TournamentWithSlots, Tournament } from "./types";

export function brl(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value ?? 0),
  );
}

export function hhmm(time: string) {
  return time.slice(0, 5);
}

export function dateBR(date: string) {
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y}`;
}

export function modeLabel(mode: string) {
  return { solo: "Solo", duo: "Duo", squad: "Squad" }[mode] ?? mode;
}

export const STATUS_META: Record<
  TournamentStatus,
  { label: string; dot: string; className: string }
> = {
  scheduled: { label: "EM BREVE", dot: "⚫", className: "bg-muted text-muted-foreground" },
  open: { label: "INSCRIÇÕES ABERTAS", dot: "🟢", className: "bg-success/15 text-success" },
  last_slots: { label: "ÚLTIMAS VAGAS", dot: "🟡", className: "bg-gold/15 text-gold" },
  full: { label: "LOTADO", dot: "🔴", className: "bg-primary/15 text-primary" },
  closed: { label: "ENCERRADO", dot: "⚫", className: "bg-muted text-muted-foreground" },
  finished: { label: "FINALIZADO", dot: "⚫", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "CANCELADO", dot: "⚫", className: "bg-muted text-muted-foreground" },
};

/** Regra de status efetivo — derivada, nunca duplicada nos componentes. */
export function withSlots(t: Tournament, takenSlots: number): TournamentWithSlots {
  const available = Math.max(t.max_players - takenSlots, 0);
  let effective: TournamentStatus = t.status;
  if (t.status === "open" || t.status === "last_slots") {
    if (available === 0) effective = "full";
    else if (available <= Math.max(4, Math.round(t.max_players * 0.15))) effective = "last_slots";
    else effective = "open";
  }
  return {
    ...t,
    taken_slots: takenSlots,
    available_slots: available,
    effective_status: effective,
  };
}

export function canRegister(status: TournamentStatus) {
  return status === "open" || status === "last_slots";
}
