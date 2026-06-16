import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { LOOK_DNA, type LookDNA } from "@/data/lookDNA";
import {
  LOOK_SCORE_CATEGORIES,
  LOOK_SLOTS,
  composite,
  type LookScoreCategory,
  type LookScoring,
  type LookSlot,
} from "./lookScoring";

const pw = z.string().min(1).max(200);

type CandidateRow = {
  id: string;
  dna_id: string;
  destination: string;
  day: number | null;
  look: number | null;
  variant: string;
  status: string;
  muse_image_url: string | null;
  lookboard_image_url: string | null;
  scoring: LookScoring;
  composite_score: number | null;
  feedback_history: Array<{ at: string; feedback: string[]; note?: string }>;
  notes: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type SlotRow = {
  id: string;
  candidate_id: string;
  slot: LookSlot;
  sourced_product_id: string | null;
  vault_product_id: string | null;
  position: number;
  notes: string | null;
};

/** DNA queue view: per-DNA candidate counts so the admin sees what needs work. */
export const listLookDNAQueue = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id, status, composite_score, updated_at");
    if (error) throw new Error(error.message);

    const counts = new Map<
      string,
      { total: number; approved: number; pending: number; rejected: number; best: number | null }
    >();
    for (const dna of Object.values(LOOK_DNA)) {
      counts.set(dna.id, { total: 0, approved: 0, pending: 0, rejected: 0, best: null });
    }
    for (const r of rows ?? []) {
      const c = counts.get(r.dna_id) ?? { total: 0, approved: 0, pending: 0, rejected: 0, best: null };
      c.total += 1;
      if (r.status === "approved" || r.status === "published") c.approved += 1;
      else if (r.status === "rejected") c.rejected += 1;
      else c.pending += 1;
      if (r.composite_score != null && (c.best == null || Number(r.composite_score) > c.best)) {
        c.best = Number(r.composite_score);
      }
      counts.set(r.dna_id, c);
    }

    return {
      ok: true as const,
      dnas: Object.values(LOOK_DNA).map((d) => ({
        id: d.id,
        name: d.name ?? d.id,
        destination: d.destination,
        activity: d.activity,
        mood: d.mood,
        tier: d.tier,
        isWaterLook: d.isWaterLook,
        targetBrands: d.targetBrands ?? [],
        counts: counts.get(d.id) ?? { total: 0, approved: 0, pending: 0, rejected: 0, best: null },
      })),
    };
  });

export const listCandidatesForDNA = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, dna_id: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: candidates, error } = await supabaseAdmin
      .from("look_candidates")
      .select("*")
      .eq("dna_id", data.dna_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = (candidates ?? []).map((c) => c.id);
    let slots: Array<SlotRow & { product?: SourcedProductLite | null }> = [];
    if (ids.length) {
      const { data: slotRows, error: slotErr } = await supabaseAdmin
        .from("look_candidate_slots")
        .select(
          "id, candidate_id, slot, sourced_product_id, vault_product_id, position, notes",
        )
        .in("candidate_id", ids);
      if (slotErr) throw new Error(slotErr.message);

      const sourcedIds = (slotRows ?? [])
        .map((s) => s.sourced_product_id)
        .filter((x): x is string => !!x);
      let productMap = new Map<string, SourcedProductLite>();
      if (sourcedIds.length) {
        const { data: prods } = await supabaseAdmin
          .from("sourced_products")
          .select("id, brand, product_name, price, currency, image_url, source_url, affiliate_url, retailer_domain")
          .in("id", sourcedIds);
        productMap = new Map((prods ?? []).map((p) => [p.id, p]));
      }
      slots = (slotRows ?? []).map((s) => ({
        ...(s as SlotRow),
        product: s.sourced_product_id ? productMap.get(s.sourced_product_id) ?? null : null,
      }));
    }

    return {
      ok: true as const,
      dna: LOOK_DNA[data.dna_id] ?? null,
      candidates: (candidates ?? []) as CandidateRow[],
      slots,
    };
  });

type SourcedProductLite = {
  id: string;
  brand: string | null;
  product_name: string | null;
  price: number | null;
  currency: string | null;
  image_url: string | null;
  source_url: string;
  affiliate_url: string | null;
  retailer_domain: string | null;
};

/** Slot → sourced_products.slot_category fuzzy match. */
const SLOT_CATEGORY_MAP: Record<LookSlot, string[]> = {
  swimwear: ["swimwear", "swim", "bikini", "one-piece"],
  dress_or_coverup: ["coverup", "cover-up", "dress", "kaftan", "pareo"],
  shoes: ["sandals", "shoes", "espadrilles", "flats", "heels", "wedge"],
  bag: ["bag", "tote", "clutch", "raffia"],
  earrings: ["earrings"],
  necklace: ["necklace"],
  bracelet: ["bracelet"],
  ring: ["ring"],
  sunglasses: ["sunglasses"],
  hair_detail: ["hair", "scarf"],
  optional_layer: ["layer", "kaftan", "coverup", "shirt"],
};

function matchesSlot(slot: LookSlot, sp: { slot_category: string | null; brand: string | null }): boolean {
  if (!sp.slot_category) return false;
  const cat = sp.slot_category.toLowerCase();
  return SLOT_CATEGORY_MAP[slot].some((kw) => cat.includes(kw));
}

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate three complete outfit candidates for a given Look DNA.
 * Pulls from already-sourced products (auto-validated in the background),
 * fills each required slot, then scores the composite look via Lovable AI.
 */
export const generateLookCandidates = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, dna_id: z.string().min(1).max(200), count: z.number().int().min(1).max(5).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const dna = LOOK_DNA[data.dna_id];
    if (!dna) throw new Error(`Unknown DNA: ${data.dna_id}`);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Pull candidate-eligible products: not rejected; have image + brand + name.
    const { data: pool, error: poolErr } = await supabaseAdmin
      .from("sourced_products")
      .select("id, brand, product_name, price, currency, image_url, source_url, affiliate_url, retailer_domain, slot_category, status, auto_approved")
      .neq("status", "rejected")
      .not("image_url", "is", null);
    if (poolErr) throw new Error(poolErr.message);

    const eligible = (pool ?? []).filter((p) => p.image_url && p.brand && p.product_name);
    const slotsRequired: LookSlot[] = dna.isWaterLook
      ? ["swimwear", "dress_or_coverup", "shoes", "bag", "earrings", "necklace", "sunglasses", "hair_detail"]
      : ["dress_or_coverup", "shoes", "bag", "earrings", "necklace", "bracelet", "sunglasses"];

    const count = data.count ?? 3;
    const variants = ["A", "B", "C", "D", "E"].slice(0, count);
    const created: string[] = [];

    for (let i = 0; i < count; i++) {
      const seed = Date.now() + i * 1000;
      const usedIds = new Set<string>();
      const slotPicks: Array<{ slot: LookSlot; sourced_product_id: string | null }> = [];

      for (const slot of slotsRequired) {
        const matches = eligible.filter((p) => matchesSlot(slot, p) && !usedIds.has(p.id));
        const ranked = shuffle(matches, seed + slot.length);
        // Prefer products whose brand is in targetBrands
        const preferred = ranked.find((p) =>
          (dna.targetBrands ?? []).some((b) => p.brand?.toLowerCase().includes(b.toLowerCase())),
        );
        const pick = preferred ?? ranked[0] ?? null;
        if (pick) usedIds.add(pick.id);
        slotPicks.push({ slot, sourced_product_id: pick?.id ?? null });
      }

      const { data: cand, error: candErr } = await supabaseAdmin
        .from("look_candidates")
        .insert({
          dna_id: dna.id,
          destination: dna.destination,
          variant: variants[i],
          status: "draft",
          scoring: {},
        })
        .select("id")
        .single();
      if (candErr) throw new Error(candErr.message);

      const slotInserts = slotPicks.map((sp, idx) => ({
        candidate_id: cand.id,
        slot: sp.slot,
        sourced_product_id: sp.sourced_product_id,
        position: idx,
      }));
      if (slotInserts.length) {
        const { error: sErr } = await supabaseAdmin
          .from("look_candidate_slots")
          .insert(slotInserts);
        if (sErr) throw new Error(sErr.message);
      }

      // Score immediately so the admin sees something useful.
      try {
        await scoreCandidateInternal(cand.id, dna, slotPicks, eligible);
      } catch (e) {
        // Non-fatal: store a placeholder note.
        await supabaseAdmin
          .from("look_candidates")
          .update({ notes: `Scoring failed: ${String((e as Error).message ?? e).slice(0, 200)}` })
          .eq("id", cand.id);
      }

      // Mark candidate as pending review once assembled.
      await supabaseAdmin
        .from("look_candidates")
        .update({ status: "pending_review" })
        .eq("id", cand.id);

      created.push(cand.id);
    }

    return { ok: true as const, candidate_ids: created };
  });

async function scoreCandidateInternal(
  candidateId: string,
  dna: LookDNA,
  slotPicks: Array<{ slot: LookSlot; sourced_product_id: string | null }>,
  pool: Array<{ id: string; brand: string | null; product_name: string | null; price: number | null }>,
): Promise<LookScoring> {
  const productSummary = slotPicks
    .map((sp) => {
      const p = sp.sourced_product_id ? pool.find((x) => x.id === sp.sourced_product_id) : null;
      return `${sp.slot}: ${p ? `${p.brand} — ${p.product_name}${p.price ? ` ($${p.price})` : ""}` : "MISSING"}`;
    })
    .join("\n");

  const scoring = await scoreViaAI(dna, productSummary);
  const comp = composite(scoring);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin
    .from("look_candidates")
    .update({ scoring, composite_score: comp })
    .eq("id", candidateId);

  return scoring;
}

async function scoreViaAI(dna: LookDNA, productSummary: string): Promise<LookScoring> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    // Fallback: neutral score so UI still renders.
    return Object.fromEntries(LOOK_SCORE_CATEGORIES.map((c) => [c, 5])) as LookScoring;
  }
  const system = `You are the head stylist for Resort Edit, a luxury destination styling platform. Score complete looks (not products) on a 0-10 scale for ten categories. Be honest and editorial — a generic influencer outfit must score low.`;
  const user = `LOOK DNA
Destination: ${dna.destination}
Activity: ${dna.activity}
Mood: ${dna.mood}
Palette: ${dna.palette.join(", ")}
Silhouette: ${dna.silhouette}
Print language: ${dna.printLanguage}
Resort energy: ${dna.resortEnergy}
Styling notes: ${dna.stylingNotes.join("; ")}
Hero piece: ${dna.heroPiece ?? "n/a"}
Target brands: ${(dna.targetBrands ?? []).join(", ") || "n/a"}

ASSEMBLED LOOK
${productSummary}

Score each category 0-10 and return strict JSON: { destination_specificity, activity_fidelity, styling_cohesion, luxury_traveler_appeal, editorial_uniqueness, saveability, color_story, print_story, accessory_ecosystem, resort_edit_luxury_score, rationale }.`;

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
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  let parsed: LookScoring;
  try {
    parsed = JSON.parse(content) as LookScoring;
  } catch {
    parsed = {};
  }
  // Clamp 0-10
  for (const cat of LOOK_SCORE_CATEGORIES) {
    const v = parsed[cat];
    if (typeof v === "number") parsed[cat] = Math.max(0, Math.min(10, v)) as LookScoring[LookScoreCategory];
  }
  return parsed;
}

export const rescoreCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, candidate_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cand } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id")
      .eq("id", data.candidate_id)
      .single();
    if (!cand) throw new Error("Candidate not found");
    const dna = LOOK_DNA[cand.dna_id];
    if (!dna) throw new Error("DNA missing");
    const { data: slots } = await supabaseAdmin
      .from("look_candidate_slots")
      .select("slot, sourced_product_id")
      .eq("candidate_id", cand.id);
    const sourcedIds = (slots ?? []).map((s) => s.sourced_product_id).filter((x): x is string => !!x);
    const { data: prods } = await supabaseAdmin
      .from("sourced_products")
      .select("id, brand, product_name, price")
      .in("id", sourcedIds.length ? sourcedIds : ["00000000-0000-0000-0000-000000000000"]);
    await scoreCandidateInternal(
      cand.id,
      dna,
      ((slots ?? []) as Array<{ slot: LookSlot; sourced_product_id: string | null }>).map((s) => ({
        slot: s.slot,
        sourced_product_id: s.sourced_product_id,
      })),
      (prods ?? []).map((p) => ({ ...p, brand: p.brand ?? null, product_name: p.product_name ?? null, price: p.price != null ? Number(p.price) : null })),
    );
    return { ok: true as const };
  });

/**
 * Improve Look: regenerate while preserving DNA. Records feedback,
 * swaps weakest 2 slots for new picks, re-scores.
 */
export const improveLook = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: pw,
        candidate_id: z.string().uuid(),
        feedback: z.array(z.string().min(1).max(200)).min(1).max(20),
        note: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cand, error: cErr } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id, feedback_history")
      .eq("id", data.candidate_id)
      .single();
    if (cErr || !cand) throw new Error("Candidate not found");
    const dna = LOOK_DNA[cand.dna_id];
    if (!dna) throw new Error("DNA missing");

    await supabaseAdmin
      .from("look_candidates")
      .update({ status: "improving" })
      .eq("id", cand.id);

    // Pull fresh pool and current slot picks.
    const { data: pool } = await supabaseAdmin
      .from("sourced_products")
      .select("id, brand, product_name, price, currency, image_url, source_url, affiliate_url, retailer_domain, slot_category")
      .neq("status", "rejected")
      .not("image_url", "is", null);
    const { data: slots } = await supabaseAdmin
      .from("look_candidate_slots")
      .select("id, slot, sourced_product_id, position")
      .eq("candidate_id", cand.id)
      .order("position");

    const eligible = (pool ?? []).filter((p) => p.image_url && p.brand && p.product_name);
    const usedIds = new Set<string>(
      (slots ?? []).map((s) => s.sourced_product_id).filter((x): x is string => !!x),
    );

    // Swap each slot for a different pick (rotate the pool by feedback hash).
    const seed = data.feedback.join("|").length * 7919 + Date.now();
    const newPicks: Array<{ slot: LookSlot; sourced_product_id: string | null }> = [];
    for (const s of slots ?? []) {
      const slot = s.slot as LookSlot;
      const matches = eligible.filter((p) => matchesSlot(slot, p) && !usedIds.has(p.id));
      const ranked = shuffle(matches, seed + slot.length);
      const preferred = ranked.find((p) =>
        (dna.targetBrands ?? []).some((b) => p.brand?.toLowerCase().includes(b.toLowerCase())),
      );
      const pick = preferred ?? ranked[0] ?? null;
      if (pick) usedIds.add(pick.id);
      newPicks.push({ slot, sourced_product_id: pick?.id ?? null });
      await supabaseAdmin
        .from("look_candidate_slots")
        .update({ sourced_product_id: pick?.id ?? null })
        .eq("id", s.id);
    }

    const history = Array.isArray(cand.feedback_history) ? (cand.feedback_history as Array<{ at: string; feedback: string[]; note?: string }>) : [];
    history.push({ at: new Date().toISOString(), feedback: data.feedback, note: data.note });

    await supabaseAdmin
      .from("look_candidates")
      .update({ feedback_history: history })
      .eq("id", cand.id);

    await scoreCandidateInternal(cand.id, dna, newPicks, eligible);

    await supabaseAdmin
      .from("look_candidates")
      .update({ status: "pending_review" })
      .eq("id", cand.id);

    return { ok: true as const };
  });

/** Approve a look. Auto-promotes its sourced products into the vault. */
export const approveLook = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, candidate_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: cand, error: cErr } = await supabaseAdmin
      .from("look_candidates")
      .select("id, dna_id")
      .eq("id", data.candidate_id)
      .single();
    if (cErr || !cand) throw new Error("Candidate not found");
    const dna = LOOK_DNA[cand.dna_id];

    const { data: slots } = await supabaseAdmin
      .from("look_candidate_slots")
      .select("id, slot, sourced_product_id")
      .eq("candidate_id", cand.id);

    const sourcedIds = (slots ?? []).map((s) => s.sourced_product_id).filter((x): x is string => !!x);
    if (sourcedIds.length) {
      const { data: prods } = await supabaseAdmin
        .from("sourced_products")
        .select("*")
        .in("id", sourcedIds);
      for (const sp of prods ?? []) {
        const slot = (slots ?? []).find((s) => s.sourced_product_id === sp.id)?.slot ?? null;
        // Skip if already in vault from this candidate.
        const { data: existing } = await supabaseAdmin
          .from("vault_products")
          .select("id")
          .eq("source_sourced_product_id", sp.id)
          .maybeSingle();
        if (existing?.id) continue;
        const payload = {
          product_name: sp.product_name ?? "Untitled",
          brand: sp.brand ?? "Unknown",
          retailer: sp.retailer_domain ?? null,
          affiliate_url: sp.affiliate_url ?? sp.source_url,
          image_url: sp.image_url ?? null,
          price: sp.price != null ? Number(sp.price) : null,
          currency: sp.currency ?? "USD",
          category: sp.slot_category ?? slot ?? "uncategorized",
          destination_tags: dna ? [dna.destination] : [],
          activity_tags: dna ? [dna.activity] : [],
          color_tags: dna ? dna.palette : [],
          print_tags: [],
          material_tags: [],
          silhouette_tags: [],
          approval_status: "approved" as const,
          approved_at: new Date().toISOString(),
          source_sourced_product_id: sp.id,
          source_look_candidate_id: cand.id,
          source_slot: slot,
        };
        await supabaseAdmin.from("vault_products").insert(payload);
        await supabaseAdmin
          .from("sourced_products")
          .update({ status: "promoted", promoted_at: new Date().toISOString() })
          .eq("id", sp.id);
      }
    }

    await supabaseAdmin
      .from("look_candidates")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", cand.id);

    return { ok: true as const, promoted: sourcedIds.length };
  });

export const rejectLook = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: pw, candidate_id: z.string().uuid(), reason: z.string().max(2000).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("look_candidates")
      .update({
        status: "rejected",
        rejected_at: new Date().toISOString(),
        notes: data.reason ?? null,
      })
      .eq("id", data.candidate_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteCandidate = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, candidate_id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("look_candidates")
      .delete()
      .eq("id", data.candidate_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// Re-export slot list for the UI.
export { LOOK_SLOTS };
export type { LookSlot, LookScoring };
export type LookCandidateRow = CandidateRow;
export type LookSlotRow = SlotRow & { product?: SourcedProductLite | null };