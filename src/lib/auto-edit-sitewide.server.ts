/**
 * RESORT EDIT — SITEWIDE AUTO-EDIT (server only)
 *
 * Generalises the Long Lunch pilot across every canonical Portofino moment:
 *
 *   auditMoments()          — honest per-moment launch audit: which slots are
 *                             missing, stale, broken, sold out, off-policy, and
 *                             whether the published hero matches the live look.
 *   generateMomentVersion() — builds a candidate look version, asks the AI
 *                             stylist for a real verdict, pairs it with a muse
 *                             hero image, runs every publish gate, and persists
 *                             the version INACTIVE with its blocked reason.
 *   activateVersion()       — atomic activation through the database function
 *                             `activate_auto_edit_version` (all-or-nothing).
 *   rollbackLook()          — atomic rollback to the last eligible version.
 *   runJob()                — idempotent, spend-bounded job wrapper used by the
 *                             scheduled refresh endpoint.
 *
 * Nothing here can publish an incomplete look, a look with unknown stock, a
 * look without a real stylist verdict, or a look whose hero image does not
 * match the outfit. Those states are recorded and surfaced, never hidden.
 */
import {
  evaluatePublishGates,
  heroGate,
  merchantGate,
  momentBrandDiversityGate,
  outfitFingerprint,
  stockGate,
  type GateFailure,
  type GatedPick,
  type HeroValidation,
  type StockEvidence,
  type StylistVerdict,
} from "./auto-edit-gates";

import { canonicalVisibleSlot, type VisibleProductSlot } from "./look-atomic-completeness";
import { isExcludedProduct } from "./merchandising-exclusions";
import { momentBrief, PORTOFINO_MOMENT_BRIEFS } from "./portofino-moment-briefs";
import { auditLillaLooks } from "./lilla-look-audit";

/** Founder rule: every Moment publishes exactly three distinct complete looks. */
export const REQUIRED_LOOKS_PER_MOMENT = 3;

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const STYLIST_MODEL = "google/gemini-3-flash";
export const SITEWIDE_ENGINE = "portofino-auto-edit-sitewide-v1";

/** Hard cost ceiling per scheduled run: model calls + image generations. */
export const MAX_SPEND_UNITS_PER_RUN = 12;

/** Supabase JSON columns are typed narrowly; payloads here are plain JSON. */
const asJson = (value: unknown) => value as never;

function admin() {
  return import("@/integrations/supabase/client.server").then((m) => m.supabaseAdmin);
}

const SLOT_SELECT =
  "id,look_key,destination,moment,slot,slot_label,brand,product_name,retailer,url,status,is_primary,slot_order,style_dna,last_checked_at,last_audit_verdict,registry_source";

type SlotRow = {
  id: string;
  look_key: string;
  moment: string | null;
  slot: string;
  slot_label: string | null;
  brand: string;
  product_name: string;
  retailer: string | null;
  url: string | null;
  status: string;
  is_primary: boolean | null;
  slot_order: number | null;
  style_dna: Record<string, unknown> | null;
  last_checked_at: string | null;
  last_audit_verdict: string | null;
  registry_source: string | null;
};

// ── Evidence mapping ─────────────────────────────────────────────

/**
 * Only PRODUCT-SPECIFIC in-stock proof counts. Generic health labels ("ok",
 * "healthy", "pass") mean the URL responded, not that the product is buyable,
 * so they are deliberately NOT accepted as availability.
 */
const IN_STOCK_VERDICTS = new Set(["in_stock", "instock", "available", "variant_in_stock"]);
const OUT_VERDICTS = new Set(["sold_out", "out_of_stock", "unavailable", "404", "gone"]);


/**
 * Turns whatever a record carries into honest stock evidence. A 200 response is
 * not stock confirmation; blocked pages and timeouts are `unknown`.
 */
export function evidenceFromRow(row: {
  status: string;
  last_audit_verdict: string | null;
  last_checked_at: string | null;
  registry_source: string | null;
  url: string | null;
}): StockEvidence {
  const verdict = (row.last_audit_verdict ?? "").trim().toLowerCase();
  const status = (row.status ?? "").trim().toLowerCase();
  let availability: StockEvidence["availability"] = "unknown";
  if (OUT_VERDICTS.has(verdict) || OUT_VERDICTS.has(status)) availability = "out_of_stock";
  else if (IN_STOCK_VERDICTS.has(verdict)) availability = "in_stock";
  return {
    availability,
    checkedAt: row.last_checked_at,
    provenance: row.registry_source ?? (row.last_audit_verdict ? "pdp_probe" : null),
    canonicalUrl: row.url ?? null,
    // No affiliate network is connected in this build, so there is no affiliate
    // URL. A plain merchant link is NOT a commissionable link.
    affiliateUrl: null,
  };
}

function toPick(row: SlotRow): GatedPick | null {
  const slot = canonicalVisibleSlot(row.slot_label ?? row.slot);
  if (!slot) return null;
  if (isExcludedProduct({ slot: row.slot, slotLabel: row.slot_label })) return null;
  if (!row.url) return null;
  const dna = row.style_dna ?? {};
  return {
    slot,
    brand: row.brand,
    productName: row.product_name,
    retailer: row.retailer,
    url: row.url,
    candidateId: row.id,
    evidence: evidenceFromRow(row),
    metal: typeof dna["metal"] === "string" ? (dna["metal"] as string) : null,
    designer: row.brand,
  };
}

// ── Per-moment audit ─────────────────────────────────────────────

export type SlotAudit = {
  slot: VisibleProductSlot | null;
  rawSlot: string;
  brand: string;
  productName: string;
  retailer: string | null;
  url: string | null;
  status: string;
  lastCheckedAt: string | null;
  availability: StockEvidence["availability"];
  failures: GateFailure[];
};

export type LookAudit = {
  lookKey: string;
  slots: SlotAudit[];
  missingRequired: VisibleProductSlot[];
  publishable: boolean;
  blockers: string[];
};

export type MomentAudit = {
  momentSlug: string;
  momentName: string;
  timeOfDay: string;
  looks: LookAudit[];
  /** Whether the moment has at least one publishable complete look. */
  launchReady: boolean;
  heroPaired: boolean;
  activeVersion: { id: string; version: number; heroState: string; slotsFingerprint: string | null } | null;
  blockers: string[];
};

export async function auditMoments(momentSlugs?: string[]): Promise<{
  audits: MomentAudit[];
  summary: { totalMoments: number; launchReady: number; withNoProducts: number; staleChecks: number };
}> {
  const db = await admin();
  const briefs = PORTOFINO_MOMENT_BRIEFS.filter(
    (b) => !momentSlugs || momentSlugs.includes(b.momentSlug),
  );
  const { data: rows } = await db.from("shop_slot_products").select(SLOT_SELECT).limit(2000);
  const { data: versions } = await db
    .from("auto_edit_look_versions")
    .select("id,look_key,version,is_active,hero_state,slots_fingerprint")
    .eq("is_active", true);

  const now = new Date();
  const audits: MomentAudit[] = [];
  let staleChecks = 0;
  let withNoProducts = 0;

  for (const brief of briefs) {
    const momentRows = ((rows ?? []) as SlotRow[]).filter(
      (r) => (r.moment ?? "").toLowerCase() === brief.momentSlug || r.look_key.includes(`/${brief.momentSlug}`),
    );
    const byLook = new Map<string, SlotRow[]>();
    for (const r of momentRows) {
      const list = byLook.get(r.look_key) ?? [];
      list.push(r);
      byLook.set(r.look_key, list);
    }
    if (byLook.size === 0) withNoProducts += 1;

    const looks: LookAudit[] = [];
    const goodPicksByLook = new Map<string, GatedPick[]>();
    for (const [lookKey, lookRows] of byLook) {
      const slots: SlotAudit[] = [];
      const goodPicks: GatedPick[] = [];
      for (const row of lookRows) {
        const pick = toPick(row);
        const failures: GateFailure[] = [];
        if (!pick) {
          failures.push({ gate: "slot_unmappable", detail: `slot "${row.slot_label ?? row.slot}" has no product link or is excluded` });
        } else {
          failures.push(...merchantGate(pick).failures, ...stockGate(pick, now).failures);
          if (failures.length === 0) goodPicks.push(pick);
          if (failures.some((f) => f.gate === "evidence_stale")) staleChecks += 1;
        }
        slots.push({
          slot: pick?.slot ?? null,
          rawSlot: row.slot_label ?? row.slot,
          brand: row.brand,
          productName: row.product_name,
          retailer: row.retailer,
          url: row.url,
          status: row.status,
          lastCheckedAt: row.last_checked_at,
          availability: pick?.evidence.availability ?? "unknown",
          failures,
        });
      }
      const filled = new Set(goodPicks.map((p) => p.slot));
      const missingRequired = brief.requiredSlots.filter((s) => !filled.has(s));
      const blockers = [
        ...(missingRequired.length ? [`missing: ${missingRequired.join(", ")}`] : []),
        ...slots.flatMap((s) => s.failures.map((f) => `${s.rawSlot}: ${f.gate}`)),
      ];
      goodPicksByLook.set(lookKey, goodPicks);
      looks.push({
        lookKey,
        slots,
        missingRequired,
        publishable: missingRequired.length === 0 && blockers.length === 0,
        blockers,
      });
    }

    const active =
      (versions ?? []).find((v) => (v.look_key as string).includes(`/${brief.momentSlug}`)) ?? null;
    const publishableLook = looks.find((l) => l.publishable) ?? null;
    const heroFingerprint = active?.slots_fingerprint as string | null | undefined;
    const heroPaired =
      Boolean(active) &&
      (active?.hero_state as string) === "validated" &&
      Boolean(heroFingerprint) &&
      Boolean(publishableLook) &&
      heroFingerprint ===
        outfitFingerprint(
          (publishableLook?.slots ?? [])
            .filter((s) => s.slot && s.url)
            .map((s) => ({ slot: s.slot as string, url: s.url as string })),
        );

    // The hardcoded supporting editorial cards are part of the public surface,
    // so the audit counts them too — a Moment is not ready on one good look.
    const supporting = auditLillaLooks().filter((a) => a.momentSlug === brief.momentSlug);
    const completeSupporting = supporting.filter((a) => a.complete);
    for (const s of supporting.filter((a) => !a.complete)) {
      looks.push({
        lookKey: s.lookKey,
        slots: [],
        missingRequired: s.missing,
        publishable: false,
        blockers: [`supporting card "${s.title}" missing: ${s.missing.join(", ")}`],
      });
    }

    // Three distinct complete looks with three different MAIN clothing brands.
    const completeLookCount = (publishableLook ? 1 : 0) + completeSupporting.length;
    const brandDiversity = momentBrandDiversityGate(
      publishableLook ? [{ lookKey: publishableLook.lookKey, picks: goodPicksByLook.get(publishableLook.lookKey) ?? [] }] : [],
      1,
    );

    const blockers: string[] = [];
    if (byLook.size === 0) blockers.push("no product records for this moment");
    if (!publishableLook) blockers.push("no complete, verified look");
    if (!heroPaired) blockers.push("no validated hero image paired with the live outfit");
    if (completeLookCount < REQUIRED_LOOKS_PER_MOMENT) {
      blockers.push(
        `${completeLookCount} complete look(s); this Moment requires ${REQUIRED_LOOKS_PER_MOMENT} with three different main clothing brands`,
      );
    }
    if (!brandDiversity.ok) blockers.push(...brandDiversity.failures.map((f) => f.detail));

    audits.push({
      momentSlug: brief.momentSlug,
      momentName: brief.momentName,
      timeOfDay: brief.timeOfDay,
      looks,
      launchReady:
        Boolean(publishableLook) &&
        heroPaired &&
        completeLookCount >= REQUIRED_LOOKS_PER_MOMENT &&
        brandDiversity.ok,
      heroPaired,

      activeVersion: active
        ? {
            id: active.id as string,
            version: active.version as number,
            heroState: (active.hero_state as string) ?? "missing",
            slotsFingerprint: (active.slots_fingerprint as string | null) ?? null,
          }
        : null,
      blockers,
    });
  }

  return {
    audits,
    summary: {
      totalMoments: audits.length,
      launchReady: audits.filter((a) => a.launchReady).length,
      withNoProducts,
      staleChecks,
    },
  };
}

// ── AI stylist verdict ───────────────────────────────────────────

export async function askStylist(input: {
  momentSlug: string;
  candidatesBySlot: Record<string, GatedPick[]>;
}): Promise<StylistVerdict | null> {
  const key = process.env["LOVABLE_API_KEY"];
  const brief = momentBrief(input.momentSlug);
  if (!key || !brief) return null;
  const payload = {
    brief: {
      moment: brief.momentName,
      scene: brief.scene,
      time_of_day: brief.timeOfDay,
      colour_story: brief.colourStory,
      direction: brief.direction,
      forbidden: brief.forbidden,
      required_slots: brief.requiredSlots,
    },
    choose_one_per_slot: Object.fromEntries(
      Object.entries(input.candidatesBySlot).map(([slot, list]) => [
        slot,
        list.map((c) => ({ id: c.candidateId, brand: c.brand, product: c.productName, retailer: c.retailer })),
      ]),
    ),
  };
  let res: Response;
  try {
    res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: STYLIST_MODEL,
        messages: [
          {
            role: "system",
            content:
              'You are Resort Edit\'s Editorial Fashion Director. Judge the outfit as a whole: colour harmony, print, proportion, formality, material, destination and activity appropriateness, and whether it reads intentional and luxurious. Choose exactly one id per requested slot, ONLY from the supplied lists. Never invent a product. Set approved=false if the resulting look is not publishable as editorial. Reply with strict JSON: {"picks":{"<slot>":"<id>"},"coherence":<0-100>,"rationale":"<2 sentences>","concerns":["..."],"approved":<boolean>}',
          },
          { role: "user", content: JSON.stringify(payload) },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StylistVerdict>;
    if (!parsed || typeof parsed !== "object" || !parsed.picks) return null;
    return {
      model: STYLIST_MODEL,
      picks: parsed.picks as Record<string, string>,
      coherence: Number(parsed.coherence) || 0,
      rationale: String(parsed.rationale ?? ""),
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns.map(String) : [],
      approved: parsed.approved === true,
    };
  } catch {
    return null;
  }
}

// ── Hero pairing ─────────────────────────────────────────────────

export type HeroOutcome = {
  imageUrl: string | null;
  validation: HeroValidation | null;
  state: "validated" | "blocked" | "missing";
  prerequisite: string | null;
};

/**
 * Generates the muse hero for a specific outfit version, using ONLY the
 * approved canonical identity reference for the destination, then validates
 * identity, garment fidelity and framing. Any missing prerequisite blocks the
 * version instead of publishing a mismatched image.
 */
export async function pairHeroImage(input: {
  momentSlug: string;
  versionId: string;
  picks: GatedPick[];
  slotsFingerprint: string;
  productImageUrls?: string[];
}): Promise<HeroOutcome> {
  const brief = momentBrief(input.momentSlug);
  if (!brief) return { imageUrl: null, validation: null, state: "blocked", prerequisite: "unknown moment" };
  if (!process.env["LOVABLE_API_KEY"]) {
    return { imageUrl: null, validation: null, state: "blocked", prerequisite: "image generation key unavailable" };
  }

  // CONTROLLING STANDARD — the founder-approved butter-yellow image governs
  // Lilla's face, body and warm golden-tan skin tone; the September teal
  // photograph is the secondary facial reference. Both must be reachable as
  // absolute URLs so the generator consumes their pixels. No absolute
  // reference → blocked; a lookalike is never substituted.
  const { BUTTER_STANDARD_LILLA_REFERENCE, CONTROLLING_LILLA_IDENTITY_REFERENCE } = await import(
    "./lilla-identity-references"
  );
  const absolute = (u: string | null | undefined) => (u && /^https:\/\//i.test(u) ? u : null);
  const butterRef = absolute(BUTTER_STANDARD_LILLA_REFERENCE.url);
  const facialRef = absolute(CONTROLLING_LILLA_IDENTITY_REFERENCE.url);
  if (!butterRef) {
    return {
      imageUrl: null,
      validation: null,
      state: "blocked",
      prerequisite:
        "controlling butter-standard Lilla reference is not available as an absolute https URL — generation must not proceed without it",
    };
  }
  const referenceUrls = [butterRef, ...(facialRef ? [facialRef] : [])];

  // Product reference imagery is mandatory: the muse must wear the exact
  // linked products, and a text description is not proof of that.
  const productImageUrls = (input.productImageUrls ?? []).filter((u) => /^https:\/\//i.test(u));
  if (productImageUrls.length === 0) {
    return {
      imageUrl: null,
      validation: null,
      state: "blocked",
      prerequisite:
        "no permitted product reference imagery for the linked pieces — cannot prove the hero shows the exact products",
    };
  }

  const db = await admin();
  const { data: muse } = await db
    .from("destination_muses")
    .select("muse_name,face_description,style_guardrails")
    .eq("destination_slug", "portofino")
    .maybeSingle();

  const productSummary = input.picks
    .map((p) => `${p.slot}: ${p.brand} ${p.productName}`)
    .join("; ");
  const prompt = [
    `Editorial resort photograph for the Portofino moment "${brief.momentName}".`,
    `Scene: ${brief.scene}`,
    `Colour story: ${brief.colourStory}`,
    `She is wearing exactly these linked products: ${productSummary}.`,
    "Match the reference face, body build and warm golden-tan skin tone exactly across face, neck, arms, hands and legs.",
    "Full-figure framing with the entire head, hair, body and shoes inside the frame, safe for responsive 16:9 and 4:5 crops.",
    "No text, no logos overlaid, no other people.",
  ].join(" ");

  const { generateAndStoreMuse } = await import("./muse-image.server");
  let museUrl: string;
  try {
    const result = await generateAndStoreMuse(input.versionId, prompt, {
      referenceUrl: butterRef,
      museName: (muse?.muse_name as string | undefined) ?? "Lilla",
      faceDescription: (muse?.face_description as string | undefined) ?? null,
      guardrails: (muse?.style_guardrails as string | undefined) ?? null,
      productImageUrls: [...referenceUrls.slice(1), ...productImageUrls],
    });
    museUrl = result.url;
  } catch (err) {
    return {
      imageUrl: null,
      validation: null,
      state: "blocked",
      prerequisite: `hero generation failed: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }

  const { verifyHeroAffirmatively } = await import("./hero-verification.server");
  const check = await verifyHeroAffirmatively({ imageUrl: museUrl, referenceUrls, productSummary });
  if (check.unavailable) {
    return {
      imageUrl: museUrl,
      validation: null,
      state: "blocked",
      prerequisite: `hero validation could not run: ${check.unavailable}`,
    };
  }

  const validation: HeroValidation = {
    slotsFingerprint: input.slotsFingerprint,
    identityScore: check.identityScore,
    garmentScore: check.garmentScore,
    // Framing is only "safe" when the verifier affirms head, body and feet.
    cropSafe:
      check.headInFrame === true && check.bodyInFrame === true && check.feetInFrame === true,
    referenceUsed: butterRef,
    referencesUsed: referenceUrls,
    headInFrame: check.headInFrame,
    bodyInFrame: check.bodyInFrame,
    feetInFrame: check.feetInFrame,
    identityConfirmed: check.identityConfirmed === true && check.skinToneConsistent === true,
    productsConfirmed: check.productsConfirmed,
    notes: check.notes,
  };
  const decision = heroGate({ imageUrl: museUrl, validation }, input.slotsFingerprint);
  return {
    imageUrl: museUrl,
    validation,
    state: decision.ok ? "validated" : "blocked",
    prerequisite: decision.ok ? null : decision.failures.map((f) => f.gate).join(", "),
  };
}


// ── Version generation ──────────────────────────────────────────

export type GenerateOutcome = {
  momentSlug: string;
  lookKey: string;
  versionId: string | null;
  published: boolean;
  blockedReason: string | null;
  failures: GateFailure[];
  slots: { slot: string; brand: string; product_name: string; retailer: string | null; url: string }[];
  verdict: StylistVerdict | null;
  hero: HeroOutcome | null;
  spendUnits: number;
};

const SHORTLIST_PER_SLOT = 4;

/**
 * Coherence score for a candidate against the moment brief. The shortlist must
 * be a curated, destination- and activity-appropriate set — not "the first four
 * rows that happen to be in stock".
 */
function coherenceScore(pick: GatedPick, brief: NonNullable<ReturnType<typeof momentBrief>>): number {
  const text = `${pick.brand} ${pick.productName}`.toLowerCase();
  let score = 0;
  if ((pick.moment ?? "").toLowerCase() === brief.momentSlug) score += 6;
  const words = `${brief.colourStory} ${brief.scene} ${brief.silhouetteNotes ?? ""}`
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 3);
  score += words.filter((w) => text.includes(w)).length;
  if (brief.timeOfDay === "evening" && /linen|eyelet|raffia|straw/.test(text)) score -= 2;
  return score;
}

export async function generateMomentVersion(opts: {
  momentSlug: string;
  lookKey?: string;
  withHero?: boolean;
  activateIfClean?: boolean;
  /** Slots whose current pieces still verify and must be kept as styled. */
  preserveUrlsBySlot?: Record<string, string>;
  /** Main clothing brands already used by other looks in this Moment. */
  excludeMainBrands?: string[];
}): Promise<GenerateOutcome> {
  const brief = momentBrief(opts.momentSlug);
  const lookKey = opts.lookKey ?? `portofino/${opts.momentSlug}`;
  const empty: GenerateOutcome = {
    momentSlug: opts.momentSlug,
    lookKey,
    versionId: null,
    published: false,
    blockedReason: null,
    failures: [],
    slots: [],
    verdict: null,
    hero: null,
    spendUnits: 0,
  };
  if (!brief) return { ...empty, blockedReason: `no editorial brief for ${opts.momentSlug}` };

  const db = await admin();
  const { data: rows } = await db.from("shop_slot_products").select(SLOT_SELECT).limit(2000);
  const now = new Date();

  // Eligible pool: merchant policy and stock evidence gate BEFORE ranking.
  const pool: GatedPick[] = [];
  for (const row of (rows ?? []) as SlotRow[]) {
    const pick = toPick(row);
    if (!pick) continue;
    if (merchantGate(pick).failures.length) continue;
    if (stockGate(pick, now).failures.length) continue;
    pool.push(pick);
  }

  const excluded = new Set((opts.excludeMainBrands ?? []).map((b) => b.trim().toLowerCase()));
  const preserved = opts.preserveUrlsBySlot ?? {};

  const candidatesBySlot: Record<string, GatedPick[]> = {};
  for (const slot of brief.requiredSlots) {
    // PRESERVATION — a coordinated piece that still verifies is kept, so a
    // single sold-out item never restyles the whole outfit needlessly.
    const keepUrl = preserved[slot];
    const kept = keepUrl ? pool.find((p) => p.slot === slot && p.url === keepUrl) : undefined;
    if (kept) {
      candidatesBySlot[slot] = [kept];
      continue;
    }
    const list = pool
      .filter((p) => p.slot === slot)
      // Three different main clothing brands per Moment.
      .filter((p) => slot !== "outfit" || !excluded.has(p.brand.trim().toLowerCase()))
      .sort((a, b) => coherenceScore(b, brief) - coherenceScore(a, brief))
      .slice(0, SHORTLIST_PER_SLOT);
    if (list.length) candidatesBySlot[slot] = list;
  }
  const missingSlots = brief.requiredSlots.filter((s) => !candidatesBySlot[s]);

  let spend = 0;
  let verdict: StylistVerdict | null = null;
  if (missingSlots.length === 0) {
    verdict = await askStylist({ momentSlug: opts.momentSlug, candidatesBySlot });
    spend += 1;
  }

  // Resolve picks from the model's choices; never from a heuristic alone.
  const picks: GatedPick[] = [];
  if (verdict) {
    for (const [slot, id] of Object.entries(verdict.picks)) {
      const found = (candidatesBySlot[slot] ?? []).find((c) => c.candidateId === id);
      if (found) picks.push(found);
    }
  }


  const slotsFingerprint = outfitFingerprint(picks.map((p) => ({ slot: p.slot, url: p.url })));
  const candidateIdsBySlot = Object.fromEntries(
    Object.entries(candidatesBySlot).map(([slot, list]) => [slot, list.map((c) => c.candidateId)]),
  );

  // Persist the version first so the hero image is stored against a real id.
  const { data: last } = await db
    .from("auto_edit_look_versions")
    .select("version")
    .eq("look_key", lookKey)
    .order("version", { ascending: false })
    .limit(1);
  const nextVersion = ((last?.[0]?.version as number | undefined) ?? 0) + 1;

  const persistedSlots = picks.map((p) => ({
    slot: p.slot,
    slot_label: p.slot,
    product_id: p.candidateId,
    brand: p.brand,
    product_name: p.productName,
    retailer: p.retailer,
    url: p.url,
    availability: p.evidence.availability,
    last_checked_at: p.evidence.checkedAt,
    provenance: p.evidence.provenance,
    affiliate_url: p.evidence.affiliateUrl ?? null,
  }));

  const { data: inserted, error } = await db
    .from("auto_edit_look_versions")
    .insert({
      look_key: lookKey,
      moment: opts.momentSlug,
      moment_slug: opts.momentSlug,
      destination: "portofino",
      version: nextVersion,
      state: "candidate",
      is_active: false,
      completeness_ok: false,
      slots: persistedSlots,
      slots_fingerprint: slotsFingerprint,
      engine: SITEWIDE_ENGINE,
      model: verdict?.model ?? null,
      prompt_version: SITEWIDE_ENGINE,
      rationale: verdict?.rationale ?? null,
      ai_verdict: asJson(verdict ?? {}),
      ai_verdict_state: verdict?.approved ? "approved" : verdict ? "rejected" : "absent",
      requires_review: true,
      blocked_reason: "pending gates",
      health: { missing_shortlists: missingSlots },
    })
    .select("id")
    .maybeSingle();
  if (error || !inserted) {
    return { ...empty, blockedReason: `could not persist version: ${error?.message ?? "unknown"}`, spendUnits: spend };
  }
  const versionId = inserted.id as string;

  let hero: HeroOutcome = { imageUrl: null, validation: null, state: "missing", prerequisite: null };
  if (opts.withHero !== false && picks.length > 0) {
    hero = await pairHeroImage({
      momentSlug: opts.momentSlug,
      versionId,
      picks,
      slotsFingerprint,
    });
    spend += 2;
  }

  const decision = evaluatePublishGates({
    momentSlug: opts.momentSlug,
    picks,
    verdict,
    candidateIdsBySlot,
    hero: { imageUrl: hero.imageUrl, validation: hero.validation },
    slotsFingerprint,
    now,
  });

  const blockedReason = decision.publishable
    ? null
    : [...new Set(decision.failures.map((f) => f.gate))].join(", ");

  await db
    .from("auto_edit_look_versions")
    .update({
      completeness_ok: decision.publishable,
      hero_image_url: hero.imageUrl,
      hero_validation: asJson(hero.validation ?? {}),
      hero_state: hero.state,
      blocked_reason: blockedReason,
      health: {
        failures: decision.failures,
        hero_prerequisite: hero.prerequisite,
        missing_shortlists: missingSlots,
      },
      styling_score: verdict?.coherence ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", versionId);

  let published = false;
  if (decision.publishable && opts.activateIfClean) {
    const activated = await activateVersion(versionId);
    published = activated.ok;
  }

  return {
    momentSlug: opts.momentSlug,
    lookKey,
    versionId,
    published,
    blockedReason,
    failures: decision.failures,
    slots: persistedSlots.map((s) => ({
      slot: s.slot,
      brand: s.brand,
      product_name: s.product_name,
      retailer: s.retailer,
      url: s.url,
    })),
    verdict,
    hero,
    spendUnits: spend,
  };
}

// ── Atomic activation / rollback ─────────────────────────────────

export async function activateVersion(versionId: string): Promise<{ ok: boolean; error?: string }> {
  const db = await admin();
  const { error } = await db.rpc("activate_auto_edit_version", { p_version_id: versionId });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function rollbackLook(lookKey: string): Promise<{ ok: boolean; error?: string }> {
  const db = await admin();
  const { error } = await db.rpc("rollback_auto_edit_version", { p_look_key: lookKey });
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ── Idempotent, spend-bounded jobs ───────────────────────────────

export type JobOutcome<T> = {
  jobKey: string;
  status: "completed" | "skipped_duplicate" | "failed";
  result: T | null;
  error?: string;
};

/**
 * Runs `fn` at most once per `jobKey`. The unique constraint on job_key makes
 * concurrent or repeated scheduler invocations no-ops instead of duplicate
 * paid work.
 */
export async function runJob<T>(
  jobKey: string,
  kind: string,
  fn: (budget: { spend: (n: number) => boolean; remaining: () => number }) => Promise<T>,
  opts: { momentSlug?: string; maxSpendUnits?: number } = {},
): Promise<JobOutcome<T>> {
  const db = await admin();
  const { error: claimError } = await db.from("auto_edit_jobs").insert({
    job_key: jobKey,
    kind,
    moment_slug: opts.momentSlug ?? null,
    status: "running",
  });
  if (claimError) {
    return { jobKey, status: "skipped_duplicate", result: null, error: claimError.message };
  }

  let used = 0;
  const cap = opts.maxSpendUnits ?? MAX_SPEND_UNITS_PER_RUN;
  const budget = {
    spend: (n: number) => {
      if (used + n > cap) return false;
      used += n;
      return true;
    },
    remaining: () => cap - used,
  };

  try {
    const result = await fn(budget);
    await db
      .from("auto_edit_jobs")
      .update({
        status: "completed",
        finished_at: new Date().toISOString(),
        result: asJson(result),
        spend_units: used,
      })
      .eq("job_key", jobKey);
    return { jobKey, status: "completed", result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    await db
      .from("auto_edit_jobs")
      .update({ status: "failed", finished_at: new Date().toISOString(), error: message, spend_units: used })
      .eq("job_key", jobKey);
    return { jobKey, status: "failed", result: null, error: message };
  }
}

/**
 * Scheduled refresh: re-checks stock evidence freshness and reports which
 * moments need work. It never generates paid work unless something actually
 * changed and the budget allows it.
 */
export async function scheduledRefresh(input: { limitMoments?: number; generate?: boolean } = {}) {
  const { audits, summary } = await auditMoments();
  const needsWork = audits.filter((a) => !a.launchReady).slice(0, input.limitMoments ?? 3);
  const generated: GenerateOutcome[] = [];
  if (input.generate) {
    for (const moment of needsWork) {
      const outcome = await generateMomentVersion({
        momentSlug: moment.momentSlug,
        withHero: true,
        activateIfClean: true,
      });
      generated.push(outcome);
    }
  }
  return { summary, needsWork: needsWork.map((m) => m.momentSlug), generated };
}
