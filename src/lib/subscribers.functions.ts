import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const subscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(255)
    .email(),
  source_page: z.string().trim().max(500).optional(),
  destination: z.string().trim().max(64).optional(),
  cta_source: z.string().trim().max(64).optional(),
  tags: z.array(z.string().max(64)).max(20).optional(),
});

export const subscribeEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => subscribeSchema.parse(input))
  .handler(async ({ data }) => {
    // Check for existing subscriber first (citext = case-insensitive)
    const { data: existing } = await supabaseAdmin
      .from("subscribers")
      .select("id,status")
      .eq("email", data.email)
      .maybeSingle();

    if (existing) {
      // If they had unsubscribed, reactivate.
      if (existing.status === "unsubscribed") {
        await supabaseAdmin
          .from("subscribers")
          .update({ status: "active", unsubscribed_at: null })
          .eq("id", existing.id);
        return { ok: true as const, alreadySubscribed: false, reactivated: true };
      }
      return { ok: true as const, alreadySubscribed: true };
    }

    const { error } = await supabaseAdmin.from("subscribers").insert({
      email: data.email,
      source_page: data.source_page ?? null,
      destination: data.destination ?? null,
      cta_source: data.cta_source ?? null,
      tags: data.tags ?? [],
      status: "active",
    });

    if (error) {
      // Unique-violation race condition → treat as duplicate success.
      if (error.code === "23505") {
        return { ok: true as const, alreadySubscribed: true };
      }
      return { ok: false as const, error: "Couldn't save your email. Please try again." };
    }
    return { ok: true as const, alreadySubscribed: false };
  });

// ───────────────────────────────────────────────────────
// Admin-only management functions
// Gated by shared password header (matches /admin/product-library).
// ───────────────────────────────────────────────────────

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || "resortedit2026";

function requireAdmin(password: string | undefined) {
  if (!password || password !== ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }
}

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
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) {
      patch.status = data.status;
      patch.unsubscribed_at = data.status === "unsubscribed" ? new Date().toISOString() : null;
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