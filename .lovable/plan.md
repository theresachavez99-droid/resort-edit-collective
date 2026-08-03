## Assessment

**Current hero bag listed on `/portofino/shopping`:**
- Dragon Diffusion — Santa Maria Woven Leather Bag — Natural
- $551
- URL: `https://dragondiffusion.com/products/santa-maria-natural-woven-leather-bag-handmade`

**Bag visibly carried in the hero image:**
- A tall, cylindrical woven **raffia/straw tote** with two looped top handles
- Natural tan color
- Basket-like, open-top silhouette

**Match analysis:**

| Dimension | Listed bag | Bag in photo | Match |
|---|---|---|---|
| **Silhouette** | Flatter, rectangular/saddle woven leather body | Tall cylindrical basket tote | No |
| **Weave/material** | Woven leather | Woven raffia/straw | No |
| **Handle shape** | Rolled leather straps | Two looped top handles | No |
| **Scale** | Medium crossbody/shoulder bag | Large statement tote | No |
| **Color** | Natural tan | Natural tan | Yes |

**Verdict:** The color matches, but the material, silhouette, handles, and scale do not. The listed Dragon Diffusion Santa Maria is a woven leather bag, not the raffia basket tote in the photo.

**Recommended direction:** Replace the Dragon Diffusion Santa Maria with a **large woven raffia/straw tote with loop handles** — preferably an artisanal basket-style tote that mirrors the open, airy, market-shopping silhouette in the image.

### Plan
1. Source 1–3 in-stock large raffia/straw basket tote options from approved retailers (e.g., Loewe Anagram Basket / Celine Panier / similar artisanal raffia tote).
2. Verify each candidate has a live, working product detail page URL.
3. Update the Shopping hero `Bag` entry in `src/data/momentShopCurated.ts` to the chosen raffia tote, preserving the existing text-first de-hotlinked card format.
4. Run the shop-link / slot audit to confirm the new URL passes the publish gate.
5. Verify the rendered `/portofino/shopping` page displays the new bag with no external retailer images and no old Dragon Diffusion references in the DOM.

### Technical details
- File to edit: `src/data/momentShopCurated.ts` (Shopping block, `slotLabel: "Bag"` entry).
- Verification: `bun run audit:slots`, `bun run build`, and Playwright DOM check on `/portofino/shopping`.