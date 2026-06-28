import * as React from "react";

/**
 * Focal coordinates in percentages (0-100) used as CSS object-position values.
 * Each breakpoint is optional; missing values inherit from the previous (smaller) breakpoint.
 *
 * Origin: top-left of the source image.
 * x: 0 = left edge, 100 = right edge
 * y: 0 = top edge, 100 = bottom edge
 *
 * Use these to protect the most important subject (face, hat, hero product) at any
 * container aspect ratio, instead of relying on default centered cropping.
 */
export type FocalPoint = { x: number; y: number };

export type ResponsiveFocal = {
  base: FocalPoint;
  sm?: FocalPoint;
  md?: FocalPoint;
  lg?: FocalPoint;
  xl?: FocalPoint;
  "2xl"?: FocalPoint;
};

type Props = {
  src: string;
  alt: string;
  focal: ResponsiveFocal;
  /** Tailwind height classes, e.g. "h-[42vh] md:h-[55vh] lg:h-[60vh] min-h-[360px] max-h-[640px]" */
  heightClassName?: string;
  width?: number;
  imgHeight?: number;
  priority?: boolean;
  overlay?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

function pos(p?: FocalPoint) {
  return p ? `${p.x}% ${p.y}%` : undefined;
}

/**
 * EditorialHero — reusable focal-point banner for editorial pages.
 *
 * Why this exists: hero images on resort/editorial pages always have a "protected
 * subject" (face, hat, harbor) that must remain visible across breakpoints.
 * `object-cover` + a single object-position is not enough because the container's
 * aspect ratio shifts dramatically between mobile and large desktop. This component
 * applies a different focal point per breakpoint via inline CSS variables, so each
 * page declares the composition intent in one place.
 */
export function EditorialHero({
  src,
  alt,
  focal,
  heightClassName = "h-[42vh] md:h-[55vh] lg:h-[60vh] min-h-[360px] max-h-[640px]",
  width = 1920,
  imgHeight = 800,
  priority,
  overlay,
  className,
  children,
}: Props) {
  const style = {
    ["--focal-base" as string]: pos(focal.base)!,
    ["--focal-sm" as string]: pos(focal.sm) ?? pos(focal.base)!,
    ["--focal-md" as string]: pos(focal.md) ?? pos(focal.sm) ?? pos(focal.base)!,
    ["--focal-lg" as string]:
      pos(focal.lg) ?? pos(focal.md) ?? pos(focal.sm) ?? pos(focal.base)!,
    ["--focal-xl" as string]:
      pos(focal.xl) ?? pos(focal.lg) ?? pos(focal.md) ?? pos(focal.sm) ?? pos(focal.base)!,
    ["--focal-2xl" as string]:
      pos(focal["2xl"]) ?? pos(focal.xl) ?? pos(focal.lg) ?? pos(focal.md) ?? pos(focal.sm) ?? pos(focal.base)!,
  } as React.CSSProperties;

  return (
    <section
      className={"relative editorial-hero " + heightClassName + " " + (className ?? "")}
      style={style}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={imgHeight}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover editorial-hero__img"
      />
      {overlay}
      {children}
    </section>
  );
}

export default EditorialHero;