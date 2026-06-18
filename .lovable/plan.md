## More Like This — Editorial Discovery Engine

Add a horizontally scrollable "More Like This" carousel to every Portofino look page, surfacing 6–10 destination-aware alternative products selected by editorial DNA (destination + activity + style family) rather than brand. Seed Portofino with a small, curated, editorially-tagged product set including the Milly Lela, Milly Lene, Farm Rio Porcelain Garden, D&G Majolica Shirt Dress, Alice + Olivia Glinda, and Alice + Olivia Miriam from the uploaded references.

### Placement on `/portofino/$day/$look`

Inserted as a new section, in this order:

```text
Complete the Look (existing)
… existing sections …
Editor's Alternatives (existing)
─ NEW ─  More Like This
Continue to Day X (Next Look CTA — existing)
```

Title: **More Like This**  
Subtitle: *Explore similar pieces with the same destination energy.*

The earlier "Editor's Alternatives" section stays as-is (it's per-look manually curated); "More Like This" is the automated DNA-matched discovery layer.

### Editorial matching model

New module `src/data/styleDNA.ts` — pure data, no runtime cost.

Each look gets a `LookDNA` record:
```ts
{ destination, momentSlug, styleFamilies[], activityTags[], excludeFamilies[] }
```

Each product gets a `ProductDNA` record:
```ts
{ id, brand, name, price, image, href, retailer,
  destinations[], styleFamilies[], activityTags[], momentSlugs[],
  brandTier: 'familiar' | 'discovery',
  editorialLabel?  // "Mediterranean Embroidery", "Porcelain Prints", etc.
}
```

Style families seeded: `mediterranean_embroidery`, `blue_white_porcelain`, `riviera_floral`, `coastal_knit`, `crochet_resort`, `raffia_luxury`, `yacht_swim`, `harbor_aperitivo`, `sunset_glamour`, `destination_print`.

Activity tags seeded: `yacht_day`, `beach_club_lunch`, `harbor_aperitivo`, `market_morning`, `sunset_views`, `riviera_dinner`, `pool_day`, `arrival_day`, `shopping_afternoon`.

### Scoring function (`src/lib/moreLikeThis.ts`)

```text
score =  destinationMatch     × 5.0   // hard prefilter; zero = excluded
       + styleFamilyOverlap   × 3.0   // count of shared families
       + activityFidelity     × 4.0   // shared activity, with hard excludes
       + editorialUniqueness  × 1.0   // boost rarely-shown products
       + luxuryAppeal         × 0.5   // price/brand-tier signal
       − sameBrandPenalty     × 2.0   // applied during diversification
```

Hard rules enforced after scoring:
- Drop any product whose `activityTags` overlap the look's `excludeFamilies` (e.g. yacht coverup under a dinner look).
- Drop products with no image, no href, or `soldOut: true` (uses existing fallback inventory logic).
- Diversify: greedy pick top-scored, cap at **2 per brand**, target **6 cards** (8 max).
- Brand mix target: ~30% familiar / ~70% discovery; if the discovery pool is too small, top up with familiar to hit 6.

### Seed product library

Add `src/data/productLibrary.ts` with ~14 seeded items so the carousel renders meaningfully on every Portofino look:

| Brand | Product | Families | Activities | Tier |
|---|---|---|---|---|
| Milly | Lela Embroidered Midi | mediterranean_embroidery, blue_white_porcelain | market_morning, beach_club_lunch | discovery |
| Milly | Lene Embroidered Mini | mediterranean_embroidery, blue_white_porcelain | beach_club_lunch, arrival_day | discovery |
| Farm Rio | Off-White Porcelain Garden Cut-Out Midi | blue_white_porcelain, destination_print | market_morning, sunset_views | discovery |
| Dolce & Gabbana | Majolica Twill Shirt Dress | blue_white_porcelain, destination_print | riviera_dinner, sunset_views | familiar |
| Alice + Olivia | Glinda Majolica Tassel Mini | blue_white_porcelain, sunset_glamour | sunset_views, harbor_aperitivo | familiar |
| Alice + Olivia | Miriam Linen Sweetheart Top | blue_white_porcelain | harbor_aperitivo, beach_club_lunch | familiar |
| + 8 existing Resort Edit pieces re-tagged from `portofino.ts` (raffia tote, Eres swimsuit, Gianvito sandals, etc.) for yacht/beach/aperitivo coverage |

Images for the six uploaded references are added via lovable-assets pointers from `/mnt/user-uploads/` (not copied into the repo). Each product `href` points to its retailer page so existing `trackOutbound` analytics work unchanged.

### UI

New component `src/components/MoreLikeThis.tsx`:
- Horizontal scroll-snap rail (`overflow-x-auto snap-x snap-mandatory`), no JS carousel dep
- Card: 240px wide, image (3:4), brand eyebrow, name, price, optional editorial label chip (e.g. "Mediterranean Embroidery"), Save heart (reuses `src/lib/saved.ts`), Shop outbound link
- Mobile: snap rail; Desktop: same rail with subtle arrow affordance; matches existing ivory/ink/gold tokens

### Files

**New:**
- `src/data/styleDNA.ts` — LookDNA map for all existing Portofino looks
- `src/data/productLibrary.ts` — seeded ProductDNA records
- `src/lib/moreLikeThis.ts` — scorer + diversifier (pure function, fully testable)
- `src/components/MoreLikeThis.tsx`
- 6 lovable-assets pointer JSONs under `src/assets/products/` for the uploaded references

**Edited:**
- `src/routes/portofino.$day.$look.tsx` — render `<MoreLikeThis lookId={…} />` between Editor's Alternatives and the Continue-to-Day-X CTA

### Out of scope (per prior constraints)

- No new admin UI, no DB migration, no sourcing changes, no new archetypes, no /capsules/editorial/essentials.
- Quick View modal not built this pass — card opens the retailer in a new tab like existing `ProductCard`.

### Verification

- Build clean
- Visit `/portofino/day-1/look-a` (Yacht): carousel shows yacht/coverup/raffia items, **no** dinner dresses
- Visit `/portofino/day-4/look-a` (Sunset/Dinner): shows D&G Majolica, A+O Glinda, Farm Rio Porcelain, **no** yacht swim
- Visit `/portofino/day-2/look-a` (Beach Club): shows Milly Lene, Milly Lela, knit/crochet alts
- Brand cap verified: never more than 2 Milly tiles in one rail
- Mobile screenshot at 420px confirms snap scroll + readable copy