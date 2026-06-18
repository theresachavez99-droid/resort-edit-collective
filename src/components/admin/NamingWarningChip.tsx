import { useMemo } from "react";
import { classifyName, type DoctrineContext, type NamingClass } from "@/lib/naming-doctrine";

/**
 * Advisory chip used in admin surfaces. Never blocks publishing; just
 * surfaces the verdict so editors can make a call.
 */
export function NamingWarningChip({
  title,
  context,
  size = "sm",
}: {
  title: string | null | undefined;
  context?: DoctrineContext;
  size?: "sm" | "xs";
}) {
  const verdict = useMemo(() => classifyName(title, context), [title, context]);

  const palette: Record<NamingClass, { label: string; cls: string }> = {
    destination_moment: {
      label: "Destination Moment ✓",
      cls: "border-emerald-700 bg-emerald-50 text-emerald-900",
    },
    editorial_commerce: {
      label: "Editorial Commerce ✓",
      cls: "border-blue-700 bg-blue-50 text-blue-900",
    },
    generic: {
      label: "Generic — flag",
      cls: "border-amber-700 bg-amber-50 text-amber-900",
    },
    unknown: {
      label: "Naming · review",
      cls: "border-ink/30 bg-ivory text-ink/70",
    },
  };

  const p = palette[verdict.class];
  const sizeCls = size === "xs"
    ? "text-[0.55rem] px-1.5 py-0.5"
    : "text-[0.6rem] px-2 py-0.5";

  const tooltip = verdict.suggestion
    ? `${verdict.reason}\n\nSuggestion: ${verdict.suggestion}`
    : verdict.reason;

  return (
    <span
      title={tooltip}
      className={`inline-flex items-center border tracking-[0.18em] uppercase ${sizeCls} ${p.cls}`}
    >
      {p.label}
    </span>
  );
}
