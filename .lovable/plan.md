# Buying Office V3 — Founder-Centric Editorial Workspace

Refactor Hero Outfit Studio into a quiet editorial workspace that remembers every decision, collapses completed work, and supports any moment via flexible custom components.

## Guiding principle

Discover → Curate → Refine → Publish. Each Founder decision permanently reduces visible complexity. Reopening a review never starts over.

## 1. Persist all decision states

Extend `buying_candidates.status` semantics and add a `slot_assignment` linking a candidate to a Hero Outfit slot. Statuses respected globally:

- `review` (default after import)
- `favorite` / `later`
- `finalist`
- `selected` (locked into a slot — new)
- `replaced` (superseded by a later selection — new)
- `rejected`
- `founder_hero` (Hero garment)

New table `hero_outfit_slot_history` records every AI generation / manual pick per slot so nothing is lost:

```text
hero_outfit_slot_history
  id, outfit_id, slot, candidate_id (nullable),
  generation_payload jsonb, action (generated|selected|rejected|replaced|cleared),
  created_at
```

Server fns: `selectCandidateForSlot`, `clearSlot`, `replaceSlotSelection`, `rejectCandidate`, `restoreCandidate`. All write to history.

## 2. Default workspace = Current Founder Look

`/admin/hero-outfit/$id` opens directly on a **Current Founder Look** card:

- Large look image (first hero garment image)
- Hero garments list (locked)
- Selected accessory rows (one per filled slot)
- Optional components list
- Publication + validation status
- Per-row actions: **Change · Replace · Remove**

Recommendation panels render *below*, only for incomplete required slots, expanded by default. Filled slots render as one-line collapsed rows with a `Change` affordance.

## 3. Collapse / expand behavior

- Filled required slot → collapsed summary row.
- Empty required slot → expanded with current AI generation only.
- "Change" / "Regenerate" / "Clear" re-expands a filled slot.
- "Regenerate" archives the prior generation into history; only the latest generation is shown.

## 4. Hide rejected + superseded by default

- Rejected candidates filtered out of every slot panel.
- Toggle `Show rejected` (per slot + global) reveals a collapsible section.
- Superseded AI generations hidden; `View history` opens a drawer reading `hero_outfit_slot_history`.

## 5. Custom Optional Components

Remove hardcoded Hair Accessory. Replace the optional slots concept with an open list of `custom_components` stored on `founder_hero_outfits.custom_components jsonb`:

```text
{ id, name, url, image_url?, price?, notes?, order }
```

UI: **+ Add Custom Item** opens a small form (name, retail URL, optional image, optional notes). Components render in the Current Founder Look summary and publish alongside required slots — no destination-specific code paths.

Required slot defaults (engine-level):

- Day: Shoes, Bag, Sunglasses, Earrings, Necklace, Bracelet, Ring
- Night: drop Sunglasses
- Water: same as Day; sandals label for Shoes

Hat removed from required; Founders add via Optional if wanted.

## 6. Publishing changes

`publishFounderLookFromOutfit` now emits two grouped sections in the published payload:

- **Shop the Look** — hero garments + required accessories (in canonical order)
- **Complete the Look** — custom optional components

`portofino.$moment.tsx` `ShopLookPanel` renders both groups with a subtle "Complete the Look" subheading; both use identical card styling.

## 7. UI restructure (`src/routes/admin.hero-outfit.$id.tsx`)

New component tree:

```text
<HeroOutfitStudio>
  <CurrentFounderLookCard />        // primary
  <IncompleteSlotsPanel />          // secondary — auto-expanded
  <CompletedSlotsList />            // collapsed rows
  <OptionalComponentsEditor />      // add/edit custom items
  <ArchiveDrawer />                 // tertiary — rejected + history (opt-in)
</HeroOutfitStudio>
```

Goal: ≥50% reduction in scroll height for a partially-filled outfit.

## Technical details

**Migration**

```sql
alter table public.founder_hero_outfits
  add column if not exists custom_components jsonb not null default '[]'::jsonb,
  add column if not exists slot_selections jsonb not null default '{}'::jsonb;

create table if not exists public.hero_outfit_slot_history (
  id uuid primary key default gen_random_uuid(),
  outfit_id uuid not null references public.founder_hero_outfits(id) on delete cascade,
  slot text not null,
  candidate_id uuid references public.buying_candidates(id) on delete set null,
  action text not null check (action in ('generated','selected','rejected','replaced','cleared','restored')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant all on public.hero_outfit_slot_history to service_role;
alter table public.hero_outfit_slot_history enable row level security;
create policy "deny all" on public.hero_outfit_slot_history for all using (false);

-- extend candidate status vocabulary (already free-text; add index)
create index if not exists buying_candidates_status_idx on public.buying_candidates(session_id, status);
```

**Server fns** (`src/lib/hero-outfit.functions.ts`):
- `selectCandidateForSlot({ outfitId, slot, candidateId })` — sets candidate.status=`selected`, marks any prior `selected` candidate in that slot as `replaced`, writes history.
- `clearSlot({ outfitId, slot })` — unsets selection, writes history.
- `rejectCandidate` / `restoreCandidate` — toggle rejection, write history.
- `addCustomComponent` / `updateCustomComponent` / `removeCustomComponent` — mutate `custom_components` jsonb.
- `getOutfitWorkspace({ outfitId })` — returns hero garments, current selections, incomplete slots, optional components, latest generation per empty slot, and counts (rejected, history) without their payloads.
- `regenerateSlotWithAI` updated to archive the prior generation via history and replace current AI suggestions in-place rather than append.

**Slot config** (`src/lib/hero-outfit-slots.ts`):
- Remove `hair` from defaults; keep `hat` optional-only via custom components.
- Add `kind: "required" | "optional"` to `SlotDefinition`; UI only auto-renders required slots.

**Publish payload** (`hero-outfit.functions.ts` → `publishFounderLookFromOutfit`):
- Group resolved products into `look_products` (required) and `optional_products` (custom components). `founder_looks` gains a `optional_components jsonb` column; `founder_reference_products` already supports the flat list — we additionally attach `is_optional` in the product metadata used by the moment page.

**Public render** (`src/routes/portofino.$moment.tsx`):
- `ShopLookPanel` reads `optional_products`, renders them under a "Complete the Look" subheading using the same `ShopCard`.

## Out of scope

- No destination-specific component presets.
- No changes to import/wizard stages 1–3.
- No new analytics surfaces.
- Brand/scoring engine untouched.
