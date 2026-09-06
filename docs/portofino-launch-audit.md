# Portofino sitewide launch audit — current state

Generated from live production data by `auditMoments()`
(`src/lib/auto-edit-sitewide.server.ts`), viewable in the Studio at
`/admin/launch-audit`.

## Verdict

**Not launch-ready.** 0 of 12 moments pass. This is a data and integration
problem, not a code problem: the engine, the gates, the stylist verdict, the
hero pairing and the atomic activation are all implemented and tested.

| Metric | Value |
| --- | --- |
| Moments audited | 12 |
| Launch ready | 0 |
| Moments with no product records at all | 4 (espresso-morning, yacht-day, harbor-aperitivo, sunset-views) |
| Slots with stale stock evidence | 37 |

Every other moment has product rows but no complete, verified look, and no
moment has a validated hero image paired to its live outfit.

## Why nothing passes today

A live re-check of the Long Lunch product pages returned:

- `403` from Aquazzura, CELINE, Persée, Ancient Greek Sandals, Veronica Beard,
  Cinq à Sept — the retailers block server-side fetches, so stock is **unknown**,
  not "in stock".
- `404` for the Dragon Diffusion tote — genuinely dead.
- `200` with a product mismatch for the L'AGENCE Rima dress.
- Only Jenny Bird and Cara Cara verified live and in stock.

Under the publish gates, `unknown` never counts as availability, so those looks
correctly refuse to publish rather than claim a complete shoppable outfit.

## External prerequisites (cannot be solved in code)

1. **A retailer/affiliate product feed with stock and variant data** (Rakuten,
   Sovrn, Impact, or per-retailer feeds). Scraping is blocked by the exact
   retailers Resort Edit uses. Until a feed is imported successfully, stock is
   unknowable and the affiliate seam honestly reports "disconnected".
   Plain merchant links earn no commission and are never presented as if they do.
2. **Product reference imagery** for each selected product, so the muse hero can
   be generated against the actual garment and accessories rather than a
   description. Feeds normally supply this.
3. **Products for the four empty moments.** No product may be invented and no
   PDP may be guessed, so these moments stay hidden until real products exist.

## What is implemented and working

- `src/lib/portofino-moment-briefs.ts` — one enforced editorial brief per
  moment: required slots, colour story, day sunglasses, no sunglasses at night,
  hat for yacht day, cover-up at beach club and pool, walkable day shoes,
  evening heel, one jewellery designer and metal, no pearls, never a ring.
- `src/lib/auto-edit-gates.ts` — every deterministic publish gate: canonical PDP
  and retailer-domain validation, approved-merchant/brand-direct policy, stock
  evidence with a 7-day freshness limit, separates coverage (top **and**
  bottom), jewellery cohesion, real stylist verdict over real candidate ids,
  hero identity/garment/crop validation.
- `src/lib/auto-edit-sitewide.server.ts` — sitewide audit, candidate pooling
  gated *before* ranking, AI stylist verdict, muse hero pairing against the
  approved canonical identity reference only, version persistence with blocked
  reasons, atomic activation/rollback, idempotent spend-bounded jobs.
- `activate_auto_edit_version` / `rollback_auto_edit_version` database functions
  refuse to activate an incomplete look, a blocked version, a version without a
  validated matching hero, or one without an approved stylist verdict. A unique
  index guarantees one live version per look.
- `POST /api/public/auto-edit-refresh` — secret-authenticated scheduled refresh.
  Audit-only by default (no model spend); generation is opt-in, capped at
  `MAX_SPEND_UNITS_PER_RUN` and deduplicated per hour.
- `/admin/launch-audit` — the founder-facing board, admin-session gated.
- `tests/auto-edit-sitewide.test.ts` — 27 regression tests covering blocked and
  stale inventory, disallowed merchants, domain mismatch, incomplete separates,
  invalid AI verdict, hero mismatch, and evening sunglasses.

## What is scaffolded, not working

- Affiliate feed ingestion (no credentials, no successful import).
- Automatic hero regeneration on outfit change: the pairing and validation path
  is implemented, but it blocks with a stated prerequisite whenever product
  reference imagery is unavailable.
- The scheduled refresh needs an external caller (cron) pointed at the endpoint
  with the sweep secret; no scheduler is wired inside the project.
