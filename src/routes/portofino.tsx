import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import portofinoImg from "@/assets/hero-portofino-harbor.jpg";
import hotelSplendido from "@/assets/hotel-splendido.jpg";
import hotelSplendidoMare from "@/assets/hotel-splendido-mare.jpg";
import hotelEight from "@/assets/hotel-eight.jpg";
import hotelPiccolo from "@/assets/hotel-piccolo.jpg";
import { absoluteUrl } from "@/lib/site";
import {
  experiencesForDestination,
  experienceCta,
  type DestinationExperience,
} from "@/data/destinationExperiences";
import { PORTOFINO_DINING } from "@/data/portofinoDining";
import { shopTheEditLink } from "@/data/shopTheEdit";
import {
  INSTAGRAM_PROFILE_URL,
  instagramCardForExperience,
  instagramHref,
} from "@/data/instagramPosts";
import { InstagramStrip } from "@/components/InstagramStrip";

export const Route = createFileRoute("/portofino")({
  head: () => ({
    meta: [
      { title: "Portofino — Where to Stay, What to Do, What to Wear | Resort Edit" },
      {
        name: "description",
        content:
          "The Resort Edit guide to Portofino: clifftop and harbourfront hotels, private boats and coastal walks, the tables worth booking, and what we'd wear for each.",
      },
      { property: "og:title", content: "Portofino — The Resort Edit Guide" },
      {
        property: "og:description",
        content:
          "Where to stay, what to do, where to eat and what to wear in Portofino, Italy.",
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
    name: "Splendido, A Belmond Hotel",
    category: "ULTRA LUXURY",
    note: "A cliffside grande dame above the harbor — bougainvillea terraces, pastel-pink facade, and the most storied view on the Riviera.",
    image: hotelSplendido,
    href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-hotel-splendido/",
  },
  {
    name: "Splendido Mare",
    category: "HARBORFRONT",
    note: "On the piazzetta itself. Wake to the boats, dine on the waterfront, walk everywhere that matters.",
    image: hotelSplendidoMare,
    href: "https://www.belmond.com/hotels/europe/italy/portofino/belmond-splendido-mare/",
  },
  {
    name: "Eight Hotel Portofino",
    category: "BOUTIQUE",
    note: "Quietly chic, steps from the piazzetta — an intimate Italian retreat for travelers who want to live like a local.",
    image: hotelEight,
    href: "https://www.eighthotels.com/en/eight-hotel-portofino/",
  },
  {
    name: "Hotel Piccolo Portofino",
    category: "PRIVATE COVE",
    note: "An intimate seaside hideaway tucked into a private cove — sun-bleached terraces and turquoise water.",
    image: hotelPiccolo,
    href: "https://www.hotelpiccoloportofino.com/",
  },
];

const INSIDER_NOTES = [
  "Reserve beach clubs weeks ahead — Paraggi fills by May.",
  "Paraggi for beach time. Portofino for dinner.",
  "Avoid driving into Portofino. Park in Santa Margherita or arrive by boat.",
  "Wear flats after aperitivo — the cobblestones are unforgiving.",
  "Dinner reservations matter more than spontaneity here.",
  "Book boats before restaurants — captains fill up first.",
  "Santa Margherita is easier for logistics, ten minutes by car.",
  "The harbor empties after 10pm. That is when locals come out.",
];

const GETTING_THERE = [
  {
    label: "Private Driver",
    note: "Black-car transfer from Genoa (45 min), Milan (2.5 hr), or Nice (3 hr). The most direct arrival.",
  },
  {
    label: "By Boat",
    note: "Water taxi from Santa Margherita or Rapallo — the entrance the village was designed for.",
  },
  {
    label: "Santa Margherita Base",
    note: "Stay ten minutes away for easier logistics, then come into Portofino for lunch and dinner.",
  },
  {
    label: "Train + Transfer",
    note: "High-speed rail to Santa Margherita Ligure, then taxi or boat into the village.",
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

function ExperienceCard({ e }: { e: DestinationExperience }) {
  const igCard = instagramCardForExperience(e.key);
  const igHref = igCard ? instagramHref(igCard) : undefined;
  const shop = shopTheEditLink(e.key);

  return (
    <article className="bg-ivory border border-border/60 flex flex-col">
      {e.image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={e.image}
            alt={e.imageAlt ?? `${e.name} — Portofino`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
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
        {e.imageCaption && (
          <p className="mt-2 font-serif text-[0.72rem] text-ink/45">{e.imageCaption}</p>
        )}
        <p className="mt-3 font-serif text-[0.8rem] text-ink/50">{e.operator}</p>

        <div className="mt-auto pt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={e.href}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow text-[0.6rem] tracking-[0.3em] text-ivory bg-ink px-5 py-3 hover:bg-gold hover:text-ink transition-colors"
          >
            {e.booking === "availability" ? "BOOK THIS" : "ENQUIRE"}
          </a>
          {shop ? (
            <a
              href={shop.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="eyebrow text-[0.6rem] tracking-[0.3em] text-gold border-b border-gold/50 pb-1 hover:text-ink hover:border-ink transition-colors"
            >
              {(shop.label ?? "SHOP THE EDIT").toUpperCase()} →
            </a>
          ) : igHref ? (
            <a
              href={igHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 eyebrow text-[0.6rem] tracking-[0.3em] text-ink/70 hover:text-gold transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" strokeWidth={1.6} />
              SEE WHAT WE'D WEAR
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 eyebrow text-[0.6rem] tracking-[0.3em] text-ink/40">
              <Instagram className="w-3.5 h-3.5" strokeWidth={1.6} />
              THE INSTAGRAM EDIT IS COMING SOON
            </span>
          )}
        </div>
        <p className="mt-3 font-serif text-[0.72rem] text-ink/40">{experienceCta(e)}</p>
      </div>
    </article>
  );
}

function PortofinoPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized !== "/portofino") return <Outlet />;

  const experiences = experiencesForDestination("portofino");

  return (
    <div className="bg-ivory pb-10 md:pb-12">
      {/* HERO */}
      <section className="relative h-[44vh] md:h-[58vh] min-h-[320px] w-full overflow-hidden bg-ink">
        <img
          src={portofinoImg}
          alt="Portofino harbor — pastel facades and wooden boats along the quay"
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
            Where to stay, what to do, where to eat — and what we'd wear for all of it.
          </p>
        </div>
      </section>

      {/* QUICK JUMP */}
      <nav
        aria-label="Portofino sections"
        className="bg-cream border-b border-border/40"
      >
        <ul className="mx-auto max-w-[1280px] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {[
            { hash: "stay", label: "Stay" },
            { hash: "do", label: "Do" },
            { hash: "eat", label: "Eat" },
            { hash: "wear", label: "Wear" },
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
            {HOTELS.map((h) => (
              <a
                key={h.name}
                href={h.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="group grid grid-cols-[42%_1fr] bg-card border border-border/60 hover:border-gold transition-colors"
              >
                <div className="relative overflow-hidden bg-muted">
                  <img
                    src={h.image}
                    alt={h.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                  <span className="mt-3 self-start eyebrow text-[0.58rem] tracking-[0.3em] text-ink group-hover:text-gold transition-colors border-b border-ink/30 group-hover:border-gold pb-1">
                    Book This Stay →
                  </span>
                </div>
              </a>
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
            intro="Boats, coastal walks, a vineyard inside the park, pesto made by hand — with the operators who actually run them."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {experiences.map((e) => (
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
            intro="A short list — the tables to reserve early, and the ones locals keep quiet about."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {PORTOFINO_DINING.map((d) => (
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
                {d.href ? (
                  <a
                    href={d.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 self-start eyebrow text-[0.58rem] tracking-[0.3em] text-ink border-b border-ink/30 pb-1 hover:text-gold hover:border-gold transition-colors"
                  >
                    {d.hrefLabel ?? "Visit site"} →
                  </a>
                ) : (
                  <p className="mt-4 font-serif text-[0.74rem] text-ink/40">
                    Reservations by phone — ask your hotel concierge.
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WEAR / SEEN ON @RESORT.EDIT */}
      <section
        id="wear"
        className="scroll-mt-24 bg-cream border-y border-border/40 mt-14 md:mt-20"
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
          <InstagramStrip
            eyebrow="WEAR · SEEN ON @RESORT.EDIT"
            heading="What We'd Wear in Portofino"
            intro="Each look is styled and published on Instagram. Tap through to see the full outfit and, where available, shop the edit."
            limit={6}
          />
        </div>
      </section>

      {/* INSIDER NOTES + GETTING THERE */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-12 md:pt-16">
        <div className="mb-12 md:mb-16">
          <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
            <h2 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">
              INSIDER NOTES
            </h2>
            <span className="eyebrow text-[0.58rem] tracking-[0.3em] text-ink/50 hidden sm:inline">
              From the concierge desk
            </span>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
            {INSIDER_NOTES.map((tip, i) => (
              <li key={tip} className="flex gap-4">
                <span className="font-display text-gold text-sm pt-0.5 tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-serif italic text-ink/75 text-[0.95rem] leading-relaxed">{tip}</p>
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
              Arrival, the easy way
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {GETTING_THERE.map((g) => (
              <article key={g.label} className="bg-card border border-border/60 p-4">
                <span className="eyebrow text-[0.58rem] tracking-[0.32em] text-gold">
                  {g.label.toUpperCase()}
                </span>
                <p className="font-serif italic text-ink/70 text-[0.92rem] mt-2 leading-relaxed">
                  {g.note}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-14 text-center">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 eyebrow text-[0.68rem] tracking-[0.3em] text-ivory bg-ink px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.6} />
            FOLLOW @RESORT.EDIT
          </a>
        </div>

        <div className="mt-12">
          <div className="mx-auto h-px w-16 bg-ink/15" />
          <p className="mt-6 text-center font-serif text-[11px] md:text-[12px] leading-relaxed text-ink/40">
            Availability is set by each hotel and operator and may change. Some links may earn a
            commission at no additional cost to you.{" "}
            <Link to="/affiliate-disclosure" className="underline hover:text-ink/70">
              Affiliate Disclosure
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
