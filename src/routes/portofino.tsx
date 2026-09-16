import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelSplendidoMare from "@/assets/hotel-splendido-mare.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { absoluteUrl } from "@/lib/site";
import { experiencesForDestination, type DestinationExperience } from "@/data/destinationExperiences";
import { PORTOFINO_DINING } from "@/data/portofinoDining";
import { PORTOFINO_PACKING_GUIDE } from "@/data/portofinoPackingGuide";
import { outboundHref } from "@/data/outboundLinks";
import { OutboundCta } from "@/components/OutboundCta";
import { INSTAGRAM_PROFILE_URL } from "@/data/instagramPosts";

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
    category: "ULTRA LUXURY",
    note: "A cliffside grande dame above the harbour — bougainvillea terraces, a pastel-pink facade, and one of the most photographed views on the Riviera.",
    image: hotelSplendido,
  },
  {
    linkKey: "hotel-splendido-mare",
    name: "Splendido Mare, A Belmond Hotel",
    category: "HARBOURFRONT",
    note: "On the piazzetta itself. Wake to the boats, dine on the waterfront, walk everywhere that matters.",
    image: hotelSplendidoMare,
  },
  {
    linkKey: "hotel-eight-portofino",
    name: "Eight Hotel Portofino",
    category: "BOUTIQUE",
    note: "A small, quietly chic hotel a short walk from the piazzetta — the intimate option in the village.",
    image: hotelEight,
  },
  {
    linkKey: "hotel-piccolo-portofino",
    name: "Hotel Piccolo Portofino",
    category: "PRIVATE COVE",
    note: "A seaside hideaway set above its own cove, with terraces facing the water.",
    image: hotelPiccolo,
  },
] as const;

/**
 * Practical planning advice only. No insider or scarcity claims, no
 * assertions about what locals do, no guaranteed transfer times.
 */
const PLANNING_NOTES = [
  "Book beach clubs, boats and dinner tables as far ahead as you can — the village is small and high season is busy.",
  "Paraggi is the beach; Portofino is the harbour, the shops and dinner. Most days work best split between the two.",
  "Driving into Portofino is restricted and parking is limited. Arriving by boat or taxi from Santa Margherita Ligure is usually simpler.",
  "Flat, gripped shoes are worth packing for the paving and the footpaths, especially after dinner.",
  "Boats, the eco-farm and cooking sessions are often seasonal — confirm dates and weather directly with the operator before you commit.",
  "Staying in Santa Margherita Ligure gives you more restaurants and easier logistics, with Portofino a short transfer away.",
];

const GETTING_THERE = [
  {
    label: "Private Driver",
    note: "Black-car transfer from Genoa, Milan or Nice. Journey times vary with traffic and the coast road, so ask your driver to confirm.",
  },
  {
    label: "By Boat",
    note: "Water taxi or ferry from Santa Margherita Ligure or Rapallo — the entrance the village was designed for. Services are weather-dependent.",
  },
  {
    label: "Santa Margherita Base",
    note: "Stay along the coast for easier parking and more restaurants, then come into Portofino for lunch, aperitivo or dinner.",
  },
  {
    label: "Train + Transfer",
    note: "Rail to Santa Margherita Ligure, then taxi or boat into the village. Check the final connection before you book a late arrival.",
  },
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

function IllustrationCaption({ text }: { text: string }) {
  return (
    <span className="absolute bottom-0 inset-x-0 bg-ink/70 text-ivory text-[0.58rem] tracking-[0.14em] font-sans px-2.5 py-1 backdrop-blur-sm">
      {text}
    </span>
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
          {e.imageCaption && <IllustrationCaption text={e.imageCaption} />}
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
          {e.editorial}
        </p>
        <ExperienceFacts facts={e.facts} />
        <p className="mt-3 font-serif text-[0.76rem] text-ink/45 leading-snug">
          Operated by {e.operator}. Details read from the operator's own page on{" "}
          {e.factsCheckedOn}.
        </p>
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
          {e.imageCaption && <IllustrationCaption text={e.imageCaption} />}
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
          {e.editorial}
        </p>
        <ExperienceFacts facts={e.facts} />
        <p className="mt-3 font-serif text-[0.74rem] text-ink/45 leading-snug flex-1">
          Operated by {e.operator}.
        </p>
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

  const experiences = experiencesForDestination("portofino");
  const prominent = experiences.filter((e) => e.prominent);
  const rest = experiences.filter((e) => !e.prominent);
  const hotels = HOTELS.filter((h) => outboundHref(h.linkKey) !== null);

  return (
    <div className="bg-ivory pb-10 md:pb-12">
      {/* HERO */}
      <section className="relative h-[44vh] md:h-[58vh] min-h-[320px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbour — pastel facades and wooden boats along the quay"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/20 to-ink/60" />
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

      {/* QUICK JUMP */}
      <nav aria-label="Portofino sections" className="bg-cream border-b border-border/40">
        <ul className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {[
            { hash: "stay", label: "Stay" },
            { hash: "do", label: "Do" },
            { hash: "eat", label: "Eat" },
            { hash: "wear", label: "Wear" },
            { hash: "planning", label: "Planning" },
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
            intro="Four addresses on the promontory — clifftop, harbourfront, boutique, or a private cove."
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
                    alt={h.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
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
                  <div className="mt-3">
                    <OutboundCta linkKey={h.linkKey} placement="portofino-stay" />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 font-serif text-[0.8rem] text-ink/50 text-center max-w-2xl mx-auto leading-relaxed">
            Links open each hotel's own website, where rooms, dates and rates are set by the hotel.
          </p>
        </div>
      </section>

      {/* DO */}
      <section id="do" className="scroll-mt-24 bg-cream border-y border-border/40 mt-14 md:mt-20">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
          <SectionHeading
            eyebrow="DO"
            title="What We'd Book"
            intro="A vineyard farm inside the park, boats along the promontory, pesto made by hand, and the old footpath to the abbey."
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
          <p className="mt-6 font-serif text-[0.8rem] text-ink/50 text-center max-w-3xl mx-auto leading-relaxed">
            Details are taken from each operator's or booking platform's own listing. Availability,
            seasons and terms are set by the operator — some experiences are arranged by enquiry
            rather than instant booking. Venue images on this page are editorial illustrations, not
            photographs of the venues.
          </p>
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
            {PORTOFINO_DINING.map((d) => {
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
            intro="Practical packing advice for the days in this guide. Nothing here is for sale — it's simply what works on the paving, on the water and at dinner."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
            {PORTOFINO_PACKING_GUIDE.map((p) => (
              <article key={p.key} className="bg-ivory border border-border/60 p-5 md:p-6">
                <h3 className="font-display text-xl tracking-wide text-ink leading-snug">
                  {p.label}
                </h3>
                <div className="mt-3 h-px w-10 bg-gold/60" />
                <p className="mt-3 font-serif text-ink/70 text-[0.92rem] leading-relaxed">
                  {p.advice}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-center font-serif text-[0.8rem] text-ink/50 max-w-2xl mx-auto leading-relaxed">
            Packing advice, not a shop. Resort Edit does not sell clothing, and nothing pictured
            elsewhere on this site is available to buy here.
          </p>
        </div>
      </section>

      {/* PLANNING NOTES + GETTING THERE */}
      <section id="planning" className="scroll-mt-24 mx-auto max-w-[1280px] px-4 sm:px-6 pt-12 md:pt-16">
        <div className="mb-12 md:mb-16">
          <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
            <h2 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">
              PLANNING NOTES
            </h2>
            <span className="eyebrow text-[0.58rem] tracking-[0.3em] text-ink/50 hidden sm:inline">
              Practical, not promises
            </span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {PLANNING_NOTES.map((tip, i) => (
              <li key={tip} className="flex gap-4">
                <span className="font-display text-gold text-sm pt-0.5 tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-serif text-ink/75 text-[0.95rem] leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
            <h2 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">
              GETTING THERE
            </h2>
            <span className="eyebrow text-[0.58rem] tracking-[0.3em] text-ink/50 hidden sm:inline">
              Confirm times with your operator
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {GETTING_THERE.map((g) => (
              <article key={g.label} className="bg-card border border-border/60 p-4">
                <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">
                  {g.label.toUpperCase()}
                </span>
                <p className="font-serif text-ink/70 text-[0.92rem] mt-2 leading-relaxed">
                  {g.note}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <p className="font-serif italic text-ink/60 text-[0.95rem] max-w-xl mx-auto leading-relaxed">
            Resort Edit publishes destination scenes on Instagram as well. The guide above is
            complete on its own.
          </p>
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2.5 eyebrow text-[0.68rem] tracking-[0.3em] text-ivory bg-ink px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.6} />
            FOLLOW @RESORT.EDIT
          </a>
        </div>

        <div className="mt-12">
          <div className="mx-auto h-px w-16 bg-ink/15" />
          <p className="mt-6 text-center font-serif text-[11px] md:text-[12px] leading-relaxed text-ink/40">
            Availability is set by each hotel and operator and may change. The hotel, dining and
            experience links on this page are ordinary links and currently earn Resort Edit no
            commission.{" "}
            <Link to="/affiliate-disclosure" className="underline hover:text-ink/70">
              Affiliate Disclosure
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
