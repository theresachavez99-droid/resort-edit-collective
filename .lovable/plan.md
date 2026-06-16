# Look Studio Quality Upgrade Plan

Goal: candidates that feel like a luxury personal shopper presentation, not a product grid. No candidate ships unless it passes a hard quality gate.

## 1. Aesthetic-first assembly (workflow reversal)

Replace the current "pick products → score look" flow with a 6-stage pipeline. Each Look DNA + candidate slot (A/B/C) runs through:

```text
1. Destination Energy Brief   (AI: 1 paragraph mood)
2. Color Story                (AI: 3-5 hex palette + narrative)
3. Silhouette Strategy        (AI: proportions, layering, drape)
4. Accessory Ecosystem        (AI: jewelry stack, bag mood, eyewear era)
5. Luxury Traveler Persona    (AI: who she is, where she's going, what she'd save)
6. Product Assembly           (DB: rank sourced_products against the brief)
```

Stages 1-5 are produced as a single `CandidateBrief` from one Lovable AI call per candidate (Gemini 3 flash). Stage 6 scores every eligible product against the brief (brand fit, color match, silhouette tag, price tier, retailer trust) and picks the best per slot.

To guarantee differentiation, A/B/C briefs are generated together in one prompt with an explicit instruction: "Three distinct luxury interpretations of the same DNA — e.g. Mediterranean maximalist / polished yacht luxury / Riviera glamour. Each must use a different color story and accessory ecosystem."

## 2. Mandatory complete slots

Required slot list enforced in code (not just labels):

```text
primary_garment, secondary_garment, shoes, bag,
earrings, necklace, bracelet, ring, sunglasses, hair_detail
```

`assembleCandidate()` returns `{ status: "incomplete", missingSlots: [...] }` instead of a candidate when any required slot has no product. The orchestrator then:
1. Calls `sourceForSlots(missingSlots, brief)` — Firecrawl-driven targeted sourcing scoped to the brief's brands and slot types.
2. Retries assembly once.
3. If still incomplete, the candidate is **discarded** (not shown). UI surfaces "Candidate failed quality gate — auto-regenerating."

## 3. Expanded sourcing pool

Before any candidate generation runs, ensure pool size ≥ a per-DNA floor:

- Floor: **300 eligible products per Look DNA** (currently 31 total).
- Add `ensureSourcingDepth(lookDnaId)` that:
  - Counts eligible `sourced_products` matching the DNA's brand allowlist + destination + season.
  - If below floor, kicks off a sourcing batch via Firecrawl across the approved Resort Edit brand list, scoped to the missing slot types and price tiers.
  - Blocks candidate generation until floor met (with progress UI).
- Add a "Sourcing Depth" badge to the Look Studio header: `eligible / floor`.

## 4. Mandatory muse preview (hard gate)

Muse preview generation moves from optional to **required** for candidate completion. A candidate without a rendered muse image is not eligible to display.

- Pipeline: brief → muse prompt (composed from color story + silhouette + persona + destination) → `openai/gpt-image-2` via AI Gateway (streaming, server route `/api/generate-muse`).
- Stored on `look_candidates.muse_image_url` (already exists). Candidate row stays in `status: 'pending_muse'` until image lands.
- UI shows a blurred shimmer placeholder while streaming partials arrive, then unblurs on completion.
- Failure → discard candidate, regenerate.

## 5. Quality gate

Before a candidate is marked `ready_for_review` and shown in the UI, it must pass ALL of:

| Check | Threshold |
|---|---|
| All 10 required slots filled | 10/10 |
| Muse image present | non-null URL |
| Destination specificity score | ≥ 7/10 |
| Styling cohesion score | ≥ 7/10 |
| Accessory ecosystem score | ≥ 7/10 |
| Differentiation vs sibling candidates | cosine distance on color+silhouette+persona embedding ≥ 0.25 |

Scoring is done by a second AI pass (`scoreCandidate`) against the assembled outfit + muse image (multimodal). Failures auto-regenerate up to 2 retries per candidate slot; after that, surfaced as "Could not reach Resort Edit quality — adjust DNA or expand brand pool."

## 6. UI changes (admin/look-studio)

- "Generate 3 candidates" becomes a multi-stage progress panel:
  ```text
  Sourcing depth      ████████░░  248 / 300
  Briefs (A/B/C)      ████████░░  generating persona…
  Muse previews       ██░░░░░░░░  A rendering, B queued, C queued
  Quality gate        —
  ```
- Each candidate card shows the brief (Destination Energy, Color Story swatches, Persona) above the muse and lookboard — so the reviewer sees the aesthetic intent, not just the products.
- Failed candidates appear as a subtle "Regenerating — failed: missing necklace, cohesion 6.2/10" row, then replace themselves on success.

## Technical details

- New file: `src/lib/candidate-brief.server.ts` — `generateCandidateBriefs(dna)` returns `{ A, B, C }` differentiated briefs in one AI call.
- New file: `src/lib/sourcing-depth.server.ts` — `ensureSourcingDepth`, `sourceForSlots`.
- New file: `src/routes/api/generate-muse.ts` — streaming muse image route (SSE passthrough per the AI Gateway pattern).
- Update `src/lib/look-studio.functions.ts`:
  - `generateLookCandidates` becomes an orchestrator: depth check → briefs → per-candidate (assemble → muse → score → gate → retry/discard).
  - Add `REQUIRED_SLOTS` constant; `assembleCandidate` enforces it.
- DB migration: add `look_candidates.brief jsonb`, `status` enum extended with `pending_muse | pending_score | failed_gate`, `gate_failures jsonb` for debugging. `sourced_products` gets `color_tags text[]`, `silhouette_tags text[]` for matching.
- Differentiation: store a small `aesthetic_vector` (color + silhouette + persona keywords hashed/embedded) on each candidate; compare siblings before approving.

## What I am not changing

- Customer-facing `/look/$slug` editorial page stays as-is — the only thing flowing into it is now higher-quality candidates.
- Product Vault promotion-on-approve flow unchanged.
- Review/approve UI semantics unchanged (still look-level).

## Open questions

1. **Sourcing floor** — 300 eligible per DNA is my proposal. Higher = better differentiation but slower first run (Firecrawl-bound). Confirm or set a different number.
2. **Brand allowlist** — should `ensureSourcingDepth` source from the existing Resort Edit brand list only, or am I allowed to add brands the AI suggests during brief generation (subject to your later approval)?
3. **Muse model** — `openai/gpt-image-2` (default, fast, good fashion editorial) vs `google/gemini-3-pro-image-preview` (higher fidelity, slower, costlier). Default to gpt-image-2 unless you want pro.
4. **Auto-retry budget** — 2 retries per candidate slot before surfacing failure. OK, or higher?

Approve and I'll implement.