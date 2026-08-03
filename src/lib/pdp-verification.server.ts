/**
 * Independent PDP verification (server-only).
 *
 * The OpenAI stylist proposes products; Lovable NEVER trusts a model-supplied
 * URL. Every candidate URL is fetched and checked here before it can be shown
 * as approvable:
 *  - resolves (not a network error)
 *  - not a 404/410
 *  - not a search / category / collection / homepage URL, before or after redirects
 *  - page title + brand match the proposed product
 *  - colour appears on the page when a colour was proposed
 *  - current price captured when available
 *  - availability signal captured (in stock / out of stock / unknown)
 */
import { isPublishableProductUrl } from "./shop-url-policy";
import { statusFromHttp } from "./product-health.server";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export type VerificationStatus = "verified" | "rejected" | "unverified";

export type PdpVerification = {
  status: VerificationStatus;
  verdict: string;
  httpStatus: number | null;
  finalUrl: string | null;
  pageTitle: string | null;
  brandMatch: boolean | null;
  titleMatch: boolean | null;
  colorMatch: boolean | null;
  priceFound: string | null;
  availability: "in_stock" | "out_of_stock" | "unknown";
  checks: string[];
  verifiedAt: string;
};

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function meta(html: string, key: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name|itemprop)=["']${key}["'][^>]+content=["']([^"']+)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name|itemprop)=["']${key}["']`,
    "i",
  );
  return html.match(re)?.[1] ?? html.match(alt)?.[1] ?? null;
}

function detectAvailability(html: string): PdpVerification["availability"] {
  const lower = html.toLowerCase();
  const og = meta(html, "og:availability") ?? meta(html, "availability");
  if (og && /out.?of.?stock|soldout|sold out/i.test(og)) return "out_of_stock";
  if (og && /instock|in stock/i.test(og)) return "in_stock";
  if (/"availability"\s*:\s*"[^"]*outofstock/i.test(lower) || /sold\s?out/i.test(lower)) {
    return "out_of_stock";
  }
  if (/"availability"\s*:\s*"[^"]*instock/i.test(lower) || /add to bag|add to cart/i.test(lower)) {
    return "in_stock";
  }
  return "unknown";
}

function detectPrice(html: string): string | null {
  const m =
    meta(html, "product:price:amount") ??
    meta(html, "og:price:amount") ??
    html.match(/"price"\s*:\s*"?([0-9]+(?:\.[0-9]{2})?)"?/i)?.[1] ??
    null;
  if (!m) return null;
  const n = Number(String(m).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

/**
 * Verify one proposed PDP. Anything that fails is returned with
 * `status: "rejected"` so the admin UI can never present it as publishable.
 */
export async function verifyPdp(input: {
  url: string;
  brand: string;
  productName: string;
  color?: string | null;
}): Promise<PdpVerification> {
  const now = new Date().toISOString();
  const base: PdpVerification = {
    status: "rejected",
    verdict: "",
    httpStatus: null,
    finalUrl: null,
    pageTitle: null,
    brandMatch: null,
    titleMatch: null,
    colorMatch: null,
    priceFound: null,
    availability: "unknown",
    checks: [],
    verifiedAt: now,
  };

  if (!/^https?:\/\//i.test(input.url)) {
    return { ...base, verdict: "rejected_not_http_url", checks: ["not an http(s) URL"] };
  }
  if (!isPublishableProductUrl(input.url)) {
    return {
      ...base,
      verdict: "rejected_not_exact_pdp",
      checks: ["URL is a search, category, collection or homepage URL, not an exact PDP"],
    };
  }

  let res: Response;
  try {
    res = await fetch(input.url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,*/*" },
    });
  } catch (err) {
    return {
      ...base,
      verdict: "rejected_unreachable",
      checks: [err instanceof Error ? err.message : "request failed"],
    };
  }

  const checks: string[] = [];
  const finalUrl = res.url || input.url;
  const httpStatus = res.status;

  if (httpStatus === 404 || httpStatus === 410) {
    return { ...base, verdict: "rejected_404", httpStatus, finalUrl, checks: ["page is a 404"] };
  }
  if (!isPublishableProductUrl(finalUrl)) {
    return {
      ...base,
      verdict: "rejected_redirects_to_non_pdp",
      httpStatus,
      finalUrl,
      checks: [`redirected to a non-PDP URL: ${finalUrl}`],
    };
  }
  if (httpStatus >= 400) {
    return {
      ...base,
      verdict: `unverified_http_${httpStatus}`,
      status: "unverified",
      httpStatus,
      finalUrl,
      checks: [`retailer returned HTTP ${httpStatus} — could not confirm the product page`],
    };
  }

  let html = "";
  try {
    html = (await res.text()).slice(0, 400_000);
  } catch {
    html = "";
  }
  const pageTitle =
    meta(html, "og:title") ?? html.match(/<title[^>]*>([^<]{2,300})<\/title>/i)?.[1]?.trim() ?? null;
  const haystack = `${pageTitle ?? ""} ${html.slice(0, 120_000)}`.toLowerCase();

  const brandMatch = tokens(input.brand).some((t) => haystack.includes(t));
  const nameTokens = tokens(input.productName);
  const nameHits = nameTokens.filter((t) => haystack.includes(t)).length;
  const titleMatch = nameTokens.length === 0 ? null : nameHits / nameTokens.length >= 0.5;
  const colorMatch = input.color ? tokens(input.color).some((t) => haystack.includes(t)) : null;

  if (!brandMatch) checks.push(`brand "${input.brand}" not found on the page`);
  if (titleMatch === false) checks.push(`product name "${input.productName}" does not match the page`);
  if (colorMatch === false) checks.push(`colour "${input.color}" not found on the page`);

  const availability = detectAvailability(html);
  const priceFound = detectPrice(html);
  if (availability === "out_of_stock") checks.push("page reports the product as sold out");

  // Some retailers answer 200 with a "we couldn't find that product" body.
  if (
    /page not found|product not found|we can'?t find|no longer available|this item is no longer|sorry, this product/i.test(
      html.slice(0, 120_000),
    ) &&
    !brandMatch
  ) {
    return {
      ...base,
      verdict: "rejected_404",
      httpStatus,
      finalUrl,
      pageTitle,
      checks: ["page body reports the product as not found / removed"],
    };
  }

  // Anti-bot interstitials must never be read as a product failure.
  if (/just a moment|enable javascript and cookies|access denied|are you a human/i.test(html.slice(0, 40_000))) {
    return {
      ...base,
      status: "unverified",
      verdict: "unverified_bot_challenge",
      httpStatus,
      finalUrl,
      pageTitle,
      checks: ["retailer served an automated-request challenge — manual review required"],
    };
  }

  const httpHealth = statusFromHttp(httpStatus);
  const passed =
    brandMatch && titleMatch !== false && colorMatch !== false && availability !== "out_of_stock";

  return {
    status: passed ? "verified" : "rejected",
    verdict: passed
      ? "verified_live"
      : availability === "out_of_stock"
        ? "rejected_sold_out"
        : "rejected_product_mismatch",
    httpStatus,
    finalUrl,
    pageTitle,
    brandMatch,
    titleMatch,
    colorMatch,
    priceFound,
    availability,
    checks: checks.length ? checks : [`PDP resolved (${httpHealth}) and matched brand + product`],
    verifiedAt: now,
  };
}
