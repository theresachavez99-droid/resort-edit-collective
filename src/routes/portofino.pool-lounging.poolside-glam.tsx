import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ResortEditProductCard } from "@/components/resort-edit/ResortEditProductCard";
import { OtherPortofinoMoments } from "@/components/OtherPortofinoMoments";
import { SaveLookButton } from "@/components/SaveLookButton";
import { findResortEditLook, orderedProducts } from "@/data/resortEditLooks";
import { absoluteUrl } from "@/lib/site";

const MOMENT = "pool-lounging";
const LOOK_SLUG = "poolside-glam";

export const Route = createFileRoute("/portofino/pool-lounging/poolside-glam")({
  head: () => {
    const look = findResortEditLook("portofino", MOMENT, LOOK_SLUG);
    if (!look) return { meta: [{ name: "robots", content: "noindex" }] };
    const title = `${look.title} — Portofino | Resort Edit`;
    const path = `/portofino/${MOMENT}/${LOOK_SLUG}`;
    return {
      meta: [
        { title },
        { name: "description", content: look.description },
        { property: "og:title", content: title },
        { property: "og:description", content: look.description },
        { property: "og:image", content: absoluteUrl(look.heroImage) },
        { property: "og:url", content: absoluteUrl(path) },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: absoluteUrl(look.heroImage) },
      ],
      links: [{ rel: "canonical", href: absoluteUrl(path) }],
    };
  },
  component: PoolsideGlamPage,
});

function PoolsideGlamPage() {
  const look = findResortEditLook("portofino", MOMENT, LOOK_SLUG);
  if (!look) throw notFound();
  const items = orderedProducts(look);

  return (
    <div className="pb-4 md:pb-6">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1180px] px-4 sm:px-6 pt-5 pb-2">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 eyebrow text-[0.6rem] tracking-[0.26em] text-ink/55">
          <li><Link to="/" className="hover:text-gold transition-colors">Home</Link></li>
          <li aria-hidden className="text-gold/50">/</li>
          <li><Link to="/portofino" className="hover:text-gold transition-colors">Portofino</Link></li>
          <li aria-hidden className="text-gold/50">/</li>
          <li>
            <Link to="/portofino/$moment" params={{ moment: MOMENT }} className="hover:text-gold transition-colors">
              Pool Lounging
            </Link>
          </li>
          <li aria-hidden className="text-gold/50">/</li>
          <li aria-current="page" className="text-ink">{look.title}</li>
        </ol>
      </nav>

      <section className="bg-ivory">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 pb-12 md:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)] gap-8 md:gap-12 items-start">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream/40 border border-border/60">
              <img src={look.heroImage} alt={`${look.title} — Portofino`} className="absolute inset-0 h-full w-full object-cover object-center" />
              <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">INSPIRED BY</span>
            </div>
            <div className="space-y-5 lg:pl-2 lg:sticky lg:top-6">
              <h1 className="font-display text-4xl md:text-5xl tracking-[0.04em] text-ink leading-[1.05]">{look.title}</h1>
              <p className="font-serif italic text-[1.05rem] md:text-[1.1rem] text-ink/80 leading-relaxed max-w-prose">{look.description}</p>
              <SaveLookButton source="complete_look_detail" look={{ id: `portofino/${MOMENT}/${LOOK_SLUG}`, destination: "Portofino", activity: "Pool Lounging", title: look.title, description: look.description, image: look.heroImage, url: `/portofino/${MOMENT}/${LOOK_SLUG}` }} />
              <div className="pt-3 border-t border-border/40" />
              <div>
                <span className="eyebrow text-[0.6rem] tracking-[0.34em] text-gold">STYLING NOTES</span>
                <p className="font-serif text-[0.98rem] text-ink/75 mt-3 leading-relaxed max-w-prose">{look.stylingStory}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream/40 border-t border-border/40">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-2xl mb-8 md:mb-10">
            <span className="eyebrow text-[0.62rem] tracking-[0.36em] text-gold">THE EDIT</span>
            <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">Shop the Complete Look</h2>
            <p className="font-serif italic text-[0.98rem] text-ink/70 mt-3 leading-relaxed">Every piece was chosen personally by our editors. The editorial photograph serves as inspiration; the pieces below are our curated interpretation.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {items.map((product) => <ResortEditProductCard key={product.url} product={product} />)}
          </div>
        </div>
      </section>

      <OtherPortofinoMoments excludeSlugs={[MOMENT]} />
    </div>
  );
}