/**
 * REPO-WIDE LILLA LOOK AUDIT
 *
 * Walks every public Lilla editorial look shipped in the repository, compares
 * the categories visibly worn in the photograph
 * (`@/data/lillaVisibleSlots`) against the look's linked commerce rows, and
 * returns an atomic verdict per look.
 *
 * A look that fails is hidden entirely — no invented retailer, no reused
 * product, no "Still sourcing" row. Consumed by the moment route (preview
 * staging) and by the regression tests.
 */
import {
  MOMENT_EXTRA_EDITORIAL_CARDS,
  NIGHTCAP_EDITORIAL_CARDS,
  type ExtraEditorialCard,
  type NightcapEditorialCard,
} from "@/data/momentEditorialCards";
import { LILLA_VISIBLE_SLOTS } from "@/data/lillaVisibleSlots";
import { isSuppressedProduct } from "./suppressed-products";
import {
  evaluateAtomicLook,
  type AtomicRow,
  type VisibleProductSlot,
} from "./look-atomic-completeness";

export type LillaLookAudit = {
  lookKey: string;
  momentSlug: string;
  cardKey: string;
  title: string;
  complete: boolean;
  /** Visible categories with no live, valid linked product. */
  missing: VisibleProductSlot[];
};

function rowsForExtraCard(lookKey: string, card: ExtraEditorialCard): AtomicRow[] {
  const rows: AtomicRow[] = [];
  const ref = card.reference;
  if (!isSuppressedProduct(lookKey, ref.brand, ref.name)) {
    rows.push({ slot: ref.slot ?? "Reference", url: ref.url });
  }
  for (const p of card.shop?.products ?? []) {
    if (isSuppressedProduct(lookKey, p.brand, p.name)) continue;
    rows.push({ slot: p.slot, url: p.url, ...(p.unsourced ? { unsourced: true } : {}) });
  }
  return rows;
}

function rowsForNightcapCard(lookKey: string, card: NightcapEditorialCard): AtomicRow[] {
  return (card.shop?.products ?? [])
    .filter((p) => !isSuppressedProduct(lookKey, p.brand, p.name))
    .map((p) => ({ slot: p.slot, url: p.url, ...(p.unsourced ? { unsourced: true } : {}) }));
}

function auditOne(
  lookKey: string,
  momentSlug: string,
  cardKey: string,
  title: string,
  rows: AtomicRow[],
): LillaLookAudit {
  const visibleProductSlots = LILLA_VISIBLE_SLOTS[lookKey] ?? [];
  const { complete, missing } = evaluateAtomicLook({ visibleProductSlots, rows });
  return { lookKey, momentSlug, cardKey, title, complete, missing };
}

/** Audit every public Lilla editorial look in the repository. */
export function auditLillaLooks(): LillaLookAudit[] {
  const out: LillaLookAudit[] = [];
  for (const [momentSlug, cards] of Object.entries(MOMENT_EXTRA_EDITORIAL_CARDS)) {
    for (const card of cards) {
      const lookKey = `portofino/${momentSlug}/${card.key}`;
      out.push(
        auditOne(lookKey, momentSlug, card.key, card.title, rowsForExtraCard(lookKey, card)),
      );
    }
  }
  for (const card of NIGHTCAP_EDITORIAL_CARDS) {
    const lookKey = `portofino/nightcap/${card.key}`;
    out.push(
      auditOne(lookKey, "nightcap", card.key, card.title, rowsForNightcapCard(lookKey, card)),
    );
  }
  return out;
}

const AUDIT_INDEX = new Map(auditLillaLooks().map((a) => [a.lookKey, a]));

/** Atomic render gate for a single editorial card. */
export function isLillaLookComplete(momentSlug: string, cardKey: string): boolean {
  return AUDIT_INDEX.get(`portofino/${momentSlug}/${cardKey}`)?.complete ?? false;
}

/** Looks that must not render their card / commerce block. */
export function suppressedLillaLooks(): LillaLookAudit[] {
  return auditLillaLooks().filter((a) => !a.complete);
}
