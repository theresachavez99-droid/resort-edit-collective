import { Link } from "@tanstack/react-router";
import type { ResortEditLook } from "@/data/resortEditLooks";
import { ResortEditProductGrid } from "./ResortEditProductGrid";

/**
 * "The Resort Edit" featured-look block for a moment page. Renders the
 * editorial hero image alongside the look title/description, then the
 * complete product grid, then a "View Complete Look" CTA that navigates
 * to the dedicated detail page — never directly to a retailer.
 */
export function ResortEditFeaturedLook({
  look,
  detailTo,
  detailParams,
  supportingCopy,
}: {
  look: ResortEditLook;
  detailTo: string;
  detailParams?: Record<string, string>;
  supportingCopy: string;
}) {
  return (
    <section id="shop-the-look" className="bg-ivory scroll-mt-16">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-9 md:py-12">
        {/* Editorial header — image left, look title & description right */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)] gap-8 md:gap-12 items-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-cream/40 border border-border/60">
            <img
              src={look.heroImage}
              alt={`${look.title} — Portofino`}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
              INSPIRED BY
            </span>
          </div>
          <div className="space-y-4 lg:pl-2">
            {look.founderFavorite && (
              <span className="eyebrow text-[0.6rem] tracking-[0.36em] text-gold">
                FOUNDER FAVORITE
              </span>
            )}
            <h2 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink leading-[1.1]">
              {look.title}
            </h2>
            <p className="font-serif italic text-[1rem] md:text-[1.05rem] text-ink/80 leading-relaxed max-w-prose">
              {look.description}
            </p>
          </div>
        </div>

        {/* THE EDIT — full product grid */}
        <div className="mt-14 md:mt-16 border-t border-border/40 pt-10 md:pt-12">
          <div className="max-w-2xl mb-8 md:mb-10">
            <span className="eyebrow text-[0.62rem] tracking-[0.36em] text-gold">
              THE EDIT
            </span>
            <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
              The Resort Edit
            </h3>
            <p className="font-serif italic text-[0.98rem] text-ink/70 mt-3 leading-relaxed">
              {supportingCopy}
            </p>
          </div>

          <ResortEditProductGrid look={look} />

          <div className="mt-12 md:mt-14 flex justify-center">
            <Link
              to={detailTo}
              params={detailParams as never}
              className="inline-flex items-center gap-3 eyebrow text-[0.7rem] tracking-[0.36em] text-ivory bg-ink hover:bg-gold transition-colors duration-300 px-8 py-4"
            >
              VIEW COMPLETE LOOK →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
