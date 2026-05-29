# Project Memory

## Core
Resort Edit look naming: [Mood/Styling] + [Destination/Activity]. No relationship-status, marital-status, identity, or lifestyle-assumption labels.
Every look must include shoes AND at least one jewelry item (1–3 max). Never write "No shoes needed" or "no jewelry needed".
Product cards use ShopItem resilience model (href + backup_link_1/2 + inventory_status + replaced). Show "Updated Pick" badge when replaced; hide card when no link resolves. Never show "Sold out" / "Unavailable".
Affiliate replacement search order: Farfetch → MyTheresa → Net-a-Porter → Shopbop → Revolve → Nordstrom → Saks → Bloomingdale's → Neiman Marcus → SSENSE, then brand direct. When no close match exists, set cms_flag "NO HIGH-QUALITY MATCH FOUND" and recommend revising/regenerating the look instead of shipping a weak substitute.

## Memories
- [Product resilience](mem://features/product-resilience) — Replacement hierarchy, display rules, resolveProductLink helper
