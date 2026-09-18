import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelSplendidoMare from "@/assets/hotel-splendido-mare.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { absoluteUrl } from "@/lib/site";
import { experiencesForDestination, type DestinationExperience } from "@/data/destinationExperiences";
import { PORTOFINO_DINING } from "@/data/portofinoDining";
import { outboundHref } from "@/data/outboundLinks";
import { OutboundCta } from "@/components/OutboundCta";
import {
  EditorialImageBadge,
  EditorialImageryNote,
  NamedPlaceDisclosure,
} from "@/components/EditorialImageryDisclosure";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "Portofino Guide — Where to Stay, What to Do, What to Pack" },
      {
        name: "description",
        content:
          "The Resort Edit guide to Portofino: clifftop and harbourfront hotels, boats, the eco-farm vineyard, coastal walks, the tables worth booking, and what to pack.",
      },
      { property: "og:title", content: "Portofino — The Resort Edit Guide" },
      {
        property: "og:description",
        content: "Where to stay, what to do, where to eat and what to pack in Portofino, Italy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: absoluteUrl(portofinoImg) },
      { name: "twitter:image", content: absoluteUrl(portofinoImg) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/portofino") }],
  }),
  errorComponent: () => (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-ink">
      <p className="font-display text-xl">Portofino is taking a moment. Please refresh.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main className="min-h-[60vh] flex items-center justify-center px-6 text-ink">
      <p className="font-display text-xl">Not found.</p>
    </main>
  ),
  component: PortofinoPage,
});

const HOTELS = [
  {
    linkKey: "hotel-splendido",
    name: "Splendido, A Belmond Hotel",
    category: "THE ICON",
    note: "Choose it for the full Portofino theatre: hillside views, resort days and dinner above the harbour.",
    image: hotelSplendido,
  },
  {
    linkKey: "hotel-splendido-mare",
    name: "Splendido Mare, A Belmond Hotel",
    category: "THE HARBOUR STAY",
    note: "Choose it to wake on the piazzetta and walk straight into the village—harbour immediacy over resort seclusion.",
    image: hotelSplendidoMare,
  },
  {
    linkKey: "hotel-eight-portofino",
    name: "Eight Hotel Portofino",
    category: "THE BOUTIQUE ALTERNATIVE",
    note: "A smaller, quieter address a short walk from the piazzetta, for village access without the grand-hotel scene.",
    image: hotelEight,
  },
  {
    linkKey: "hotel-piccolo-portofino",
    name: "Hotel Piccolo Portofino",
    category: "THE BEACH-FIRST BASE",
    note: "A relaxed seaside stay above a private cove, for travelers who want the water before the piazzetta.",
    image: hotelPiccolo,
  },
] as const;

/**
 * Practical planning advice only. No insider or scarcity claims, no
 * assertions about what locals do, no guaranteed transfer times.
 */
const EXPERIENCE_KEYS = [
  "portofino-la-portofinese-eco-farm",
  "portofino-private-riviera-boat",
  "portofino-pesto-boat-walk-lunch",
  "portofino-bagni-fiore-paraggi",
] as const;

const DINING_KEYS = ["dav-mare", "ristorante-puny", "la-terrazza", "da-o-batti"] as const;

const EXPERIENCE_COPY: Record<string, { editorial: string; facts: readonly string[] }> = {
  "portofino-la-portofinese-eco-farm": {
    editorial:
      "A working farm above Cala degli Inglesi, where Portofino's cultivated landscape meets the sea.",
    facts: [
      "Bees, vineyards, olive trees and a butterfly garden",
      "Arrange a wine tasting, picnic, lunch or early dinner",
      "Choose corzetti and pesto, or wood-fired pizza and focaccia; spring and summer opening, by reservation",
    ],
  },
  "portofino-private-riviera-boat": {
    editorial: "Coves, cliffs and the pastel harbour, seen from the water.",
    facts: ["About four hours", "Private tour", "Meets in Rapallo"],
  },
  "portofino-pesto-boat-walk-lunch": {
    editorial: "A boat ride, a village walk and Liguria's defining sauce made by hand.",
    facts: [
      "About three hours",
      "Starts at the Santa Margherita Ligure ferry pier",
      "Round-trip ferry tickets included",
    ],
  },
  "portofino-bagni-fiore-paraggi": {
    editorial: "Emerald water, striped umbrellas and lunch beside the bay at Paraggi.",
    facts: [
      "Sunbeds booked on the club's own calendar",
      "Restaurant reservations handled separately",
      "Opening dates and hours are seasonal",
    ],
  },
};

const BEFORE_YOU_GO = [
  "Book hotels, boats, beach clubs and tables early; many experiences are seasonal.",
  "Portofino is the harbour, shops and dinner; Paraggi is the beach.",
  "Arrive by boat or taxi, or take the train to Santa Margherita Ligure and transfer from there.",
];

function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  id?: string;
}) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-7 md:mb-9">
      <span className="eyebrow text-gold tracking-[0.32em] text-[0.68rem]">{eyebrow}</span>
      <h2
        id={id}
        className="font-display text-3xl md:text-[3.1rem] tracking-[0.04em] mt-2 text-ink leading-[1.04]"
      >
        {title}
      </h2>
      <div className="mx-auto my-3 h-px w-12 bg-gold" />
      {intro && (
        <p className="font-serif italic text-base md:text-lg text-ink/65 leading-relaxed">{intro}</p>
      )}
    </div>
  );
}

function ExperienceFacts({ facts }: { facts: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-1">
      {facts.map((f) => (
        <li key={f} className="font-serif text-[0.84rem] text-ink/70 leading-snug">
          · {f}
        </li>
      ))}
    </ul>
  );
}

function ProminentExperience({ e }: { e: DestinationExperience }) {
  const copy = EXPERIENCE_COPY[e.key] ?? e;
  return (
    <article className="bg-ivory border border-border/60 grid grid-cols-1 md:grid-cols-[42%_1fr]">
      {e.image && (
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] overflow-hidden bg-muted">
          <img
            src={e.image}
            alt={e.imageAlt ?? `${e.name} — editorial illustration`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {e.imageIsIllustrative && <EditorialImageBadge />}
        </div>
      )}
      <div className="p-5 md:p-8 flex flex-col">
        <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">
          THE ONE WE'D PLAN A DAY AROUND · {e.kind.toUpperCase()}
        </span>
        <h3 className="mt-2 font-display text-2xl md:text-[2.1rem] tracking-wide text-ink leading-snug">
          {e.name}
        </h3>
        <p className="mt-3 font-serif italic text-ink/70 text-[0.95rem] leading-relaxed">
          {copy.editorial}
        </p>
        <ExperienceFacts facts={copy.facts} />
        {e.imageIsIllustrative && <NamedPlaceDisclosure />}
        <div className="mt-auto pt-5">
          <OutboundCta
            linkKey={e.key}
            placement="portofino-do"
            className="inline-flex items-center eyebrow text-[0.62rem] tracking-[0.3em] text-ivory bg-ink px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
          />
        </div>
      </div>
    </article>
  );
}

function ExperienceCard({ e }: { e: DestinationExperience }) {
  const copy = EXPERIENCE_COPY[e.key] ?? e;
  return (
    <article className="bg-ivory border border-border/60 flex flex-col">
      {e.image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={e.image}
            alt={e.imageAlt ?? `${e.name} — editorial illustration`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {e.imageIsIllustrative && <EditorialImageBadge />}
        </div>
      )}
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">
          {e.kind.toUpperCase()}
        </span>
        <h3 className="mt-2 font-display text-xl md:text-2xl tracking-wide text-ink leading-snug">
          {e.name}
        </h3>
        <p className="mt-3 font-serif italic text-ink/70 text-[0.92rem] leading-relaxed">
          {copy.editorial}
        </p>
        <ExperienceFacts facts={copy.facts} />
        {e.imageIsIllustrative && <NamedPlaceDisclosure />}
        <div className="mt-4">
          <OutboundCta
            linkKey={e.key}
            placement="portofino-do"
            className="inline-flex items-center eyebrow text-[0.6rem] tracking-[0.3em] text-ink border-b border-ink/30 pb-1 hover:text-gold hover:border-gold transition-colors"
          />
        </div>
      </div>
    </article>
  );
}

function PortofinoPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized !== "/portofino") return <Outlet />;

  const experiences = experiencesForDestination("portofino").filter((e) =>
    EXPERIENCE_KEYS.includes(e.key as (typeof EXPERIENCE_KEYS)[number]),
  );
  const prominent = experiences.filter((e) => e.prominent);
  const rest = experiences.filter((e) => !e.prominent);
  const hotels = HOTELS.filter((h) => outboundHref(h.linkKey) !== null);
  const dining = DINING_KEYS.map((key) => PORTOFINO_DINING.find((d) => d.key === key)).filter(
    (d): d is (typeof PORTOFINO_DINING)[number] => Boolean(d),
  );

  return (
    <div className="bg-ivory pb-10 md:pb-12">
      {/* HERO */}
      <section className="relative h-[44vh] md:h-[58vh] min-h-[320px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="AI-generated editorial illustration of Portofino harbour, with pastel facades and wooden boats along the quay"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/20 to-ink/60" />
        <EditorialImageBadge />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-6 md:pb-10 text-ivory">
          <span className="eyebrow text-[0.62rem] md:text-[0.7rem] tracking-[0.42em] text-ivory/80">
            DRESSED FOR THE DESTINATION™
          </span>
          <h1 className="font-display text-5xl md:text-[6rem] mt-2 tracking-[0.05em] leading-[1]">
            Portofino
          </h1>
          <p className="font-serif italic text-base md:text-xl text-ivory/90 mt-2 max-w-2xl leading-relaxed">
            Where to stay, what to do, where to eat — and what to pack for all of it.
          </p>
        </div>
      </section>

      <EditorialImageryNote />

      {/* QUICK JUMP */}
      <nav aria-label="Portofino sections" className="bg-cream border-b border-border/40">
        <ul className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {[
            { hash: "stay", label: "Stay" },
            { hash: "do", label: "Do" },
            { hash: "eat", label: "Eat" },
            { hash: "wear", label: "Wear" },
            { hash: "planning", label: "Before You Go" },
          ].map((s) => (
            <li key={s.hash}>
              <a
                href={`#${s.hash}`}
                className="eyebrow text-[0.66rem] tracking-[0.3em] text-ink/70 hover:text-gold transition-colors"
              >
                {s.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* STAY */}
      <section id="stay" className="scroll-mt-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-12 md:pt-16">
          <SectionHeading
            eyebrow="STAY"
            title="Where We'd Stay"
            intro="Four ways to stay: the full Portofino theatre, the harbour at your door, a quieter village address or a beach-first base."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {hotels.map((h) => (
              <article
                key={h.linkKey}
                className="grid grid-cols-[42%_1fr] bg-card border border-border/60"
              >
                <div className="relative overflow-hidden bg-muted">
                  <img
                    src={h.image}
                    alt={`AI-generated editorial illustration inspired by ${h.name}; not a photograph of the property`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <EditorialImageBadge />
                </div>
                <div className="p-4 md:p-5 flex flex-col">
                  <span className="eyebrow text-[0.56rem] tracking-[0.32em] text-gold">
                    {h.category}
                  </span>
                  <h3 className="font-display text-lg md:text-xl tracking-wide mt-1.5 leading-snug text-ink">
                    {h.name}
                  </h3>
                  <p className="font-serif italic text-ink/65 text-[0.86rem] mt-2 leading-relaxed flex-1">
                    {h.note}
                  </p>
                  <NamedPlaceDisclosure />
                  <div className="mt-3">
                    <OutboundCta
                      linkKey={h.linkKey}
                      placement="portofino-stay"
                      label="CHECK ROOMS & DATES"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* DO */}
      <section id="do" className="scroll-mt-24 bg-cream border-y border-border/40 mt-14 md:mt-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
          <SectionHeading
            eyebrow="DO"
            title="What We'd Book"
            intro="Four ways to experience the promontory, from vineyard terraces to the water."
          />
          {prominent.map((e) => (
            <div key={e.key} className="mb-5 md:mb-7">
              <ProminentExperience e={e} />
            </div>
          ))}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {rest.map((e) => (
              <ExperienceCard key={e.key} e={e} />
            ))}
          </div>
        </div>
      </section>

      {/* EAT */}
      <section id="eat" className="scroll-mt-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-12 md:pt-16">
          <SectionHeading
            eyebrow="EAT"
            title="Where We'd Eat"
            intro="A short list — the tables worth reserving early, and the easier options along the coast."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {dining.map((d) => {
              const href = d.linkKey ? outboundHref(d.linkKey) : null;
              return (
                <article
                  key={d.key}
                  className="bg-card border border-border/60 p-5 md:p-6 flex flex-col"
                >
                  <span className="eyebrow text-[0.56rem] tracking-[0.32em] text-gold">
                    {d.kind.toUpperCase()}
                  </span>
                  <h3 className="mt-2 font-display text-xl tracking-wide text-ink leading-snug">
                    {d.name}
                  </h3>
                  <p className="mt-3 font-serif italic text-ink/70 text-[0.9rem] leading-relaxed flex-1">
                    {d.note}
                  </p>
                  {d.linkKey && href ? (
                    <div className="mt-4">
                      <OutboundCta linkKey={d.linkKey} placement="portofino-eat" />
                    </div>
                  ) : (
                    <p className="mt-4 font-serif text-[0.74rem] text-ink/45">
                      {d.planning ?? "Reserve directly with the restaurant."}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* WEAR — packing guide (advice only, nothing shoppable) */}
      <section id="wear" className="scroll-mt-24 bg-cream border-y border-border/40 mt-14 md:mt-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
          <SectionHeading
            eyebrow="WEAR"
            title="What to Pack for Portofino"
            intro="Practical packing advice for the days in this guide — what works on the paving, on the water and at dinner."
          />
          <article className="bg-ivory border border-border/60 p-5 md:p-7 max-w-3xl mx-auto">
            <p className="font-serif text-ink/70 text-[0.95rem] leading-relaxed">
              Pack walkable shoes with grip for stone paving, light daywear with a hat and swimwear
              for the sun, and a knit or wrap for boats and cooler evenings. One easy dress or
              elegant separates, with shoes you can still walk in, will cover dinner.
            </p>
          </article>
        </div>
      </section>

      {/* BEFORE YOU GO */}
      <section id="planning" className="scroll-mt-24 mx-auto max-w-[1280px] px-4 sm:px-6 pt-12 md:pt-16">
        <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
          <h2 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">
            BEFORE YOU GO
          </h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {BEFORE_YOU_GO.map((tip, i) => (
            <li key={tip} className="bg-card border border-border/60 p-4 flex gap-4">
              <span className="font-display text-gold text-sm pt-0.5 tracking-wider">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-serif text-ink/75 text-[0.95rem] leading-relaxed">{tip}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <div className="mx-auto h-px w-16 bg-ink/15" />
          <p className="mt-6 text-center font-serif text-[11px] md:text-[12px] leading-relaxed text-ink/40 max-w-4xl mx-auto">
            Availability, seasons and terms are controlled by each hotel or operator. Hotel, dining
            and experience links on this page currently earn Resort Edit no commission.{" "}
            <Link to="/affiliate-disclosure" className="underline hover:text-ink/70">
              Affiliate Disclosure
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
