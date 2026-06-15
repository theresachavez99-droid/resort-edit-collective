import { Link } from "@tanstack/react-router";
import { Instagram, Menu, X } from "lucide-react";
import { useState } from "react";
import palmMark from "@/assets/resort-edit-mark.png";
import { SavedCounter } from "@/components/SavedCounter";

const nav = [
  { to: "/destinations", label: "Destinations" },
  { to: "/resort-edits", label: "Resort Edits" },
  { to: "/brands", label: "Brands We Love" },
  { to: "/about", label: "About" },
] as const;

const mobileExtras = [] as const;

const navLinkClass =
  "text-ink hover:text-gold transition-colors whitespace-nowrap py-2";

const navLinkStyle = {
  fontSize: "16px",
  fontWeight: 500,
  letterSpacing: "0.12em",
  lineHeight: 1,
} as const;

const instagramIconStyle = {
  width: "22px",
  height: "22px",
} as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[#D9C9A8]/60" style={{ backgroundColor: "#F5EBDD" }}>
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 md:py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-10">
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
          aria-label="Resort Edit — home"
          className="flex items-center leading-none justify-center md:justify-start"
        >
          <img
            src={palmMark}
            alt="Resort Edit"
            className="h-8 md:h-10 lg:h-11 w-auto select-none"
            draggable={false}
          />
        </Link>

        {/* Desktop nav (centered between logo and CTA) */}
        <nav className="hidden md:flex items-center justify-end gap-5 lg:gap-7 flex-nowrap">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={navLinkClass}
              style={navLinkStyle}
              activeProps={{ className: `${navLinkClass} text-gold` }}
              activeOptions={{ exact: false }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-4 md:gap-6 justify-end">
          <SavedCounter />
          <a
            href="https://www.instagram.com/resort.edit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resort Edit on Instagram"
            className="hidden md:inline-flex items-center text-ink/80 hover:text-gold transition-colors"
          >
            <Instagram style={instagramIconStyle} strokeWidth={1.5} />
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
                style={navLinkStyle}
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
              style={navLinkStyle}
            >
              <Instagram style={instagramIconStyle} strokeWidth={1.5} /> Instagram
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}