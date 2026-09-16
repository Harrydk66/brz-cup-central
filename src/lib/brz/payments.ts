import { supabase } from "@/integrations/supabase/client";
import type { PixCharge, PaymentStatus } from "./types";

/**
 * Camada de integração de pagamento (Pix).
 *
 * A geração e a confirmação real do Pix são responsabilidade do backend externo
 * (Codex). Aqui existe apenas o CONTRATO:
 *
 *   POST {BRZ_API_URL}/payments/create      -> cria a cobrança
 *   GET  {BRZ_API_URL}/payments/:id/status  -> consulta o status
 *   POST /api/public/webhooks/payment-confirmed -> backend avisa a plataforma
 *
 * Sem VITE_BRZ_API_URL configurado, a interface fica em "AGUARDANDO PAGAMENTO"
 * lendo o status direto da tabela de pagamentos — nunca simulando aprovação.
 */

const API_URL = import.meta.env["VITE_BRZ_API_URL"] as string | undefined;

export interface CreateChargeInput {
  registration_id: string;
  amount: number;
}

export async function createPixCharge(input: CreateChargeInput): Promise<PixCharge> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/payments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Não foi possível gerar o Pix agora.");
    return (await res.json()) as PixCharge;
  }

  // Sem API externa ainda: registramos a cobrança pendente na plataforma.
  const { data, error } = await supabase
    .from("payments")
    .insert({
      registration_id: input.registration_id,
      amount: input.amount,
      status: "pending",
    } as never)
    .select()
    .single();
  if (error) throw new Error(error.message);

  const row = data as unknown as {
    id: string;
    amount: number;
    status: PaymentStatus;
    pix_qr_code: string | null;
    pix_copy_paste: string | null;
    expires_at: string | null;
  };
  return {
    payment_id: row.id,
    amount: Number(row.amount),
    status: row.status,
    qr_code_image: row.pix_qr_code,
    copy_paste: row.pix_copy_paste,
    expires_at: row.expires_at,
  };
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/payments/${paymentId}/status`);
    if (res.ok) {
      const json = (await res.json()) as { status: PaymentStatus };
      return json.status;
    }
  }
  const { data } = await supabase.from("payments").select("status").eq("id", paymentId).maybeSingle();
  return ((data?.status as PaymentStatus) ?? "pending") as PaymentStatus;
}

export const PIX_API_CONFIGURED = Boolean(API_URL);
