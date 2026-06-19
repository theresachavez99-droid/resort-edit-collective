/**
 * Brand Intelligence Library — approval registry.
 *
 * Single source of truth for which brands are eligible to surface anywhere
 * in the Resort Edit shopping ecosystem (More Like This, Editor's
 * Alternatives, sourced product queues, etc.).
 *
 * Approval is a property of the BRAND, never inferred from the retailer.
 * A Milly piece on Saks is gated by Milly's status — not by Saks's status.
 * Nordstrom may carry 500 brands; only the subset listed here is eligible.
 */

import { brandCategories } from "./brands";

export type BrandApprovalStatus =
  | "approved"
  | "approved_selectively"
  | "pending_review"
  | "unapproved"
  | "rejected";

function norm(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Manual overrides for brands not in the curated `brands.ts` library, or
 * that need a non-default status. Keys are normalized brand names.
 */
const OVERRIDES: Record<string, BrandApprovalStatus> = {
  // Carried by partners we trust, vetted for the Resort Edit aesthetic.
  [norm("Milly")]: "approved_selectively",
  [norm("Alice + Olivia")]: "approved_selectively",
  [norm("Gianvito Rossi")]: "approved",
  [norm("Hemant & Nandita")]: "approved_selectively",
};

// Every brand listed in the curated brand library is approved by default.
const CURATED: Map<string, BrandApprovalStatus> = new Map(
  brandCategories.flatMap((c) => c.brands.map((b) => [norm(b.name), "approved" as BrandApprovalStatus])),
);

export function brandApprovalStatus(brand: string): BrandApprovalStatus {
  const key = norm(brand);
  if (OVERRIDES[key]) return OVERRIDES[key];
  return CURATED.get(key) ?? "pending_review";
}

/**
 * Eligibility gate for customer-facing surfaces. Only `approved` and
 * `approved_selectively` brands may render — regardless of affiliate
 * availability, retailer prestige, or score.
 */
export function isBrandEligible(brand: string): boolean {
  const s = brandApprovalStatus(brand);
  return s === "approved" || s === "approved_selectively";
}