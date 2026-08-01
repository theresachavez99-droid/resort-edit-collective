# Resort Edit — Launch-Readiness Audit (inspection complete, no edits made)

Verified against: repo (34 route files), live production `resortedit.com`, backend records, and 56 live product-URL probes.

## A. Executive summary

| Priority | Count | Headline |
|---|---|---|
| Critical | 4 | Half the site is not shoppable; product URLs unverifiable/broken; slug↔label contradiction on 2 moments |
| High | 6 | No complete-look model; stale backend moment table; naming drift; www 302; admin IA sprawl |
| Medium | 7 | Missing canonicals, sitemap gaps, URL-policy false negatives, `?debug=1` leak, editorial-card omission model, brand tiering, subpage discoverability |
| Low | 5 | Copy/title polish, orphan legacy routes, MCP surface, image weight, minor a11y |

**Critical**
1. **Shop coverage: 6 of 12 moments ship zero product links.** Live SSR link counts: `pool-lounging` 9, `long-lunch` 7, `riviera-dinner` 6, `arrival` 2, `exploring-the-harbor` 1, `beach-club` 1, `nightcap` 1, and **0** for `espresso-morning`, `yacht-day`, `shopping`, `harbor-aperitivo`, `sunset-views`. (Counts exclude fonts/Instagram; client-only expanders may add a few.)
2. **Product links cannot be certified.** 1 confirmed broken: Aquazzura "Love Link Slingback 50" redirects to `aquazzura.com/eu_en` (region landing) — a generic redirect, must not ship. All 9 Net-a-Porter URLs returned connection failures (0/ERR) and their ID pattern (`16475973…`) repeats suspiciously — unverified, possibly invalid. 12 Bloomingdale's/Neiman/Jimmy Choo returned 403 and 11 brand-direct returned 429 (bot blocks) — **status unknown, not "working"**. Verified 200 + exact PDP: 8 Mytheresa, 5 Shopbop, 3 Nordstrom, 1 Revolve, 1 L'AGENCE, 1 Celine.
3. **`jenny-bird.com/pages/nouveaux-puffs` is a collection page, not a PDP** and passes `shop-url-policy.ts` because no `/pages/` rule exists — the publish guard has a hole.
4. **URL/label contradiction:** `/portofino/pool-lounging` renders and titles as **"Beach Club"**, `/portofino/beach-club` as **"Pool Lounging"** (verified in live `<title>`). Intentional to protect SEO, but currently self-contradicting in URL, breadcrumb, and share links.

**High**
5. No "complete look" data model: no `hair`, `hat`, or `optional layer` slot anywhere in curated data; `unsourced: true` (the only explicit-omission flag) exists in `lookOverrides.ts` and is used in exactly one look (Nightcap, 7 slots), and is **absent entirely** from `momentEditorialCards.ts` — a gap there is indistinguishable from an oversight.
6. `destination_moments` table is stale: 6 rows with obsolete slugs (`arrival-day`, `market-morning`) while `moments` correctly holds all 12 canonical rows + a `__unassigned__` draft.
7. Naming drift confirmed live: `/portofino/exploring-the-harbor` titles as **"Explore the Harbor"**.
8. `www.resortedit.com` → apex is a **302**, not 301 (dilutes canonical consolidation).
9. Admin sprawl: 15 admin routes; `product-vault`/`inventory-health` and `looks`/`hero-outfit` are duplicate surfaces over one entity; `subscribers` and `day-images` fit no proposed module.
10. `vault_products` is empty (0 rows) while `founder_reference_products` holds 160 approved rows — the "catalog" module has no data behind it.

**Medium/Low**: `brands`, `destinations`, `index`, `my-edit` lack `rel=canonical`; sitemap omits `/portofino/pool-lounging/poolside-glam`; `?debug=1` renders a "Founder Look" badge publicly (`portofino.$moment.tsx:497`); brand tiering in `/brands` not aligned to signature/frequent/discovery/product-only/excluded; 5 legacy day routes + `$day/$look` correctly 301 (verified) but remain orphaned; MCP endpoint returns 406 on GET (correct, but publicly enumerable).

**Not broken (verified good):** admin is genuinely gated (`/admin` returns the password shell only); seeds gated by `ADMIN_ALLOW_SEEDS`; `robots.txt` disallows `/admin` and blanket-blocks non-prod hosts; sitemap is data-driven from `PORTOFINO_JOURNEY` so it cannot drift; all 12 homepage moment cards link correctly; affiliate disclosure links from footer to `/about#affiliate-disclosure`; every moment has card + editorial imagery; 404 handling works.

## B–E. Audit tables

Delivered as four read-only artifacts generated in Batch 0, so they stay reproducible rather than becoming a stale document:
- **B. Route audit** — `docs/audit/routes.md`: route, type, purpose, data source, overlap, status, recommendation, target module, migration risk for all 34 route files.
- **C. Product-link audit** — `docs/audit/product-links.csv`: page, look, slot, brand, product, retailer, source URL, final URL, HTTP status, redirect count, exact-match verdict, colorway, stock, affiliate status, action. Bot-blocked rows are marked `UNVERIFIED — manual check required`, never "OK".
- **D. Complete-look audit** — `docs/audit/looks.md`: per look, required slots vs filled vs explicitly omitted vs silently missing, broken links, editorial-match class (exact / strong inspired-by / acceptable / weak / misleading), launch verdict.
- **E. Duplicate/legacy audit** — `docs/audit/legacy.md`: canonical route, current behaviour, redirect status, dependencies, removal recommendation.

## F. Backend streamlining plan (proposal, no code yet)

Final IA — six modules:

| Module | Absorbs | Action |
|---|---|---|
| Dashboard | `admin/` + `LaunchAuditPanel` | keep, add launch-readiness scoreboard |
| Looks | `admin/looks`, `admin/hero-outfit/$id` | merge as build → review → publish tabs |
| Editorial Intelligence | `admin/editorial-memory`, `admin/destination-moments`, `admin/moments`, `admin/moments/$id/run` | merge; `destination-moments` becomes read-only after table reconciliation |
| Brands | `admin/brands` | keep |
| Catalog & Inventory | `admin/product-vault`, `admin/inventory-health` | merge into one surface with a Health tab |
| System | `admin/system`, `admin/day-images`, `admin/subscribers` | merge; keep seeds env-gated |

Kept data models: `moments`, `moment_runs`, `brands`, `founder_reference_products`/editorial memory, `look_candidates`, product vault. Archived (no deletes this pass): `destination_moments` + `destination_moment_archetypes` (after migrating anything still read from them), `editorial_collections*`. Redirects retained: `admin/founder-looks` → `admin/looks`. Nothing dropped until the route audit proves zero readers.

## G. Editorial Decisions Required (needs you, cannot be fixed safely)

1. **Pool Lounging / Beach Club:** keep swapped labels on existing URLs (status quo, contradictory), or migrate slugs with 301s so URL matches label?
2. **Aquazzura Love Link Slingback** (Long Lunch) — dead link. Mark unsourced, or approve a replacement heel?
3. **Nightcap** — 7 of 8 slots unsourced. Publish as a single-product editorial, or hold the moment until sourced?
4. **6 zero-shop moments** — publish as inspiration-only with softened CTA language, or hold from the launch set?
5. **9 Net-a-Porter links** unverifiable — re-source via a verified retailer, or accept and monitor?
6. **Complete-look doctrine** — is `hair` / `hat` / `optional layer` genuinely required, or is the required set outfit + shoes + bag + earrings + one neck piece + hand/wrist + sunglasses (day only)?
7. **Brand tiering** — confirm the signature / frequent / discovery / product-only / accessories / excluded assignment before `/brands` is restructured.

## H. Remediation order (small reversible batches)

- **Batch 0 — Evidence (no behaviour change):** generate the B–E artifacts and a repeatable link-prober script. Zero risk.
- **Batch 1 — Truth in labelling:** fix "Explore the Harbor" → "Exploring the Harbor"; add missing canonicals; add `/poolside-glam` to sitemap; remove the `?debug=1` "Founder Look" badge; request 301 for www→apex. Copy/meta only.
- **Batch 2 — Link safety:** add `/pages/` and region-landing rules to `shop-url-policy.ts`; mark the Aquazzura link and any confirmed-dead link `unsourced`; extend the build-time audit to fail on non-PDP and on redirect-to-landing. No editorial substitutions.
- **Batch 3 — Completeness model:** add the explicit-omission field to `momentEditorialCards.ts`, formalise the required-slot doctrine (per your G6 answer), and surface per-look completeness in the Dashboard. Data-model only.
- **Batch 4 — Backend reconciliation:** verify readers of `destination_moments`, migrate/retire it, and seed or retire the empty product vault.
- **Batch 5 — Admin IA consolidation:** implement the six modules with redirects from every old admin path; no CRUD deleted until the new surface is proven.
- **Batch 6 — CTA + launch gating:** align CTA language to the editorial-match class per look, and apply your G1/G3/G4 decisions.

Public visual design is untouched throughout; no product availability or affiliate status will be invented; no hero product replaced automatically.
