import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/brz/AppShell";
import { TournamentCard } from "@/components/brz/TournamentCard";
import { CardSkeletonList, EmptyState, ErrorState } from "@/components/brz/states";
import { listUpcomingTournaments } from "@/lib/brz/api";

export const Route = createFileRoute("/jogar")({
  head: () => ({
    meta: [
      { title: "Jogar — Campeonatos de hoje na BRZ.CUP" },
      {
        name: "description",
        content:
          "Veja os Dailys de Free Fire abertos hoje na BRZ.CUP, valores de inscrição, vagas disponíveis e inscreva-se pelo Pix.",
      },
      { property: "og:title", content: "Jogar — Campeonatos de hoje na BRZ.CUP" },
      {
        property: "og:description",
        content: "Dailys abertos, vagas em tempo real e inscrição via Pix.",
      },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["tournaments", "upcoming"],
    queryFn: listUpcomingTournaments,
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl">Campeonatos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha o horário, garanta sua vaga e entre no grupo.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {data?.map((t) => <TournamentCard key={t.id} tournament={t} />)}
      </div>

      {isLoading && (
        <div className="mt-6">
          <CardSkeletonList />
        </div>
      )}
      {isError && (
        <div className="mt-6">
          <ErrorState onRetry={() => void refetch()} />
        </div>
      )}
      {data?.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="Sem campeonatos por agora"
            description="Ainda não há Dailys publicados. Assim que a BRZ abrir os horários, eles aparecem aqui."
          />
        </div>
      )}
    </AppShell>
  );
}
