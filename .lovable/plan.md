# Portofino Guide Editorial Tightening

## Scope
Edit only the public `/portofino` guide and its Portofino-specific display data. Preserve the hero, imagery, navigation, typography, colors, card styling, responsive behavior, footer, legal pages, homepage video, tracking infrastructure, and every other route.

## Changes
- Keep the hero and four existing hotel cards; shorten the repeated STAY introduction.
- Limit DO to four existing recommendations: La Portofinese Eco-Farm, Private Boat Tour, Pesto Cooking & Lunch, and Bagni Fiore.
- Tighten experience descriptions and facts, especially the Eco-Farm, while retaining its labelled illustration and one seasonal/reservation caveat.
- Remove repeated per-card operator and verification boilerplate; replace it with one shared note near the section.
- Limit EAT to DaV Mare, La Terrazza, Ristorante Puny, and Da ö Batti.
- Replace the four packing cards and Biankina promotion with one compact, unlinked packing block.
- Merge Planning Notes and Getting There into a concise “Before You Go” section containing only the requested logistics.
- Remove the standalone Instagram sentence and follow button.
- Consolidate page disclaimers into one bottom note covering availability, labelled editorial/AI illustrations, and current non-commission status.

## Technical details
- Primary page: `src/routes/portofino.tsx`.
- Portofino-specific data may be tightened in `src/data/destinationExperiences.ts`, `src/data/portofinoDining.ts`, and `src/data/portofinoPackingGuide.ts` only where needed to render this guide accurately.
- Keep outbound tracking untouched; removing the Biankina presentation does not alter its registry entry.
- Update only existing focused assertions if they encode the removed guide content; add no unrelated tests.

## Validation
- Run the focused Portofino/launch-readiness tests and the production build.
- Inspect `/portofino` at desktop and mobile widths for the exact 4/4 recommendation counts, working anchors, preserved labels/images, no Biankina or duplicate cards, and no awkward gaps or horizontal overflow.
- Confirm the homepage hero video remains byte-for-byte untouched and do not publish.
