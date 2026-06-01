# Project Memory

## Core
- Resort Edit = luxury travel stylist publication for women 35–49. Tone: editorial, destination dressing, Mediterranean/tropical luxury. Never salesy.
- Forbidden copy: "affordable", "quiet luxury", influencer language, generic ecommerce phrasing.
- No product card ships with broken image, placeholder, homepage/collection/search URL, or unavailable item — replace per sourcing rules.
- Every look must be complete: outfit/swim + shoes + bag + jewelry + sunglasses (day only) + hair detail + optional layer. Yacht looks favor hats/kaftans; evening drops sunglasses.
- Never auto-publish sourced products or flip site visibility without explicit user confirmation. Admin stays password-gated.
- All product links open in a new tab and must be product-level URLs from the approved retailer/brand allowlist.
- Editorial muse image is the styling anchor — sourced products must tangentially emulate it (silhouette, palette, print, mood) at 70–85% alignment, never literal copies.
- Brand diversity caps: primary look ≤2 products/brand; alternatives ≤1–2 products/brand per concept; entire page ≤25% from any single brand. Rotate prints + textures (tile, stripe, embroidery, eyelet, crochet, linen, raffia, silk, gauze). Never repeat the same print/brand/silhouette across every slot.
- Alternative looks must each have a distinct personality: Closest to Muse / Yacht / Beach Club / Long Lunch / Market Stroll / Sunset Cocktails. Same woman, different moment — never the same outfit formula twice.
- Source like a stylist, not a scraper: pull 3–8 candidates per slot, score on editorial match (30%) + destination fit (25%) + luxury factor (20%) + variation (15%) + affiliate/availability (10%), only promote winners. Re-search if below threshold.
- Tier mix targets: Luxury = 60–80% luxury + 20–40% premium, designer-first international. Mid-Luxe = luxury aesthetic via contemporary brands with designer accents. Destination Finds = editorial match first, must still feel elevated — never cheapen the look.
- Complete-look slot list: outfit/swim, shoes, bag, earrings, necklace, bracelet, ring OR hair accessory, sunglasses (day only), optional layer, hair detail. Never ship an incomplete look.
- Pre-publish validation (every slot, every page): working link, working thumbnail, destination fit, luxury perception, variation, editorial alignment, tier alignment, international diversity. Re-rank by Resort Edit standards — never by first-available or easiest-to-source.
- All rules apply globally: every destination, day, look, tier, alternative, and future edit inherits them automatically. No per-page exceptions.
- Sourcing pipeline order is HARD: Look DNA → source → validate → score → wardrobe → muse → publish. Muse images are generated FROM sourced products, never the reverse. Reject any flow that sources to match a fantasy image.
- Every look must have a `LookDNA` entry in `src/data/lookDNA.ts` before sourcing. Wardrobe slot list is derived from `isWaterLook`: water unlocks swim (3 bikinis / 3 bandeaus / 3 one-pieces / cover-ups), non-water disables swim and expands into dresses/separates.
- Every candidate product passes `validateCandidateProduct` (Firecrawl URL check + og:image + placeholder reject) and `evaluateScore` (7-category 1–5 scoring, weighted total ≥ 3.6, critical floors on editorialMatch/imageQuality/availability). Below threshold → reject and re-search.
- **Curated-first workflow:** Firecrawl is NOT the stylist — used ONLY for validation/maintenance (URL live, image loads, in stock, exact PDP, pricing). Products are hand-curated from the approved retailer/brand list. Validation failure → flag NEEDS REPLACEMENT, never auto-replace.
- **Hero Lock:** dresses, swimwear, matching sets, statement tops/bottoms, bags, statement shoes require editorial approval before publish. Flexible pieces (earrings, necklaces, bracelets, rings, sunglasses, hats, optional layers) may be sourced + validated automatically.
- **Sunglasses = day looks only. Hats = only contextually appropriate** (yacht/pool/beach club/boat/outdoor/market/safari/daytime sightseeing/shopping/resort stroll). Never on dinner/cocktail/nightlife/evening/sunset dinner/fine dining/indoor. Vary hat styles — no repeated straw hats.
- **Launch priority:** Portofino fully polished first. Fewer looks, stronger quality. Editorial quality > automation volume.

## Memories
- [Sourcing & product rules](mem://features/sourcing-rules) — Retailer priority, Brands We Love allowlist, international mix, replacement logic, Firecrawl workflow, aesthetic guardrails.