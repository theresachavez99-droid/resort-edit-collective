---
name: Personal shopper architecture
description: Phase 2 doctrine — Resort Edit is a luxury destination styling engine, not a product search engine. Defines Look DNA, outfit slots, scoring axes, and the luxury-shopper test.
type: feature
---

# Resort Edit Phase 2 — Luxury Personal Shopper Engine

## Doctrine
Resort Edit emulates a luxury personal shopper + destination stylist. It answers
"What would a wealthy, stylish woman actually wear here?" — not "find me products."
Products serve the look. The look is never built around products.

## Workflow hierarchy (immutable order)
Destination → Activity → Emotional Energy → Look DNA → Complete Outfit Assembly →
Product Selection → Muse Generation → Publication.
Never reverse. Never skip Look DNA. Never generate the muse before products.

## Look DNA (required before sourcing)
Every look has a structured DNA profile:
- destination, activity, energy
- style notes (e.g. relaxed luxury, old-money coastal)
- color story, print story
- silhouette, accessories, hair detail
Sourcing is forbidden until Look DNA exists.

## Product Vault rules
Vault is the primary source. Sourcing engine runs ONLY when the Vault lacks
qualified inventory for the Look DNA requirements. Reuse products across looks
whenever Look DNA allows. Never re-scrape cached URLs.

## Sourcing engine
Order: Destination → Activity → Look DNA → Product Requirements → Search → Ranking → Review.
Dry run is mandatory before PDP scraping. Dry run must validate: brand coverage,
retailer coverage, candidate quality, diversity, and PDP-only URLs.

## Dry-run quality gate
Allow: real product detail pages on approved retailers.
Block: designer landing pages, category pages, editorial/magazine/journal,
collection pages, search results, lookbook indexes, gift guides.
Enforce retailer-specific PDP patterns (e.g. Mytheresa `-p\d{6,}`,
Net-a-Porter `/shop/product/.../\d{6,}$`, ModaOperandi `_cod\d+\.html`).

## Brand collection cap
Maximum 3 products per brand, enforced inline during collection (not post-hoc).
Goal: prevent two brands from consuming all candidate slots.

## Brand universe — Yacht Day (example)
Eligible if tagged Yacht Day: swimwear, coverups, resortwear, Mediterranean print,
luxury vacation brands. A brand is eligible even if classified primarily as
dresses, coverups, or resortwear — Yacht Day activity tag is what gates eligibility.

## Product validation (all must pass before approval)
Approved brand · approved retailer · working URL · working image · real product
photography · in stock · luxury positioning · Resort Edit DNA match.
Reject: broken images, sketches, renderings, placeholders, dead links, low-quality
photography, out-of-stock items.

## Product scoring axes
destination fit · activity fit · energy fit · luxury signal · editorial interest ·
wealthy-traveler energy · print quality · color story · brand alignment ·
brand diversity contribution · discovery value · Resort Edit DNA match.

## Approval layer (never bypassed)
All sourced products enter `sourced_products` with status='pending' for human
review. Approved items are promoted to `vault_products` with approval_status='approved'.
No code path auto-approves.

## Complete outfit slots
Hero piece (swimwear/dress) · coverup (if applicable) · shoes · bag · earrings ·
necklace · bracelet and/or ring · sunglasses · optional: headscarf, hat, beauty
accent, layer. Every slot must contribute to a coherent styling story.

## Luxury personal shopper test
Before publishing a look ask: "Would a luxury personal shopper actually style
these items together?" If no → reject the outfit regardless of individual product
scores. This test outweighs per-product rankings.

## Muse generation rules
Generate muse imagery only after: Look DNA approved, products approved, outfit
assembled, styling validated. Products drive imagery — never the reverse.

## Discovery targets
30% Hero brands / 70% Discovery brands. Most brands appear 1–3 times per
destination. Brand diversity contributes positively to scoring. Users should
discover brands they did not previously know.