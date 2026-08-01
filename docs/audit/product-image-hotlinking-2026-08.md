# P1 Launch Blocker — Retailer Image De-Hotlinking

Status: **implemented (mode `pending_affiliate`) — launch item remains OPEN until
affiliate approval and image rights are verified in writing.**

## Policy

Single source of truth: `src/lib/product-image-policy.ts`.

| Mode | Behaviour |
| --- | --- |
| `pending_affiliate` (production default) | No external retailer product imagery renders. All commerce cards fall back to the text-first Resort Edit card. |
| `approved_affiliate` | External imagery renders only when host is on `PERMITTED_EXTERNAL_IMAGE_HOSTS` **and** the call site passes `verified: true`. |

Override via `VITE_PRODUCT_IMAGE_MODE`. `PERMITTED_EXTERNAL_IMAGE_HOSTS` is
intentionally empty until legal sign-off.

## Implementation

- `src/components/commerce/ProductCommerceCard.tsx` — standardized text-first
  commerce card (category, brand, name, price, stock note, PDP link). Used by
  `ProductCard`, `ResortEditProductCard`, and the moment-page `ShopCard`.
- Gated thumbnail strips: `ResortEditLookCard`, `MoreLikeThis`.
- Graceful fallback: a blocked, missing, or failed image never renders an empty
  frame or broken-image icon — the card degrades to text-first.
- Deep links untouched; `src/lib/shop-url-policy.ts` still rejects homepage,
  category, search, and generic-brand URLs.
- Editorial hero / reference photography deliberately unchanged.

## Audit

- Admin report: Studio dashboard → "Launch Readiness · Product Image Rights"
  (`src/components/ProductImageAuditPanel.tsx`, data from
  `src/lib/product-image-audit.ts`).
- Current findings: 200 product images referenced, 169 project assets,
  **31 external hotlinks across 15 retailer hosts — all 31 withheld from
  rendering.** Hosts include mytheresa, net-a-porter, revolve, farfetch,
  nordstrommedia, modaoperandi, monicavinader, loefflerrandall,
  marissacollections.
- Affected data pages: legacy Day 1/2/3/5 look pools, `/portofino/day-1/look-a`,
  `/portofino/day-2/look-a`.

## Regression test

Playwright, desktop (1280) + mobile (390) across `/`, `/resort-edits`,
`/my-edit`, `/brands`, Arrival, Pool Lounging, Poolside Glam, Nightcap, Riviera
Dinner, and look pages: **0 external images rendered, 0 broken images.**

## Blockers / next steps

1. Affiliate program approvals + written image-rights permission per retailer.
2. Only then: add hosts to `PERMITTED_EXTERNAL_IMAGE_HOSTS`, set
   `VITE_PRODUCT_IMAGE_MODE=approved_affiliate`, and mark verified call sites.
3. No retailer assets were copied into Resort Edit storage and no product
   imagery was generated.
