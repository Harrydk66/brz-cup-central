import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Crown, Flag, Star } from "lucide-react";
import { AppShell } from "@/components/brz/AppShell";
import { CardSkeletonList, EmptyState, ErrorState, RowSkeletonList } from "@/components/brz/states";
import { listFinishedTournaments, listResults } from "@/lib/brz/api";
import { brl, dateBR, hhmm, modeLabel } from "@/lib/brz/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resultados")({
  head: () => ({
    meta: [
      { title: "Resultados dos Dailys — BRZ.CUP" },
      {
        name: "description",
        content:
          "Histórico dos Dailys da BRZ.CUP: campeão, MVP, 2º lugar, kills e premiação de cada partida.",
      },
      { property: "og:title", content: "Resultados dos Dailys — BRZ.CUP" },
      {
        property: "og:description",
        content: "Campeões, MVPs e premiações de cada Daily de Free Fire da BRZ.CUP.",
      },
    ],
  }),
  component: ResultadosPage,
});

function ResultadosPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const tournaments = useQuery({
    queryKey: ["finished-tournaments"],
    queryFn: listFinishedTournaments,
  });

  return (
    <AppShell>
      <header className="mb-4">
        <h1 className="font-display text-3xl uppercase tracking-wide">Resultados</h1>
        <p className="text-sm text-muted-foreground">
          Todo Daily encerrado vira história — e alimenta os rankings.
        </p>
      </header>

      {tournaments.isPending && <CardSkeletonList count={3} />}
      {tournaments.isError && <ErrorState onRetry={() => void tournaments.refetch()} />}

      {tournaments.isSuccess && tournaments.data.length === 0 && (
        <>
          <EmptyState
            icon={<Flag className="h-8 w-8" />}
            title="Nenhum resultado ainda"
            description="Os Dailys finalizados aparecem aqui com campeão, MVP e premiação."
          />
          <div className="mt-4 flex justify-center">
            <Button asChild className="brz-blood font-display uppercase tracking-wide">
              <Link to="/jogar">Entrar no próximo Daily</Link>
            </Button>
          </div>
        </>
      )}

      <div className="space-y-3">
        {(tournaments.data ?? []).map((t) => (
          <ResultCard
            key={t.id}
            id={t.id}
            title={t.name}
            subtitle={`${dateBR(t.tournament_date)} · ${hhmm(t.start_time)} · ${modeLabel(t.mode)}`}
            open={openId === t.id}
            onToggle={() => setOpenId(openId === t.id ? null : t.id)}
          />
        ))}
      </div>
    </AppShell>
  );
}

function ResultCard({
  id,
  title,
  subtitle,
  open,
  onToggle,
}: {
  id: string;
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
}) {
  const results = useQuery({ queryKey: ["results", id], queryFn: () => listResults(id) });
  const rows = results.data ?? [];
  const champion = rows.find((r) => r.position === 1);
  const runnerUp = rows.find((r) => r.position === 2);
  const mvp = rows.find((r) => r.is_mvp);

  return (
    <article className="brz-stroke rounded-lg bg-card p-4">
      <button type="button" onClick={onToggle} className="w-full text-left">
        <h2 className="font-display text-xl uppercase tracking-wide">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </button>

      {results.isPending && <RowSkeletonList count={3} />}
      {results.isError && <ErrorState onRetry={() => void results.refetch()} />}

      {results.isSuccess && rows.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          Resultados deste Daily ainda não foram publicados.
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Highlight
              icon={<Crown className="h-4 w-4" />}
              label="Campeão"
              value={champion?.nick ?? "—"}
              extra={champion ? `${champion.kills} kills · ${brl(champion.prize)}` : ""}
              gold
            />
            <Highlight
              icon={<Star className="h-4 w-4" />}
              label="MVP"
              value={mvp?.nick ?? "—"}
              extra={mvp ? `${mvp.kills} kills` : ""}
            />
            <Highlight
              icon={<Flag className="h-4 w-4" />}
              label="2º lugar"
              value={runnerUp?.nick ?? "—"}
              extra={runnerUp ? `${runnerUp.kills} kills` : ""}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 px-0 text-xs uppercase tracking-wide text-primary"
            onClick={onToggle}
          >
            {open ? "Ocultar tabela" : "Ver tabela completa"}
          </Button>

          {open && (
            <div className="mt-2 overflow-hidden rounded-md border border-border">
              <div className="grid grid-cols-[2.5rem_1fr_3rem_4.5rem] gap-2 border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <span>Pos</span>
                <span>Jogador</span>
                <span className="text-right">Kills</span>
                <span className="text-right">Prêmio</span>
              </div>
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[2.5rem_1fr_3rem_4.5rem] items-center gap-2 border-b border-border/50 px-3 py-2 text-sm last:border-0"
                >
                  <span className={cn("font-display", r.position === 1 && "brz-gold-text")}>
                    {r.position}º
                  </span>
                  <span className="truncate">
                    {r.nick} {r.is_mvp && <span className="text-gold">★</span>}
                  </span>
                  <span className="text-right font-semibold">{r.kills}</span>
                  <span className="text-right text-success">{brl(r.prize)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  );
}

function Highlight({
  icon,
  label,
  value,
  extra,
  gold,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  extra?: string;
  gold?: boolean;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-background/60 p-3", gold && "border-gold/50")}>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </p>
      <p className={cn("font-display text-lg uppercase", gold && "brz-gold-text")}>{value}</p>
      {extra && <p className="text-xs text-muted-foreground">{extra}</p>}
    </div>
  );
}
