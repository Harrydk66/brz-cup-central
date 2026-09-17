import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Webhook do backend externo de Pix.
 * A vaga só é garantida aqui — o frontend nunca confirma pagamento por conta própria.
 *
 * POST /api/public/webhooks/payment-confirmed
 * Header: x-brz-secret: <BRZ_WEBHOOK_SECRET>
 * Body:   { registration_id?, payment_id?, provider_reference?, status: "confirmed" | ... }
 */

const bodySchema = z.object({
  registration_id: z.string().uuid().optional(),
  payment_id: z.string().uuid().optional(),
  provider_reference: z.string().optional(),
  status: z
    .enum(["pending", "confirmed", "expired", "failed", "refunded"])
    .default("confirmed"),
});

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/webhooks/payment-confirmed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["BRZ_WEBHOOK_SECRET"] ?? process.env["LOVABLE_CRON_SECRET"];
        const provided = request.headers.get("x-brz-secret") ?? "";
        if (!secret || !timingSafeEqual(provided, secret)) {
          return json({ error: "unauthorized" }, 401);
        }

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return json({ error: "invalid payload" }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Resolve o pagamento (por id, referência do provedor ou inscrição).
        let paymentQuery = supabaseAdmin
          .from("payments")
          .select("id, registration_id")
          .limit(1);
        if (parsed.payment_id) paymentQuery = paymentQuery.eq("id", parsed.payment_id);
        else if (parsed.provider_reference)
          paymentQuery = paymentQuery.eq("provider_reference", parsed.provider_reference);
        else if (parsed.registration_id)
          paymentQuery = paymentQuery.eq("registration_id", parsed.registration_id);
        else return json({ error: "identifier required" }, 400);

        const { data: payment } = await paymentQuery.maybeSingle();
        const registrationId = parsed.registration_id ?? payment?.registration_id;
        if (!registrationId) return json({ error: "registration not found" }, 404);

        const confirmed = parsed.status === "confirmed";

        if (payment?.id) {
          const { error } = await supabaseAdmin
            .from("payments")
            .update({
              status: parsed.status,
              confirmed_at: confirmed ? new Date().toISOString() : null,
            })
            .eq("id", payment.id);
          if (error) return json({ error: error.message }, 500);
        }

        // Número de vaga sequencial, atribuído apenas na confirmação.
        let slotNumber: number | null = null;
        if (confirmed) {
          const { data: reg } = await supabaseAdmin
            .from("registrations")
            .select("tournament_id, slot_number")
            .eq("id", registrationId)
            .maybeSingle();
          slotNumber = reg?.slot_number ?? null;
          if (reg && slotNumber === null) {
            const { count } = await supabaseAdmin
              .from("registrations")
              .select("id", { count: "exact", head: true })
              .eq("tournament_id", reg.tournament_id)
              .eq("payment_status", "confirmed");
            slotNumber = (count ?? 0) + 1;
          }
        }

        const { error: regError } = await supabaseAdmin
          .from("registrations")
          .update({
            payment_status: parsed.status,
            slot_status: confirmed ? "guaranteed" : "reserved",
            ...(slotNumber !== null ? { slot_number: slotNumber } : {}),
          })
          .eq("id", registrationId);
        if (regError) return json({ error: regError.message }, 500);

        return json({
          ok: true,
          registration_id: registrationId,
          status: parsed.status,
          slot_number: slotNumber,
        });
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
