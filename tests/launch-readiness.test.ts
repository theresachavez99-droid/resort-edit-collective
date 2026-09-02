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
  test("footer Our Story / Contact / Collaborate point at distinct anchors", () => {
    const src = read("src/components/SiteFooter.tsx");
    expect(src).toContain('hash="our-story"');
    expect(src).toContain('hash="contact"');
    expect(src).toContain('hash="collaborate"');
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
