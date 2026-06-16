/**
 * Editorial AI helpers for published Resort Edit looks.
 * Server-only. Called best-effort from approveLook.
 */
import type { LookDNA } from "@/data/lookDNA";

type Slot = { slot: string; brand: string | null; product_name: string | null; retailer: string | null };

export type EditorialPayload = {
  why_it_works: string;
  best_for: string[];
  resort_edit_tip: string;
  pack_instead_of: string;
  whats_in_her_bag: Array<{ item: string; note: string }>;
};

export type ReplacementPick = {
  brand: string;
  product_name: string;
  retailer: string | null;
  price: number | null;
  image_url: string | null;
  url: string;
};

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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function generateEditorial(dna: LookDNA, slots: Slot[]): Promise<EditorialPayload> {
  const system = `You are the fashion director at Resort Edit, a destination styling platform for wealthy travelers.
You write editorial copy with the tone of Net-a-Porter PORTER magazine, Moda Operandi styling notes, and the personal touch of Steven Dann.
Never sound like a product description. Never say "this look features". Write like you are whispering advice to a client packing for a private villa.
Return strict JSON only.`;

  const outfit = slots
    .filter((s) => s.brand)
    .map((s) => `- ${s.slot}: ${s.brand} ${s.product_name ?? ""}`.trim())
    .join("\n");

  const user = `LOOK
Destination: ${dna.destination}
Activity: ${dna.activity}
Mood: ${dna.mood}
Palette: ${dna.palette.join(", ")}
Print language: ${dna.printLanguage}
Resort energy: ${dna.resortEnergy}
Silhouette: ${dna.silhouette}

OUTFIT
${outfit}

Write four editorial sections + the contents of her bag. Return strict JSON:
{
  "why_it_works": "2-4 sentences. Reference destination, color story, accessory strategy, the specific reason this combination is correct for ${dna.destination}.",
  "best_for": ["3-5 short phrases — specific moments she would wear this, e.g. 'Beach Club Lunch at La Spiaggetta'"],
  "resort_edit_tip": "1-2 sentences of styling advice — sleeve roll, hair direction, swap suggestion, scarf knot. Specific and tactile.",
  "pack_instead_of": "1-2 sentences. What does she leave at home because of this? Frame as 'pack X instead of Y'.",
  "whats_in_her_bag": [
    { "item": "specific item", "note": "1 short line — why she carries it for ${dna.destination}" }
  ]
}

The bag should hold 6-9 items. Wealthy traveler logic — not a product dump. Think: SPF, silk hair scarf, hotel key, travel fragrance, lip balm, espresso cash, paperback. Destination-specific where it matters.`;

  const raw = (await callGemini(system, user)) as Partial<EditorialPayload>;
  return {
    why_it_works: typeof raw.why_it_works === "string" ? raw.why_it_works : "",
    best_for: Array.isArray(raw.best_for) ? raw.best_for.filter((x): x is string => typeof x === "string").slice(0, 6) : [],
    resort_edit_tip: typeof raw.resort_edit_tip === "string" ? raw.resort_edit_tip : "",
    pack_instead_of: typeof raw.pack_instead_of === "string" ? raw.pack_instead_of : "",
    whats_in_her_bag: Array.isArray(raw.whats_in_her_bag)
      ? raw.whats_in_her_bag
          .filter((x): x is { item: string; note: string } => !!x && typeof x.item === "string")
          .slice(0, 10)
      : [],
  };
}

/**
 * Pick 3 stylist replacements for a vault product from a pool of eligible
 * sourced products in the same slot. Returns canonical replacement records.
 */
export async function pickReplacements(
  dna: LookDNA,
  product: { brand: string; product_name: string; slot: string },
  pool: Array<{ id: string; brand: string | null; product_name: string | null; retailer_domain: string | null; price: number | null; image_url: string | null; source_url: string; affiliate_url: string | null }>,
): Promise<ReplacementPick[]> {
  if (pool.length === 0) return [];
  const cleaned = pool
    .filter((p) => p.brand && p.product_name && p.image_url)
    .slice(0, 24)
    .map((p) => ({
      id: p.id,
      brand: p.brand!,
      product_name: p.product_name!,
      retailer: p.retailer_domain ?? "",
      price: p.price ?? null,
      url: p.affiliate_url ?? p.source_url,
      image_url: p.image_url ?? "",
    }));
  if (cleaned.length === 0) return [];

  const system = `You are Resort Edit's stylist. From a candidate pool, pick the 3 best replacements for a slot when the primary product sells out. The replacements MUST match the look's destination, activity, palette, and silhouette. Return strict JSON only — no commentary.`;
  const user = `LOOK DNA
Destination: ${dna.destination}
Activity: ${dna.activity}
Mood: ${dna.mood}
Palette: ${dna.palette.join(", ")}
Silhouette: ${dna.silhouette}

PRIMARY ${product.slot.toUpperCase()}
${product.brand} — ${product.product_name}

CANDIDATE POOL (id, brand — name)
${cleaned.map((c) => `${c.id} :: ${c.brand} — ${c.product_name}`).join("\n")}

Return: { "ids": ["id1", "id2", "id3"] } — exactly 3 ids from the pool, ranked best to third-best.`;

  const raw = (await callGemini(system, user)) as { ids?: unknown };
  const ids = Array.isArray(raw.ids) ? raw.ids.filter((x): x is string => typeof x === "string") : [];
  const map = new Map(cleaned.map((c) => [c.id, c]));
  const picked: ReplacementPick[] = [];
  for (const id of ids) {
    const m = map.get(id);
    if (!m) continue;
    picked.push({
      brand: m.brand,
      product_name: m.product_name,
      retailer: m.retailer || null,
      price: m.price,
      image_url: m.image_url || null,
      url: m.url,
    });
    if (picked.length === 3) break;
  }
  // Top up with first cleaned entries if AI returned fewer than 3
  for (const c of cleaned) {
    if (picked.length === 3) break;
    if (ids.includes(c.id)) continue;
    picked.push({
      brand: c.brand,
      product_name: c.product_name,
      retailer: c.retailer || null,
      price: c.price,
      image_url: c.image_url || null,
      url: c.url,
    });
  }
  return picked.slice(0, 3);
}

/** Slug from dna_id + variant — URL-safe, stable. */
export function lookSlug(dnaId: string, variant: string): string {
  return `${dnaId}-${variant}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}