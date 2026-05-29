import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import logo from "@/assets/resort-edit-logo.png";

const nav = [
  { to: "/", label: "Journal" },
  { to: "/destinations", label: "Destinations" },
  { to: "/portofino", label: "Resort Edits" },
  { to: "/brands", label: "Brands We Love" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-ivory/85 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center leading-none">
          <img
            src={logo}
            alt="Resort Edit — Curated escapes. Styled your way."
            className="h-20 md:h-24 w-auto"
          />
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
        <div className="hidden md:flex items-center gap-5">
          <a
            href="https://www.instagram.com/resort.edit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resort Edit on Instagram"
            className="text-ink/70 hover:text-gold transition-colors"
          >
            <Instagram className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </a>
          <a
            href="#newsletter"
            className="eyebrow text-ivory bg-ink px-5 py-3 hover:bg-gold transition-colors"
          >
            Subscribe
          </a>
        </div>
      </div>
    </header>
  );
}