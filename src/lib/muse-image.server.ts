/**
 * Muse image generation for a candidate.
 *
 * When a `referenceUrl` is provided (the destination's recurring muse like
 * Lilla for Portofino), we route through Gemini's image-preview model with
 * the reference image bound into the request so the model preserves facial
 * structure, skin tone, age, and body proportions across every look — only
 * outfit / hairstyle / pose / environment may change.
 *
 * Without a reference we fall back to OpenAI gpt-image-2 (no continuity).
 *
 * Mandatory: a candidate without a muse image fails the quality gate and
 * never enters the review queue.
 */
export type MuseOptions = {
  referenceUrl?: string | null;
  museName?: string | null;
  faceDescription?: string | null;
  guardrails?: string | null;
};

export type MuseResult = {
  url: string;
  model_used: string;
  identity_locked: boolean;
  reference_used: string | null;
};

export async function generateAndStoreMuse(
  candidateId: string,
  prompt: string,
  opts: MuseOptions = {},
): Promise<MuseResult> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");

  const useRef = !!opts.referenceUrl;
  const model = useRef
    ? "google/gemini-3.1-flash-image-preview"
    : "openai/gpt-image-2";

  // Compose the identity-locked prompt when a reference muse is present.
  const finalPrompt = useRef
    ? [
        opts.museName ? `Subject: the recurring muse "${opts.museName}".` : "",
        opts.faceDescription ? `Identity lock: ${opts.faceDescription}` : "",
        opts.guardrails ? `Guardrails: ${opts.guardrails}` : "",
        "Use the supplied reference image strictly for identity (face, skin tone, age range, body proportions, overall appearance). Do NOT change identity. Only outfit, accessories, hairstyle styling, expression, pose, and environment may vary.",
        prompt,
      ]
        .filter(Boolean)
        .join("\n\n")
    : prompt;

  const body = useRef
    ? {
        model,
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: opts.referenceUrl } },
              { type: "text", text: finalPrompt },
            ],
          },
        ],
      }
    : {
        model,
        prompt: finalPrompt,
        quality: "low",
        size: "1024x1024",
        n: 1,
      };

  const endpoint = useRef
    ? "https://ai.gateway.lovable.dev/v1/chat/completions"
    : "https://ai.gateway.lovable.dev/v1/images/generations";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`image gateway ${res.status}: ${text.slice(0, 200)}`);
  }

  // Extract b64 — OpenAI shape: data[0].b64_json. Gemini-via-chat shape:
  // choices[0].message.images[0].image_url.url with a data: URI, OR
  // content parts with type "image_url".
  let b64: string | null = null;
  const json = (await res.json()) as Record<string, unknown>;
  if (useRef) {
    const choices = (json.choices as Array<{ message?: { images?: Array<{ image_url?: { url?: string } }>; content?: unknown } }>) || [];
    const msg = choices[0]?.message;
    const fromImages = msg?.images?.[0]?.image_url?.url;
    if (fromImages?.startsWith("data:")) b64 = fromImages.split(",")[1] ?? null;
    if (!b64 && Array.isArray(msg?.content)) {
      for (const part of msg.content as Array<{ type?: string; image_url?: { url?: string } }>) {
        const url = part?.image_url?.url;
        if (url?.startsWith("data:")) {
          b64 = url.split(",")[1] ?? null;
          break;
        }
      }
    }
  } else {
    const data = (json.data as Array<{ b64_json?: string }>) || [];
    b64 = data[0]?.b64_json ?? null;
  }

  if (!b64) throw new Error("image gateway returned no image data");

  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `${candidateId}/${Date.now()}.png`;
  const { error: upErr } = await supabaseAdmin.storage
    .from("muse-previews")
    .upload(path, bytes, { contentType: "image/png", upsert: true });
  if (upErr) throw new Error(`muse upload failed: ${upErr.message}`);

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from("muse-previews")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signErr || !signed?.signedUrl) {
    throw new Error(`muse sign failed: ${signErr?.message ?? "no url"}`);
  }

  return {
    url: signed.signedUrl,
    model_used: model,
    identity_locked: useRef,
    reference_used: opts.referenceUrl ?? null,
  };
}