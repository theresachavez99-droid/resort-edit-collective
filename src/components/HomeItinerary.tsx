import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  listPortofinoMomentsForLanding,
  type PortofinoMomentCard as PortofinoMomentCardData,
} from "@/lib/portofino-moments.functions";
import { PortofinoMomentCard } from "@/components/PortofinoMomentCard";

export const portofinoMomentsQuery = queryOptions({
  queryKey: ["portofino-moments-landing"],
  queryFn: () => listPortofinoMomentsForLanding(),
});

/**
 * Homepage Portofino Itinerary — renders the same canonical six moments
 * as `/portofino`, using the shared `PortofinoMomentCard`. There is no
 * separate homepage card system; image/title/copy/CTA/slug/order all
 * derive from the single source of truth.
 */
export function HomeItinerary() {
  const { data } = useSuspenseQuery(portofinoMomentsQuery);
  const moments: PortofinoMomentCardData[] = data.ok ? data.moments : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {moments.map((m) => (
        <PortofinoMomentCard key={m.moment_slug} m={m} />
      ))}
    </div>
  );
}