/**
 * Canonical Lilla identity references.
 *
 * These are PRIVATE production references used as the identity input for every
 * Lilla image generation or edit. They are never rendered as site content.
 *
 * Rules (project knowledge — Lilla identity lock):
 * - Every generated/regenerated image containing Lilla MUST pass the CONTROLLING
 *   reference file below to the image tool as an actual image input, so the
 *   generation consumes its pixels. A text description of her face is NOT a
 *   substitute and never counts as an identity reference.
 * - Identity takes priority over styling and pose. No lookalike substitutions,
 *   no age shift, no "generic influencer" beautification, no blending of
 *   retired references.
 * - Every output must be visually compared against the controlling reference
 *   before acceptance. A prompt, a registry flag, a passing build or any
 *   automated score proves nothing on its own.
 */
import approvedIdentitySep1 from "@/assets/uploads/lilla/lilla-approved-identity-sep1-2026.png.asset.json";

export type LillaIdentityReference = {
  /** Stable id used in generation logs and audit records. */
  id: string;
  /** CDN URL of the private reference asset. */
  url: string;
  /** Repo path of the pointer file, for tooling. */
  pointer: string;
  /** Source path to hand to the image tool as an actual image input. */
  sourcePath: string;
  /** Why this reference exists / what it locks. */
  note: string;
};

/**
 * The ONLY reference approved for new Lilla generations and edits
 * (founder correction, 6 September 2026).
 */
export const CONTROLLING_LILLA_IDENTITY_REFERENCE: LillaIdentityReference = {
  id: "lilla-approved-identity-sep1-2026",
  url: approvedIdentitySep1.url,
  pointer: "src/assets/uploads/lilla/lilla-approved-identity-sep1-2026.png.asset.json",
  sourcePath: "/mnt/user-uploads/lilla-approved-identity-sep1-2026.png",
  note:
    "Founder-supplied 1 September 2026 photograph (teal cutout maxi, Portofino lane). Controlling facial identity and apparent-age reference for all Portofino looks. Overrides every older sheet and every text age description.",
};

/**
 * Retired references. Do NOT pass these to any generation, and do not blend
 * them with the controlling reference above.
 */
export const RETIRED_LILLA_IDENTITY_REFERENCES: readonly {
  id: string;
  reason: string;
}[] = [
  {
    id: "lilla-master-reference-v1",
    reason:
      "June/July master sheet. Retired 6 September 2026 — must not be used as the controlling reference or blended with it.",
  },
  {
    id: "cira-1",
    reason:
      "Earlier single headshot. Superseded by the 1 September 2026 photograph; produced facial/age drift.",
  },
];

/**
 * Images the founder has explicitly rejected. These must never be published,
 * reused, or repaired by swapping only the face.
 */
export const REJECTED_LILLA_IMAGES: readonly { file: string; reason: string }[] = [
  {
    file: "arrival-butter-full-body.png / arrival-lilla-butter-light-v2.png",
    reason: "Rejected 6 September 2026 — face is not Lilla. Not to be published.",
  },
  {
    file: "arrival-lilla-blue-lagoon-stripe.png",
    reason:
      "Rejected — both the facial identity and the blue-and-white striped square-neck midi look. The outfit may not be retained by changing the face alone.",
  },
];

/** Identity references are production inputs only — never published as content. */
export const LILLA_IDENTITY_REFERENCES_ARE_PUBLIC = false;
