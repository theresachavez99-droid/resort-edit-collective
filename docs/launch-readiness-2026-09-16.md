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

Re-verified 16 September 2026 after the founder's own source check.

| Entry | URL | Status |
| --- | --- | --- |
| Splendido, A Belmond Hotel | belmond.com official page | 200 verified |
| Splendido Mare, A Belmond Hotel | belmond.com official page | 200 verified |
| Hotel Piccolo Portofino | `https://uvethotels.com/piccolohotel/` | **CONFIRMED — founder-verified.** `hotelpiccoloportofino.com` does not resolve; the official `.it`/`en/` address 301-redirects into the Uvet Hotels site, whose page title names Hotel Piccolo Portofino. The founder opened it successfully on 16 Sep 2026 and confirmed it as the official page. Exact root English URL now used; direct, non-affiliate link. |
| Eight Hotel Portofino | `https://portofino.eighthotels.it/en/` | **CONFIRMED — founder-verified.** The old `.com` path does not answer (connection timeout), and our automated checks returned HTTP 403 on the brand subdomain (a generic 403 proves nothing about the page either way) — but the founder opened `portofino.eighthotels.it/en/` successfully on 16 Sep 2026; the page identifies Eight Hotels/Solido Hotels and the Portofino property. A challenge is not proof a page is dead, so human confirmation controls. Now active with the exact official URL; direct, non-affiliate link. All four hotel cards render. |
| Bagni Fiore | bagnifiore.com/en | 200 verified |
| La Portofinese Eco-Farm | laportofinese.it official page | 200 verified |
| Private Boat Tour of the Portofino Riviera | Viator listing | **Facts corrected.** Supplier Orange Wave; meeting point Rotonda Marconi, Rapallo. "Departs Portofino" replaced with "Meets in Rapallo; confirm meeting details when booking". No harbour pickup is claimed. |
| Sunset Boat Tour | Viator listing | **Facts corrected.** Supplier Orange Wave; same Rapallo meeting point; about 1h30m. |
| Pesto Boat & Walking Tour with Lunch | Viator listing | **Facts corrected.** Supplier Experience My Portofino; starts at the Santa Margherita Ligure ferry pier (Piazza Martiri della Libertà 1); about 3h; round-trip ferry tickets included. |
| Private Coastal Hike to San Fruttuoso | — | **WITHHELD / omitted from launch.** Neither we nor the founder have confirmed this exact listing; our automated fetches returned HTTP 403, which is not evidence about the listing's state. No card or CTA renders. Its meeting point is left unstated rather than assumed. |
| Biankina | `https://biankina.com/?ref=hxrfofuu` | **CONNECTED — user-confirmed referral.** The founder supplied this exact referral URL on 16 Sep 2026; it is stored verbatim in the registry and the `?ref=hxrfofuu` parameter is preserved through outbound routing (no redirector rewrites it). One CTA renders, in the Portofino WEAR section, with the disclosure "Affiliate link — we may earn a commission if you purchase." and `rel="sponsored noopener noreferrer"`. This is a **user-confirmed affiliate relationship, not independently verified commission attribution**: payout, commission rate and conversion attribution require the merchant's own reporting. No discount percentage or coupon term is published, and the older bare text code `resortedit` is not used to construct any URL. |

Nothing is described as sponsored or commissionable unless a real, verified
affiliate URL exists in the registry. Withheld entries are omitted from the
public page entirely, not shown with a dead button.

## Click measurement — how to read results

Counts live in `public.outbound_click_daily` (`day`, `link_key`, `placement`,
`clicks`). Writes happen only through the `SECURITY DEFINER` function
`public.record_outbound_click`, which validates the key format and length.
Permissions: RLS enabled with no policies; `ALL` revoked from `PUBLIC`, `anon`
and `authenticated` on both the table and the function; `service_role` only
(migration `0001_revoke_public_outbound_click_access.sql`). No user
identifiers, no arbitrary destination URLs, no client-side storage.

The public endpoint (`src/lib/outbound-clicks.functions.ts`) rejects anything
that is not an allowlisted registry link key plus one of six predefined
placements, and reaches the database only through the server-only admin client
loaded inside the handler. No service credentials, keys or subscriber data are
exposed to the browser, and the browser has no read or write grant.

### Verified 16 Sep 2026 (security follow-up)

- Live ACL on `public.outbound_click_daily` is
  `postgres`, `service_role` (plus the read-only inspection role) — no `anon`,
  `authenticated` or `PUBLIC` grants remain, so `TRUNCATE` (which RLS does not
  cover) is unreachable from browser-facing roles.
- `public.record_outbound_click` keeps `EXECUTE` for `postgres`/`service_role`
  only.
- The same revokes are in the versioned migration
  `0001_revoke_public_outbound_click_access.sql`, so a fresh install lands in
  the identical state; a regression test in `tests/launch-readiness.test.ts`
  locks that SQL and the endpoint's allowlist/server-credential shape.

Retrieval: query the table from the backend/SQL view, e.g.
`select day, link_key, placement, clicks from public.outbound_click_daily order by day desc;`

Clicks are *interest signals only* — they are not sales or commissions.

## Checks actually run

- `bunx tsgo --noEmit` — pass.
- `bun test tests/` — **135 pass, 0 fail**, 402 assertions (now including guards
  against a Portofino-departure claim, the two Rapallo meeting points, the ferry
  pier start, withheld-supplier status, and any fabricated affiliate URL).
- `bun run audit:slots` — pass; 0 non-product URLs, 0 forbidden slots, commerce
  CTA gate correct, retired moment route confirmed redirect-only.
- `bun run build` — production build succeeded (only a Wrangler config notice).
- Route checks: `/`, `/portofino`, `/destinations`, `/about`, `/contact`,
  `/affiliate-disclosure`, `/privacy-policy`, `/privacy-rights`, `/sitemap.xml`
  → 200. `/latest`, `/pack-my-trip`, `/my-edit`, `/brands`,
  `/portofino/nightcap` → 301.
- Browser (desktop 1280 + mobile 390), re-run 16 Sep 2026 after the final copy
  corrections. Evidence type is stated for each item; nothing below is inferred
  from code alone:
  - **Rendered-DOM evidence:** exactly one Biankina anchor, href
    `https://biankina.com/?ref=hxrfofuu` (parameter intact), `rel="noopener
    noreferrer sponsored"`, visible label "EXPLORE BIANKINA FOOTWEAR →".
  - **Rendered-text evidence:** the disclosure "Affiliate link — we may earn a
    commission if you purchase." is visible next to that CTA; "Rapallo" and
    "Santa Margherita Ligure ferry pier" appear; "Departs Portofino" does not;
    the withheld San Fruttuoso hike card does not render; the contradictory
    strings "Nothing here is for sale" and "Packing advice, not a shop" are gone
    from the WEAR section.
  - **Layout evidence:** `scrollWidth - innerWidth = 0` at both 1280 and 390.
  - **Behavioural evidence:** clicking the Biankina CTA recorded exactly one row
    (`2026-09-16`, `shop-biankina`, `portofino-wear`, `clicks = 1`), confirmed by
    a direct database read; that single test row was then deleted.
- Legal copy re-read after edit: `/affiliate-disclosure` now describes
  destination guides, unmonetized hotel/experience links and the single Biankina
  storefront referral, states clothing imagery is editorial and not shoppable,
  and no longer claims firsthand visits. `/privacy-policy` and `/privacy-rights`
  describe the aggregate click counter (date, link key, placement, count — no
  identifiers, no cookie), keep the hosting/merchant technical-data explanation,
  and no longer instruct readers to subscribe or save looks; historic subscriber
  records are described without deleting any data. Both dated 16 Sep 2026.
- `bun test` — 142 pass, 0 fail, 425 expectations (7 files).
- Hero diff verified: no hero lines changed.

## Evidence limits — what is NOT verified

- **Affiliate sales attribution and payout are not independently verified.** The
  Biankina referral URL is user-confirmed and the click count is ours; whether a
  purchase is attributed to it, at what rate, and whether anything is paid can
  only be established from the merchant's own reporting.
- **A generic HTTP 403 is not proof of bot filtering.** Where our automated
  fetches returned 403, the listing's current state is simply unknown to us; we
  do not describe those pages as verified, dead, or bot-protected.

## Remaining prerequisites / blockers

1. **Private Coastal Hike to San Fruttuoso** (`d4232-428295P2`) — the exact
   listing has never been confirmed by us or by the founder. The registry entry
   is retained with `status: "withheld"`, so the public site renders no card and
   no CTA for it. Un-withhold only after a human opens the listing and confirms
   it is a live, purchasable tour. The real coastal footpath is described as a
   walk in editorial copy and is deliberately not presented as a bookable tour.
2. **Biankina commission reporting** — see Evidence limits above. Make no
   earnings, rate or discount claim until merchant reporting exists.
3. **Travel links stay unmonetized** until genuine affiliate URLs exist. Hotel,
   restaurant and experience links are ordinary direct links today.
4. **Hotel and experience affiliate programs** — all live links render as plain
   links (`active-affiliate-pending`). No tracking IDs exist; none invented.
5. **Instagram** — `INSTAGRAM_LAUNCHED = false`. Flip it and add real post URLs
   in `src/data/instagramPosts.ts` once @resort.edit is live.
6. **Verified contact address — RESOLVED (18 Sep 2026)** — the owner created and
   confirmed the single Resort Edit inbox: `helloresortedit@gmail.com`. The
   Contact page now shows it as a working `mailto:` link, replacing the
   "Contact details are being updated." placeholder; no form, phone number or
   response-time promise was added.
7. **Publishing — AUTHORIZED (18 Sep 2026)** — with the contact address
   confirmed, the draft is cleared for publication. The owner will deploy
   through the project publisher.
