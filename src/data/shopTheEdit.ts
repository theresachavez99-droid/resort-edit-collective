/**
 * SHOP THE EDIT — affiliate-ready links, one place to maintain.
 *
 * Keyed by the experience key from `destinationExperiences.ts`. Paste a
 * ShopMy / Rakuten / retailer URL here and a "Shop the Edit" button appears on
 * that experience card automatically. Leave it out and the card simply shows
 * the Instagram look link instead — we never render a dead or invented link.
 */
export type ShopTheEditLink = {
  /** The exact destination URL (ShopMy collection, Rakuten link, retailer page). */
  url: string;
  /** Optional button label override. */
  label?: string;
};

export const SHOP_THE_EDIT: Record<string, ShopTheEditLink> = {
  // "portofino-private-riviera-boat": { url: "https://shopmy.us/collections/..." },
};

export function shopTheEditLink(experienceKey: string): ShopTheEditLink | undefined {
  return SHOP_THE_EDIT[experienceKey];
}
