---
name: sourcing-rules
description: Resort Edit master sourcing + product rules — retailer priority, Brands We Love allowlist, international mix, replacement logic, Firecrawl workflow, aesthetic guardrails.
type: feature
---

# Resort Edit Master Sourcing + Product Rules

Mission: source like a luxury travel stylist for wealthy women 35–49. Priorities: Mediterranean luxury, tropical elegance, destination dressing, yacht-to-lunch versatility, globally sourced style, editorial cohesion, human-approved curation. Never generic ecommerce.

## 1. Sourcing hierarchy (in order)
1. Approved affiliate retailers (PRIMARY)
2. Brands We Love allowlist (CURATION FILTER)
3. Direct brand sites (FALLBACK)
4. Replacement pool (LAST RESORT)

Never source randomly outside the allowlist.

## 2. Affiliate retailer priority
Luxury / Designer: Net-a-Porter, MyTheresa, Farfetch, Moda Operandi, Saks, Neiman Marcus, Bergdorf Goodman, Harrods, Luisaviaroma, FWRD, SSENSE, 24S.
Premium: Revolve, Shopbop, Nordstrom, Bloomingdale's, Intermix.
Swim/Resort: Everything But Water.
Travel/Experiences: Booking, Hotels, Viator, GetYourGuide.

Use retailer product pages first for affiliate monetization, images, availability, and replacement flexibility.

## 3. Brands We Love (aesthetic allowlist)
Brands define aesthetic. Retailers source products. Do not confuse the two.

- Swim + beachwear: Melissa Odabash, Agua by Agua Bendita, Johanna Ortiz, Zimmermann, Hunza G, Pucci, Oséree, Maygel Coronel, Marysia, Missoni Mare, Eres, Bond-Eye, Agua Bendita, MC2 Saint Barth, Stefania Frangista.
- Dresses + resortwear: Alemais, Faithfull, SIR, Posse, PatBO, Camilla, Etro, La DoubleJ, Farm Rio, Rhode, Silvia Tcherassi, Devotion Twins, CeliaB, Leo Lin, Alexis, Loretta Caponi, Emporio Sirenuse, Mimi Liberté, Mestiza, Kivari.
- Accessories + bags: Dragon Diffusion, Cult Gaia, Loewe, Poolside, Aranaz, Kayu, Heimat Atlantica, Lalingi.
- Jewelry: Jennifer Meyer, Jenny Bird, Mejuri, Ben-Amun, Missoma, Gas Bijoux, Completedworks, Oradina, Brinker + Eliza.
- Footwear: Ancient Greek Sandals, Aquazzura, Emme Parsons, Loeffler Randall, Castañer, Biankina, Amanu, K Jacques.

## 4. International mix targets
- 35–40% Mediterranean / European
- 25–30% Latin American
- 15–20% Australian
- 15–20% US

Avoid pages dominated by one retailer, US-only mixes, or Revolve-heavy pages.

## 5. Complete outfit rules
Every look includes: outfit or swimwear, shoes, bag, jewelry, sunglasses (day), hair detail, optional layer.
- Yacht looks: prefer hats and kaftans.
- Evening: remove sunglasses.

## 6. Image rules
Broken images are never acceptable. If image fails: repair; if repair fails, replace product immediately. Never show broken thumbnails, icon placeholders, missing images, blank boxes, raw alt text, or generic placeholders.

## 7. Replacement logic
If a product is unavailable, replace with same category, color family, destination mood, tier, silhouette, and styling role. Priority: editorial match > destination fit > affiliate availability > brand quality.

## 8. Product card requirements
Every card must have real thumbnail, product name, brand, price, product-level URL, affiliate URL when available, and open in a new tab. Never use homepage links, collection pages, search results, or broken URLs.

## 9. Firecrawl workflow
Missing slot → Firecrawl searches allowlist only → return 3–5 candidates → show in admin → approve manually → promote to live. Never auto-publish.

## 10. Aesthetic guardrails
Target: Mediterranean, tropical luxury, beach club polished, yacht style, long lunch energy, global traveler.
Avoid: fast fashion energy, clubwear, bodycon overload, Amazon-coded products, overly revealing items, generic basics.

Goal: luxury editorial publication + personal shopper.

## 11. Editorial muse matching rule
The approved AI editorial image is the styling anchor for every look. All sourced products and outfit alternatives must tangentially emulate it — never literal copies.

Match: silhouette, color palette, print direction, mood, level of polish, destination appropriateness, styling energy, fabric movement, proportion.

- Example: muse in white textured maxi + raffia bag → source similar white textured dresses, raffia textures, resort sandals, jewelry mood. Not random black dresses, unrelated colors, or different destination energy.
- Print rule: if the editorial image features Mediterranean prints, tile motifs, lemon motifs, blue/white palettes, or tropical prints, prefer products that echo those themes.
- Fit rule: products should visually feel like they belong in the same suitcase.
- Layer rule: kaftans, scarves, jewelry, bags, and accessories should support the editorial image, not compete with it.
- Variation rule: alternative products should feel 70–85% stylistically aligned — never 100% duplicates. Avoid cloning the muse look repeatedly.

Goal: the customer recognizes the editorial image and immediately understands why each sourced product belongs in the look.

## 12. Variation + muse diversity
Muse image is inspiration, never duplication. Target 70–85% alignment, 15–30% differentiation. Forbidden: repeated prints across every slot, repeated brands across every slot, repeated silhouettes, repeated fabrics, identical color stories on every product, the same motif everywhere.

## 13. Brand diversity caps
- Primary look: max 2 products per brand.
- Alternative section: max 1–2 products per brand per outfit concept.
- Entire page: max 25% from any single brand.
If a brand exceeds the cap, replace automatically.

## 14. Print + texture rotation (Mediterranean)
Rotate across: tile prints, blue/white stripes, ivory textures, embroidery, eyelet, crochet, linen, raffia, coastal neutrals, subtle florals, geometric/tropical motifs. Rotate fabrics: linen, crochet, raffia, eyelet, silk, cotton voile, woven leather, textured cotton, gauze. Never repeat the same print family across all alternatives.

## 15. Alternative-look personalities
Each alternative on a look page is a distinct personality — same woman, different moment:
- ALT 1 = Closest to muse
- ALT 2 = Softer / elevated long lunch
- ALT 3 = Beach club interpretation
- ALT 4 = Yacht interpretation
- ALT 5 = Market stroll interpretation
- ALT 6 = Sunset cocktails interpretation
Match through silhouette, proportion, movement, layering, destination energy, color story, polish — not duplication.

## 16. Top-tier sourcing + scoring engine
For every product slot:
1. Source 3–8 candidates from approved affiliate retailers → Brands We Love allowlist → direct brand sites.
2. Score each candidate (Resort Edit score):
   - Editorial match (30%) — muse mood, silhouette, layering, movement, destination energy.
   - Destination fit (25%) — yacht, market stroll, beach club, long lunch, sunset cocktails, Mediterranean/tropical luxury.
   - Luxury factor (20%) — fabric, construction, designer pedigree, polish.
   - Variation (15%) — reward texture/print/brand/color diversity; penalize duplicate brands, repeated prints, repetitive silhouettes.
   - Affiliate + availability (10%) — working link, in stock, affiliate eligible, working thumbnail.
3. Promote only the highest-scoring winners. If no candidate clears threshold, re-search.

## 17. Hard-fail conditions (auto-replace)
Replace any product immediately when: thumbnail broken, product unavailable, generic/homepage link, duplicate brand overload, weak editorial match, category mismatch, repetitive styling. Never surface low-scoring products.