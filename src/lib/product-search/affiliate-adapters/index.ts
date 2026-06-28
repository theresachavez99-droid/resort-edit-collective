/**
 * Affiliate network adapter placeholders.
 *
 * Each adapter follows the same interface; once credentials are provided
 * we wire the live API call inside `searchPrograms()`. Until then every
 * adapter reports `blocked` so the Buying Office UI can show exactly
 * which networks are pending.
 *
 * Approved retailer → network mapping (V1):
 *   Rakuten   → Saks, Neiman, Bloomingdale's, Mytheresa, Net-a-Porter, Luisaviaroma
 *   Partnerize→ Revolve, FWRD, Nordstrom (sometimes)
 *   PepperJam → Revolve/FWRD fallback
 *   CJ        → Nordstrom, Shopbop alt, Bloomingdale's alt
 *   Awin      → Mytheresa EU, Net-a-Porter EU
 *   Skimlinks → fallback aggregator
 *   Amazon    → Shopbop (Amazon-owned)
 */

import type { ApprovedRetailer, NormalizedCandidate, ProductSearchInput } from "../provider";

export type AffiliateNetworkId =
  | "rakuten"
  | "partnerize"
  | "pepperjam"
  | "cj"
  | "awin"
  | "skimlinks"
  | "amazon";

export interface AffiliateCredentialField {
  key: string;
  label: string;
  present: boolean;
}

export interface AffiliateAdapterStatus {
  network: AffiliateNetworkId;
  label: string;
  retailerPrograms: ApprovedRetailer[];
  requiredCredentials: AffiliateCredentialField[];
  credentialsPresent: boolean;
  programsApproved: "approved" | "unknown" | "blocked";
  providerReady: boolean;
  blockedReason: string | null;
}

export interface AffiliateAdapter {
  network: AffiliateNetworkId;
  label: string;
  retailerPrograms: ApprovedRetailer[];
  status(): AffiliateAdapterStatus;
  search(input: ProductSearchInput): Promise<NormalizedCandidate[]>;
}

function envPresent(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0;
}

function makeStatus(
  network: AffiliateNetworkId,
  label: string,
  retailers: ApprovedRetailer[],
  required: { key: string; label: string }[],
): AffiliateAdapterStatus {
  const fields = required.map((r) => ({ ...r, present: envPresent(r.key) }));
  const credentialsPresent = fields.every((f) => f.present);
  return {
    network,
    label,
    retailerPrograms: retailers,
    requiredCredentials: fields,
    credentialsPresent,
    programsApproved: credentialsPresent ? "unknown" : "blocked",
    providerReady: false, // flip to true per-adapter once a live integration ships
    blockedReason: credentialsPresent
      ? "Adapter implementation pending — credentials look present."
      : "Missing publisher credentials.",
  };
}

function placeholderSearch(): Promise<NormalizedCandidate[]> {
  // Hard rule: no invented products. Adapters return empty until live.
  return Promise.resolve([]);
}

export const RAKUTEN_ADAPTER: AffiliateAdapter = {
  network: "rakuten",
  label: "Rakuten Advertising (LinkShare)",
  retailerPrograms: [
    "saksfifthavenue.com",
    "neimanmarcus.com",
    "bloomingdales.com",
    "mytheresa.com",
    "net-a-porter.com",
    "luisaviaroma.com",
  ],
  status: () =>
    makeStatus("rakuten", "Rakuten Advertising (LinkShare)", [
      "saksfifthavenue.com",
      "neimanmarcus.com",
      "bloomingdales.com",
      "mytheresa.com",
      "net-a-porter.com",
      "luisaviaroma.com",
    ], [
      { key: "RAKUTEN_CLIENT_ID", label: "Client ID" },
      { key: "RAKUTEN_CLIENT_SECRET", label: "Client Secret" },
      { key: "RAKUTEN_SCOPE", label: "Site ID / Scope" },
    ]),
  search: placeholderSearch,
};

export const PARTNERIZE_ADAPTER: AffiliateAdapter = {
  network: "partnerize",
  label: "Partnerize",
  retailerPrograms: ["revolve.com", "fwrd.com", "nordstrom.com"],
  status: () =>
    makeStatus("partnerize", "Partnerize", ["revolve.com", "fwrd.com", "nordstrom.com"], [
      { key: "PARTNERIZE_USER_API_KEY", label: "User API Key" },
      { key: "PARTNERIZE_APPLICATION_KEY", label: "Application Key" },
      { key: "PARTNERIZE_PUBLISHER_ID", label: "Publisher ID" },
    ]),
  search: placeholderSearch,
};

export const PEPPERJAM_ADAPTER: AffiliateAdapter = {
  network: "pepperjam",
  label: "PepperJam (Partnerize fallback)",
  retailerPrograms: ["revolve.com", "fwrd.com"],
  status: () =>
    makeStatus("pepperjam", "PepperJam", ["revolve.com", "fwrd.com"], [
      { key: "PEPPERJAM_API_KEY", label: "API Key" },
    ]),
  search: placeholderSearch,
};

export const CJ_ADAPTER: AffiliateAdapter = {
  network: "cj",
  label: "CJ Affiliate (Commission Junction)",
  retailerPrograms: ["nordstrom.com", "shopbop.com", "bloomingdales.com"],
  status: () =>
    makeStatus("cj", "CJ Affiliate", ["nordstrom.com", "shopbop.com", "bloomingdales.com"], [
      { key: "CJ_DEVELOPER_KEY", label: "Developer Key (PAT)" },
      { key: "CJ_WEBSITE_ID", label: "Website ID (CID/PID)" },
    ]),
  search: placeholderSearch,
};

export const AWIN_ADAPTER: AffiliateAdapter = {
  network: "awin",
  label: "Awin",
  retailerPrograms: ["mytheresa.com", "net-a-porter.com", "luisaviaroma.com"],
  status: () =>
    makeStatus("awin", "Awin", ["mytheresa.com", "net-a-porter.com", "luisaviaroma.com"], [
      { key: "AWIN_API_TOKEN", label: "API Token" },
      { key: "AWIN_PUBLISHER_ID", label: "Publisher ID" },
    ]),
  search: placeholderSearch,
};

export const SKIMLINKS_ADAPTER: AffiliateAdapter = {
  network: "skimlinks",
  label: "Skimlinks / Sovrn (aggregator fallback)",
  retailerPrograms: [
    "revolve.com",
    "mytheresa.com",
    "net-a-porter.com",
    "shopbop.com",
    "saksfifthavenue.com",
    "neimanmarcus.com",
    "bloomingdales.com",
    "nordstrom.com",
    "fwrd.com",
    "luisaviaroma.com",
  ],
  status: () =>
    makeStatus("skimlinks", "Skimlinks / Sovrn", [
      "revolve.com",
      "mytheresa.com",
      "net-a-porter.com",
      "shopbop.com",
      "saksfifthavenue.com",
      "neimanmarcus.com",
      "bloomingdales.com",
      "nordstrom.com",
      "fwrd.com",
      "luisaviaroma.com",
    ], [
      { key: "SKIMLINKS_API_KEY", label: "API Key" },
      { key: "SKIMLINKS_PUBLISHER_ID", label: "Publisher ID" },
    ]),
  search: placeholderSearch,
};

export const AMAZON_ADAPTER: AffiliateAdapter = {
  network: "amazon",
  label: "Amazon Associates (Shopbop fallback)",
  retailerPrograms: ["shopbop.com"],
  status: () =>
    makeStatus("amazon", "Amazon Associates", ["shopbop.com"], [
      { key: "AMZN_ACCESS_KEY", label: "PA-API Access Key" },
      { key: "AMZN_SECRET_KEY", label: "PA-API Secret Key" },
      { key: "AMZN_PARTNER_TAG", label: "Associate Tag" },
    ]),
  search: placeholderSearch,
};

export const ALL_AFFILIATE_ADAPTERS: AffiliateAdapter[] = [
  RAKUTEN_ADAPTER,
  PARTNERIZE_ADAPTER,
  PEPPERJAM_ADAPTER,
  CJ_ADAPTER,
  AWIN_ADAPTER,
  SKIMLINKS_ADAPTER,
  AMAZON_ADAPTER,
];