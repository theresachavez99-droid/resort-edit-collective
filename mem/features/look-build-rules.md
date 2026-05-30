---
name: look-build-rules
description: Resort Edit global product sourcing + look build rules — required components, URL/affiliate rules, replacement, styling, layout, and QA gates for every look
type: feature
---
GLOBAL: every look must be implementation-ready. Incomplete looks are rejected.

REQUIRED COMPONENTS (every look):
Outfit · Shoes · Bag · Jewelry (Earrings + Necklace + Bracelet + Ring) · Sunglasses · Hair Detail · Optional Layer.

PRODUCT LINKS:
- Affiliate-partner retailers only (Farfetch → MyTheresa → Net-a-Porter → Shopbop → Revolve → Nordstrom → Saks → Bloomingdale's → Neiman Marcus → SSENSE → brand direct).
- Exact product URLs only. NEVER collection pages, homepages, category pages, or placeholders ([INSERT URL], [ADD PRODUCT], [SOURCE LATER]).
- If no exact affiliate product can be sourced, render the literal string: "Not available through approved affiliate partners".

PER-CARD FIELDS (required):
Brand · Product Name · Price · Exact Product URL · Thumbnail Source URL.

LINKING:
- Thumbnails pulled only from the supplied product URL's retailer.
- All product links open in new tabs (target="_blank" rel="noopener noreferrer sponsored").
- Preserve affiliate params; do NOT rewrite URLs or strip tracking codes.

REPLACEMENT (sold out / broken / unavailable / image missing):
Only replace if (a) replacement is from approved affiliate partner AND (b) matches aesthetic + category + color family + price tier AND (c) replacement has exact URL. Otherwise display "Not available through approved affiliate partners". Show "Updated Pick" badge on replacements. Never show "Sold out" / "Unavailable".

STYLING:
- No duplicate accessories across looks. No repeated hats.
- Cobblestone-friendly luxury shoes prioritized.
- Audience: women 35–45. Luxury vacation energy. Destination-relevant. Editorial but wearable.
- Sculptural jewelry over over-layered stacks. No cropped layers over maxi dresses.

LAYOUT:
- Product cards render to the right of AI model image.
- All thumbnails same size; images fill containers fully (no gray spacing); equal card heights.
- Card shows: Brand · Product Name · Price · SHOP →.

QA GATE — reject look if: missing URLs, missing category, missing thumbnail, non-affiliate retailer, duplicate styling from a previous day, or collection page used instead of product page.
