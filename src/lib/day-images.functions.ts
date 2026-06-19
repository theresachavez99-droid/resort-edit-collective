import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

/**
 * Canonical Day Image system — server functions.
 *
 * Two-tier storage:
 *   - `canonical_day_images`  — founder-approved, public-readable, drives the live site.
 *   - `day_image_uploads`     — founder-uploaded staging queue, server-only.
 *
 * Public surfaces resolve `daySlug → image_url` via `loadCanonicalDayImageOverrides`,
 * which is called once from the root loader and provided to the React tree.
 * When no DB override exists, the TS `CANONICAL_DAY_IMAGES` fallback wins.
 *
 * Pending uploads (`image_source = 'founder_upload_pending'`) are NEVER
 * exposed to live rails — they're only readable through the admin
 * password-gated functions below.
 */

const DAY_SLUGS = ["day-1", "day-2", "day-3", "day-4", "day-5"] as const;
const DaySlug = z.enum(DAY_SLUGS);

export type DayImageOverrides = Record<string, string>;

/** PUBLIC — returns approved canonical overrides only. Called from root loader. */
export const loadCanonicalDayImageOverrides = createServerFn({ method: "GET" })
  .handler(async (): Promise<DayImageOverrides> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("canonical_day_images")
      .select("day_slug,image_url");
    if (error) {
      console.error("[day-images] override load failed:", error.message);
      return {};
    }
    const out: DayImageOverrides = {};
    for (const row of data ?? []) {
      if (typeof row.day_slug === "string" && typeof row.image_url === "string") {
        out[row.day_slug] = row.image_url;
      }
    }
    return out;
  });

/* ---------- Admin: list ---------- */

export type StagedUpload = {
  id: string;
  day_slug: string;
  image_url: string;
  image_source: string;
  original_filename: string | null;
  status: string;
  created_at: string;
  notes: string | null;
};

export type CanonicalRow = {
  day_slug: string;
  image_url: string;
  image_source: string;
  original_filename: string | null;
  approved_at: string;
  updated_at: string;
  notes: string | null;
};

const PasswordOnly = z.object({ password: z.string().min(1).max(200) });

export const listDayImagesAdmin = createServerFn({ method: "POST" })
  .inputValidator((i) => PasswordOnly.parse(i))
  .handler(async ({ data }): Promise<{
    canonical: Record<string, CanonicalRow>;
    staged: Record<string, StagedUpload[]>;
  }> => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [canonicalRes, stagedRes] = await Promise.all([
      supabaseAdmin.from("canonical_day_images").select("*"),
      supabaseAdmin
        .from("day_image_uploads")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);
    if (canonicalRes.error) throw new Error(canonicalRes.error.message);
    if (stagedRes.error) throw new Error(stagedRes.error.message);

    const canonical: Record<string, CanonicalRow> = {};
    for (const r of canonicalRes.data ?? []) canonical[r.day_slug] = r as CanonicalRow;

    const staged: Record<string, StagedUpload[]> = {};
    for (const slug of DAY_SLUGS) staged[slug] = [];
    for (const r of stagedRes.data ?? []) {
      const slug = r.day_slug as string;
      (staged[slug] ??= []).push(r as StagedUpload);
    }
    return { canonical, staged };
  });

/* ---------- Admin: upload ---------- */

const UploadInput = z.object({
  password: z.string().min(1).max(200),
  day_slug: DaySlug,
  filename: z.string().min(1).max(120),
  content_type: z.enum(["image/png", "image/jpeg", "image/webp"]),
  data_base64: z.string().min(1).max(20_000_000), // ~15 MB base64 -> 11 MB raw
  notes: z.string().max(500).optional(),
});

function decodeBase64(s: string): Uint8Array {
  const clean = s.includes(",") ? s.slice(s.indexOf(",") + 1) : s;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export const uploadStagedDayImage = createServerFn({ method: "POST" })
  .inputValidator((i) => UploadInput.parse(i))
  .handler(async ({ data }): Promise<StagedUpload> => {
    requireAdmin(data.password);
    const { uploadDayImageBytes } = await import("./day-images.server");
    const bytes = decodeBase64(data.data_base64);
    const { signedUrl } = await uploadDayImageBytes({
      daySlug: data.day_slug,
      filename: data.filename,
      contentType: data.content_type,
      bytes,
    });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("day_image_uploads")
      .insert({
        day_slug: data.day_slug,
        image_url: signedUrl,
        image_source: "founder_upload_pending",
        original_filename: data.filename,
        status: "pending",
        notes: data.notes ?? null,
      })
      .select("*")
      .single();
    if (error || !inserted) throw new Error(error?.message ?? "insert failed");
    return inserted as StagedUpload;
  });

/* ---------- Admin: approve / reject / clear ---------- */

const Action = z.object({
  password: z.string().min(1).max(200),
  id: z.string().uuid(),
});

export const approveStagedDayImage = createServerFn({ method: "POST" })
  .inputValidator((i) => Action.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: staged, error: loadErr } = await supabaseAdmin
      .from("day_image_uploads")
      .select("*")
      .eq("id", data.id)
      .single();
    if (loadErr || !staged) throw new Error(loadErr?.message ?? "staged row not found");
    if (staged.status !== "pending") throw new Error("Already actioned");

    const { error: upsertErr } = await supabaseAdmin
      .from("canonical_day_images")
      .upsert(
        {
          day_slug: staged.day_slug,
          image_url: staged.image_url,
          image_source: "canonical_day_image",
          original_filename: staged.original_filename,
          notes: staged.notes,
          approved_at: new Date().toISOString(),
        },
        { onConflict: "day_slug" },
      );
    if (upsertErr) throw new Error(upsertErr.message);

    // Mark approved (audit trail). Sibling pending uploads stay pending so
    // the founder can still revert by approving an older one.
    const { error: updErr } = await supabaseAdmin
      .from("day_image_uploads")
      .update({ status: "approved" })
      .eq("id", data.id);
    if (updErr) throw new Error(updErr.message);
    return { ok: true as const, day_slug: staged.day_slug };
  });

export const rejectStagedDayImage = createServerFn({ method: "POST" })
  .inputValidator((i) => Action.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("day_image_uploads")
      .update({ status: "rejected" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

const ClearInput = z.object({
  password: z.string().min(1).max(200),
  day_slug: DaySlug,
});

export const clearCanonicalDayImage = createServerFn({ method: "POST" })
  .inputValidator((i) => ClearInput.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("canonical_day_images")
      .delete()
      .eq("day_slug", data.day_slug);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });