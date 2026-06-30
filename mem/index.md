# Project Memory

## Core
All muses share ONE Master Face identity across the entire site — only hair, styling, makeup, wardrobe, and environment change between muses. Never vary facial structure, age, or body proportions. Editorial luxury campaign quality, never catalog.
Each muse has a single isolated identity-lock reference at `src/assets/muses/muse-<slug>.png.asset.json` (mediterranean/tropical/glam/adventure/cultural). When generating a muse image, pass ONLY that muse's reference — never the full 5-muse board.
Portofino uses Muse 1 (Mediterranean): rich glossy brunette, sun-kissed skin, gold jewelry, golden-hour yacht energy.
Any new table read by public pages must explicitly REVOKE default anon/authenticated grants and re-GRANT only safe columns + add narrow RLS, then be probe-tested with the publishable key (sensitive cols → 401/403, public view → 200). Never rely on Supabase defaults.

## Memories
- [Muse System](mem://design/muse-system) — Five destination muses (Mediterranean, Tropical, Glam, Adventure, Cultural/Asia) with hair, features, energy, beauty, photography rules + negative prompts
- [Look build rules](mem://features/look-build-rules)
- [Product resilience](mem://features/product-resilience)
- [Sourcing rules](mem://features/sourcing-rules)
