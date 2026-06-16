---
name: Resort Edit Luxury Personal Shopper Doctrine
description: Canonical doctrine governing every sourcing, scoring, styling, and publishing decision. Overrides product-level scores when in conflict.
type: feature
---

# Resort Edit Luxury Personal Shopper Doctrine

## Core mission
Resort Edit is a luxury personal shopper and destination stylist — NOT a product
search engine, NOT an affiliate shopping site. Every decision must help a woman
answer: "What would a wealthy, stylish woman wear here?"

## Success metric
The destination fantasy IS the product. Success = "I never would have found
these pieces myself, but this is exactly how I want to dress in Portofino."
This outcome OUTWEIGHS price, brand prestige, popularity, affiliate potential,
and individual product scores.

## Decision hierarchy (always evaluate in this order)
1. Destination
2. Activity
3. Emotional Energy
4. Look DNA
5. Hero Piece
6. Complete Outfit
7. Products
8. Brand

Brand never overrides destination fit, activity fit, emotional energy, Look
DNA, or editorial quality. Never build looks around brands or products. Build
looks around the destination experience.

## Editorial identity rule
Looks must be more memorable than the products themselves. A user should
remember "the Portofino Yacht Day look" more than "the Alexandra Miro bikini."

## The three tests (run before approving any look)
- **Luxury Personal Shopper Test**: would a luxury personal shopper confidently
  recommend this entire outfit to a client traveling to this destination? If
  no, reject. Overrides product scores.
- **The Save Test**: would a woman save this because she wants to dress like
  this in Portofino? (Not: would she click the swimsuit.) Saves > clicks is
  the primary KPI.
- **The Rich Woman Test**: would a wealthy woman who already owns luxury
  fashion save this? (Not: would this appeal to the average shopper.) Resort
  Edit serves aspirational luxury travelers.

## Destination Specificity Rule
If a look could work anywhere, score it LOWER. Strongest looks feel inseparable
from the destination.
- Portofino: Mediterranean glamour, ceramic prints, raffia textures, lemon
  grove energy, harbor elegance.
- Mykonos: architectural whites, sculptural silhouettes, minimal glamour.
- Saint-Tropez: French Riviera sensuality, linen, gold jewelry, barefoot
  luxury.

## Activity Accuracy Rule
Each activity has its own styling language and visual identity. Yacht Day ≠
Beach Club ≠ Market Morning ≠ Long Lunch ≠ Harbor Aperitivo ≠ Statement
Dinner. Activity fidelity heavily influences scoring.

## Look DNA First (workflow, never reversed)
Destination → Activity → Emotional Energy → Look DNA → Hero Piece → Products →
Complete Outfit. Products do not define the look — Look DNA does.

## Hero Piece Rule
Every look begins with ONE hero piece (e.g., Alexandra Miro majolica bikini,
Eres one-piece, Agua pareo, Zimmermann floral kaftan). Everything else
supports the hero. Never create multiple competing focal points.

## One Statement Rule
Luxury rarely stacks statements. Pick one hero statement; everything else
supports. Avoid statement swimwear + statement earrings + statement necklace
+ statement bag + statement sunglasses all competing simultaneously.

## Outfit Before Product Rule
Think "I need a Portofino Yacht Day look" THEN source products. Never "I found
a bikini, now build a look around it."

## Accessory Ecosystem Rule
Shoes / bag / jewelry / sunglasses / scarves / hair must reinforce the same
styling story. Accessories must feel intentionally selected, not random.

## Color Story Rule
Every look needs a deliberate color story (Mediterranean Blue & White, Emerald
Riviera, Coral Aperitivo, Ivory & Gold, Mediterranean Floral). Products
support the color story. Random color additions reduce score.

## Print Story Rule
When a print exists, build around it. Never introduce competing prints. The
print remains the focal point.

## Texture Story Rule
Luxury relies heavily on texture. Reward cotton voile, linen, raffia, crochet,
embroidery, silk, natural fibers. Texture often matters more than color.

## Wealth Signals Rule
Luxury feels subtle. Reward fabrication, texture, tailoring, fit, silhouette,
destination relevance. Penalize logo-heavy styling, trend chasing,
fast-fashion energy, influencer aesthetics, spring break styling, overly
flashy styling.

## Editorial Reference Rule
When inspiration imagery exists, replicate energy/mood/lifestyle/silhouette/
color story/destination fantasy — NOT exact products. Editorial fidelity beats
exact product matching.

## Brand Discovery Rule
30% Hero Brands / 70% Discovery Brands. Users should discover brands they have
never heard of. Brand repetition lowers score. No brand dominates a
destination unless explicitly approved.

## Trip Progression Rule
A destination wardrobe evolves: Day 1 fresh/playful/arrival → Day 2 more
confident → Day 3 peak glamour → Day 4 statement moment → Day 5 relaxed
sophistication. The trip tells a story.

## Destination Wardrobe Rule
Evaluate the entire destination, not individual looks. Assess color, brand,
silhouette, print, activity, and emotional energy DISTRIBUTION across the
wardrobe. A destination must feel curated as a complete wardrobe.

## Steven Dann Rule (buy the feeling, not the item)
Score emotional impact, destination fantasy, aspirational value, saveability,
lifestyle desirability AT LEAST as heavily as price, brand recognition, and
product popularity. People save Portofino looks because they want the LIFE the
outfit represents — not because of any single bikini.

## Final question before publishing any look
"Would a wealthy woman save this because she wants to BE this woman in this
destination?" If the answer is not an immediate yes, keep refining.

## Application points in the codebase
- `src/lib/productScoring.ts` — scoring axes must weight destination
  specificity, activity fidelity, texture, and editorial identity at least as
  heavily as price/brand prestige.
- `src/data/lookDNA.ts` — every look has a hero piece + color story + print
  story + accessory ecosystem before sourcing runs.
- `src/lib/yacht-day-pilot.functions.ts` and any future sourcing runner —
  enforce Look DNA briefs as the input, not raw brand×retailer queries.
- Future Look Builder v1 — must run all three tests (Personal Shopper, Save,
  Rich Woman) and the One Statement / Hero Piece checks before assembling a
  publishable look.
- Review queue UI (`/admin/review-queue`) — human reviewer applies these
  rules; promotion to Vault is the doctrine gate.