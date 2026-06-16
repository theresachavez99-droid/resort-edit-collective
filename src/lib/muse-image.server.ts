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
  /** Product reference images — the muse must wear these. First-class for outfit fidelity. */
  productImageUrls?: string[];
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
    ? "google/gemini-3-pro-image-preview"
    : "openai/gpt-image-2";

  // Compose the identity-locked prompt when a reference muse is present.
  const finalPrompt = useRef
    ? [
        opts.museName ? `Subject: the recurring muse "${opts.museName}".` : "",
        opts.faceDescription ? `Identity lock: ${opts.faceDescription}` : "",
        opts.guardrails ? `Guardrails: ${opts.guardrails}` : "",
        "The FIRST supplied image is the identity-lock reference — preserve face, skin tone, hair color, age, and body proportions EXACTLY. Do NOT generate a different woman.",
        opts.productImageUrls && opts.productImageUrls.length
          ? `The REMAINING supplied images are the wardrobe — the muse must wear these exact garments and accessories. Match color, silhouette, print, and material faithfully. If the product is a printed trouser, she wears printed trousers; if it is a green one-piece, she wears that exact green one-piece.`
          : "",
        "Only outfit styling, hairstyle styling, expression, pose, and environment may vary from the identity reference. NEVER swap identity.",
        prompt,
      ]
        .filter(Boolean)
        .join("\n\n")
    : prompt;

  const productImages = (opts.productImageUrls ?? []).filter(Boolean).slice(0, 8);

  const body = useRef
    ? {
        model,
        modalities: ["image", "text"],
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: opts.referenceUrl } },
              ...productImages.map((u) => ({ type: "image_url", image_url: { url: u } })),
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

/**
 * Vision verification — compare the generated muse against the Lilla reference
 * (and the assembled product list) and return a strict JSON verdict.
 *
 * Returns face_similarity 0-1 and outfit_fidelity 0-1. The gate fails the
 * candidate when face_similarity < 0.75 or outfit_fidelity < 0.7.
 */
export type MuseVerification = {
  face_similarity: number;
  outfit_fidelity: number;
  notes: string;
  identity_mismatch_reason: string | null;
  outfit_mismatch_reason: string | null;
};

export async function verifyMuseFidelity(
  museUrl: string,
  referenceUrl: string,
  museName: string,
  productSummary: string,
): Promise<MuseVerification> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    return {
      face_similarity: 0,
      outfit_fidelity: 0,
      notes: "LOVABLE_API_KEY missing — verification skipped",
      identity_mismatch_reason: "verification unavailable",
      outfit_mismatch_reason: "verification unavailable",
    };
  }

  const system = `You are a strict editorial verification model for a luxury styling platform. You compare two images: an identity reference and a generated muse. Return ONLY valid JSON.`;
  const user = `IDENTITY REFERENCE: image 1 is "${museName}", the recurring muse for this destination. Her face, skin tone, hair color, age, and body proportions must be preserved across every generation.

GENERATED MUSE: image 2 is a newly generated editorial image that should depict "${museName}" wearing the products below.

ASSEMBLED PRODUCTS (the muse MUST be wearing these — wardrobe fidelity):
${productSummary}

TASK
1. face_similarity: 0.0 to 1.0 — how closely does image 2 depict the SAME woman as image 1? Score 1.0 if it could be the same person; score 0.0 if it is clearly a different woman. Be strict: different face shape, different hair color, different ethnicity, different age range → score below 0.5.
2. outfit_fidelity: 0.0 to 1.0 — does the outfit on image 2 reflect the assembled products above? Score 1.0 if every major piece (garment, shoes, bag, key jewelry) is recognizably present and correct in color / silhouette / print. Score below 0.6 if any major piece is missing or visibly different.
3. notes: 1-2 sentence editorial summary.
4. identity_mismatch_reason: short reason if face_similarity < 0.85, else null.
5. outfit_mismatch_reason: short reason if outfit_fidelity < 0.85, else null.

Return strict JSON: { "face_similarity": number, "outfit_fidelity": number, "notes": string, "identity_mismatch_reason": string|null, "outfit_mismatch_reason": string|null }`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: referenceUrl } },
              { type: "image_url", image_url: { url: museUrl } },
              { type: "text", text: user },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`verify gateway ${res.status}`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as Partial<MuseVerification>;
    return {
      face_similarity: clamp01(Number(parsed.face_similarity ?? 0)),
      outfit_fidelity: clamp01(Number(parsed.outfit_fidelity ?? 0)),
      notes: String(parsed.notes ?? ""),
      identity_mismatch_reason: parsed.identity_mismatch_reason ?? null,
      outfit_mismatch_reason: parsed.outfit_mismatch_reason ?? null,
    };
  } catch (e) {
    return {
      face_similarity: 0,
      outfit_fidelity: 0,
      notes: `verification failed: ${String((e as Error).message ?? e).slice(0, 160)}`,
      identity_mismatch_reason: "verification error",
      outfit_mismatch_reason: "verification error",
    };
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}