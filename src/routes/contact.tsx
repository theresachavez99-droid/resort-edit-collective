import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Resort Edit" },
      {
        name: "description",
        content:
          "Reach Resort Edit — editorial enquiries, brand and retailer partnerships, corrections, and privacy requests.",
      },
      { property: "og:title", content: "Contact | Resort Edit" },
      {
        property: "og:description",
        content: "Editorial enquiries, partnerships, corrections and privacy requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: absoluteUrl("/contact") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
  }),
  component: ContactPage,
});

const REASONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Editorial & press",
    body: "Story ideas, destinations you want covered, or a correction to something we published.",
  },
  {
    title: "Brands & retailers",
    body: "Partnership enquiries, product information, or a request to update or remove a link.",
  },
  {
    title: "Privacy requests",
    body: (
      <>
        Access, correction, deletion, or unsubscribing — see{" "}
        <Link to="/privacy-rights" className="text-gold hover:underline">
          Privacy Choices
        </Link>{" "}
        for what we hold and how to ask.
      </>
    ),
  },
];

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <span className="eyebrow text-gold">Say hello</span>
      <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-wide text-ink">Contact</h1>
      <div className="mt-6 h-px w-16 bg-gold" />

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/80">
        Resort Edit is a small independent publication. Email is our public point of contact — we do
        not run a contact form, a phone line or social-media support.
      </p>

      <a
        href="mailto:hello@resortedit.com"
        className="mt-8 inline-flex items-center eyebrow bg-ink text-ivory px-7 py-4 hover:bg-gold hover:text-ink transition-colors"
      >
        hello@resortedit.com →
      </a>

      <section className="mt-14">
        <h2 className="font-display text-2xl md:text-3xl tracking-wide text-ink">
          What to write about
        </h2>
        <div className="mt-3 h-px w-12 bg-gold" />
        <ul className="mt-6 space-y-6">
          {REASONS.map((r) => (
            <li key={r.title}>
              <p className="eyebrow text-[0.62rem] tracking-[0.3em] text-gold">{r.title}</p>
              <p className="mt-2 font-serif text-base md:text-lg leading-relaxed text-ink/80">
                {r.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-14 font-serif text-ink/70 leading-relaxed">
        How we earn is explained in our{" "}
        <Link to="/affiliate-disclosure" className="text-gold hover:underline">
          Affiliate Disclosure
        </Link>
        , and how we handle information in our{" "}
        <Link to="/privacy-policy" className="text-gold hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
