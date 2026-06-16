# Project Memory

## Core
Resort Edit is a luxury personal shopper, not a product search engine. The destination fantasy IS the product. KPI = saves, not clicks. Always apply the Rich Woman Test, the Save Test, and the Luxury Personal Shopper Test before approving any look.
Vault-first sourcing: check vault_products before any Firecrawl call. Never re-scrape cached URLs.
Firecrawl is allowed only for: new discovery, inventory validation, sold-out replacement, Vault expansion.
Sourcing must filter: approved brand (brands.status='approved') → approved retailer allowlist → target category/activity.
Approved retailers only: mytheresa, net-a-porter, fwrd, shopbop, saks, neimanmarcus, nordstrom, bloomingdales, luisaviaroma, modaoperandi, farfetch, ssense, everythingbutwater.
Brand diversity: cap 1–3 appearances per brand per 25-look destination; 30% Hero / 70% Discovery mix.
Workflow hierarchy (never reverse): Destination → Activity → Energy → Look DNA → Complete Outfit → Products → Muse. Products support the look; looks are never built around products.
Look DNA is mandatory before sourcing. Muse imagery is generated only after products are approved and the outfit is assembled.
Yacht Day brand universe = swimwear + coverups + resortwear + Mediterranean print + luxury vacation brands tagged Yacht Day — not swimwear-only.
All sourced products require human approval (status='pending' → review queue). No auto-approval into the Vault, ever.
Dry-run must pass (PDP-only URLs, retailer-specific patterns, ≤3 per brand enforced inline) before any PDP scrape.
Hero Piece + One Statement rule: every look has exactly one hero; accessories support, never compete. Destination Specificity > generic vacation styling. Activity fidelity heavily influences scoring (Yacht Day ≠ Beach Club ≠ Long Lunch).
Differentiation Layer (publish gate): every look must pass Transformation, Memory, Screenshot, Daydream, and Movie tests AND embody all six Resort Edit Standard attributes (Luxury, Destination Specificity, Editorial Quality, Saveability, Discovery, Emotional Resonance, Lifestyle Aspiration). Luxury alone is never enough.

## Memories
- [Brand diversity](mem://features/brand-diversity) — Hero/Discovery mix, per-destination brand caps, overrepresentation flagging
- [Sourcing cost control](mem://features/sourcing-cost-control) — Vault-first workflow, Firecrawl allow/forbid rules, retailer allowlist, refresh cadence, Yacht Day pilot constraints
- [Personal shopper architecture](mem://features/personal-shopper-architecture) — Phase 2 doctrine: Look DNA, outfit assembly slots, luxury-shopper test, muse-last order
- [Luxury shopper doctrine](mem://features/luxury-shopper-doctrine) — Full canonical doctrine: success metric, decision hierarchy, editorial identity, hero/one-statement/color/print/texture rules, wealth signals, trip progression, Steven Dann rule
- [Differentiation layer](mem://features/differentiation-layer) — Five publish-gate tests (Transformation, Memory, Screenshot, Daydream, Movie) + the six-attribute Resort Edit Standard
