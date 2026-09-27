import { Link } from "@tanstack/react-router";

/**
 * Plain-language commission disclosure.
 *
 * Placed ABOVE any shopping or booking links so a reader sees it before
 * clicking, not only in the footer. Wording stays truthful about the current
 * absence of commission-bearing links and never claims a partnership we do
 * not have.
 */
export function CommissionNotice({
  variant = "shop",
  className = "",
}: {
  /** "shop" = retailer product links. "booking" = experience/hotel links. */
  variant?: "shop" | "booking";
  className?: string;
}) {
  const body =
    variant === "shop"
      ? "Shopping links currently displayed are ordinary retailer links and earn Resort Edit no commission. Prices and stock are set by the retailer and can change."
      : "Booking and enquiry links open the listed operator or booking platform. The links currently displayed earn Resort Edit no commission.";

  return (
    <p
      className={`text-[0.72rem] leading-relaxed text-ink/60 font-sans tracking-wide ${className}`}
    >
      {body}{" "}
      <Link
        to="/affiliate-disclosure"
        className="underline decoration-ink/30 hover:decoration-ink/60 hover:text-ink/80 transition-colors"
      >
        How this works
      </Link>
    </p>
  );
}
