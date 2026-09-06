/**
 * PRODUCT-SPECIFIC STOCK EVIDENCE (server only)
 *
 * An HTTP 200 proves a page answered, not that the product can be bought. This
 * module fetches the product page and reads structured availability that the
 * retailer itself publishes (schema.org JSON-LD offers, Open Graph
 * availability, or an explicit sold-out marker). Anything it cannot read stays
 * `unknown` — which blocks publication rather than assuming the piece is
 * buyable.
 */
export type LiveAvailability = "in_stock" | "sold_out" | "gone" | "unknown";

export type StockRecheck = {
  url: string;
  availability: LiveAvailability;
  /** How the verdict was obtained, stored as durable provenance. */
  provenance: string;
  checkedAt: string;
  httpStatus: number | null;
  detail?: string;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const IN_STOCK_RE = /"availability"\s*:\s*"[^"]*\/?(InStock|LimitedAvailability|InStoreOnly|BackOrder)"/i;
const OUT_RE = /"availability"\s*:\s*"[^"]*\/?(OutOfStock|SoldOut|Discontinued)"/i;
const OG_IN = /property=["']og:availability["'][^>]*content=["'](instock|in stock)["']/i;
const OG_OUT = /property=["']og:availability["'][^>]*content=["'](oos|out of stock|sold out)["']/i;
const SOLD_OUT_TEXT = /\b(sold\s?out|out of stock|no longer available)\b/i;

export async function recheckStock(url: string): Promise<StockRecheck> {
  const checkedAt = new Date().toISOString();
  const base = { url, checkedAt } as const;
  if (!/^https?:\/\//i.test(url)) {
    return { ...base, availability: "gone", provenance: "invalid_url", httpStatus: null };
  }
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", headers: { "user-agent": UA } });
    if (res.status === 404 || res.status === 410) {
      return { ...base, availability: "gone", provenance: "http_status", httpStatus: res.status };
    }
    if (!res.ok) {
      return {
        ...base,
        availability: "unknown",
        provenance: "http_blocked",
        httpStatus: res.status,
        detail: `retailer returned ${res.status}; availability could not be read`,
      };
    }
    const html = (await res.text()).slice(0, 400_000);
    if (OUT_RE.test(html)) {
      return { ...base, availability: "sold_out", provenance: "jsonld_offer", httpStatus: res.status };
    }
    if (IN_STOCK_RE.test(html)) {
      return { ...base, availability: "in_stock", provenance: "jsonld_offer", httpStatus: res.status };
    }
    if (OG_OUT.test(html)) {
      return { ...base, availability: "sold_out", provenance: "open_graph", httpStatus: res.status };
    }
    if (OG_IN.test(html)) {
      return { ...base, availability: "in_stock", provenance: "open_graph", httpStatus: res.status };
    }
    if (SOLD_OUT_TEXT.test(html)) {
      return { ...base, availability: "sold_out", provenance: "page_marker", httpStatus: res.status };
    }
    return {
      ...base,
      availability: "unknown",
      provenance: "no_structured_availability",
      httpStatus: res.status,
      detail: "retailer publishes no machine-readable availability for this product",
    };
  } catch (err) {
    return {
      ...base,
      availability: "unknown",
      provenance: "request_failed",
      httpStatus: null,
      detail: err instanceof Error ? err.message : "request failed",
    };
  }
}
