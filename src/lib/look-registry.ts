/**
 * Sitewide shoppable-look registry (client-safe).
 *
 * Resort Edit's commerce data currently lives in editorial code modules. The
 * availability/AI system stores every shoppable slot in the database instead,
 * so this module is the migration bridge: it enumerates EVERY shoppable look
 * on the site — hero looks and supporting "More Resort Edit Looks" editorial
 * looks, for every destination and moment — in one normalised shape that can
 * be imported into `shop_slot_products`.
 *
 * Adding a new data source = adding one collector below. Nothing here is
 * Portofino- or Nightcap-specific beyond the source modules themselves.
 */
import { MOMENT_SHOP_CURATED } from "@/data/momentShopCurated";
import { MOMENT_EXTRA_EDITORIAL_CARDS } from "@/data/momentEditorialCards";
import { isExcludedProduct } from "@/lib/merchandising-exclusions";
import { isPublishableProductUrl } from "@/lib/shop-url-policy";

export type RegistrySlot = {
  slot: string;
  slotLabel: string | null;
  brand: string;
  productName: string;
  retailer: string | null;
  url: string | null;
  price: string | null;
  order: number;
  /** False when the editorial data has no exact PDP yet (never imported as live). */
  publishable: boolean;
};

export type RegistryLook = {
  destination: string;
  moment: string;
  /** Stable identity: `destination/moment` for hero looks, `destination/moment/cardKey` for editorial looks. */
  lookKey: string;
  lookKind: "hero" | "editorial";
  lookTitle: string;
  /** Editorial copy / image alt text — used as AI styling context. */
  editorialCopy?: string;
  imageAlt?: string;
  source: string;
  slots: RegistrySlot[];
};

/** Destinations whose moment maps are keyed by moment slug only. */
const MOMENT_MAP_DESTINATION = "portofino";

function normaliseSlot(raw: string | undefined | null): string {
  return (raw ?? "").trim().toLowerCase();
}

function retailerFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const known: Record<string, string> = {
      "revolve.com": "Revolve",
      "shopbop.com": "Shopbop",
      "saksfifthavenue.com": "Saks Fifth Avenue",
      "neimanmarcus.com": "Neiman Marcus",
      "nordstrom.com": "Nordstrom",
      "bloomingdales.com": "Bloomingdale's",
      "net-a-porter.com": "Net-a-Porter",
      "mytheresa.com": "Mytheresa",
    };
    return known[host] ?? host;
  } catch {
    return null;
  }
}

/** Hero looks: the curated Complete Edit shown beneath each moment hero. */
function collectHeroLooks(): RegistryLook[] {
  const out: RegistryLook[] = [];
  for (const [moment, items] of Object.entries(MOMENT_SHOP_CURATED)) {
    const slots: RegistrySlot[] = [];
    items.forEach((item, i) => {
      if (isExcludedProduct({ category: item.category, slotLabel: item.slotLabel })) return;
      const slot = normaliseSlot(item.category ?? item.slotLabel);
      if (!slot) return;
      slots.push({
        slot,
        slotLabel: item.slotLabel ?? null,
        brand: item.brand,
        productName: item.title,
        retailer: retailerFromUrl(item.url),
        url: item.url || null,
        price: item.price ?? null,
        order: i,
        publishable: !item.unsourced && isPublishableProductUrl(item.url),
      });
    });
    if (!slots.length) continue;
    out.push({
      destination: MOMENT_MAP_DESTINATION,
      moment,
      lookKey: `${MOMENT_MAP_DESTINATION}/${moment}`,
      lookKind: "hero",
      lookTitle: `${moment} — hero look`,
      source: "momentShopCurated",
      slots,
    });
  }
  return out;
}

/** Editorial looks: "More Resort Edit Looks" reference cards and their complete-look rows. */
function collectEditorialLooks(): RegistryLook[] {
  const out: RegistryLook[] = [];
  for (const [moment, cards] of Object.entries(MOMENT_EXTRA_EDITORIAL_CARDS)) {
    for (const card of cards) {
      const slots: RegistrySlot[] = [];
      const ref = card.reference;
      const refSlot = normaliseSlot(ref.slot?.split("·").pop() ?? "hero piece");
      if (ref.url && !isExcludedProduct({ category: refSlot })) {
        slots.push({
          slot: refSlot,
          slotLabel: ref.slot ?? null,
          brand: ref.brand,
          productName: ref.name,
          retailer: ref.retailer ?? retailerFromUrl(ref.url),
          url: ref.url,
          price: ref.price ?? null,
          order: 0,
          publishable: isPublishableProductUrl(ref.url),
        });
      }
      (card.shop?.products ?? []).forEach((p, i) => {
        const slot = normaliseSlot(p.slot);
        if (!slot || isExcludedProduct({ category: slot })) return;
        if (slots.some((s) => s.slot === slot)) return;
        slots.push({
          slot,
          slotLabel: p.slot,
          brand: p.brand,
          productName: p.name,
          retailer: retailerFromUrl(p.url),
          url: p.url || null,
          price: p.price ?? null,
          order: i + 1,
          publishable: !p.unsourced && isPublishableProductUrl(p.url),
        });
      });
      if (!slots.length) continue;
      out.push({
        destination: MOMENT_MAP_DESTINATION,
        moment,
        lookKey: `${MOMENT_MAP_DESTINATION}/${moment}/${card.key}`,
        lookKind: "editorial",
        lookTitle: card.title,
        editorialCopy: card.caption,
        imageAlt: card.alt,
        source: "momentEditorialCards",
        slots,
      });
    }
  }
  return out;
}

/** Every shoppable look on the site, hero and editorial, across all destinations. */
export function enumerateRegistryLooks(filter?: {
  destination?: string;
  moment?: string;
  lookKey?: string;
}): RegistryLook[] {
  const all = [...collectHeroLooks(), ...collectEditorialLooks()];
  return all.filter(
    (l) =>
      (!filter?.destination || l.destination === filter.destination) &&
      (!filter?.moment || l.moment === filter.moment) &&
      (!filter?.lookKey || l.lookKey === filter.lookKey),
  );
}

export function findRegistryLook(lookKey: string): RegistryLook | undefined {
  return enumerateRegistryLooks({ lookKey })[0];
}

/** Composite key used by the public page to match a DB row to an editorial slot. */
export function lookSlotKey(lookKey: string, slot: string): string {
  return `${lookKey}::${normaliseSlot(slot)}`;
}