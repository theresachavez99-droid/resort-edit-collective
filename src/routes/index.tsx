import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getFeaturedDestination } from "@/data/featuredDestination";
import { InstagramStrip } from "@/components/InstagramStrip";
import heroVideoAsset from "@/assets/portofino-hero.mp4.asset.json";
import heroPosterAsset from "@/assets/portofino-hero-poster.jpg.asset.json";
import portofinoFeatured from "@/assets/hero-portofino-harbor.jpg";
import * as React from "react";

const featured = getFeaturedDestination();
const heroMuse = featured.heroImage;
const heroVideoUrl = heroVideoAsset.url;
const heroPosterUrl = heroPosterAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resort Edit | Dressed for the Destination" },
      {
        name: "description",
        content:
          "Where to stay, what to do, and what to wear when you get there. An editorial guide to luxury Mediterranean destinations, starting with Portofino.",
      },
      { property: "og:title", content: "Resort Edit | Dressed for the Destination" },
      {
        property: "og:description",
        content:
          "Where to stay, what to do, and what to wear when you get there. Editorial destination guides from Resort Edit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: absoluteUrl(heroMuse) },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:image", content: absoluteUrl(heroMuse) },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "preload", as: "image", href: heroPosterUrl, fetchpriority: "high" },
    ],
  }),
  component: Index,
});

const pillars = [
  {
    label: "STAY",
    copy: "The addresses worth the flight — clifftop grande dames, harbourfront boutiques, private coves.",
  },
  {
    label: "DO",
    copy: "Boats, coastal walks, vineyards and long afternoons, with the operators who actually run them.",
  },
  {
    label: "EAT",
    copy: "The tables to book ahead, and the ones locals keep for themselves.",
  },
  {
    label: "WEAR",
    copy: "What we'd pack for each of those moments — styled on Instagram, shoppable when you're ready.",
  },
];

function Index() {
  const wrap = "px-4 sm:px-6 lg:px-10 xl:px-14 mx-auto max-w-[1440px]";
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return (
    <div className="bg-ivory w-full">
      {/* HERO — single cinematic Portofino scene. */}
      <section
        aria-label={`${featured.name} — editorial cover`}
        className="relative w-full overflow-hidden bg-ink"
      >
        <div className="relative w-full h-[78vh] min-h-[560px] max-h-[920px] [--hero-focal:50%_15%] md:[--hero-focal:50%_12%] lg:[--hero-focal:50%_10%]">
          {prefersReducedMotion ? (
            <img
              src={heroPosterUrl}
              alt={featured.heroImageAlt}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "var(--hero-focal, 50% 15%)" }}
            />
          ) : (
            <video
              key="portofino-hero-video"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "var(--hero-focal, 50% 15%)" }}
              src={heroVideoUrl}
              poster={heroPosterUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              aria-label={featured.heroImageAlt}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-ink/25" />
          <div className="absolute inset-x-0 bottom-0 px-6 sm:px-10 lg:px-14 pb-12 md:pb-16 lg:pb-20">
            <div className="max-w-[1440px] mx-auto">
              <p className="eyebrow text-ivory/85 text-[0.7rem] sm:text-[0.78rem] tracking-[0.42em]">
                RESORT EDIT™
              </p>
              <h1 className="mt-3 font-display text-ivory text-[2.6rem] sm:text-[3.6rem] lg:text-[4.4rem] leading-[1.02] tracking-[0.01em] max-w-[24ch]">
                Dressed for the Destination™
              </h1>
              <p className="mt-3 font-serif italic text-ivory/85 text-[1.05rem] sm:text-[1.15rem] lg:text-[1.25rem] leading-snug max-w-[46ch]">
                Where to stay, what to do, and what to wear when you get there.
              </p>
              <Link
                to="/portofino"
                className="mt-6 inline-flex items-center justify-center eyebrow text-[0.7rem] tracking-[0.3em] text-ink bg-ivory px-7 py-3.5 hover:bg-gold transition-colors"
              >
                EXPLORE PORTOFINO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DESTINATION */}
      <section className={`${wrap} pt-12 md:pt-16`}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 md:gap-10 items-center">
          <div className="relative aspect-[4/3] lg:aspect-[5/4] overflow-hidden bg-muted">
            <img
              src={portofinoFeatured}
              alt="Portofino harbor — pastel facades and wooden boats along the quay"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="lg:pl-2">
            <p className="eyebrow text-gold text-[0.68rem] tracking-[0.34em]">
              FEATURED DESTINATION
            </p>
            <h2 className="mt-2 font-display text-[2.1rem] sm:text-[2.6rem] lg:text-[3rem] tracking-[0.02em] text-ink leading-[1.04]">
              Portofino, Italy
            </h2>
            <div className="mt-4 h-px w-16 bg-gold/60" />
            <p className="mt-5 font-serif text-[1rem] sm:text-[1.05rem] text-ink/75 leading-relaxed max-w-[46ch]">
              A pastel harbor on the Italian Riviera, small enough to walk in an afternoon and
              layered enough to keep you all week. Our full edit: where to stay, the boats and
              vineyards worth booking, the tables to reserve early, and what we'd wear for each.
            </p>
            <Link
              to="/portofino"
              className="mt-7 inline-flex items-center justify-center eyebrow text-[0.7rem] tracking-[0.3em] text-ivory bg-ink px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors"
            >
              EXPLORE PORTOFINO
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST FROM @RESORT.EDIT */}
      <div className={`${wrap} pt-14 md:pt-20`}>
        <InstagramStrip limit={6} showFollow={false} />
      </div>

      {/* STAY / DO / EAT / WEAR */}
      <section className={`${wrap} pt-14 md:pt-20`}>
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow text-gold text-[0.68rem] tracking-[0.34em]">THE RESORT EDIT MODEL</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.03em] text-ink leading-[1.05]">
            Four Ways We Edit a Destination
          </h2>
          <div className="mt-4 mx-auto h-px w-16 bg-gold/60" />
        </div>
        <div className="mt-7 md:mt-9 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {pillars.map((p) => (
            <article
              key={p.label}
              className="bg-cream border border-border/50 p-5 md:p-6 flex flex-col"
            >
              <span className="font-display text-[1.35rem] md:text-[1.6rem] tracking-[0.22em] text-ink">
                {p.label}
              </span>
              <div className="mt-3 h-px w-10 bg-gold/60" />
              <p className="mt-3 font-serif italic text-ink/70 text-[0.88rem] md:text-[0.94rem] leading-relaxed">
                {p.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* FOLLOW CTA */}
      <section className={`${wrap} pt-14 md:pt-20 pb-4`}>
        <div className="bg-cream border border-border/50 px-6 py-10 md:py-14 text-center">
          <p className="eyebrow text-gold text-[0.68rem] tracking-[0.34em]">THE STORY CONTINUES</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl lg:text-4xl tracking-[0.03em] text-ink leading-[1.05] max-w-[26ch] mx-auto">
            Follow the edit on Instagram
          </h2>
          <p className="mt-4 font-serif italic text-ink/65 text-[1rem] max-w-[44ch] mx-auto leading-relaxed">
            New destinations, reels and looks land there first.
          </p>
          <div className="mt-7">
            <a
              href="https://www.instagram.com/resort.edit/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center eyebrow text-[0.7rem] tracking-[0.3em] text-ivory bg-ink px-7 py-3.5 hover:bg-gold hover:text-ink transition-colors"
            >
              FOLLOW @RESORT.EDIT
            </a>
          </div>
        </div>
      </section>

      <div className={`${wrap} pb-16 md:pb-24 pt-10`}>
        <div className="mx-auto h-px w-16 bg-ink/15" />
        <p className="mt-6 text-center font-serif text-[11px] md:text-[12px] leading-relaxed text-ink/40">
          Some links may earn a commission at no additional cost to you.{" "}
          <Link to="/affiliate-disclosure" className="underline hover:text-ink/70">
            Affiliate Disclosure
          </Link>
        </p>
      </div>
    </div>
  );
}
