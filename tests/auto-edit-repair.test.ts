/**
 * Regression cover for the automatic-repair guarantees:
 * atomic hide, three-brand diversity, affirmative hero validation,
 * product-specific stock evidence, and blocked-data honesty.
 */
import { describe, expect, it } from "bun:test";
import { evaluatePublicLook, garmentCoverageOk } from "@/lib/look-public-eligibility";
import {
  evidenceIsFresh,
  heroGate,
  merchantGate,
  momentBrandDiversityGate,
  outfitFingerprint,
  type GatedPick,
  type HeroValidation,
} from "@/lib/auto-edit-gates";

const pick = (over: Partial<GatedPick> = {}): GatedPick => ({
  candidateId: "c1",
  slot: "outfit",
  brand: "Zimmermann",
  productName: "Roselight Linen Midi Dress",
  retailer: "Net-a-Porter",
  url: "https://www.net-a-porter.com/en-gb/shop/product/zimmermann/roselight",
  evidence: {
    availability: "in_stock",
    checkedAt: new Date().toISOString(),
    provenance: "jsonld_offer",
  },
  ...over,
});

describe("public eligibility — atomic hide", () => {
  it("withholds an accessory-only look", () => {
    const result = evaluatePublicLook({
      lookKey: "portofino/shopping",
      rows: [
        { slot: "sunglasses", url: "https://www.revolve.com/a", status: "active", brand: "Le Specs", productName: "Outta Love" },
        { slot: "earrings", url: "https://www.revolve.com/b", status: "active", brand: "Jenny Bird", productName: "Florence Hoop" },
      ],
    });
    expect(result.eligible).toBe(false);
  });

  it("rejects separates without a bottom", () => {
    expect(
      garmentCoverageOk([
        { slot: "outfit", url: "https://www.revolve.com/top", status: "active", brand: "Posse", productName: "Linen Top" },
      ]),
    ).toBe(false);
  });
});

describe("three different main clothing brands per Moment", () => {
  it("fails when the garment brand repeats", () => {
    const result = momentBrandDiversityGate([
      { lookKey: "a", picks: [pick({ brand: "FAITHFULL" })] },
      { lookKey: "b", picks: [pick({ brand: "Faithfull" })] },
      { lookKey: "c", picks: [pick({ brand: "Posse" })] },
    ]);
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.gate === "main_brand_repeated")).toBe(true);
  });

  it("passes with three distinct garment brands", () => {
    const result = momentBrandDiversityGate([
      { lookKey: "a", picks: [pick({ brand: "Zimmermann" })] },
      { lookKey: "b", picks: [pick({ brand: "Posse" })] },
      { lookKey: "c", picks: [pick({ brand: "Alexandra Miro" })] },
    ]);
    expect(result.ok).toBe(true);
  });
});

describe("evidence honesty", () => {
  it("rejects future-dated checks", () => {
    const soon = new Date(Date.now() + 5 * 86_400_000).toISOString();
    expect(evidenceIsFresh({ availability: "in_stock", checkedAt: soon, provenance: "jsonld_offer" })).toBe(false);
  });

  it("rejects a hostname that merely contains part of the brand name", () => {
    const result = merchantGate(
      pick({ retailer: "Zimmermann Outlet", url: "https://zimmerm-deals.example.com/dress" }),
    );
    expect(result.ok).toBe(false);
  });
});

describe("hero validation must be affirmative", () => {
  const fingerprint = outfitFingerprint([{ slot: "outfit", url: "https://x/y" }]);
  const base: HeroValidation = {
    slotsFingerprint: fingerprint,
    identityScore: 0.95,
    garmentScore: 0.93,
    cropSafe: true,
    referenceUsed: "https://example.com/butter.png",
  };

  it("blocks when framing and identity are merely unstated", () => {
    const result = heroGate({ imageUrl: "https://img/hero.png", validation: base }, fingerprint);
    expect(result.ok).toBe(false);
  });

  it("passes only with explicit true affirmations", () => {
    const result = heroGate(
      {
        imageUrl: "https://img/hero.png",
        validation: {
          ...base,
          headInFrame: true,
          bodyInFrame: true,
          feetInFrame: true,
          identityConfirmed: true,
          productsConfirmed: true,
        },
      },
      fingerprint,
    );
    expect(result.ok).toBe(true);
  });
});
