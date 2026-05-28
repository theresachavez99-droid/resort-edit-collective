import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/resort-edit-logo.png";

export function SiteFooter() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <footer id="newsletter" className="bg-ink text-ivory mt-32">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <img
          src={logo}
          alt="Resort Edit — Curated escapes. Styled your way."
          loading="lazy"
          width={1024}
          height={1024}
          className="mx-auto h-40 md:h-52 w-auto invert brightness-0 contrast-200 opacity-0 hidden"
        />
        <div className="mx-auto bg-ivory inline-block px-12 py-10">
          <img
            src={logo}
            alt="Resort Edit"
            loading="lazy"
            width={1024}
            height={1024}
            className="mx-auto h-36 md:h-44 w-auto"
          />
        </div>
        <p className="mt-8 eyebrow text-gold-soft tracking-[0.4em]">The Next Edit</p>
        <p className="mt-4 text-ivory/70 max-w-xl mx-auto font-serif text-lg italic">
          Destination style, itineraries, and shoppable escapes—delivered to your inbox.
        </p>
        {submitted ? (
          <p className="mt-10 font-serif italic text-lg text-gold max-w-md mx-auto">
            You're on the list for the next edit.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address →"
              className="flex-1 bg-transparent border border-ivory/30 px-5 py-4 text-sm text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold"
            />
            <button className="eyebrow bg-gold text-ink px-6 py-4 hover:bg-ivory transition-colors whitespace-nowrap">
              Get the Next Edit →
            </button>
          </form>
        )}
        <div className="mt-12 flex flex-col items-center gap-3">
          <a
            href="https://www.instagram.com/resort.edit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 eyebrow text-ivory/80 hover:text-gold transition-colors"
          >
            <Instagram className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span>Instagram: @resort.edit</span>
          </a>
          <p className="text-ivory/50 font-serif italic text-sm max-w-md">
            Follow Resort Edit for destination edits, resort styling, and shoppable vacation looks.
          </p>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-ivory/50 text-xs tracking-widest uppercase">
          <span>© {new Date().getFullYear()} Resort Edit</span>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-gold">Journal</Link>
            <Link to="/destinations" className="hover:text-gold">Destinations</Link>
            <Link to="/brands" className="hover:text-gold">Brands</Link>
            <Link to="/about" className="hover:text-gold">About</Link>
          </div>
          <span className="italic font-serif normal-case tracking-normal text-sm">Curated escapes. Inspired by you.</span>
        </div>
      </div>
    </footer>
  );
}