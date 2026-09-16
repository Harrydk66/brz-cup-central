import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Skull, Crown, Ticket, Trophy } from "lucide-react";
import heroImage from "@/assets/brz-hero.jpg";
import { AppShell } from "@/components/brz/AppShell";
import { TournamentCard } from "@/components/brz/TournamentCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/brz/states";
import { Button } from "@/components/ui/button";
import { listUpcomingTournaments, getRankingPrizes } from "@/lib/brz/api";
import { brl } from "@/lib/brz/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BRZ.CUP — Do lobby pra história" },
      {
        name: "description",
        content:
          "Jogue os Dailys da BRZ, faça kills e ganhe. R$2 por kill, R$40 para o campeão e rankings semanais de Free Fire.",
      },
      { property: "og:title", content: "BRZ.CUP — Do lobby pra história" },
      {
        property: "og:description",
        content: "Campeonatos diários de Free Fire com premiação por kill e rankings.",
      },
    ],
  }),
  component: HomePage,
});

const DIFERENCIAIS = [
  { icon: Skull, title: "R$2 por kill", text: "Cada abate vale dinheiro no seu bolso." },
  { icon: Crown, title: "R$40 pro campeão", text: "Booyah no Daily, prêmio na conta." },
  { icon: Ticket, title: "2º lugar leva vaga", text: "Vaga garantida no próximo Daily." },
  { icon: Trophy, title: "Rankings", text: "Semanais e mensais com premiação extra." },
];

function HomePage() {
  const tournaments = useQuery({
    queryKey: ["tournaments", "upcoming"],
    queryFn: listUpcomingTournaments,
  });
  const prizes = useQuery({ queryKey: ["ranking-prizes"], queryFn: getRankingPrizes });

  return (
    <AppShell>
      <section className="relative -mx-4 overflow-hidden md:mx-0 md:rounded-xl">
        <img
          src={heroImage}
          alt="Arena competitiva da BRZ com grafite vermelho"
          width={1600}
          height={1008}
          className="h-[420px] w-full object-cover opacity-60 md:h-[460px]"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-fade)]" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-10">
          <h1 className="font-display text-5xl leading-[0.9] md:text-7xl">
            BRZ<span className="text-primary">.CUP</span>
          </h1>
          <p className="mt-2 font-display text-lg tracking-[0.2em] text-gold md:text-2xl">
            Do lobby pra história.
          </p>
          <p className="mt-3 max-w-md text-sm text-foreground/80 md:text-base">
            Jogue. Faça kills. Suba no ranking. Ganhe.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="lg" className="brz-blood brz-glow font-display text-lg tracking-widest">
              <Link to="/jogar">Jogar agora</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-display text-lg tracking-widest">
              <Link to="/ranking">Ver ranking</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {DIFERENCIAIS.map((d) => (
          <div key={d.title} className="brz-stroke brz-grain rounded-lg bg-card p-4">
            <d.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-2 font-display text-base">{d.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{d.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl">Próximos Dailys</h2>
          <Link to="/jogar" className="text-xs font-bold uppercase tracking-wider text-primary">
            Ver todos
          </Link>
        </div>

        {tournaments.isLoading && <CardSkeletonList />}
        {tournaments.isError && <ErrorState onRetry={() => void tournaments.refetch()} />}
        {tournaments.data?.length === 0 && (
          <EmptyState
            title="Nenhum Daily aberto agora"
            description="Os horários de hoje ainda não foram publicados. Volte em instantes."
          />
        )}
        <div className="grid gap-3 md:grid-cols-3">
          {tournaments.data?.slice(0, 6).map((t) => <TournamentCard key={t.id} tournament={t} />)}
        </div>
      </section>

      <section className="mt-10 brz-stroke brz-grain rounded-xl bg-card p-5 md:p-8">
        <h2 className="font-display text-2xl brz-gold-text">
          Quanto mais você joga, mais vale sua história.
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            { icon: "⭐", title: "MVP da semana", desc: "Mais kills na semana", v: prizes.data?.weekly_mvp },
            { icon: "👑", title: "Rei do Booyah da semana", desc: "Mais Booyahs na semana", v: prizes.data?.weekly_booyah_king },
            { icon: "⭐", title: "MVP do mês", desc: "Mais kills no mês", v: prizes.data?.monthly_mvp },
            { icon: "👑", title: "Rei do Booyah do mês", desc: "Mais Booyahs no mês", v: prizes.data?.monthly_booyah_king },
          ].map((p) => (
            <div key={p.title} className="rounded-lg border border-gold/30 bg-background/60 p-4">
              <span className="text-xl" aria-hidden>
                {p.icon}
              </span>
              <h3 className="mt-1 font-display text-sm">{p.title}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
              <p className="mt-2 font-display text-xl text-gold">
                {p.v === undefined ? "—" : brl(p.v)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        BRZ.CUP · Do lobby pra história.
      </footer>
    </AppShell>
  );
}
