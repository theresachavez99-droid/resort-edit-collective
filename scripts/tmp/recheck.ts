import { recheckLookStock } from "../../src/lib/auto-edit-sitewide.server";
const keys = process.argv.slice(2);
for (const k of keys) {
  try { console.log(JSON.stringify(await recheckLookStock(k), null, 1)); }
  catch (e) { console.log(k, "ERROR", (e as Error).message); }
}
