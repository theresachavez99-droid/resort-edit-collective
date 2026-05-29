import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="newsletter" className="bg-ink text-ivory mt-20">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-ivory/70 text-sm">
        <div>
          <p className="eyebrow text-gold-soft mb-3">Explore</p>
          <ul className="space-y-2 font-serif">
            <li><Link to="/destinations" className="hover:text-gold">Destinations</Link></li>
            <li><Link to="/resort-edits" className="hover:text-gold">Resort Edits</Link></li>
            <li><Link to="/brands" className="hover:text-gold">Brands We Love</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-soft mb-3">About</p>
          <ul className="space-y-2 font-serif">
            <li><Link to="/about" className="hover:text-gold">Our Story</Link></li>
            <li><Link to="/about" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/about" className="hover:text-gold">Collaborations</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow text-gold-soft mb-3">Follow</p>
          <a
            href="https://www.instagram.com/resort.edit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-serif text-ivory/80 hover:text-gold transition-colors"
          >
            <Instagram className="w-[16px] h-[16px]" strokeWidth={1.5} />
            <span>@resort.edit</span>
          </a>
        </div>
        <div>
          <EditorialDisclosure tone="dark" className="my-0 max-w-none" />
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-ivory/50 text-xs tracking-widest uppercase">
          <span>© {new Date().getFullYear()} Resort Edit</span>
          <span className="italic font-serif normal-case tracking-normal text-sm">Curated escapes. Styled your way.</span>
        </div>
      </div>
    </footer>
  );
}