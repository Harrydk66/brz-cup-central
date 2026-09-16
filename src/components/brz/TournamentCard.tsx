import { Link } from "@tanstack/react-router";
import { Clock, Users, Skull, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_META, brl, canRegister, hhmm, modeLabel } from "@/lib/brz/format";
import type { TournamentWithSlots } from "@/lib/brz/types";

export function StatusPill({ status }: { status: TournamentWithSlots["effective_status"] }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.className}`}
    >
      <span aria-hidden>{meta.dot}</span>
      {meta.label}
    </span>
  );
}

export function TournamentCard({ tournament }: { tournament: TournamentWithSlots }) {
  const open = canRegister(tournament.effective_status);
  const full = tournament.effective_status === "full";
  const closed = !open && !full;

  return (
    <article className="brz-stroke brz-grain relative overflow-hidden rounded-lg bg-card p-4">
      <div className="absolute -right-8 top-0 h-24 w-24 rotate-12 brz-blood opacity-10" aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-3xl font-display leading-none">
            <Clock className="h-5 w-5 text-primary" />
            {hhmm(tournament.start_time)}
          </div>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {tournament.name} · {modeLabel(tournament.mode)}
          </p>
        </div>
        <StatusPill status={tournament.effective_status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Vagas</dt>
          <dd className="font-semibold">
            <span className={tournament.available_slots > 0 ? "text-success" : "text-primary"}>
              {tournament.available_slots}
            </span>
            <span className="text-muted-foreground"> / {tournament.max_players}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">Inscrição</dt>
          <dd className="font-semibold">{brl(tournament.entry_fee)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Skull className="h-4 w-4 text-primary" />
          <span className="text-xs">{brl(tournament.kill_prize)} / kill</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Crown className="h-4 w-4 text-gold" />
          <span className="text-xs">{brl(tournament.champion_prize)} campeão</span>
        </div>
      </dl>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full brz-blood"
          style={{
            width: `${Math.min(100, (tournament.taken_slots / tournament.max_players) * 100)}%`,
          }}
        />
      </div>

      <div className="mt-4">
        {open && (
          <Button asChild className="w-full brz-blood font-display text-base tracking-wider">
            <Link to="/inscricao/$tournamentId" params={{ tournamentId: tournament.id }}>
              Inscrever-se
            </Link>
          </Button>
        )}
        {full && (
          <Button asChild variant="outline" className="w-full font-display tracking-wider">
            <Link to="/inscricao/$tournamentId" params={{ tournamentId: tournament.id }}>
              Entrar na lista de espera
            </Link>
          </Button>
        )}
        {closed && (
          <Button disabled variant="secondary" className="w-full font-display tracking-wider">
            <Users className="mr-2 h-4 w-4" /> Indisponível
          </Button>
        )}
      </div>
    </article>
  );
}
