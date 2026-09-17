import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Crosshair, Crown, Trophy } from "lucide-react";
import { AppShell } from "@/components/brz/AppShell";
import { EmptyState, ErrorState, RowSkeletonList } from "@/components/brz/states";
import { listRanking } from "@/lib/brz/api";
import type { RankingKind, RankingPeriod } from "@/lib/brz/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Rankings BRZ.CUP — Kill Ranking e Booyah Ranking" },
      {
        name: "description",
        content:
          "Acompanhe o Kill Ranking e o Booyah Ranking da BRZ.CUP por semana, mês, temporada e all-time.",
      },
      { property: "og:title", content: "Rankings BRZ.CUP" },
      {
        property: "og:description",
        content: "Kill Ranking e Booyah Ranking dos Dailys de Free Fire da BRZ.CUP.",
      },
    ],
  }),
  component: RankingPage,
});

const PERIODS: { value: RankingPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "season", label: "Temporada" },
  { value: "all_time", label: "All-time" },
];

const KINDS: { value: RankingKind; label: string; icon: typeof Crosshair }[] = [
  { value: "kills", label: "Kill Ranking", icon: Crosshair },
  { value: "booyahs", label: "Booyah Ranking", icon: Crown },
];

const MEDALS = ["🥇", "🥈", "🥉"];

function RankingPage() {
  const [kind, setKind] = useState<RankingKind>("kills");
  const [period, setPeriod] = useState<RankingPeriod>("week");

  const query = useQuery({
    queryKey: ["ranking", kind, period],
    queryFn: () => listRanking(kind, period),
  });

  const rows = query.data ?? [];
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const mainStat = (r: (typeof rows)[number]) => (kind === "kills" ? r.kills : r.booyahs);

  return (
    <AppShell>
      <header className="mb-5">
        <h1 className="font-display text-3xl uppercase tracking-wide">Rankings BRZ</h1>
        <p className="text-sm text-muted-foreground">
          Sem pontos inventados: aqui vale kill e vale booyah.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {KINDS.map((k) => {
          const Icon = k.icon;
          const active = kind === k.value;
          return (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              className={cn(
                "brz-stroke flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold uppercase tracking-wide transition-colors",
                active ? "brz-blood text-primary-foreground" : "bg-card text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {k.label}
            </button>
          );
        })}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPeriod(p.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
              period === p.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {query.isPending && <RowSkeletonList count={8} />}
      {query.isError && <ErrorState onRetry={() => void query.refetch()} />}

      {query.isSuccess && rows.length === 0 && (
        <EmptyState
          icon={<Trophy className="h-8 w-8" />}
          title="Ranking ainda não começou"
          description="Assim que os primeiros Dailys forem finalizados, o ranking aparece aqui."
        />
      )}

      {query.isSuccess && rows.length > 0 && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {top3.map((r, i) => (
              <div
                key={r.player_id}
                className={cn(
                  "brz-stroke rounded-lg bg-card p-4 text-center",
                  i === 0 && "border-gold/60 brz-glow",
                )}
              >
                <div className="text-2xl">{MEDALS[i]}</div>
                <p className="mt-1 font-display text-xl uppercase">{r.nick}</p>
                <p className="text-xs text-muted-foreground">{r.brz_id}</p>
                <p
                  className={cn(
                    "mt-2 font-display text-3xl",
                    i === 0 ? "brz-gold-text" : "text-primary",
                  )}
                >
                  {mainStat(r)}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {kind === "kills" ? "kills" : "booyahs"} · {r.matches} partidas
                </p>
              </div>
            ))}
          </div>

          <div className="brz-stroke overflow-hidden rounded-lg bg-card">
            <div className="grid grid-cols-[2.5rem_1fr_3rem_3rem_3rem] gap-2 border-b border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              <span>#</span>
              <span>Jogador</span>
              <span className="text-right">Kills</span>
              <span className="text-right">Booy</span>
              <span className="text-right">Part</span>
            </div>
            {rest.map((r, i) => (
              <div
                key={r.player_id}
                className="grid grid-cols-[2.5rem_1fr_3rem_3rem_3rem] items-center gap-2 border-b border-border/50 px-3 py-2.5 text-sm last:border-0"
              >
                <span className="font-display text-muted-foreground">{i + 4}</span>
                <span className="truncate">
                  <span className="font-semibold">{r.nick}</span>{" "}
                  <span className="text-xs text-muted-foreground">{r.brz_id}</span>
                </span>
                <span className="text-right font-semibold">{r.kills}</span>
                <span className="text-right font-semibold">{r.booyahs}</span>
                <span className="text-right text-muted-foreground">{r.matches}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex justify-center">
        <Button variant="outline" asChild>
          <a href="/jogar">Entrar no próximo Daily</a>
        </Button>
      </div>
    </AppShell>
  );
}
