# Project Memory

## Core
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

## Memories
- [Brand diversity](mem://features/brand-diversity) — Hero/Discovery mix, per-destination brand caps, overrepresentation flagging
- [Sourcing cost control](mem://features/sourcing-cost-control) — Vault-first workflow, Firecrawl allow/forbid rules, retailer allowlist, refresh cadence, Yacht Day pilot constraints
- [Personal shopper architecture](mem://features/personal-shopper-architecture) — Phase 2 doctrine: Look DNA, outfit assembly slots, luxury-shopper test, muse-last order
