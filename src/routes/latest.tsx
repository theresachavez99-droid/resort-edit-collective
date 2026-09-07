import { createFileRoute, Link } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/site";
import { INSTAGRAM_HANDLE, INSTAGRAM_PROFILE_URL } from "@/data/instagramPosts";
import heroPoster from "@/assets/uploads/portofino/harbor-aperitivo-banner-golden-hour.png.asset.json";

export const Route = createFileRoute("/latest")({
  head: () => ({
    meta: [
      { title: "Latest from @resort.edit | Resort Edit" },
      {
        name: "description",
        content:
          "The most recent Resort Edit stories, reels and destination scenes — curated from Instagram @resort.edit.",
      },
      { property: "og:title", content: "Latest from @resort.edit | Resort Edit" },
      {
        property: "og:description",
        content: "Recent Resort Edit stories, reels and destination scenes from Instagram.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: absoluteUrl(heroPoster.url) },
      { name: "twitter:image", content: absoluteUrl(heroPoster.url) },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/latest") }],
  }),
  component: LatestPage,
});

function LatestPage() {
  return (
    <div className="bg-ivory">
      <section className="relative h-[36vh] min-h-[260px] w-full overflow-hidden bg-ink">
        <img
          src={heroPoster.url}
          alt="Portofino harbor at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/25 to-ink/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-6 text-ivory">
          <span className="eyebrow text-[0.64rem] md:text-[0.7rem] tracking-[0.42em] text-ivory/80">
            LATEST FROM @RESORT.EDIT
          </span>
          <h1 className="font-display text-4xl md:text-6xl mt-2 tracking-[0.04em] leading-[1]">
            The Feed
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12 md:py-16">
        <section className="mx-auto max-w-2xl text-center border border-border/60 bg-cream px-6 py-14 md:py-20">
          <p className="eyebrow text-gold text-[0.68rem] tracking-[0.34em]">COMING SOON</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-[0.03em] text-ink leading-[1.05]">
            The Resort Edit Diary
          </h2>
          <div className="mt-4 mx-auto h-px w-16 bg-gold/60" />
          <p className="mt-5 font-serif italic text-ink/65 text-[1rem] md:text-[1.08rem] leading-relaxed">
            Portofino stories, experiences &amp; what to wear — launching soon. Every scene will be
            published first on Instagram, where the destination stories begin.
          </p>
          <p className="mt-6 eyebrow text-[0.62rem] tracking-[0.3em] text-ink/50">
            {INSTAGRAM_HANDLE} · LAUNCHING SOON
          </p>
        </section>

        <p className="mt-12 text-center font-serif italic text-ink/60">
          Want the full destination edit?{" "}
          <Link to="/portofino" className="text-gold underline hover:text-ink">
            Explore Portofino
          </Link>{" "}
          or follow along{" "}
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline hover:text-ink"
          >
            @resort.edit
          </a>
          .
        </p>
      </div>
    </div>
  );
}
