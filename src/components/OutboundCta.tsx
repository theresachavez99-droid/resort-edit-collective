import {
  outboundCtaLabel,
  outboundHref,
  outboundIsSponsored,
  outboundLink,
} from "@/data/outboundLinks";
import { recordOutboundClick, type OUTBOUND_PLACEMENTS } from "@/lib/outbound-clicks.functions";

type Placement = (typeof OUTBOUND_PLACEMENTS)[number];

type Props = {
  linkKey: string;
  placement: Placement;
  className?: string;
  /** Override the registry CTA wording only when the label must read differently. */
  label?: string;
};

/**
 * The ONE way a public outbound link is rendered.
 *
 * - href comes from the registry (verified affiliate URL first, else direct)
 * - renders nothing at all when there is no valid https destination
 * - `rel="sponsored"` only when a real affiliate URL is in use
 * - fires an aggregate, anonymous click count (best-effort, never blocks)
 */
export function OutboundCta({ linkKey, placement, className = "", label }: Props) {
  const href = outboundHref(linkKey);
  const link = outboundLink(linkKey);
  if (!href || !link) return null;

  const text = label ?? outboundCtaLabel(linkKey) ?? "Visit site";
  const sponsored = outboundIsSponsored(linkKey);

  return (
    <a
      href={href}
      target="_blank"
      rel={sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer"}
      data-outbound-key={linkKey}
      data-outbound-placement={placement}
      onClick={() => {
        void recordOutboundClick({ data: { linkKey, placement } }).catch(() => {});
      }}
      className={
        className ||
        "self-start eyebrow text-[0.6rem] tracking-[0.3em] text-ink border-b border-ink/30 pb-1 hover:text-gold hover:border-gold transition-colors"
      }
    >
      {text} →
    </a>
  );
}
