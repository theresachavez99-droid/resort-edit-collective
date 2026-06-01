/**
 * Per-look editorial copy used by the View Full Look template.
 *
 * Keyed by `${daySlug}/${lookSlug}` (e.g. "day-1/look-a").
 * Edit these strings freely — they are the only source of truth for
 * the mood line and "Why we chose this look" paragraph rendered on
 * the editorial hero.
 *
 * Voice: Resort Edit personal stylist. Destination dressing. Editorial.
 * Avoid: "affordable", "quiet luxury", "shop now", influencer slang,
 *        generic ecommerce copy.
 */

export type LookEditorialCopy = {
  /** Single mood line — one sentence, evocative, location-true. */
  mood: string;
  /** 2–3 sentence editorial note on fabric, movement, fit, mood. */
  whyWeChose: string;
};

export const LOOK_EDITORIAL: Record<string, LookEditorialCopy> = {
  // ── Day 1 — Arrival ────────────────────────────────────────────
  "day-1/look-a": {
    mood: "Harbor light, printed silk, and the first Aperol of the trip.",
    whyWeChose:
      "A printed silk caftan reads instantly as Riviera — fluid on the boat, polished the moment you step into the piazzetta. We layered it over a sleek one-piece so the same look carries from the deck to a long lunch without a costume change. Gold at the ears keeps it grown-up; raffia underfoot keeps it on holiday.",
  },
  "day-1/look-b": {
    mood: "White linen, a soft tote, and a slow walk back from the harbor.",
    whyWeChose:
      "Linen that creases beautifully and a cream knit polo that doesn't argue with the light — this is the look for arriving well. The leather tote does the work of a carry-on without looking like one, and a single cuff is the only jewellery this much fabric needs.",
  },
  "day-1/look-c": {
    mood: "Crochet, raffia, and tonal cream against ochre walls.",
    whyWeChose:
      "Texture is the story here — handworked crochet, woven raffia, cream against cream. It rewards close looking, which is exactly the right energy for first-day wandering. Nothing shouts, everything photographs.",
  },

  // ── Day 2 — Beach Club & Cabanas ───────────────────────────────
  "day-2/look-a": {
    mood: "Lemon print on the lounger, espresso at the cabana bar.",
    whyWeChose:
      "The lemon-print kaftan is the Riviera in one garment — light enough for noon sun, structured enough to walk into a beach club restaurant. We anchored it with a solid swimsuit and let raffia and a knotted silk scarf do the finishing. Built for an unhurried day on the water.",
  },
  "day-2/look-b": {
    mood: "Ivory linen over swim, salt in your hair by 2pm.",
    whyWeChose:
      "An ivory shirtdress that throws on damp and still looks composed. The oat-toned swim underneath means lunch doesn't require a wardrobe change, and polished leather sandals lift the whole proposition out of beachwear. This is how to wear white at the water without overthinking it.",
  },
  "day-2/look-c": {
    mood: "Eyelet, raffia, and the long shadow of a wide-brim hat.",
    whyWeChose:
      "Eyelet that breathes, a raffia hat that earns its keep against the sun, and woven slides that take cobblestones in stride. The palette stays inside one tonal family — sand on cream — so the texture work reads as intentional rather than busy.",
  },

  // ── Day 3 — Day Club & Long Lunch ──────────────────────────────
  "day-3/look-a": {
    mood: "Mediterranean print, statement earrings, a table booked until sunset.",
    whyWeChose:
      "A bold print shirtdress for the day that earns it — a long lunch that turns into late afternoon spritzes. Sandals built for the walk back up the hill, earrings that catch the light across the table. Confident, season-appropriate, and not trying too hard.",
  },
  "day-3/look-b": {
    mood: "All white, gold sandals, the camel bag doing the talking.",
    whyWeChose:
      "A long ivory shirtdress is the most flattering shape we know in afternoon light. Gold sandals warm the white without breaking it, and the structured camel bag carries the whole look forward. Monochrome dressing done with grown-up restraint.",
  },
  "day-3/look-c": {
    mood: "Crochet midi, raffia mini, cream piled on cream.",
    whyWeChose:
      "Crochet midi for movement, woven slides for the walk, a raffia mini for the essentials and nothing more. The tonal cream palette lets the handwork register as the story. Effortless without looking accidental.",
  },

  // ── Day 4 — Sunset Dinner ──────────────────────────────────────
  "day-4/look-a": {
    mood: "Sunset print silk, a strappy heel, the harbor lit gold.",
    whyWeChose:
      "A sunset-print silk maxi that moves with you across the piazzetta and a strappy heel that takes the cobblestones seriously. A small jewelled clutch is the only ornament needed — the dress is already doing the work. Dressed for the hour the light turns.",
  },
  "day-4/look-b": {
    mood: "Ivory silk slip, one gold cuff, dinner on the terrace.",
    whyWeChose:
      "Silk that catches candlelight without competing with it. The chain bag adds a quiet bit of hardware; a single gold cuff is the entire jewellery edit. The whole proposition is restraint — the most expensive look in the room reads as the simplest.",
  },
  "day-4/look-c": {
    mood: "Textured black, satin column, sculpted clutch — all tone, all hand.",
    whyWeChose:
      "A textured halter against a satin column skirt — two different finishes of black that catch light in opposite ways. The sculpted woven clutch is the punctuation. Built for the second seating, when the candles are lit and the music gets softer.",
  },

  // ── Day 5 — Market Strolls & Coastal Goodbyes ──────────────────
  "day-5/look-a": {
    mood: "Riviera stripe, white shorts, a tote heavy with bread and stone fruit.",
    whyWeChose:
      "The blue Riviera stripe is the most reliable shorthand for the coast — paired with crisp white shorts and a woven tote, it's the easy uniform for the last morning. Sandals you can walk the market in, sunglasses you can push up without thinking. Going home dressed like you live here.",
  },
  "day-5/look-b": {
    mood: "Camel, cream, and a slow espresso before the train.",
    whyWeChose:
      "Camel linen and cream trousers travel beautifully and read polished even after a morning of market stops. The structured tan tote holds the day and the departure, and polished leather sandals keep the whole edit out of beachwear territory. Goodbye dressing done quietly.",
  },
  "day-5/look-c": {
    mood: "Crinkled linen, raffia, texture as the entire wardrobe.",
    whyWeChose:
      "A crinkled linen set that arrives at the airport looking better than it left the hotel. Raffia tote, woven slides — every surface is doing something interesting in the light. The kind of look that survives a flight and still photographs on the other end.",
  },
};

export function lookEditorialFor(
  daySlug: string,
  lookSlug: string,
): LookEditorialCopy | undefined {
  return LOOK_EDITORIAL[`${daySlug}/${lookSlug}`];
}