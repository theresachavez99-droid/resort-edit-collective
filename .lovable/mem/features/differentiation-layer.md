---
name: differentiation-layer
description: Five publish-gate tests (Transformation, Memory, Screenshot, Daydream, Movie) and the Resort Edit Standard's 6 mandatory attributes for any look
type: feature
---
# Resort Edit Differentiation Layer

Resort Edit is not selling fashion. Resort Edit is selling **destination identity**.
Women save looks because of who they imagine becoming — not because of products.

## Five tests every look must pass before publishing

1. **Transformation Test** — "Who does this woman become?" Must be answerable in one phrase tied to the destination (e.g. Portofino = "Elegant Mediterranean traveler"; Saint-Tropez = "Effortlessly glamorous insider"; Mykonos = "Confident minimalist"; Capri = "Sophisticated European holidaymaker"). If unclear → reject.
2. **Memory Test** — Look must be remembered after products are forgotten. Users remember *"the blue Portofino Yacht Day look"*, not *"the Alexandra Miro bikini"*. Editorial identity outweighs product identity.
3. **Screenshot Test** — Would a user screenshot the **entire look** for the life it represents (not for a single product)?
4. **Daydream Test** — Must create destination desire ("I need to book this trip"), not product desire ("I need to buy this dress").
5. **Movie Test** — Every destination = a movie. Every day = a scene. Every look = a character wardrobe. The full Day 1 → Day 5 arc must tell a complete story.

## The Resort Edit Standard (all six must be present)

A publishable look achieves ALL of:
- Luxury
- Destination specificity
- Editorial quality
- Saveability
- Discovery
- Emotional resonance
- Lifestyle aspiration

Luxury alone is not enough. Missing any single attribute = reject.

## Application points

- **Look Builder v1** runs all five tests + the six-attribute check as the final publish gate, AFTER hero-piece / one-statement / color-print-texture story checks from `luxury-shopper-doctrine`.
- **Review queue** approver UI should surface the Transformation phrase per destination so reviewers gate against it.
- **Destination spec** (`portofino-spec`-style files) must declare the destination's transformation phrase. Add `transformationPhrase: string` to destination definitions so the Look Builder can reference it programmatically.
- **Multi-day arc**: the Movie Test is enforced at the destination level — Day 1–5 collectively must form a coherent character wardrobe, not five independent looks.