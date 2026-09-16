import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";

/**
 * Destinations index. One destination is published — Portofino — so the page
 * says exactly that instead of teasing empty guides. New destinations are added
 * here as they are actually written.
 */
export const Route = createFileRoute("/destinations")({
  head: () => ({
    meta: [
      { title: "Destinations | Resort Edit" },
      {
        name: "description",
        content:
          "Resort Edit destination guides. Portofino on the Italian Riviera is published in full: where to stay, what to book, where to eat and what to pack.",
      },
      { property: "og:title", content: "Destinations | Resort Edit" },
      {
        property: "og:description",
        content: "Resort Edit destination guides, starting with Portofino, Italy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { name: "twitter:image", content: absoluteUrl(portofinoImg) },
      { property: "og:url", content: absoluteUrl("/destinations") },
    ],
  }),
  component: DestinationsPage,
});

function DestinationsPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized !== "/destinations") return <Outlet />;

  return (
    <div className="bg-ivory">
      <section className="bg-ivory border-b border-border/40">
        <div className="mx-auto max-w-[1280px] px-6 py-12 md:py-16 text-center">
          <span className="eyebrow text-gold tracking-[0.32em] text-[0.68rem]">DESTINATIONS</span>
          <h1 className="font-display text-4xl md:text-6xl mt-3 tracking-[0.04em] text-ink leading-[1.03]">
            Where to Dress Next
          </h1>
          <div className="mx-auto my-4 h-px w-14 bg-gold" />
          <p className="mt-2 font-serif italic text-ink/65 text-lg max-w-2xl mx-auto leading-relaxed">
            The places, stays, and experiences worth dressing for.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <article className="grid grid-cols-1 md:grid-cols-2 border border-border/60 bg-card">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[380px] overflow-hidden bg-muted">
            <img
              src={portofinoImg}
              alt="Portofino harbour — pastel facades and wooden boats along the quay"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="p-6 md:p-9 flex flex-col justify-center">
            <span className="eyebrow text-[0.6rem] tracking-[0.32em] text-gold">
              ITALIAN RIVIERA · PUBLISHED
            </span>
            <h2 className="mt-2 font-display text-3xl md:text-[2.6rem] tracking-[0.03em] text-ink leading-[1.05]">
              Portofino, Italy
            </h2>
            <p className="mt-4 font-serif text-ink/70 text-[0.98rem] leading-relaxed">
              A pastel harbour small enough to walk in an afternoon. The full guide covers four
              places to stay, the boats, the eco-farm vineyard and coastal walks worth booking, the
              tables to reserve early, and what to pack for each of them.
            </p>
            <Link
              to="/portofino"
              className="mt-7 self-start eyebrow text-[0.7rem] tracking-[0.3em] text-ivory bg-ink px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors"
            >
              EXPLORE PORTOFINO
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
