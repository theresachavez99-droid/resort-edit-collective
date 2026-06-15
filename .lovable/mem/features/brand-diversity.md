---
name: Brand diversity rule
description: Sourcing engine must maximize qualified brand diversity per destination; cap repetition; mix hero vs discovery brands
type: feature
---
Resort Edit is a luxury discovery platform, not a brand showcase. The sourcing engine maximizes qualified brand diversity across each destination and day.

**Objectives**
- Users discover new Resort Edit-approved brands across an edit.
- No single brand dominates a destination unless explicitly approved.
- Avoid sourcing multiple looks from the same brand when equally strong alternatives exist.
- Favor brand diversity while preserving destination fidelity and editorial quality.
- Track brand usage across a destination and apply diversity scoring during sourcing.

**Target mix per destination**
- ~30% Hero Brands (well-known luxury brands users recognize)
- ~70% Discovery Brands (emerging, niche, or lesser-known Resort Edit-approved brands)

**Hard rules for a 25-look destination**
- Limit most brands to 1–3 appearances across the destination.
- Flag overrepresentation before publishing (admin warning in vault/sourcing UI).
- Treat brand diversity as a scoring factor alongside destination fit, activity fit, luxury signal, and Resort Edit DNA.

**Success metric**
A user should finish a destination edit having discovered multiple new brands they want to explore, not seeing the same brands repeated throughout the experience.

**How to apply**
- When the AI sourcing pipeline ranks candidates, subtract a diversity penalty proportional to the brand's existing appearance count in the destination.
- When promoting from `sourced_products` → `vault_products`, surface a per-destination brand histogram so admins can spot overrepresentation.
- Tag each vault brand as `hero` or `discovery` to enforce the ~30/70 mix at publish time.