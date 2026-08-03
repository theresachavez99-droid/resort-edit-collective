/**
 * Server-only product health probing.
 *
 * Cheap HEAD-first probe (GET fallback for retailers that reject HEAD) used by
 * the admin health check action. Deliberately dependency-free and stateless so
 * a scheduled daily sweep can reuse it later via a server route + pg_cron.
 */
import type { ProductStatus } from "./product-health";

export type ProbeResult = {
  url: string;
  httpStatus: number | null;
  /** Suggested status. Never auto-promotes a replacement — display resolution does that. */
  status: ProductStatus;
  error?: string;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export async function probeProductUrl(url: string): Promise<ProbeResult> {
  if (!/^https?:\/\//i.test(url)) {
    return { url, httpStatus: null, status: "needs_review", error: "Not an http(s) URL" };
  }
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "user-agent": UA },
    });
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "user-agent": UA },
      });
    }
    return { url, httpStatus: res.status, status: statusFromHttp(res.status) };
  } catch (err) {
    return {
      url,
      httpStatus: null,
      status: "needs_review",
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}

export function statusFromHttp(httpStatus: number): ProductStatus {
  if (httpStatus === 404 || httpStatus === 410) return "404";
  if (httpStatus >= 200 && httpStatus < 300) return "active";
  if (httpStatus === 403 || httpStatus === 429) return "needs_review";
  if (httpStatus >= 500) return "needs_review";
  return "unavailable";
}
