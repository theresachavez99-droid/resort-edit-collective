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
        // Subject (face + hat) sits in the upper-right of the source image. Each
        // breakpoint shifts the focal point so the head, hat and harbor stay in frame.
        focal={{
          base: { x: 82, y: 28 },   // mobile — tight on the model
          sm:   { x: 80, y: 28 },
          md:   { x: 76, y: 30 },   // tablet — pull in a little more harbor
          lg:   { x: 70, y: 32 },   // standard desktop — balanced composition
          xl:   { x: 62, y: 34 },   // large desktop — full scene
          "2xl":{ x: 56, y: 36 },
        }}
        heightClassName="h-[44vh] md:h-[56vh] lg:h-[62vh] min-h-[380px] max-h-[640px]"
        overlay={
          <div className="absolute inset-0 bg-gradient-to-t from-ink/15 via-transparent to-transparent" />
        }
      >
        <h1 className="sr-only">About Resort Edit</h1>
      </EditorialHero>

      <section className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
        <span className="eyebrow text-gold">Who We Are</span>
        <div className="my-8 h-px w-16 bg-gold mx-auto" />
        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-ink">
          Resort Edit is for women who believe the destination should inspire the wardrobe.
        </p>
        <div className="my-12 h-px w-24 bg-gold mx-auto" />
        <p className="font-serif text-lg leading-relaxed text-ink/80">
          Every Resort Edit begins with a destination — not a suitcase.
        </p>
        <p className="font-serif text-lg leading-relaxed text-ink/80 mt-6">
          We thoughtfully curate where to stay, what to experience, and what to wear, creating complete destination wardrobes inspired by the places themselves.
        </p>
        <p className="font-serif text-lg leading-relaxed text-ink/80 mt-6">
          From first espresso to sunset aperitivo, every recommendation is chosen to help you travel beautifully and dress with intention.
        </p>
        <p className="font-serif italic text-base leading-relaxed text-ink/65 mt-10 max-w-2xl mx-auto">
          Every destination is personally researched and curated using the same editorial process we would use when planning our own travels.
        </p>
        <p className="font-serif text-lg leading-relaxed text-ink/80 mt-10">
          Because the best trips deserve an unforgettable wardrobe.
        </p>
        <div className="my-12 h-px w-16 bg-gold mx-auto" />
        <p className="font-display italic text-xl md:text-2xl text-ink/80 tracking-wide">
          Welcome to Resort Edit.
        </p>
      </section>
    </div>
  );
}