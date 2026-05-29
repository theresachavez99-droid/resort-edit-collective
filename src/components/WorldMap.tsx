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
        viewBox="0 0 1000 460"
        role="img"
        aria-label="World map of Resort Edit destinations"
        className="w-full h-auto block max-h-[280px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Thin-line continent silhouettes — muted sand, stroke-only */}
        <g
          fill="none"
          stroke="var(--gold-soft)"
          strokeWidth={1}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.55}
        >
          <path d="M120,90 Q90,140 100,200 Q115,250 180,280 L260,260 L300,210 L290,170 L240,120 L190,85 Z" />
          <path d="M250,275 L290,290 L300,320 L270,310 Z" />
          <path d="M300,310 L340,330 L355,400 L320,460 L295,440 L285,380 Z" />
          <path d="M470,130 Q455,170 480,200 L540,200 L560,170 L545,130 L505,115 Z" />
          <path d="M490,210 L560,210 L585,290 L560,380 L520,400 L490,360 L475,290 Z" />
          <path d="M580,225 L625,235 L620,275 L590,275 Z" />
          <path d="M580,120 Q620,160 700,170 L790,180 L820,220 L780,260 L700,270 L650,250 L600,210 L570,170 Z" />
          <path d="M740,290 L800,295 L820,320 L760,325 Z" />
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
                <circle r={isActive ? 11 : 6} fill="var(--gold)" opacity={isActive ? 0.2 : 0.0} />
                {/* pin */}
                <circle
                  r={isActive ? 4 : 2.75}
                  fill="var(--gold)"
                  stroke="var(--ivory)"
                  strokeWidth={1}
                />
              </DestinationLink>
            </g>
          );
        })}
      </svg>

      {/* Subtle active pin caption — only appears on hover */}
      <div className="mt-1 h-10 text-center px-6 transition-opacity duration-300" aria-live="polite">
        {active ? (
          <DestinationLink d={active} className="inline-block group">
            <span className="font-display text-lg tracking-wide text-ink group-hover:text-gold transition-colors">
              {active.name}
            </span>
            <span className="font-serif italic text-ink/55 ml-2">— {active.region}</span>
          </DestinationLink>
        ) : null}
      </div>
    </div>
  );
}

export { destinationHref };