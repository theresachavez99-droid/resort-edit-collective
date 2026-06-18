# Portofino Editorial Rebuild — Six Core Moments

Rebuild `/portofino` around the six canonical moments. Keep the existing `/portofino/day-N` URLs working (no destructive changes), add `/portofino/<moment-slug>` as the canonical per-moment URL, and source looks via a hybrid resolver (tagged Look Studio candidates first, mapped legacy look as fallback).

## What the user will see

### 1. New `/portofino` landing — editorial index

Replaces the current Day 1–5 grid. No day numbers, no itinerary language.

```
┌────────────────────────────────────────────────┐
│  HERO — Portofino harbor                       │
│  "Dressed for the Destination™"                │
│  One-paragraph destination introduction        │
└────────────────────────────────────────────────┘

  Six Moments in Portofino

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Arrival  │  │ Market   │  │ Yacht    │
  │ Day      │  │ Morning  │  │ Day      │
  └──────────┘  └──────────┘  └──────────┘
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Harbor   │  │ Sunset   │  │ Riviera  │
  │ Aperitivo│  │ Views    │  │ Dinner   │
  └──────────┘  └──────────┘  └──────────┘
```

Each card: moment hero image, moment title, one-sentence narrative (pulled from `destination_moments.narrative`), hero outfit thumbnail, "View Moment" CTA → `/portofino/<moment-slug>`.

Card order is the canonical sequence: Arrival → Market → Yacht → Aperitivo → Sunset → Dinner (`sort_order` from `destination_moments`).

### 2. New per-moment route `/portofino/<moment-slug>`

One route file, dynamic param. For each moment it renders: moment hero, narrative, styling cues (silhouette / palette / hero / accessories / avoid from `styling_cues`), and the resolved look(s) — product cards rendered with the existing `PortofinoDayPage` look component so visual hierarchy and product fit are unchanged.

### 3. Legacy `/portofino/day-1` … `/portofino/day-5` — preserved as-is

No content changes, no redirects. They keep working. The new landing page does not link to them.

## How look sourcing works (hybrid resolver)

New server function `resolvePortofinoMomentLook({ moment_slug })`:

1. Query `look_candidates` where `moment_slug = $1` AND `status = 'approved'`. If any rows: return the highest-scoring one as `{ source: "tagged", look }`.
2. Otherwise return the mapped legacy look as `{ source: "fallback", look }`.

Legacy mapping (locked, one per moment):

| Moment            | Legacy fallback                          |
| ----------------- | ---------------------------------------- |
| arrival-day       | Day 5 — Market Strolls & Coastal Goodbyes (arrival energy, linen, light) |
| market-morning    | Day 5 — Market Strolls & Coastal Goodbyes |
| yacht-day         | Day 1 — Yacht Day & Harbor Aperitivo (yacht half) |
| harbor-aperitivo  | Day 1 — Yacht Day & Harbor Aperitivo (aperitivo half) |
| sunset-views      | Day 4 — Sunset Cocktails & Dinner With a View |
| riviera-dinner    | Day 4 — Sunset Cocktails & Dinner With a View |

Day 2 (Beach Club) and Day 3 (Pool & Shopping) are deliberately NOT mapped — those archetypes are optional and out of scope for the core six.

## Admin fallback warning

`/admin/destination-moments` Portofino section gets a new chip per moment card:

- **Approved tagged candidate** — green, "Tagged: <candidate title>"
- **Fallback look — tag approved candidate for this moment** — amber, when resolver returns `source: "fallback"`

Driven by a new server fn `getMomentSourceVerdicts({ password, destination_slug })` that runs the resolver for each moment and returns `{ moment_slug, source, candidate_title? }[]`.

## Out of scope (explicit)

- No `/capsules`, `/editorial`, `/essentials`.
- No sourcing changes (no new retailers, no scoring tweaks, no brand-diversity penalties).
- No new archetypes, no Beach Club / Villa Dinner / Shopping / Boat Excursion routes.
- No edits to legacy `/portofino/day-N` pages or to the existing look-detail route.
- No changes to product cards, ProductCard component, or affiliate logic.

## Technical details

**New files**
- `src/routes/portofino.$moment.tsx` — dynamic per-moment route. Param is the moment slug (e.g. `arrival-day`). Uses Route.useParams + a public server-fn loader. Throws `notFound()` for unknown slugs. Reuses `PortofinoDayPage` look renderer for visual parity.
- `src/lib/portofino-moments.functions.ts` — `listPortofinoMomentsForLanding()` (public) returns `[{ moment, narrative, hero_image, resolved_look_thumb, source }]`; `resolvePortofinoMomentLook({ moment_slug })` (public) returns the look or null; `getMomentSourceVerdicts()` (admin-gated) for the warning chips.
- `src/lib/portofino-moment-fallbacks.ts` — pure mapping table from `moment_slug` → legacy look-id + thumbnail import. No DB calls.

**Edited files**
- `src/routes/portofino.tsx` — replace `PortofinoPage` body with the new editorial-index layout. Keep existing `head()` meta (title still reads "Portofino" — copy unchanged because it's the same destination). Drop the Day 1–5 cards section; keep Hotels and Experiences sections unchanged for now (out of scope to redesign).
- `src/routes/admin.destination-moments.tsx` — add the source-verdict fetch and render the chip on each Portofino `MomentCard`.
- `src/routeTree.gen.ts` regenerates automatically.

**Routing note**
- `portofino.$moment.tsx` and `portofino.$day.$look.tsx` coexist fine (different segment counts). `portofino.day-1.tsx` etc. are static segments and take precedence over `$moment`, so legacy URLs keep matching their original files.

**No DB migration.** All required tables and the `moment_slug` column on `look_candidates` already exist from the previous phase.

## Validation

1. Visit `/portofino` — see hero + six moment cards in canonical order, no day numbers.
2. Click any moment → `/portofino/<moment-slug>` renders with narrative, styling cues, and a look.
3. Visit `/portofino/day-1` → still works exactly as before.
4. Visit `/admin/destination-moments` → all six Portofino moments show the amber "Fallback look" chip (since no candidates are tagged yet). After tagging an approved candidate in Look Studio, refresh and that moment flips to green.
