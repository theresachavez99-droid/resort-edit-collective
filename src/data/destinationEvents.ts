/**
 * Destination-keyed dated events for the "While You're Here" block.
 *
 * Rules:
 *  - Only verified announcements from an OFFICIAL source (the comune, the
 *    operator, or the venue itself). Never a guess, never "annual, so probably".
 *  - `endDate` drives auto-expiry: a past event never renders as upcoming.
 *  - `sourceUrl` + `checkedOn` are mandatory so any entry can be re-verified.
 *  - When nothing is confirmed for a destination, the array is simply empty and
 *    the component renders nothing.
 *
 * Status 2026-09-06: no future-dated Portofino events are announced on an
 * official source — the published comune / Portofino Days calendars cover
 * summer 2026, which is now past. So this list is intentionally empty.
 */

export type DestinationEvent = {
  key: string;
  destinationSlug: string;
  name: string;
  /** ISO date (YYYY-MM-DD). */
  startDate: string;
  /** ISO date (YYYY-MM-DD); same as startDate for single-day events. */
  endDate: string;
  where: string;
  note: string;
  /** Official announcement page. */
  sourceUrl: string;
  /** ISO date this entry was last verified against the source. */
  checkedOn: string;
};

export const DESTINATION_EVENTS: readonly DestinationEvent[] = [];

export function upcomingEvents(destinationSlug: string, now: Date = new Date()): DestinationEvent[] {
  const today = now.toISOString().slice(0, 10);
  return DESTINATION_EVENTS.filter((e) => e.destinationSlug === destinationSlug && e.endDate >= today).sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
}

export function formatEventDates(e: DestinationEvent): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return e.startDate === e.endDate ? fmt(e.startDate) : `${fmt(e.startDate)} — ${fmt(e.endDate)}`;
}
