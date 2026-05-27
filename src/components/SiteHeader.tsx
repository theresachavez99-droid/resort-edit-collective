import { Link } from "@tanstack/react-router";

const nav = [
  { to: "/", label: "Journal" },
  { to: "/destinations", label: "Destinations" },
  { to: "/portofino", label: "Portofino Edit" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ivory/85 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between gap-6">
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-display text-2xl md:text-[28px] tracking-[0.25em] text-ink">RESORT EDIT</span>
          <span className="hidden md:block eyebrow text-gold mt-1">Curated Escapes</span>
        </Link>
        <nav className="hidden md:flex items-center gap-10">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="eyebrow text-ink/70 hover:text-gold transition-colors"
              activeProps={{ className: "eyebrow text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <a
          href="#newsletter"
          className="hidden md:inline-block eyebrow text-ivory bg-ink px-5 py-3 hover:bg-gold transition-colors"
        >
          Subscribe
        </a>
      </div>
    </header>
  );
}