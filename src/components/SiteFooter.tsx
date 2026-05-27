import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer id="newsletter" className="bg-ink text-ivory mt-32">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <span className="eyebrow text-gold-soft">The Newsletter</span>
        <h2 className="font-display text-4xl md:text-6xl mt-6 tracking-wide">
          Postcards from the Riviera
        </h2>
        <p className="mt-6 text-ivory/70 max-w-xl mx-auto font-serif text-lg italic">
          New itineraries, resort wardrobes and quiet addresses — delivered with our morning espresso.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            placeholder="Your email"
            className="flex-1 bg-transparent border border-ivory/30 px-5 py-4 eyebrow text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-gold"
          />
          <button className="eyebrow bg-gold text-ink px-6 py-4 hover:bg-ivory transition-colors">
            Subscribe
          </button>
        </form>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-ivory/50 text-xs tracking-widest uppercase">
          <span>© {new Date().getFullYear()} Resort Edit</span>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-gold">Journal</Link>
            <Link to="/destinations" className="hover:text-gold">Destinations</Link>
            <Link to="/about" className="hover:text-gold">About</Link>
          </div>
          <span className="italic font-serif normal-case tracking-normal text-sm">Curated escapes. Inspired by you.</span>
        </div>
      </div>
    </footer>
  );
}