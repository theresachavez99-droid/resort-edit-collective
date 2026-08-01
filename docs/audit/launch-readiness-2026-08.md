# Resort Edit — Launch-Readiness Audit (inspection record)

Scope: repo (34 route files), preview build, production (www.resortedit.com), Supabase backend.
Method: route-tree enumeration, static data extraction, HTTP probes of 56 curated product URLs, DB queries.

## A. Executive summary

| Priority | Count | Themes |
|---|---|---|
| Critical | 3 | 7 of 12 moments publish zero shoppable rows; product links are hardcoded in source with no verification loop; internal brand pipeline metrics were publicly readable (FIXED this turn) |
| High | 6 | Pool Lounging/Beach Club title-vs-URL contradiction; production is running a stale build (still shows "Explore the Harbor"); dead Aquazzura PDP; non-PDP Shopify `/pages/` link; `destination_moments` out of sync with `moments` (6 vs 12 rows); `vault_products` empty while 160 reference products are approved |
| Medium | 7 | Missing canonical on /portofino; poolside-glam absent from sitemap; NAP links unverifiable by probe (bot-blocked); "Founder" terminology in debug badge; no formal required-slot doctrine; look completeness unaudited; CTA language ("SHOP COMPLETE LOOK") overpromises exact-match |
| Low | 4 | Duplicate legacy day-1..day-5 redirects retained (correct, 301); /my-edit is noindex (canonical unnecessary); debug badge visible only with ?debug; minor copy drift |

## B. Route audit (summary)

Keep: `/`, `/portofino`, `/portofino/$moment` (12 slugs), `/portofino/pool-lounging/poolside-glam`, `/resort-edits`, `/brands`, `/destinations`, `/about`, `/sitemap.xml`.
Redirect (301, verified working): `day-1`…`day-5`, `via-roma-boutiques`, `market-morning`, `market-strolls`, `pool-lounging-shopping`, `beach-club-long-lunch`.
Admin (gated by HMAC cookie in `src/routes/admin.tsx`): dashboard/Studio, looks, brands, moments, destination-moments, editorial-memory, inventory-health, day-images, buying-office, system.
Development-only: seed/backfill server fns, already gated behind `requireSeedEnvironment` + `ADMIN_ALLOW_SEEDS`.

## C. Product-link audit

- 56 curated URLs probed. Confirmed dead: `aquazzura.com/us/love-link-slingback-50-...` → 301 to `/eu_en` region landing.
- Confirmed non-PDP: `jenny-bird.com/pages/nouveaux-puffs` (Shopify content page).
- Unverifiable by probe (403/429/connection reset — Net-a-Porter, Mytheresa, Neiman Marcus): require manual confirmation. Not treated as broken.
- Affiliate status and stock/size availability cannot be determined programmatically; not asserted.

## D. Complete-look audit

Only 5 of 12 moments have curated rows in `momentShopCurated.ts` (beach-club, long-lunch, riviera-dinner, nightcap, pool-lounging). The remaining 7 render no shop rows. A required-slot doctrine (outfit, shoes, bag, earrings, necklace-or-omission, bracelet, ring, sunglasses, layer, hat where applicable; evening = no sunglasses) is not yet encoded — proposed for a later batch.

## E. Duplicate / legacy

No orphaned public routes found. Legacy day-* slugs are redirect-only and should stay.

## F. Backend streamlining (proposed, not executed)

Target IA: Dashboard · Looks · Editorial Intelligence · Brands · Catalog & Inventory · System. Merge `destination-moments` into Moments, `day-images` into Catalog, `editorial-memory` into Editorial Intelligence.

## G. Editorial decisions required

1. Pool Lounging / Beach Club: keep swapped display names on the original URLs, or migrate URLs to match names (needs 301s)?
2. The 7 zero-shop moments: publish editorial-only (no shop CTA), or hold them out of the sitemap until sourced?
3. Aquazzura Love Link and Jenny Bird Nouveaux Puffs: pick replacements or keep as omissions?

## H. Remediation order

Batch 1 (this turn, safe/reversible): link-policy hardening, dead-link omissions, canonical + sitemap gap, terminology.
Batch 2: required-slot doctrine + omission rendering.
Batch 3: `destination_moments` ↔ `moments` reconciliation.
Batch 4: admin IA consolidation.
Batch 5: editorial decisions from section G.
