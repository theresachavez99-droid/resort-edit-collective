/**
 * Founder Approval Learning Layer — server-only helpers.
 *
 * Harvests product collection URLs (Nordstrom, ShopMy, LTK, MyTheresa, Saks,
 * Revolve, Pinterest boards, etc.) via Firecrawl, extracts products + brands,
 * upserts founder signal counts on brand_intelligence, and surfaces new
 * brands into brand_review_queue.
 *
 * This file is server-only (`.server.ts`) — never imported by client code.
 */

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

export interface HarvestedProduct {
  brand: string;
  product_name?: string;
  category?: string;
  image_url?: string;
  product_url?: string;
  price?: number;
  currency?: string;
}

export interface HarvestResult {
  retailer: string | null;
  products: HarvestedProduct[];
  brands: string[];
  raw?: unknown;
}

function inferRetailer(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("nordstrom")) return "nordstrom.com";
    if (host.includes("shopmy")) return "shopmy.us";
    if (host.includes("liketoknow") || host.includes("ltk")) return "shopltk.com";
    if (host.includes("mytheresa")) return "mytheresa.com";
    if (host.includes("net-a-porter") || host.includes("netaporter")) return "net-a-porter.com";
    if (host.includes("saks")) return "saksfifthavenue.com";
    if (host.includes("revolve")) return "revolve.com";
    if (host.includes("shopbop")) return "shopbop.com";
    if (host.includes("bergdorf")) return "bergdorfgoodman.com";
    if (host.includes("neimanmarcus")) return "neimanmarcus.com";
    if (host.includes("pinterest")) return "pinterest.com";
    return host;
  } catch {
    return null;
  }
}

/**
 * Firecrawl-powered product collection extractor.
 * Asks Firecrawl to return a structured `products[]` array using the
 * `json` format with an explicit schema, then normalises.
 */
export async function harvestUploadedUrl(url: string): Promise<HarvestResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY missing");

  const retailer = inferRetailer(url);

  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      onlyMainContent: true,
      formats: [
        {
          type: "json",
          prompt:
            "Extract every fashion / apparel / accessory product visible on this page. " +
            "Return a JSON object { products: [{ brand, product_name, category, image_url, product_url, price, currency }] }. " +
            "Brand must be the design house (e.g. 'Milly', 'Cleobella'), not the retailer. " +
            "Include every product card you can see — do not deduplicate.",
          schema: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    brand: { type: "string" },
                    product_name: { type: "string" },
                    category: { type: "string" },
                    image_url: { type: "string" },
                    product_url: { type: "string" },
                    price: { type: "number" },
                    currency: { type: "string" },
                  },
                  required: ["brand"],
                },
              },
            },
            required: ["products"],
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl ${res.status}: ${txt.slice(0, 200)}`);
  }
  const payload = await res.json();
  const root = payload?.data ?? payload;
  const extracted = root?.json ?? root?.extract ?? {};
  const raw: HarvestedProduct[] = Array.isArray(extracted?.products) ? extracted.products : [];

  const products = raw
    .map((p) => ({
      brand: typeof p?.brand === "string" ? p.brand.trim() : "",
      product_name: typeof p?.product_name === "string" ? p.product_name.trim() : undefined,
      category: typeof p?.category === "string" ? p.category.trim() : undefined,
      image_url: typeof p?.image_url === "string" ? p.image_url : undefined,
      product_url: typeof p?.product_url === "string" ? p.product_url : undefined,
      price: typeof p?.price === "number" ? p.price : undefined,
      currency: typeof p?.currency === "string" ? p.currency : undefined,
    }))
    .filter((p) => p.brand.length > 0);

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

  return { retailer, products, brands, raw: extracted };
}

export function slugifyBrand(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}