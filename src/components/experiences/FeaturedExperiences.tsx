import { CommissionNotice } from "@/components/CommissionNotice";
import { Link } from "@tanstack/react-router";
import { featuredExperiences } from "@/data/destinationExperiences";
import { ExperienceCard } from "./ExperienceCard";

/**
 * Small featured selection for the homepage, tagged by destination.
 * The full collection lives on the destination page (/portofino#experiences).
 */
export function FeaturedExperiences({ wrap }: { wrap: string }) {
  const experiences = featuredExperiences(undefined, 3);
  if (experiences.length === 0) return null;

  return (
    <section className={`${wrap} mt-12 md:mt-16`} aria-labelledby="featured-experiences-heading">
      <div className="flex items-center gap-4 justify-center mb-3">
        <div className="h-px w-12 bg-gold/50" />
        <h2
          id="featured-experiences-heading"
          className="font-display text-2xl sm:text-3xl tracking-[0.18em] text-ink"
        >
          EXPERIENCES WE'D BOOK
        </h2>
        <div className="h-px w-12 bg-gold/50" />
      </div>
      <p className="mb-7 text-center font-serif italic text-[0.95rem] sm:text-base text-ink/65 max-w-2xl mx-auto">
        A few we'd plan a day around — with the look to wear for each.
      </p>

      <CommissionNotice variant="booking" className="mb-5 text-center max-w-2xl mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {experiences.map((e) => (
          <ExperienceCard key={e.key} experience={e} placement="home-featured" showDestination />
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          to="/portofino"
          hash="experiences"
          className="inline-flex eyebrow text-[0.72rem] tracking-[0.3em] text-gold border-b border-gold/50 pb-1 hover:text-ink hover:border-ink transition-colors"
        >
          SEE ALL PORTOFINO EXPERIENCES →
        </Link>
      </div>
    </section>
  );
}
