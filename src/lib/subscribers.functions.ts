import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./admin-auth.server";

/**
 * Newsletter capture.
 *
 * Delivery honesty: Resort Edit has no sender domain / email provider
 * configured yet, so nothing is sent to subscribers. Rows are therefore
 * stamped welcome_state='blocked_no_provider' and the public UI never
 * promises an inbox. When a provider is configured, flip DELIVERY_CONFIGURED
 * and enqueue from the same place — historical rows stay untouched.
 */
export const DELIVERY_CONFIGURED = false;

const GENERIC_ERROR = "We couldn't save your email just now. Please try again.";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().min(6).max(255).email(),
  source_page: z.string().trim().max(500).optional(),
  destination: z.string().trim().max(64).optional(),
  cta_source: z.string().trim().max(64).optional(),
  tags: z.array(z.string().max(64)).max(20).optional(),
});

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean; reactivated?: boolean; delivery: "none" | "queued" }
  | { ok: false; error: string };

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => subscribeSchema.parse(input))
  .handler(async ({ data }): Promise<SubscribeResult> => {
    const nowIso = new Date().toISOString();
    const welcome_state = DELIVERY_CONFIGURED ? "pending" : "blocked_no_provider";
    const delivery = DELIVERY_CONFIGURED ? ("queued" as const) : ("none" as const);

    // email is citext → matching is case-insensitive, so no duplicate contacts.
    const existingRes = await supabaseAdmin
      .from("subscribers")
      .select("id,status")
      .eq("email", data.email)
      .maybeSingle();

    if (existingRes.error) {
      console.error("[subscribeEmail] lookup failed", existingRes.error.message);
      return { ok: false, error: GENERIC_ERROR };
    }

    const existing = existingRes.data;
    if (existing) {
      if (existing.status !== "unsubscribed") {
        // Already on the list — never disclose membership details beyond this.
        return { ok: true, alreadySubscribed: true, delivery: "none" };
      }
      // They opted out before and are opting in again: record fresh consent.
      const reactivate = await supabaseAdmin
        .from("subscribers")
        .update({
          status: "active",
          unsubscribed_at: null,
          reactivated_at: nowIso,
          consent_at: nowIso,
          consent_source: data.cta_source ?? null,
          source_page: data.source_page ?? null,
          welcome_state,
        })
        .eq("id", existing.id)
        .select("id")
        .maybeSingle();

      if (reactivate.error || !reactivate.data) {
        console.error(
          "[subscribeEmail] reactivation failed",
          reactivate.error?.message ?? "no row updated",
        );
        return { ok: false, error: GENERIC_ERROR };
      }
      return { ok: true, alreadySubscribed: false, reactivated: true, delivery };
    }

    const insert = await supabaseAdmin
      .from("subscribers")
      .insert({
        email: data.email,
        source_page: data.source_page ?? null,
        destination: data.destination ?? null,
        cta_source: data.cta_source ?? null,
        consent_source: data.cta_source ?? null,
        consent_at: nowIso,
        tags: data.tags ?? [],
        status: "active",
        welcome_state,
      })
      .select("id")
      .maybeSingle();

    if (insert.error) {
      // Concurrent submit of the same address → unique violation is a success.
      if (insert.error.code === "23505") {
        return { ok: true, alreadySubscribed: true, delivery: "none" };
      }
      console.error("[subscribeEmail] insert failed", insert.error.message);
      return { ok: false, error: GENERIC_ERROR };
    }
    if (!insert.data) {
      console.error("[subscribeEmail] insert returned no row");
      return { ok: false, error: GENERIC_ERROR };
    }
    return { ok: true, alreadySubscribed: false, delivery };
  });

/** Honest, non-sensitive delivery status for the admin subscriber desk. */
export const getNewsletterDeliveryStatus = createServerFn({ method: "GET" }).handler(async () => ({
  deliveryConfigured: DELIVERY_CONFIGURED,
  blockedReason: DELIVERY_CONFIGURED
    ? null
    : "No sender domain or email provider is connected, so no welcome emails or editions can be sent yet. Capture is live and every signup is stored.",
  requiredSetup: DELIVERY_CONFIGURED
    ? null
    : "Connect a sender domain you own (e.g. notify.resortedit.com) in Cloud → Emails, then wire welcome sends to it.",
}));


// ───────────────────────────────────────────────────────
// Admin-only management functions
// Gated by server-side ADMIN_PASSWORD (see admin-auth.server.ts).
// ───────────────────────────────────────────────────────

export const listSubscribers = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: rows, error } = await supabaseAdmin
      .from("subscribers")
      .select(
        "id,email,source_page,destination,cta_source,status,tags,notes,unsubscribed_at,created_at,updated_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { subscribers: rows ?? [] };
  });

export const updateSubscriber = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        id: z.string().uuid(),
        status: z.enum(["active", "unsubscribed"]).optional(),
        tags: z.array(z.string().trim().max(64)).max(20).optional(),
        notes: z.string().max(2000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const patch: {
      status?: "active" | "unsubscribed";
      unsubscribed_at?: string | null;
      tags?: string[];
      notes?: string | null;
    } = {};
    if (data.status !== undefined) {
      patch.status = data.status;
      patch.unsubscribed_at =
        data.status === "unsubscribed" ? new Date().toISOString() : null;
    }
    if (data.tags !== undefined) patch.tags = data.tags;
    if (data.notes !== undefined) patch.notes = data.notes;
    const { error } = await supabaseAdmin
      .from("subscribers")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });