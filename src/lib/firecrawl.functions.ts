import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./admin-auth.server";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

const ALLOWED_DOMAINS = [
  "net-a-porter.com",
  "mytheresa.com",
  "matchesfashion.com",
  "matches.com",
  "ssense.com",
  "farfetch.com",
  "shopbop.com",
  "revolve.com",
  "nordstrom.com",
  "selfridges.com",
  "saksfifthavenue.com",
  "harrods.com",
  "mejuri.com",
  "missoma.com",
  "monica-vinader.com",
  "monicavinader.com",
  "astleyclarke.com",
  "jennifermeyer.com",
  "anine-bing.com",
  "aninebing.com",
  "loeffler-randall.com",
  "loefflerrandall.com",
  "stuartweitzman.com",
  "ancientgreeksandals.com",
  "lemaire.fr",
  "totême-studio.com",
  "toteme-studio.com",
  "khaite.com",
  "thereformation.com",
  "reformation.com",
  "zimmermann.com",
  "faithfullthebrand.com",
  "stauddesign.com",
  "staud.clothing",
  "polenebags.com",
  "polene-paris.com",
  "demellierlondon.com",
  "wandlerstore.com",
  "wandler.com",
  "jacquemus.com",
  "celine.com",
  "loropiana.com",
  "max-mara.com",
  "maxmara.com",
  "amazon.com",
  "shopstyle.com",
  "rstyle.me",
  "go.skimresources.com",
];

function domainAllowed(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const productJsonSchema = {
  type: "object",
  properties: {
    brand: { type: "string" },
    product_name: { type: "string" },
    price: { type: "number" },
    currency: { type: "string" },
    image_url: { type: "string" },
    in_stock: { type: "boolean" },
  },
  required: ["product_name"],
};

export const scrapeProductUrl = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        url: z.string().url(),
        day: z.number().int().min(1).max(7).optional(),
        look: z.number().int().min(1).max(10).optional(),
        slot_category: z.string().min(1).max(64).optional(),
        affiliate_url: z.string().url().optional(),
        notes: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) return { ok: false as const, error: "FIRECRAWL_API_KEY missing" };
    if (!domainAllowed(data.url)) {
      return {
        ok: false as const,
        error: `Domain not in approved retailer list: ${new URL(data.url).hostname}`,
      };
    }

    const host = new URL(data.url).hostname.replace(/^www\./, "");

    // Insert as queued first so we always have a record
    const { data: queued, error: insErr } = await supabaseAdmin
      .from("sourced_products")
      .insert({
        source_url: data.url,
        retailer_domain: host,
        day: data.day ?? null,
        look: data.look ?? null,
        slot_category: data.slot_category ?? null,
        affiliate_url: data.affiliate_url ?? data.url,
        notes: data.notes ?? null,
        status: "queued",
      })
      .select("id")
      .single();
    if (insErr || !queued) {
      return { ok: false as const, error: insErr?.message ?? "insert failed" };
    }

    try {
      const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.url,
          onlyMainContent: true,
          formats: [
            { type: "json", schema: productJsonSchema },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        await supabaseAdmin
          .from("sourced_products")
          .update({
            status: "failed",
            notes: `HTTP ${res.status}: ${body.slice(0, 300)}`,
          })
          .eq("id", queued.id);
        return { ok: false as const, error: `Firecrawl ${res.status}`, id: queued.id };
      }

      const payload = await res.json();
      const root = payload?.data ?? payload;
      const extracted = root?.json ?? root?.extract ?? {};
      const meta = root?.metadata ?? {};

      const image_url: string | null =
        extracted.image_url ||
        meta.ogImage ||
        meta["og:image"] ||
        null;

      await supabaseAdmin
        .from("sourced_products")
        .update({
          status: "scraped",
          brand: extracted.brand ?? null,
          product_name: extracted.product_name ?? meta.title ?? null,
          price: extracted.price ?? null,
          currency: extracted.currency ?? null,
          image_url,
          raw_extraction: root,
          scraped_at: new Date().toISOString(),
        })
        .eq("id", queued.id);

      return { ok: true as const, id: queued.id };
    } catch (e: any) {
      await supabaseAdmin
        .from("sourced_products")
        .update({ status: "failed", notes: String(e?.message ?? e).slice(0, 300) })
        .eq("id", queued.id);
      return { ok: false as const, error: String(e?.message ?? e), id: queued.id };
    }
  });

export const listSourcedProducts = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
  const { data, error } = await supabaseAdmin
    .from("sourced_products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return { ok: false as const, error: error.message, rows: [] };
  return { ok: true as const, rows: data ?? [] };
});

export const updateSourcedProductStatus = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        id: z.string().uuid(),
        status: z.enum(["queued", "scraped", "approved", "promoted", "failed", "rejected"]),
        notes: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const patch: {
      status: typeof data.status;
      notes?: string;
      promoted_at?: string;
    } = { status: data.status };
    if (data.notes !== undefined) patch.notes = data.notes;
    if (data.status === "promoted") patch.promoted_at = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("sourced_products")
      .update(patch)
      .eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

export const deleteSourcedProduct = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      password: z.string().min(1).max(200),
      id: z.string().uuid(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { error } = await supabaseAdmin.from("sourced_products").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });