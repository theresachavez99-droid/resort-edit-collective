import { describe, expect, it } from "bun:test";
import {
  LONG_LUNCH_REQUIRED_SLOTS,
  MIN_PUBLISH_COHERENCE,
  deriveVerification,
  heuristicCoherence,
  isEligibleRow,
  lookFingerprint,
  mapToCanonicalSlot,
  missingRequiredSlots,
  type AutoEditSlotPick,
} from "@/lib/long-lunch-auto-edit";

const pick = (
  slot: AutoEditSlotPick["slot"],
  brand: string,
  productName: string,
): AutoEditSlotPick => ({
  source: "shop_slot_products",
  sourceId: `${slot}-${brand}`,
  slot,
  rawSlot: slot,
  slotLabel: slot,
  brand,
  productName,
  retailer: "Net-a-Porter",
  url: `https://www.net-a-porter.com/en-us/shop/product/${slot}-${brand}`,
  price: null,
  styleDna: null,
  heuristicScore: 0,
});

describe("Long Lunch slot mapping", () => {
  it("maps editorial slot names onto canonical slots", () => {
    expect(mapToCanonicalSlot("reference dress")).toBe("outfit");
    expect(mapToCanonicalSlot("sandals")).toBe("shoes");
    expect(mapToCanonicalSlot("tote")).toBe("bag");
    expect(mapToCanonicalSlot("cuff")).toBe("bracelet");
    expect(mapToCanonicalSlot("sunglasses")).toBe("sunglasses");
  });

  it("never maps a ring into a merchandisable slot", () => {
    expect(mapToCanonicalSlot("ring")).toBeNull();
    expect(LONG_LUNCH_REQUIRED_SLOTS).not.toContain("ring" as never);
  });
});

describe("eligibility", () => {
  it("requires a live status and a real external PDP", () => {
    expect(isEligibleRow({ status: "active", url: "https://www.net-a-porter.com/x/y" })).toBe(true);
    expect(isEligibleRow({ status: "404", url: "https://www.net-a-porter.com/x/y" })).toBe(false);
    expect(isEligibleRow({ status: "active", url: "#" })).toBe(false);
    expect(isEligibleRow({ status: "active", url: null })).toBe(false);
  });
});

describe("completeness", () => {
  it("flags every unfilled required slot", () => {
    const missing = missingRequiredSlots([{ slot: "outfit" }, { slot: "shoes" }]);
    expect(missing).toContain("bag");
    expect(missing).toContain("sunglasses");
    expect(missing).toContain("necklace");
  });

  it("is empty only for a fully assembled look", () => {
    const slots = LONG_LUNCH_REQUIRED_SLOTS.map((s) => ({ slot: s }));
    expect(missingRequiredSlots(slots)).toEqual([]);
  });
});

describe("holistic coherence", () => {
  const coherent = [
    pick("outfit", "Zimmermann", "Illumination Floral Linen Midi Dress"),
    pick("shoes", "Aquazzura", "Tan Leather Slingback Flat"),
    pick("bag", "Hereu", "Cognac Woven Leather Tote"),
    pick("sunglasses", "CELINE", "Triomphe Cat-Eye"),
    pick("earrings", "Persée", "Gold Hoop Earrings"),
    pick("necklace", "Persée", "Gold Chain Necklace"),
    pick("bracelet", "Persée", "Gold Bangle"),
  ];

  it("clears the publish floor for a coordinated look", () => {
    expect(heuristicCoherence(coherent).score).toBeGreaterThanOrEqual(MIN_PUBLISH_COHERENCE);
  });

  it("penalises mixing brown and black leathers", () => {
    const mixed = coherent.map((s) =>
      s.slot === "bag" ? pick("bag", "Hereu", "Black Woven Leather Tote") : s,
    );
    expect(heuristicCoherence(mixed).score).toBeLessThan(heuristicCoherence(coherent).score);
  });

  it("penalises mixed jewellery metals", () => {
    const mixed = coherent.map((s) =>
      s.slot === "necklace" ? pick("necklace", "Persée", "Silver Chain Necklace") : s,
    );
    expect(heuristicCoherence(mixed).score).toBeLessThan(heuristicCoherence(coherent).score);
  });

  it("rejects footwear that is wrong for an elegant daytime lunch", () => {
    const wrong = coherent.map((s) =>
      s.slot === "shoes" ? pick("shoes", "Golden Goose", "Leather Sneaker") : s,
    );
    expect(heuristicCoherence(wrong).score).toBeLessThan(MIN_PUBLISH_COHERENCE);
  });

  it("penalises unapproved pearls", () => {
    const pearls = coherent.map((s) =>
      s.slot === "necklace" ? pick("necklace", "Sophie Bille Brahe", "Pearl Necklace") : s,
    );
    expect(heuristicCoherence(pearls).score).toBeLessThan(heuristicCoherence(coherent).score);
    expect(heuristicCoherence(pearls, { pearlsApproved: true }).score).toBeGreaterThan(
      heuristicCoherence(pearls).score,
    );
  });
});

describe("fingerprint", () => {
  it("is order-independent so unchanged looks skip restyling", () => {
    const a = lookFingerprint([
      { slot: "outfit", url: "https://a/1" },
      { slot: "shoes", url: "https://b/2" },
    ]);
    const b = lookFingerprint([
      { slot: "shoes", url: "https://b/2" },
      { slot: "outfit", url: "https://a/1" },
    ]);
    expect(a).toBe(b);
  });
});

describe("verification derivation (curation desk)", () => {
  const now = new Date("2026-03-01T00:00:00Z");

  it("treats a never-checked product as needing verification, never shoppable", () => {
    expect(deriveVerification({ lastCheckedAt: null, now })).toBe("needs_verification");
  });

  it("treats a stale check as needing verification", () => {
    expect(
      deriveVerification({ lastCheckedAt: "2026-01-01T00:00:00Z", verdict: "ok", now }),
    ).toBe("needs_verification");
  });

  it("accepts a recent passing check", () => {
    expect(
      deriveVerification({ lastCheckedAt: "2026-02-25T00:00:00Z", verdict: "ok", now }),
    ).toBe("verified");
  });

  it("marks a failing verdict as failed regardless of recency", () => {
    expect(
      deriveVerification({ lastCheckedAt: "2026-02-28T00:00:00Z", verdict: "404", now }),
    ).toBe("failed");
  });
});
