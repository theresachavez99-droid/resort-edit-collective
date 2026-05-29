import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-portofino.jpg";

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
      <section className="relative h-[60vh] min-h-[420px]">
        <img src={heroImg} alt="Portofino harbor" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-ivory px-6">
          <span className="eyebrow">About the House</span>
          <h1 className="font-display text-5xl md:text-7xl mt-6 tracking-wide">Resort Edit</h1>
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