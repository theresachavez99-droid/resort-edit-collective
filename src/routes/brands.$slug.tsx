import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { brandCategories } from "@/data/brands";
import { absoluteUrl } from "@/lib/site";

/** Legacy slugs produced before diacritic normalisation landed. */
const LEGACY_BRAND_SLUG_ALIASES: Record<string, string> = {
  "casta-er": "castaner",
};

export const Route = createFileRoute("/brands/$slug")({
  loader: ({ params }) => {
    const aliased = LEGACY_BRAND_SLUG_ALIASES[params.slug];
    if (aliased) {
      throw redirect({
        to: "/brands/$slug",
        params: { slug: aliased },
        replace: true,
        statusCode: 301,
      });
    }
    for (const cat of brandCategories) {
      const brand = cat.brands.find((b) => b.slug === params.slug);
      if (brand) return { brand, category: cat.title };
    }
    throw notFound();
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.brand.name} | Resort Edit | Dressed for the destination` },
          {
            name: "description",
            content:
              loaderData.brand.blurb ??
              `Shop ${loaderData.brand.name} on Resort Edit — a curated ${loaderData.category.toLowerCase()} favorite.`,
          },
          { property: "og:title", content: `${loaderData.brand.name} | Resort Edit | Dressed for the destination` },
          { property: "og:url", content: absoluteUrl(`/brands/${loaderData.brand.slug}`) },
          { property: "og:description", content: loaderData.brand.blurb ?? `Shop ${loaderData.brand.name} on Resort Edit.` },
        ]
      : [],
    links: loaderData
      ? [{ rel: "canonical", href: absoluteUrl(`/brands/${loaderData.brand.slug}`) }]
      : [],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Resort Edit", item: absoluteUrl("/") },
                { "@type": "ListItem", position: 2, name: "Brands We Love", item: absoluteUrl("/brands") },
                { "@type": "ListItem", position: 3, name: loaderData.brand.name, item: absoluteUrl(`/brands/${loaderData.brand.slug}`) },
              ],
            }),
          },
        ]
      : [],
  }),
  component: BrandPage,
  notFoundComponent: () => (
    <div className="bg-ivory min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <span className="eyebrow text-gold">Not in the index</span>
        <h1 className="font-display text-3xl mt-4">This designer isn't in The Edit</h1>
        <Link to="/brands" className="mt-6 inline-block eyebrow text-ink hover:text-gold">
          ← Back to all brands
        </Link>
      </div>
    </div>
  ),
});

function BrandPage() {
  const { brand, category } = Route.useLoaderData();
  return (
    <div className="bg-ivory">
      <div className="mx-auto max-w-3xl px-6 pt-16 md:pt-24 pb-20 text-center">
        <Link to="/brands" className="eyebrow text-ink/50 hover:text-gold">
          ← Brands We Love
        </Link>
        <span className="block eyebrow text-gold mt-10">{category}</span>
        <h1 className="font-display text-5xl md:text-7xl tracking-[0.04em] mt-5 text-ink">
          {brand.name}
        </h1>
        {brand.blurb && (
          <p className="mt-8 font-serif italic text-lg text-ink/70 leading-relaxed">
            {brand.blurb}
          </p>
        )}
        <p className="mt-12 font-serif text-ink/60 leading-relaxed">
          A dedicated edit of {brand.name} pieces — styled across our resort itineraries —
          is in the works. In the meantime, browse the looks where we've already
          featured the label.
        </p>
        <Link
          to="/portofino"
          className="mt-10 inline-block bg-ink text-ivory eyebrow px-8 py-4 hover:bg-gold transition-colors"
        >
          Browse Resort Edits
        </Link>
      </div>
    </div>
  );
}