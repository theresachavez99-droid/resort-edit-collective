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

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mt-12 scroll-mt-24">
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
      <p className="mt-6 font-serif italic text-ink/70">Last updated: September 27, 2026</p>

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/80">
        Resort Edit is an independent editorial publication. Today it publishes destination guides —
        currently Portofino — covering where to stay, what to do, where to eat and what to pack. This
        page explains, in plain language, how our outbound links work, which of them can earn us
        anything, and how our imagery is made.
      </p>

      <Section title="Outbound links">
        <p>
          Hotel, restaurant, experience and shopping links open the venue, operator, booking platform
          or retailer that lists them. As of the date above, none of those links earn Resort Edit a
          commission. They are ordinary links, not paid placements.
        </p>
        <p>
          The venues and operators we mention are not sponsors, have not paid for placement, and have
          not endorsed Resort Edit. We do not claim membership of any affiliate or booking programme
          we have not been accepted into.
        </p>
      </Section>

      <Section title="Editorial independence">
        <p>
          Places and advice are chosen on their own merits. If a link becomes commission-bearing in
          future, we will identify it and update this disclosure.
        </p>
      </Section>

      <Section title="About our imagery" id="about-our-imagery">
        <p>
          Resort Edit editorial imagery is created with AI image generation unless specifically
          credited otherwise. It illustrates the Resort Edit point of view and is not documentary
          photography of a person, hotel, restaurant, destination, activity or event. Images that
          visualize named properties and experiences are labelled as editorial visualizations.
        </p>
        <p>
          Clothing shown in our imagery is editorial styling. Images of Lilla wearing linked
          products are AI-generated model images. Retailer photography should be used to confirm
          exact color, fit and details. Verified retailer and product photography may be third-party
          and is not labelled as AI-generated.
        </p>
        <p>
          We have not necessarily visited every venue we describe. Facts such as meeting points,
          durations and what a booking includes are taken from the venue's or operator's own current
          listing, and those can change — always confirm the details when you book.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          For enquiries about this disclosure, visit{" "}
          <Link to="/contact" className="text-gold hover:underline">
            Contact
          </Link>
          . See also our{" "}

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
