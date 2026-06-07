# Prompts 46–49 — Phased Plan

These four prompts touch very different surfaces with very different cost profiles. I want to do them in three phases so each one is verifiable before moving to the next, instead of half-shipping everything in one pass.

## Phase 1 — Structure & copy (Prompts 46 + 47)

**Day 1 (`src/data/yachtToLunch.ts`)** — currently 10 looks. Reduce to 5 that tell the arc of the day:

1. **Look 1 — Yacht Arrival** (arrival) — keep current Look 1 (D&G Majolica)
2. **Look 2 — Feminine Yacht Swim** (on-water/swim) — keep current Look 2 (Alexandra Miro cobalt)
3. **Look 3 — Beach Club Swim** (midday beach club) — promote current Look 4 (Johanna Ortiz emerald + cover-up)
4. **Look 4 — Sunset Aperitivo** (golden hour) — promote current Look 9
5. **Look 5 — Harbour Evening** (evening) — promote current Look 10

Renumber `number: 1…5`, update `id`, update LOOK tabs, update intro copy ("ten complete looks" → "five complete looks"), update Day Nav "of 10" → "of 5".

**Days 2–5 (`src/components/PortofinoDayPage.tsx` + `DAY_META`)** — currently 3 looks each. Extend the template's `[0,1,2].map` to `[0,1,2,3,4].map`, and add 2 more entries to each day's `images`, `lookTitles`, `lookMoods`, and `inspired` arrays. The two new looks per day will reuse existing edit-d{n}-{a|b|c} thumbs cycled (since no new generated images exist yet for slots 4–5) — clearly flagged in code with `TODO: replace with dedicated muse image` comments. Look titles/moods written to fit the day's narrative arc.

**Homepage (`src/routes/index.tsx`)**:
- "Shop 3 Looks" → "Shop 5 Looks" on every day card
- Hero stats "5 Days · 15 Looks · 6 Experiences" → "5 Days · 25 Looks · 6 Experiences"
- "Shop 15 Looks — Day by Day" CTA → "Shop 25 Looks — Day by Day"
- Page title meta "five looks" copy stays consistent

## Phase 2 — Muse consistency (Prompt 48)

This requires regenerating up to ~10 Day 1 look images (`src/assets/looks/look-{1..10}-muse.jpg`) plus the new Day 2–5 slots, using `muse-mediterranean.png` as the identity-lock reference per `mem/design/muse-system.md`. Each generation is a separate `edit_image` call with the strict luxury-campaign prompt standard you set in Prompt for Day 5.

I'd like to do this as a follow-up turn so I can:
- Confirm with you which 5 Day-1 looks you want kept (vs my picks above)
- Avoid burning generations on looks we're about to cut
- Batch the regenerations sensibly (5 Day-1 + 8 new Day 2–5 slots = ~13 images)

For Phase 1 I'll leave the existing images in place and add a visible "PLACEHOLDER — pending regeneration" eyebrow tag on any reused thumbnail in Days 2–5 slots 4–5, per your "clearly-marked placeholder" instruction.

## Phase 3 — Product link upgrade (Prompt 49)

Most current links use `MT()`, `NAP()`, `FF()`, `REV()`, `SAKS()` search-URL helpers in `yachtToLunch.ts` and similar generators in `portofino.ts`. Upgrading every one to a real PDP requires either:
- Manual research per product (~80 items across Day 1 alone), or
- Running Firecrawl validation against the brand sites to find live PDPs

The cleaner intermediate step — which I'll do as Phase 3 in this same flow — is to **swap every search-URL helper for the brand's relevant category page**, which is the fallback you explicitly approved ("link to the brand's relevant category page rather than a raw search query"). That removes the "no results" failure mode site-wide in one pass. Verified direct PDPs can then be filled in over time without breaking anything.

I will **not** attempt to fabricate direct PDP URLs — that would introduce dead links worse than the search pages.

## What I'll do right now if you say "go"

Phase 1 only. That delivers:
- Day 1 trimmed to 5 looks with the arrival → swim → beach club → aperitivo → evening arc
- Days 2–5 extended to 5 look modules each (slots 4–5 flagged as placeholders)
- Homepage copy updated to "5 Looks" / "25 Looks"

Then I'll come back for your confirmation on Phase 2 (image regen list) and Phase 3 (brand-category URL sweep).

Is that sequencing right, or would you rather I just blast all three phases in one go and accept some placeholder/flagged content along the way?