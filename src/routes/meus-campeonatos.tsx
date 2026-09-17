import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Copy, KeyRound, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/brz/AppShell";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/brz/states";
import { listMyRegistrations } from "@/lib/brz/api";
import { brl, dateBR, hhmm, modeLabel } from "@/lib/brz/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RegistrationWithTournament } from "@/lib/brz/types";

export const Route = createFileRoute("/meus-campeonatos")({
  head: () => ({
    meta: [
      { title: "Meus campeonatos — BRZ.CUP" },
      {
        name: "description",
        content:
          "Acompanhe seus Dailys da BRZ.CUP: status do pagamento, vaga garantida e liberação da sala.",
      },
      { property: "og:title", content: "Meus campeonatos — BRZ.CUP" },
      {
        property: "og:description",
        content: "Próximos e finalizados, status de pagamento, vaga e sala.",
      },
    ],
  }),
  component: MeusCampeonatosPage,
});

const PAYMENT_META = {
  pending: { label: "AGUARDANDO PAGAMENTO", className: "bg-gold/15 text-gold" },
  confirmed: { label: "PAGAMENTO CONFIRMADO", className: "bg-success/15 text-success" },
  expired: { label: "PAGAMENTO EXPIRADO", className: "bg-muted text-muted-foreground" },
  failed: { label: "PAGAMENTO FALHOU", className: "bg-primary/15 text-primary" },
  refunded: { label: "REEMBOLSADO", className: "bg-muted text-muted-foreground" },
} as const;

function MeusCampeonatosPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"next" | "done">("next");

  const query = useQuery({
    queryKey: ["my-registrations", user?.id],
    queryFn: () => listMyRegistrations(user!.id),
    enabled: Boolean(user),
    refetchInterval: 30_000,
  });

  if (loading) {
    return (
      <AppShell>
        <CardSkeletonList count={2} />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <EmptyState
          icon={<CalendarClock className="h-8 w-8" />}
          title="Entre para ver seus campeonatos"
          description="Suas inscrições, pagamentos e a sala liberada aparecem aqui."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild className="brz-blood">
            <Link to="/auth" search={{ redirect: "/meus-campeonatos" }}>
              Entrar / Criar conta
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const all = query.data ?? [];
  const done = all.filter((r) =>
    ["finished", "cancelled", "closed"].includes(r.tournament?.status ?? ""),
  );
  const next = all.filter((r) => !done.includes(r));
  const list = tab === "next" ? next : done;

  return (
    <AppShell>
      <header className="mb-4">
        <h1 className="font-display text-3xl uppercase tracking-wide">Meus campeonatos</h1>
        <p className="text-sm text-muted-foreground">Do lobby pra história, um Daily por vez.</p>
      </header>

      <div className="mb-4 flex gap-2">
        {(
          [
            { v: "next", label: `Próximos (${next.length})` },
            { v: "done", label: `Finalizados (${done.length})` },
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

      {query.isPending && <CardSkeletonList count={2} />}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}

      {query.isSuccess && list.length === 0 && (
        <EmptyState
          icon={<CalendarClock className="h-8 w-8" />}
          title={tab === "next" ? "Nenhum campeonato à vista" : "Nenhum campeonato finalizado"}
          description={
            tab === "next"
              ? "Escolha um horário do Daily e garanta sua vaga."
              : "Quando seus Dailys acabarem, o histórico aparece aqui."
          }
        />
      )}

      <div className="space-y-3">
        {list.map((r) => (
          <RegistrationCard key={r.id} reg={r} />
        ))}
      </div>

      {tab === "next" && (
        <div className="mt-6 flex justify-center">
          <Button asChild className="brz-blood font-display uppercase tracking-wide">
            <Link to="/jogar">Entrar em outro Daily</Link>
          </Button>
        </div>
      )}
    </AppShell>
  );
}

function RegistrationCard({ reg }: { reg: RegistrationWithTournament }) {
  const t = reg.tournament;
  const payment = PAYMENT_META[reg.payment_status] ?? PAYMENT_META.pending;
  const guaranteed = reg.slot_status === "guaranteed";
  const roomVisible = guaranteed && t?.room_released && t.room_id;

  const copy = (label: string, value: string) => {
    void navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
  };

  return (
    <article className="brz-stroke rounded-lg bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl uppercase tracking-wide">{t?.name}</h2>
          <p className="text-sm text-muted-foreground">
            {t ? `${dateBR(t.tournament_date)} · ${hhmm(t.start_time)} · ${modeLabel(t.mode)}` : "—"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
            payment.className,
          )}
        >
          {payment.label}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="Nick" value={reg.nick} />
        <Mini label="Vaga" value={reg.slot_number ? `#${reg.slot_number}` : "—"} />
        <Mini label="Inscrição" value={brl(t?.entry_fee ?? 0)} />
      </div>

      <div className="mt-3 rounded-md border border-border bg-background/60 p-3">
        {!guaranteed ? (
          <p className="flex items-center gap-2 text-sm text-gold">
            <Lock className="h-4 w-4" /> Vaga reservada — garantida após a confirmação do Pix.
          </p>
        ) : roomVisible ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-success">
              <KeyRound className="h-4 w-4" /> Sala liberada
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => copy("ID da sala", t.room_id!)}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">ID</span>
                <span className="flex items-center gap-2 font-semibold">
                  {t.room_id} <Copy className="h-3.5 w-3.5" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => copy("Senha", t.room_password ?? "")}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">Senha</span>
                <span className="flex items-center gap-2 font-semibold">
                  {t.room_password} <Copy className="h-3.5 w-3.5" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" /> Vaga garantida · aguardando sala
          </p>
        )}
      </div>

      {t?.whatsapp_group_url && reg.slot_status === "guaranteed" && (
        <Button asChild variant="outline" className="mt-3 w-full">
          <a href={t.whatsapp_group_url} target="_blank" rel="noreferrer">
            Entrar no grupo do WhatsApp
          </a>
        </Button>
      )}
    </article>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background/60 px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate font-semibold">{value}</p>
    </div>
  );
}
