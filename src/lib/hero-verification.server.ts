/**
 * AFFIRMATIVE HERO VERIFICATION (server only)
 *
 * Asks a vision model for EXPLICIT positive statements about a generated Lilla
 * hero: is it the approved identity, is she wearing the exact linked products,
 * is the whole head / body / feet inside the frame. A missing field is never a
 * pass, and a numeric similarity score alone is never proof — the publish gates
 * require each boolean to be literally `true`.
 */
export type HeroAffirmations = {
  identityConfirmed: boolean | null;
  productsConfirmed: boolean | null;
  headInFrame: boolean | null;
  bodyInFrame: boolean | null;
  feetInFrame: boolean | null;
  identityScore: number | null;
  garmentScore: number | null;
  skinToneConsistent: boolean | null;
  notes: string | null;
  /** Populated when verification could not run at all. */
  unavailable: string | null;
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const bool = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);
const num = (v: unknown): number | null => (Number.isFinite(Number(v)) ? Number(v) : null);

export async function verifyHeroAffirmatively(input: {
  imageUrl: string;
  /** Approved identity references actually supplied as image pixels. */
  referenceUrls: readonly string[];
  productSummary: string;
}): Promise<HeroAffirmations> {
  const key = process.env["LOVABLE_API_KEY"];
  const blank: HeroAffirmations = {
    identityConfirmed: null,
    productsConfirmed: null,
    headInFrame: null,
    bodyInFrame: null,
    feetInFrame: null,
    identityScore: null,
    garmentScore: null,
    skinToneConsistent: null,
    notes: null,
    unavailable: null,
  };
  if (!key) return { ...blank, unavailable: "LOVABLE_API_KEY unavailable" };
  if (input.referenceUrls.length === 0) {
    return { ...blank, unavailable: "no approved identity reference supplied" };
  }

  const prompt = `The FIRST ${input.referenceUrls.length} image(s) are the approved reference(s) for the recurring muse "Lilla" — the butter-yellow-dress image is the controlling standard for her face, body proportions and warm golden-tan skin tone. The LAST image is a newly generated editorial photograph.

She must be wearing exactly these linked products:
${input.productSummary}

Answer each question independently and conservatively. If you cannot see something clearly, answer false.

Return strict JSON:
{
  "identity_confirmed": boolean,       // same woman as the reference: face, apparent age, hair identity
  "skin_tone_consistent": boolean,     // face, neck, arms, hands, legs share one warm golden-tan tone
  "products_confirmed": boolean,       // every listed product is recognizably worn
  "head_in_frame": boolean,            // the entire head and hair are inside the frame
  "body_in_frame": boolean,            // the whole body is inside the frame
  "feet_in_frame": boolean,            // feet/shoes are inside the frame
  "identity_score": number,            // 0..1
  "garment_score": number,             // 0..1
  "notes": string
}`;

  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a strict editorial verification model. You never assume; unverifiable claims are false. Return ONLY valid JSON.",
          },
          {
            role: "user",
            content: [
              ...input.referenceUrls.map((url) => ({ type: "image_url", image_url: { url } })),
              { type: "image_url", image_url: { url: input.imageUrl } },
              { type: "text", text: prompt },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return { ...blank, unavailable: `verification gateway ${res.status}` };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as Record<string, unknown>;
    return {
      identityConfirmed: bool(parsed["identity_confirmed"]),
      productsConfirmed: bool(parsed["products_confirmed"]),
      headInFrame: bool(parsed["head_in_frame"]),
      bodyInFrame: bool(parsed["body_in_frame"]),
      feetInFrame: bool(parsed["feet_in_frame"]),
      skinToneConsistent: bool(parsed["skin_tone_consistent"]),
      identityScore: num(parsed["identity_score"]),
      garmentScore: num(parsed["garment_score"]),
      notes: typeof parsed["notes"] === "string" ? (parsed["notes"] as string) : null,
      unavailable: null,
    };
  } catch (err) {
    return { ...blank, unavailable: `verification failed: ${err instanceof Error ? err.message : "unknown"}` };
  }
}
