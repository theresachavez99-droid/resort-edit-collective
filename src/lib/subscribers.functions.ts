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