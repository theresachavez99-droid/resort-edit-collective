/**
 * Muse image generation for a candidate.
 *
 * Calls the Lovable AI image generation gateway (non-streaming), uploads
 * the PNG to the private `muse-previews` storage bucket, and returns a
 * long-lived signed URL stored on `look_candidates.muse_image_url`.
 *
 * Mandatory: a candidate without a muse image is held in `pending_muse`
 * and never shown to the reviewer.
 */
export async function generateAndStoreMuse(
  candidateId: string,
  prompt: string,
): Promise<{ url: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-image-2",
      prompt,
      quality: "low",
      size: "1024x1024",
      n: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`image gateway ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { data?: Array<{ b64_json?: string }> };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error("image gateway returned no image");

  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `${candidateId}/${Date.now()}.png`;
  const { error: upErr } = await supabaseAdmin.storage
    .from("muse-previews")
    .upload(path, bytes, { contentType: "image/png", upsert: true });
  if (upErr) throw new Error(`muse upload failed: ${upErr.message}`);

  // Long-lived signed URL (1 year). Bucket is private; only admin tool views it.
  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from("muse-previews")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signErr || !signed?.signedUrl) throw new Error(`muse sign failed: ${signErr?.message ?? "no url"}`);

  return { url: signed.signedUrl };
}