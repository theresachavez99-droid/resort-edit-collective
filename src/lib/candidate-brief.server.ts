/**
 * Aesthetic-first candidate briefs.
 *
 * Workflow reversal: instead of picking products and scoring after,
 * we generate three differentiated luxury briefs FIRST (destination
 * energy, color story, silhouette strategy, accessory ecosystem,
 * luxury traveler persona). The product assembler is then biased to
 * support the brief.
 *
 * All three briefs are generated in a single AI call so the model
 * can deliberately differentiate them.
 */
import type { LookDNA } from "@/data/lookDNA";

export type CandidateBrief = {
  variant: string;
  title: string;                  // e.g. "Mediterranean Maximalist"
  destination_energy: string;     // 1-2 sentences, editorial voice
  color_story: {
    palette: string[];            // 3-5 hex strings
    narrative: string;            // why this palette for this destination
  };
  silhouette_strategy: string;    // proportions, drape, layering
  accessory_ecosystem: string;    // jewelry mood, bag mood, eyewear era
  luxury_traveler_persona: string; // who she is, what she'd save
  styling_keywords: string[];     // matched against product names/categories
  brand_priorities: string[];     // brands the brief leans on
};

const FALLBACK_PALETTES: Array<string[]> = [
  ["#0F4C5C", "#E36414", "#FB8B24", "#F5E6CA"],
  ["#1B2A41", "#324A5F", "#C8B273", "#F2EFE9"],
  ["#7C2D12", "#C77B5A", "#E7CBA9", "#FAF3E7"],
];

/**
 * Generate `count` differentiated briefs for a Look DNA in one AI call.
 * Falls back to a deterministic local brief if the gateway is unavailable
 * so the orchestrator never blocks.
 */
export async function generateCandidateBriefs(
  dna: LookDNA,
  variants: string[],
): Promise<CandidateBrief[]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return variants.map((v, i) => fallbackBrief(dna, v, i));

  const system = `You are the fashion director for Resort Edit, a luxury destination styling platform. You write briefs for a luxury personal shopper — destination energy, color story, silhouette strategy, accessory ecosystem, and traveler persona. Never describe products; describe the AESTHETIC the products will serve.`;

  const user = `LOOK DNA
Destination: ${dna.destination}
Activity: ${dna.activity}
Mood: ${dna.mood}
Palette cues: ${dna.palette.join(", ")}
Silhouette: ${dna.silhouette}
Print language: ${dna.printLanguage}
Resort energy: ${dna.resortEnergy}
Styling notes: ${dna.stylingNotes.join("; ")}
Hero piece: ${dna.heroPiece ?? "n/a"}
Target brands: ${(dna.targetBrands ?? []).join(", ") || "—"}
${dna.avoidCues?.length ? `\nANTI-CUES (a brief that drifts toward any of these FAILS): ${dna.avoidCues.join("; ")}` : ""}
${dna.museEnvironmentCues?.length ? `\nEnvironment cues (must evoke): ${dna.museEnvironmentCues.join("; ")}` : ""}

TASK
Produce ${variants.length} MEANINGFULLY DIFFERENT luxury interpretations of this DNA. All must remain faithful to the destination + activity, but each must express a distinct luxury point of view rooted in this exact destination — not generic resort wear. Differentiate via color story, silhouette and accessory ecosystem. Do NOT describe products; describe the aesthetic.

EDITORIAL TEST: every brief must pass the question "Would a wealthy woman save this because she wants to dress like this in ${dna.destination}?" If the brief reads like generic luxury resortwear, safe neutrals, influencer aesthetic, or charter-yacht uniform, it FAILS. Bias toward destination specificity, editorial uniqueness, and emotional impact over safety.

Return strict JSON: { "briefs": [ { "title", "destination_energy", "color_story": { "palette": ["#hex", ...], "narrative" }, "silhouette_strategy", "accessory_ecosystem", "luxury_traveler_persona", "styling_keywords": [..], "brand_priorities": [..] }, ... ] } with exactly ${variants.length} briefs in order.`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { briefs?: Array<Partial<CandidateBrief>> };
    const out = (parsed.briefs ?? []).slice(0, variants.length).map((b, i) => normalizeBrief(b, variants[i], dna, i));
    while (out.length < variants.length) out.push(fallbackBrief(dna, variants[out.length], out.length));
    return out;
  } catch {
    return variants.map((v, i) => fallbackBrief(dna, v, i));
  }
}

function normalizeBrief(
  b: Partial<CandidateBrief>,
  variant: string,
  dna: LookDNA,
  i: number,
): CandidateBrief {
  const palette = Array.isArray(b.color_story?.palette) && b.color_story!.palette!.length
    ? b.color_story!.palette!.slice(0, 5)
    : FALLBACK_PALETTES[i % FALLBACK_PALETTES.length];
  return {
    variant,
    title: b.title?.toString().trim() || `${dna.name ?? dna.id} — variant ${variant}`,
    destination_energy: b.destination_energy?.toString().trim() || `${dna.mood} in ${dna.destination}.`,
    color_story: {
      palette,
      narrative: b.color_story?.narrative?.toString().trim() || dna.palette.join(", "),
    },
    silhouette_strategy: b.silhouette_strategy?.toString().trim() || dna.silhouette,
    accessory_ecosystem: b.accessory_ecosystem?.toString().trim() || dna.stylingNotes.join("; "),
    luxury_traveler_persona: b.luxury_traveler_persona?.toString().trim() || `Wealthy traveler in ${dna.destination}.`,
    styling_keywords: Array.isArray(b.styling_keywords) ? b.styling_keywords.slice(0, 12).map(String) : [],
    brand_priorities: Array.isArray(b.brand_priorities) && b.brand_priorities.length
      ? b.brand_priorities.slice(0, 8).map(String)
      : (dna.targetBrands ?? []).slice(0, 8),
  };
}

function fallbackBrief(dna: LookDNA, variant: string, i: number): CandidateBrief {
  const flavors = [
    { title: "Mediterranean Maximalist", energy: "Sun-bleached maximalism — gold-toned skin, layered jewelry, generous prints." },
    { title: "Polished Yacht Luxury", energy: "Crisp, restrained, monied — clean lines, ivory and navy, hardware that whispers." },
    { title: "Riviera Glamour", energy: "Cinematic Côte d'Azur — silk in motion, oversized sunglasses, gold cuffs." },
  ];
  const f = flavors[i % flavors.length];
  return {
    variant,
    title: `${f.title} — ${dna.destination}`,
    destination_energy: f.energy,
    color_story: {
      palette: FALLBACK_PALETTES[i % FALLBACK_PALETTES.length],
      narrative: dna.palette.join(", "),
    },
    silhouette_strategy: dna.silhouette,
    accessory_ecosystem: dna.stylingNotes.join("; "),
    luxury_traveler_persona: `Wealthy traveler arriving in ${dna.destination} for ${dna.activity}.`,
    styling_keywords: dna.stylingNotes,
    brand_priorities: dna.targetBrands ?? [],
  };
}

/** Compose a muse-image prompt from a brief + the actual assembled product list. */
export function museImagePrompt(
  dna: LookDNA,
  brief: CandidateBrief,
  products?: Array<{ slot: string; brand: string | null; product_name: string | null }>,
): string {
  const wardrobe = (products ?? [])
    .filter((p) => p.brand && p.product_name)
    .map((p) => `- ${p.slot}: ${p.brand} — ${p.product_name}`)
    .join("\n");
  return [
    `Editorial fashion photograph for Resort Edit, a luxury destination styling platform.`,
    `Destination: ${dna.destination}. Activity: ${dna.activity}.`,
    `Mood: ${brief.destination_energy}`,
    `Color story: ${brief.color_story.narrative} (palette ${brief.color_story.palette.join(", ")}).`,
    `Silhouette: ${brief.silhouette_strategy}.`,
    `Accessories: ${brief.accessory_ecosystem}.`,
    `Persona: ${brief.luxury_traveler_persona}`,
    dna.museEnvironmentCues?.length
      ? `Environment (must be visible in frame): ${dna.museEnvironmentCues.join("; ")}.`
      : "",
    wardrobe
      ? `WARDROBE FIDELITY — the muse MUST be wearing the following exact products. Reference images are supplied; preserve garment color, silhouette, print, and material faithfully. Do not substitute pieces:\n${wardrobe}`
      : "",
    dna.avoidCues?.length
      ? `Avoid at all costs: ${dna.avoidCues.join("; ")}.`
      : "",
    `Shot like Net-a-Porter / Moda Operandi editorial. Natural light, cinematic, magazine-quality, no text, no logos overlaid, no other people.`,
  ]
    .filter(Boolean)
    .join(" ");
}