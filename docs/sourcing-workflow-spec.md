# Sourcing Workflow — Spec

_Status: spec only — implementation pending approval._

## Goal

Semi-automated product sourcing for every View Full Look slot.
Resort Edit functions as a personal shopper, not an autonomous retailer:
**every promotion to live requires human approval.**

## Outcomes

- Editor opens `/admin/product-library`, sees the slots that are still
  "Sourcing in progress" (placeholder) or flagged stale.
- One click triggers a Firecrawl search restricted to an approved retailer
  allowlist. 3–5 candidate products come back per slot.
- Editor reviews candidates inline. **Approve** promotes the chosen product
  into the live look (replacing the placeholder or previous pick).
  **Reject** discards it and offers to search again with refined intent.
- The system records the full provenance: who approved it, from which
  retailer, the affiliate URL, when it was last checked, and the history
  of prior products in this slot.

## Non-goals

- No automatic promotion. Ever.
- No price-monitoring autobot. Stock/price re-checks are a cron job that
  flags items for re-sourcing — it does not swap them silently.
- No general-web crawl. Searches are scoped to the retailer allowlist.

---

## Data model

Two new tables, plus an extension to the existing `sourced_products`.

### `retailer_allowlist`

| column            | type        | notes                                                |
| ----------------- | ----------- | ---------------------------------------------------- |
| `id`              | uuid        | pk                                                   |
| `domain`          | text unique | e.g. `net-a-porter.com`                              |
| `display_name`    | text        | e.g. "Net-a-Porter"                                  |
| `tier`            | text        | `luxury` · `mid` · `riviera`                         |
| `affiliate_prefix`| text null   | optional rewrite template for affiliate links        |
| `is_active`       | boolean     | default `true`                                       |
| `notes`           | text null   |                                                      |
| `created_at`      | timestamptz |                                                      |

Seed set (initial proposal — editable in admin):

- Luxury: `net-a-porter.com`, `mytheresa.com`, `matchesfashion.com`,
  `farfetch.com`, `ssense.com`, `modaoperandi.com`
- Mid: `shopbop.com`, `revolve.com`, `nordstrom.com`,
  `intermixonline.com`, `theoutnet.com`
- Riviera Finds: `anthropologie.com`, `freepeople.com`, `cuyana.com`,
  `sezane.com`, `reformation.com`, `madewell.com`

### `slot_candidates`

One row per candidate returned by a Firecrawl search. Lives alongside
`sourced_products` but represents an *unreviewed* suggestion.

| column            | type        | notes                                               |
| ----------------- | ----------- | --------------------------------------------------- |
| `id`              | uuid        | pk                                                  |
| `search_id`       | uuid        | fk → `slot_searches.id`                             |
| `day`             | int         | 1–5                                                 |
| `look`            | int         | 1–3                                                 |
| `tier`            | text        | `luxury` · `mid` · `riviera`                        |
| `slot_category`   | text        | `outfit` · `shoes` · `bag` · `jewelry` · `sunglasses` · `hairDetail` · `layer` |
| `retailer_domain` | text        |                                                     |
| `brand`           | text        |                                                     |
| `product_name`    | text        |                                                     |
| `price`           | numeric null|                                                     |
| `currency`        | text        | default `USD`                                       |
| `image_url`       | text        |                                                     |
| `source_url`      | text        | product page                                        |
| `affiliate_url`   | text null   | filled in on approval                               |
| `score`           | numeric null| visual/textual similarity heuristic (0–1)           |
| `raw_extraction`  | jsonb       | Firecrawl raw response                              |
| `status`          | text        | `pending` · `approved` · `rejected` (default pending) |
| `reviewed_by`     | text null   | admin label / email                                 |
| `reviewed_at`     | timestamptz |                                                     |
| `created_at`      | timestamptz |                                                     |

### `slot_searches`

One row per Firecrawl run. Lets us reproduce and audit.

| column           | type        | notes                                              |
| ---------------- | ----------- | -------------------------------------------------- |
| `id`             | uuid        | pk                                                 |
| `day`            | int         |                                                    |
| `look`           | int         |                                                    |
| `tier`           | text        |                                                    |
| `slot_category`  | text        |                                                    |
| `query`          | text        | composed Firecrawl query                           |
| `intent_notes`   | text null   | editor's free-text styling cue ("textured white maxi") |
| `retailers_used` | text[]      | resolved allowlist domains hit                     |
| `result_count`   | int         |                                                    |
| `status`         | text        | `running` · `complete` · `error`                   |
| `error_message`  | text null   |                                                    |
| `created_by`     | text null   |                                                    |
| `created_at`     | timestamptz |                                                    |

### Extend `sourced_products`

Add provenance + lifecycle columns:

- `last_checked_at` timestamptz
- `previous_product_id` uuid null — fk self-reference for replacement history
- `replacement_reason` text null — `out_of_stock` · `editor_swap` · `price_change` · `manual`
- `approved_by` text null
- `approved_at` timestamptz null
- `is_live` boolean default false — only `true` after admin promotion

All tables: RLS enabled, admin-only (no public read), service_role only for
server functions. Same `resortedit2026` gate continues to protect
`/admin/product-library`.

---

## Server functions (TanStack `createServerFn`)

File: `src/lib/sourcing.functions.ts`.

All functions require the admin password (same pattern as
`subscribers.functions.ts`).

1. `searchSlotCandidates({ day, look, tier, slot_category, intent_notes? })`
   - Looks up active retailers for the tier from `retailer_allowlist`.
   - Composes Firecrawl `search` query:
     `"<slot intent> site:domain1 OR site:domain2 …"`
     where `<slot intent>` is derived from the look's editorial copy plus
     the editor's `intent_notes`. Example: `"white textured eyelet maxi
     dress site:net-a-porter.com OR site:mytheresa.com"`.
   - Limit 5 results, scrape format `markdown` + `links` + product
     metadata via Firecrawl's structured `json` extractor with a small
     schema: `{ brand, product_name, price, currency, image_url }`.
   - Writes one `slot_searches` row + up to 5 `slot_candidates` rows.
   - Returns the candidates for inline display.

2. `approveCandidate({ candidate_id })`
   - Marks the candidate `approved`.
   - Creates a new `sourced_products` row from the candidate, sets
     `is_live = true`, `approved_by`, `approved_at`, `last_checked_at`.
   - If a previous live product existed for this `{day, look, tier,
     slot_category}`, sets `is_live = false` on it and writes the new
     row's `previous_product_id` for history.

3. `rejectCandidate({ candidate_id, reason? })`
   - Marks the candidate `rejected`. Search can be re-run with refined
     `intent_notes`.

4. `recheckLiveProducts()` (cron, weekly)
   - For each `sourced_products` row with `is_live = true`, refetch the
     `source_url` via Firecrawl `scrape`. If 404 / no price / out-of-stock,
     set `replacement_reason = 'out_of_stock'` and surface in admin as
     "needs re-sourcing". Never auto-swaps.

5. `listSlotsNeedingSourcing({ day?, look?, tier? })`
   - Returns the set of `{day, look, tier, slot_category}` tuples that
     are either (a) currently rendered as placeholders in
     `src/data/lookbook.ts` (no live `sourced_products` row) or (b) flagged
     for re-sourcing.

---

## Admin UI changes — `/admin/product-library`

New layout, three columns:

1. **Slots needing sourcing** — grouped by Day → Look → Tier. Each slot
   row shows the placeholder hint + a `[Search]` button.
2. **Candidates** (right panel) — populated after a search. Each card:
   thumbnail, brand, name, price, retailer badge, `[Approve]`,
   `[Reject]`, `[Open source ↗]`.
3. **Live products** (bottom) — filterable by day/look/tier. Each row
   shows last-checked date, replacement history count, `[Re-source]`.

Same password gate (`resortedit2026`) as today.

---

## Firecrawl integration notes

- Already connected (managed connector). `FIRECRAWL_API_KEY` is in
  `process.env` for server functions only.
- Use `@mendable/firecrawl-js` SDK v2. `firecrawl.search(query, { limit:
  5, scrapeOptions: { formats: [{ type: 'json', schema }, 'links'] } })`.
- Restrict to allowlist by composing `site:` filters in the query string;
  drop any returned URL whose host is not in the allowlist as a defensive
  check.
- Cache raw responses in `slot_candidates.raw_extraction` so we never
  re-call Firecrawl during review.

---

## Open questions for next turn

1. Retailer allowlist — confirm or edit the seed set above before we
   migrate.
2. Score heuristic — keep simple (textual brand/keyword match against
   editorial copy) or invest in image-similarity now?
3. Affiliate rewriting — do we want a per-retailer prefix rewrite
   (Skimlinks/Sovrn style) or do we paste raw product URLs and rely on
   network attribution? `affiliate_prefix` in the schema covers either.
4. Re-check cadence — weekly, monthly, or on-demand only?

---

## Implementation order (next turn)

1. Migration: `retailer_allowlist`, `slot_candidates`, `slot_searches`,
   extend `sourced_products`. Seed allowlist.
2. `src/lib/sourcing.functions.ts` with the five server fns.
3. Rebuild `/admin/product-library` page with the three-panel layout.
4. Cron route `app/routes/api/public/recheck-sourced-products.ts` (or a
   manual `[Re-check all]` button first; cron is optional).
5. Promotion path: approved live products override `lookbook.ts`
   placeholders at render time (server fn pulls live rows; `lookbook.ts`
   becomes the editorial scaffold only).

Nothing in the user-facing site changes until step 5 lands and an editor
has approved at least one candidate.