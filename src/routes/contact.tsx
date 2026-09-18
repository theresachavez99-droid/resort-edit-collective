import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Resort Edit" },
      {
        name: "description",
        content:
          "Commercial partnerships, press enquiries, editorial corrections, and privacy requests.",
      },
      { property: "og:title", content: "Contact | Resort Edit" },
      {
        property: "og:description",
        content:
          "Commercial partnerships, press enquiries, editorial corrections, and privacy requests.",
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
    title: "Brand partnerships",
    body: "Hotel, travel, fashion, and lifestyle partnerships aligned with Resort Edit’s editorial perspective.",
  },
  {
    title: "Press & media",
    body: "Press enquiries, interviews, and requests to reproduce Resort Edit content.",
  },
  {
    title: "Editorial corrections",
    body: "For a factual correction or rights enquiry, include the relevant page link and supporting details.",
  },
  {
    title: "Privacy",
    body: (
      <>
        For personal information requests, see{" "}
        <Link to="/privacy-rights" className="text-gold hover:underline">
          Your Privacy Choices
        </Link>
        .
      </>
    ),
  },
];

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <span className="eyebrow text-gold">Resort Edit</span>
      <h1 className="mt-4 font-display text-4xl md:text-6xl tracking-wide text-ink">Enquiries</h1>
      <div className="mt-6 h-px w-16 bg-gold" />

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/80">
        For commercial partnerships, press enquiries, and editorial corrections.
      </p>

      <p className="mt-8 font-serif text-lg leading-relaxed text-ink/70">
        For editorial, press and partnership enquiries:{" "}
        <a href="mailto:helloresortedit@gmail.com" className="text-gold hover:underline">
          helloresortedit@gmail.com
        </a>
      </p>

      <section className="mt-14">
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

