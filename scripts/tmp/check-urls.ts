import { recheckStock } from "../../src/lib/stock-evidence.server";
for (const u of process.argv.slice(2)) {
  try { const v = await recheckStock(u); console.log(v.availability, "|", v.provenance, "|", u, "|", v.detail ?? ""); }
  catch (e) { console.log("error", u, (e as Error).message); }
}
