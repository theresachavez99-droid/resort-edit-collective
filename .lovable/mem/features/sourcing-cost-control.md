---
name: Firecrawl Cost Control & Vault-First Sourcing
description: Governing policy for how Firecrawl, approved brands/retailers, and the Product Vault interact. Vault is primary source of truth; Firecrawl is a discovery/maintenance tool only.
type: feature
---

## Core principle
Approved Brands → Approved Retailers → Product Vault → Destination Generation.
Never scrape the open web. Never re-scrape products already in the Vault unless verifying inventory.

## Firecrawl allowed for
Discovering new products (constrained), validating existing Vault products, sold-out replacements, periodic inventory refresh, Vault expansion.

## Firecrawl forbidden for
Generating destinations from scratch, re-scraping cached products, full catalog scans, non-approved brands, any unrestricted crawl.

## Approved retailers (allowlist — enforce in domainAllowed)
mytheresa.com, net-a-porter.com, fwrd.com, shopbop.com, saksfifthavenue.com, neimanmarcus.com, nordstrom.com, bloomingdales.com, luisaviaroma.com, modaoperandi.com, farfetch.com, ssense.com, everythingbutwater.com.

## Approved brands
Only brands.status='approved'. Brand filter runs BEFORE retailer scrape.

## Vault-first workflow
1. Query vault_products for matching category+activity+destination.
2. If sufficient → use Vault, no Firecrawl.
3. If insufficient → constrained Firecrawl (approved brand × approved retailer × target category).
4. Cache every result in sourced_products; only promoted rows enter vault_products.

## Caching contract
Never scrape a URL already in sourced_products or vault_products unless an inventory-refresh job requests it. Store: source_url, image_url, product_name, brand, retailer, category, tags, inventory_status, last_verified_at.

## Refresh cadence
Daily: verify inventory/URL/image. Weekly: discover new in under-stocked categories. Monthly: expand categories.

## Cost telemetry per job
pages crawled, products discovered, products approved, cost per approved product.

## Yacht Day pilot constraints
Swimwear only • Yacht Day activity • approved brands only • approved retailers only • 20–30 products. No catalog-wide crawls.
