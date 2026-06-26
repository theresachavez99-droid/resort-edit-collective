/**
 * Stylist Engine v4.5 — Editorial copy rewriter.
 *
 * Single batched Gemini call that rewrites every look's title, subtitle,
 * and description into experiential, place-based prose. Banned phrases
 * are stripped post-hoc as a safety net.
 */

export const BANNED_PHRASES = [
  "celebrating textures",
  "celebrates textures",
  "a study in",
  "this look emphasizes",
  "this look celebrates",
  "exploration of",
  "embodies",
  "captures the essence",
  "an ode to",
  "a love letter to",
  "speaks to",
  "perfect for any occasion",
  "effortlessly",
];

export function containsBannedPhrase(text: string): string | null {
  const t = text.toLowerCase();
  for (const p of BANNED_PHRASES) if (t.includes(p)) return p;
  return null;
}

export function stripBannedPhrases(text: string): string {
  let out = text;
  for (const p of BANNED_PHRASES) {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, "").replace(/\s{2,}/g, " ").replace(/\s+([.,;:])/g, "$1");
  }
  return out.trim();
}

type LookInput = {
  index: number;
  roleLabel: string;
  archetype: string;
  mood: string;
  personality: string;
  colorDirection: string[];
  hero: boolean;
  hookProducts: string[]; // e.g. ["Vix Firenze bandeau one-piece", "Aranaz raffia tote"]
};

type LookOutput = { index: number; title: string; subtitle: string; description: string };

async function callGemini(system: string, user: string): Promise<unknown> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
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
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  try {
    return JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
  } catch {
    return {};
  }
}

export async function rewriteCollectionCopy(args: {
  destination: string;
  activity: string;
  looks: LookInput[];
}): Promise<LookOutput[]> {
  if (args.looks.length === 0) return [];
  const system = `You are a luxury fashion editor at Resort Edit. You write the kind of editorial copy that appears under photographs in PORTER or Vogue Italia. Your voice is sensory, specific, and place-based — never generic, never AI-flavored.

FORBIDDEN PHRASES (never use, in any tense): ${BANNED_PHRASES.join(" / ")}.
Other forbidden patterns: "perfect for", "must-have", "elevated", "curated", "timeless", "versatile", any sentence starting with the look's title.

Write so the reader can smell the bay and hear the rigging. Reference the moment, not the merchandise.`;

  const lookLines = args.looks
    .map(
      (l) =>
        `Look ${l.index + 1} — ${l.roleLabel}${l.hero ? " (HERO)" : ""}
    Mood: ${l.mood}
    Personality: ${l.personality}
    Archetype: ${l.archetype}
    Color direction: ${l.colorDirection.join(", ")}
    Hook products: ${l.hookProducts.slice(0, 3).join(" | ")}`,
    )
    .join("\n\n");

  const user = `DESTINATION: ${args.destination}
ACTIVITY: ${args.activity}

Write copy for ${args.looks.length} looks below. Each look gets:
- title: 2–5 words, evocative, never restates the role label
- subtitle: one short editorial line (≤ 12 words)
- description: 2 sentences. First sentence describes the felt moment — where she is, what she sees, what the look does. Second sentence names the one styling decision that makes the look memorable (e.g. "The bandeau hardware does all the talking — everything else fades to ivory.").

EXAMPLES of the voice we want:
- "The kind of look that lingers over lunch in San Fruttuoso before drifting back toward Portofino."
- "A sculptural swimsuit layered with crisp linen for stepping from the yacht to the harbor."
- "Late sun on the teak, the bay turning copper — the print earns its keep here."

${lookLines}

Return strict JSON: { "looks": [{ "index": 0, "title": "...", "subtitle": "...", "description": "..." }] }`;

  const raw = (await callGemini(system, user)) as { looks?: unknown };
  const looksArr = Array.isArray(raw.looks) ? raw.looks : [];
  const out: LookOutput[] = [];
  for (const item of looksArr) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const idx = typeof o.index === "number" ? o.index : null;
    if (idx === null) continue;
    out.push({
      index: idx,
      title: stripBannedPhrases(typeof o.title === "string" ? o.title : ""),
      subtitle: stripBannedPhrases(typeof o.subtitle === "string" ? o.subtitle : ""),
      description: stripBannedPhrases(typeof o.description === "string" ? o.description : ""),
    });
  }
  return out;
}
