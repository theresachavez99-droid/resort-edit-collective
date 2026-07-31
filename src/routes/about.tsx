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

        <div className="mx-auto max-w-xl text-left">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>Every Resort Edit begins with a destination — not a suitcase.</p>
            <p>
              We thoughtfully curate where to stay, what to experience, and what to wear, creating complete destination wardrobes inspired by the places themselves.
            </p>
            <p>
              From first espresso to sunset aperitivo, every recommendation is chosen to help you travel beautifully and dress with intention.
            </p>
            <p className="border-l-2 border-gold/25 pl-5">
              Every destination is personally researched and curated using the same editorial process we would use when planning our own travels.
            </p>
            <p>Because the best trips deserve an unforgettable wardrobe.</p>
          </div>
        </div>
      </section>

      <section
        id="our-muse"
        className="mx-auto max-w-2xl px-6 pb-16 md:pb-24 scroll-mt-24 text-center"
      >
        <span className="eyebrow text-gold">Our Muse</span>
        <div className="mx-auto max-w-xl text-left mt-8">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>
              The looks you see across Resort Edit are AI-styled on Lilla, our house muse. Lilla is not a real person — she is how we show you a complete look, in the destination, before you pack it.
            </p>
            <p>
              Every piece she wears is real and shoppable. Each garment, shoe, and accessory is a genuine product we have sourced, verified, and linked from the retailer that carries it.
            </p>
          </div>
        </div>
      </section>

      <section
        id="affiliate-disclosure"
        className="mx-auto max-w-2xl px-6 pb-16 md:pb-24 scroll-mt-24 text-center"
      >
        <span className="eyebrow text-gold">Affiliate Disclosure</span>
        <div className="mx-auto max-w-xl text-left mt-8">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>
              Resort Edit is reader-supported. When you purchase through links on our site, we may earn a commission from the retailer — at no additional cost to you.
            </p>
            <p>
              Commissions never decide what we feature. Every look is curated editorially first; affiliate relationships only determine which retailer we link to, never which pieces we love.
            </p>
            <p>
              Hotel, experience, and charter recommendations may likewise include partner links. We only recommend places and pieces we would choose for our own travels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}