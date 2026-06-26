import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { PortofinoMomentCard as PortofinoMomentCardData } from "@/lib/portofino-moments.functions";

/**
 * Canonical card for a Portofino moment. Single source of truth for the
 * homepage itinerary AND the /portofino Six Moments grid. Do NOT fork.
 */
export function PortofinoMomentCard({ m }: { m: PortofinoMomentCardData }) {
  return (
    <Link
      to="/portofino/$moment"
      params={{ moment: m.moment_slug }}
      className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-cream/40">
        <img
          src={m.moment_card_image}
          alt={`${m.moment_name} — Portofino`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          style={
            m.moment_slug === "sunset-views" ||
            m.moment_slug === "harbor-aperitivo" ||
            m.moment_slug === "arrival" ||
            m.moment_slug === "riviera-dinner"
              ? { objectPosition: "center top" }
              : undefined
          }
        />
        <span className="absolute top-3 left-3 eyebrow tracking-[0.3em] text-[0.55rem] bg-ivory/95 text-ink px-2 py-1">
          {m.archetype_slug.replace(/-/g, " ").toUpperCase()}
        </span>
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3 className="font-display text-xl md:text-2xl tracking-[0.04em] text-ink leading-tight">
          {m.moment_name}
        </h3>
        <p className="font-serif italic text-ink/70 text-[0.92rem] mt-2 leading-relaxed flex-1">
          {m.narrative}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 eyebrow text-[0.62rem] tracking-[0.3em] text-gold group-hover:text-ink border-b border-gold/60 group-hover:border-ink pb-1 self-start">
          View Moment <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}