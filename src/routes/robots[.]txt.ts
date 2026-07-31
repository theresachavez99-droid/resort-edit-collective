import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_HOST, SITE_URL } from "@/lib/site";

function isProdHost(host: string): boolean {
  const h = host.toLowerCase();
  return h === SITE_HOST || h === `www.${SITE_HOST}`;
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const host = (request.headers.get("host") ?? "").toLowerCase();
        const body = isProdHost(host)
          ? `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
          : `User-agent: *\nDisallow: /\n`;
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
            "X-Robots-Tag": isProdHost(host) ? "all" : "noindex, nofollow",
          },
        });
      },
    },
  },
});