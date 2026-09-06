import { describe, expect, it } from "bun:test";
import {
  briefGate,
  evaluatePublishGates,
  garmentCoverageGate,
  heroGate,
  jewelleryGate,
  merchantGate,
  outfitFingerprint,
  stockGate,
  stylistVerdictGate,
  type GatedPick,
  type StockEvidence,
} from "@/lib/auto-edit-gates";
import {
  PORTOFINO_MOMENT_BRIEFS,
  momentBrief,
  sunglassesAllowed,
} from "@/lib/portofino-moment-briefs";
import { evidenceFromRow } from "@/lib/auto-edit-sitewide.server";

const fresh = (over: Partial<StockEvidence> = {}): StockEvidence => ({
  availability: "in_stock",
  checkedAt: new Date().toISOString(),
  provenance: "pdp_probe",
  canonicalUrl: null,
  ...over,
});

const pick = (over: Partial<GatedPick> = {}): GatedPick => ({
  slot: "shoes",
  brand: "Aquazzura",
  productName: "Sandal",
  retailer: "Nordstrom",
  url: "https://www.nordstrom.com/s/aquazzura-sandal/1234567",
  candidateId: "id-1",
  evidence: fresh(),
  metal: null,
  designer: null,
  ...over,
});

describe("moment briefs", () => {
  it("covers all twelve canonical Portofino moments", () => {
    expect(PORTOFINO_MOMENT_BRIEFS.length).toBe(12);
  });

  it("requires day sunglasses and forbids them at night", () => {
    expect(momentBrief("long-lunch")!.requiredSlots).toContain("sunglasses");
    expect(momentBrief("nightcap")!.requiredSlots).not.toContain("sunglasses");
    expect(sunglassesAllowed(momentBrief("riviera-dinner")!)).toBe(false);
  });

  it("requires a hat for yacht day and a cover-up at the beach club", () => {
    expect(momentBrief("yacht-day")!.requiredSlots).toContain("hat");
    expect(momentBrief("beach-club")!.requiredSlots).toContain("layer");
  });

  it("always requires the full jewellery set", () => {
    for (const brief of PORTOFINO_MOMENT_BRIEFS) {
      expect(brief.requiredSlots).toContain("earrings");
      expect(brief.requiredSlots).toContain("necklace");
      expect(brief.requiredSlots).toContain("bracelet");
    }
  });
});

describe("stock evidence", () => {
  it("treats a blocked or never-checked product as unknown, not available", () => {
    const gate = stockGate(pick({ evidence: fresh({ availability: "unknown" }) }));
    expect(gate.ok).toBe(false);
    expect(gate.failures[0]!.gate).toBe("stock_unknown");
  });

  it("rejects stale evidence even when it once said in stock", () => {
    const old = new Date(Date.now() - 40 * 86_400_000).toISOString();
    const gate = stockGate(pick({ evidence: fresh({ checkedAt: old }) }));
    expect(gate.failures.some((f) => f.gate === "evidence_stale")).toBe(true);
  });

  it("rejects a sold-out product", () => {
    const gate = stockGate(pick({ evidence: fresh({ availability: "out_of_stock" }) }));
    expect(gate.failures[0]!.gate).toBe("sold_out");
  });

  it("maps a bare 200-style row to unknown availability", () => {
    const evidence = evidenceFromRow({
      status: "active",
      last_audit_verdict: null,
      last_checked_at: new Date().toISOString(),
      registry_source: "manual",
      url: "https://www.nordstrom.com/s/x/1",
    });
    expect(evidence.availability).toBe("unknown");
    expect(evidence.affiliateUrl).toBeNull();
  });
});

describe("merchant policy", () => {
  it("accepts an approved retailer on its own domain", () => {
    expect(merchantGate(pick()).ok).toBe(true);
  });

  it("rejects an approved retailer name on someone else's domain", () => {
    const gate = merchantGate(pick({ url: "https://www.example.com/p/1234567" }));
    expect(gate.failures[0]!.gate).toBe("retailer_domain_mismatch");
  });

  it("rejects a disallowed merchant", () => {
    const gate = merchantGate(
      pick({ retailer: "Random Boutique", brand: "Aquazzura", url: "https://randomshop.io/p/9" }),
    );
    expect(gate.failures[0]!.gate).toBe("merchant_not_approved");
  });

  it("rejects a category or search link", () => {
    const gate = merchantGate(pick({ url: "https://www.nordstrom.com/" }));
    expect(gate.ok).toBe(false);
  });
});

describe("garment coverage", () => {
  it("accepts a one-piece dress", () => {
    expect(garmentCoverageGate([pick({ slot: "outfit", productName: "Rima Belted Midi Dress" })]).ok).toBe(true);
  });

  it("rejects separates with only a top", () => {
    const gate = garmentCoverageGate([pick({ slot: "outfit", productName: "Linen Blouse" })]);
    expect(gate.failures[0]!.gate).toBe("separates_incomplete");
  });

  it("accepts a top plus a bottom", () => {
    const gate = garmentCoverageGate([
      pick({ slot: "outfit", productName: "Linen Blouse", candidateId: "a" }),
      pick({ slot: "outfit", productName: "Wide Leg Trouser", candidateId: "b" }),
    ]);
    expect(gate.ok).toBe(true);
  });
});

describe("jewellery rules", () => {
  it("never allows a ring or pearls", () => {
    const gate = jewelleryGate([
      pick({ slot: "necklace", productName: "Pearl Strand Necklace" }),
      pick({ slot: "earrings", productName: "Signet Ring" }),
    ]);
    expect(gate.failures.some((f) => f.gate === "pearls_forbidden")).toBe(true);
    expect(gate.failures.some((f) => f.gate === "ring_forbidden")).toBe(true);
  });

  it("requires one designer and one metal family", () => {
    const gate = jewelleryGate([
      pick({ slot: "earrings", brand: "Persee", designer: "Persee", metal: "gold" }),
      pick({ slot: "necklace", brand: "Jenny Bird", designer: "Jenny Bird", metal: "silver" }),
    ]);
    expect(gate.failures.some((f) => f.gate === "jewellery_designer_mixed")).toBe(true);
    expect(gate.failures.some((f) => f.gate === "jewellery_metal_mixed")).toBe(true);
  });
});

describe("stylist verdict", () => {
  it("refuses to accept a missing verdict", () => {
    const gate = stylistVerdictGate(null, { shoes: ["id-1"] });
    expect(gate.failures[0]!.gate).toBe("stylist_verdict_absent");
  });

  it("rejects a model pick that was never offered", () => {
    const gate = stylistVerdictGate(
      { model: "m", picks: { shoes: "hallucinated" }, coherence: 99, rationale: "", concerns: [], approved: true },
      { shoes: ["id-1"] },
    );
    expect(gate.failures.some((f) => f.gate === "stylist_pick_invalid")).toBe(true);
  });

  it("holds publication when the model raises a concern or does not approve", () => {
    const gate = stylistVerdictGate(
      { model: "m", picks: { shoes: "id-1" }, coherence: 95, rationale: "", concerns: ["clash"], approved: false },
      { shoes: ["id-1"] },
    );
    expect(gate.failures.some((f) => f.gate === "stylist_concerns_open")).toBe(true);
    expect(gate.failures.some((f) => f.gate === "stylist_not_approved")).toBe(true);
  });
});

describe("hero pairing", () => {
  const fingerprint = outfitFingerprint([{ slot: "outfit", url: "https://www.nordstrom.com/s/dress/1" }]);

  it("blocks a version with no hero", () => {
    expect(heroGate({ imageUrl: null, validation: null }, fingerprint).failures[0]!.gate).toBe("hero_missing");
  });

  it("blocks a hero generated for a different outfit", () => {
    const gate = heroGate(
      {
        imageUrl: "https://cdn/hero.png",
        validation: {
          slotsFingerprint: "other",
          identityScore: 0.95,
          garmentScore: 0.9,
          cropSafe: true,
          referenceUsed: "https://cdn/lilla.png",
        },
      },
      fingerprint,
    );
    expect(gate.failures.some((f) => f.gate === "hero_outfit_mismatch")).toBe(true);
  });

  it("blocks a hero without the approved identity reference", () => {
    const gate = heroGate(
      {
        imageUrl: "https://cdn/hero.png",
        validation: {
          slotsFingerprint: fingerprint,
          identityScore: 0.95,
          garmentScore: 0.9,
          cropSafe: true,
          referenceUsed: null,
        },
      },
      fingerprint,
    );
    expect(gate.failures.some((f) => f.gate === "hero_identity_reference_missing")).toBe(true);
  });

  it("passes a matching, validated hero", () => {
    const gate = heroGate(
      {
        imageUrl: "https://cdn/hero.png",
        validation: {
          slotsFingerprint: fingerprint,
          identityScore: 0.95,
          garmentScore: 0.9,
          cropSafe: true,
          referenceUsed: "https://cdn/lilla.png",
        },
      },
      fingerprint,
    );
    expect(gate.ok).toBe(true);
  });
});

describe("aggregate publish decision", () => {
  it("blocks an incomplete evening look with no hero and no verdict", () => {
    const decision = evaluatePublishGates({
      momentSlug: "nightcap",
      picks: [pick({ slot: "outfit", productName: "Silk Midi Dress" })],
      verdict: null,
      candidateIdsBySlot: {},
      hero: { imageUrl: null, validation: null },
      slotsFingerprint: "x",
    });
    expect(decision.publishable).toBe(false);
    expect(Object.keys(decision.byGate)).toContain("required_slot_missing");
    expect(Object.keys(decision.byGate)).toContain("stylist_verdict_absent");
    expect(Object.keys(decision.byGate)).toContain("hero_missing");
  });

  it("flags sunglasses in an evening look", () => {
    const gate = briefGate(momentBrief("nightcap")!, [pick({ slot: "sunglasses" })]);
    expect(gate.failures.some((f) => f.gate === "sunglasses_at_night")).toBe(true);
  });

  it("fingerprints outfits order-independently", () => {
    const a = outfitFingerprint([
      { slot: "outfit", url: "https://a/1" },
      { slot: "shoes", url: "https://b/2" },
    ]);
    const b = outfitFingerprint([
      { slot: "shoes", url: "https://b/2" },
      { slot: "outfit", url: "https://a/1" },
    ]);
    expect(a).toBe(b);
  });
});
