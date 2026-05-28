import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { brandCategories } from "@/data/brands";

export const Route = createFileRoute("/brands/$slug")({
  loader: ({ params }) => {
    for (const cat of brandCategories) {
      const brand = cat.brands.find((b) => b.slug === params.slug);
      if (brand) return { brand, category: cat.title };
    }
    throw notFound();
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.brand.name} — Resort Edit` },
          {
            name: "description",
            content:
              loaderData.brand.blurb ??
              `Shop ${loaderData.brand.name} on Resort Edit — a curated ${loaderData.category.toLowerCase()} favorite.`,
          },
        ]
      : [],
  }),
  component: BrandPage,
  notFoundComponent: () => (
    <div className="bg-ivory min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <span className="eyebrow text-gold">Not in the index — yet</span>
        <h1 className="font-display text-3xl mt-4">Brand coming soon</h1>
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