# Project Memory

## Core
All muses share ONE Master Face identity across the entire site — only hair, styling, makeup, wardrobe, and environment change between muses. Never vary facial structure, age, or body proportions. Editorial luxury campaign quality, never catalog.
Each muse has a single isolated identity-lock reference at `src/assets/muses/muse-<slug>.png.asset.json` (mediterranean/tropical/glam/adventure/cultural). When generating a muse image, pass ONLY that muse's reference — never the full 5-muse board.
Portofino uses Muse 1 (Mediterranean): rich glossy brunette, sun-kissed skin, gold jewelry, golden-hour yacht energy.
Any new table read by public pages must explicitly REVOKE default anon/authenticated grants and re-GRANT only safe columns + add narrow RLS, then be probe-tested with the publishable key (sensitive cols → 401/403, public view → 200). Never rely on Supabase defaults.
Never press site-level Publish without explicit per-change founder approval. All refactor work stays in preview/draft. Any change that affects live public behavior (redirects, public read paths, moment.status flips, public-URL nav) must be staged, called out as "this changes live behavior", and held for sign-off before publishing.
Resort Edit site is currently published with effective_publish_visibility=private (workspace-gated). resortedit.com 302→auth-bridge for the public. Treat all current "published" state as preview-only until visibility is flipped.
One engine path only: runMoment (src/lib/moment-run.functions.ts). Never reintroduce a parallel/legacy generation pipeline. Gate C (anti-fabrication) is enforced at the data flow — feed-only ranker + assertNoProductNames in Stage 1.
The public read layer is three definer-rights views (moments_public, founder_looks_public, brands_public) owned by postgres with `security_invoker = false` and SELECT granted to anon+authenticated. NEVER "fix" them to security_invoker/security-definer-removal or revoke their grants — that exact automated scanner fix took the public API and MCP endpoint down on July 25 and July 31. Decline such findings.
All Resort Edit hero videos/posters use object-fit: cover with object-position pinned to top-center on the eyeline (default 50% 15%; portrait/4:3 sources may use 50% 0% with a taller container). Never crop through the model's head; preserve head, hair, and shoulders first, letting lower body crop if needed. Focal point is always the model's eyes.

## Memories
- [Muse System](mem://design/muse-system) — Five destination muses (Mediterranean, Tropical, Glam, Adventure, Cultural/Asia) with hair, features, energy, beauty, photography rules + negative prompts
- [Look build rules](mem://features/look-build-rules)
- [Product resilience](mem://features/product-resilience)
- [Sourcing rules](mem://features/sourcing-rules)
