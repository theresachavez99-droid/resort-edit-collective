/**
 * og-image.server — fetch a product page and extract a best-guess primary image URL.
 *
 * Strategy: og:image → twitter:image → first <link rel="image_src"> → first reasonable <img>.
 * Returns a structured result so the UI can show *why* an image is missing instead of
 * a generic "no image".
 */

export type OgImageResult = {
  ok: boolean;
  url: string;
  image_url: string | null;
  source: "og:image" | "twitter:image" | "image_src" | "first-img" | null;
  status: number | null;
  reason: string | null;
};

const ABS = (base: string, src: string): string => {
  try {
    return new URL(src, base).toString();
  } catch {
    return src;
  }
};

function pickMeta(html: string, prop: string): string | null {
  // <meta property="og:image" content="..."> or name=... in any order, quoted with " or '.
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*?content=["']([^"']+)["']`,
    "i",
  );
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
    "i",
  );
  const m2 = html.match(re2);
  return m2 ? m2[1] : null;
}

function pickLinkImageSrc(html: string): string | null {
  const m = html.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function pickFirstImg(html: string): string | null {
  // Heuristic: skip 1x1 pixel trackers, data: URIs, sprites.
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const src = m[1];
    if (!src) continue;
    if (src.startsWith("data:")) continue;
    if (/sprite|pixel|1x1|tracking|analytics/i.test(src)) continue;
    return src;
  }
  return null;
}

export async function extractOgImage(url: string): Promise<OgImageResult> {
  const base: OgImageResult = {
    ok: false,
    url,
    image_url: null,
    source: null,
    status: null,
    reason: null,
  };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        // Some retailers block default UA; mimic a real browser request for og tags.
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
    }).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(`fetch_failed: ${msg}`);
    });
    clearTimeout(t);
    base.status = r.status;
    if (!r.ok) {
      base.reason = `HTTP ${r.status} — page did not load.`;
      return base;
    }
    const html = await r.text();
    let src: string | null = null;
    let source: OgImageResult["source"] = null;
    src = pickMeta(html, "og:image");
    if (src) source = "og:image";
    if (!src) {
      src = pickMeta(html, "twitter:image");
      if (src) source = "twitter:image";
    }
    if (!src) {
      src = pickLinkImageSrc(html);
      if (src) source = "image_src";
    }
    if (!src) {
      src = pickFirstImg(html);
      if (src) source = "first-img";
    }
    if (!src) {
      base.reason = "Page loaded but no og:image / twitter:image / <img> found.";
      return base;
    }
    base.ok = true;
    base.image_url = ABS(url, src);
    base.source = source;
    return base;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    base.reason = msg;
    return base;
  }
}

/**
 * Batch enrich a hero_urls array. Mutates copies — does not touch the input.
 * Always preserves an existing image_url; only fetches when missing.
 */
export async function enrichHeroUrlsWithImages<
  T extends { url?: string | null; image_url?: string | null },
>(
  heroUrls: T[],
): Promise<{ heroUrls: T[]; report: OgImageResult[] }> {
  const report: OgImageResult[] = [];
  const out = await Promise.all(
    heroUrls.map(async (h) => {
      const url = (h.url ?? "").trim();
      if (!url) return h;
      if (h.image_url && h.image_url.trim()) {
        report.push({
          ok: true,
          url,
          image_url: h.image_url,
          source: null,
          status: null,
          reason: "kept existing",
        });
        return h;
      }
      const r = await extractOgImage(url);
      report.push(r);
      if (r.ok && r.image_url) {
        return { ...h, image_url: r.image_url };
      }
      return h;
    }),
  );
  return { heroUrls: out, report };
}