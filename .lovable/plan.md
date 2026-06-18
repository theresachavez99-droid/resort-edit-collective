## Scope (locked from your answers)

- **Build**: Portofino perfection only. No `/editorial`, `/capsules`, `/essentials` yet.
- **Naming**: Two-class validator (Destination Moment vs Editorial Commerce). Warn + flag, never block.
- **Sourcing**: Untouched. No retailer or scoring changes.

Everything else from the doctrine (capsule engine, editorial shops, brand diversity scoring, cross-retail enforcement) is documented but deferred to later sprints.

---

## What ships this turn

### 1. Destination Moments Library (data foundation)

New table `destination_moments`:

```text
id (uuid)
destination_slug      e.g. "portofino"
moment_slug           e.g. "harbor-aperitivo"
moment_name           "Harbor Aperitivo"
moment_archetype      "aperitivo" | "arrival" | "market" | "yacht" | "sunset" | "dinner" | ...
time_of_day           "morning" | "midday" | "afternoon" | "evening" | "night"
narrative             short editorial paragraph
styling_cues          jsonb (silhouette, palette, materials, accessory strategy)
sort_order            int
active                bool
```

Seed Portofino with the canonical six:

1. Arrival Day
2. Market Morning
3. Harbor Aperitivo
4. Yacht Day
5. Sunset Views
6. Riviera Dinner

Plus the **archetypes table** (`destination_moment_archetypes`) — the reusable library that future destinations (Capri, St. Barths, Palm Beach) will map their local versions onto. Seeded with the 10 archetypes from the doctrine: Arrival, Market Morning, Beach Club Lunch, Yacht Day, Harbor Aperitivo, Sunset Views, Riviera Dinner, Villa Dinner, Shopping Afternoon, Boat Excursion.

Both tables: full GRANT block, RLS enabled, `SELECT TO anon` (public read), writes admin-only via service role.

### 2. Wire moments to existing looks

Add `moment_slug` column to `look_candidates` (nullable, FK-soft to `destination_moments.moment_slug`). No migration of existing Day 1–5 data yet — admin will tag manually in Look Studio. Surface a moment picker in the Look Studio candidate card.

### 3. Naming Doctrine Validator

New module `src/lib/naming-doctrine.ts` (pure, no deps):

- `classifyName(title)` → `{ class: "destination_moment" | "editorial_commerce" | "generic", matches: string[], suggestion?: string }`
- **Destination Moment** allowlist: built from `destination_moments` rows + archetype names (Harbor Aperitivo, Yacht Day, Market Morning, Riviera Dinner, Blue Grotto Day, Via Camerelle, …).
- **Editorial Commerce** allowlist: functional category patterns (`Resort Sandals`, `Raffia Bags`, `Vacation Sunglasses`, `Beach Club Dresses`, `Vacation Jewelry`, `Resort Totes`, `Yacht Day Hats`, `Vacation Dresses`, `White Dresses`, etc.).
- **Generic / discouraged** blocklist with regex: `coastal muse`, `mediterranean escape`, `summer essentials`, `vacation vibes`, `resort chic`, `beach glam`, `european summer`, `vacation style`, `beach chic`, plus a heuristic for influencer-flavored adjective+noun pairs.

Output drives a `<NamingWarningChip />` shown in:

- Admin Look Studio candidate card
- Admin Editorial Library card (already-seeded JHS frameworks will display as `editorial_commerce` ✓ or flag accordingly)

No hard block, no auto-rewrite. Warning copy: *"Generic naming detected. Consider a destination moment or functional editorial category."* with the suggestion when one exists.

### 4. Admin surfaces

- **`/admin/destination-moments`** — new route. List + reorder Portofino's six moments, edit narrative + styling cues, view archetype mapping. Includes "Seed Portofino moments" and "Seed archetype library" buttons.
- **Look Studio** — add moment dropdown + naming chip on each candidate card.
- **Editorial Library** — add naming chip on each card (read-only, advisory).

### 5. Public Portofino — no visible changes yet

Per "Perfect Portofino" priority, the public `/portofino*` routes stay as-is this turn. The moment data is being built so the next sprint can rewire the public destination page around the six moments without scrambling.

---

## Out of scope (explicit)

- `/editorial`, `/capsules`, `/essentials` routes
- Capsule engine, essentials library
- Cross-retail sourcing changes, brand-diversity scoring, retailer concentration penalties
- New destinations (Capri, St. Barths, Palm Beach)
- Public Portofino page redesign
- Hard validation / generation blocking on naming
- Migrating existing Day 1–5 look candidates to new moment_slug values (admin will tag once moments exist)

---

## Files

**New**
- `supabase/migrations/<ts>_destination_moments.sql`
- `src/lib/destination-moments.functions.ts` (server fns: list, seed, update)
- `src/lib/naming-doctrine.ts`
- `src/components/admin/NamingWarningChip.tsx`
- `src/routes/admin.destination-moments.tsx`

**Edited**
- `src/lib/look-studio.functions.ts` — accept `moment_slug` on candidate update
- `src/routes/admin.look-studio.tsx` — moment picker + naming chip
- `src/routes/admin.editorial-library.tsx` — naming chip on cards
- `src/integrations/supabase/types.ts` — regenerated for new tables/columns

---

## Validation

1. Migration runs; `destination_moments` + `destination_moment_archetypes` exist with grants.
2. `/admin/destination-moments` → seed Portofino → six moments appear.
3. Naming chip on Editorial Library: existing JHS items like "Coastal Muse", "Mediterranean Escape", "Summer Essentials" show **generic / flag**. "Harbor Aperitivo", "Yacht Day", "Riviera Dinner" show **destination moment ✓**. "Resort Sandals", "Raffia Bags" show **editorial commerce ✓**.
4. Look Studio candidate card: dropdown lists six Portofino moments; saving persists; chip reflects the title's class.

Approve and I'll build it.