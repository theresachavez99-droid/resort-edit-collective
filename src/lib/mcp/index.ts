import { defineMcp } from "@lovable.dev/mcp-js";
import listDestinations from "./tools/list-destinations";
import listMoments from "./tools/list-moments";
import getMoment from "./tools/get-moment";
import listPublishedLooks from "./tools/list-published-looks";
import getPublishedLook from "./tools/get-published-look";
import listBrands from "./tools/list-brands";

export default defineMcp({
  name: "resort-edit-mcp",
  title: "Resort Edit — Editorial",
  version: "0.1.0",
  instructions:
    "Public, read-only access to Resort Edit's published editorial content. Use `list_destinations` and `list_moments` to browse the catalog, `get_moment` for a moment's editorial narrative and featured look, `list_published_looks`/`get_published_look` to inspect published founder looks, and `list_brands` to browse the approved brand registry. These tools return only published editorial output — no drafts, no admin data, no internal engine metadata.",
  tools: [
    listDestinations,
    listMoments,
    getMoment,
    listPublishedLooks,
    getPublishedLook,
    listBrands,
  ],
});