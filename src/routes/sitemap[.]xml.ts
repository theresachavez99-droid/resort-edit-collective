import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PORTOFINO_JOURNEY } from "@/lib/portofino-moment-fallbacks";
import { brandCategories } from "@/data/brands";

const BASE_URL = "https://resortedit.com";

type SitemapEntry = { path: string; changefreq: string; priority: string };

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/destinations", changefreq: "weekly", priority: "0.9" },
  { path: "/portofino", changefreq: "monthly", priority: "0.9" },
  { path: "/portofino/pool-lounging/poolside-glam", changefreq: "monthly", priority: "0.7" },
  { path: "/resort-edits", changefreq: "weekly", priority: "0.8" },
  { path: "/brands", changefreq: "monthly", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
];

function buildEntries(): SitemapEntry[] {
  const all: SitemapEntry[] = [
    ...staticEntries,
    ...PORTOFINO_JOURNEY.map((m) => ({
      path: `/portofino/${m.moment_slug}`,
      changefreq: "weekly",
      priority: "0.8",
    })),
    ...brandCategories.flatMap((cat) =>
      cat.brands.map((b) => ({
        path: `/brands/${b.slug}`,
        changefreq: "monthly",
        priority: "0.5",
      })),
    ),
  ];
  const seen = new Set<string>();
  return all.filter((e) => {
    if (seen.has(e.path)) return false;
    seen.add(e.path);
    return true;
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = buildEntries()
          .map(
            (e) =>
              `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`,
          )
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});