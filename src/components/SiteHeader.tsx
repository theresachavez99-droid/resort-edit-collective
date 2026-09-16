import { Link } from "@tanstack/react-router";
import { Instagram, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import palmMark from "@/assets/resort-edit-mark.png";

const nav = [
  { to: "/portofino", label: "Portofino" },
  { to: "/destinations", label: "Destinations" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const navLinkClass =
  "text-ink hover:text-gold transition-colors whitespace-nowrap py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

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
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md border-b border-[#D9C9A8]/60"
      style={{ backgroundColor: "#F5EBDD" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-2 md:py-3 grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-10">
        {/* Mobile: hamburger left */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="md:hidden text-ink p-1 -ml-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {open ? (
            <X className="w-5 h-5" strokeWidth={1.5} />
          ) : (
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          )}
        </button>

        {/* Logo */}
        <Link
          to="/"
          aria-label="Resort Edit — home"
          className="flex items-center leading-none justify-center md:justify-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <img
            src={palmMark}
            alt="Resort Edit"
            className="h-[5.1rem] md:h-[6.2rem] lg:h-[7.1rem] w-auto select-none"
            draggable={false}
          />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center justify-end gap-5 lg:gap-7 flex-nowrap"
        >
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
          <a
            href="https://www.instagram.com/resort.edit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Resort Edit on Instagram"
            className="hidden md:inline-flex items-center text-ink/80 hover:text-gold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <Instagram style={instagramIconStyle} strokeWidth={1.5} />
          </a>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-navigation" className="md:hidden border-t border-border/60 bg-ivory">
          <nav aria-label="Primary" className="flex flex-col px-6 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`${navLinkClass} py-3 border-b border-border/40 last:border-0`}
                style={navLinkStyle}
                activeProps={{
                  className: `${navLinkClass} text-gold py-3 border-b border-border/40 last:border-0`,
                }}
                activeOptions={{ exact: false }}
              >
                {n.label}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/resort.edit"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
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
