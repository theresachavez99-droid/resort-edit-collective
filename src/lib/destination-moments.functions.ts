import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./admin-auth.server";
import type { Json } from "@/integrations/supabase/types";

/**
 * Destination Moments Library — Phase 1.
 *
 * Two layers:
 *  - `destination_moment_archetypes`: reusable types (Arrival, Yacht Day,
 *    Harbor Aperitivo, …) that every destination maps onto.
 *  - `destination_moments`: concrete per-destination moments
 *    (Portofino → Harbor Aperitivo, with narrative + styling cues).
 *
 * Reads are public via Supabase Data API (RLS allows anon SELECT). Writes
 * are admin-only through these server functions.
 */

const pw = z.string().min(1).max(200);

export type MomentArchetypeRow = {
  id: string;
  archetype_slug: string;
  archetype_name: string;
  description: string | null;
  sort_order: number;
  moment_type: "core" | "optional";
  destination_required: boolean;
};

export type DestinationMomentRow = {
  id: string;
  destination_slug: string;
  moment_slug: string;
  moment_name: string;
  archetype_slug: string | null;
  time_of_day: string | null;
  narrative: string | null;
  styling_cues: Json;
  sort_order: number;
  active: boolean;
};

// ---------- Canonical archetype seeds ----------

const ARCHETYPE_SEEDS: Array<Omit<MomentArchetypeRow, "id">> = [
  // Core six — every destination needs these, and the moment name MUST include the destination.
  { archetype_slug: "arrival", archetype_name: "Arrival Day", description: "Travel-in look — polished, considered, made to be photographed stepping off a boat or out of a car.", sort_order: 10, moment_type: "core", destination_required: true },
  { archetype_slug: "market-morning", archetype_name: "Espresso Morning", description: "Easy daywear for a slow first espresso and a walk through the village before the heat lands.", sort_order: 20, moment_type: "core", destination_required: true },
  { archetype_slug: "yacht-day", archetype_name: "Yacht Day", description: "On-water styling — sun, salt, breeze. Functional luxury, never costumey.", sort_order: 30, moment_type: "core", destination_required: true },
  { archetype_slug: "harbor-aperitivo", archetype_name: "Harbor Aperitivo", description: "Pre-dinner spritz with a view of the boats. Elevated daywear into evening.", sort_order: 40, moment_type: "core", destination_required: true },
  { archetype_slug: "sunset-views", archetype_name: "Sunset Views", description: "Golden-hour look from a terrace or cliffside.", sort_order: 50, moment_type: "core", destination_required: true },
  { archetype_slug: "riviera-dinner", archetype_name: "Riviera Dinner", description: "Restaurant dressing — refined, romantic, destination-appropriate.", sort_order: 60, moment_type: "core", destination_required: true },
  // Optional four — used only when a destination genuinely supports the moment. Naming may be generic.
  { archetype_slug: "beach-club-lunch", archetype_name: "Beach Club Lunch", description: "Coverup-led look for a long afternoon at a private beach club.", sort_order: 70, moment_type: "optional", destination_required: false },
  { archetype_slug: "villa-dinner", archetype_name: "Villa Dinner", description: "Private dinner at a rented villa — softer, more relaxed than restaurant dressing.", sort_order: 80, moment_type: "optional", destination_required: false },
  { archetype_slug: "shopping-afternoon", archetype_name: "Shopping Afternoon", description: "Walking the destination's signature shopping street.", sort_order: 90, moment_type: "optional", destination_required: false },
  { archetype_slug: "boat-excursion", archetype_name: "Boat Excursion", description: "Half-day boat trip — swimwear plus a thoughtful overlayer.", sort_order: 100, moment_type: "optional", destination_required: false },
];

// ---------- Portofino moment seeds (the canonical six) ----------

const PORTOFINO_MOMENT_SEEDS: Array<Omit<DestinationMomentRow, "id">> = [
  {
    destination_slug: "portofino",
    moment_slug: "arrival",
    moment_name: "Arrival Day",
    archetype_slug: "arrival",
    time_of_day: "afternoon",
    sort_order: 10,
    active: true,
    narrative: "Stepping off the boat at Piazzetta with a small case, sunglasses on. The first impression of the trip — quietly considered, never overdressed.",
    styling_cues: {
      silhouette: "Easy linen separates or a fluid midi dress; nothing crumpled.",
      palette: ["cream", "soft ecru", "navy"],
      hero: "Travel-friendly dress or set",
      accessory_strategy: "Structured tote, leather slides, oversized sunglasses, gold studs only.",
      avoid: "Sneakers, athleisure, beach coverups.",
    } as unknown as Json,
  },
  {
    destination_slug: "portofino",
    moment_slug: "espresso-morning",
    moment_name: "Espresso Morning",
    archetype_slug: "market-morning",
    time_of_day: "morning",
    sort_order: 20,
    active: true,
    narrative: "A slow first espresso along the harbor before the heat lands. Cotton, raffia, the morning paper.",
    styling_cues: {
      silhouette: "Cotton poplin dress or a tank + wide trouser.",
      palette: ["white", "natural straw", "pop of lemon or terracotta"],
      hero: "White cotton or eyelet dress",
      accessory_strategy: "Raffia tote, flat sandals, slim gold chain, straw hat optional.",
      avoid: "Logos, heels, heavy jewelry.",
    } as unknown as Json,
  },
  {
    destination_slug: "portofino",
    moment_slug: "yacht-day",
    moment_name: "Yacht Day",
    archetype_slug: "yacht-day",
    time_of_day: "midday",
    sort_order: 30,
    active: true,
    narrative: "A long day on the water — Paraggi, Camogli, lunch on board. Swim under, throw-on over, considered finish.",
    styling_cues: {
      silhouette: "Solid swim + crisp cotton shirt or kaftan; high-rise shorts only if tailored.",
      palette: ["white", "navy", "emerald", "deep ocean blue"],
      hero: "Elevated one-piece or bandeau bikini",
      accessory_strategy: "Wide-brim hat, tortoise sunglasses, gold hoops, woven slides for tender transfers.",
      avoid: "Neon, oversized straw bags that won't fit a tender, sequins.",
    } as unknown as Json,
  },
  {
    destination_slug: "portofino",
    moment_slug: "harbor-aperitivo",
    moment_name: "Harbor Aperitivo",
    archetype_slug: "harbor-aperitivo",
    time_of_day: "evening",
    sort_order: 40,
    active: true,
    narrative: "A spritz at sunset overlooking the harbor — yachts lit, hills pink. The hinge moment between day and dinner.",
    styling_cues: {
      silhouette: "A midi dress with movement, or silk top + tailored trouser. Bare shoulder is welcome.",
      palette: ["ivory", "soft gold", "sage", "muted coral"],
      hero: "Easy silk slip or a printed midi",
      accessory_strategy: "Small structured bag, kitten heel or leather slide, statement earring, optional cashmere wrap.",
      avoid: "Cocktail-party heels, club dressing, anything that needs Spanx.",
    } as unknown as Json,
  },
  {
    destination_slug: "portofino",
    moment_slug: "sunset-views",
    moment_name: "Sunset Views",
    archetype_slug: "sunset-views",
    time_of_day: "evening",
    sort_order: 50,
    active: true,
    narrative: "The walk up to Castello Brown or a private terrace for the long golden hour. Light layers, photographable.",
    styling_cues: {
      silhouette: "A flowing midi or a backless top + skirt; one striking element only.",
      palette: ["champagne", "rosé gold", "burnt sienna", "ivory"],
      hero: "Backless or open-back dress with movement",
      accessory_strategy: "Delicate gold layered chains, leather slide or block heel, slim envelope clutch.",
      avoid: "Heavy makeup vibes, bold prints that fight the light, cocktail bags.",
    } as unknown as Json,
  },
  {
    destination_slug: "portofino",
    moment_slug: "riviera-dinner",
    moment_name: "Riviera Dinner",
    archetype_slug: "riviera-dinner",
    time_of_day: "night",
    sort_order: 60,
    active: true,
    narrative: "Dinner at Puny or DaU Mari. Polished, romantic, distinctly Riviera — never city-cocktail.",
    styling_cues: {
      silhouette: "Tailored midi or column dress, or impeccable silk separates.",
      palette: ["black", "ivory", "deep navy", "emerald"],
      hero: "Tailored evening dress with destination softness",
      accessory_strategy: "Heel with substance (block or low stiletto), evening clutch, gold cuff or single earring.",
      avoid: "Bandage dresses, sequin minis, anything that reads city-club.",
    } as unknown as Json,
  },
];

// ---------- Server functions ----------

/** Public read — lists all moments for a destination (sorted). */
export const listDestinationMoments = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ destination_slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("destination_moments")
      .select("id,destination_slug,moment_slug,moment_name,archetype_slug,time_of_day,narrative,styling_cues,sort_order,active")
      .eq("destination_slug", data.destination_slug)
      .order("sort_order", { ascending: true });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, moments: (rows ?? []) as DestinationMomentRow[] };
  });

/** Admin: list every archetype. */
export const listMomentArchetypes = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: rows, error } = await supabaseAdmin
      .from("destination_moment_archetypes")
      .select("id,archetype_slug,archetype_name,description,sort_order,moment_type,destination_required")
      .order("sort_order", { ascending: true });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, archetypes: (rows ?? []) as MomentArchetypeRow[] };
  });

/** Admin: list moments (all destinations, includes inactive). */
export const listAllDestinationMoments = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: rows, error } = await supabaseAdmin
      .from("destination_moments")
      .select("id,destination_slug,moment_slug,moment_name,archetype_slug,time_of_day,narrative,styling_cues,sort_order,active")
      .order("destination_slug", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, moments: (rows ?? []) as DestinationMomentRow[] };
  });

/** Admin: idempotent seed of the 10 canonical archetypes. */
export const seedMomentArchetypes = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("destination_moment_archetypes")
      .select("archetype_slug,moment_type,destination_required");
    if (selErr) return { ok: false as const, error: selErr.message };
    const haveMap = new Map((existing ?? []).map((r) => [r.archetype_slug, r]));
    const toInsert = ARCHETYPE_SEEDS.filter((a) => !haveMap.has(a.archetype_slug));
    // Backfill momentType / destinationRequired on rows that pre-date the new fields.
    const toUpdate = ARCHETYPE_SEEDS.filter((a) => {
      const r = haveMap.get(a.archetype_slug) as { moment_type?: string; destination_required?: boolean } | undefined;
      return r && (r.moment_type !== a.moment_type || r.destination_required !== a.destination_required);
    });
    if (toInsert.length) {
      const { error: insErr } = await supabaseAdmin
        .from("destination_moment_archetypes")
        .insert(toInsert);
      if (insErr) return { ok: false as const, error: insErr.message };
    }
    for (const a of toUpdate) {
      const { error: updErr } = await supabaseAdmin
        .from("destination_moment_archetypes")
        .update({ moment_type: a.moment_type, destination_required: a.destination_required } as never)
        .eq("archetype_slug", a.archetype_slug);
      if (updErr) return { ok: false as const, error: updErr.message };
    }
    return { ok: true as const, inserted: toInsert.length, updated: toUpdate.length, total: ARCHETYPE_SEEDS.length };
  });

/** Admin: idempotent seed of the six Portofino moments. */
export const seedPortofinoMoments = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("destination_moments")
      .select("moment_slug")
      .eq("destination_slug", "portofino");
    if (selErr) return { ok: false as const, error: selErr.message };
    const have = new Set((existing ?? []).map((r) => r.moment_slug));
    const toInsert = PORTOFINO_MOMENT_SEEDS.filter((m) => !have.has(m.moment_slug));
    if (!toInsert.length) return { ok: true as const, inserted: 0, total: PORTOFINO_MOMENT_SEEDS.length };
    const { error: insErr } = await supabaseAdmin
      .from("destination_moments")
      .insert(toInsert);
    if (insErr) return { ok: false as const, error: insErr.message };
    return { ok: true as const, inserted: toInsert.length, total: PORTOFINO_MOMENT_SEEDS.length };
  });

/** Admin: update a single moment's editorial fields. */
export const updateDestinationMoment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      password: pw,
      id: z.string().uuid(),
      patch: z.object({
        moment_name: z.string().min(1).optional(),
        narrative: z.string().nullable().optional(),
        time_of_day: z.string().nullable().optional(),
        archetype_slug: z.string().nullable().optional(),
        styling_cues: z.record(z.string(), z.unknown()).optional(),
        sort_order: z.number().int().optional(),
        active: z.boolean().optional(),
      }),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { error } = await supabaseAdmin
      .from("destination_moments")
      .update(data.patch as never)
      .eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/** Admin: tag a look candidate with a moment slug (or clear it). */
export const setCandidateMoment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      password: pw,
      candidate_id: z.string().uuid(),
      moment_slug: z.string().nullable(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { error } = await supabaseAdmin
      .from("look_candidates")
      .update({ moment_slug: data.moment_slug } as never)
      .eq("id", data.candidate_id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
