import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/brz/AppShell";
import { CardSkeletonList, EmptyState } from "@/components/brz/states";
import {
  getPlayerStats,
  listAchievements,
  listPlayerAchievements,
  listRanking,
} from "@/lib/brz/api";
import { brl } from "@/lib/brz/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil BRZ — estatísticas e conquistas" },
      {
        name: "description",
        content:
          "Veja seu BRZ ID, kills, booyahs, MVPs, total ganho e conquistas desbloqueadas na BRZ.CUP.",
      },
      { property: "og:title", content: "Perfil BRZ" },
      {
        property: "og:description",
        content: "Estatísticas de temporada e all-time do seu perfil BRZ.CUP.",
      },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { user, profile, loading } = useAuth();
  const [scope, setScope] = useState<"season" | "all_time">("season");
  const [showAll, setShowAll] = useState(false);

  const stats = useQuery({
    queryKey: ["player-stats", user?.id],
    queryFn: () => getPlayerStats(user!.id),
    enabled: Boolean(user),
  });

  const achievements = useQuery({ queryKey: ["achievements"], queryFn: listAchievements });
  const unlocked = useQuery({
    queryKey: ["player-achievements", user?.id],
    queryFn: () => listPlayerAchievements(user!.id),
    enabled: Boolean(user),
  });

  const killRank = useQuery({
    queryKey: ["ranking", "kills", "all_time"],
    queryFn: () => listRanking("kills", "all_time"),
  });
  const booyahRank = useQuery({
    queryKey: ["ranking", "booyahs", "all_time"],
    queryFn: () => listRanking("booyahs", "all_time"),
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
          icon={<User className="h-8 w-8" />}
          title="Entre para ver seu perfil BRZ"
          description="Seu BRZ ID, kills, booyahs e conquistas ficam salvos na sua conta."
        />
        <div className="mt-4 flex justify-center">
          <Button asChild className="brz-blood">
            <Link to="/auth" search={{ redirect: "/perfil" }}>
              Entrar / Criar conta
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const s = stats.data;
  const season = scope === "season";
  const matches = season ? (s?.season_matches ?? 0) : (s?.matches ?? 0);
  const kills = season ? (s?.season_kills ?? 0) : (s?.kills ?? 0);
  const booyahs = season ? (s?.season_booyahs ?? 0) : (s?.booyahs ?? 0);
  const top2 = season ? (s?.season_top2 ?? 0) : (s?.top2 ?? 0);
  const mvps = season ? (s?.season_mvps ?? 0) : (s?.mvps ?? 0);
  const earnings = Number(season ? (s?.season_earnings ?? 0) : (s?.earnings ?? 0));
  const avgKills = matches > 0 ? (kills / matches).toFixed(1) : "0,0";

  const killPos = killRank.data?.findIndex((r) => r.player_id === user.id);
  const booyahPos = booyahRank.data?.findIndex((r) => r.player_id === user.id);

  const unlockedIds = unlocked.data ?? [];
  const all = achievements.data ?? [];
  const unlockedList = all.filter((a) => unlockedIds.includes(a.id));
  const highlight = (unlockedList.length > 0 ? unlockedList : all).slice(0, 3);

  return (
    <AppShell>
      <section className="brz-stroke brz-grain mb-4 rounded-lg bg-card p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Perfil BRZ</p>
        <h1 className="font-display text-3xl uppercase tracking-wide">{profile?.nick}</h1>
        <p className="brz-gold-text font-display text-xl">{profile?.brz_id}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ID Free Fire: {profile?.free_fire_id ?? "—"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {highlight.map((a) => {
            const has = unlockedIds.includes(a.id);
            return (
              <span
                key={a.id}
                title={a.description}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide",
                  has
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border bg-muted/30 text-muted-foreground opacity-60",
                )}
              >
                <span>{a.icon}</span>
                {a.name}
              </span>
            );
          })}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 px-0 text-xs uppercase tracking-wide text-primary"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Ocultar conquistas" : "Ver todas as conquistas"}
        </Button>
      </section>

      {showAll && (
        <section className="mb-4 grid gap-2 sm:grid-cols-2">
          {all.map((a) => {
            const has = unlockedIds.includes(a.id);
            return (
              <div
                key={a.id}
                className={cn(
                  "brz-stroke flex items-start gap-3 rounded-lg bg-card p-3",
                  !has && "opacity-55",
                )}
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className={cn("font-display uppercase", has && "brz-gold-text")}>{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <div className="mb-3 flex gap-2">
        {(
          [
            { v: "season", label: "Temporada atual" },
            { v: "all_time", label: "All-time" },
          ] as const
        ).map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => setScope(o.v)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
              scope === o.v
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Partidas" value={matches} />
        <Stat label="Kills" value={kills} />
        <Stat label="Média/kill" value={avgKills} />
        <Stat label="Booyahs" value={booyahs} accent="gold" />
        <Stat label="Top 2" value={top2} />
        <Stat label="MVPs" value={mvps} accent="gold" />
        <Stat label="Total ganho" value={brl(earnings)} accent="success" />
        <Stat
          label="Ranking kills"
          value={killPos !== undefined && killPos >= 0 ? `#${killPos + 1}` : "—"}
        />
        <Stat
          label="Ranking booyahs"
          value={booyahPos !== undefined && booyahPos >= 0 ? `#${booyahPos + 1}` : "—"}
        />
      </section>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button asChild className="brz-blood font-display uppercase tracking-wide">
          <Link to="/jogar">Jogar agora</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/meus-campeonatos">Meus campeonatos</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "gold" | "success";
}) {
  return (
    <div className="brz-stroke rounded-lg bg-card p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-display text-2xl",
          accent === "gold" && "brz-gold-text",
          accent === "success" && "text-success",
        )}
      >
        {value}
      </p>
    </div>
  );
}
