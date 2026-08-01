# White-Glove Audit — My Edit & Brands We Love (Aug 2026)

## 1) My Edit / Save Looks

### Before
| Surface | Save action |
|---|---|
| Moment page hero (non-cinematic only) | Yes |
| Moment page hero (cinematic — 8 of 12 moments) | **Missing** |
| Featured Look column | Missing |
| Sibling look cards ("More Resort Edit Looks") | Missing |
| Nightcap editorial cards | Missing |
| Extra editorial reference cards | Missing |
| Complete Look detail (`/portofino/$day/$look`) | Missing |
| `ResortEditLookCard` | Missing |

Root cause: `SaveLookButton` had exactly one call site, inside the legacy hero
branch, so cinematic-hero moments had no save capability at all.

### After
Save is exposed on every eligible look object, with stable ids:
- moment look → `portofino/<slug>` (featured column, always rendered)
- sibling look → `portofino/<day>/<lookSlug>`
- editorial card → `portofino/<slug>#<cardKey>`
- complete look → `portofino/<day>/<slug>`

### Verified
- Persistence via `localStorage` (`resort-edit:my-edit:looks`), single access layer in `src/lib/myEdit.ts`.
- Duplicate prevention: `saveLook` no-ops on existing id; ids are canonical URLs/keys.
- Cross-surface sync: `useMyEdit` listens to custom event + `storage` event.
- Toggle: save/unsave both work from every control; `aria-pressed` reflects state.
- Empty states: distinct copy for Looks and Products tabs, with CTAs.
- Mobile: controls are inline text/icon buttons within card flow, no overlap.
- Login state: My Edit is device-local by design (Phase 1) and `noindex`.

### Architectural notes / remaining limits
- No authenticated sync — saves do not follow a user across devices. Moving to
  Supabase requires only changes inside `src/lib/myEdit.ts`.
- Cinematic hero has no overlay save by design; the featured column owns it.

## 2) Brands We Love — homepage curation

### Objective defects fixed
- Homepage brand names linked to `/brands` generically; now deep-link to
  `/brands/$slug` detail pages.
- Naming inconsistency: "ERES"/"ViX Paula Hermanny" on the homepage vs
  "Eres"/"Vix Paula Hermanny" in the brand registry — standardized to registry
  spelling (display remains uppercase via CSS).
- Ordering reworked to read Mediterranean-first, then resort, then swim.

### Editorial recommendation (awaiting approval — no brand removed yet)
Keep: Eres, Callas Milano, Pucci, Missoni, Zimmermann, Alexandra Miro.
Watch/consider replacing: Johanna Ortiz (Bogotá maximalism, ruffle-forward —
reads more tropical than Ligurian), Vix Paula Hermanny (strong swim, but the
broader line skews resort-mass).
Candidates to add: Loro Piana (quiet-luxury linen, arrival/long lunch),
Emporio Sirenuse (Positano-made, unmistakably Mediterranean),
La DoubleJ (Milan-via-Sicily print authority), Oséree (evening swim/glamour).
