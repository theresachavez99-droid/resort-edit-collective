/**
 * LONG LUNCH AUTO-EDIT ENGINE — SERVER ONLY.
 *
 * Pipeline (event-driven, incremental, cheap):
 *   1. Load the look's `shop_slot_products` rows and overlay any active test
 *      simulations (never mutating source product data).
 *   2. Deterministic hard filters decide what is still purchasable.
 *   3. If nothing changed since the active version → return early, no AI call.
 *   4. Shortlist ≤5 eligible candidates per missing slot from existing product
 *      records (other active slot rows + approved replacement candidates).
 *   5. ONE AI call acting as fashion director over that shortlist. Falls back to
 *      the deterministic scorer when no key is configured.
 *   6. Persist an auditable version row. A version is only made active when the
 *      look is complete AND clears the coherence floor.
 *
 * The catalogue is never sent to a model. Nothing partial is ever published.
 */
import {
  AUTO_EDIT_PROMPT_VERSION,
  LONG_LUNCH_BRIEF,
  LONG_LUNCH_LOOK_KEY,
  LONG_LUNCH_REQUIRED_SLOTS,
  MIN_PUBLISH_COHERENCE,
  MIN_SINGLE_SLOT_COHERENCE,
  heuristicCoherence,
  heuristicSlotFit,
  isEligibleRow,
  lookFingerprint,
  mapToCanonicalSlot,
  missingRequiredSlots,
  type AutoEditCandidate,
  type AutoEditSlotPick,
} from "./long-lunch-auto-edit";
import { isExcludedProduct } from "./merchandising-exclusions";
import { loadStylingPolicy } from "./resort-edit-styling-policy.server";
import type { VisibleProductSlot } from "./look-atomic-completeness";

const MODEL = "google/gemini-3.7-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const SHORTLIST_PER_SLOT = 5;

type SlotRow = {
  id: string;
  look_key: string;
  destination: string | null;
  moment: string | null;
  slot: string;
  slot_label: string | null;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string | null;
  price: string | null;
  status: string;
  is_primary: boolean | null;
  slot_order: number | null;
  style_dna: Record<string, unknown> | null;
  last_checked_at?: string | null;
  last_audit_verdict?: string | null;
  registry_source?: string | null;
};

const SELECT =
  "id,look_key,destination,moment,slot,slot_label,brand,product_name,retailer,url,price,status,is_primary,slot_order,style_dna,last_checked_at,last_audit_verdict,registry_source";


export type AutoEditHealth = {
  broken_slots?: { slot: string; status: string; id: string }[];
  simulated_product_ids?: string[];
  concerns?: string[];
  notes?: string[];
};

export type AutoEditVersion = {
  id: string;
  look_key: string;
  version: number;
  state: string;
  is_active: boolean;
  completeness_ok: boolean;
  styling_score: number | null;
  rationale: string | null;
  slots: PersistedSlot[];
  health: AutoEditHealth;
  requires_review: boolean;
  replacement_reason: string | null;
  change_kind: string | null;
  evaluated_at: string;
  engine: string | null;
  model: string | null;
  prompt_version: string | null;
};

export type PersistedSlot = {
  slot: VisibleProductSlot;
  slot_label: string;
  product_id: string;
  source: string;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string;
  availability: string;
  image_url?: string | null;
  last_checked_at?: string | null;
  verification?: VerificationState;
  provenance?: string | null;
  rationale?: string | null;
};


function admin() {
  return import("@/integrations/supabase/client.server").then((m) => m.supabaseAdmin);
}

// ── Loading ──────────────────────────────────────────────────────

async function loadSimulations(lookKey: string): Promise<Map<string, string>> {
  const db = await admin();
  const { data } = await db
    .from("auto_edit_slot_simulations")
    .select("slot_product_id,simulated_status,active")
    .eq("look_key", lookKey)
    .eq("active", true);
  return new Map(
    (data ?? []).map((r) => [r.slot_product_id as string, (r.simulated_status as string) ?? "404"]),
  );
}

async function loadLookRows(lookKey: string) {
  const db = await admin();
  const { data } = await db
    .from("shop_slot_products")
    .select(SELECT)
    .eq("look_key", lookKey)
    .order("slot_order");
  const sims = await loadSimulations(lookKey);
  const rows = ((data ?? []) as SlotRow[]).map((r) =>
    sims.has(r.id) ? { ...r, status: sims.get(r.id)!, simulated: true } : { ...r, simulated: false },
  );
  return { rows, simulatedIds: [...sims.keys()] };
}

function toCandidate(
  row: SlotRow,
  source: AutoEditCandidate["source"],
): AutoEditCandidate | null {
  const slot = mapToCanonicalSlot(row.slot, row.slot_label);
  if (!slot) return null;
  if (isExcludedProduct({ slot: row.slot, slotLabel: row.slot_label })) return null;
  if (/\bring\b/i.test(row.product_name)) return null; // rings are never merchandised
  if (!isEligibleRow(row)) return null;
  return {
    source,
    sourceId: row.id,
    slot,
    rawSlot: row.slot,
    slotLabel: row.slot_label,
    brand: row.brand,
    productName: row.product_name,
    retailer: row.retailer,
    url: row.url as string,
    price: row.price,
    styleDna: row.style_dna,
    provenance: row.registry_source ?? source,
    imageUrl: null,
    availability: row.status,
    lastCheckedAt: row.last_checked_at ?? null,
    verification: deriveVerification({
      lastCheckedAt: row.last_checked_at ?? null,
      verdict: row.last_audit_verdict ?? null,
    }),
  };
}


/**
 * Eligible candidate pool — EXISTING product records only. There is no live
 * affiliate feed in this build; `AffiliateFeedAdapter` below is the seam for it.
 */
async function loadCandidatePool(
  needed: VisibleProductSlot[],
  excludeIds: Set<string>,
): Promise<AutoEditCandidate[]> {
  if (needed.length === 0) return [];
  const db = await admin();
  const out: AutoEditCandidate[] = [];

  const { data: slotRows } = await db
    .from("shop_slot_products")
    .select(SELECT)
    .eq("status", "active")
    .limit(400);
  for (const row of (slotRows ?? []) as SlotRow[]) {
    if (excludeIds.has(row.id)) continue;
    const c = toCandidate(row, "shop_slot_products");
    if (c && needed.includes(c.slot)) out.push(c);
  }

  const { data: cands } = await db
    .from("product_replacement_candidates")
    .select(
      "id,slot,brand,product_name,retailer,pdp_url,price,style_dna,approval_status,verification_status",
    )
    .in("approval_status", ["approved", "promoted"])
    .limit(200);
  for (const c of cands ?? []) {
    const row: SlotRow = {
      id: c.id as string,
      look_key: LONG_LUNCH_LOOK_KEY,
      destination: null,
      moment: null,
      slot: (c.slot as string) ?? "",
      slot_label: null,
      brand: (c.brand as string) ?? "",
      product_name: (c.product_name as string) ?? "",
      retailer: (c.retailer as string) ?? null,
      url: (c.pdp_url as string) ?? null,
      price: (c.price as string) ?? null,
      status: "active",
      is_primary: false,
      slot_order: null,
      style_dna: (c.style_dna as Record<string, unknown> | null) ?? null,
    };
    const mapped = toCandidate(row, "product_replacement_candidates");
    if (mapped && needed.includes(mapped.slot)) out.push(mapped);
  }

  // De-duplicate by URL — the same PDP can appear in several looks.
  const seen = new Set<string>();
  return out.filter((c) => {
    const k = c.url.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * FUTURE AFFILIATE FEED SEAM — intentionally unimplemented.
 * No live feed credentials exist in this project. When a network feed is
 * connected, implement this interface and add its output to the candidate pool
 * in `loadCandidatePool`. Nothing else in the engine needs to change.
 */
export interface AffiliateFeedAdapter {
  id: string;
  /** Return normalised candidates for the requested slots. */
  fetchCandidates(slots: VisibleProductSlot[]): Promise<AutoEditCandidate[]>;
}
export const AFFILIATE_FEED_ADAPTER: AffiliateFeedAdapter | null = null;

// ── AI fashion director ──────────────────────────────────────────

export function isAutoEditAiConfigured(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"]);
}

type AiVerdict = {
  picks: Record<string, string>; // slot → candidate id
  coherence: number;
  rationale: string;
  concerns: string[];
};

async function askFashionDirector(
  keep: AutoEditSlotPick[],
  shortlists: Record<string, AutoEditCandidate[]>,
  policyRules: string[],
): Promise<AiVerdict | null> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return null;
  const brief = {
    destination: LONG_LUNCH_BRIEF.destination,
    moment: LONG_LUNCH_BRIEF.moment,
    scene: LONG_LUNCH_BRIEF.scene,
    direction: [...LONG_LUNCH_BRIEF.direction, ...policyRules],
    forbidden: [...LONG_LUNCH_BRIEF.forbidden],
  };
  const payload = {
    brief,
    locked_pieces: keep.map((k) => ({
      slot: k.slot,
      brand: k.brand,
      product: k.productName,
      retailer: k.retailer,
    })),
    choose_one_per_slot: Object.fromEntries(
      Object.entries(shortlists).map(([slot, list]) => [
        slot,
        list.map((c) => ({
          id: c.sourceId,
          brand: c.brand,
          product: c.productName,
          retailer: c.retailer,
          style: c.styleDna ?? {},
        })),
      ]),
    ),
  };

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are Resort Edit's Editorial Fashion Director. Judge the OUTFIT AS A WHOLE — colour harmony, proportion, formality, material and texture, destination and activity appropriateness, visual interest, brand level, and whether the finished look feels intentional. Choose exactly one candidate id per requested slot from the supplied shortlists only. Never invent products. Reply with strict JSON: {\"picks\":{\"<slot>\":\"<id>\"},\"coherence\":<0-100>,\"rationale\":\"<2 sentences>\",\"concerns\":[\"...\"]}",
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AiVerdict;
    if (!parsed || typeof parsed !== "object" || !parsed.picks) return null;
    return {
      picks: parsed.picks,
      coherence: Number(parsed.coherence) || 0,
      rationale: String(parsed.rationale ?? ""),
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns.map(String) : [],
    };
  } catch {
    return null;
  }
}

// ── Assembly ─────────────────────────────────────────────────────

function shortlist(
  pool: AutoEditCandidate[],
  needed: VisibleProductSlot[],
  keep: AutoEditSlotPick[],
  pearlsApproved: boolean,
): Record<string, AutoEditCandidate[]> {
  const out: Record<string, AutoEditCandidate[]> = {};
  for (const slot of needed) {
    const list = pool
      .filter((c) => c.slot === slot)
      .map((c) => ({ c, s: heuristicSlotFit(c, keep, { pearlsApproved }) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, SHORTLIST_PER_SLOT)
      .map((x) => x.c);
    if (list.length) out[slot] = list;
  }
  return out;
}

function persist(slot: AutoEditSlotPick): PersistedSlot {
  return {
    slot: slot.slot,
    slot_label: slot.slotLabel ?? slot.slot,
    product_id: slot.sourceId,
    source: slot.source,
    brand: slot.brand,
    product_name: slot.productName,
    retailer: slot.retailer,
    url: slot.url,
    availability: slot.availability ?? "active",
    image_url: slot.imageUrl ?? null,
    last_checked_at: slot.lastCheckedAt ?? null,
    verification: slot.verification ?? "needs_verification",
    provenance: slot.provenance ?? slot.source,
    ...(slot.rationale ? { rationale: slot.rationale } : {}),
  };
}


export type EvaluationOutcome = {
  action: "unchanged" | "single_slot_repair" | "full_rebuild" | "blocked";
  complete: boolean;
  score: number | null;
  rationale: string;
  missing: VisibleProductSlot[];
  slots: PersistedSlot[];
  engine: "ai" | "rules";
  requiresReview: boolean;
  simulatedIds: string[];
  versionId: string | null;
  published: boolean;
};

export async function evaluateLongLunchAutoEdit(
  opts: { force?: boolean } = {},
): Promise<EvaluationOutcome> {
  const db = await admin();
  const lookKey = LONG_LUNCH_LOOK_KEY;
  const policy = await loadStylingPolicy();
  const pearlsApproved = policy.approvedBrands.some((b) => /pearl/i.test(b));
  const { rows, simulatedIds } = await loadLookRows(lookKey);

  // 1 · deterministic health of the currently declared look
  const healthy: AutoEditSlotPick[] = [];
  const broken: { slot: VisibleProductSlot; row: SlotRow }[] = [];
  for (const row of rows) {
    const slot = mapToCanonicalSlot(row.slot, row.slot_label);
    if (!slot) continue;
    if (!LONG_LUNCH_REQUIRED_SLOTS.includes(slot as never)) continue;
    if (healthy.some((h) => h.slot === slot)) continue;
    const c = toCandidate(row, "shop_slot_products");
    if (c) healthy.push({ ...c, heuristicScore: 0 });
    else broken.push({ slot, row });
  }

  const missingNow = missingRequiredSlots(healthy);
  const { data: activeRow } = await db
    .from("auto_edit_look_versions")
    .select("*")
    .eq("look_key", lookKey)
    .eq("is_active", true)
    .maybeSingle();
  const active = (activeRow as unknown as AutoEditVersion | null) ?? null;

  // 2 · nothing changed → no AI, no write
  if (!opts.force && active?.completeness_ok && missingNow.length === 0) {
    const fp = lookFingerprint(healthy.map((h) => ({ slot: h.slot, url: h.url })));
    const activeFp = lookFingerprint(
      (active.slots ?? []).map((s) => ({ slot: s.slot, url: s.url })),
    );
    if (fp === activeFp) {
      await db
        .from("auto_edit_look_versions")
        .update({ evaluated_at: new Date().toISOString() })
        .eq("id", active.id);
      return {
        action: "unchanged",
        complete: true,
        score: active.styling_score,
        rationale: "The published Long Lunch look is complete and every link is healthy.",
        missing: [],
        slots: active.slots ?? [],
        engine: "rules",
        requiresReview: false,
        simulatedIds,
        versionId: active.id,
        published: true,
      };
    }
  }

  // 3 · assemble
  const pool = await loadCandidatePool(
    [...LONG_LUNCH_REQUIRED_SLOTS],
    new Set([...rows.map((r) => r.id), ...healthy.map((h) => h.sourceId)]),
  );
  let needed = missingRequiredSlots(healthy);
  let keep = [...healthy];
  let action: EvaluationOutcome["action"] = needed.length === 0 ? "unchanged" : "single_slot_repair";
  if (needed.length > 1) action = "full_rebuild";

  let lists = shortlist(pool, needed, keep, pearlsApproved);
  let engine: "ai" | "rules" = "rules";
  let aiRationale = "";
  const concerns: string[] = [];

  const applyPicks = (verdict: AiVerdict | null) => {
    for (const slot of needed) {
      const list = lists[slot];
      if (!list?.length) continue;
      const pickedId = verdict?.picks?.[slot];
      const chosen = list.find((c) => c.sourceId === pickedId) ?? list[0]!;
      keep.push({
        ...chosen,
        heuristicScore: heuristicSlotFit(chosen, keep, { pearlsApproved }),
        rationale: verdict?.rationale ?? null,
      });
    }
  };

  if (Object.keys(lists).length > 0) {
    const verdict = await askFashionDirector(keep, lists, policy.extraRules);
    if (verdict) {
      engine = "ai";
      aiRationale = verdict.rationale;
      concerns.push(...verdict.concerns);
    }
    applyPicks(verdict);
  }

  let heur = heuristicCoherence(keep, { pearlsApproved });
  let score = heur.score;
  let missing = missingRequiredSlots(keep);

  // 4 · a weak single-slot repair escalates to a full rebuild
  if (action === "single_slot_repair" && missing.length === 0 && score < MIN_SINGLE_SLOT_COHERENCE) {
    action = "full_rebuild";
    keep = [];
    needed = [...LONG_LUNCH_REQUIRED_SLOTS];
    const rebuildPool = await loadCandidatePool(needed, new Set());
    const fullPool = [
      ...rebuildPool,
      ...healthy.map((h) => ({ ...h }) as AutoEditCandidate),
    ];
    lists = shortlist(fullPool, needed, keep, pearlsApproved);
    const verdict = await askFashionDirector(keep, lists, policy.extraRules);
    if (verdict) {
      engine = "ai";
      aiRationale = verdict.rationale;
      concerns.push(...verdict.concerns);
    }
    applyPicks(verdict);
    heur = heuristicCoherence(keep, { pearlsApproved });
    score = heur.score;
    missing = missingRequiredSlots(keep);
  }

  const complete = missing.length === 0;
  const publishable = complete && score >= MIN_PUBLISH_COHERENCE;
  const rationale =
    (aiRationale ? `${aiRationale} ` : "") +
    (complete
      ? heur.notes.join(" ")
      : `Cannot publish: no eligible product for ${missing.join(", ")}.`);
  const replacementReason = broken.length
    ? `Unavailable: ${broken.map((b) => `${b.slot} (${b.row.status})`).join(", ")}`
    : missingNow.length
      ? `Missing required slots: ${missingNow.join(", ")}`
      : null;

  // 5 · persist an auditable version
  const { data: last } = await db
    .from("auto_edit_look_versions")
    .select("version")
    .eq("look_key", lookKey)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  const version = ((last?.version as number) ?? 0) + 1;
  const slots = keep.map(persist);

  if (publishable) {
    await db
      .from("auto_edit_look_versions")
      .update({ is_active: false, state: "superseded" })
      .eq("look_key", lookKey)
      .eq("is_active", true);
  }

  const { data: inserted } = await db
    .from("auto_edit_look_versions")
    .insert({
      look_key: lookKey,
      destination: "Portofino",
      moment: "The Long Lunch",
      version,
      state: publishable ? "published" : "blocked",
      is_active: publishable,
      completeness_ok: complete,
      styling_score: score,
      rationale: rationale.trim() || null,
      slots: slots as unknown as never,
      health: {
        broken_slots: broken.map((b) => ({ slot: b.slot, status: b.row.status, id: b.row.id })),
        simulated_product_ids: simulatedIds,
        concerns,
        notes: heur.notes,
      } as unknown as never,
      requires_review: !publishable,
      replacement_reason: replacementReason,
      change_kind: action,
      engine,
      model: engine === "ai" ? MODEL : "deterministic-rules",
      prompt_version: AUTO_EDIT_PROMPT_VERSION,
    })
    .select("id")
    .maybeSingle();

  return {
    action: publishable ? action : "blocked",
    complete,
    score,
    rationale: rationale.trim(),
    missing,
    slots,
    engine,
    requiresReview: !publishable,
    simulatedIds,
    versionId: (inserted?.id as string) ?? null,
    published: publishable,
  };
}

// ── Reads ────────────────────────────────────────────────────────

/** The active, complete, publishable version — or null (module stays hidden). */
export async function loadActiveAutoEditLook(lookKey: string): Promise<AutoEditVersion | null> {
  if (lookKey !== LONG_LUNCH_LOOK_KEY) return null;
  const db = await admin();
  const { data } = await db
    .from("auto_edit_look_versions")
    .select("*")
    .eq("look_key", lookKey)
    .eq("is_active", true)
    .eq("completeness_ok", true)
    .maybeSingle();
  return (data as unknown as AutoEditVersion | null) ?? null;
}

export async function loadAutoEditHistory(limit = 10): Promise<AutoEditVersion[]> {
  const db = await admin();
  const { data } = await db
    .from("auto_edit_look_versions")
    .select("*")
    .eq("look_key", LONG_LUNCH_LOOK_KEY)
    .order("version", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as AutoEditVersion[];
}

export async function loadLongLunchDiagnostics() {
  const { rows, simulatedIds } = await loadLookRows(LONG_LUNCH_LOOK_KEY);
  const slots = rows.map((r) => ({
    id: r.id,
    slot: mapToCanonicalSlot(r.slot, r.slot_label),
    rawSlot: r.slot,
    slotLabel: r.slot_label,
    brand: r.brand,
    productName: r.product_name,
    retailer: r.retailer,
    status: r.status,
    eligible: isEligibleRow(r),
    simulated: simulatedIds.includes(r.id),
  }));
  const history = await loadAutoEditHistory();
  const active = history.find((h) => h.is_active) ?? null;
  return {
    slots,
    history,
    active,
    aiConfigured: isAutoEditAiConfigured(),
    requiredSlots: [...LONG_LUNCH_REQUIRED_SLOTS],
    feedAdapterConnected: AFFILIATE_FEED_ADAPTER !== null,
  };
}

export async function setSlotSimulation(input: {
  slotProductId: string;
  simulatedStatus: string;
  active: boolean;
}) {
  const db = await admin();
  if (!input.active) {
    await db
      .from("auto_edit_slot_simulations")
      .delete()
      .eq("look_key", LONG_LUNCH_LOOK_KEY)
      .eq("slot_product_id", input.slotProductId);
    return { ok: true as const };
  }
  await db
    .from("auto_edit_slot_simulations")
    .delete()
    .eq("look_key", LONG_LUNCH_LOOK_KEY)
    .eq("slot_product_id", input.slotProductId);
  await db.from("auto_edit_slot_simulations").insert({
    look_key: LONG_LUNCH_LOOK_KEY,
    slot_product_id: input.slotProductId,
    simulated_status: input.simulatedStatus,
    active: true,
    note: "Studio test-mode simulation — source product data untouched.",
  });
  return { ok: true as const };
}

export async function clearSimulations() {
  const db = await admin();
  await db.from("auto_edit_slot_simulations").delete().eq("look_key", LONG_LUNCH_LOOK_KEY);
  return { ok: true as const };
}
