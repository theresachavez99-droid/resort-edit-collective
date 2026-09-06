import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/affiliate-disclosure")({
  head: () => ({
    meta: [
      { title: "Affiliate Disclosure | Resort Edit" },
      {
        name: "description",
        content:
          "How Resort Edit earns, how retailer links work, and how our editorial imagery is created — in plain language.",
      },
      { property: "og:title", content: "Affiliate Disclosure | Resort Edit" },
      {
        property: "og:description",
        content: "How Resort Edit earns, how retailer links work, and how our imagery is created.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: absoluteUrl("/affiliate-disclosure") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/affiliate-disclosure") }],
  }),
  component: AffiliateDisclosurePage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl md:text-3xl tracking-wide text-ink">{title}</h2>
      <div className="mt-3 h-px w-12 bg-gold" />
      <div className="mt-5 space-y-4 font-serif text-base md:text-lg leading-relaxed text-ink/80">
        {children}
      </div>
    </section>
  );
}

function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <span className="eyebrow text-gold">Legal</span>
      <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-wide text-ink">
        Affiliate Disclosure
      </h1>
      <div className="mt-6 h-px w-16 bg-gold" />
      <p className="mt-6 font-serif italic text-ink/70">Last updated: September 6, 2026</p>

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/80">
        Resort Edit is an independent editorial publication. This page explains, in plain language,
        how our links work, how we may earn, and how our editorial imagery is made.
      </p>

      <Section title="How our links work">
        <p>
          When we feature a piece, we link to a retailer's page for that piece. Some of those links
          may earn Resort Edit a commission if you buy something. You never pay more because you used
          our link — the price is the retailer's price.
        </p>
        <p>
          Many of our links earn nothing at all. Commission is never the reason a piece is featured.
        </p>
      </Section>

      <Section title="What we are not">
        <p>
          We do not claim membership of any affiliate network we have not been accepted into, and we
          do not describe an ordinary retailer link as a paid partnership. Where a link earns us
          nothing, we do not pretend otherwise.
        </p>
        <p>
          Hotels, beach clubs, farms and tour operators mentioned on this site are not sponsors,
          have not paid for placement, and have not endorsed Resort Edit. Booking and enquiry links
          open the listed operator or booking platform, and the experience links currently displayed
          are not commission-bearing.
        </p>
      </Section>

      <Section title="Editorial independence">
        <p>
          Commissions never decide what appears here. Pieces are chosen for the destination, the
          moment and the wardrobe. An affiliate relationship can influence which retailer we link to
          when several stock the same piece — never whether a piece is featured.
        </p>
      </Section>

      <Section title="About our imagery">
        <p>
          Resort Edit's editorial photographs are created with AI image generation, art-directed by
          us. They are illustrations of how a look feels in a place — not documentary photographs of
          a specific person, boutique, hotel or event.
        </p>
        <p>
          Where we link a piece, we name the brand and product and link the retailer's page for it.
          Even so, a generated image can differ from the product photography on the retailer's page: drape, colour under
          different light, trim detail and styling may not match exactly. The retailer's own
          photographs and description are always the accurate reference for what you will receive.
        </p>
        <p>
          Destination and venue imagery is our own editorial illustration of the place, not the
          operator's photography, and is labelled as such where we use it.
        </p>
      </Section>

      <Section title="Stock and availability">
        <p>
          Availability changes constantly and some retailers block automated checks entirely. A link
          on this site is not a guarantee that the piece is currently in stock, in your size or in
          the colour shown; the retailer's own page is the accurate reference. Where we cannot
          confirm a piece, we do not claim it is available.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          If anything here is unclear, write to us at{" "}
          <a href="mailto:hello@resortedit.com" className="text-gold hover:underline">
            hello@resortedit.com
          </a>{" "}
          or see our{" "}
          <Link to="/privacy-policy" className="text-gold hover:underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/privacy-rights" className="text-gold hover:underline">
            Privacy Choices
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
