import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/brz/AppShell";
import { CardSkeletonList, EmptyState, ErrorState, RowSkeletonList } from "@/components/brz/states";
import { useAuth } from "@/hooks/useAuth";
import {
  adminDashboard,
  createTournament,
  listTournamentRegistrations,
  listTournaments,
  releaseRoom,
  setRegistrationPayment,
  updateTournament,
} from "@/lib/brz/api";
import { emitBrzEvent } from "@/lib/brz/events";
import { brl, dateBR, hhmm, modeLabel, STATUS_META } from "@/lib/brz/format";
import type { TournamentMode, TournamentStatus } from "@/lib/brz/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "BRZ ADMIN — painel de operação" },
      {
        name: "description",
        content:
          "Painel interno da BRZ.CUP: inscrições, receita, participantes, sala e status de pagamento.",
      },
      { property: "og:title", content: "BRZ ADMIN" },
      { property: "og:description", content: "Painel de operação dos Dailys da BRZ.CUP." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "campeonatos" | "participantes" | "resultados" | "espera" | "aquisicao";

function AdminPage() {
  const { user, admin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (loading) {
    return (
      <AppShell>
        <CardSkeletonList count={2} />
      </AppShell>
    );
  }

  if (!user || !admin) {
    return (
      <AppShell>
        <EmptyState
          icon={<Shield className="h-8 w-8" />}
          title="Área restrita"
          description="Esta área é exclusiva da equipe BRZ."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/">Voltar para o início</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gold">BRZ ADMIN</p>
        <h1 className="font-display text-3xl uppercase tracking-wide">Painel de operação</h1>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            { v: "dashboard", label: "Dashboard" },
            { v: "campeonatos", label: "Campeonatos" },
            { v: "participantes", label: "Participantes" },
            { v: "resultados", label: "Resultados" },
            { v: "espera", label: "Lista de espera" },
            { v: "aquisicao", label: "Aquisição" },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setTab(o.v)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
              tab === o.v
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab />}
      {tab === "campeonatos" && <TournamentsTab />}
      {tab === "participantes" && <ParticipantsTab />}
      {tab === "resultados" && <ResultsTab />}
      {tab === "espera" && <WaitlistTab />}
      {tab === "aquisicao" && <AcquisitionTab />}
    </AppShell>
  );
}

function DashboardTab() {
  const query = useQuery({ queryKey: ["admin-dashboard"], queryFn: adminDashboard });

  if (query.isPending) return <RowSkeletonList count={4} />;
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  const d = query.data!;
  const cards = [
    { label: "Inscrições hoje", value: d.registrationsToday },
    { label: "Receita hoje", value: brl(d.revenueToday), accent: "success" as const },
    { label: "Pagamentos aguardando", value: d.pendingPayments, accent: "gold" as const },
    { label: "Pagamentos confirmados", value: d.confirmedPayments, accent: "success" as const },
    { label: "Dailys ativos", value: d.activeTournaments },
    { label: "Vagas ocupadas", value: d.takenSlots },
    { label: "Jogadores", value: d.totalPlayers },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="brz-stroke rounded-lg bg-card p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {c.label}
          </p>
          <p
            className={cn(
              "font-display text-2xl",
              c.accent === "gold" && "brz-gold-text",
              c.accent === "success" && "text-success",
            )}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}

const STATUS_OPTIONS: TournamentStatus[] = [
  "scheduled",
  "open",
  "closed",
  "finished",
  "cancelled",
];

function TournamentsTab() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["tournaments"], queryFn: listTournaments });
  const [form, setForm] = useState({
    name: "BRZ DAILY",
    tournament_date: new Date().toISOString().slice(0, 10),
    start_time: "20:00",
    mode: "solo" as TournamentMode,
    max_players: 48,
    entry_fee: 5,
    kill_prize: 2,
    champion_prize: 40,
    runner_up_reward: "Vaga no próximo Daily",
  });
  const [room, setRoom] = useState<Record<string, { id: string; password: string }>>({});

  const create = useMutation({
    mutationFn: () => createTournament({ ...form, status: "open" }),
    onSuccess: () => {
      toast.success("Campeonato criado");
      void qc.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TournamentStatus }) =>
      updateTournament(id, { status }),
    onSuccess: () => {
      toast.success("Status atualizado");
      void qc.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const release = useMutation({
    mutationFn: ({ id, roomId, password }: { id: string; roomId: string; password: string }) =>
      releaseRoom(id, roomId, password),
    onSuccess: (_data, vars) => {
      toast.success("Sala liberada para os participantes");
      void emitBrzEvent("room.released", { tournament_id: vars.id });
      void qc.invalidateQueries({ queryKey: ["tournaments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <section className="brz-stroke rounded-lg bg-card p-4">
        <h2 className="font-display text-xl uppercase tracking-wide">Criar campeonato</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Nome">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Data">
            <Input
              type="date"
              value={form.tournament_date}
              onChange={(e) => setForm({ ...form, tournament_date: e.target.value })}
            />
          </Field>
          <Field label="Horário">
            <Input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </Field>
          <Field label="Modalidade">
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value as TournamentMode })}
            >
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
          </Field>
          <Field label="Limite de jogadores">
            <Input
              type="number"
              value={form.max_players}
              onChange={(e) => setForm({ ...form, max_players: Number(e.target.value) })}
            />
          </Field>
          <Field label="Valor da inscrição (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.entry_fee}
              onChange={(e) => setForm({ ...form, entry_fee: Number(e.target.value) })}
            />
          </Field>
          <Field label="Valor por kill (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.kill_prize}
              onChange={(e) => setForm({ ...form, kill_prize: Number(e.target.value) })}
            />
          </Field>
          <Field label="Premiação do campeão (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.champion_prize}
              onChange={(e) => setForm({ ...form, champion_prize: Number(e.target.value) })}
            />
          </Field>
          <Field label="Prêmio do 2º lugar">
            <Input
              value={form.runner_up_reward}
              onChange={(e) => setForm({ ...form, runner_up_reward: e.target.value })}
            />
          </Field>
        </div>
        <Button
          className="brz-blood mt-4 w-full font-display uppercase tracking-wide"
          disabled={create.isPending}
          onClick={() => create.mutate()}
        >
          {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar campeonato
        </Button>
      </section>

      {query.isPending && <CardSkeletonList count={2} />}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}

      <div className="space-y-3">
        {(query.data ?? []).map((t) => {
          const meta = STATUS_META[t.effective_status];
          const draft = room[t.id] ?? { id: t.room_id ?? "", password: t.room_password ?? "" };
          return (
            <article key={t.id} className="brz-stroke rounded-lg bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg uppercase">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dateBR(t.tournament_date)} · {hhmm(t.start_time)} · {modeLabel(t.mode)} ·{" "}
                    {t.taken_slots}/{t.max_players} vagas · {brl(t.entry_fee)}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                    meta.className,
                  )}
                >
                  {meta.label}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  placeholder="ID DA SALA"
                  value={draft.id}
                  onChange={(e) => setRoom({ ...room, [t.id]: { ...draft, id: e.target.value } })}
                />
                <Input
                  placeholder="SENHA"
                  value={draft.password}
                  onChange={(e) =>
                    setRoom({ ...room, [t.id]: { ...draft, password: e.target.value } })
                  }
                />
                <Button
                  variant="outline"
                  disabled={!draft.id || release.isPending}
                  onClick={() =>
                    release.mutate({ id: t.id, roomId: draft.id, password: draft.password })
                  }
                >
                  {t.room_released ? "Atualizar sala" : "Liberar sala"}
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => changeStatus.mutate({ id: t.id, status: s })}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                      t.status === s
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ParticipantsTab() {
  const qc = useQueryClient();
  const tournaments = useQuery({ queryKey: ["tournaments"], queryFn: listTournaments });
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("all");

  const active = selected ?? tournaments.data?.[0]?.id ?? null;

  const participants = useQuery({
    queryKey: ["participants", active],
    queryFn: () => listTournamentRegistrations(active!),
    enabled: Boolean(active),
  });

  const confirm = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "pending" }) =>
      setRegistrationPayment(id, status),
    onSuccess: (_d, vars) => {
      toast.success(
        vars.status === "confirmed" ? "Pagamento confirmado · vaga garantida" : "Voltou a aguardar",
      );
      if (vars.status === "confirmed") {
        void emitBrzEvent("payment.confirmed", { registration_id: vars.id });
        void emitBrzEvent("player.confirmed", { registration_id: vars.id });
      }
      void qc.invalidateQueries({ queryKey: ["participants"] });
      void qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (participants.data ?? []).filter((r) =>
    filter === "all" ? true : r.payment_status === filter,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(tournaments.data ?? []).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
              active === t.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {hhmm(t.start_time)} · {dateBR(t.tournament_date)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { v: "all", label: "Todos" },
            { v: "pending", label: "Aguardando" },
            { v: "confirmed", label: "Pago" },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setFilter(o.v)}
            className={cn(
              "rounded-md border px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
              filter === o.v
                ? "border-gold bg-gold/15 text-gold"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {participants.isPending && <RowSkeletonList count={6} />}
      {participants.isError && <ErrorState onRetry={() => void participants.refetch()} />}
      {participants.isSuccess && rows.length === 0 && (
        <EmptyState
          title="Nenhum participante"
          description="Nenhuma inscrição neste filtro por enquanto."
        />
      )}

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="brz-stroke rounded-lg bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {r.nick}{" "}
                  <span className="text-xs text-muted-foreground">{r.profile?.brz_id}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  FF {r.free_fire_id} · {r.whatsapp} · vaga{" "}
                  {r.slot_number ? `#${r.slot_number}` : "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                    r.payment_status === "confirmed"
                      ? "bg-success/15 text-success"
                      : "bg-gold/15 text-gold",
                  )}
                >
                  {r.payment_status === "confirmed" ? "PAGO" : "AGUARDANDO"}
                </span>
                <Button
                  size="sm"
                  variant={r.payment_status === "confirmed" ? "ghost" : "default"}
                  disabled={confirm.isPending}
                  onClick={() =>
                    confirm.mutate({
                      id: r.id,
                      status: r.payment_status === "confirmed" ? "pending" : "confirmed",
                    })
                  }
                >
                  {r.payment_status === "confirmed" ? "Reverter" : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
