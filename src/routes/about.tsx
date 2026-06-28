import { createFileRoute } from "@tanstack/react-router";
import heroAsset from "@/assets/about-hero-portofino-golden-harbor.png.asset.json";
import { absoluteUrl } from "@/lib/site";
import { EditorialHero } from "@/components/EditorialHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Resort Edit | Dressed for the destination" },
      { name: "description", content: "Resort Edit is a luxury editorial publication for travel and fashion — curated for the sophisticated, worldly woman." },
      { property: "og:title", content: "About | Resort Edit | Dressed for the destination" },
      { property: "og:description", content: "A luxury digital publication for travel and fashion." },
      { property: "og:url", content: absoluteUrl("/about") },
      { property: "og:image", content: absoluteUrl(heroAsset.url) },
      { name: "twitter:image", content: absoluteUrl(heroAsset.url) },
    ],
    links: [
      { rel: "canonical", href: absoluteUrl("/about") },
      { rel: "preload", as: "image", href: heroAsset.url, fetchpriority: "high" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <EditorialHero
        src={heroAsset.url}
        alt="Golden-hour view overlooking Portofino harbor with a woman in a white dress and straw hat enjoying the Italian Riviera."
        priority
        // Subject (hat + face) sits in the upper-right of the source image. We
        // bias y low (toward the top of the image) at every breakpoint so the
        // hat is never clipped, with generous breathing room above.
        focal={{
          base: { x: 78, y: 18 },   // mobile
          sm:   { x: 76, y: 20 },
          md:   { x: 74, y: 24 },   // tablet
          lg:   { x: 70, y: 32 },   // desktop — per spec
          xl:   { x: 66, y: 34 },
          "2xl":{ x: 60, y: 36 },
        }}
        heightClassName="h-[52vh] md:h-[64vh] lg:h-[72vh] min-h-[460px] max-h-[760px]"
        overlay={
          <div className="absolute inset-0 bg-gradient-to-t from-ink/15 via-transparent to-transparent" />
        }
      >
        <h1 className="sr-only">About Resort Edit</h1>
      </EditorialHero>

      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24 text-center">
        <span className="eyebrow text-gold">Who We Are</span>
        <p className="mt-8 font-serif italic text-[1.75rem] md:text-[2.25rem] leading-[1.25] text-ink">
          Resort Edit is for women who believe the destination should inspire the wardrobe.
        </p>
        <div className="my-10 h-px w-16 bg-gold mx-auto" />
        <div className="space-y-6 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/85">
          <p>Every Resort Edit begins with a destination — not a suitcase.</p>
          <p>
            We thoughtfully curate where to stay, what to experience, and what to wear, creating complete destination wardrobes inspired by the places themselves.
          </p>
          <p>
            From first espresso to sunset aperitivo, every recommendation is chosen to help you travel beautifully and dress with intention.
          </p>
          <p className="text-ink/75">
            Every destination is personally researched and curated using the same editorial process we would use when planning our own travels.
          </p>
          <p>Because the best trips deserve an unforgettable wardrobe.</p>
        </div>
        <p className="mt-12 font-serif italic text-base md:text-lg text-ink/70 tracking-wide">
          Welcome to Resort Edit.
        </p>
      </section>
    </div>
  );
}