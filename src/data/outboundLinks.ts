/**
 * OUTBOUND LINK REGISTRY — the single source of truth for every public
 * outbound link on Resort Edit (hotels, dining, experiences, and future
 * shopping links).
 *
 * Rules baked into the model:
 *  - `key` is a stable analytics key. Never change one once shipped.
 *  - `directUrl` is the real page we send a reader to. It must be https.
 *  - `affiliateUrl` is null until a REAL, verified tracking URL exists.
 *    `sponsored`/commission wording is derived from it — never hand-set.
 *  - `status` says whether the link may render at all.
 *  - `source` / `lastCheckedOn` record where the destination came from and
 *    when a human last confirmed it.
 *  - A missing or invalid URL hides the CTA. We never render href="#".
 *  - No prices, ratings or scarcity claims anywhere in this file.
 */

export type OutboundKind = "hotel" | "dining" | "experience" | "shopping";

/** Decides the visible CTA wording. Only these three are allowed publicly. */
export type OutboundCta = "visit-hotel" | "availability" | "enquiry" | "shop-brand";

export type OutboundStatus =
  /** Verified destination, safe to render. */
  | "active"
  /** Real destination, but affiliate tracking is still pending. Renders as a plain link. */
  | "active-affiliate-pending"
  /** Not verified / not ready. Never rendered publicly. */
  | "withheld";

export type OutboundLink = {
  key: string;
  kind: OutboundKind;
  /** Human label used in reports and click measurement. */
  label: string;
  directUrl: string;
  /** Verified affiliate/tracking URL. `null` until one genuinely exists. */
  affiliateUrl: string | null;
  /** Affiliate program name, only when `affiliateUrl` is set. */
  affiliateProgram: string | null;
  status: OutboundStatus;
  cta: OutboundCta;
  /** Where the destination URL was read from. */
  source: string;
  /** ISO date a human last confirmed the destination. */
  lastCheckedOn: string;
  /** Internal note (never rendered to visitors). */
  note?: string;
};

const CHECKED = "2026-09-16";

export const OUTBOUND_LINKS: Record<string, OutboundLink> = {
  /* ---------------------------------------------------------------- hotels */
  "hotel-splendido": {
    key: "hotel-splendido",
    kind: "hotel",
    label: "Splendido, A Belmond Hotel",
    // Belmond retired the old /hotels/europe/italy/portofino/... paths.
    directUrl: "https://www.belmond.com/en/hotels/europe/italy/splendido-portofino",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "visit-hotel",
    source: "belmond.com official hotel page",
    lastCheckedOn: CHECKED,
  },
  "hotel-splendido-mare": {
    key: "hotel-splendido-mare",
    kind: "hotel",
    label: "Splendido Mare, A Belmond Hotel",
    directUrl: "https://www.belmond.com/en/hotels/europe/italy/splendido-mare-portofino",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "visit-hotel",
    source: "belmond.com official hotel page",
    lastCheckedOn: CHECKED,
  },
  // WITHHELD: the old eighthotels.com/en/eight-hotel-portofino/ path does not
  // answer at all (connection times out), and the brand subdomain
  // portofino.eighthotels.it sits behind a Cloudflare bot challenge, so no
  // destination could be independently confirmed. A challenge alone does not
  // prove the page is dead — re-open it in a normal browser, then set
  // `directUrl` to the confirmed page and `status` to "active-affiliate-pending".
  "hotel-eight-portofino": {
    key: "hotel-eight-portofino",
    kind: "hotel",
    label: "Eight Hotel Portofino",
    directUrl: "https://portofino.eighthotels.it/en/",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "withheld",
    cta: "visit-hotel",
    source: "candidate brand subdomain — NOT confirmed (Cloudflare bot challenge)",
    lastCheckedOn: CHECKED,
    note:
      "Old .com path: connection timeout. Brand subdomain: HTTP 403 Cloudflare challenge in both curl and a real browser. Entry hidden from the public site until a human confirms the page.",
  },
  "hotel-piccolo-portofino": {
    key: "hotel-piccolo-portofino",
    kind: "hotel",
    label: "Hotel Piccolo Portofino",
    // hotelpiccoloportofino.com does not resolve. The official .it domain
    // (hotelpiccoloportofino.it/en/) 301-redirects into the Uvet Hotels site,
    // whose page identifies itself as "Boutique Hotel Piccolo Portofino" with
    // the Via Duca degli Abruzzi 31 address. English page used here.
    directUrl: "https://uvethotels.com/piccolohotel/en/home-en/",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "visit-hotel",
    source:
      "hotelpiccoloportofino.it/en/ redirect target on uvethotels.com — English page verified 200 and identifies the hotel",
    lastCheckedOn: CHECKED,
  },


  /* ---------------------------------------------------------------- dining */
  "dining-dav-mare": {
    key: "dining-dav-mare",
    kind: "dining",
    label: "DaV Mare, Splendido Mare",
    directUrl: "https://www.belmond.com/en/hotels/europe/italy/splendido-mare-portofino",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "visit-hotel",
    source: "belmond.com — restaurant sits inside the hotel page",
    lastCheckedOn: CHECKED,
  },
  "dining-la-terrazza": {
    key: "dining-la-terrazza",
    kind: "dining",
    label: "La Terrazza, Splendido",
    directUrl: "https://www.belmond.com/en/hotels/europe/italy/splendido-portofino",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "visit-hotel",
    source: "belmond.com — restaurant sits inside the hotel page",
    lastCheckedOn: CHECKED,
  },
  "dining-bagni-fiore": {
    key: "dining-bagni-fiore",
    kind: "dining",
    label: "Bagni Fiore, Paraggi",
    directUrl: "https://www.bagnifiore.com/en",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "availability",
    source: "bagnifiore.com — beach-club calendar and SevenRooms restaurant link",
    lastCheckedOn: CHECKED,
  },

  /* ----------------------------------------------------------- experiences */
  "portofino-private-riviera-boat": {
    key: "portofino-private-riviera-boat",
    kind: "experience",
    label: "Private Boat Tour of the Portofino Riviera",
    directUrl:
      "https://www.viator.com/tours/Portofino/Private-Boat-Tour-of-the-Portofino-Riviera/d4232-467798P8",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "availability",
    source: "viator.com listing",
    lastCheckedOn: CHECKED,
  },
  "portofino-sunset-boat-aperitif": {
    key: "portofino-sunset-boat-aperitif",
    kind: "experience",
    label: "Sunset Boat Tour with Aperitif",
    directUrl: "https://www.viator.com/tours/Portofino/Sunset-Boat-Tour-for-Small-Groups/d4232-467798P3",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "availability",
    source: "viator.com listing",
    lastCheckedOn: CHECKED,
  },
  "portofino-pesto-boat-walk-lunch": {
    key: "portofino-pesto-boat-walk-lunch",
    kind: "experience",
    label: "Boat & Walking Tour with Pesto Cooking and Lunch",
    directUrl:
      "https://www.viator.com/tours/Portofino/Best-of-Portofino-Boat-and-Walking-Tour-Pesto-Cooking-and-Lunch/d4232-68388P1",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "availability",
    source: "viator.com listing",
    lastCheckedOn: CHECKED,
  },
  // WITHHELD: the listing could not be independently confirmed — Viator
  // returns an HTTP 403 bot challenge to both curl and a real browser here.
  // The entry and its CTA are omitted from the public site until a human
  // opens the listing and confirms it is still live.
  "portofino-san-fruttuoso-guided-hike": {
    key: "portofino-san-fruttuoso-guided-hike",
    kind: "experience",
    label: "Private Coastal Hike to San Fruttuoso",
    directUrl:
      "https://www.viator.com/tours/Portofino/Portofino-to-S-Fruttuoso-Scenic-Coastal-Hike-with-Private-Guide/d4232-428295P2",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "withheld",
    cta: "availability",
    source: "viator.com listing",
    lastCheckedOn: CHECKED,
  },
  "portofino-la-portofinese-eco-farm": {
    key: "portofino-la-portofinese-eco-farm",
    kind: "experience",
    label: "La Portofinese Eco-Farm",
    directUrl: "https://www.laportofinese.it/en/the-places/eco-farm/",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "enquiry",
    source: "laportofinese.it official eco-farm page",
    lastCheckedOn: CHECKED,
  },
  "portofino-bagni-fiore-paraggi": {
    key: "portofino-bagni-fiore-paraggi",
    kind: "experience",
    label: "Bagni Fiore, Paraggi — beach club",
    directUrl: "https://www.bagnifiore.com/en",
    affiliateUrl: null,
    affiliateProgram: null,
    status: "active-affiliate-pending",
    cta: "availability",
    source: "bagnifiore.com — beach-club booking calendar",
    lastCheckedOn: CHECKED,
  },

  /* -------------------------------------------------------------- shopping */
  // WITHHELD. We hold the merchant code "resortedit" as an internal note only.
  // No exact verified tracking URL and no merchant-network approval exist, so
  // no affiliate or discount URL may be constructed from that code, and nothing
  // renders publicly.
  // The founder supplied this exact referral URL on 16 Sep 2026. It is used
  // verbatim — ?ref=hxrfofuu must survive untouched. The older bare text code
  // "resortedit" is NOT used to build a URL, and no discount percentage,
  // coupon term or commission rate is claimed anywhere: payout, rate and
  // conversion attribution can only come from the merchant's own reporting.
  "shop-biankina": {
    key: "shop-biankina",
    kind: "shopping",
    label: "Biankina",
    directUrl: "https://biankina.com/",
    affiliateUrl: "https://biankina.com/?ref=hxrfofuu",
    affiliateProgram: "Biankina brand referral (founder-supplied link)",
    status: "active",
    cta: "shop-brand",
    source: "referral URL supplied directly by the founder; destination loads with the ref parameter intact",
    lastCheckedOn: CHECKED,
    note:
      "User-confirmed affiliate relationship. NOT independently verified commission attribution — no network dashboard, rate or payout confirmation on file. Never publish a discount percentage or coupon term.",
  },

};

export const OUTBOUND_KEYS: readonly string[] = Object.keys(OUTBOUND_LINKS);

/** Visible CTA wording. Only ever these three phrases. */
export const OUTBOUND_CTA_LABEL: Record<OutboundCta, string> = {
  "visit-hotel": "Visit hotel",
  availability: "Check dates & availability",
  enquiry: "Explore & enquire",
};

function isSafeHttpsUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && Boolean(u.hostname);
  } catch {
    return false;
  }
}

export function outboundLink(key: string): OutboundLink | undefined {
  return OUTBOUND_LINKS[key];
}

/**
 * The href to render, or `null` when the CTA must be hidden.
 * Prefers a verified affiliate URL; otherwise the direct URL.
 */
export function outboundHref(key: string): string | null {
  const link = OUTBOUND_LINKS[key];
  if (!link || link.status === "withheld") return null;
  if (isSafeHttpsUrl(link.affiliateUrl)) return link.affiliateUrl;
  return isSafeHttpsUrl(link.directUrl) ? link.directUrl : null;
}

/** True only when a real verified affiliate URL is in use. */
export function outboundIsSponsored(key: string): boolean {
  const link = OUTBOUND_LINKS[key];
  return Boolean(link && isSafeHttpsUrl(link.affiliateUrl));
}

export function outboundCtaLabel(key: string): string | null {
  const link = OUTBOUND_LINKS[key];
  if (!link) return null;
  return OUTBOUND_CTA_LABEL[link.cta];
}

/** Internal reporting only — never rendered to visitors. */
export function outboundRegistryStatus() {
  const all = Object.values(OUTBOUND_LINKS);
  return {
    total: all.length,
    renderable: all.filter((l) => outboundHref(l.key) !== null).length,
    withheld: all.filter((l) => l.status === "withheld").map((l) => l.key),
    monetized: all.filter((l) => outboundIsSponsored(l.key)).map((l) => l.key),
    invalidUrls: all.filter((l) => !isSafeHttpsUrl(l.directUrl)).map((l) => l.key),
  };
}
