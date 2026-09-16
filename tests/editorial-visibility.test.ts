/**
 * SCOPE CHANGE (September 2026 simplification): the per-moment clothing-look
 * pages were retired. `/portofino/$moment` and the legacy day/look paths are
 * permanent redirects to the single Portofino destination hub, so there is no
 * public page where editorial imagery and commerce can drift apart.
 *
 * The original guarantee — imagery visible, commerce gated — is preserved by
 * these assertions in its current form: the retired routes must stay
 * redirect-only and must never re-introduce public shopping surfaces without
 * an explicit new decision.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(p, "utf8");

const RETIRED_ROUTES = [
  "src/routes/portofino.$moment.tsx",
  "src/routes/portofino.$day.$look.tsx",
  "src/routes/portofino.pool-lounging.poolside-glam.tsx",
  "src/routes/my-edit.tsx",
  "src/routes/brands.tsx",
  "src/routes/pack-my-trip.tsx",
  "src/routes/latest.tsx",
];

describe("retired clothing-catalog routes", () => {
  for (const path of RETIRED_ROUTES) {
    test(`${path} redirects instead of rendering a catalog page`, () => {
      const src = read(path);
      expect(src).toContain("redirect(");
      expect(src).toContain("/portofino");
    });

    test(`${path} renders no shopping surface`, () => {
      const src = read(path);
      for (const forbidden of [
        "ShopTheLookItems",
        "ResortEditItemization",
        "showShopCta",
        "StagedLookItemization",
      ]) {
        expect(src).not.toContain(forbidden);
      }
    });
  }
});

describe("public Portofino hub", () => {
  const hub = read("src/routes/portofino.tsx");

  test("shows no prices", () => {
    expect(hub).not.toMatch(/[$€£]\s?\d/);
  });

  test("packing guidance is advice, not a shoppable set", () => {
    expect(hub).toContain("PORTOFINO_PACKING_GUIDE");
    expect(hub).not.toContain("ShopTheLookItems");
  });

  test("outbound links resolve through the typed registry", () => {
    expect(hub).toContain("OutboundCta");
    expect(hub).not.toMatch(/href="https?:\/\//);
  });
});
