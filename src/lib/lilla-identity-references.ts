/**
 * Canonical Lilla identity references.
 *
 * These are PRIVATE production references used as the identity input for every
 * Lilla image generation or edit. They are never rendered as site content.
 *
 * Rules (project knowledge — Lilla identity lock):
 * - Every generated/regenerated image containing Lilla MUST pass at least one
 *   of these assets to the image tool as an explicit identity reference.
 * - Identity takes priority over styling and pose. No lookalike substitutions,
 *   no age shift, no "generic influencer" beautification.
 * - Design mockups, marketing composites, or previously generated look images
 *   are NOT valid identity references.
 */
import masterReferenceV1 from "@/assets/uploads/lilla/lilla-master-reference-v1.png.asset.json";
import headshotPrimary from "@/assets/uploads/cira/cira-1.png.asset.json";

export type LillaIdentityReference = {
  /** Stable id used in generation logs and audit records. */
  id: string;
  /** CDN URL of the private reference asset. */
  url: string;
  /** Repo path of the pointer file, for tooling. */
  pointer: string;
  /** Why this reference exists / what it locks. */
  note: string;
  /** The primary sheet used first for any new generation. */
  primary?: boolean;
};

export const LILLA_IDENTITY_REFERENCES: readonly LillaIdentityReference[] = [
  {
    id: "lilla-master-reference-v1",
    url: masterReferenceV1.url,
    pointer: "src/assets/uploads/lilla/lilla-master-reference-v1.png.asset.json",
    note:
      "Founder-supplied Lilla Master Reference v1 — 16-angle identity lock sheet (face, profiles, chin up/down, full body, hair up/down).",
    primary: true,
  },
  {
    id: "lilla-headshot-1",
    url: headshotPrimary.url,
    pointer: "src/assets/uploads/cira/cira-1.png.asset.json",
    note: "Approved single canonical headshot, retained as a secondary identity reference.",
  },
];

/** The reference to pass first to any Lilla image generation or edit. */
export const PRIMARY_LILLA_IDENTITY_REFERENCE =
  LILLA_IDENTITY_REFERENCES.find((reference) => reference.primary) ??
  LILLA_IDENTITY_REFERENCES[0];

/** Identity references are production inputs only — never published as content. */
export const LILLA_IDENTITY_REFERENCES_ARE_PUBLIC = false;
