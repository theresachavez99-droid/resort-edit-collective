# Founder Buying Office V1 — FINAL APPROVED (Architecture Freeze)

> The Buying Office searches the market. The Founder reviews the market. The Stylist Engine learns from the Founder.

After this ships: **architecture is frozen.** Engineering shifts to building the Founder Buying Office, curating the 20 Portofino Founder Heroes, and validating the workflow through real curation. Only small, evidence-based improvements from here.

---

## 1. Immutable Search Sessions *(final addition)*

A Search Session is a permanent editorial record. Once it begins, **nothing that affects ranking changes inside that session.** Changing any ranking input opens a **new** Search Session.

**Locked at Search-start (immutable for the life of the session):**
- Founder Hero Brief
- Founder Vision version
- Editorial Benchmark
- Search Strategy *(Editorial First / Brand Discovery / Brand Focus / Replacement Mode)*
- Search Depth *(Quick / Standard / Deep Buy)*
- Search results *(retailer responses + ranking snapshot)*
- Approved Retailer set, Hero Category, Price band, Brand Include/Exclude, Editorial Exclusions, Moment Energy

**Editable inside an open session (provenance only — never ranking):**
- Per-candidate state: Favorite · Review Later · Reject (with tags) · Shortlist · Promote to Founder Finalist
- Founder notes on candidates

**New Session triggers** (UI auto-prompts "Start New Search Session"):
- Edit Brief
- Bump Vision version
- Change Benchmark / Strategy / Depth / Retailers / Category / Price / Brand filters / Exclusions / Moment Energy
- Re-run Search

Implementation:
- `buying_search_sessions` is **append-only**. Columns: `hero_brief jsonb`, `hero_brief_locked_at`, `vision_version int`, `editorial_benchmark`, `search_strategy`, `search_depth`, `retailer_set jsonb`, `filters jsonb`, `search_results_snapshot jsonb`, `ranking_snapshot jsonb`, `parent_session_id uuid null`, `created_at`.
- Server functions reject mutations to locked fields with `423 Locked` and surface "Start New Search Session" in the UI.
- `parent_session_id` links a new session to the one it forked from, preserving the editorial lineage.
- Sessions are **never deleted**; archived only.

---

## 2. Founder Vision Versioning

`founder_visions` table stores immutable v1 → v2 → v3 per (destination, moment) with `change_summary` and `is_current`. `founder_looks` and `buying_search_sessions` both carry `vision_version`. Backfill creates v1 from current values. Surfaced as a small "Vision vN · what changed" disclosure — no new admin page.

---

## 3. Founder Collection Roadmap *(top of Buying Office)*

Per destination: Hero target, completed/remaining per moment, Editorial Coverage, Suggested Next Hero (one-click prefill), Collection Balance Snapshot. Targets configurable; Portofino default = 20. Counts active Heroes only.

---

## 4. Founder Hero Brief *(required before every Buying Review)*

Auto-generated from current Founder Vision (vN) + Moment Template. Editable during setup. **Locks the moment the Founder clicks Search** and snapshots into the Session. To change the Brief: **Edit Brief → New Search Session**. The locked Brief is pinned above the Buying Review with a "Locked at Search · Vision vN" badge.

Brief fields: Editorial Story · Hero Silhouette · Moment Energy · Color Direction · Avoid (seeds Editorial Exclusions) · Photography Goal.

---

## 5. Founder Search Panel

Destination · Moment · Hero Category *(required anchor; never Brand)* · Hero Brief · Editorial Benchmark (Stephen Dann · Julianne Hope · Founder Library · Custom Upload) · Price (Max default $1,000) · Search Depth · Search Strategy · Approved Retailers (all on by default) · Brand Include/Exclude · Editorial Exclusions · Moment Energy.

---

## 6. Search Execution

Firecrawl `/search` is **scoped to Hero Category per retailer**; whole-retailer crawls forbidden. `Search → Normalize → Deduplicate → Editorial Ranking → Buying Review`. Search Summary + Market Coverage shown every run, snapshotted onto the Session.

See §6a for the **Live Product Retrieval** guardrail — the Buying Office is incomplete without it.

---

## 6a. Live Product Retrieval *(required guardrail — non-negotiable)*

The Buying Office is **not UI-only**. Every Buying Search must retrieve real products from approved retailers and return them into the Buying Review. Static product data is allowed only in explicit **Offline Mode**.

### Product Search Provider abstraction

Firecrawl is **never imported directly** by Buying Office code. All retrieval flows through a pluggable interface:

```ts
// src/lib/product-search/provider.ts
export interface ProductSearchProvider {
  id: 'firecrawl' | 'affiliate_feed' | 'retailer_api' | 'internal_index' | 'manual_import' | 'brand_direct' | 'offline_fixture'
  search(input: ProductSearchInput): Promise<ProductSearchResult>
}

export interface ProductSearchInput {
  sessionId: string                 // immutable Search Session
  heroBrief: LockedHeroBrief        // locked snapshot
  heroCategory: string              // required anchor
  retailers: ApprovedRetailer[]     // from §6a retailer list
  benchmark: EditorialBenchmark
  momentEnergy: number              // 1–10
  priceCeiling: number              // default $1000
  exclusions: EditorialExclusionTag[]
  strategy: 'editorial_first' | 'brand_discovery' | 'brand_focus' | 'replacement'
  depth: 'quick' | 'standard' | 'deep_buy'
}

export interface NormalizedCandidate {
  product_name: string
  brand: string
  retailer: ApprovedRetailer
  price: number
  currency: string
  image_url: string
  canonical_url: string             // dedup key
  affiliate_url: string | null
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown'
  category: string
  color: string | null
  source: { provider: string; retrieved_at: string; raw_ref: string }
}

export interface MarketCoverageRow {
  retailer: ApprovedRetailer
  queried: boolean
  raw_results: number
  normalized: number
  after_dedup: number
  shortlisted: number
  error: string | null
}

export interface ProductSearchResult {
  candidates: NormalizedCandidate[]
  coverage: MarketCoverageRow[]
  provider_id: string
  errors: Array<{ retailer: ApprovedRetailer; message: string }>
}
```

**Default provider:** `firecrawl`.
**Future providers** (interface-compatible, wired in without touching the Buying Office): `affiliate_feed`, `retailer_api`, `internal_index`, `manual_import`, `brand_direct`, `offline_fixture`.

### Approved retailers (live retrieval)

Revolve · Mytheresa · Net-a-Porter · Shopbop · Saks · Neiman Marcus · Bloomingdale's · Nordstrom · FWRD · Luisaviaroma. **Brand Direct** is used only when no approved affiliate retailer carries the piece.

### Pipeline (per Search Session)

`Locked Brief → Provider.search(input) → Normalize → Apply Brief/Benchmark/Exclusions/Price/Energy → Deduplicate by canonical_url → Editorial Ranking (§8) → Buying Review`.

Snapshotted onto `buying_search_sessions`: `provider_id`, `retailer_set`, raw provider response refs, normalized candidate set, coverage, ranking snapshot — all immutable.

### Firecrawl-specific rules *(apply to the default provider only)*

- Searches scoped to `{heroCategory} site:{retailer.domain}` — one call per (retailer × category).
- **Never** crawl entire retailers. **Never** run generic queries (e.g. "luxury Portofino outfit"). **Never** issue a search without a locked Brief + Session.
- Depth tiers map to Firecrawl budgets: Quick / Standard / Deep Buy.
- Any provider change forks a new Search Session (per §1).

### Offline mode

- Only entered explicitly by the Founder (toggle in the Search Panel) and is recorded on the Session.
- Uses the `offline_fixture` provider against curated local fixtures.
- Buying Review is clearly badged **Offline Mode** and excluded from Market Coverage analytics.

### Failure behavior *(no silent fakes)*

If the live provider returns zero usable candidates **or** errors across all queried retailers:

- **No Buying Review is created.**
- The Session is marked `status='retrieval_failed'` with the per-retailer errors retained.
- UI shows exactly: **"Live product retrieval failed. No Buying Review was created."** plus the Market Coverage table and a "Retry as New Session" action.
- Never populate Buying Review with placeholder, empty, or fabricated cards.
- Decision Log records `retrieval_failed` with provider, retailers, and error summary.

### Success criteria *(must pass before Buying Office is considered shipped)*

Founder selects: Destination Portofino · Moment Arrival Day · Hero Category Tailored Short Set · Strategy Editorial First · Depth Standard.

The system:
1. Queries each approved retailer scoped to "Tailored Short Set".
2. Returns real live products.
3. Normalizes to `NormalizedCandidate`.
4. Applies locked Brief, Benchmark, Moment Energy, $1,000 ceiling, Editorial Exclusions.
5. Deduplicates by `canonical_url`.
6. Scores via §8 + §9 + Editorial Benchmark Similarity.
7. Renders Buying Review with image · price · retailer · affiliate badge · Editorial Score · Editorial Benchmark Similarity · Editorial Confidence.
8. Renders Market Coverage showing what each retailer returned.

---

## 7. Buying Review

States: `Discovered → Shortlisted → Buying Review → Founder Finalist → Founder Hero → Archived`, plus `Review Later`. Archived ≠ deleted.

---

## 8. Editorial Scorecard (six dimensions)

Editorial Impact · Moment Authenticity · Destination Authenticity · Founder Library Contribution · Photography Presence · Styling Flexibility. *Stephen Dann Similarity* renamed project-wide to **Editorial Benchmark Similarity**.

---

## 9. Editorial Confidence

Plain-language explanation per candidate. Not a score; doesn't affect ranking.

---

## 10. Candidate Cards & Actions

**Display:** image · Brand · Retailer · Affiliate · Price · Editorial Score · Editorial Benchmark Similarity · Editorial Confidence · Moment Fit · Photography · Visual Weight · Editorial Family · Hero Category · Availability.

**Actions:** Compare (2/3/4) · Favorite · Review Later · Reject (tagged) · Archive · Promote · Duplicate · Open Retailer · **Why Didn't This Rank Higher?** chips.

---

## 11. Founder Favorites

Save without destination. Permanent inspiration archive.

---

## 12. Hero Promotion + Collection Balance

`Buying Review → Founder Finalist → Review (Brief + Vision vN restated) → Collection Balance → Twenty Looks Forever → required Promotion Note → Founder Hero`. **Hero Lock** on promotion. Hero stamped with `vision_version` + originating `search_session_id`. Writes a Decision Log entry.

---

## 13. Founder Hero Retirement *(backend now · UI hidden in V1)*

Backend: `status='retired'` + `retired_at/reason/note/successor_founder_look_id`, `src/lib/founder-retirement.functions.ts`, engine/memory/roadmap filter to **active** Heroes.

**UI reveal rule:** Retire / Restore / Retired tab visible only when at least one Hero is retired **or** the destination reaches `hero_target`.

---

## 14. Founder Decision Log *(destination-level timeline)*

Auto-written events: Hero promotion · Finalist rejection · Slot replacement (with Replacement Impact + why_better_tags) · Hero Lock override · Hero retirement/restoration · Founder Vision version bump · New Editorial Family or Hero Category · Roadmap milestone · **New Search Session forked from session X** · **Mutation attempted on locked session** *(audit only)*.

---

## 15. Hero Then Accessories

Strictly sequential: `Hero approved → Shoes → Bag → Jewelry → Sunglasses → Hat → Layer`. Accessory sourcing never influences Hero selection.

---

## 16. Replace This Piece + Replacement Impact

Per-dimension explanation, Revision Timeline, respects Hero Lock, writes Decision Log entry. `regenerateSlot` supports Replace · Pin · Show 6 more · Compare. Stored in `founder_slot_revisions` (admin-only RLS) with `impact_breakdown jsonb` and `why_better_tags text[]`.

---

## 17. Hero Piece Diversity (replaces Hero Brand Uniqueness)

Silhouette · Editorial Family · Color Story · Texture · Photography · Accessory Story · Luxury Positioning · Moment Energy · Editorial Language. Brand repetition = warning only. Computed over active Heroes.

---

## 18. Collection Planning & Health

**Planning (editorial-identity first):** Hero Image · Moment · Editorial Family · Hero Category · Silhouette · Color Story · Moment Energy · Editorial Score · Visual Weight · Price · Brand · Vision version. Embeds destination Decision Log. Retired tab gated by §13.

**Health:** passive, on-demand editorial gap report over active Heroes.

---

## 19. Permanently Out of Scope

Scheduled Firecrawl searches · Background crawling · Daily buying recommendations · Trend monitoring · Automatic opportunity detection · AI shopping agents · Autonomous buyers · Trend prediction · Additional scoring systems · Any further admin pages, AI features, workflows, or scoring after this ships.

---

## 20. Phase 4 Vision Engine (carried)

- **Layer 1 — Canonical Founder Vision** (versioned per §2); mirrored onto `founder_looks` for fast reads.
- **Layer 2 — AI Suggestions** via role-tagged reference images (overall/shoes/bag/sunglasses/jewelry/hat/other), per-field Accept · Edit · Ignore. Storage bucket `founder-references` (admin RW). `src/lib/editorial-dna.server.ts` via Lovable AI Gateway (Gemini). `src/lib/founder-vision.ts` synthesizes — Layer 1 always wins.
- **Founder Similarity v2** weights: Founder Vision · Hero Silhouette · Reference DNA · Hero Products · Brand.
- **Editorial Fidelity** gates on silhouette, proportion, visual weight, color harmony, accessory personality, mood, luxury positioning, Moment Energy.
- **Templates:** `founder_look_templates` per (destination, moment) with Moment Energy, hero_silhouette_skeleton, accessory philosophy, expected slots, `hero_target int`. Seeded for Portofino.
- **Editorial Families:** `editorial_families` + `brand_editorial_families` (primary | secondary). Seeded, founder-editable.

---

## 21. Migrations

All admin tables: `GRANT` to `authenticated` + `service_role`; RLS enabled; policies via `has_role(auth.uid(),'admin')`. No `USING(true)`. No `anon` grants.

- **A** — `app_role` + `user_roles` + `has_role()` (if missing); Layer 1 + `vision_version` on `founder_looks`; `status='retired'` + retirement columns; `founder_slot_revisions` with `impact_breakdown jsonb`; storage bucket `founder-references`.
- **B** — `founder_look_templates` + Portofino seeds with Moment Energy + `hero_target int`.
- **C** — `editorial_families` + `brand_editorial_families` + seeds.
- **D** — `buying_search_sessions` (immutable: hero_brief, hero_brief_locked_at, vision_version, editorial_benchmark, search_strategy, search_depth, retailer_set, filters, search_results_snapshot, ranking_snapshot, parent_session_id); `buying_review` states; `founder_favorites`; `editorial_benchmarks`; `hero_categories`; `editorial_exclusion_tags`; `founder_decision_log`.
- **E** — `founder_visions` (destination, moment, vision_version, Layer 1 fields, change_summary, is_current, created_at). Unique partial index for one current per (destination, moment). Backfill v1 from current `founder_looks`.

---

## 22. Files

**New:** `src/lib/editorial-dna.server.ts` · `src/lib/founder-vision.ts` · `src/lib/founder-revisions.functions.ts` · `src/lib/founder-visions.functions.ts` · `src/lib/editorial-family.ts` · `src/lib/editorial-similarity.ts` · `src/lib/founder-templates.functions.ts` · `src/lib/collection-health.functions.ts` · `src/lib/collection-planning.functions.ts` · `src/lib/collection-roadmap.ts` · `src/lib/founder-hero-brief.ts` · `src/lib/founder-decision-log.functions.ts` · `src/lib/founder-retirement.functions.ts` · `src/lib/buying-search.functions.ts` (enforces session immutability + forks new sessions) · `src/lib/buying-review.functions.ts` · `src/lib/buying-sessions.functions.ts` · `src/lib/founder-favorites.functions.ts` · `src/lib/editorial-scorecard.ts` · `src/lib/editorial-confidence.ts` · `src/lib/replacement-impact.ts` · `src/lib/editorial-benchmarks.functions.ts` · `src/routes/admin.founder-buying.tsx` (Roadmap · Brief w/ lock · Buying Review · Sessions tab w/ fork lineage · Favorites · Decision Log) · `src/routes/admin.editorial-families.tsx` · `src/routes/admin.collection-health.tsx` · `src/routes/admin.collection-planning.tsx` · `src/routes/admin.editorial-benchmarks.tsx`.

**Edited:** `src/lib/stylist-engine.functions.ts` (regenerateSlot · Replacement Impact · DNA-first sourcing · Moment Energy fidelity · silhouette fallback · Hero Piece Diversity · Hero Lock · accessory pipeline only after Hero approval · filter Retired Heroes · respect vision_version · Decision Log writes) · `src/lib/founder-looks.functions.ts` (Layer 1 persistence · reference images · template hydration · Hero Lock · Collection Balance · Twenty Looks Forever · required Promotion Note · stamp vision_version + search_session_id · Retirement surfaces UI-gated) · `src/lib/founder-similarity.ts` (v2 weights) · `src/lib/editorial-stylist.ts` (`editorialFidelityScore` + Moment Energy) · `src/lib/collection-director.ts` (`analyzeMomentGaps` over active Heroes) · `src/lib/editorial-memory.server.ts` (retain Retired for reuse warnings; exclude from active diversity counts) · `src/lib/founder-context.server.ts` (rejection tags + why_better_tags + Promotion Notes + recent Decision Log + active Vision) · `src/lib/discovery-pipeline.ts` (Quick / Standard / Deep Buy tiers; strategy routing) · `src/routes/admin.founder-looks.tsx` (Template picker · Vision panel w/ version history · Silhouette editor · Reference gallery Accept/Edit/Ignore · Brief preview · Replace + Replacement Impact + Show 6 more + Compare · Revision Timeline · Hero Lock badge · Collection Balance · Twenty-Looks-Forever toggle · required Promotion Note · candidate pre-seed · Retire/Restore gated) · `src/routes/admin.index.tsx` (Buying Office promoted to top; Core Philosophy banner).

---

## 23. Definition of Done

Founder can:
- See the **Roadmap** (progress, coverage, suggested next Hero, balance) at top of Buying Office with one-click prefill.
- See an auto-generated **Hero Brief** stamped with current **Vision version**, edit it during setup, and have it **lock** on Search.
- Open a **New Search Session** by editing the Brief or any ranking input — never mutate an open session.
- Define structured editorial intent and search by Hero Category across approved retailers (Firecrawl scoped to category).
- Review a curated **Buying Review** with Search Summary + Market Coverage + pinned locked Brief.
- See **Editorial Confidence** with a plain-language reason.
- Compare up to four products and read **Why Didn't This Rank Higher?**.
- Save to **Favorites** or **Review Later**; reject with structured tags.
- See **Collection Balance** before Twenty Looks Forever; promote a Hero with required Promotion Note stamped with `vision_version` and `search_session_id`.
- See **Replacement Impact** on any slot swap; **Hero Lock** on promotion.
- Read a per-destination **Founder Decision Log** linked back to source events, including new-session forks and any blocked mutations on locked sessions.
- Bump **Founder Vision** to v2/v3 with change summary; every existing Hero/Session keeps its original version stamp.
- Retire / Restore Heroes via backend today; UI appears under §13 reveal rule.
- Trust every Search Session as an immutable editorial record.

---

## 24. Architecture Freeze (final)

After ship: **architecture complete.** Engineering redirects almost entirely to:
1. Building the Founder Buying Office.
2. Curating the 20 Portofino Founder Heroes.
3. Using those real curation sessions to validate the workflow.
4. Small, evidence-based improvements only when actual usage exposes friction.

Resort Edit's next leap comes from exceptional editorial curation — not more features.
