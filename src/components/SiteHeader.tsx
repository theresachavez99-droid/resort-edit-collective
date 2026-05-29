import { Link } from "@tanstack/react-router";
import { Instagram, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/resort-edit-logo.png";

const nav = [
  { to: "/destinations", label: "Destinations" },
  { to: "/resort-edits", label: "Resort Edits" },
  { to: "/brands", label: "Brands We Love" },
] as const;

const mobileExtras = [
  { to: "/about", label: "About" },
] as const;

const navLinkClass =
  "text-[0.72rem] uppercase tracking-[0.18em] font-medium text-ink hover:text-gold transition-colors whitespace-nowrap py-2";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-6">
        {/* Mobile: hamburger left */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="md:hidden text-ink p-1 -ml-1"
        >
          {open ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center leading-none justify-center md:justify-start -my-2"
        >
          <img
            src={logo}
            alt="Resort Edit — Curated escapes. Styled your way."
            className="h-28 md:h-32 lg:h-36 w-auto contrast-[1.05]"
          />
        </Link>

        {/* Desktop nav (centered between logo and CTA) */}
        <nav className="hidden md:flex items-center justify-end gap-5 lg:gap-7 flex-nowrap">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={navLinkClass}
              activeProps={{ className: `${navLinkClass} text-gold` }}
              activeOptions={{ exact: false }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-4 md:gap-6 justify-end">
          <a
            href="#newsletter"
            className="text-[0.68rem] uppercase tracking-[0.18em] font-medium text-ivory bg-ink rounded-md px-3 py-2 md:px-3.5 md:py-2 hover:bg-gold transition-colors whitespace-nowrap"
          >
            Join the Edit
          </a>
          <a
            href="https://www.instagram.com/resort.edit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resort Edit on Instagram"
            className="hidden md:inline-flex items-center text-ink/80 hover:text-gold transition-colors"
          >
            <Instagram className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </a>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/60 bg-ivory">
          <nav className="flex flex-col px-6 py-4">
            {[...nav, ...mobileExtras].map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`${navLinkClass} py-3 border-b border-border/40 last:border-0`}
                activeProps={{ className: `${navLinkClass} text-gold py-3 border-b border-border/40 last:border-0` }}
                activeOptions={{ exact: false }}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/resort.edit"
              target="_blank"
              rel="noopener noreferrer"
              className={`${navLinkClass} py-3 inline-flex items-center gap-2`}
            >
              <Instagram className="w-4 h-4" strokeWidth={1.5} /> Instagram
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}