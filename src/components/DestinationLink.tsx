import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { Destination } from "@/data/destinations";

type Props = {
  d: Destination;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

/** Type-safe link to a destination — uses bespoke route when d.href is set,
 * otherwise routes to /destinations/$slug. */
export function DestinationLink({ d, className, children, ...rest }: Props) {
  if (d.href) {
    return (
      <Link to={d.href} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <Link
      to="/destinations/$slug"
      params={{ slug: d.slug }}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}