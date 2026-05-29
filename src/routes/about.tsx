import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-about-muse.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Resort Edit" },
      { name: "description", content: "Resort Edit is a luxury editorial publication for travel and fashion — curated for the sophisticated, worldly woman." },
      { property: "og:title", content: "About Resort Edit" },
      { property: "og:description", content: "A luxury digital publication for travel and fashion." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="relative h-[70vh] min-h-[480px]">
        <img
          src={heroImg}
          alt="Resort Edit muse on a Portofino terrace at golden hour"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover object-[30%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/10 to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-end text-center text-ivory px-6 pb-16 md:pb-24">
          <span className="eyebrow tracking-[0.3em]">Who We Are</span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mt-5 tracking-wide">Resort Edit</h1>
          <p className="font-serif italic text-base md:text-lg mt-5 max-w-xl leading-relaxed text-ivory/90">
            Destination style, curated escapes, and shoppable inspiration for women who dress for the destination.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <p className="font-serif italic text-2xl md:text-3xl leading-relaxed text-ink">
          Resort Edit is a digital publication for women who travel with intention and dress with conviction. We believe in the long lunch, the perfect kaftan, the small black book of addresses worth the flight.
        </p>
        <div className="my-12 h-px w-24 bg-gold mx-auto" />
        <p className="font-serif text-lg leading-relaxed text-ink/80">
          Each edit is a complete world — a destination, an itinerary, a wardrobe. We share the boutiques, beach clubs and quiet hotels we'd send a friend to, alongside the resortwear we'd actually pack. Our taste leans Mediterranean, our standards are exacting, and our recommendations are the ones we live by.
        </p>
        <p className="mt-8 eyebrow text-gold">Curated escapes. Styled your way.</p>
      </section>
    </div>
  );
}