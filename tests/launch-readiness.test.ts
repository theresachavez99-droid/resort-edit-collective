/**
 * Launch-readiness regression tests — Repair Batch 1.
 *
 * Focused assertions for: canonical featured headings, footer/About
 * conversion anchors, newsletter accessibility + debug removal, zero-link
 * commerce CTA suppression, and evening-moment consistency.
 *
 * Run via `bun test tests/` (wired into `bun run audit:launch`).
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MOMENT_FEATURED_TITLE_OVERRIDES,
  RETIRED_LOOK_TITLES,
  publicFeaturedTitle,
} from "@/lib/moment-display";
import { countShoppableRows, shopCtaAllowed } from "@/lib/commerce-cta-policy";
import { EVENING_MOMENT_SLUGS, isCompleteLook, isDaytimeMoment } from "@/lib/look-completeness";
import { auditMoment, runLaunchAudit } from "@/lib/launch-audit";
import { FORBIDDEN_SLOTS, REQUIRED_SLOTS } from "@/lib/product-slots";
import { resolveMomentTemplate } from "@/lib/editorial-stylist";
import { PORTOFINO_JOURNEY } from "@/lib/portofino-moment-fallbacks";
import { evaluateAtomicLook } from "@/lib/look-atomic-completeness";
import { auditLillaLooks, isLillaLookComplete, suppressedLillaLooks } from "@/lib/lilla-look-audit";
import { PREVIEW_STAGED_LOOKS, SHOPPING_EVELYN_JADE } from "@/data/previewStagedLooks";

const ROOT = join(import.meta.dir, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

// ── 1. Canonical featured headings ──────────────────────────────
describe("canonical featured headings", () => {
  test("Shopping features 'Shopping in Portofino', never 'Capri Aperitivo'", () => {
    expect(publicFeaturedTitle("shopping", "Capri Aperitivo", "Shopping")).toBe(
      "Shopping in Portofino",
    );
  });

  test("Exploring the Harbor never features 'Via Roma Boutiques'", () => {
    expect(
      publicFeaturedTitle("exploring-the-harbor", "Via Roma Boutiques", "Exploring the Harbor"),
    ).toBe("Exploring the Harbor");
  });

  test("retired legacy titles can never render for any journey moment", () => {
    for (const m of PORTOFINO_JOURNEY) {
      for (const retired of RETIRED_LOOK_TITLES) {
        const title = publicFeaturedTitle(m.moment_slug, retired, m.moment_name);
        expect(RETIRED_LOOK_TITLES.has(title)).toBe(false);
      }
      // Blank candidates fall back to override or canonical moment name.
      expect(publicFeaturedTitle(m.moment_slug, "", m.moment_name)).toBe(
        MOMENT_FEATURED_TITLE_OVERRIDES[m.moment_slug] ?? m.moment_name,
      );
    }
  });

  test("the moment route renders its heading through publicFeaturedTitle", () => {
    const src = read("src/routes/portofino.$moment.tsx");
    expect(src).toContain('from "@/lib/moment-display"');
    expect(src).toContain("publicFeaturedTitle(");
  });
});

describe("retired five-day architecture", () => {
  test("dynamic day/look route is a redirect-only tombstone", () => {
    const src = read("src/routes/portofino.$day.$look.tsx");
    expect(src).toContain("throw redirect(");
    expect(src).toContain("statusCode: 301");
    expect(src).not.toContain("findResortEditLook");
    expect(src).not.toContain("ProductCard");
    expect(src).not.toContain("price");
  });

  test("legacy priced data and rendering modules are deleted", () => {
    for (const path of [
      "src/data/portofino.ts",
      "src/data/portofinoEdit.ts",
      "src/data/lookbook.ts",
      "src/data/lookFallbacks.ts",
      "src/data/lookOverrides.ts",
      "src/lib/portofino-spec.ts",
      "src/components/ProductCard.tsx",
      "src/components/MoreFromTheEdit.tsx",
    ]) {
      expect(() => read(path)).toThrow();
    }
  });

  test("all retired look URLs have permanent canonical redirects", () => {
    const redirects = read("public/_redirects");
    for (let day = 1; day <= 5; day += 1) {
      for (const look of ["a", "b", "c"]) {
        expect(redirects).toMatch(new RegExp(`/portofino/day-${day}/look-${look}\\s+/portofino/`));
      }
    }
  });
});

// ── 2. Zero-link commerce CTA suppression ───────────────────────
describe("zero-link commerce CTA suppression", () => {
  test("policy: zero verified links → no shoppable-set CTA", () => {
    expect(shopCtaAllowed(0)).toBe(false);
    expect(shopCtaAllowed(1)).toBe(true);
  });

  test("only exact product URLs count as shoppable", () => {
    expect(
      countShoppableRows([
        { url: "" },
        { url: null },
        { url: "AFF-PLACEHOLDER-123" },
        { url: "https://retailer.com/search?q=dress" },
        { url: "https://brand.com/collections/summer" },
        { url: "https://brand.com" },
      ]),
    ).toBe(0);
    expect(
      countShoppableRows([{ url: "https://www.nordstrom.com/s/lagence-rima-dress/7854321" }]),
    ).toBe(1);
  });

  test("moment route wires the hero shop CTA through the gate", () => {
    const src = read("src/routes/portofino.$moment.tsx");
    expect(src).toContain('from "@/lib/commerce-cta-policy"');
    expect(src).toContain("shopCtaAllowed(");
    expect(src).toMatch(/showShopCta=\{/);
    expect(src).toMatch(/\{showShopCta && \(/);
  });
});

// ── 3. Footer and About conversion paths ────────────────────────
describe("footer and About conversion paths", () => {
  test("footer routes readers to Our Story, Contact, Collaborate and the legal pages", () => {
    const src = read("src/components/SiteFooter.tsx");
    expect(src).toContain('hash="our-story"');
    expect(src).toContain('hash="collaborate"');
    expect(src).toContain('to="/contact"');
    expect(src).toContain('to="/affiliate-disclosure"');
    expect(src).toContain('to="/privacy-rights"');
    expect(src).toContain('to="/privacy-policy"');
  });


  test("About page publishes every anchored section with mailto paths", () => {
    const src = read("src/routes/about.tsx");
    for (const id of ["our-story", "contact", "collaborate", "affiliate-disclosure"]) {
      expect(src).toContain(`id="${id}"`);
    }
    expect(src).toContain("mailto:hello@resortedit.com");
  });
});

// ── 4. Newsletter hardening ─────────────────────────────────────
describe("newsletter hardening", () => {
  const src = read("src/components/NewsletterForm.tsx");

  test("no debug console logging remains", () => {
    expect(src).not.toMatch(/console\.(log|debug|error|warn|info)/);
    expect(src).not.toContain("TEMP DEBUG");
  });

  test("accessible label, busy state, and live status regions", () => {
    expect(src).toContain("htmlFor={inputId}");
    expect(src).toContain('className="sr-only"');
    expect(src).toContain("aria-busy={isLoading}");
    expect(src).toContain('role="status"');
    expect(src).toContain('role="alert"');
    expect(src).toContain("aria-live=");
  });

  test("Supabase subscribe flow preserved", () => {
    expect(src).toContain("useServerFn");
    expect(src).toContain("subscribeEmail");
  });
});

// ── 5. Evening-moment consistency ───────────────────────────────
const EVENING = ["harbor-aperitivo", "sunset-views", "riviera-dinner", "nightcap"];

describe("evening-moment consistency", () => {
  test("all four evening slugs agree across completeness and audit", () => {
    for (const slug of EVENING) {
      expect(EVENING_MOMENT_SLUGS.has(slug)).toBe(true);
      expect(isDaytimeMoment(slug)).toBe(false);
      expect(auditMoment(slug, slug).momentType).toBe("evening");
    }
  });

  test("evening slot doctrine: sunglasses never required, always forbidden", () => {
    expect(REQUIRED_SLOTS.evening).not.toContain("sunglasses");
    expect(FORBIDDEN_SLOTS.evening).toContain("sunglasses");
    expect(REQUIRED_SLOTS.day).toContain("sunglasses");
  });

  test("stylist templates omit sunglasses for evening moments", () => {
    for (const name of ["Harbor Aperitivo", "Sunset Views", "Riviera Dinner"]) {
      const t = resolveMomentTemplate("Portofino", name);
      expect(t).not.toBeNull();
      expect(t?.tiers.sunglasses).toBe("omit");
    }
  });

  test("evening completeness never demands sunglasses; daytime does", () => {
    expect(isCompleteLook(["outfit", "shoes", "bag", "jewelry"], { daytime: false })).toBe(true);
    expect(isCompleteLook(["outfit", "shoes", "bag", "jewelry"], { daytime: true })).toBe(false);
  });
});

// ── 6. Launch audit hard-failure surface ────────────────────────
describe("launch audit hard-failure surface", () => {
  const audit = runLaunchAudit();

  test("no non-product URLs in curated data", () => {
    expect(audit.totals.badUrls).toBe(0);
  });

  test("no forbidden slots on any moment (incl. evening sunglasses)", () => {
    expect(audit.totals.forbiddenSlots).toBe(0);
    for (const m of audit.moments) expect(m.forbiddenPresent).toEqual([]);
  });

  test("harbor-aperitivo now audits as an evening moment", () => {
    const m = audit.moments.find((x) => x.slug === "harbor-aperitivo");
    expect(m?.momentType).toBe("evening");
  });
});

// ── 7. Atomic look completeness (preview repair) ────────────────
describe("atomic look completeness", () => {
  const rows = (...pairs: Array<[string, string]>) =>
    pairs.map(([slot, url]) => ({ slot, url }));

  test("complete Evelyn set renders: seven visible categories, seven live rows", () => {
    const verdict = evaluateAtomicLook({
      visibleProductSlots: SHOPPING_EVELYN_JADE.visibleProductSlots,
      rows: SHOPPING_EVELYN_JADE.rows,
    });
    expect(verdict.complete).toBe(true);
    expect(verdict.missing).toEqual([]);
    expect(SHOPPING_EVELYN_JADE.rows).toHaveLength(7);
  });

  test("no prices are stored on any staged row", () => {
    const json = JSON.stringify(PREVIEW_STAGED_LOOKS);
    expect(json).not.toMatch(/\$\d/);
    expect(json).not.toMatch(/"price/i);
  });

  test("sold-out hero dress + active accessories => incomplete", () => {
    const verdict = evaluateAtomicLook({
      visibleProductSlots: ["outfit", "shoes", "bag", "sunglasses"],
      rows: [
        { slot: "Dress", url: "https://us.misterzimi.com/products/evelyn-dress-in-jade", status: "sold_out" },
        ...rows(
          ["Shoes", "https://www.shopbop.com/leda-sandal-ancient-greek-sandals/vp/v=1/1513893494.htm"],
          ["Bag", "https://www.shopbop.com/moon-raffia-tote-bag-staud/vp/v=1/1590776527.htm"],
          ["Sunglasses", "https://www.shopbop.com/veneto-illesteva/vp/v=1/1531641219.htm"],
        ),
      ],
    });
    expect(verdict.complete).toBe(false);
    expect(verdict.missing).toContain("outfit");
  });

  test("shopping hero missing a bag => incomplete", () => {
    const verdict = evaluateAtomicLook({
      visibleProductSlots: ["outfit", "shoes", "bag", "sunglasses"],
      rows: rows(
        ["Dress", "https://us.misterzimi.com/products/evelyn-dress-in-jade"],
        ["Shoes", "https://www.shopbop.com/leda-sandal-ancient-greek-sandals/vp/v=1/1513893494.htm"],
        ["Sunglasses", "https://www.shopbop.com/veneto-illesteva/vp/v=1/1531641219.htm"],
      ),
    });
    expect(verdict.complete).toBe(false);
    expect(verdict.missing).toContain("bag");
  });

  test("shopping hero missing sunglasses => incomplete", () => {
    const verdict = evaluateAtomicLook({
      visibleProductSlots: ["outfit", "shoes", "bag", "sunglasses"],
      rows: rows(
        ["Dress", "https://us.misterzimi.com/products/evelyn-dress-in-jade"],
        ["Shoes", "https://www.shopbop.com/leda-sandal-ancient-greek-sandals/vp/v=1/1513893494.htm"],
        ["Bag", "https://www.shopbop.com/moon-raffia-tote-bag-staud/vp/v=1/1590776527.htm"],
      ),
    });
    expect(verdict.complete).toBe(false);
    expect(verdict.missing).toContain("sunglasses");
  });

  test("visible accessory declared but no valid linked item => incomplete", () => {
    const verdict = evaluateAtomicLook({
      visibleProductSlots: ["outfit", "shoes", "bag", "earrings"],
      rows: [
        ...rows(
          ["Dress", "https://us.misterzimi.com/products/evelyn-dress-in-jade"],
          ["Shoes", "https://www.shopbop.com/leda-sandal-ancient-greek-sandals/vp/v=1/1513893494.htm"],
          ["Bag", "https://www.shopbop.com/moon-raffia-tote-bag-staud/vp/v=1/1590776527.htm"],
        ),
        { slot: "Earrings", url: "#" },
      ],
    });
    expect(verdict.complete).toBe(false);
    expect(verdict.missing).toContain("earrings");
  });

  test("Green Eyelet on Via Roma is suppressed (visible shoes + bag unlinked)", () => {
    expect(isLillaLookComplete("shopping", "green-eyelet-on-via-roma")).toBe(false);
    const entry = auditLillaLooks().find(
      (a) => a.lookKey === "portofino/shopping/green-eyelet-on-via-roma",
    );
    expect(entry).toBeDefined();
    expect(entry?.missing.length).toBeGreaterThan(0);
  });

  test("every suppressed look reports which visible categories are unmatched", () => {
    for (const look of suppressedLillaLooks()) {
      expect(look.missing.length).toBeGreaterThan(0);
    }
  });
});
