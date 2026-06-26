import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import logo from "@/assets/resort-edit-logo-ivory.png";
import { NewsletterForm } from "@/components/NewsletterForm";

export function SiteFooter() {
  return (
    <footer id="newsletter" className="bg-ink text-ivory mt-32">
      <div className="mx-auto max-w-5xl px-6 pt-9 md:pt-12 pb-9 md:pb-11 text-center flex flex-col items-center">
        <div className="relative inline-block mb-2">
          <img
            src={logo}
            alt="Resort Edit™"
            loading="lazy"
            width={1024}
            height={1024}
            className="w-[320px] max-w-full h-auto select-none"
          />
          <span
            aria-hidden="true"
            className="absolute text-ivory/80 font-sans font-light pointer-events-none"
            style={{ top: "32%", right: "-0.65rem", fontSize: "0.7rem", letterSpacing: "0.05em" }}
          >
            ™
          </span>
        </div>
        <h2 className="mt-6 font-display text-3xl md:text-5xl tracking-wide text-ivory">
          Join Resort Edit
        </h2>
        <p className="mt-3 text-ivory/85 max-w-xl font-serif text-lg md:text-xl italic">
          Receive new destination edits, hotel discoveries, and curated packing inspiration.
        </p>
        <NewsletterForm ctaSource="footer" variant="footer" />
        <a
          href="https://www.instagram.com/resort.edit"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-3 eyebrow text-ivory hover:text-gold transition-colors"
        >
          <Instagram className="w-5 h-5" strokeWidth={1.5} />
          <span>Instagram: @resort.edit</span>
        </a>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-3 gap-8 text-ivory/70 text-sm">
          <div>
            <p className="eyebrow text-gold-soft mb-4">Explore</p>
            <ul className="space-y-2 font-serif">
              <li><Link to="/destinations" className="hover:text-gold">Destinations</Link></li>
              <li><Link to="/resort-edits" className="hover:text-gold">Resort Edits</Link></li>
              <li><Link to="/brands" className="hover:text-gold">Brands We Love</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-gold-soft mb-4">About</p>
            <ul className="space-y-2 font-serif">
              <li><Link to="/about" className="hover:text-gold">Our Story</Link></li>
              <li><Link to="/about" className="hover:text-gold">Contact</Link></li>
              <li><Link to="/about" className="hover:text-gold">Collaborate</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-gold-soft mb-4">Legal</p>
            <ul className="space-y-2 font-serif">
              <li><Link to="/about" className="hover:text-gold">Affiliate Disclosure</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ivory/10">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-ivory/50 text-xs tracking-widest uppercase">
            <span>© {new Date().getFullYear()} Resort Edit</span>
            <span className="tracking-[0.3em]">Dressed for the Destination™</span>
          </div>
        </div>
      </div>
    </footer>
  );
}