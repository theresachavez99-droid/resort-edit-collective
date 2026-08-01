/**
 * Read-only launch audit.
 *
 * Reports, per Portofino moment: which canonical product slots are filled,
 * which are intentionally omitted, which are missing, and how every outbound
 * commerce URL classifies (exact product vs search / category / homepage /
 * placeholder). Pure functions over static curated data — no writes, no
 * network, no database. Safe to import from admin UI and from CI scripts.
import { excludeUnmerchandisable } from "@/lib/merchandising-exclusions";
 */
import { PORTOFINO_JOURNEY } from "./portofino-moment-fallbacks";
import { MOMENT_SHOP_CURATED } from "@/data/momentShopCurated";
import {
  MOMENT_EXTRA_EDITORIAL_CARDS,
  NIGHTCAP_EDITORIAL_CARDS,
} from "@/data/momentEditorialCards";
import { classifyShopUrl, type ShopUrlKind } from "./shop-url-policy";
import {
  ADVISORY_SLOTS,
  FORBIDDEN_SLOTS,
  PRODUCT_SLOTS,
  REQUIRED_SLOTS,
  resolveSlot,
  type ProductSlot,
} from "./product-slots";

/** Evening moments never require sunglasses. */
const EVENING_MOMENTS = new Set(["riviera-dinner", "nightcap", "sunset-views"]);

export type SlotFinding = {
  slot: ProductSlot | null;
  displayLabel: string;
  brand?: string;
  title?: string;
  url: string;
  urlKind: ShopUrlKind;
  urlReason?: string;
  /** Editorially marked optional / unsourced rather than an oversight. */
  intentional: boolean;
  source: "curated" | "editorial-card";
};

export type MomentAudit = {
  slug: string;
  name: string;
  momentType: "day" | "evening";
  filledSlots: ProductSlot[];
  missingRequiredSlots: ProductSlot[];
  intentionalOmissions: ProductSlot[];
  missingAdvisorySlots: ProductSlot[];
  forbiddenPresent: ProductSlot[];
  unmappedLabels: string[];
  productUrls: number;
  badUrls: SlotFinding[];
  zeroLinkPage: boolean;
  findings: SlotFinding[];
};

export type LaunchAudit = {
  moments: MomentAudit[];
  totals: {
    moments: number;
    zeroLinkPages: number;
    productUrls: number;
    badUrls: number;
    momentsMissingRequired: number;
  };
};

function findingsForMoment(slug: string): SlotFinding[] {
  const out: SlotFinding[] = [];

  // Rings are permanently excluded from merchandising, so they never count
  // toward completeness and never surface as audit findings.
  for (const row of excludeUnmerchandisable(MOMENT_SHOP_CURATED[slug])) {
    const { slot, displayLabel } = resolveSlot({
      slotLabel: row.slotLabel,
      category: row.category,
      title: row.title,
    });
    const v = classifyShopUrl(row.url);
    out.push({
      slot,
      displayLabel,
      brand: row.brand,
      title: row.title,
      url: row.url ?? "",
      urlKind: v.kind,
      ...(v.reason ? { urlReason: v.reason } : {}),
      intentional: Boolean(row.unsourced) || Boolean(row.isOptional && !row.url),
      source: "curated",
    });
  }

  const cards = [
    ...(MOMENT_EXTRA_EDITORIAL_CARDS[slug] ?? []),
    ...(slug === "nightcap" ? NIGHTCAP_EDITORIAL_CARDS : []),
  ];
  for (const card of cards) {
    const ref = (card as { reference?: { url?: string; slot?: string; brand?: string; name?: string } }).reference;
    if (ref?.url) {
      const { slot, displayLabel } = resolveSlot({ slot: ref.slot, title: ref.name });
      const v = classifyShopUrl(ref.url);
      out.push({
        slot,
        displayLabel: displayLabel || "Reference",
        ...(ref.brand ? { brand: ref.brand } : {}),
        ...(ref.name ? { title: ref.name } : {}),
        url: ref.url,
        urlKind: v.kind,
        ...(v.reason ? { urlReason: v.reason } : {}),
        intentional: false,
        source: "editorial-card",
      });
    }
    for (const p of excludeUnmerchandisable(card.shop?.products)) {
      const { slot, displayLabel } = resolveSlot({ slot: p.slot, title: p.name });
      const v = classifyShopUrl(p.url);
      const meta = p as { unsourced?: boolean; isOptional?: boolean; url?: string };
      out.push({
        slot,
        displayLabel,
        brand: p.brand,
        title: p.name,
        url: p.url,
        urlKind: v.kind,
        ...(v.reason ? { urlReason: v.reason } : {}),
        intentional: Boolean(meta.unsourced) || Boolean(meta.isOptional && !meta.url),
        source: "editorial-card",
      });
    }
  }
  return out;
}

export function auditMoment(slug: string, name: string): MomentAudit {
  const momentType: "day" | "evening" = EVENING_MOMENTS.has(slug) ? "evening" : "day";
  const findings = findingsForMoment(slug);

  const filled = new Set<ProductSlot>();
  const intentional = new Set<ProductSlot>();
  const unmapped: string[] = [];
  let productUrls = 0;
  const badUrls: SlotFinding[] = [];

  for (const f of findings) {
    if (f.urlKind === "product") {
      productUrls++;
      if (f.slot) filled.add(f.slot);
    } else if (f.intentional) {
      if (f.slot) intentional.add(f.slot);
    } else {
      badUrls.push(f);
    }
    if (!f.slot && f.displayLabel) unmapped.push(f.displayLabel);
  }

  const required = REQUIRED_SLOTS[momentType];
  const missingRequired = required.filter((s) => !filled.has(s) && !intentional.has(s));
  const missingAdvisory = ADVISORY_SLOTS.filter((s) => !filled.has(s));
  const forbiddenPresent = FORBIDDEN_SLOTS[momentType].filter((s) => filled.has(s));

  return {
    slug,
    name,
    momentType,
    filledSlots: PRODUCT_SLOTS.filter((s) => filled.has(s)),
    missingRequiredSlots: missingRequired,
    intentionalOmissions: PRODUCT_SLOTS.filter((s) => intentional.has(s)),
    missingAdvisorySlots: missingAdvisory,
    forbiddenPresent,
    unmappedLabels: [...new Set(unmapped)],
    productUrls,
    badUrls,
    zeroLinkPage: productUrls === 0,
    findings,
  };
}

export function runLaunchAudit(): LaunchAudit {
  const moments = PORTOFINO_JOURNEY.map((m) => auditMoment(m.moment_slug, m.moment_name));
  return {
    moments,
    totals: {
      moments: moments.length,
      zeroLinkPages: moments.filter((m) => m.zeroLinkPage).length,
      productUrls: moments.reduce((n, m) => n + m.productUrls, 0),
      badUrls: moments.reduce((n, m) => n + m.badUrls.length, 0),
      momentsMissingRequired: moments.filter((m) => m.missingRequiredSlots.length > 0).length,
    },
  };
}