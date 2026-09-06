/**
 * REGRESSION: editorial image visibility is INDEPENDENT of shopping
 * eligibility.
 *
 * Founder override (6 September 2026): approved Lilla editorial imagery must
 * always render on Portofino moment pages, hero and supporting. Only commerce
 * (itemization, expanders, outbound product links, shop CTA) is gated by
 * completeness. These assertions read the route source so a future refactor
 * cannot silently re-couple image rendering to product eligibility.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const route = readFileSync("src/routes/portofino.$moment.tsx", "utf8");

describe("editorial visibility independent of commerce", () => {
  test("hero editorial image is not wrapped in the shoppable-eligibility gate", () => {
    expect(route).not.toContain("{heroEligible && (\n              <div className=\"relative aspect-[4/5]");
    // The image element exists unconditionally inside the featured grid.
    expect(route).toContain('alt={stagedLook?.alt ?? `${editorialTitle} — Portofino featured look`}');
  });

  test("supporting cards are no longer filtered out when incomplete", () => {
    expect(route).not.toContain("const publishableExtraCards");
    expect(route).toContain("editorialOnly={!isLillaLookComplete(slug, c.key)}");
  });

  test("nightcap cards render regardless of completeness, commerce gated", () => {
    expect(route).toContain("{NIGHTCAP_EDITORIAL_CARDS.map((c) => (");
    expect(route).toContain('{c.shop && isLillaLookComplete("nightcap", c.key) ? (');
  });

  test("an accurate editorial-inspiration disclosure replaces commerce", () => {
    expect(route).toContain("function EditorialInspirationNotice()");
    expect(route).toContain("Editorial inspiration.");
    expect(route).toContain("<EditorialInspirationNotice />");
  });

  test("commerce gates remain in force", () => {
    // Shop CTA + look-items block still require eligibility.
    expect(route).toContain("stagedLook || !heroEligible ? null : <ShopTheLookItems");
    expect(route).toContain("const showShopCta = shopCtaAllowed(shoppableRowCount)");
  });
});
