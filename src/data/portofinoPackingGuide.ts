/**
 * PORTOFINO PACKING GUIDE — the WEAR layer.
 *
 * Advice only. This is deliberately NOT a shop: no products, no brands, no
 * prices, no links, and no suggestion that anything pictured on Resort Edit
 * can be bought here. It answers "what should I actually pack?" for the
 * activities in this guide.
 */

export type PackingNote = {
  key: string;
  /** Short label, e.g. "Walking the village". */
  label: string;
  /** What to pack, in practical terms. */
  advice: string;
};

export const PORTOFINO_PACKING_GUIDE: readonly PackingNote[] = [
  {
    key: "shoes",
    label: "Shoes for uneven paving",
    advice:
      "Portofino is stone, slope and cobble from the harbour up to the church and the castle. Pack flat sandals or espadrilles with some grip, and something closed and comfortable for the coastal footpaths. Fine heels are a struggle on the paving, so save them for a table you can walk to slowly.",
  },
  {
    key: "sun",
    label: "Sun and daytime",
    advice:
      "Daytime is bright and largely shadeless on the water. A wide-brim hat, sunglasses, high-factor sunscreen and light, loosely woven cotton or linen do more for you than anything structured. Add a swimsuit and a cover-up you can wear straight to lunch if a beach club or boat day is in the plan.",
  },
  {
    key: "boat-evening",
    label: "Boats and evenings",
    advice:
      "It cools quickly once the sun drops and on the water at speed. A light knit, shirt or wrap in your bag covers both, and a wind-friendly hairstyle saves the boat trip back.",
  },
  {
    key: "dinner",
    label: "One refined dinner option",
    advice:
      "Clifftop and hotel dining rooms are smart but not black tie. One easy dress or elegant separates, simple jewellery and shoes you can still walk to the table in will cover every dinner in this guide.",
  },
];
