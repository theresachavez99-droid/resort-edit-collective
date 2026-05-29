import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { destinations, destinationHref, type Destination } from "@/data/destinations";
import { DestinationLink } from "@/components/DestinationLink";

// Equirectangular projection into a 1000x500 viewbox.
function project(lat: number, lng: number) {
  const x = ((lng + 180) / 360) * 1000;
  const y = ((90 - lat) / 180) * 500;
  return { x, y };
}

/**
 * Minimal stylized world map: a soft sand-toned silhouette of the continents
 * drawn as a single SVG path, with destination pins layered on top.
 * Pins are full <Link>s for crawlability and keyboard nav.
 */
export function WorldMap() {
  const [active, setActive] = useState<Destination | null>(null);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 1000 500"
        role="img"
        aria-label="World map of Resort Edit destinations"
        className="w-full h-auto block"
      >
        {/* Subtle ocean wash */}
        <rect width="1000" height="500" fill="var(--cream)" />

        {/* Continent silhouettes — stylized blocks, not geographically exact */}
        <g fill="var(--gold-soft)" opacity="0.45">
          {/* North America */}
          <path d="M120,90 Q90,140 100,200 Q115,250 180,280 L260,260 L300,210 L290,170 L240,120 L190,85 Z" />
          {/* Central America */}
          <path d="M250,275 L290,290 L300,320 L270,310 Z" />
          {/* South America */}
          <path d="M300,310 L340,330 L355,400 L320,460 L295,440 L285,380 Z" />
          {/* Europe */}
          <path d="M470,130 Q455,170 480,200 L540,200 L560,170 L545,130 L505,115 Z" />
          {/* Africa */}
          <path d="M490,210 L560,210 L585,290 L560,380 L520,400 L490,360 L475,290 Z" />
          {/* Middle East / Arabia */}
          <path d="M580,225 L625,235 L620,275 L590,275 Z" />
          {/* Asia */}
          <path d="M580,120 Q620,160 700,170 L790,180 L820,220 L780,260 L700,270 L650,250 L600,210 L570,170 Z" />
          {/* Southeast Asia / Indonesia */}
          <path d="M740,290 L800,295 L820,320 L760,325 Z" />
          {/* Australia */}
          <path d="M790,360 L880,360 L890,410 L820,420 L780,395 Z" />
        </g>

        {/* Pins */}
        {destinations.map((d) => {
          const { x, y } = project(d.lat, d.lng);
          const isActive = active?.slug === d.slug;
          return (
            <g
              key={d.slug}
              transform={`translate(${x} ${y})`}
              onMouseEnter={() => setActive(d)}
              onMouseLeave={() => setActive((a) => (a?.slug === d.slug ? null : a))}
              onFocus={() => setActive(d)}
              onBlur={() => setActive((a) => (a?.slug === d.slug ? null : a))}
              className="cursor-pointer"
            >
              <DestinationLink d={d} aria-label={`${d.name} — ${d.region}`}>
                {/* halo */}
                <circle r={isActive ? 14 : 9} fill="var(--gold)" opacity={isActive ? 0.18 : 0.12} />
                {/* pin */}
                <circle
                  r={isActive ? 5.5 : 4}
                  fill="var(--gold)"
                  stroke="var(--ivory)"
                  strokeWidth={1.5}
                />
                {/* label */}
                <text
                  x={9}
                  y={4}
                  fontSize={11}
                  fill="var(--ink)"
                  fontFamily="var(--font-serif)"
                  fontStyle="italic"
                  opacity={isActive ? 1 : 0.85}
                >
                  {d.name}
                </text>
              </DestinationLink>
            </g>
          );
        })}
      </svg>

      {/* Active pin caption */}
      <div className="mt-4 min-h-[3.5rem] text-center px-6">
        {active ? (
          <DestinationLink d={active} className="inline-block group">
            <span className="eyebrow text-gold">{active.region}</span>
            <h3 className="font-display text-2xl md:text-3xl mt-1 tracking-wide text-ink group-hover:text-gold transition-colors">
              {active.name} →
            </h3>
            <p className="font-serif italic text-ink/70 mt-1">{active.tagline}</p>
          </DestinationLink>
        ) : (
          <p className="font-serif italic text-ink/50">
            Hover or tap a pin to preview a destination.
          </p>
        )}
      </div>
    </div>
  );
}

export { destinationHref };