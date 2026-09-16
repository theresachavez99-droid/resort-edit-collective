import { createFileRoute, Link } from "@tanstack/react-router";
import heroAsset from "@/assets/about-hero-portofino-golden-harbor.png.asset.json";
import { absoluteUrl } from "@/lib/site";
import { EditorialHero } from "@/components/EditorialHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Resort Edit | Dressed for the destination" },
      {
        name: "description",
        content:
          "Travel and style, considered together. Discover the editorial perspective behind Resort Edit.",
      },
      { property: "og:title", content: "About | Resort Edit | Dressed for the destination" },
      {
        property: "og:description",
        content:
          "Travel and style, considered together. Discover the editorial perspective behind Resort Edit.",
      },

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
          base: { x: 78, y: 18 }, // mobile
          sm: { x: 76, y: 20 },
          md: { x: 74, y: 24 }, // tablet
          lg: { x: 70, y: 32 }, // desktop — per spec
          xl: { x: 66, y: 34 },
          "2xl": { x: 60, y: 36 },
        }}
        heightClassName="h-[52vh] md:h-[64vh] lg:h-[72vh] min-h-[460px] max-h-[760px]"
        overlay={
          <div className="absolute inset-0 bg-gradient-to-t from-ink/15 via-transparent to-transparent" />
        }
      >
        <h1 className="sr-only">About Resort Edit</h1>
      </EditorialHero>

      <section
        id="our-story"
        className="mx-auto max-w-2xl px-6 py-16 md:py-24 scroll-mt-24 text-center"
      >
        <span className="eyebrow text-gold">The Publication</span>
        <p className="mt-8 font-serif italic text-[1.75rem] md:text-[2.25rem] leading-[1.25] text-ink">
          Travel and style, considered together.
        </p>
        <div className="my-10 h-px w-16 bg-gold mx-auto" />

        <div className="mx-auto max-w-xl text-left">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>
              Resort Edit is a travel and style publication for women who dress for the destination.
            </p>
            <p>
              Each guide brings together where to stay, what to do, where to eat, and what to
              wear—from mornings by the water to dinner after dark.
            </p>
            <p>
              Hotels, restaurants, experiences, and wardrobe ideas are selected for their character
              and connection to the destination.
            </p>
            <p>
              <Link to="/portofino" className="text-gold hover:underline">
                Explore the Portofino Edit →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section
        id="editorial-approach"
        className="mx-auto max-w-2xl px-6 pb-16 md:pb-24 scroll-mt-24 text-center"
      >
        <span className="eyebrow text-gold">Editorial Approach</span>
        <div className="mx-auto max-w-xl text-left mt-8">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>
              Recommendations are researched using information published by hotels, restaurants,
              brands, and local operators. Firsthand experience is identified where applicable.
            </p>
            <p>
              Selected imagery is created with AI to express the mood of a destination.
              Illustrations of venues are labelled accordingly.
            </p>
          </div>
        </div>
      </section>

      <section
        id="collaborate"
        className="mx-auto max-w-2xl px-6 pb-16 md:pb-24 scroll-mt-24 text-center"
      >
        <span id="contact" className="sr-only scroll-mt-24" aria-hidden="true" />
        <span className="eyebrow text-gold">Brand Partnerships</span>
        <div className="mx-auto max-w-xl text-left mt-8">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>
              Resort Edit considers partnerships with hotels, travel brands, and fashion labels that
              share its editorial perspective.
            </p>
            <p>
              For commercial enquiries and press, visit{" "}
              <Link to="/contact" className="text-gold hover:underline">
                Contact
              </Link>
              .
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
              Some shopping links are affiliate links. If you make a purchase through one, Resort
              Edit may earn a commission at no additional cost to you.
            </p>
            <p>
              Recommendations are selected on editorial merit. Affiliate relationships are
              disclosed.
            </p>
            <p>
              <Link to="/affiliate-disclosure" className="text-gold hover:underline">
                Read the full Affiliate Disclosure →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

