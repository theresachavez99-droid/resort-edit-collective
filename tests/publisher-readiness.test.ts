import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";

const read = (p: string) => readFileSync(p, "utf8");

describe("privacy policy tells the truth about what runs", () => {
  const src = read("src/routes/privacy-policy.tsx");

  test("claims no affiliate-network memberships we have not been accepted into", () => {
    for (const network of ["RewardStyle", "LTK", "ShopMy", "Skimlinks", "Amazon Associates"]) {
      expect(src).not.toContain(network);
    }
  });

  test("makes limited, accurate statements about advertising and tracking", () => {
    expect(src).toContain("do not include an advertising or audience-analytics tag");
    expect(src).toContain("hosting platform may run its own");
    // No categorical absolutes we cannot verify across host telemetry.
    expect(src).not.toContain("We do not load advertising or analytics trackers");
    expect(src).not.toContain("receive nothing about you from us");
    expect(src).not.toContain("pixels");
  });

  test("describes the newsletter as stored consent, not an immediate email", () => {
    expect(src).toContain("records your consent");
    expect(src.toLowerCase()).not.toContain("check your inbox");
  });

  test("no tracking scripts are actually loaded in the root document", () => {
    const root = read("src/routes/__root.tsx");
    for (const bad of ["googletagmanager", "gtag/js", "plausible.io", "analytics.js", "fbevents"]) {
      expect(root).not.toContain(bad);
    }
  });
});

describe("dedicated legal and contact routes exist", () => {
  const routes = readdirSync("src/routes");
  for (const file of [
    "contact.tsx",
    "privacy-rights.tsx",
    "affiliate-disclosure.tsx",
    "privacy-policy.tsx",
  ]) {
    test(`${file} is a real route`, () => {
      expect(routes).toContain(file);
    });
  }

  test("every legal route is reachable from the sitewide footer", () => {
    const footer = read("src/components/SiteFooter.tsx");
    for (const to of ["/contact", "/privacy-rights", "/affiliate-disclosure", "/privacy-policy"]) {
      expect(footer).toContain(`to="${to}"`);
    }
  });

  test("privacy choices page does not fake an opt-out toggle or overclaim", () => {
    const src = read("src/routes/privacy-rights.tsx");
    expect(src).toContain("no consent banner or opt-out toggle");
    expect(src).toContain("We do not sell or rent newsletter subscriber lists");
    expect(src).not.toContain("That is the whole list");
    expect(src).not.toContain("we never have");
  });

  test("affiliate disclosure explains AI-created imagery honestly", () => {
    const src = read("src/routes/affiliate-disclosure.tsx");
    expect(src).toContain("AI image generation");
    expect(src).not.toContain("is hidden instead of shown incomplete");
    expect(src).not.toContain("retailer that actually stocks it");
    expect(src).not.toContain("boringly honest");
    expect(src).toContain("can differ from the product photography");
    expect(src).not.toContain("Rakuten");
  });
});

describe("commission disclosure appears before shopping and booking links", () => {
  const notice = read("src/components/CommissionNotice.tsx");

  test("shop wording promises no fee to the reader and links to the full text", () => {
    expect(notice).toContain("at no extra cost to you");
    expect(notice).toContain('to="/affiliate-disclosure"');
  });

  test("booking wording is accurate about operator and platform links", () => {
    expect(notice).toContain("open the listed operator or booking platform");
    expect(notice).toContain("not commission-bearing");
    expect(notice).not.toContain("operator's own page");
  });

  for (const file of [
    "src/components/commerce/ShopTheLookItems.tsx",
    "src/components/commerce/ResortEditItemization.tsx",
    "src/components/experiences/ExperienceCollection.tsx",
    "src/components/experiences/FeaturedExperiences.tsx",
  ]) {
    test(`${file} renders the notice`, () => {
      expect(read(file)).toContain("<CommissionNotice");
    });
  }
});

describe("no invented content on public pages", () => {
  test("destination cards do not publish invented edit counts", () => {
    const src = read("src/routes/destinations.tsx");
    expect(src).not.toContain("editsBySlug");
    expect(src).not.toContain("edits</span>");
  });

  test("the eco-farm card uses a labelled illustration, not a venue photo", () => {
    const src = read("src/data/destinationExperiences.ts");
    const entry = src.slice(src.indexOf("portofino-la-portofinese-eco-farm"));
    const block = entry.slice(0, entry.indexOf("featured:"));
    expect(block).toContain("ecoFarmVineyard.url");
    expect(block).toContain("imageIsIllustrative: true");
    expect(block).toContain("AI-generated");
    expect(block).toContain("not a photograph of La Portofinese");
    expect(block).not.toContain("expHarbor");
  });


  test("experience cards handle a missing image without a broken <img>", () => {
    for (const file of [
      "src/components/experiences/ExperienceCard.tsx",
      "src/components/experiences/MomentExperience.tsx",
    ]) {
      expect(read(file)).toContain("e.image ?");
    }
  });
});
