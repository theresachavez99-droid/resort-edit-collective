# Route Tree Cleanup — White-Glove Launch Audit (Aug 2026)

## Before → After (registered route files)

Removed from the router (and therefore from Lovable's page/path dropdown):

| Route file | Classification | Disposition |
|---|---|---|
| `portofino.day-1..day-5.tsx` (5 files) | Redirect | Deleted; `day-N` now 301s from the `/portofino/$moment` loader |
| `portofino.pool-lounging.poolside-glam.tsx` | Merge | Content migrated into the single dynamic `/portofino/$day/$look` route; URL unchanged (200, self-canonical) |
| `admin.founder-looks.tsx` | Delete | Legacy "founder" redirect stub retired (`/admin/looks` is canonical) |
| `admin.moments.index.tsx` | Merge | → `MomentRunsPanel` tab in `/admin/editorial-intelligence` |
| `admin.editorial-memory.tsx` | Merge | → `EditorialMemoryPanel` tab |
| `admin.destination-moments.tsx` | Merge | → `DestinationMomentsPanel` tab |
| `admin.day-images.tsx` | Merge | → `DayImagesPanel` tab |
| `admin.product-vault.tsx` | Merge | → `ProductVaultPanel` tab in `/admin/catalog` |
| `admin.inventory-health.tsx` | Merge | → `InventoryHealthPanel` tab in `/admin/catalog` |
| `admin.subscribers.tsx` | Merge | → `SubscribersPanel` inside `/admin/system` → Lists |

Remaining routes and rationale:

- Public: `/`, `/portofino`, `/portofino/$moment` (12 moments + legacy alias/day redirects), `/portofino/$day/$look` (Complete Look detail + legacy look redirects), `/resort-edits`, `/brands`, `/brands/$slug`, `/destinations`, `/destinations/$slug`, `/about`, `/privacy-policy`, `/my-edit`, `/sitemap.xml`, `/robots.txt`.
- Admin (Studio): `/admin`, `/admin/looks`, `/admin/editorial-intelligence`, `/admin/brands`, `/admin/catalog`, `/admin/system`, plus contextual detail views `/admin/moments/$id/run` and `/admin/hero-outfit/$id`.
- API: `/api/public/.mcp/*` and `/api/public/.well-known/oauth-protected-resource` (read-only MCP surface).

## Redirect map

- `/portofino/day-1` → `/portofino/yacht-day` (301)
- `/portofino/day-2` → `/portofino/beach-club` (301)
- `/portofino/day-3` → `/portofino/pool-lounging` (301)
- `/portofino/day-4` → `/portofino/riviera-dinner`-day primary (301)
- `/portofino/day-5` → `/portofino/espresso-morning` (301)
- `/portofino/day-N/look-X` → canonical moment for that (day, look) pair (301)
- Slug aliases (`arrival-day`, `market-morning`, `via-roma-boutiques`, …) → canonical moment (301, unchanged)

## Data / functions migrated

No Supabase tables, storage buckets, or server functions were dropped. Retired
pages became panel components under `src/components/admin/`, all calling the
same server functions as before.

## Environment gating

`/admin/system` renders the Seeds & Migration tab only outside production
(`import.meta.env.DEV`); the Lists tab (Subscribers) remains available.

## Regression results

All public routes 200; legacy day URLs 301 to canonical moments;
`/portofino/pool-lounging/poolside-glam` still 200 with its own canonical;
sitemap.xml and robots.txt 200; unknown nested look URLs 404; every Studio
route (dashboard, looks, editorial-intelligence, brands, catalog, system) 200
behind the admin gate. Typecheck clean.
