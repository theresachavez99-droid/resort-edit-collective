# Resort Edit — launch readiness report (16 September 2026)

Scope: the Instagram-led Portofino destination guide chosen on 7 September 2026.
No publishing was performed. The homepage hero video is untouched (source,
poster, playback attributes, wrapper classes and focal-point breakpoints all
identical to the pre-pass baseline).

## What is live in preview

- **Portofino hub** (`/portofino`) — STAY / DO / EAT / WEAR, one labelled
  outbound CTA per hotel, experience and dining entry, verified facts on the
  cards, honest "Editorial illustration (AI-generated)" captions, and a
  practical non-shoppable packing guide. No prices anywhere.
- **Outbound link registry** (`src/data/outboundLinks.ts`) — typed, stable-key
  source of truth. Invalid or missing URLs hide the CTA; no `href="#"`.
- **Aggregate click measurement** — first-party only, no personal data.
- **Retired surfaces** — `/pack-my-trip`, `/my-edit`, `/brands`, `/latest`,
  `/portofino/<moment>`, `/portofino/day-*/look-*`, non-Portofino destination
  slugs all answer 301. No catalog or wizard code runs before the redirect.
- **Nav/footer** — Latest removed while Instagram is unlaunched; centralized
  Instagram config retained for one-line activation later.
- **No newsletter, no signup, no checkout, no prices** on any public page.

## Merchant / source verification

| Entry | URL | Status |
| --- | --- | --- |
| Splendido, A Belmond Hotel | belmond.com official page | 200 verified |
| Splendido Mare, A Belmond Hotel | belmond.com official page | 200 verified |
| Eight Hotel Portofino | `portofino.eighthotels.it/en/` | **URL corrected** — the old `eighthotels.com/en/eight-hotel-portofino/` path no longer answers. New host returns 403 to scripted requests (bot filtering) but serves normally in a browser. |
| Hotel Piccolo Portofino | `uvethotels.com/piccolohotel/en/home-en/` | **URL corrected** — `hotelpiccoloportofino.com` no longer resolves (DNS). Official page now under Uvet Hotels, 200 verified. |
| Bagni Fiore | bagnifiore.com/en | 200 verified |
| La Portofinese Eco-Farm | laportofinese.it official page | 200 verified |
| Viator experiences | Viator listing pages | Verified as real listings; Viator answers 403 to scripted requests. |
| Biankina | `https://biankina.com/?ref=hxrfofuu` | Founder-supplied referral URL, resolves 200. Recorded as an affiliate link. **No discount percentage or commission rate is recorded or published** — none has been confirmed in writing. |

Nothing is described as sponsored or commissionable unless a real affiliate URL
exists in the registry.

## Click measurement — how to read results

Counts live in `public.outbound_click_daily` (`day`, `link_key`, `placement`,
`clicks`). Writes happen only through the `SECURITY DEFINER` function
`public.record_outbound_click`, which validates the key format and length.
Permissions: RLS enabled with no policies; `ALL` revoked from `PUBLIC`, `anon`
and `authenticated` on both the table and the function; `service_role` only
(migration `0001_revoke_public_outbound_click_access.sql`). No user
identifiers, no arbitrary destination URLs, no client-side storage.

Retrieval: query the table from the backend/SQL view, e.g.
`select day, link_key, placement, clicks from public.outbound_click_daily order by day desc;`

Clicks are *interest signals only* — they are not sales or commissions.

## Checks actually run

- `bunx tsgo --noEmit` — pass.
- `bun test tests/` — **130 pass, 0 fail**, 392 assertions.
- `bun run audit:slots` — pass; 0 non-product URLs, 0 forbidden slots, commerce
  CTA gate correct, retired moment route confirmed redirect-only.
- `bun run build` — production build succeeded (only a Wrangler config notice).
- Route checks: `/`, `/portofino`, `/destinations`, `/about`, `/contact`,
  `/affiliate-disclosure`, `/privacy-policy`, `/privacy-rights`, `/sitemap.xml`
  → 200. `/latest`, `/pack-my-trip`, `/my-edit`, `/brands`,
  `/portofino/nightcap` → 301.
- Browser (desktop 1280 + mobile 390): no console errors, no horizontal
  overflow at 390px (`scrollWidth = 390`), mobile menu toggles
  `aria-expanded` correctly and closes on Escape, 16 outbound links all resolve
  to registry URLs, no currency symbols rendered.
- Outbound click recording verified end to end in the browser; the single test
  row was deleted afterwards, so the table is empty.
- Hero diff verified: no hero lines changed.

## Remaining prerequisites / blockers

1. **Biankina commercial terms** — commission rate and any reader discount are
   unconfirmed. Get them in writing before any promotional wording.
2. **Hotel and experience affiliate programs** — all currently render as plain
   links (`active-affiliate-pending`). No tracking IDs exist; none invented.
3. **Instagram** — `INSTAGRAM_LAUNCHED = false`. Flip it and add real post URLs
   in `src/data/instagramPosts.ts` once @resort.edit is live.
4. **Bot-filtered hosts** — Eight Portofino and Viator answer 403 to automated
   checks; re-confirm in a browser periodically rather than by script.
5. **Publishing** — deliberately withheld pending founder review.
