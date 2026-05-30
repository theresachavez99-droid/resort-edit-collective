import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/resort-edit-logo.png";

export function SiteFooter() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <footer id="newsletter" className="bg-ink text-ivory mt-32">
      <div className="mx-auto max-w-5xl px-6 pt-10 md:pt-14 pb-9 md:pb-11 text-center flex flex-col items-center">
        <img
          src={logo}
          alt="Resort Edit"
          loading="lazy"
          width={1024}
          height={1024}
          style={{ mixBlendMode: "screen" }}
          className="h-72 md:h-[22rem] w-auto -my-12 md:-my-16 select-none"
        />
        <h2 className="mt-2 font-display text-3xl md:text-5xl tracking-wide text-ivory">
          The Next Edit
        </h2>
        <p className="mt-3 text-ivory/85 max-w-xl font-serif text-lg md:text-xl italic">
          Destination style, itineraries, and shoppable escapes — delivered to your inbox.
        </p>
        {submitted ? (
          <p className="mt-7 font-serif italic text-lg text-gold max-w-md">
            You're on the list for the next edit.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mt-7 flex flex-col sm:flex-row gap-2 w-full max-w-xl"
          >
            <input
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 h-14 bg-transparent border border-ivory/30 px-5 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold"
            />
            <button className="eyebrow h-14 bg-gold text-ink px-10 hover:bg-ivory transition-colors whitespace-nowrap">
              Get the Next Edit →
            </button>
          </form>
        )}
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
        <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-ivory/70 text-sm">
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
            <p className="eyebrow text-gold-soft mb-4">The Edit</p>
            <ul className="space-y-2 font-serif">
              <li><a href="#newsletter" className="hover:text-gold">Join The Edit</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-gold-soft mb-4">Disclosure</p>
            <ul className="space-y-2 font-serif">
              <li><Link to="/about" className="hover:text-gold">Affiliate Disclosure</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ivory/10">
          <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-ivory/50 text-xs tracking-widest uppercase">
            <span>© {new Date().getFullYear()} Resort Edit</span>
            <span className="italic font-serif normal-case tracking-normal text-sm">Curated escapes. Styled your way.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}