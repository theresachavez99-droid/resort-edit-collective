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

  test("does not claim analytics or advertising trackers we do not load", () => {
    expect(src).toContain("We do not load advertising or analytics trackers");
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

  test("privacy choices page does not fake an opt-out toggle", () => {
    const src = read("src/routes/privacy-rights.tsx");
    expect(src).toContain("no cookie banner");
    expect(src).toContain("We do not sell or share personal information");
  });

  test("affiliate disclosure explains AI-created imagery honestly", () => {
    const src = read("src/routes/affiliate-disclosure.tsx");
    expect(src).toContain("AI image generation");
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

  test("booking wording never claims commission or endorsement", () => {
    expect(notice).toContain("We are not paid for these bookings");
    expect(notice).toContain("not affiliated with or endorsed by the venues");
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

  test("the eco-farm card shows no borrowed venue photograph", () => {
    const src = read("src/data/destinationExperiences.ts");
    const entry = src.slice(src.indexOf("portofino-la-portofinese-eco-farm"));
    const block = entry.slice(0, entry.indexOf("featured:"));
    expect(block).toContain("image: null");
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
