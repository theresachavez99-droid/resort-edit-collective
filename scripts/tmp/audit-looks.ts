import { auditLillaLooks } from "../../src/lib/lilla-look-audit";
for (const a of auditLillaLooks()) {
  console.log(`${a.complete ? "OK  " : "MISS"} ${a.lookKey} | ${a.title} | missing: ${a.missing.join(", ") || "-"}`);
}
