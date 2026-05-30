# Project Memory

## Core
Resort Edit look naming: [Mood/Styling] + [Destination/Activity]. No relationship-status, marital-status, identity, or lifestyle-assumption labels.
Every look MUST include the full stack: Outfit, Shoes, Bag, Jewelry (Earrings + Necklace + Bracelet + Ring), Sunglasses, Hair Detail, Optional Layer. Incomplete looks are rejected.
Product cards use ShopItem resilience model (href + backup_link_1/2 + inventory_status + replaced + lookIndex). Show "Updated Pick" badge when replaced; render "Not available through approved affiliate partners" when no affiliate match resolves. Never show "Sold out" / "Unavailable".
Affiliate retailers ONLY (Farfetch → MyTheresa → Net-a-Porter → Shopbop → Revolve → Nordstrom → Saks → Bloomingdale's → Neiman Marcus → SSENSE → brand direct). Exact product URLs only — never collection, homepage, category, or placeholder URLs. Preserve affiliate params; never rewrite or strip tracking.
Per-card required: Brand, Product Name, Price, Exact Product URL, Thumbnail Source URL (pulled from same retailer). All links open in new tabs.
Layout: product grid right of AI model, equal thumbnail sizes, images fill containers (no gray), equal card heights, show Brand · Name · Price · SHOP →.
Styling: women 35–45, luxury vacation, cobblestone-friendly shoes, sculptural jewelry (no over-layering), no cropped layers over maxis, no duplicate accessories across looks, no repeated hats.

## Memories
- [Look build rules](mem://features/look-build-rules) — Full sourcing, URL, replacement, layout, and QA spec for every look
- [Product resilience](mem://features/product-resilience) — Replacement hierarchy, display rules, resolveProductLink helper
