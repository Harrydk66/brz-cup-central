import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/brz/AppShell";
import { BrzLogo } from "@/components/brz/BrzLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar na BRZ.CUP" },
      {
        name: "description",
        content: "Acesse sua conta BRZ para se inscrever nos Dailys, acompanhar vagas e rankings.",
      },
      { property: "og:title", content: "Entrar na BRZ.CUP" },
      { property: "og:description", content: "Cadastro rápido para jogar os Dailys da BRZ." },
    ],
  }),
  component: AuthPage,
});

function safePath(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/jogar";
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nick, setNick] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) void navigate({ to: safePath(redirect), replace: true });
  }, [user, redirect, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${safePath(redirect)}`,
            data: { nick, whatsapp },
          },
        });
        if (error) throw error;
        toast.success("Conta BRZ criada!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível autenticar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
  }

  return (
    <AppShell>
      <div className="mx-auto mt-6 max-w-md">
        <div className="brz-stroke brz-grain rounded-lg bg-card p-6">
          <BrzLogo withSlogan />
          <h1 className="mt-5 font-display text-2xl">
            {mode === "signup" ? "Criar conta BRZ" : "Entrar"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rápido: só o essencial para você jogar hoje.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="nick">Nick no Free Fire</Label>
                  <Input id="nick" required value={nick} onChange={(e) => setNick(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="zap">WhatsApp</Label>
                  <Input
                    id="zap"
                    required
                    inputMode="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="pass">Senha</Label>
              <Input
                id="pass"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              className="w-full brz-blood font-display text-lg tracking-widest"
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {mode === "signup" ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <Button variant="outline" className="mt-3 w-full" onClick={() => void handleGoogle()}>
            Continuar com Google
          </Button>

          <button
            type="button"
            className="mt-4 w-full text-xs font-bold uppercase tracking-wider text-primary"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Já tenho conta" : "Quero criar uma conta"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
