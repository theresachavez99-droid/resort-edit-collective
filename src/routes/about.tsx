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
          "Resort Edit is a luxury editorial publication for travel and fashion — curated for the sophisticated, worldly woman.",
      },
      { property: "og:title", content: "About | Resort Edit | Dressed for the destination" },
      {
        property: "og:description",
        content: "A luxury digital publication for travel and fashion.",
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
        <span className="eyebrow text-gold">Who We Are</span>
        <p className="mt-8 font-serif italic text-[1.75rem] md:text-[2.25rem] leading-[1.25] text-ink">
          Resort Edit is for women who believe the destination should inspire the wardrobe.
        </p>
        <div className="my-10 h-px w-16 bg-gold mx-auto" />

        <div className="mx-auto max-w-xl text-left">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>Every Resort Edit begins with a destination — not a suitcase.</p>
            <p>
              We edit one destination at a time: where to stay, what to book, where to eat, and what
              to pack for each of those days.
            </p>
            <p>
              From first espresso to sunset aperitivo, every recommendation is chosen to help you
              travel beautifully and dress with intention.
            </p>
            <p className="border-l-2 border-gold/25 pl-5">
              Our guides are researched from operators' and hotels' own published information and
              written by hand. Where we have not stayed or dined somewhere ourselves, we say what a
              place is rather than claiming a personal visit.
            </p>
            <p>Because the best trips deserve an unforgettable wardrobe.</p>

          </div>
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto max-w-2xl px-6 pb-16 md:pb-24 scroll-mt-24 text-center"
      >
        <span className="eyebrow text-gold">Contact</span>
        <div className="mx-auto max-w-xl text-left mt-8">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>
              A question about a destination, a piece we featured, or somewhere you would love to
              see curated next — we read every note.
            </p>
            <p>
              Write to{" "}
              <a
                href="mailto:hello@resortedit.com"
                className="border-b border-gold/40 pb-0.5 hover:border-gold hover:text-gold transition-colors"
              >
                hello@resortedit.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section
        id="collaborate"
        className="mx-auto max-w-2xl px-6 pb-16 md:pb-24 scroll-mt-24 text-center"
      >
        <span className="eyebrow text-gold">Collaborate</span>
        <div className="mx-auto max-w-xl text-left mt-8">
          <div className="space-y-5 font-serif text-[1.1875rem] md:text-[1.25rem] leading-[1.7] text-ink/90">
            <p>
              Resort Edit partners with brands, hotels, tourism boards, and affiliate programs whose
              sense of place matches our own.
            </p>
            <p>
              For partnerships and press, reach us at{" "}
              <a
                href="mailto:hello@resortedit.com"
                className="border-b border-gold/40 pb-0.5 hover:border-gold hover:text-gold transition-colors"
              >
                hello@resortedit.com
              </a>
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
              Resort Edit is reader-supported. Some links may earn us a commission in future — at no
              additional cost to you. Today, every hotel, dining and experience link on the site is
              an ordinary link and earns us nothing.
            </p>
            <p>
              Commissions never decide what we feature. Recommendations are chosen editorially
              first; an affiliate relationship could only affect which page we link to.
            </p>
            <p>
              Some imagery on the site is art-directed by us and created with AI image generation.
              Illustrated venue images are labelled as editorial illustrations, so they are never
              mistaken for photographs of a hotel, restaurant or operator.
            </p>
            <p>
              Hotels, beach clubs and experiences we mention are not sponsors and have not paid for
              placement — those links go straight to the operator or booking platform.
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
