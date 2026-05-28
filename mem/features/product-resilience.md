---
name: product-resilience
description: Affiliate link resilience model for Resort Edit ShopItem cards — replacement hierarchy, inventory fields, and editorial display rules
type: feature
---
ShopItem (src/data/portofino.ts) supports: href (primary_link), backup_link_1, backup_link_2, last_verified_date (ISO), inventory_status ("in_stock" | "low" | "unavailable"), replaced (boolean).

Use resolveProductLink(item) to get the best live URL. Returns null when nothing usable → renderer must hide the card. Used by src/routes/index.tsx (Shop the Look) and src/routes/portofino-edit.tsx (CategorizedItems).

Replacement hierarchy when a product fails:
1. Identical item, different retailer
2. Closest alternative, same brand
3. Approved substitute brand at same tier (Designer → luxury; Mid-Luxe → premium contemporary; Riviera → affordable preserving aesthetic)
4. Preserve silhouette + fabric + color story

Preserve: silhouette, fabric story, destination fit, styling energy, luxury feel, price tier, color palette. Never replace on price alone. Never linen→polyester, neutrals→loud prints, quiet luxury→trend.

Display: when replaced=true show "Updated Pick" badge. Never "Sold out" or "Unavailable".
