# Resort Edit Look Studio Rebuild

Shift the admin workflow from product-by-product moderation to look-level curation. Products become ingredients; humans only approve complete looks.

## New workflow

```text
Look DNA → Source Products → Auto-Validate → Auto-Score
        → Assemble 3 Outfit Options → Editorial Lookboard
        → AI Muse Preview → Human Look Review
        → Approve Look → Publish → Promote products to Vault
```

## Scope of this build

### 1. Database changes (migration)
New tables:
- `look_candidates` — one row per generated outfit option. Fields: look DNA id, destination, day, look, variant (A/B/C), status (`draft` | `pending_review` | `approved` | `rejected` | `improving`), muse_image_url, lookboard_image_url, scoring jsonb, feedback_history jsonb, approved_at, published_at.
- `look_candidate_slots` — products attached to a candidate. Fields: candidate_id, slot (swimwear, dress, shoes, bag, earrings, necklace, bracelet, ring, sunglasses, hair_detail, optional_layer), sourced_product_id, position.

Reuse existing `sourced_products` (auto-validated/scored in background) and `vault_products` (only populated when a parent look is approved).

Add `auto_score` jsonb + `auto_approved` boolean to `sourced_products` so background validation can fast-track items without admin clicks.

### 2. Server functions (`src/lib/look-studio.functions.ts`)
- `listLookDNAQueue` — DNA entries with candidate counts and status.
- `generateLookCandidates({ dnaId, count: 3 })` — sources products per slot, scores, persists 3 candidates.
- `scoreLookCandidate(candidateId)` — runs the 10 scoring categories via Lovable AI, stores jsonb.
- `generateMusePreview(candidateId)` — AI muse image.
- `generateLookboard(candidateId)` — editorial composite.
- `approveLook(candidateId)` — marks approved, promotes its products to `vault_products`.
- `rejectLook(candidateId, reason)`.
- `improveLook(candidateId, feedback[])` — regenerates preserving DNA, swaps weakest slots, re-scores.

All gated by `requireSupabaseAuth` + admin password check (keep existing `verifyAdmin` flow).

### 3. Auto product pipeline
Background job (triggered when a candidate is generated): for each sourced product, run `validate → score → auto-approve` using existing `productScoring.ts` + `productValidation.functions.ts`. No human queue.

### 4. New admin route: `/admin/look-studio`
Replaces `/admin/review-queue` as the primary surface. Layout:
- Left: list of Look DNA entries with status badges (Needs Generation / In Review / Approved).
- Center: selected DNA shows 3 candidate cards side-by-side. Each card:
  - Muse preview image
  - Editorial lookboard
  - Product grid (11 slots)
  - Score panel (10 categories + total)
  - Actions: **Approve Look**, **Reject Look**, **Improve Look**
- Improve Look opens a panel with the 11 preset feedback chips (More Mediterranean, yacht-wife, Portofino, colorful, luxury, editorial; Less influencer, generic, repetitive; More destination-specific, better accessories) plus free-text.

### 5. Repurpose existing pages
- `/admin/review-queue` → redirect to `/admin/look-studio` (keep route file as thin redirect).
- `/admin/product-vault` → becomes read-only library of products promoted via approved looks. Remove manual approve/reject UI; show parent look provenance.
- `/admin/product-library` → stays as catalog browser, no workflow actions.

### 6. Scoring rubric (stored in `src/lib/lookScoring.ts`)
Ten categories, 0–10 each: Destination Specificity, Activity Fidelity, Styling Cohesion, Luxury Traveler Appeal, Editorial Uniqueness, Saveability, Color Story, Print Story, Accessory Ecosystem, Resort Edit Luxury Score. Composite = weighted average (cohesion + destination specificity weighted 1.5×).

## Out of scope (this turn)
- Public-facing look pages already exist; this rebuild only changes the admin/curation side.
- Migrating historical sourced_products data — old rows stay in their current state.

## Files to create
- `supabase/migrations/<ts>_look_studio.sql`
- `src/lib/look-studio.functions.ts`
- `src/lib/look-studio.server.ts`
- `src/lib/lookScoring.ts`
- `src/routes/admin.look-studio.tsx`
- `src/components/admin/LookCandidateCard.tsx`
- `src/components/admin/ImproveLookPanel.tsx`

## Files to modify
- `src/routes/admin.review-queue.tsx` → redirect to Look Studio
- `src/routes/admin.product-vault.tsx` → read-only, show look provenance
- `src/lib/vault.functions.ts` → add `promoteApprovedLookProducts(candidateId)`
- `.lovable/mem/index.md` + new `mem://features/look-studio.md`

## Open questions before I build
1. **AI generation budget.** Generating 3 candidates × muse image + lookboard per DNA is expensive. OK to default to muse preview only (skip composite lookboard until approved), and generate it on demand from a "Generate Preview" button per candidate?
2. **Product sourcing source.** Should `generateLookCandidates` reuse the existing Firecrawl-based pipeline (`firecrawl.functions.ts`) to find new products, or assemble from already-sourced `sourced_products` rows that match the DNA's brand/category/destination tags?
3. **Approval cascade.** When a look is approved, should its products auto-promote to vault with `approval_status='approved'`, or land as `pending` in vault for a second pass? (Spec says auto-promote; confirming.)
