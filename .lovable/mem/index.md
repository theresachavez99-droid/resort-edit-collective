# Project Memory

## Core
Vault-first sourcing: check vault_products before any Firecrawl call. Never re-scrape cached URLs.
Firecrawl is allowed only for: new discovery, inventory validation, sold-out replacement, Vault expansion.
Sourcing must filter: approved brand (brands.status='approved') → approved retailer allowlist → target category/activity.
Approved retailers only: mytheresa, net-a-porter, fwrd, shopbop, saks, neimanmarcus, nordstrom, bloomingdales, luisaviaroma, modaoperandi, farfetch, ssense, everythingbutwater.
Brand diversity: cap 1–3 appearances per brand per 25-look destination; 30% Hero / 70% Discovery mix.

## Memories
- [Brand diversity](mem://features/brand-diversity) — Hero/Discovery mix, per-destination brand caps, overrepresentation flagging
- [Sourcing cost control](mem://features/sourcing-cost-control) — Vault-first workflow, Firecrawl allow/forbid rules, retailer allowlist, refresh cadence, Yacht Day pilot constraints
