---
name: Look Studio workflow
description: Admin workflow rebuilt around look-level approval — products no longer reviewed one at a time
type: feature
---

# Look Studio

The admin surface for curating Resort Edit. Replaces the old per-product Review Queue.

## Workflow (never reverse)

1. Look DNA defined (`src/data/lookDNA.ts`)
2. Products sourced (Firecrawl) into `sourced_products` — auto-validated, auto-scored, auto-approved in the background. No human queue.
3. Admin clicks **Generate 3 candidates** for a DNA. `generateLookCandidates` fills every required wardrobe slot from `sourced_products` and persists three `look_candidates` rows.
4. Each candidate is scored at the LOOK level via Lovable AI on ten categories: destination specificity, activity fidelity, styling cohesion, luxury traveler appeal, editorial uniqueness, saveability, color story, print story, accessory ecosystem, Resort Edit luxury score. Composite weights destination specificity and styling cohesion 1.5×.
5. Admin reviews three candidate cards side-by-side. Actions: **Approve Look**, **Reject Look**, **Improve Look**.
6. Improve Look records directional feedback chips (More Mediterranean, More yacht-wife, Less influencer, etc.), swaps each slot for a new pick from the pool, re-scores. DNA is preserved.
7. Approve Look auto-promotes every product in the look into `vault_products` with `approval_status='approved'` and `source_look_candidate_id` provenance. Sourced rows flip to `status='promoted'`.

## Hard rules

- Products are never approved individually. The vault only ever receives products that appeared in an approved look.
- The old `/admin/review-queue` route redirects to `/admin/look-studio`.
- Composite score weights: destination_specificity × 1.5, styling_cohesion × 1.5, everything else × 1.
- All ten score categories live in `src/lib/lookScoring.ts`. Add new categories there.
- Server fns live in `src/lib/look-studio.functions.ts`. All gated by `requireAdmin(password)`.
- Tables: `look_candidates` + `look_candidate_slots`. RLS denies all; access is service-role only via server fns.
- Approval policy: when a look is approved, its sourced products auto-promote to `vault_products` as `approved` (not `pending`).
- Muse / lookboard imagery is generated on demand per candidate, not eagerly during candidate generation.