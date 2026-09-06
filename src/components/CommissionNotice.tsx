import { Link } from "@tanstack/react-router";

/**
 * Plain-language commission disclosure.
 *
 * Placed ABOVE any shopping or booking links so a reader sees it before
 * clicking, not only in the footer. Wording stays truthful: some links may
 * earn a commission, none of them change what we choose to feature, and we
 * never claim a partnership we do not have.
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
      ? "Some links below may earn Resort Edit a commission if you buy, at no extra cost to you. Prices and stock are set by the retailer and can change."
      : "Booking and enquiry links open the listed operator or booking platform. The experience links currently displayed are not commission-bearing.";

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
