import { CommissionNotice } from "@/components/CommissionNotice";
import { experiencesForDestination } from "@/data/destinationExperiences";
import { ExperienceCard } from "./ExperienceCard";

/** Full experience collection for one destination. Anchor target: #experiences. */
export function ExperienceCollection({ destinationSlug }: { destinationSlug: string }) {
  const experiences = experiencesForDestination(destinationSlug);
  if (experiences.length === 0) return null;

  return (
    <div id="experiences" className="scroll-mt-24">
      <div className="flex items-baseline justify-between mb-4 border-b border-ink/15 pb-2.5">
        <h3 className="font-display text-xl md:text-2xl tracking-[0.18em] text-ink">EXPERIENCES</h3>
        <span className="eyebrow text-[0.6rem] tracking-[0.3em] text-ink/50 hidden sm:inline">
          Verified with each operator
        </span>
      </div>
      <CommissionNotice variant="booking" className="mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {experiences.map((e) => (
          <ExperienceCard key={e.key} experience={e} placement={`${destinationSlug}-collection`} />
        ))}
      </div>
      <p className="mt-4 font-serif italic text-[0.82rem] text-ink/55 leading-relaxed max-w-3xl">
        Details above are taken from each operator or booking-platform listing and checked by hand. Availability and
        terms are set by the operator — some experiences are arranged by enquiry rather than instant
        booking.
      </p>
    </div>
  );
}
