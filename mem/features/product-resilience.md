---
name: product-resilience
description: Affiliate link resilience model for Resort Edit ShopItem cards — replacement hierarchy, affiliate priority, QC checklist, failsafe flag, inventory fields, and editorial display rules
type: feature
---
ShopItem (src/data/portofino.ts) supports: href (primary_link), backup_link_1, backup_link_2, last_verified_date (ISO), inventory_status ("in_stock" | "low" | "unavailable"), replaced (boolean).

Use resolveProductLink(item) to get the best live URL. Returns null when nothing usable → renderer must hide the card. Used by src/routes/index.tsx (Shop the Look) and src/routes/portofino-edit.tsx (CategorizedItems).

Trigger replacement when a product is: sold out, removed, unavailable in major sizes, no longer purchasable, or missing images.

Replacement priority (apply in order):
1. Exact same item from another affiliate retailer
2. Same item in an alternate retailer colorway, if visually identical
3. Closest silhouette match
4. Closest print/pattern match
5. Closest luxury brand equivalent
6. Closest price-tier equivalent

Affiliate retailer priority (search in this order, only fall back to direct brand if all fail):
Farfetch → MyTheresa → Net-a-Porter → Shopbop → Revolve → Nordstrom → Saks → Bloomingdale's → Neiman Marcus → SSENSE → brand direct.

Preserve: silhouette, fabric story, destination fit, styling energy, luxury feel, price tier, color palette. Never replace on price alone. Never linen→polyester, neutrals→loud prints, quiet luxury→trend.
Also preserve: print/pattern, neckline/cut, age appropriateness for affluent women 30–49.

Output rules: keep the same product category. Preserve complete look integrity. Replace accessories individually — never rebuild the whole look. Maintain visual consistency with the AI editorial image. No duplicate products across looks.

QC checklist before publishing any replacement: ✓ similar silhouette ✓ similar print ✓ similar color story ✓ similar styling energy ✓ product image available ✓ affiliate link functional ✓ no duplicates across looks.

Failsafe: when no close match exists, set `cms_flag: "NO HIGH-QUALITY MATCH FOUND"` on the item (never rendered on the frontend) and recommend in chat either (a) creating a revised AI look, or (b) regenerating the outfit with more available inventory. Do not ship a weak substitute.

Display: when replaced=true show "Updated Pick" badge. Never "Sold out" or "Unavailable".
