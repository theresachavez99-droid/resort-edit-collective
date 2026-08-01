import { Link } from "@tanstack/react-router";
import { orderedProducts, type ResortEditLook } from "@/data/resortEditLooks";
import { SaveLookButton } from "@/components/SaveLookButton";

/**
 * Browse card for a Resort Edit Look. Used on moment pages inside the
 * "More Resort Edit Looks" grid. No prices — this is invitation to
 * explore, not a product listing.
 *
 * Currently unused because Poolside Glam is the only founder-approved
 * look. Kept in the design system so future sibling looks can render
 * without additional component work.
 */
export function ResortEditLookCard({
  look,
  momentName,
}: {
  look: ResortEditLook;
  momentName?: string;
}) {
  const preview = orderedProducts(look).slice(0, 5);
  return (
    <div className="relative">
    <Link
      to="/portofino/$day/$look"
      params={{ day: look.moment, look: look.slug }}
      className="group block bg-ivory border border-border/60 hover:border-gold transition-colors duration-300"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream/40">
        <img
          src={look.heroImage}
          alt={look.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </div>
      <div className="p-6 space-y-3">
        <h3 className="font-display text-2xl tracking-[0.04em] text-ink leading-tight">
          {look.title}
        </h3>
        <p className="font-serif italic text-[0.92rem] text-ink/70 leading-snug">
          {look.oneLiner}
        </p>
        <div className="flex gap-2 pt-1">
          {preview.map((p) => (
            <div
              key={p.url}
              className="relative w-10 h-10 bg-cream border border-border/40 flex items-center justify-center"
              aria-hidden="true"
            >
              {p.image ? (
                <img src={p.image} alt="" className="absolute inset-0 h-full w-full object-contain p-1" />
              ) : (
                <span className="text-[0.5rem] tracking-[0.2em] uppercase text-ink/40">—</span>
              )}
            </div>
          ))}
        </div>
        <div className="pt-3">
          <span className="eyebrow text-[0.62rem] tracking-[0.36em] text-ink group-hover:text-gold transition-colors">
            VIEW COMPLETE LOOK →
          </span>
        </div>
      </div>
    </Link>
      <div className="absolute top-3 right-3">
        <SaveLookButton
          variant="icon"
          tone="light"
          source="resort_edit_look_card"
          look={{
            id: `portofino/${look.moment}/${look.slug}`,
            destination: "Portofino",
            activity: momentName ?? look.moment,
            title: look.title,
            description: look.oneLiner,
            image: look.heroImage,
            url: `/portofino/${look.moment}/${look.slug}`,
          }}
        />
      </div>
    </div>
  );
}
