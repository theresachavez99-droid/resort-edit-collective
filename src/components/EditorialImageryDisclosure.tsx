export const EDITORIAL_IMAGERY_NOTE =
  "Editorial note — Imagery on this page is AI-generated unless specifically credited otherwise. It illustrates the Resort Edit point of view and is not documentary photography.";

export const NAMED_PLACE_DISCLOSURE =
  "AI-generated editorial visualization—not a photograph of the property or experience.";

export const LILLA_PRODUCT_DISCLOSURE =
  "AI-generated model image. View retailer photography for exact color, fit and details.";

export function EditorialImageryNote() {
  return (
    <aside className="border-b border-border/40 bg-ivory" aria-label="Editorial imagery note">
      <p className="mx-auto max-w-[1280px] px-6 py-3 text-center font-serif text-[0.72rem] leading-relaxed text-ink/55">
        {EDITORIAL_IMAGERY_NOTE}
      </p>
    </aside>
  );
}

export function EditorialImageBadge() {
  return (
    <span className="absolute bottom-2 left-2 z-10 rounded-sm border border-ivory/30 bg-ink/80 px-2 py-1 font-sans text-[0.56rem] tracking-[0.12em] text-ivory backdrop-blur-sm">
      AI-GENERATED · EDITORIAL
    </span>
  );
}

export function NamedPlaceDisclosure() {
  return <p className="mt-3 font-serif text-[0.7rem] leading-snug text-ink/45">{NAMED_PLACE_DISCLOSURE}</p>;
}

export function LillaProductDisclosure() {
  return <p className="font-serif text-[0.7rem] leading-snug text-ink/55">{LILLA_PRODUCT_DISCLOSURE}</p>;
}