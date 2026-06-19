/**
 * Day-image storage helpers (SERVER ONLY).
 *
 * Uploads founder PNG/JPEG bytes to the private `day-images` Supabase
 * Storage bucket and returns a long-lived signed URL. The signed URL is
 * what gets stored in `canonical_day_images.image_url` /
 * `day_image_uploads.image_url`, so live rails never need to mint a new
 * URL at render.
 */

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const ONE_YEAR_SEC = 60 * 60 * 24 * 365;

function safeBasename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export async function uploadDayImageBytes(opts: {
  daySlug: string;
  filename: string;
  contentType: string;
  bytes: Uint8Array;
}): Promise<{ signedUrl: string; storagePath: string }> {
  if (!ALLOWED_MIME.has(opts.contentType)) {
    throw new Error(`Unsupported image type: ${opts.contentType}`);
  }
  if (opts.bytes.byteLength > 10 * 1024 * 1024) {
    throw new Error("Image exceeds 10 MB limit");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `${opts.daySlug}/${Date.now()}-${safeBasename(opts.filename)}`;
  const { error: upErr } = await supabaseAdmin.storage
    .from("day-images")
    .upload(path, opts.bytes, { contentType: opts.contentType, upsert: false });
  if (upErr) throw new Error(`upload failed: ${upErr.message}`);

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from("day-images")
    .createSignedUrl(path, ONE_YEAR_SEC);
  if (signErr || !signed?.signedUrl) {
    throw new Error(`sign failed: ${signErr?.message ?? "no url"}`);
  }
  return { signedUrl: signed.signedUrl, storagePath: path };
}