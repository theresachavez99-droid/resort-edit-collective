/**
 * Single source of truth for outbound HOTEL and EXPERIENCE partner links.
 *
 * Tracking-ready by design: destinations are unchanged, but every URL now
 * lives behind a keyed record with an explicit `partnerType` and a stable
 * `key`, so an affiliate/tracking layer can later rewrite `href` in ONE
 * place (see `partnerHref`) without touching any JSX.
 */
export type PartnerType = "hotel" | "experience";

export type PartnerLink = {
  /** Stable analytics key — never change once shipped. */
  key: string;
  partnerType: PartnerType;
  /** Display name, used for outbound tracking labels. */
  label: string;
  /** Raw destination URL. Unchanged for now. */
  url: string;
  /** Affiliate program, when one exists. `null` = direct/unaffiliated. */
  affiliateProgram?: string | null;
};

export const PARTNER_LINKS: Record<string, PartnerLink> = {
  "hotel-splendido": {
    key: "hotel-splendido",
    partnerType: "hotel",
    label: "Splendido, A Belmond Hotel",
    url: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
    affiliateProgram: null,
  },
  "hotel-eight-portofino": {
    key: "hotel-eight-portofino",
    partnerType: "hotel",
    label: "Eight Hotel Portofino",
    url: "https://www.eighthotels.com/en/eight-hotel-portofino/",
    affiliateProgram: null,
  },
  "hotel-piccolo-portofino": {
    key: "hotel-piccolo-portofino",
    partnerType: "hotel",
    label: "Hotel Piccolo Portofino",
    url: "https://www.hotelpiccoloportofino.com/",
    affiliateProgram: null,
  },
  "experience-yacht-charter": {
    key: "experience-yacht-charter",
    partnerType: "experience",
    label: "Private Yacht Charter",
    url: "https://www.getmyboat.com/",
    affiliateProgram: null,
  },
  "experience-beach-club": {
    key: "experience-beach-club",
    partnerType: "experience",
    label: "Beach Club Reservation",
    url: "https://www.bagnicapri.it/",
    affiliateProgram: null,
  },
  "experience-boat-excursions": {
    key: "experience-boat-excursions",
    partnerType: "experience",
    label: "Boat Excursions",
    url: "https://www.tigullio.it/",
    affiliateProgram: null,
  },
  "experience-cooking-classes": {
    key: "experience-cooking-classes",
    partnerType: "experience",
    label: "Cooking Classes",
    url: "https://www.tuscanynow.com/experiences/cooking-classes/",
    affiliateProgram: null,
  },
};

/**
 * The ONE place a tracking/affiliate wrapper should ever be applied.
 * Today it returns the raw URL untouched.
 */
export function partnerHref(key: string): string {
  return PARTNER_LINKS[key]?.url ?? "#";
}

export function partnerLink(key: string): PartnerLink {
  const link = PARTNER_LINKS[key];
  if (!link) throw new Error(`Unknown partner link: ${key}`);
  return link;
}
