import { createFileRoute } from "@tanstack/react-router";
import heroAsset from "@/assets/about-hero-portofino-v2.jpg.asset.json";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Resort Edit" },
      { name: "description", content: "Resort Edit is a luxury editorial publication for travel and fashion — curated for the sophisticated, worldly woman." },
      { property: "og:title", content: "About Resort Edit" },
      { property: "og:description", content: "A luxury digital publication for travel and fashion." },
      { property: "og:url", content: absoluteUrl("/about") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/about") }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="relative h-[38vh] md:h-[50vh] min-h-[320px] max-h-[520px]">
        <img src={heroAsset.url} alt="Golden hour over Portofino harbor with yachts and pastel buildings" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/35 via-ink/5 to-transparent" />
        <h1 className="sr-only">About Resort Edit</h1>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
        <span className="eyebrow text-gold">Who We Are</span>
        <div className="my-8 h-px w-16 bg-gold mx-auto" />
        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-ink">
          Resort Edit is for women who travel with intention and dress beautifully wherever they go.
        </p>
        <div className="my-12 h-px w-24 bg-gold mx-auto" />
        <p className="font-serif text-lg leading-relaxed text-ink/80">
          Each edit is a destination, an itinerary, and a wardrobe designed to travel together.
        </p>
        <p className="font-serif text-lg leading-relaxed text-ink/80 mt-6">
          We share the hotels worth extending your trip for, the experiences worth planning around, and the pieces we'd actually pack — from investment resortwear to the elevated finds we actually reach for.
        </p>
        <p className="font-serif text-lg leading-relaxed text-ink/80 mt-6">
          From beach clubs to city strolls, long lunches to late dinners — this is how to dress for the destination.
        </p>
        <p className="mt-8 eyebrow text-gold">Curated escapes. Dressed for the destination.</p>
      </section>
    </div>
  );
}