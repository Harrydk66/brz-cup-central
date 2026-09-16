import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy, Loader2, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/brz/AppShell";
import { StatusPill } from "@/components/brz/TournamentCard";
import { CardSkeletonList, ErrorState } from "@/components/brz/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  createRegistration,
  getSetting,
  getTournament,
  joinWaitlist,
  readUtmSource,
  trackEvent,
} from "@/lib/brz/api";
import { createPixCharge, getPaymentStatus, PIX_API_CONFIGURED } from "@/lib/brz/payments";
import { emitBrzEvent } from "@/lib/brz/events";
import { brl, canRegister, hhmm } from "@/lib/brz/format";
import type { PaymentStatus, PixCharge, Registration } from "@/lib/brz/types";

export const Route = createFileRoute("/inscricao/$tournamentId")({
  head: () => ({
    meta: [
      { title: "Inscrição — BRZ.CUP" },
      {
        name: "description",
        content:
          "Garanta sua vaga em um Daily da BRZ.CUP: informe seus dados, pague via Pix e entre no grupo do WhatsApp.",
      },
      { property: "og:title", content: "Inscrição — BRZ.CUP" },
      { property: "og:description", content: "Dados do jogador, Pix e vaga garantida." },
    ],
  }),
  component: RegistrationPage,
});

type Step = "form" | "pix" | "confirmed";

function RegistrationPage() {
  const { tournamentId } = Route.useParams();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const tournament = useQuery({
    queryKey: ["tournament", tournamentId],
    queryFn: () => getTournament(tournamentId),
  });
  const whatsappGroup = useQuery({
    queryKey: ["setting", "whatsapp_group_url"],
    queryFn: () => getSetting<string>("whatsapp_group_url"),
  });

  const [step, setStep] = useState<Step>("form");
  const [nick, setNick] = useState("");
  const [ffId, setFfId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [charge, setCharge] = useState<PixCharge | null>(null);
  const [payment, setPayment] = useState<PaymentStatus>("pending");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setNick((v) => v || profile.nick);
      setFfId((v) => v || profile.free_fire_id || "");
      setWhatsapp((v) => v || profile.whatsapp || "");
    }
  }, [profile]);

  // Polling do status real: quem confirma é o backend, nunca o frontend.
  useEffect(() => {
    if (step !== "pix" || !charge) return;
    const id = window.setInterval(async () => {
      const status = await getPaymentStatus(charge.payment_id);
      setPayment(status);
      if (status === "confirmed") {
        setStep("confirmed");
        void emitBrzEvent("player.confirmed", { registration_id: registration?.id });
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, [step, charge, registration?.id]);

  if (loading || tournament.isLoading) {
    return (
      <AppShell>
        <CardSkeletonList count={1} />
      </AppShell>
    );
  }
  if (tournament.isError || !tournament.data) {
    return (
      <AppShell>
        <ErrorState message="Não encontramos esse campeonato." />
      </AppShell>
    );
  }

  const t = tournament.data;
  const full = t.effective_status === "full";
  const open = canRegister(t.effective_status);

  if (!user) {
    return (
      <AppShell>
        <div className="brz-stroke mx-auto max-w-md rounded-lg bg-card p-6 text-center">
          <h1 className="font-display text-2xl">Entre para se inscrever</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastro rápido: e-mail e senha (ou Google). Seu perfil BRZ é criado automaticamente.
          </p>
          <Button asChild className="mt-5 w-full brz-blood font-display tracking-wider">
            <Link to="/auth" search={{ redirect: `/inscricao/${tournamentId}` }}>
              Entrar / criar conta
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      const reg = await createRegistration({
        tournament_id: t.id,
        player_id: user.id,
        nick: nick.trim(),
        free_fire_id: ffId.trim(),
        whatsapp: whatsapp.trim(),
        utm_source: readUtmSource(),
      });
      setRegistration(reg);
      void trackEvent("registration.created", user.id);
      void emitBrzEvent("registration.created", { registration_id: reg.id, tournament_id: t.id });

      const pix = await createPixCharge({ registration_id: reg.id, amount: t.entry_fee });
      setCharge(pix);
      setPayment(pix.status);
      setStep(pix.status === "confirmed" ? "confirmed" : "pix");
      void emitBrzEvent("payment.pending", { payment_id: pix.payment_id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível iniciar a inscrição.");
    } finally {
      setBusy(false);
    }
  }

  async function handleWaitlist() {
    if (!user) return;
    setBusy(true);
    try {
      await joinWaitlist({
        tournament_id: t.id,
        player_id: user.id,
        nick: nick.trim() || profile?.nick || "Jogador",
        whatsapp: whatsapp.trim() || profile?.whatsapp || "",
      });
      toast.success("Você entrou na lista de espera. Avisamos se abrir vaga.");
      void navigate({ to: "/meus-campeonatos" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não conseguimos te colocar na fila.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg">
        <header className="brz-stroke brz-grain rounded-lg bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{t.name}</p>
              <h1 className="font-display text-3xl">{hhmm(t.start_time)}</h1>
            </div>
            <StatusPill status={t.effective_status} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Inscrição {brl(t.entry_fee)} · {t.available_slots} de {t.max_players} vagas livres
          </p>
        </header>

        <Steps step={step} />

        {full && step === "form" && (
          <div className="brz-stroke mt-4 rounded-lg bg-card p-5">
            <h2 className="font-display text-xl text-primary">Campeonato lotado</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entre na lista de espera e avisamos assim que abrir vaga.
            </p>
            <Button
              className="mt-4 w-full font-display tracking-wider"
              variant="outline"
              disabled={busy}
              onClick={() => void handleWaitlist()}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Entrar na lista de espera
            </Button>
          </div>
        )}

        {!full && !open && step === "form" && (
          <div className="brz-stroke mt-4 rounded-lg bg-card p-5 text-sm text-muted-foreground">
            As inscrições deste campeonato estão encerradas.
          </div>
        )}

        {open && step === "form" && (
          <form onSubmit={handleSubmit} className="brz-stroke mt-4 space-y-4 rounded-lg bg-card p-5">
            <h2 className="font-display text-xl">Dados do jogador</h2>
            <div>
              <Label htmlFor="nick">Nick no Free Fire</Label>
              <Input id="nick" required value={nick} onChange={(e) => setNick(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ffid">ID do Free Fire</Label>
              <Input
                id="ffid"
                required
                inputMode="numeric"
                value={ffId}
                onChange={(e) => setFfId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="zap">WhatsApp</Label>
              <Input
                id="zap"
                required
                inputMode="tel"
                placeholder="(00) 00000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full brz-blood font-display text-lg tracking-widest"
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Gerar Pix
            </Button>
          </form>
        )}

        {step === "pix" && charge && (
          <div className="brz-stroke mt-4 rounded-lg bg-card p-5">
            <h2 className="font-display text-xl">Pagamento Pix</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Valor: <span className="font-bold text-foreground">{brl(charge.amount)}</span>
            </p>

            <div className="mt-4 flex flex-col items-center">
              {charge.qr_code_image ? (
                <img
                  src={charge.qr_code_image}
                  alt="QR Code do Pix da inscrição"
                  width={220}
                  height={220}
                  className="rounded-md bg-background p-2"
                />
              ) : (
                <div className="flex h-[200px] w-[200px] flex-col items-center justify-center rounded-md border border-dashed border-border text-center text-xs text-muted-foreground">
                  <Clock className="mb-2 h-5 w-5" />
                  {PIX_API_CONFIGURED
                    ? "Gerando QR Code..."
                    : "QR Code será entregue pelo sistema de pagamento da BRZ."}
                </div>
              )}
            </div>

            {charge.copy_paste && (
              <div className="mt-4">
                <Label>Pix copia e cola</Label>
                <div className="mt-1 flex gap-2">
                  <Input readOnly value={charge.copy_paste} className="text-xs" />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      void navigator.clipboard.writeText(charge.copy_paste ?? "");
                      toast.success("Código Pix copiado.");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center gap-2 rounded-md bg-gold/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold">
              <Loader2 className="h-4 w-4 animate-spin" />
              {payment === "pending" ? "Aguardando pagamento" : payment}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Sua vaga só é garantida depois que o pagamento é confirmado pelo sistema da BRZ.
              Esta tela atualiza sozinha.
            </p>
            <Button asChild variant="ghost" className="mt-3 w-full">
              <Link to="/meus-campeonatos">Ver meus campeonatos</Link>
            </Button>
          </div>
        )}

        {step === "confirmed" && (
          <div className="brz-stroke mt-4 rounded-lg border-success/40 bg-card p-6 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-success" />
            <h2 className="mt-3 font-display text-2xl text-success">🔥 Você está dentro!</h2>
            <dl className="mt-5 space-y-2 text-sm">
              <Row label="Campeonato" value={t.name} />
              <Row label="Horário" value={hhmm(t.start_time)} />
              <Row label="Nick" value={nick} />
              <Row
                label="Vaga"
                value={registration?.slot_number ? `#${registration.slot_number}` : "confirmada"}
              />
            </dl>
            <Button
              asChild
              className="mt-6 w-full font-display tracking-wider"
              style={{ backgroundColor: "var(--success)", color: "var(--success-foreground)" }}
            >
              <a
                href={whatsappGroup.data ?? "https://chat.whatsapp.com/"}
                target="_blank"
                rel="noreferrer"
              >
                Entrar no grupo do WhatsApp
              </a>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: "form", label: "Dados" },
  { key: "pix", label: "Pix" },
  { key: "confirmed", label: "Vaga" },
];

function Steps({ step }: { step: Step }) {
  const index = STEP_LABELS.findIndex((s) => s.key === step);
  return (
    <ol className="mt-4 flex items-center gap-2">
      {STEP_LABELS.map((s, i) => (
        <li key={s.key} className="flex flex-1 items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              i <= index ? "brz-blood text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              i <= index ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </span>
          {i < STEP_LABELS.length - 1 && <span className="h-px flex-1 bg-border" />}
        </li>
      ))}
    </ol>
  );
}
