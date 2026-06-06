---
name: Resort Edit Muse System
description: Master Face system — one shared face identity across all five destination muses. Only hair, styling, makeup, wardrobe, and environment vary by muse. Use the assigned muse consistently across all 10 looks on a destination page.
type: design
---
# Resort Edit Muse System

## Identity-lock reference images (CRITICAL)
Each muse has a single isolated face reference at `src/assets/muses/muse-<slug>.png.asset.json`. These are IDENTITY LOCKS, not inspiration or style guidance — when generating or editing a muse image, pass ONLY that muse's reference (never the full 5-muse collage board, which causes muse drift / multi-face confusion).

- Mediterranean → `src/assets/muses/muse-mediterranean.png.asset.json` — Portofino, Capri, Amalfi, Greece, Mallorca, Sicily, South of France
- Tropical (Latin) → `src/assets/muses/muse-tropical.png.asset.json` — Tulum, Cancun, Cartagena, Miami, Bali beach days, Puerto Rico, Maldives, Phuket
- Glam → `src/assets/muses/muse-glam.png.asset.json` — Monaco, Dubai, St. Barths, high-glam evenings
- Adventure (Blonde) → `src/assets/muses/muse-adventure.png.asset.json` — Safari, desert, luxury lodges, excursions, explore days
- Cultural / Asia → `src/assets/muses/muse-cultural.png.asset.json` — Tokyo, Kyoto, Cambodia, Vietnam, heritage/temple destinations

Reference priority when generating: face reference VERY HIGH → environment MEDIUM → outfit LOWER. Preserve identity before styling. Regenerate any look if the wrong muse is selected, the face drifts from its reference, it resembles another muse, or identity changes between looks on the same page.

## Master Face (shared across ALL muses)
Single anchor face identity used across every muse and every look on the site. Users should recognize the same Resort Edit woman adapted to different destinations — never different random models.

- Face shape: oval, refined jawline, balanced proportions, elegant cheekbones, soft-but-defined features.
- Beauty: luxury editorial, expensive aesthetic, healthy glow, sophisticated (not influencer), polished but effortless.
- Body: toned feminine proportions, realistic, elegant posture, luxury-traveler energy.
- Age: consistent across all generations — do not drift older or younger between looks.
- Photography: luxury campaign quality, editorial fashion, warm natural light, cinematic composition, destination storytelling.

Only vary between muses: hair color, hair styling, makeup intensity, wardrobe, environment.
Never vary: facial proportions, facial structure, age appearance, body proportions, beauty identity.

Global rules:
- Fixed recurring muses across the site. Same muse across all 10 looks on a destination page. Use destination-assigned muse only.
- Preserve the Master Face across the entire site — same face identity in every muse, every look.
- Editorial luxury campaign quality — not ecommerce catalog.
- Avoid: changing facial structure between looks, older-looking drift, generic AI influencer look, over-smoothed faces, catalog posing, awkward hands, inconsistent age, low-detail faces, unrealistic proportions, random face changes, stiff centered poses, ecommerce model energy.

## Muse 1 — Mediterranean (Portofino, Capri, Amalfi, Greece, Mallorca, Sicily, South of France)
Rich brunette, glossy (sleek bun OR soft waves). Strong facial structure, refined symmetry, sun-kissed skin, polished but relaxed. Minimal luxury makeup, gold jewelry. Warm golden-hour light, editorial yacht campaigns. Italian Riviera wealthy-traveler energy.

## Muse 2 — Tropical (Phuket, Bali, Tulum, Maldives, islands)
Honey/dark blonde, textured beach waves. Glowy bronzed skin, softer features, healthy athletic, playful luxury. Bright tropical light, water-heavy imagery.

## Muse 3 — Glam (Monaco, Dubai, St. Barths, high-glam)
Sleek black hair. Strong bone structure, dramatic beauty, fashion-campaign energy. Stronger makeup, high jewelry. Cinematic high-contrast luxury campaign light.

## Muse 4 — Adventure (safari, desert, jungle, excursions)
Blonde bombshell. Champagne/expensive blonde (dark blonde acceptable), polished texture — luxury blowout, soft waves, or elevated ponytail. Bronzed skin, athletic elegance, stronger facial structure, natural glam makeup, healthy glow. Styling: ivory, khaki luxury, olive, linen textures, woven accessories, gold jewelry, luxury neutrals. Warm sunlight, cinematic outdoor editorial — luxury safari / wealthy traveler / elevated explorer / outdoor glamour. NOT rugged or survivalist. Differentiation vs Muse 2 (Tropical): Tropical = beachy blonde, playful, colorful; Adventure = polished blonde, luxury explorer, sophisticated neutrals.

## Muse 5 — Cultural / Asia (Tokyo, Kyoto, Cambodia, Vietnam, heritage)
Sleek black hair, often in a bun. Refined elegance, polished minimal beauty. Softer makeup, elegant jewelry, timeless styling. Warm light, heritage architecture.

## Current assignments
- Portofino → Muse 1 (Mediterranean). All Day 1 muse images must depict the same brunette Mediterranean muse across all 10 looks.
